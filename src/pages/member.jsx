import React, { useMemo, useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Page } from "../components/shell";
import {
  Card,
  Button,
  StatusChip,
  DirectionBadge,
  Tag,
  LevelRow,
  EmptyState,
  ErrorState,
  SkeletonCard,
  Toast,
  ConfirmModal,
  Field,
  Select,
} from "../components/ui";
import { SignalCard, RiskDisclaimer } from "../components/signal";
import { signals, user, notifications, payments, risks } from "../lib/data";
import {
  SearchIcon,
  HeartIcon,
  BellIcon,
  LockIcon,
  ReceiptIcon,
  MailIcon,
  ClockIcon,
  ClockHistoryIcon,
  KeyIcon,
  CardIcon,
  FileIcon,
  GearIcon,
  ChevronRightIcon,
  LogoutIcon,
  CheckIcon,
} from "../components/icons";

/* ---------------- Dashboard ---------------- */
export function Dashboard() {
  const premium = user.plan === "Premium";
  return (
    <Page title="Home">
      <section className="mb-5">
        <h1 className="text-xl font-extrabold text-ink">
          Good afternoon, {user.name.split(" ")[0]}
        </h1>
        <Card className="mt-3 flex items-center justify-between p-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              Your access
            </div>
            <div className="text-[15px] font-bold text-body">
              {user.plan} plan · Active
            </div>
          </div>
          {premium ? (
            <Link to="/app/subscription">
              <Button variant="secondary">Manage</Button>
            </Link>
          ) : (
            <Link to="/app/subscription">
              <Button variant="gold">Upgrade</Button>
            </Link>
          )}
        </Card>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 text-[15px] font-bold">Latest signals</h2>
        <div className="space-y-3">
          {signals.slice(0, 2).map((s) => (
            <SignalCard key={s.id} signal={s} isPremiumUser={premium} />
          ))}
        </div>
        <Link
          to="/app/signals"
          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold"
        >
          View all signals <ChevronRightIcon size={14} />
        </Link>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 text-[15px] font-bold">Saved signals</h2>
        <div className="space-y-2">
          {[signals[1]].map((s) => (
            <Card key={s.id} className="flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{s.instrument}</span>
                  <DirectionBadge direction={s.direction} />
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <HeartIcon size={12} filled /> Saved · {s.timeframe}
                </div>
              </div>
              <StatusChip status={s.status} />
            </Card>
          ))}
          <Link
            to="/app/saved"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gold"
          >
            All saved <ChevronRightIcon size={14} />
          </Link>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="mb-3 text-[15px] font-bold">Recent updates</h2>
        <div className="space-y-2">
          {notifications.slice(0, 2).map((n) => (
            <Card
              key={n.id}
              className={`p-4 ${!n.read ? "border-l-4 border-l-gold" : ""}`}
            >
              <div className="text-xs font-semibold text-gold">
                {n.category}
              </div>
              <div className="text-sm font-semibold text-body">{n.title}</div>
              <div className="text-xs text-muted">{n.time}</div>
            </Card>
          ))}
        </div>
      </section>

      {!premium && (
        <Card className="mb-5 border-gold bg-gold-soft/50 p-4">
          <h3 className="mb-1 text-sm font-bold">Thinking about Premium?</h3>
          <p className="mb-3 text-sm text-muted">
            Unlock full entry, stop-loss and target detail on every signal.
          </p>
          <Link to="/plans">
            <Button variant="gold" className="w-full">
              Compare plans
            </Button>
          </Link>
        </Card>
      )}
      <RiskDisclaimer />
    </Page>
  );
}

/* ---------------- Signal feed ---------------- */
const FILTERS = {
  market: ["All markets", "Forex", "Commodities", "Crypto"],
  direction: ["Any direction", "Buy", "Sell"],
  timeframe: ["Any timeframe", "1H", "4H", "12H", "Daily"],
  status: [
    "Any status",
    "Active",
    "Target Reached",
    "Stop Loss Reached",
    "Closed",
    "Cancelled",
    "Expired",
  ],
  tier: ["Any access", "Free", "Premium"],
};

export function SignalFeed({ premiumOnly = false }) {
  const [loading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [f, setF] = useState({
    market: "All markets",
    direction: "Any direction",
    timeframe: "Any timeframe",
    status: "Any status",
    tier: "Any access",
  });
  const [saved, setSaved] = useState(["sgn-1041"]);
  const [toast, setToast] = useState("");
  const [visible, setVisible] = useState(3);

  const filtered = useMemo(
    () =>
      signals.filter(
        (s) =>
          (f.market === "All markets" || s.market === f.market) &&
          (f.direction === "Any direction" || s.direction === f.direction) &&
          (f.timeframe === "Any timeframe" || s.timeframe === f.timeframe) &&
          (f.status === "Any status" ||
            s.status === f.status.toLowerCase().replace(" ", "-")) &&
          (f.tier === "Any access" || s.tier === f.tier),
      ),
    [f],
  );

  const active = Object.entries(f).filter(
    ([k, v]) => !v.startsWith("All") && !v.startsWith("Any"),
  );

  const save = (id) => {
    setSaved(
      saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id],
    );
    setToast(saved.includes(id) ? "Removed from saved" : "Saved to your list");
    setTimeout(() => setToast(""), 1800);
  };

  return (
    <Page
      title="Signals"
      action={
        <button
          onClick={() => setSheetOpen(true)}
          aria-label="Filters"
          className="flex h-11 w-11 items-center justify-center rounded-full text-body hover:bg-canvas"
        >
          <GearIcon size={20} />
        </button>
      }
    >
      {active.length > 0 && (
        <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
          {active.map(([k, v]) => (
            <button
              key={k}
              onClick={() => setF({ ...f, [k]: FILTERS[k][0] })}
              className="flex items-center gap-1 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-white"
            >
              {v} <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            onClick={() =>
              setF({
                market: "All markets",
                direction: "Any direction",
                timeframe: "Any timeframe",
                status: "Any status",
                tier: "Any access",
              })
            }
            className="rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-muted"
          >
            Reset all
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={24} />}
          title="No signals match your filters"
          body="Try widening the timeframe, status or market filters, or reset them all."
          action={
            <Button
              variant="secondary"
              onClick={() =>
                setF({
                  market: "All markets",
                  direction: "Any direction",
                  timeframe: "Any timeframe",
                  status: "Any status",
                  tier: "Any access",
                })
              }
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.slice(0, visible).map((s) => (
            <SignalCard
              key={s.id}
              signal={s}
              isPremiumUser
              premium={premiumOnly}
              saved={saved.includes(s.id)}
              onSave={save}
            />
          ))}
          {visible < filtered.length && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => setVisible(visible + 3)}
            >
              Load more signals ({filtered.length - visible} remaining)
            </Button>
          )}
        </div>
      )}
      <Toast message={toast} />

      {sheetOpen && (
        <FilterSheet
          f={f}
          setF={setF}
          onClose={() => setSheetOpen(false)}
          count={filtered.length}
        />
      )}
    </Page>
  );
}

function FilterSheet({ f, setF, onClose, count }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Filters"
    >
      <div
        className="safe-bottom w-full max-w-[480px] rounded-t-2xl bg-surface p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold">Filters</h2>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-11 w-11 items-center justify-center rounded-full text-lg hover:bg-canvas"
          >
            ×
          </button>
        </div>
        <div className="space-y-4">
          {Object.entries(FILTERS).map(([key, opts]) => (
            <Field key={key} label={key[0].toUpperCase() + key.slice(1)}>
              <Select
                value={f[key]}
                onChange={(e) => setF({ ...f, [key]: e.target.value })}
              >
                {opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() =>
              setF({
                market: "All markets",
                direction: "Any direction",
                timeframe: "Any timeframe",
                status: "Any status",
                tier: "Any access",
              })
            }
          >
            Reset
          </Button>
          <Button variant="gold" className="flex-1" onClick={onClose}>
            Show {count} signal{count === 1 ? "" : "s"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Signal detail ---------------- */
export function SignalDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const premium = user.plan === "Premium";
  const [saved, setSaved] = useState(false);
  const signal = signals.find((s) => s.id === id);
  if (!signal) {
    return (
      <Page title="Signal" back>
        <ErrorState
          title="Signal unavailable"
          body="This signal no longer exists or is not visible on your plan."
          onRetry={() => nav("/app/signals")}
        />
      </Page>
    );
  }
  const locked = signal.tier === "Premium" && !premium;

  return (
    <Page title={signal.instrument} back>
      <Card className="mb-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold">{signal.instrument}</h2>
            <DirectionBadge direction={signal.direction} />
          </div>
          <StatusChip status={signal.status} />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="flex items-center gap-1">
            <ClockIcon size={12} /> {signal.timeframe}
          </span>
          <span>Published {signal.published}</span>
          <span>Updated {signal.updated}</span>
          <Tag tone={signal.tier === "Premium" ? "gold" : "muted"}>
            {signal.tier}
          </Tag>
        </div>
      </Card>

      {locked ? (
        <LockedDetail onUpgrade={() => nav('/plans')} />
      ) : (
        <>
          <Card className="mb-4 p-4">
            <h3 className="mb-1 text-[15px] font-bold">Levels</h3>
            <LevelRow label="Entry range" value={signal.entry} tone="gold" />
            <LevelRow label="Stop loss" value={signal.stopLoss} tone="danger" />
            {signal.targets.map((t, i) => (
              <LevelRow
                key={t}
                label={`Target ${i + 1}`}
                value={t}
                tone="success"
              />
            ))}
          </Card>
          <Card className="mb-4 p-4">
            <h3 className="mb-1 text-[15px] font-bold">Analyst rationale</h3>
            <p className="text-sm leading-relaxed text-muted">
              {signal.rationale}
            </p>
            <p className="mt-3 text-xs text-muted">
              Author: {signal.analyst} ·{" "}
              <em>Analyst commentary — not verified outcome data.</em>
            </p>
          </Card>
          {signal.revisions.length > 0 && (
            <Card className="mb-4 p-4">
              <h3 className="mb-3 text-[15px] font-bold">Update history</h3>
              <ol className="space-y-3 border-l-2 border-line pl-4">
                {signal.revisions.map((r, i) => (
                  <li key={i} className="relative">
                    <span
                      className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold"
                      aria-hidden="true"
                    />
                    <div className="text-xs font-semibold text-muted">
                      {r.time}
                    </div>
                    <div className="text-sm text-body">{r.note}</div>
                  </li>
                ))}
              </ol>
            </Card>
          )}
          <div className="mb-4 flex gap-2">
            <Button
              variant={saved ? "secondary" : "gold"}
              className="flex-1"
              onClick={() => setSaved(!saved)}
            >
              {saved ? <HeartIcon size={16} filled /> : <HeartIcon size={16} />}
              {saved ? "Saved" : "Save signal"}
            </Button>
          </div>
        </>
      )}
      <RiskDisclaimer />
    </Page>
  );
}

function LockedDetail({ onUpgrade }) {
  return (
    <Card className="mb-4 p-5 text-center">
      <div
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gold-soft text-gold"
        aria-hidden="true"
      >
        <LockIcon size={22} />
      </div>
      <h3 className="mb-1 text-sm font-bold">Premium signal</h3>
      <p className="mb-4 text-sm text-muted">
        Entry, stop loss, targets, rationale and update history for this signal
        are available to Premium subscribers.
      </p>
      <Button variant="gold" className="w-full" onClick={onUpgrade}>
        View plan options
      </Button>
    </Card>
  );
}

/* ---------------- History ---------------- */
export function SignalHistory() {
  const done = signals.filter((s) =>
    ["closed", "cancelled", "expired", "stop-loss", "target-reached"].includes(
      s.status,
    ),
  );
  return (
    <Page title="Signal history" back>
      <p className="mb-4 text-sm text-muted">
        Historical records of completed, cancelled and expired signals. These
        are records, not performance claims.
      </p>
      <div className="space-y-3">
        {done.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold">{s.instrument}</span>
                <DirectionBadge direction={s.direction} />
              </div>
              <StatusChip status={s.status} />
            </div>
            <div className="text-xs text-muted">
              Closed {s.updated} · Entry {s.entry} · SL {s.stopLoss} · Targets{" "}
              {s.targets.join(" / ")}
            </div>
          </Card>
        ))}
      </div>
      <RiskDisclaimer className="mt-4" />
    </Page>
  );
}

/* ---------------- Saved ---------------- */
export function Saved() {
  const saved = signals.filter((s) => ["sgn-1041", "sgn-1039"].includes(s.id));
  return (
    <Page title="Saved">
      {saved.length === 0 ? (
        <EmptyState
          icon={<HeartIcon size={24} />}
          title="Nothing saved yet"
          body="Save signals from the feed to follow their updates here."
          action={
            <Link to="/app/signals">
              <Button variant="gold">Browse signals</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {saved.map((s) => (
            <SignalCard key={s.id} signal={s} />
          ))}
        </div>
      )}
    </Page>
  );
}

/* ---------------- Notifications ---------------- */
export function Notifications() {
  const [items, setItems] = useState(notifications);
  const unread = items.filter((n) => !n.read).length;
  return (
    <Page
      title="Notifications"
      action={
        unread > 0 ? (
          <button
            className="px-2 text-sm font-semibold text-gold"
            onClick={() => setItems(items.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </button>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<BellIcon size={24} />}
          title="No notifications"
          body="Signal updates and billing alerts will appear here."
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              onClick={() =>
                setItems(
                  items.map((x) => (x.id === n.id ? { ...x, read: true } : x)),
                )
              }
            >
              <Card
                className={`flex gap-3 p-4 ${!n.read ? "border-l-4 border-l-gold" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gold">
                      {n.category}
                    </span>
                    {!n.read && (
                      <span
                        className="h-2 w-2 rounded-full bg-gold"
                        aria-label="Unread"
                      />
                    )}
                  </div>
                  <div className="text-sm font-semibold text-body">
                    {n.title}
                  </div>
                  <div className="text-sm text-muted">{n.body}</div>
                  <div className="mt-1 text-xs text-muted">{n.time}</div>
                </div>
                <span className="self-center text-muted" aria-hidden="true">
                  <ChevronRightIcon size={16} />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Page>
  );
}

/* ---------------- Subscription ---------------- */
export function Subscription() {
  const premium = user.plan === "Premium";
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState("");
  return (
    <Page title="Subscription">
      <Card className="mb-4 p-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-bold">{premium ? "Premium" : "Free"}</h2>
          <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            Active
          </span>
        </div>
        {premium ? (
          <>
            <p className="text-sm text-muted">
              Renews 1 Nov 2026 · ₦5,000/month
            </p>
            <p className="mt-1 text-xs text-muted">
              You can cancel any time; access continues until the paid period
              ends.
            </p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => setConfirm(true)}
            >
              Manage or cancel plan
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              You're on the Free plan. Premium unlocks every signal with full
              level detail.
            </p>
            <Link to="/plans">
              <Button variant="gold" className="mt-4 w-full">
                Upgrade to Premium
              </Button>
            </Link>
          </>
        )}
      </Card>

      <h2 className="mb-3 text-[15px] font-bold">Payment history</h2>
      {premium ? (
        <div className="space-y-2">
          {payments.map((p) => (
            <Card key={p.ref} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold">{p.plan}</div>
                <div className="text-xs text-muted">
                  {p.date} · Ref {p.ref}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{p.amount}</div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                  <CheckIcon size={12} /> {p.status}
                </span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ReceiptIcon size={24} />}
          title="No payments yet"
          body="Your billing history will appear here after you subscribe."
        />
      )}

      <ConfirmModal
        open={confirm}
        danger
        title="Cancel Premium?"
        confirmLabel="Cancel plan"
        body="Your premium access will continue until 1 Nov 2026 and will not renew after that. Are you sure?"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          setToast("Cancellation scheduled — access until 1 Nov 2026");
          setTimeout(() => setToast(""), 2500);
        }}
      />
      <Toast message={toast} />
    </Page>
  );
}

/* ---------------- Profile ---------------- */
export function Profile() {
  const [toast, setToast] = useState("");
  const flash = (m) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };
  return (
    <Page title="Profile">
      <Card className="mb-4 flex items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-lg font-black text-gold">
          AB
        </span>
        <div>
          <div className="text-[15px] font-bold">{user.name}</div>
          <div className="text-sm text-muted">{user.email}</div>
          <Tag tone="gold">{user.plan} member</Tag>
        </div>
      </Card>

      <Card className="mb-4 divide-y divide-line">
        {[
          {
            icon: <MailIcon size={18} />,
            title: "Email verification",
            value: user.emailVerified ? "Verified" : "Pending",
          },
          { icon: <ClockIcon size={18} />, title: "Timezone", value: user.timezone },
          {
            icon: <KeyIcon size={18} />,
            title: "Password & security",
            value: "Change password",
          },
        ].map(({ icon, title, value }) => (
          <button
            key={title}
            onClick={() => flash("Opens in the full release (placeholder).")}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-canvas"
          >
            <span className="text-muted" aria-hidden="true">
              {icon}
            </span>
            <span className="flex-1 text-sm font-semibold">{title}</span>
            <span className="text-xs text-muted">{value}</span>
            <span className="text-muted" aria-hidden="true">
              <ChevronRightIcon size={16} />
            </span>
          </button>
        ))}
      </Card>

      <Card className="mb-4 divide-y divide-line">
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-sm font-semibold">
              Signal update notifications
            </div>
            <div className="text-xs text-muted">
              Alerts when a saved signal changes
            </div>
          </div>
          <Toggle defaultChecked onChange={() => flash("Preference saved")} />
        </div>
        <div className="flex items-center justify-between p-4">
          <div>
            <div className="text-sm font-semibold">New signal alerts</div>
            <div className="text-xs text-muted">
              Matching your selected markets
            </div>
          </div>
          <Toggle onChange={() => flash("Preference saved")} />
        </div>
      </Card>

      <Card className="divide-y divide-line">
        <Link to="/app/history">
          <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold">
            <ClockHistoryIcon size={18} /> Signal history
          </button>
        </Link>
        <Link to="/app/subscription">
          <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold">
            <CardIcon size={18} /> Subscription & billing
          </button>
        </Link>
        <Link to="/legal/risk">
          <button className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold">
            <FileIcon size={18} /> Risk disclosure
          </button>
        </Link>
        <button
          className="flex w-full items-center gap-3 p-4 text-left text-sm font-semibold text-danger"
          onClick={() =>
            flash("Log out confirmed in full release (placeholder).")
          }
        >
          <LogoutIcon size={18} /> Log out
        </button>
      </Card>
      <Toast message={toast} />
    </Page>
  );
}

function Toggle({ defaultChecked, onChange }) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className={`relative h-7 w-12 rounded-full transition-colors ${on ? "bg-gold" : "bg-line"}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

export { Toggle };
