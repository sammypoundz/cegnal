import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Field,
  Input,
  PasswordInput,
  inputCls,
} from "../components/ui";
import { AppLogo } from "../components/shell";
import { CheckCircleIcon, ArrowLeftIcon } from "../components/icons";
import { useAuth } from "../lib/auth.jsx";
import { api } from "../lib/api.js";

function AuthShell({ title, subtitle, children }) {
  return (
    <div className="app-max app-page px-4 pb-10 pt-10">
      <Link
        to="/"
        className="mb-8 flex items-center justify-center"
        aria-label="Cegnal home"
      >
        <AppLogo height={92} />
      </Link>
      <h1 className="mb-1 text-center text-2xl font-extrabold text-ink">{title}</h1>
      <p className="mb-6 text-center text-[15px] text-muted">{subtitle}</p>
      {children}
    </div>
  );
}

export function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(f.get("email")))
      errs.email = "Enter a valid email address.";
    if (f.get("password").length < 6)
      errs.password = "Password must be at least 6 characters.";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await login(f.get("email"), f.get("password"));
      nav("/app");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Log in"
      subtitle="Welcome back. Enter your details to continue."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
          />
        </Field>
        <Field label="Password" error={errors.password}>
          <PasswordInput
            name="password"
            autoComplete="current-password"
            placeholder="••••"
            error={errors.password}
          />
        </Field>
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-semibold text-gold"
          >
            Forgot password?
          </Link>
        </div>
        <Button
          type="submit"
          variant="gold"
          className="w-full"
          loading={loading}
        >
          Log in
        </Button>
        {formError && (
          <p className="text-center text-sm font-medium text-danger">
            {formError}
          </p>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        New to Cegnal?{" "}
        <Link to="/register" className="font-semibold text-gold">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const nav = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errs = {};
    if (!f.get("name")) errs.name = "Enter your full name.";
    if (!/^\S+@\S+\.\S+$/.test(f.get("email")))
      errs.email = "Enter a valid email address.";
    if (f.get("password").length < 8)
      errs.password = "Use at least 8 characters.";
    if (f.get("password") !== f.get("confirm"))
      errs.confirm = "Passwords do not match.";
    if (!f.get("terms")) errs.terms = "Please accept the terms to continue.";
    setErrors(errs);
    setFormError("");
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      await signup(f.get("name"), f.get("email"), f.get("password"));
      nav("/verify-email");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start free — upgrade only if you want premium signals."
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" error={errors.name}>
          <Input
            name="name"
            autoComplete="name"
            placeholder="Ade Balogun"
            error={errors.name}
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email}
          />
        </Field>
        <Field
          label="Password"
          hint="At least 8 characters."
          error={errors.password}
        >
          <PasswordInput
            name="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password}
          />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <PasswordInput
            name="confirm"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirm}
          />
        </Field>
        <label className="flex items-start gap-2.5 text-sm text-muted">
          <input
            type="checkbox"
            name="terms"
            className="mt-0.5 h-5 w-5 rounded border-line accent-[#C99A2E]"
          />
          <span>
            I agree to the{" "}
            <Link to="/legal/terms" className="font-semibold text-gold">
              Terms
            </Link>{" "}
            and{" "}
            <Link to="/legal/privacy" className="font-semibold text-gold">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs font-medium text-danger">{errors.terms}</p>
        )}
        <Button
          type="submit"
          variant="gold"
          className="w-full"
          loading={loading}
        >
          Create account
        </Button>
        {formError && (
          <p className="text-center text-sm font-medium text-danger">
            {formError}
          </p>
        )}
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-gold">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

export function ForgotPassword() {
  // Full in-app flow: enter email → OTP is sent → enter code + new password.
  const nav = useNavigate();
  const [stage, setStage] = useState("email"); // email | code | done
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const codeStr = code.join("");

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const requestCode = async (targetEmail) => {
    setError("");
    setSent("");
    setLoading(true);
    try {
      const r = await api("/auth/forgot-password", {
        method: "POST",
        body: { email: targetEmail },
      });
      setStage("code");
      setSent(
        r.sent
          ? "A 6-digit reset code is on its way to your inbox."
          : "Code generated — check the server log.",
      );
      if (r.devCode) setCode(String(r.devCode).slice(0, 6).split(""));
      setCooldown(30);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const value = String(f.get("email") || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }
    setEmail(value);
    await requestCode(value);
  };

  const submitReset = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setError("");
    if (codeStr.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    if (String(f.get("password")).length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (f.get("password") !== f.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: { email, code: codeStr, password: f.get("password") },
      });
      setStage("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={
        stage === "email"
          ? "Forgot password"
          : stage === "done"
            ? "Password updated"
            : "Check your email"
      }
      subtitle={
        stage === "email"
          ? "We'll send a 6-digit code to your email to reset your password."
          : stage === "done"
            ? "You can now log in with your new password."
            : `Enter the code we sent to ${email} and choose a new password.`
      }
    >
      {stage === "email" && (
        <form onSubmit={submitEmail} className="space-y-4">
          <Field label="Email">
            <Input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
            />
          </Field>
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            loading={loading}
          >
            Send reset code
          </Button>
          {error && (
            <p className="text-center text-sm font-medium text-danger">{error}</p>
          )}
        </form>
      )}

      {stage === "code" && (
        <form onSubmit={submitReset} className="space-y-5">
          {sent && (
            <p className="text-center text-sm text-success">{sent}</p>
          )}
          <div>
            <span className="mb-1.5 block text-sm font-medium">
              Verification code
            </span>
            <div className="flex gap-2">
              {code.map((digit, i) => (
                <input
                  key={i}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  aria-label={`Digit ${i + 1}`}
                  className={`${inputCls} h-14 w-12 px-0 text-center text-xl font-bold`}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(-1);
                    const next = [...code];
                    next[i] = v;
                    setCode(next);
                    if (v) e.target.nextSibling?.focus();
                  }}
                />
              ))}
            </div>
          </div>
          <Field label="New password" hint="At least 8 characters.">
            <PasswordInput
              name="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput
              name="confirm"
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </Field>
          <Button
            type="submit"
            variant="gold"
            className="w-full"
            loading={loading}
          >
            Reset password
          </Button>
          {error && (
            <p className="text-center text-sm font-medium text-danger">{error}</p>
          )}
          <p className="text-center text-sm text-muted">
            Didn't get it?{" "}
            {cooldown > 0 ? (
              <span>Resend in {cooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => requestCode(email)}
                className="font-semibold text-gold"
              >
                Resend code
              </button>
            )}
          </p>
        </form>
      )}

      {stage === "done" && (
        <Card className="p-5 text-center">
          <div className="mb-2 flex justify-center text-success">
            <CheckCircleIcon size={32} />
          </div>
          <h2 className="mb-1 font-bold">All set</h2>
          <p className="mb-4 text-sm text-muted">
            Your password has been changed. Log in with the new one.
          </p>
          <Button
            variant="gold"
            className="w-full"
            onClick={() => nav("/login")}
          >
            Go to log in
          </Button>
        </Card>
      )}

      {stage !== "done" && (
        <p className="mt-6 text-center text-sm text-muted">
          <Link
            to="/login"
            className="flex items-center gap-1 font-semibold text-gold"
          >
            <ArrowLeftIcon size={14} /> Back to log in
          </Link>
        </p>
      )}
    </AuthShell>
  );
}

export function VerifyEmail() {
  const nav = useNavigate();
  const { user, refresh } = useAuth();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState("");
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds until resend is allowed

  const codeStr = code.join("");

  useEffect(() => {
    if (user?.emailVerified) nav("/onboarding");
  }, [user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (codeStr.length < 6) {
      setError("Enter all 6 digits.");
      return;
    }
    setLoading(true);
    try {
      await api("/auth/verify-otp", { method: "POST", body: { code: codeStr } });
      await refresh();
      nav("/onboarding");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* resend cooldown ticker */
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (resending || cooldown > 0) return;
    setError("");
    setSent("");
    setResending(true);
    try {
      const r = await api("/auth/resend-otp", { method: "POST" });
      setSent(
        r.sent
          ? "A new code is on its way to your inbox."
          : "Code regenerated — check the server log.",
      );
      if (r.devCode) {
        setCode(String(r.devCode).slice(0, 6).split(""));
      }
      setCooldown(30); // prevent spamming the email endpoint
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${user?.email || "your inbox"}. Enter it below to activate your account.`}
    >
      <form onSubmit={submit} className="space-y-5">
        <div>
          <span className="mb-1.5 block text-sm font-medium">
            Verification code
          </span>
          <div className="flex gap-2">
            {code.map((digit, i) => (
              <input
                key={i}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                aria-label={`Digit ${i + 1}`}
                className={`${inputCls} h-14 w-12 px-0 text-center text-xl font-bold`}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(-1);
                  const next = [...code];
                  next[i] = v;
                  setCode(next);
                  if (v) e.target.nextSibling?.focus();
                }}
              />
            ))}
          </div>
        </div>
        <Button type="submit" variant="gold" className="w-full" loading={loading}>
          Verify & continue
        </Button>
        {error && <p className="text-center text-sm font-medium text-danger">{error}</p>}
        {sent && <p className="text-center text-sm text-success">{sent}</p>}
        <p className="text-center text-sm text-muted">
          Didn't get it?{" "}
          {cooldown > 0 ? (
            <span className="text-muted">
              Resend in {cooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="font-semibold text-gold disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>
      </form>
    </AuthShell>
  );
}

export function Onboarding() {
  const nav = useNavigate();
  const markets = ["Forex", "Commodities", "Indices", "Crypto"];
  const [picked, setPicked] = useState(["Forex"]);
  return (
    <AuthShell
      title="Personalise your feed"
      subtitle="Optional — choose the markets you want to see first. You can change this later."
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {markets.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={picked.includes(m)}
            onClick={() =>
              setPicked(
                picked.includes(m)
                  ? picked.filter((x) => x !== m)
                  : [...picked, m],
              )
            }
            className={`min-h-[44px] rounded-full px-4 text-sm font-semibold ${picked.includes(m) ? "bg-ink text-gold" : "border border-line bg-surface text-muted"}`}
          >
            {m}
          </button>
        ))}
      </div>
      <Button variant="gold" className="w-full" onClick={() => nav("/app")}>
        Continue to Cegnal
      </Button>
      <button
        className="mt-3 w-full text-sm font-semibold text-muted"
        onClick={() => nav("/app")}
      >
        Skip for now
      </button>
    </AuthShell>
  );
}
