import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../auth.js";

const router = Router();

/* Review queue — pending signals awaiting admin approval. */
router.get("/review-queue", requireAuth, async (_req, res) => {
  try {
    const items = await prisma.reviewQueueItem.findMany({
      where: { status: "Pending review" },
      orderBy: { submitted: "asc" },
    });
    res.json({
      items: items.map((i) => ({
        id: i.id,
        instrument: i.instrument,
        direction: i.direction === "sell" ? "Sell" : "Buy",
        analyst: i.analystName,
        submitted: new Date(i.submitted).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: i.status,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load review queue", detail: err.message });
  }
});

/* Audit log — most recent first. */
router.get("/audit-log", requireAuth, async (_req, res) => {
  try {
    const items = await prisma.auditLog.findMany({
      orderBy: { time: "desc" },
      take: 50,
    });
    res.json({
      auditLog: items.map((a) => ({
        id: a.id,
        actor: a.actor,
        action: a.action,
        record: a.record,
        time: new Date(a.time).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load audit log", detail: err.message });
  }
});

/* User management list. */
router.get("/users", requireAuth, async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({
      users: users.map((u) => ({
        name: u.name,
        email: u.email,
        role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
        planLabel:
          u.role === "member"
            ? `${u.plan === "premium" ? "Premium" : "Free"} · ${u.planStatus}`
            : "Staff",
        status: "Active",
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load users", detail: err.message });
  }
});

/* Platform metrics for the admin/analyst overview. */
router.get("/metrics", requireAuth, async (req, res) => {
  try {
    const [users, activeSubs, verifiedPayments, pendingReview, signals] =
      await Promise.all([
        prisma.user.count(),
        prisma.subscription.count({ where: { status: "active" } }),
        prisma.payment.count({ where: { status: "paid" } }),
        prisma.reviewQueueItem.count({ where: { status: "Pending review" } }),
        prisma.signal.count(),
      ]);
    res.json({
      users,
      activeSubscriptions: activeSubs,
      verifiedPayments,
      pendingReview,
      published: signals,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load metrics", detail: err.message });
  }
});

export default router;
