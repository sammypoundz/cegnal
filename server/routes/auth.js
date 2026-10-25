import { Router } from "express";
import bcrypt from "bcryptjs";
import prisma from "../prisma.js";
import { signToken, requireAuth } from "../auth.js";
import { sendOtpEmail, generateOtp, mailerConfigured } from "../mailer.js";

const router = Router();

function publicUser(user) {
  const { passwordHash: _omit, otpCode: _omitOtp, ...rest } = user;
  return rest;
}

async function issueOtp(user) {
  const code = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: code, otpExpiresAt: expires },
  });
  try {
    const result = await sendOtpEmail(user.email, code);
    // When the PHP endpoint is unreachable we still allow dev verification
    // via the server log so signup never hard-blocks.
    if (result === "failed") {
      console.log(`[mailer] fallback OTP for ${user.email}: ${code}`);
      return { delivered: false, devCode: code };
    }
    return { delivered: result === "sent", devCode: null };
  } catch (err) {
    console.error("[mailer] failed to send OTP:", err.message);
    return { delivered: false, devCode: null };
  }
}

// POST /api/auth/register — create a member account and email an OTP
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }
    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    const exists = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (exists) {
      return res
        .status(409)
        .json({ error: "An account with that email already exists" });
    }
    const user = await prisma.user.create({
      data: {
        name: String(name).trim(),
        email: String(email).toLowerCase(),
        passwordHash: await bcrypt.hash(String(password), 10),
        role: "member",
        username: `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      },
    });
    const otp = await issueOtp(user);
    res.status(201).json({
      user: publicUser(user),
      token: signToken(user),
      otp: {
        sent: otp.delivered,
        configured: mailerConfigured(),
        devCode: otp.devCode, // only present when SMTP is not configured
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", detail: err.message });
  }
});

// POST /api/auth/verify-otp — mark the account verified (requires token)
router.post("/verify-otp", requireAuth, async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "code is required" });
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.emailVerified) return res.json({ verified: true, user: publicUser(user) });
    const valid =
      user.otpCode === String(code).trim() &&
      user.otpExpiresAt &&
      user.otpExpiresAt > new Date();
    if (!valid) {
      return res
        .status(400)
        .json({ error: "Invalid or expired code. Request a new one." });
    }
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, otpCode: null, otpExpiresAt: null },
    });
    res.json({ verified: true, user: publicUser(updated) });
  } catch (err) {
    res.status(500).json({ error: "Verification failed", detail: err.message });
  }
});

// POST /api/auth/resend-otp — generate and email a fresh code
router.post("/resend-otp", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const otp = await issueOtp(user);
    res.json({ sent: otp.delivered, configured: mailerConfigured(), devCode: otp.devCode });
  } catch (err) {
    res.status(500).json({ error: "Could not resend code", detail: err.message });
  }
});

// POST /api/auth/forgot-password — email a reset OTP for an existing account
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "email is required" });
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    // Don't reveal whether the account exists — same response either way.
    if (!user) return res.json({ sent: true });
    const otp = await issueOtp(user);
    res.json({ sent: otp.delivered, devCode: otp.devCode });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Could not send reset code", detail: err.message });
  }
});

// POST /api/auth/reset-password — verify the reset OTP and set a new password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, password } = req.body || {};
    if (!email || !code || !password) {
      return res
        .status(400)
        .json({ error: "email, code and password are required" });
    }
    if (String(password).length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (!user) return res.status(404).json({ error: "Account not found" });
    const valid =
      user.otpCode === String(code).trim() &&
      user.otpExpiresAt &&
      user.otpExpiresAt > new Date();
    if (!valid) {
      return res
        .status(400)
        .json({ error: "Invalid or expired code. Request a new one." });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(String(password), 10),
        otpCode: null,
        otpExpiresAt: null,
        emailVerified: true, // they proved ownership of the inbox
      },
    });
    res.json({ ok: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Could not reset password", detail: err.message });
  }
});

// POST /api/auth/login — exchange credentials for a JWT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }
    const user = await prisma.user.findUnique({
      where: { email: String(email).toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    res.json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    res.status(500).json({ error: "Login failed", detail: err.message });
  }
});

// GET /api/auth/me — current profile (plan, subscription, payment history)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { subscription: { include: { plan: true } }, payments: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ user: publicUser(user) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load profile", detail: err.message });
  }
});

export default router;
