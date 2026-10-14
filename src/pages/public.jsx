import React from "react";
import { Link } from "react-router-dom";
import { Card, Button, Tag } from "../components/ui";
import { RiskDisclaimer } from "../components/signal";
import HeroSlider from "../components/HeroSlider";
import {
  CheckIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowRightIcon,
} from "../components/icons";
import { plans, faqs } from "../lib/data";

function PublicNav() {
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="app-max flex h-14 items-center px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-ink text-sm font-black text-gold">
            C
          </span>
          <span className="text-[15px] font-extrabold text-ink">Cegnal</span>
        </Link>
        <nav className="no-scrollbar ml-auto flex items-center gap-1 overflow-x-auto text-sm font-semibold text-muted">
          <Link className="px-2.5 py-2" to="/how-it-works">
            How it works
          </Link>
          <Link className="px-2.5 py-2" to="/plans">
            Plans
          </Link>
          <Link className="px-2.5 py-2" to="/faq">
            FAQ
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="ml-1 px-3">
              Log in
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function PublicShell({ children }) {
  return (
    <div className="app-max app-page">
      <PublicNav />
      <main className="px-4 pb-16 pt-6">{children}</main>
      <footer className="border-t border-line px-4 py-6 text-xs text-muted">
        <div className="mx-auto max-w-[480px] md:max-w-[768px] xl:max-w-[1104px]">
          <div className="mb-3 flex flex-wrap gap-4 font-semibold">
            <Link to="/legal/terms">Terms</Link>
            <Link to="/legal/privacy">Privacy</Link>
            <Link to="/legal/risk">Risk disclosure</Link>
            <Link to="/faq">Contact support</Link>
          </div>
          <p>
            © 2026 Cegnal. Trading involves risk. Signals are informational and
            are not financial advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Landing() {
  return (
    <PublicShell>
      <HeroSlider />
      <section className="mb-8 text-center">
        <Tag tone="gold">Trader-signal hub</Tag>
        <h1 className="mt-3 text-[28px] font-extrabold leading-tight tracking-tight text-ink">
          Structured trade signals, made clear.
        </h1>
        <p className="mx-auto mt-3 max-w-[320px] text-[15px] text-muted">
          Follow analyst setups with clear entry, stop-loss and target levels.
          Free and premium access.
        </p>
        <div className="mt-5 flex flex-col gap-3">
          <Link to="/register">
            <Button variant="gold" className="w-full">
              Create free account
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="secondary" className="w-full">
              See how it works
            </Button>
          </Link>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-bold text-body">How it works</h2>
        <div className="space-y-3">
          {[
            [
              "1",
              "Register free",
              "Create an account with your email — no payment needed to start.",
            ],
            [
              "2",
              "Browse signals",
              "Filter by instrument, direction, timeframe and status.",
            ],
            [
              "3",
              "Read the levels",
              "Entry, stop loss and targets are shown clearly for every signal.",
            ],
            [
              "4",
              "Manage your risk",
              "Signals are ideas, not guarantees — always apply your own risk plan.",
            ],
          ].map(([n, t, d]) => (
            <Card key={n} className="flex items-start gap-3 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-soft text-sm font-bold text-gold">
                {n}
              </span>
              <div>
                <h3 className="text-sm font-bold text-body">{t}</h3>
                <p className="text-sm text-muted">{d}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-1 text-[15px] font-bold text-body">
          Sample signal preview
        </h2>
        <p className="mb-3 text-xs text-muted">
          Illustrative example only — not live or historical performance data.
        </p>
        <Card className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold">EUR/USD</h3>
              <span className="rounded-md bg-success-soft px-2 py-0.5 text-[11px] font-bold text-success">
                <span className="flex items-center gap-0.5">
                  <ArrowUpIcon size={12} /> Buy
                </span>
              </span>
            </div>
            <span className="rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-current" /> Active
              </span>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-canvas p-3 text-center">
            {[
              ["Entry", "1.0842–55"],
              ["Stop loss", "1.0798"],
              ["Targets", "1.0910 / 1.0950"],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-[10px] font-semibold uppercase text-muted">
                  {l}
                </div>
                <div className="text-[13px] font-bold">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-muted">
            4H timeframe · Updated today 11:05
          </div>
        </Card>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-bold text-body">Access plans</h2>
        <div className="grid gap-3">
          {plans.map((p) => (
            <Card
              key={p.id}
              className={`p-4 ${p.featured ? "ring-1 ring-gold" : ""}`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-bold text-body">{p.name}</h3>
                <div>
                  <span className="text-xl font-extrabold text-ink">
                    {p.price}
                  </span>{" "}
                  <span className="text-xs text-muted">{p.interval}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted">{p.blurb}</p>
              <Link to="/plans">
                <Button
                  variant={p.featured ? "gold" : "secondary"}
                  className="mt-3 w-full"
                >
                  {p.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-[15px] font-bold text-body">
          Common questions
        </h2>
        <div className="space-y-2">
          {faqs.slice(0, 3).map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
        <Link
          to="/faq"
          className="mt-3 inline-block text-sm font-semibold text-gold"
        >
          See all questions <ArrowRightIcon size={14} />
        </Link>
      </section>

      <RiskDisclaimer />
    </PublicShell>
  );
}

export function FaqItem({ q, a }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-4 text-left"
      >
        <span className="text-sm font-semibold text-body">{q}</span>
          <span className="text-muted" aria-hidden="true">
            {open ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
          </span>
      </button>
      {open && (
        <p className="border-t border-line px-4 py-3 text-sm text-muted">{a}</p>
      )}
    </Card>
  );
}

export { PublicShell };

export function HowItWorks() {
  return (
    <PublicShell>
      <h1 className="mb-2 text-2xl font-extrabold text-ink">
        How Cegnal works
      </h1>
      <p className="mb-6 text-[15px] text-muted">
        Four simple steps from sign-up to reading your first signal.
      </p>
      <div className="space-y-3">
        {[
          [
            "Register & verify",
            "Sign up with your email and confirm the verification message we send you.",
          ],
          [
            "Choose your access",
            "Start on the Free plan or subscribe to Premium for full signal detail.",
          ],
          [
            "Read a signal",
            "Each signal shows instrument, direction, entry range, stop loss, targets, timeframe and status.",
          ],
          [
            "Follow updates",
            "Save signals and receive notifications when levels or status change.",
          ],
          [
            "Manage risk",
            "Every signal includes a risk note. Signals never guarantee profit — position sizing is your responsibility.",
          ],
        ].map(([t, d], i) => (
          <Card key={t} className="flex items-start gap-3 p-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-bold text-gold">
              {i + 1}
            </span>
            <div>
              <h3 className="text-sm font-bold">{t}</h3>
              <p className="text-sm text-muted">{d}</p>
            </div>
          </Card>
        ))}
      </div>
      <Link to="/register">
        <Button variant="gold" className="mt-6 w-full">
          Create free account
        </Button>
      </Link>
      <RiskDisclaimer className="mt-4" />
    </PublicShell>
  );
}

export function Plans() {
  return (
    <PublicShell>
      <h1 className="mb-1 text-2xl font-extrabold text-ink">Plans & pricing</h1>
      <p className="mb-6 text-[15px] text-muted">
        Start free. Upgrade any time — pricing shown is a pre-launch hypothesis.
      </p>
      <div className="space-y-4">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`p-5 ${p.featured ? "ring-1 ring-gold" : ""}`}
          >
            {p.featured && <Tag tone="gold">Most popular</Tag>}
            <div className="mt-1 flex items-baseline gap-2">
              <h2 className="text-lg font-bold text-body">{p.name}</h2>
              <span className="text-2xl font-extrabold text-ink">
                {p.price}
              </span>
              <span className="text-xs text-muted">{p.interval}</span>
            </div>
            <p className="mb-3 text-sm text-muted">{p.blurb}</p>
            <ul className="mb-4 space-y-2 text-sm text-body">
              {p.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-success">
                    <CheckIcon size={14} />
                  </span>{" "}
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/register">
              <Button
                variant={p.featured ? "gold" : "secondary"}
                className="w-full"
              >
                {p.cta}
              </Button>
            </Link>
          </Card>
        ))}
      </div>
      <Card className="mt-4 p-4 text-sm text-muted">
        <strong className="text-body">Renewal & cancellation:</strong> Premium
        plans renew monthly until cancelled. You can cancel any time from
        Profile → Subscription; access continues until the end of the paid
        period.
      </Card>
      <RiskDisclaimer className="mt-4" />
    </PublicShell>
  );
}

export function Faq() {
  return (
    <PublicShell>
      <h1 className="mb-1 text-2xl font-extrabold text-ink">About & FAQ</h1>
      <p className="mb-6 text-[15px] text-muted">
        Answers to common questions about Cegnal.
      </p>
      <div className="space-y-2">
        {faqs.map((f) => (
          <FaqItem key={f.q} {...f} />
        ))}
      </div>
      <Card className="mt-6 p-4">
        <h2 className="mb-1 text-sm font-bold">Contact support</h2>
        <p className="mb-3 text-sm text-muted">
          Questions about your account, billing or a signal? Our support team
          replies within one business day.
        </p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() =>
            window.alert("Support form opens in-app (placeholder).")
          }
        >
          Contact support
        </Button>
      </Card>
      <RiskDisclaimer className="mt-4" />
    </PublicShell>
  );
}

const legalContent = {
  terms: {
    title: "Terms of Service",
    body: [
      "1. Acceptance — By using Cegnal you agree to these terms.",
      "2. Accounts — You are responsible for your credentials and activity.",
      "3. Signals — Content is provided for informational purposes only and may change or be withdrawn.",
      "4. Subscriptions — Paid plans renew monthly until cancelled; fees are shown before checkout.",
      "5. Conduct — Do not redistribute signal content or attempt to access restricted areas.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Data we collect — Account details (email, name), preferences and billing records.",
      "How we use it — To provide signal access, process payments and send notifications you opt into.",
      "Storage & security — Data is stored securely and retained only while your account is active.",
      "Your rights — You may request export or deletion of your data from Profile → Privacy.",
    ],
  },
  risk: {
    title: "Risk Disclosure",
    body: [
      "Cegnal publishes analytical trade signals for informational purposes.",
      "Trading forex, commodities and crypto carries a high level of risk and can result in the loss of your entire deposit.",
      "Signals do not constitute financial advice and do not guarantee profit or eliminate trading risk.",
      "Sample or historical outcomes shown in the product are illustrative and do not predict future results.",
      "Seek independent advice and never trade money you cannot afford to lose.",
    ],
  },
};

export function Legal({ kind }) {
  const c = legalContent[kind];
  return (
    <PublicShell>
      <h1 className="mb-4 text-2xl font-extrabold text-ink">{c.title}</h1>
      <nav className="mb-6 flex flex-wrap gap-2">
        {Object.values(legalContent).map((l) => (
          <Link
            key={l.title}
            to={`/legal/${Object.keys(legalContent).find((k) => legalContent[k] === l)}`}
          >
            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${l.title === c.title ? "bg-ink text-white" : "border border-line bg-surface text-muted"}`}
            >
              {l.title}
            </span>
          </Link>
        ))}
      </nav>
      <article className="space-y-4 text-[15px] leading-relaxed text-body">
        {c.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </article>
      <p className="mt-8 text-xs text-muted">Last updated: 13 October 2026</p>
    </PublicShell>
  );
}
