import express from "express";
import cors from "cors";
import { config } from "dotenv";

config();

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
app.use(cors());

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
