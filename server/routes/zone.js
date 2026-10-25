// Forex Signal Zone API — traders, subscriptions and per-trader zone signals.
import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth, signToken } from "../auth.js";

const router = Router();

// Convert a ZoneTrader row to the shape the frontend expects (zoneData.js keys).
function serializeTrader(t) {
  return {
    id: t.handle, // frontend routes use the handle in URLs
    key: t.id,
    handle: t.handle,
    name: t.handle,
    displayName: t.displayName,
    fee: t.fee,
    entryFee: t.entryFee,
    rating: t.rating,
    reviewCount: t.reviewCount,
    subscribers: t.subscribers,
    winRate: t.winRate,
    lossRate: t.lossRate,
    status: t.status,
    marketType: t.marketType,
    bio: t.bio,
    catalogs: t.catalogs,
    sponsored: t.sponsored,
    sponsoredUntil: t.sponsoredUntil,
  };
}

function serializeZoneSignal(s, takersCount = 0) {
  const outcome =
    s.status === "target_hit"
      ? "win"
      : s.status === "stopped_out"
        ? "loss"
        : s.status === "breakeven"
          ? "be"
          : null;
  return {
    id: s.id,
    pair: s.pair,
    direction: s.direction === "sell" ? "Sell" : "Buy",
    status: s.status,
    statusLabel:
      s.status === "live"
        ? "Live"
        : s.status === "target_hit"
          ? "Target hit"
          : s.status === "stopped_out"
            ? "Stopped out"
            : s.status === "breakeven"
              ? "Breakeven"
              : "Draft",
    entry: s.entry,
    stopLoss: s.stopLoss,
    targets: s.targets,
    rr: s.rr,
    timeframe: s.timeframe,
    note: s.note,
    result:
      s.result ||
      (outcome === "win"
        ? "Target hit"
        : outcome === "loss"
          ? "Stopped out"
          : "0 pips"),
    outcome,
    postedAt: s.postedAt,
    takersCount,
    postedLabel: new Date(s.postedAt).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

// GET /api/zone/traders — public directory of zone traders
router.get("/traders", async (_req, res) => {
  try {
    const traders = await prisma.zoneTrader.findMany({
      orderBy: [{ sponsored: "desc" }, { rating: "desc" }],
    });
    res.json({ traders: traders.map(serializeTrader) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load traders", detail: err.message });
  }
});

// All remaining zone routes require a signed-in user.
router.use(requireAuth);

// Derive a unique handle from the user's name, e.g. "T. Adeyemi" -> "tadeyemi"
function handleFromName(name) {
  const base =
    String(name)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 24) || "analyst";
  let handle = base;
  let n = 1;
  return prisma.zoneTrader
    .findUnique({ where: { handle } })
    .then(async (taken) => {
      if (!taken) return handle;
      do {
        n += 1;
        handle = `${base}${n}`;
      } while (await prisma.zoneTrader.findUnique({ where: { handle } }));
      return handle;
    });
}

// POST /api/zone/kyc — mock KYC completion: register the user as a verified
// analyst in the DB and provision their own zone others can subscribe to.
router.post("/kyc", async (req, res) => {
  try {
    const { legalName, country, idType, idNumber, experience, markets } =
      req.body || {};
    if (!legalName || !idNumber) {
      return res
        .status(400)
        .json({ error: "legalName and idNumber are required" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Idempotent: re-submitting an already-verified KYC is fine.
    if (!user.kycVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          kycVerified: true,
          role: user.role === "admin" ? "admin" : "analyst",
        },
      });
    }

    let zone = await prisma.zoneTrader.findFirst({
      where: { ownerId: user.id },
    });
    if (!zone) {
      const displayName = user.name || String(legalName).trim();
      const handle = await handleFromName(displayName);
      zone = await prisma.zoneTrader.create({
        data: {
          handle,
          displayName,
          fee: "Free",
          marketType: String(markets || "Forex").split(",")[0].trim() || "Forex",
          bio: `Verified analyst · ${idType || "ID verified"} · ${experience || "New analyst"} · ${country || ""}`.trim(),
          ownerId: user.id,
        },
      });
    }

    const updated = await prisma.user.findUnique({ where: { id: user.id } });
    // Re-issue the token so it carries the new analyst role.
    res.status(201).json({
      token: signToken(updated),
      user: { id: updated.id, role: updated.role, kycVerified: updated.kycVerified },
      zone: serializeTrader(zone),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to complete KYC", detail: err.message });
  }
});

// GET /api/zone/me/zone — the signed-in analyst's own zone (if any)
router.get("/me/zone", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.sub },
      include: { ownedZones: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const owned = user.ownedZones[0] || null;
    res.json({
      kycVerified: user.kycVerified,
      role: user.role,
      zone: owned ? serializeTrader(owned) : null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load zone", detail: err.message });
  }
});

// Helper: resolve the signed-in user's owned zone (or null).
async function ownZone(userId) {
  return prisma.zoneTrader.findFirst({ where: { ownerId: userId } });
}

// GET /api/zone/me/subscriptions — zones the signed-in user has joined
router.get("/me/subscriptions", async (req, res) => {
  try {
    const subs = await prisma.zoneSubscription.findMany({
      where: { userId: req.user.sub },
      include: { trader: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      subscriptions: subs.map((s) => ({
        id: s.id,
        trader: serializeTrader(s.trader),
        joinedAt: s.createdAt,
        renewsAt: s.renewsAt,
        status: s.status,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load subscriptions", detail: err.message });
  }
});

// GET /api/zone/:handle/members — users subscribed to a trader's zone
// Online = seen by the server in the last 2 minutes (heartbeat).
const ONLINE_WINDOW_MS = 2 * 60_000;

router.get("/:handle/members", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    const subs = await prisma.zoneSubscription.findMany({
      where: { traderId: trader.id, status: "active" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    const me = req.user.sub;
    const onlineSince = new Date(Date.now() - ONLINE_WINDOW_MS);
    res.json({
      members: [
        {
          id: trader.id,
          name: trader.displayName,
          role: "Trader",
          online: true,
          plan: "Owner",
        },
        ...subs.map((s) => ({
          id: s.user.id,
          name: s.user.name,
          role: s.user.id === me ? "You" : "Member",
          online: Boolean(s.user.lastSeenAt && s.user.lastSeenAt > onlineSince),
          plan: s.user.plan === "premium" ? "Premium" : "Free",
        })),
      ],
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load members", detail: err.message });
  }
});

// POST /api/zone/heartbeat — mark the signed-in user as active right now.
// The client calls this while the zone room is open so members show as online.
router.post("/heartbeat", async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { lastSeenAt: new Date() },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update presence", detail: err.message });
  }
});

// POST /api/zone/subscribe — join a trader's zone (checkout confirm)
router.post("/subscribe", async (req, res) => {
  try {
    const { handle } = req.body || {};
    if (!handle) return res.status(400).json({ error: "handle is required" });

    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: String(handle) },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });

    const renewsAt = new Date();
    renewsAt.setMonth(renewsAt.getMonth() + 1);

    const sub = await prisma.zoneSubscription.upsert({
      where: { userId_traderId: { userId: req.user.sub, traderId: trader.id } },
      update: { status: "active", renewsAt },
      create: { userId: req.user.sub, traderId: trader.id, renewsAt },
      include: { trader: true },
    });

    await prisma.notification.create({
      data: {
        userId: req.user.sub,
        category: "system",
        title: `Welcome to ${trader.displayName}'s zone`,
        body: `You now have access to live signals in the ${trader.displayName} zone.`,
        link: `/zone/room/${trader.handle}`,
      },
    });

    res.status(201).json({
      subscription: {
        id: sub.id,
        trader: serializeTrader(sub.trader),
        renewsAt: sub.renewsAt,
        status: sub.status,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to subscribe", detail: err.message });
  }
});

// DELETE /api/zone/subscribe/:handle — leave a zone
router.delete("/subscribe/:handle", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    await prisma.zoneSubscription.deleteMany({
      where: { userId: req.user.sub, traderId: trader.id },
    });
    res.json({ ok: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to unsubscribe", detail: err.message });
  }
});

// GET /api/zone/:handle/signals?scope=live|history — signals for one zone
router.get("/:handle/signals", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });

    const scope = req.query.scope === "history" ? "history" : "live";
    const where =
      scope === "history"
        ? { traderId: trader.id, status: { not: "live" } }
        : { traderId: trader.id, status: "live" };

    const signals = await prisma.zoneSignal.findMany({
      where,
      orderBy: { postedAt: "desc" },
      take: 50,
    });
    // Taker counts: how many members clicked "I took this signal" per signal.
    const takerRows = await prisma.zoneSignalTake.groupBy({
      by: ["signalId"],
      where: { signalId: { in: signals.map((s) => s.id) } },
      _count: { _all: true },
    });
    const takersBySignal = new Map(takerRows.map((r) => [r.signalId, r._count._all]));
    // Which signals the signed-in user has already taken (for button state).
    const myTakes = new Set(
      (
        await prisma.zoneSignalTake.findMany({
          where: { userId: req.user.sub, signalId: { in: signals.map((s) => s.id) } },
          select: { signalId: true },
        })
      ).map((t) => t.signalId),
    );
    res.json({
      signals: signals.map((s) => ({
        ...serializeZoneSignal(s, takersBySignal.get(s.id) || 0),
        myTake: myTakes.has(s.id),
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load zone signals", detail: err.message });
  }
});

// POST /api/zone/:handle/signals — analyst posts a signal to their zone
router.post("/:handle/signals", requireAuth, async (req, res) => {
  try {
    if (!["analyst", "admin"].includes(req.user.role)) {
      return res.status(403).json({ error: "Only analysts can post signals" });
    }
    const {
      pair,
      direction,
      entry,
      stopLoss,
      targets,
      rr,
      timeframe,
      note,
      status,
    } = req.body || {};
    if (!pair || !entry || !stopLoss) {
      return res
        .status(400)
        .json({ error: "pair, entry and stopLoss are required" });
    }
    const trader = await ownZone(req.user.sub);
    if (!trader) {
      return res
        .status(403)
        .json({ error: "Complete KYC to create your zone first" });
    }

    const zoneStatus = status === "draft" ? "draft" : "live";
    const signal = await prisma.zoneSignal.create({
      data: {
        traderId: trader.id,
        pair: String(pair),
        direction:
          String(direction || "buy").toLowerCase() === "sell" ? "sell" : "buy",
        status: zoneStatus,
        entry: String(entry),
        stopLoss: String(stopLoss),
        targets: String(targets || ""),
        rr: String(rr || "—"),
        timeframe: String(timeframe || "4H"),
        note: String(note || ""),
      },
    });

    // Notify subscribers of a new live signal
    if (zoneStatus === "live") {
      const subs = await prisma.zoneSubscription.findMany({
        where: { traderId: trader.id },
        select: { userId: true },
      });
      if (subs.length) {
        await prisma.notification.createMany({
          data: subs.map((s) => ({
            userId: s.userId,
            category: "new_signal",
            title: `New signal in ${trader.displayName} zone`,
            body: `${signal.pair} ${signal.direction === "sell" ? "Sell" : "Buy"} setup published.`,
            link: `/zone/room/${trader.handle}`,
          })),
        });
      }
    }

    res.status(201).json({ signal: serializeZoneSignal(signal) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to post signal", detail: err.message });
  }
});

// POST /api/zone/signals/:id/take — member marks “I took this signal”.
// Persisted in the DB so the count survives reloads; toggling removes the row.
router.post("/signals/:id/take", async (req, res) => {
  try {
    const existing = await prisma.zoneSignal.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: "Signal not found" });

    const where = { userId_signalId: { userId: req.user.sub, signalId: existing.id } };
    const current = await prisma.zoneSignalTake.findUnique({ where });
    if (current) {
      await prisma.zoneSignalTake.delete({ where });
    } else {
      await prisma.zoneSignalTake.create({
        data: { userId: req.user.sub, signalId: existing.id },
      });
    }
    const takersCount = await prisma.zoneSignalTake.count({
      where: { signalId: existing.id },
    });
    res.json({ took: !current, takersCount });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to record signal take", detail: err.message });
  }
});

// PATCH /api/zone/signals/:id — update status/result (analyst closes a trade)
router.patch("/signals/:id", requireAuth, async (req, res) => {
  try {
    if (!["analyst", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Only analysts can update signals" });
    }
    const { status, result } = req.body || {};
    const existing = await prisma.zoneSignal.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: "Signal not found" });
    if (existing.traderId) {
      const zone = await prisma.zoneTrader.findUnique({
        where: { id: existing.traderId },
      });
      if (
        zone?.ownerId &&
        zone.ownerId !== req.user.sub &&
        req.user.role !== "admin"
      ) {
        return res
          .status(403)
          .json({ error: "You can only update signals in your own zone" });
      }
    }
    const signal = await prisma.zoneSignal.update({
      where: { id: req.params.id },
      data: {
        ...(status ? { status: String(status) } : {}),
        ...(result !== undefined ? { result: String(result) } : {}),
      },
    });
    res.json({ signal: serializeZoneSignal(signal) });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update signal", detail: err.message });
  }
});

// PATCH /api/zone/:handle — analyst updates their zone settings
router.patch("/:handle", async (req, res) => {
  try {
    if (!["analyst", "admin"].includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Only analysts can update a zone" });
    }
    const { name, fee, entryFee, status, marketType } = req.body || {};
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    // Only the zone owner (or an admin) can edit the zone.
    if (
      trader.ownerId &&
      trader.ownerId !== req.user.sub &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "You can only edit your own zone" });
    }
    const data = {};
    if (name?.trim()) data.displayName = String(name).trim();
    if (fee?.trim()) data.fee = String(fee).trim();
    if (entryFee?.trim()) data.entryFee = String(entryFee).trim();
    if (marketType?.trim()) data.marketType = String(marketType).trim();
    if (status === "Active" || status === "Paused") data.status = status;
    if (!Object.keys(data).length) {
      return res.status(400).json({ error: "No valid fields to update" });
    }
    const updated = await prisma.zoneTrader.update({
      where: { handle: req.params.handle },
      data,
    });
    res.json({ trader: serializeTrader(updated) });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Trader not found" });
    }
    res.status(500).json({ error: "Failed to update zone", detail: err.message });
  }
});

// GET /api/zone/:handle/ratings — member ratings for a zone + the caller's own
router.get("/:handle/ratings", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    const [ratings, mine] = await Promise.all([
      prisma.zoneRating.findMany({
        where: { traderId: trader.id },
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.zoneRating.findUnique({
        where: { userId_traderId: { userId: req.user.sub, traderId: trader.id } },
      }),
    ]);
    res.json({
      rating: trader.rating,
      reviewCount: trader.reviewCount,
      myRating: mine ? { stars: mine.stars, comment: mine.comment } : null,
      ratings: ratings.map((r) => ({
        id: r.id,
        stars: r.stars,
        comment: r.comment,
        name: r.user?.name || "Member",
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load ratings", detail: err.message });
  }
});

// POST /api/zone/:handle/rate — submit/update the caller's star rating.
// ZoneTrader.rating is recomputed as the live average of all member ratings,
// so the trader's displayed rating stays dynamic.
router.post("/:handle/rate", async (req, res) => {
  try {
    const { stars, comment } = req.body || {};
    const n = Number(stars);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      return res.status(400).json({ error: "stars must be 1–5" });
    }
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });

    await prisma.zoneRating.upsert({
      where: { userId_traderId: { userId: req.user.sub, traderId: trader.id } },
      update: { stars: n, comment: String(comment || "").slice(0, 500) },
      create: {
        userId: req.user.sub,
        traderId: trader.id,
        stars: n,
        comment: String(comment || "").slice(0, 500),
      },
    });

    const agg = await prisma.zoneRating.aggregate({
      where: { traderId: trader.id },
      _avg: { stars: true },
      _count: { _all: true },
    });
    const updated = await prisma.zoneTrader.update({
      where: { id: trader.id },
      data: {
        rating: Math.round((agg._avg.stars || 0) * 10) / 10,
        reviewCount: agg._count._all,
      },
    });
    res.json({
      rating: updated.rating,
      reviewCount: updated.reviewCount,
      myRating: { stars: n, comment: String(comment || "").slice(0, 500) },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit rating", detail: err.message });
  }
});

// GET /api/zone/me/earnings — the signed-in analyst's subscription revenue
router.get("/me/earnings", async (req, res) => {
  try {
    const zone = await ownZone(req.user.sub);
    if (!zone) return res.json({ zone: null, earnings: [], summary: null });
    const [ledger, agg, activeSubs] = await Promise.all([
      prisma.zoneEarning.findMany({
        where: { traderId: zone.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.zoneEarning.aggregate({
        where: { traderId: zone.id },
        _sum: { amount: true, feeAmount: true },
        _count: { _all: true },
      }),
      prisma.zoneSubscription.count({
        where: { traderId: zone.id, status: "active" },
      }),
    ]);
    const gross = agg._sum.amount || 0;
    const fees = agg._sum.feeAmount || 0;
    res.json({
      zone: serializeTrader(zone),
      summary: {
        gross,
        fees,
        net: gross - fees,
        payouts: agg._count._all,
        activeSubscribers: activeSubs,
        currency: ledger[0]?.currency || "NGN",
      },
      earnings: ledger.map((e) => ({
        id: e.id,
        amount: e.amount,
        fee: e.feeAmount,
        net: e.amount - e.feeAmount,
        currency: e.currency,
        status: e.status,
        date: e.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load earnings", detail: err.message });
  }
});

// POST /api/zone/:handle/promote — sponsor the zone for 30 days (boosted
// placement in the directory). The promo fee is recorded for the platform.
const PROMO_FEE_NGN = 5000;
router.post("/:handle/promote", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    if (trader.ownerId && trader.ownerId !== req.user.sub && req.user.role !== "admin") {
      return res.status(403).json({ error: "You can only promote your own zone" });
    }
    const { promote } = req.body || {};
    const sponsored = promote !== false;
    const sponsoredUntil = sponsored
      ? new Date(Date.now() + 30 * 24 * 3_600_000)
      : null;
    const updated = await prisma.zoneTrader.update({
      where: { id: trader.id },
      data: { sponsored, sponsoredUntil },
    });
    res.json({
      trader: serializeTrader(updated),
      promoFee: sponsored ? PROMO_FEE_NGN : 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to update promotion", detail: err.message });
  }
});

// GET /api/zone/:handle — single trader detail
router.get("/:handle", async (req, res) => {
  try {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: req.params.handle },
    });
    if (!trader) return res.status(404).json({ error: "Trader not found" });
    const [joined, liveCount] = await Promise.all([
      prisma.zoneSubscription.findUnique({
        where: {
          userId_traderId: { userId: req.user.sub, traderId: trader.id },
        },
      }),
      prisma.zoneSignal.count({
        where: { traderId: trader.id, status: "live" },
      }),
    ]);
    res.json({
      trader: serializeTrader(trader),
      joined: Boolean(joined),
      liveSignals: liveCount,
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load trader", detail: err.message });
  }
});

export default router;
