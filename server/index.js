import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import { config } from "dotenv";

config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import prisma from "./prisma.js";
import authRoutes from "./routes/auth.js";
import signalRoutes from "./routes/signals.js";
import notificationRoutes from "./routes/notifications.js";
import paymentRoutes from "./routes/payments.js";
import planRoutes from "./routes/plans.js";
import zoneRoutes from "./routes/zone.js";
import contentRoutes from "./routes/content.js";
import adminRoutes from "./routes/admin.js";

const app = express();

// CORS: allow the frontend origin(s) via ALLOWED_ORIGINS (comma-separated).
// Localhost dev origins are always allowed.
const allowedOrigins = [
  ...new Set([
    ...(process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    "http://localhost:5199",
    "http://localhost:5173",
  ]),
];
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin/no-origin requests (curl, health checks) and the allowlist.
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false); // send no CORS headers instead of erroring
    },
  }),
);

// Keep the raw body around for Paystack webhook signature verification
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

// Health check — also verifies the MongoDB connection
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$connect();
    const users = await prisma.user.count();
    res.json({ ok: true, db: "connected", users });
  } catch {
    res.json({ ok: true, db: "unreachable" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/signals", signalRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/zone", zoneRoutes);
app.use("/api", contentRoutes);
app.use("/api", adminRoutes);

// 404 for unknown API routes
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

// Serve the built frontend (dist/) when it exists — Render single-service deploy.
const distDir = path.join(__dirname, "..", "dist");
app.use(express.static(distDir));

// SPA fallback: any non-API GET serves index.html so client routes work.
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(distDir, "index.html"), (err) => {
    if (err) res.status(404).send("Frontend build not found. Run `npm run build`.");
  });
});

// Central error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
const server = app.listen(port, () => {
  console.log(`Cegnal API listening on http://localhost:${port}`);
});

// Graceful shutdown
async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
