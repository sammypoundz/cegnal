// Illustrative sample data — clearly not real performance metrics.

export const user = {
  name: "Ade Balogun",
  email: "ade@example.com",
  role: "member", // member | analyst | admin
  plan: "Free",
  planStatus: "active",
  timezone: "Africa/Lagos (GMT+1)",
  emailVerified: true,
};

export const STATUS = {
  active: { label: "Active", tone: "success" },
  "target-reached": { label: "Target Reached", tone: "success" },
  "stop-loss": { label: "Stop Loss Reached", tone: "danger" },
  closed: { label: "Closed", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "warn" },
  expired: { label: "Expired", tone: "muted" },
};

export const signals = [
  {
    id: "sgn-1042",
    instrument: "EUR/USD",
    market: "Forex",
    direction: "Buy",
    status: "active",
    timeframe: "4H",
    entry: "1.0842 – 1.0855",
    stopLoss: "1.0798",
    targets: ["1.0910", "1.0950"],
    tier: "Premium",
    analyst: "Cegnal Desk",
    published: "2026-10-13 08:30",
    updated: "2026-10-13 11:05",
    rationale:
      "Price is holding above the 4H demand zone after a liquidity sweep. Momentum favours continuation toward the marked targets while stop-loss stays below structure.",
    revisions: [
      {
        time: "2026-10-13 11:05",
        note: "Status remains active. Entry range unchanged.",
      },
      { time: "2026-10-13 08:30", note: "Signal published." },
    ],
  },
  {
    id: "sgn-1041",
    instrument: "XAU/USD",
    market: "Commodities",
    direction: "Sell",
    status: "target-reached",
    timeframe: "1H",
    entry: "2,645 – 2,652",
    stopLoss: "2,671",
    targets: ["2,618", "2,601"],
    tier: "Free",
    analyst: "Cegnal Desk",
    published: "2026-10-12 14:10",
    updated: "2026-10-13 06:45",
    rationale:
      "Rejection at the weekly supply band with bearish 1H close. Sample record shown for design review — outcome data is illustrative.",
    revisions: [
      {
        time: "2026-10-13 06:45",
        note: "First target reached. Trade marked as sample.",
      },
    ],
  },
  {
    id: "sgn-1040",
    instrument: "GBP/JPY",
    market: "Forex",
    direction: "Buy",
    status: "stop-loss",
    timeframe: "Daily",
    entry: "198.40 – 198.90",
    stopLoss: "197.20",
    targets: ["201.50"],
    tier: "Premium",
    analyst: "Cegnal Desk",
    published: "2026-10-08 09:00",
    updated: "2026-10-11 22:30",
    rationale:
      "Breakout continuation setup on the daily chart. Illustrative sample record.",
    revisions: [
      {
        time: "2026-10-11 22:30",
        note: "Stop loss reached. Signal closed at a loss (illustrative).",
      },
    ],
  },
  {
    id: "sgn-1039",
    instrument: "USD/CAD",
    market: "Forex",
    direction: "Sell",
    status: "closed",
    timeframe: "4H",
    entry: "1.3965 – 1.3975",
    stopLoss: "1.4012",
    targets: ["1.3890"],
    tier: "Free",
    analyst: "Cegnal Desk",
    published: "2026-10-05 07:15",
    updated: "2026-10-09 16:00",
    rationale: "Range re-entry short. Illustrative sample record.",
    revisions: [],
  },
  {
    id: "sgn-1038",
    instrument: "BTC/USD",
    market: "Crypto",
    direction: "Buy",
    status: "expired",
    timeframe: "12H",
    entry: "68,200 – 68,600",
    stopLoss: "66,900",
    targets: ["70,400", "71,800"],
    tier: "Premium",
    analyst: "Cegnal Desk",
    published: "2026-10-02 12:00",
    updated: "2026-10-07 00:00",
    rationale: "Illustrative sample record.",
    revisions: [],
  },
];

export const notifications = [
  {
    id: "n1",
    read: false,
    category: "Signal update",
    title: "EUR/USD (Buy) — status update",
    body: "Entry range unchanged, status remains active.",
    time: "Today, 11:05",
    link: "/app/signals/sgn-1042",
  },
  {
    id: "n2",
    read: false,
    category: "New signal",
    title: "New premium signal: XAU/USD",
    body: "A new Sell setup is available on your plan.",
    time: "Today, 08:31",
    link: "/app/signals/sgn-1041",
  },
  {
    id: "n3",
    read: true,
    category: "Billing",
    title: "Plan renewal reminder",
    body: "Your subscription renews on 1 Nov 2026.",
    time: "Yesterday",
    link: "/app/subscription",
  },
];

export const payments = [
  {
    date: "2026-10-01",
    amount: "₦5,000",
    plan: "Premium — Monthly",
    status: "Paid",
    ref: "CGN-PAY-8421",
  },
  {
    date: "2026-09-01",
    amount: "₦5,000",
    plan: "Premium — Monthly",
    status: "Paid",
    ref: "CGN-PAY-8190",
  },
];

export const reviewQueue = [
  {
    id: "q1",
    instrument: "USD/CHF",
    direction: "Sell",
    analyst: "T. Adeyemi",
    submitted: "2026-10-13 09:20",
    status: "Pending review",
  },
  {
    id: "q2",
    instrument: "NAS100",
    direction: "Buy",
    analyst: "R. Okoro",
    submitted: "2026-10-12 19:45",
    status: "Pending review",
  },
];

export const auditLog = [
  {
    actor: "Admin (K. Musa)",
    action: "Approved signal",
    record: "sgn-1041 (XAU/USD)",
    time: "2026-10-12 14:05",
  },
  {
    actor: "Analyst (T. Adeyemi)",
    action: "Submitted draft for review",
    record: "USD/CHF Sell draft",
    time: "2026-10-13 09:20",
  },
  {
    actor: "System",
    action: "Payment verified",
    record: "CGN-PAY-8421",
    time: "2026-10-01 10:12",
  },
];

export const plans = [
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

export const faqs = [
  {
    q: "What is Cegnal?",
    a: "Cegnal is a trader-signal hub where analysts publish structured trade setups and members browse, follow and review them.",
  },
  {
    q: "Do signals guarantee profit?",
    a: "No. Trading involves substantial risk. Signals are analytical ideas, not financial advice, and outcomes can include losses.",
  },
  {
    q: "What is included in the Free plan?",
    a: "Free members can view signals marked as Free, browse history, and save signals. Premium signals show a locked state with plan options.",
  },
  {
    q: "How do I cancel a subscription?",
    a: "From Profile → Subscription you can manage or cancel your plan. Access continues until the end of the paid period.",
  },
];

export const risks =
  "Trading foreign exchange, commodities and other markets carries a high level of risk and may not be suitable for all investors. Cegnal signals are analytical information only, do not constitute financial advice, and do not guarantee any outcome. Past or sample performance does not indicate future results. Never trade with money you cannot afford to lose.";
