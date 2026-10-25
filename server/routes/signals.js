import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../auth.js";

const router = Router();

function visibleTo(tier, userPlan) {
  return tier === "free" || userPlan === "premium";
}

function serialize(signal) {
  return {
    id: signal.id,
    instrument: signal.instrument,
    market: signal.market,
    direction: signal.direction === "buy" ? "Buy" : "Sell",
    status: signal.status,
    timeframe: signal.timeframe,
    entry: signal.entry,
    stopLoss: signal.stopLoss,
    targets: signal.targets,
    tier: signal.tier === "premium" ? "Premium" : "Free",
    analyst: signal.analystName,
    published: signal.published,
    updated: signal.updated,
    rationale: signal.rationale,
    revisions: signal.revisions.map((r) => ({ time: r.time, note: r.note })),
  };
}

// GET /api/signals?market=Forex&status=active&tier=premium&page=1
router.get("/", requireAuth, async (req, res) => {
  try {
    const { market, status, tier, page = "1", limit = "20" } = req.query;
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    const plan = user?.plan === "premium" ? "premium" : "free";

    const where = {};
    if (market) where.market = String(market);
    if (status) where.status = String(status);
    if (tier) where.tier = String(tier);

    const take = Math.min(parseInt(limit, 10) || 20, 50);
    const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

    const [total, signals] = await Promise.all([
      prisma.signal.count({ where }),
      prisma.signal.findMany({
        where,
        orderBy: { published: "desc" },
        skip,
        take,
        include: { revisions: { orderBy: { time: "desc" } } },
      }),
    ]);

    res.json({
      total,
      page: Number(page) || 1,
      signals: signals.map((s) => ({
        ...serialize(s),
        locked: !visibleTo(s.tier, plan),
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load signals", detail: err.message });
  }
});

// GET /api/signals/:id — full detail (premium signals require a premium plan)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const signal = await prisma.signal.findUnique({
      where: { id: req.params.id },
      include: { revisions: { orderBy: { time: "desc" } } },
    });
    if (!signal) return res.status(404).json({ error: "Signal not found" });

    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    const plan = user?.plan === "premium" ? "premium" : "free";
    if (!visibleTo(signal.tier, plan)) {
      return res
        .status(403)
        .json({ error: "Upgrade to Premium to view this signal" });
    }
    res.json({ signal: serialize(signal) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load signal", detail: err.message });
  }
});

// POST /api/signals — analysts create a draft (goes to review queue)
router.post("/", requireAuth, async (req, res) => {
  try {
    if (req.user.role !== "analyst" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only analysts can publish signals" });
    }
    const {
      instrument,
      market,
      direction,
      timeframe,
      entry,
      stopLoss,
      targets,
      tier,
      rationale,
    } = req.body || {};
    if (!instrument || !market || !direction || !entry || !stopLoss) {
      return res.status(400).json({
        error: "instrument, market, direction, entry and stopLoss are required",
      });
    }
    const signal = await prisma.signal.create({
      data: {
        instrument: String(instrument),
        market: String(market),
        direction: String(direction).toLowerCase() === "sell" ? "sell" : "buy",
        status: "pending_review",
        timeframe: String(timeframe || "4H"),
        entry: String(entry),
        stopLoss: String(stopLoss),
        targets: Array.isArray(targets) ? targets.map(String) : [],
        tier: String(tier || "free") === "premium" ? "premium" : "free",
        rationale: String(rationale || ""),
        analystId: req.user.sub,
        analystName: "Cegnal Desk",
      },
      include: { revisions: true },
    });
    await prisma.reviewQueueItem.create({
      data: {
        instrument: signal.instrument,
        direction: signal.direction === "sell" ? "sell" : "buy",
        analystName: "T. Adeyemi",
      },
    });
    res.status(201).json({ signal: serialize(signal) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create signal", detail: err.message });
  }
});

// PATCH /api/signals/:id/status — update status + append a revision note
router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    if (!["analyst", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const { status, note } = req.body || {};
    if (!status) return res.status(400).json({ error: "status is required" });

    const signal = await prisma.signal.update({
      where: { id: req.params.id },
      data: {
        status: String(status),
        revisions: note ? { create: { note: String(note) } } : undefined,
      },
      include: { revisions: { orderBy: { time: "desc" } } },
    });
    res.json({ signal: serialize(signal) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update signal", detail: err.message });
  }
});

export default router;
