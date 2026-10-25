import { Router } from "express";
import prisma from "../prisma.js";
import { requireAuth } from "../auth.js";
import {
  paystackConfigured,
  paystackPublicKey,
  parseAmount,
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
  paymentReference,
} from "../paystack.js";

const router = Router();

function payRef() {
  return paymentReference();
}

/* Shared: record the payment + activate the plan subscription.
   Used by the demo checkout and the Paystack verify/webhook flows. */
async function activatePlanSubscription(userId, plan) {
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId: plan.id,
      status: "active",
      renewsAt,
      startedAt: new Date(),
    },
    create: { userId, planId: plan.id, status: "active", renewsAt },
    include: { plan: true },
  });

  await prisma.user.update({
    where: { id: userId },
    data: { plan: "premium", planStatus: "active", planRenewsAt: renewsAt },
  });

  return { subscription, renewsAt };
}

/* Shared: record a zone payment + activate the zone subscription. */
async function activateZoneSubscription(userId, trader) {
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  const sub = await prisma.zoneSubscription.upsert({
    where: { userId_traderId: { userId, traderId: trader.id } },
    update: { status: "active", renewsAt },
    create: { userId, traderId: trader.id, renewsAt },
    include: { trader: true },
  });

  await prisma.notification.create({
    data: {
      userId,
      category: "system",
      title: `Welcome to ${trader.displayName}'s zone`,
      body: `You now have access to live signals in the ${trader.displayName} zone.`,
      link: `/zone/room/${trader.handle}`,
    },
  });

  return { sub, renewsAt };
}

export { activatePlanSubscription, activateZoneSubscription };

// GET /api/payments — the signed-in user's payment history
router.get("/", requireAuth, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.sub },
      orderBy: { date: "desc" },
    });
    res.json({ payments });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to load payments", detail: err.message });
  }
});

// POST /api/payments/checkout — pay for a plan and activate the subscription.
// (Real payment-gateway webhooks would confirm the charge; this records the
//  payment and upgrades the user immediately, matching the app's UI flow.)
router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const { planId } = req.body || {};
    if (!planId) return res.status(400).json({ error: "planId is required" });

    const plan = await prisma.plan.findUnique({
      where: { id: String(planId) },
    });
    if (!plan) return res.status(404).json({ error: "Plan not found" });
    if (plan.id === "free")
      return res.status(400).json({ error: "Free plan requires no payment" });

    const { subscription } = await activatePlanSubscription(req.user.sub, plan);

    const payment = await prisma.payment.create({
      data: {
        ref: payRef(),
        amount: plan.price,
        planName: `${plan.name} — Monthly`,
        status: "paid",
        userId: req.user.sub,
        subscriptionId: subscription.id,
      },
    });

    // Keep the user's cached plan in sync
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { plan: "premium", planStatus: "active", planRenewsAt: renewsAt },
    });

    res.status(201).json({ payment, subscription });
  } catch (err) {
    res.status(500).json({ error: "Checkout failed", detail: err.message });
  }
});

/* ---------------- Paystack ----------------
   Flow: POST /paystack/init → returns authorization_url → user pays in the
   Paystack popup/hosted page → POST /paystack/verify/:reference confirms the
   charge with Paystack and activates the subscription. A webhook does the
   same server-to-server for missed redirects. */

// GET /api/payments/paystack/config — public key for the popup
router.get("/paystack/config", (_req, res) => {
  res.json({ configured: paystackConfigured(), publicKey: paystackPublicKey() });
});

// POST /api/payments/paystack/init — start a transaction (plan or zone)
router.post("/paystack/init", requireAuth, async (req, res) => {
  try {
    if (!paystackConfigured()) {
      return res
        .status(503)
        .json({ error: "Payments are not configured yet. Try again later." });
    }

    const { planId, traderHandle } = req.body || {};
    if (!planId && !traderHandle)
      return res.status(400).json({ error: "planId or traderHandle is required" });

    let plan = null;
    let trader = null;
    let amountDisplay;
    let description;

    if (planId) {
      plan = await prisma.plan.findUnique({ where: { id: String(planId) } });
      if (!plan) return res.status(404).json({ error: "Plan not found" });
      if (plan.id === "free")
        return res.status(400).json({ error: "Free plan requires no payment" });
      amountDisplay = plan.price;
      description = `${plan.name} — Monthly`;
    } else {
      trader = await prisma.zoneTrader.findUnique({
        where: { handle: String(traderHandle) },
      });
      if (!trader) return res.status(404).json({ error: "Trader not found" });
      amountDisplay = trader.fee;
      description = `${trader.displayName} zone — Monthly`;
    }

    const parsed = parseAmount(amountDisplay);
    if (!parsed)
      return res.status(400).json({ error: "This item cannot be paid for online" });

    const reference = payRef();
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });

    const tx = await initializeTransaction({
      email: user.email,
      amount: parsed.amount,
      currency: parsed.currency,
      reference,
      metadata: {
        userId: req.user.sub,
        planId: plan?.id || null,
        traderHandle: trader?.handle || null,
        description,
      },
      callbackUrl: `${req.protocol}://${req.get("host")}/zone/subscriptions?paid=${reference}`,
    });

    res.json({
      reference,
      authorizationUrl: tx.authorization_url,
      accessCode: tx.access_code,
    });
  } catch (err) {
    res.status(500).json({ error: "Could not start payment", detail: err.message });
  }
});

/* Shared completion logic for verify + webhook. */
async function completePayment(reference) {
  const tx = await verifyTransaction(reference);
  if (tx.status !== "success") return null;

  const meta = tx.metadata || {};
  const existing = await prisma.payment.findUnique({ where: { ref: reference } });
  if (existing && existing.status === "paid") return existing;

  let payment;
  if (meta.traderHandle) {
    const trader = await prisma.zoneTrader.findUnique({
      where: { handle: meta.traderHandle },
    });
    if (trader) {
      const { sub } = await activateZoneSubscription(meta.userId, trader);
      // Credit the zone owner: parse the display fee for the ledger entry.
      const parsed = parseAmount(trader.fee);
      const gross = parsed ? parsed.amount / 100 : 0;
      const PLATFORM_FEE = 0.1; // 10% platform commission
      if (gross > 0 && trader.ownerId) {
        await prisma.zoneEarning.create({
          data: {
            traderId: trader.id,
            amount: gross,
            currency: parsed.currency,
            feeAmount: Math.round(gross * PLATFORM_FEE * 100) / 100,
          },
        });
      }
      payment = await prisma.payment.upsert({
        where: { ref: reference },
        update: { status: "paid" },
        create: {
          ref: reference,
          amount: `${tx.currency} ${(tx.amount / 100).toLocaleString()}`,
          planName: `${trader.displayName} zone — Monthly`,
          status: "paid",
          userId: meta.userId,
          subscriptionId: null,
        },
      });
      payment.zoneSubscription = sub;
    }
  } else if (meta.planId) {
    const plan = await prisma.plan.findUnique({ where: { id: meta.planId } });
    if (plan) {
      const { subscription } = await activatePlanSubscription(meta.userId, plan);
      payment = await prisma.payment.upsert({
        where: { ref: reference },
        update: { status: "paid" },
        create: {
          ref: reference,
          amount: `${tx.currency} ${(tx.amount / 100).toLocaleString()}`,
          planName: `${plan.name} — Monthly`,
          status: "paid",
          userId: meta.userId,
          subscriptionId: subscription.id,
        },
      });
      payment.subscription = subscription;
    }
  }
  return payment;
}

// GET /api/payments/paystack/verify/:reference — confirm after redirect/popup close
router.get("/paystack/verify/:reference", requireAuth, async (req, res) => {
  try {
    if (!paystackConfigured())
      return res.status(503).json({ error: "Payments are not configured yet." });

    const payment = await completePayment(req.params.reference);
    if (!payment)
      return res.status(402).json({
        error: "Payment not completed yet",
        status: "pending",
      });

    res.json({
      payment: {
        ref: payment.ref,
        planName: payment.planName,
        amount: payment.amount,
        status: payment.status,
      },
      renewsAt: payment.zoneSubscription?.renewsAt || payment.subscription?.renewsAt || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Verification failed", detail: err.message });
  }
});

// POST /api/payments/paystack/webhook — server-to-server confirmation
router.post("/paystack/webhook", async (req, res) => {
  try {
    const valid = await verifyWebhookSignature(req);
    if (!valid) return res.status(401).json({ error: "Invalid signature" });

    const event = req.body || {};
    if (
      event.event === "charge.success" &&
      event.data?.status === "success" &&
      event.data?.reference
    ) {
      await completePayment(event.data.reference).catch(() => {});
    }
    // Always 200 so Paystack doesn't retry forever on transient errors
    res.sendStatus(200);
  } catch {
    res.sendStatus(200);
  }
});

// POST /api/payments/cancel — cancel the active subscription
router.post("/cancel", requireAuth, async (req, res) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId: req.user.sub },
      data: { status: "cancelled" },
      include: { plan: true },
    });
    await prisma.user.update({
      where: { id: req.user.sub },
      data: { planStatus: "cancelled" },
    });
    res.json({ subscription });
  } catch (err) {
    res
      .status(500)
      .json({
        error: "Cancellation failed (no active subscription?)",
        detail: err.message,
      });
  }
});

export default router;
