/* Seeds MongoDB with the plan catalogue and sample data from the front-end
   (mirrors src/lib/data.js). Run: npm run db:seed */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₦0",
    interval: "forever",
    blurb: "Get started and learn how Cegnal signals work.",
    features: [
      "Access to free signals",
      "Signal history browsing",
      "Saved signals & notifications",
    ],
    cta: "Get started free",
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "₦5,000",
    interval: "per month",
    blurb:
      "Full access to every signal and update. (Pricing to be confirmed before launch.)",
    features: [
      "All free-tier features",
      "Premium signals & full detail",
      "Update history per signal",
      "Priority notifications",
    ],
    cta: "Choose Premium",
    featured: true,
  },
];

// Sample analysts to own seeded signals
const analysts = [
  { email: "desk@cegnal.app", name: "Cegnal Desk", role: "admin", username: "cegnaldesk" },
  { email: "tadeyemi@cegnal.app", name: "T. Adeyemi", role: "analyst", username: "tadeyemi" },
];

const signals = [
  {
    instrument: "EUR/USD",
    market: "Forex",
    direction: "buy",
    status: "active",
    timeframe: "4H",
    entry: "1.0842 – 1.0855",
    stopLoss: "1.0798",
    targets: ["1.0910", "1.0950"],
    tier: "premium",
    rationale:
      "Price is holding above the 4H demand zone after a liquidity sweep. Momentum favours continuation toward the marked targets while stop-loss stays below structure.",
    revisions: [{ note: "Signal published." }],
  },
  {
    instrument: "XAU/USD",
    market: "Commodities",
    direction: "sell",
    status: "target_reached",
    timeframe: "1H",
    entry: "2,645 – 2,652",
    stopLoss: "2,671",
    targets: ["2,618", "2,601"],
    tier: "free",
    rationale:
      "Rejection at the weekly supply band with bearish 1H close. Sample record shown for design review — outcome data is illustrative.",
    revisions: [{ note: "First target reached. Trade marked as sample." }],
  },
  {
    instrument: "GBP/JPY",
    market: "Forex",
    direction: "buy",
    status: "stop_loss",
    timeframe: "Daily",
    entry: "198.40 – 198.90",
    stopLoss: "197.20",
    targets: ["201.50"],
    tier: "premium",
    rationale:
      "Breakout continuation setup on the daily chart. Illustrative sample record.",
    revisions: [
      { note: "Stop loss reached. Signal closed at a loss (illustrative)." },
    ],
  },
  {
    instrument: "USD/CAD",
    market: "Forex",
    direction: "sell",
    status: "closed",
    timeframe: "4H",
    entry: "1.3965 – 1.3975",
    stopLoss: "1.4012",
    targets: ["1.3890"],
    tier: "free",
    rationale: "Range re-entry short. Illustrative sample record.",
    revisions: [],
  },
  {
    instrument: "BTC/USD",
    market: "Crypto",
    direction: "buy",
    status: "expired",
    timeframe: "12H",
    entry: "68,200 – 68,600",
    stopLoss: "66,900",
    targets: ["70,400", "71,800"],
    tier: "premium",
    rationale: "Illustrative sample record.",
    revisions: [],
  },
];

async function main() {
  for (const plan of plans) {
    const { id: _planId, ...data } = plan;
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: data,
      create: plan,
    });
  }
  console.log(`Seeded ${plans.length} plans`);

  // Site content: FAQs, legal pages, risk notice
  const siteContent = [
    {
      id: "faq:what-is-cegnal",
      kind: "faq",
      title: "What is Cegnal?",
      body: [
        "Cegnal is a trader-signal hub where analysts publish structured trade setups and members browse, follow and review them.",
      ],
      order: 1,
    },
    {
      id: "faq:profit",
      kind: "faq",
      title: "Do signals guarantee profit?",
      body: [
        "No. Trading involves substantial risk. Signals are analytical ideas, not financial advice, and outcomes can include losses.",
      ],
      order: 2,
    },
    {
      id: "faq:free-plan",
      kind: "faq",
      title: "What is included in the Free plan?",
      body: [
        "Free members can view signals marked as Free, browse history, and save signals. Premium signals show a locked state with plan options.",
      ],
      order: 3,
    },
    {
      id: "faq:cancel",
      kind: "faq",
      title: "How do I cancel a subscription?",
      body: [
        "From Profile → Subscription you can manage or cancel your plan. Access continues until the end of the paid period.",
      ],
      order: 4,
    },
    {
      id: "legal:terms",
      kind: "legal",
      title: "Terms of Service",
      body: [
        "1. Acceptance — By using Cegnal you agree to these terms.",
        "2. Accounts — You are responsible for your credentials and activity.",
        "3. Signals — Content is provided for informational purposes only and may change or be withdrawn.",
        "4. Subscriptions — Paid plans renew monthly until cancelled; fees are shown before checkout.",
        "5. Conduct — Do not redistribute signal content or attempt to access restricted areas.",
      ],
      order: 1,
    },
    {
      id: "legal:privacy",
      kind: "legal",
      title: "Privacy Policy",
      body: [
        "Data we collect — Account details (email, name), preferences and billing records.",
        "How we use it — To provide signal access, process payments and send notifications you opt into.",
        "Storage & security — Data is stored securely and retained only while your account is active.",
        "Your rights — You may request export or deletion of your data from Profile → Privacy.",
      ],
      order: 2,
    },
    {
      id: "legal:risk",
      kind: "legal",
      title: "Risk Disclosure",
      body: [
        "Cegnal publishes analytical trade signals for informational purposes.",
        "Trading forex, commodities and crypto carries a high level of risk and can result in the loss of your entire deposit.",
        "Signals do not constitute financial advice and do not guarantee profit or eliminate trading risk.",
        "Sample or historical outcomes shown in the product are illustrative and do not predict future results.",
        "Seek independent advice and never trade money you cannot afford to lose.",
      ],
      order: 3,
    },
    {
      id: "risk-notice",
      kind: "risk",
      title: "Risk notice",
      body: [
        "Trading foreign exchange, commodities and other markets carries a high level of risk and may not be suitable for all investors. Cegnal signals are analytical information only, do not constitute financial advice, and do not guarantee any outcome. Past or sample performance does not indicate future results. Never trade with money you cannot afford to lose.",
      ],
      order: 0,
    },
  ];
  for (const c of siteContent) {
    await prisma.siteContent.upsert({
      where: { id: c.id },
      update: { kind: c.kind, title: c.title, body: c.body, order: c.order },
      create: c,
    });
  }
  console.log(`Seeded ${siteContent.length} content items`);

  for (const a of analysts) {
    await prisma.user.upsert({
      where: { email: a.email },
      update: { role: a.role },
      create: { ...a, passwordHash: "$2a$10$CHANGE_ME_SEE_README" },
    });
  }

  const desk = await prisma.user.findUnique({
    where: { email: "desk@cegnal.app" },
  });

  // Review queue + audit trail
  const rqCount = await prisma.reviewQueueItem.count();
  if (rqCount === 0) {
    await prisma.reviewQueueItem.createMany({
      data: [
        {
          instrument: "USD/CHF",
          direction: "sell",
          analystName: "T. Adeyemi",
          status: "Pending review",
        },
        {
          instrument: "NAS100",
          direction: "buy",
          analystName: "R. Okoro",
          status: "Pending review",
        },
      ],
    });
    console.log("Seeded review queue");
  }

  const logCount = await prisma.auditLog.count();
  if (logCount === 0) {
    await prisma.auditLog.createMany({
      data: [
        {
          actor: "Admin (K. Musa)",
          action: "Approved signal",
          record: "XAU/USD",
        },
        {
          actor: "Analyst (T. Adeyemi)",
          action: "Submitted draft for review",
          record: "USD/CHF Sell draft",
        },
        {
          actor: "System",
          action: "Payment verified",
          record: "CGN-PAY-8421",
        },
      ],
    });
    console.log("Seeded audit log");
  }

  const existing = await prisma.signal.count();
  if (existing === 0) {
    for (const s of signals) {
      const { revisions, ...data } = s;
      await prisma.signal.create({
        data: {
          ...data,
          analystId: desk.id,
          analystName: "Cegnal Desk",
          revisions: { create: revisions },
        },
      });
    }
    console.log(`Seeded ${signals.length} signals`);
  } else {
    console.log("Signals already present — skipped");
  }

  // Zone traders from src/lib/zoneData.js
  const zoneTraders = [
    {
      handle: "katforex",
      displayName: "Kat Forex",
      fee: "$50",
      entryFee: "10$",
      rating: 4.5,
      reviewCount: 200,
      subscribers: "300k",
      winRate: "75%",
      lossRate: "25%",
      marketType: "Forex",
      bio: "Full-time forex trader sharing high-probability setups, daily analysis and mentorship inside my signal zone.",
      catalogs: ["chart", "terminal", "analysis", "course"],
    },
    {
      handle: "bigdreamz99",
      displayName: "Bigdreamz99",
      fee: "₦5,000",
      entryFee: "15$",
      rating: 4.7,
      reviewCount: 164,
      subscribers: "180k",
      winRate: "72%",
      lossRate: "28%",
      marketType: "Forex & Gold",
      bio: "Gold and index specialist. Structured swing setups with clear risk management for every signal.",
      catalogs: ["chart", "analysis", "terminal"],
    },
    {
      handle: "ollikeyz",
      displayName: "Ollikeyz",
      fee: "Free",
      entryFee: "Free",
      rating: 4.3,
      reviewCount: 98,
      subscribers: "95k",
      winRate: "68%",
      lossRate: "32%",
      marketType: "Forex",
      bio: "Sharing free daily forex signals and market breakdowns to help beginners grow with discipline.",
      catalogs: ["chart", "course"],
    },
    {
      handle: "debbyforex",
      displayName: "Debby Forex",
      fee: "₦15,000",
      entryFee: "20$",
      rating: 4.8,
      reviewCount: 231,
      subscribers: "410k",
      winRate: "80%",
      lossRate: "20%",
      marketType: "Forex & Indices",
      bio: "Prop-firm trader focused on indices and majors. Daily zones, live sessions and full trade recaps.",
      catalogs: ["chart", "terminal", "analysis", "course"],
    },
    {
      handle: "zenfx",
      displayName: "Zen FX",
      fee: "$30",
      entryFee: "Free",
      rating: 4.4,
      reviewCount: 120,
      subscribers: "150k",
      winRate: "70%",
      lossRate: "30%",
      marketType: "Forex & Gold",
      bio: "Structured setups with clear risk management.",
      catalogs: ["chart", "analysis"],
    },
  ];

  for (const z of zoneTraders) {
    await prisma.zoneTrader.upsert({
      where: { handle: z.handle },
      update: z,
      create: z,
    });
  }
  console.log(`Seeded ${zoneTraders.length} zone traders`);

  // Zone signals for the katforex room (mirrors src/lib/zoneData.js)
  const kat = await prisma.zoneTrader.findUnique({ where: { handle: "katforex" } });
  if (kat) {
    const zoneSignalCount = await prisma.zoneSignal.count({ where: { traderId: kat.id } });
    if (zoneSignalCount === 0) {
      const zoneSignals = [
        {
          pair: "XAU/USD",
          direction: "buy",
          status: "live",
          entry: "2,312.40 – 2,315.80",
          stopLoss: "2,304.00",
          targets: "2,328.00 / 2,341.50",
          rr: "1:2.4",
          timeframe: "4H",
          note: "Gold holding above the 4H demand zone. Waiting for bullish engulfing confirmation before entries. Risk max 2% per trade.",
        },
        {
          pair: "GBP/USD",
          direction: "sell",
          status: "target_hit",
          entry: "1.2890",
          stopLoss: "1.2935",
          targets: "1.2810 / 1.2772",
          rr: "1:2.6",
          timeframe: "1H",
          result: "+186 pips",
        },
        {
          pair: "EUR/USD",
          direction: "buy",
          status: "target_hit",
          entry: "1.0842",
          stopLoss: "1.0798",
          targets: "1.0910 / 1.0950",
          rr: "1:2.1",
          timeframe: "4H",
          result: "+95 pips",
        },
        {
          pair: "USD/JPY",
          direction: "buy",
          status: "stopped_out",
          entry: "151.20",
          stopLoss: "150.80",
          targets: "152.40",
          rr: "1:3",
          timeframe: "1H",
          result: "-40 pips",
        },
      ];
      await prisma.zoneSignal.createMany({ data: zoneSignals.map((s) => ({ ...s, traderId: kat.id })) });
      console.log(`Seeded ${zoneSignals.length} zone signals`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
