import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../auth.js";

const router = Router();

// GET /api/notifications — the signed-in user's notifications, newest first
router.get("/", requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.sub },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const unread = notifications.filter((n) => !n.read).length;
    res.json({ unread, notifications });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load notifications", detail: err.message });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  try {
    const notification = await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.sub },
      data: { read: true },
    });
    if (notification.count === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ ok: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update notification", detail: err.message });
  }
});

// POST /api/notifications/mark-all-read — clear the unread badge
router.post("/mark-all-read", requireAuth, async (req, res) => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId: req.user.sub, read: false },
      data: { read: true },
    });
    res.json({ ok: true, updated: result.count });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to mark all read", detail: err.message });
  }
});

export default router;
