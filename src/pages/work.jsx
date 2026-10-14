import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Page } from "../components/shell";
import {
  Card,
  Button,
  Tag,
  StatusChip,
  DirectionBadge,
  Field,
  Input,
  Select,
  Textarea,
  EmptyState,
  ConfirmModal,
  Toast,
} from "../components/ui";
import { signals, reviewQueue, auditLog, payments, user } from "../lib/data";
import {
  PlusIcon,
  CheckCircleIcon,
  SearchIcon,
  CheckIcon,
  ChevronDownIcon,
} from "../components/icons";

/* ---------------- Analyst / Admin overview ---------------- */
export function WorkOverview({ role }) {
  const stats =
    role === "admin"
      ? [
          ["Users", "—"],
          ["Active subscriptions", "—"],
          ["Published signals", String(signals.length)],
          ["Verified payments", "—"],
        ]
      : [
          ["My drafts", "1"],
          ["Pending review", "1"],
          ["Published", String(signals.length)],
          ["Updated today", "2"],
        ];
  return (
    <Page
      title={role === "admin" ? "Admin overview" : "Analyst overview"}
      role="staff"
    >
      <p className="mb-4 text-sm text-muted">
        {role === "admin"
          ? "Platform activity summary. Real metrics populate from the database — no sample figures are shown here."
          : "Your signal workflow at a glance."}
      </p>
      <div className="mb-6 grid grid-cols-2 gap-3">
        {stats.map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">
              {label}
            </div>
            <div className="text-xl font-extrabold text-body">{value}</div>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <Link to="/work/signals/new">
          <Button variant="gold" className="w-full">
            <span className="flex items-center gap-1">
              <PlusIcon size={16} /> Create Signal
            </span>
          </Button>
        </Link>
        <Link to="/work/queue">
          <Button variant="secondary" className="w-full">
            Review Queue
          </Button>
        </Link>
      </div>

      <h2 className="mb-3 text-[15px] font-bold">Recent signals</h2>
      <div className="space-y-2">
        {signals.slice(0, 3).map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{s.instrument}</span>
                <DirectionBadge direction={s.direction} />
              </div>
              <div className="text-xs text-muted">Updated {s.updated}</div>
            </div>
            <StatusChip status={s.status} />
          </Card>
        ))}
      </div>

      {role === "admin" && (
        <>
          <h2 className="mb-3 mt-6 text-[15px] font-bold">Recent activity</h2>
          <div className="space-y-2">
            {auditLog.slice(0, 3).map((a, i) => (
              <Card key={i} className="p-4">
                <div className="text-sm font-semibold">{a.action}</div>
                <div className="text-xs text-muted">
                  {a.actor} · {a.record} · {a.time}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </Page>
  );
}

/* ---------------- Create / edit signal ---------------- */
export function SignalForm() {
  const nav = useNavigate();
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(false);

  const validate = (f) => {
    const e = {};
    if (!f.get("instrument")) e.instrument = "Instrument is required.";
    if (!f.get("entry")) e.entry = "Entry price or range is required.";
    if (!f.get("stopLoss"))
      e.stopLoss = "Stop loss is required — never publish without risk level.";
    const sl = parseFloat(f.get("stopLoss")),
      en = parseFloat(f.get("entry"));
    if (!isNaN(sl) && !isNaN(en) && sl === en)
      e.stopLoss = "Stop loss cannot equal entry.";
    if (!f.get("rationale"))
      e.rationale = "Provide a short rationale for reviewers.";
    return e;
  };

  const submit = (e, publish = true) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setToast(publish ? "Signal published" : "Draft saved");
      setTimeout(() => nav("/work"), 1200);
    }, 700);
  };

  return (
    <Page title="Create signal" back role="staff">
      <form onSubmit={(e) => submit(e, true)} noValidate className="space-y-4">
        <Field label="Instrument / pair" error={errors.instrument}>
          <Input
            name="instrument"
            placeholder="e.g. EUR/USD"
            error={errors.instrument}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Direction">
            <Select name="direction">
              <option>Buy</option>
              <option>Sell</option>
            </Select>
          </Field>
          <Field label="Timeframe">
            <Select name="timeframe">
              <option>1H</option>
              <option>4H</option>
              <option>12H</option>
              <option>Daily</option>
            </Select>
          </Field>
        </div>
        <Field
          label="Entry price / range"
          hint="Numeric keyboard enabled."
          error={errors.entry}
        >
          <Input
            name="entry"
            inputMode="decimal"
            placeholder="1.0842 – 1.0855"
            error={errors.entry}
          />
        </Field>
        <Field label="Stop loss" error={errors.stopLoss}>
          <Input
            name="stopLoss"
            inputMode="decimal"
            placeholder="1.0798"
            error={errors.stopLoss}
          />
        </Field>
        <Field
          label="Targets"
          hint="Comma-separate multiple targets, in order."
        >
          <Input
            name="targets"
            inputMode="decimal"
            placeholder="1.0910, 1.0950"
          />
        </Field>
        <Field label="Access tier">
          <Select name="tier">
            <option>Free</option>
            <option>Premium</option>
          </Select>
        </Field>
        <Field label="Rationale" error={errors.rationale}>
          <Textarea
            name="rationale"
            placeholder="Why this setup? Note key levels, structure or momentum."
            error={errors.rationale}
          />
        </Field>
        <Field label="Optional expiry">
          <Input name="expiry" type="datetime-local" />
        </Field>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => setConfirm(true)}
            disabled={submitting}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            variant="gold"
            className="flex-1"
            loading={submitting}
          >
            Publish
          </Button>
        </div>
      </form>
      <ConfirmModal
        open={confirm}
        title="Save as draft?"
        body="The signal will be saved without publishing. You can finish and submit it later."
        onClose={() => setConfirm(false)}
        onConfirm={(e) => {
          setConfirm(false);
          submit(
            {
              preventDefault: () => {},
              target: document.querySelector("form"),
            },
            false,
          );
        }}
      />
      <Toast message={toast} />
    </Page>
  );
}

/* ---------------- Review queue ---------------- */
export function ReviewQueue() {
  const [items, setItems] = useState(reviewQueue);
  const [toast, setToast] = useState("");
  const act = (id, action) => {
    setItems(items.filter((i) => i.id !== id));
    setToast(`Signal ${action}`);
    setTimeout(() => setToast(""), 1800);
  };
  return (
    <Page title="Review queue" role="staff">
      {items.length === 0 ? (
        <EmptyState
          icon={<CheckCircleIcon size={24} />}
          title="Queue is clear"
          body="No signals are waiting for review right now."
        />
      ) : (
        <div className="space-y-3">
          {items.map((i) => (
            <Card key={i.id} className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{i.instrument}</span>
                  <DirectionBadge direction={i.direction} />
                </div>
                <Tag tone="warn">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {i.status}
                  </span>
                </Tag>
              </div>
              <div className="mb-3 text-xs text-muted">
                By {i.analyst} · Submitted {i.submitted}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => act(i.id, "returned for changes")}
                >
                  Request changes
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => act(i.id, "rejected")}
                >
                  Reject
                </Button>
                <Button
                  variant="gold"
                  className="flex-1"
                  onClick={() => act(i.id, "approved")}
                >
                  Approve
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Toast message={toast} />
    </Page>
  );
}

/* ---------------- Signal management ---------------- */
export function SignalManagement() {
  const [q, setQ] = useState("");
  const list = signals.filter((s) =>
    s.instrument.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Page title="Signal management" role="staff">
      <Input
        placeholder="Search instrument…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search signals"
        className="mb-3"
      />
      {list.length === 0 ? (
        <EmptyState
          icon={<SearchIcon size={24} />}
          title="No results"
          body={`No signals match “${q}”.`}
        />
      ) : (
        <div className="space-y-2">
          {list.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{s.instrument}</span>
                    <DirectionBadge direction={s.direction} />
                    <Tag tone={s.tier === "Premium" ? "gold" : "muted"}>
                      {s.tier}
                    </Tag>
                  </div>
                  <div className="mt-0.5 text-xs text-muted">
                    Updated {s.updated}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusChip status={s.status} />
                  <button className="flex items-center gap-1 text-xs font-semibold text-gold">
                    Actions <ChevronDownIcon size={12} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}

/* ---------------- Users ---------------- */
export function UserManagement() {
  const people = [
    ["Ade Balogun", "ade@example.com", "Member", "Free · Active", "Active"],
    ["T. Adeyemi", "tayo@cegnal.io", "Analyst", "Staff", "Active"],
    ["K. Musa", "khadija@cegnal.io", "Admin", "Staff", "Active"],
    [
      "R. Okoro",
      "ronke@example.com",
      "Member",
      "Premium · Expiring 1 Nov",
      "Active",
    ],
    ["J. Bello", "jide@example.com", "Member", "Free · Active", "Suspended"],
  ];
  const [q, setQ] = useState("");
  const list = people.filter((p) =>
    (p[0] + p[1]).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Page title="User management" role="staff">
      <Input
        placeholder="Search name or email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search users"
        className="mb-3"
      />
      <div className="space-y-2">
        {list.map((p) => (
          <Card key={p[1]} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{p[0]}</div>
                <div className="text-xs text-muted">{p[1]}</div>
              </div>
              <Tag tone={p[4] === "Active" ? "success" : "danger"}>{p[4]}</Tag>
            </div>
            <div className="mt-2 flex gap-2 text-[11px] font-semibold">
              <Tag tone="muted">{p[2]}</Tag>
              <Tag tone="muted">{p[3]}</Tag>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <EmptyState
            icon={<SearchIcon size={24} />}
            title="No users found"
            body={`Nothing matches “${q}”.`}
          />
        )}
      </div>
    </Page>
  );
}

/* ---------------- Plans admin ---------------- */
export function PlansAdmin() {
  return (
    <Page title="Plans & subscriptions" role="staff">
      <h2 className="mb-3 text-[15px] font-bold">Plan configuration</h2>
      <div className="mb-6 space-y-3">
        {[
          ["Free", "₦0 · Basic access"],
          ["Premium — Monthly", "₦5,000 · Full access (pre-launch pricing)"],
        ].map(([n, d]) => (
          <Card key={n} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">{n}</div>
                <div className="text-xs text-muted">{d}</div>
              </div>
              <Button variant="secondary">Edit</Button>
            </div>
          </Card>
        ))}
      </div>
      <h2 className="mb-3 text-[15px] font-bold">Recent payments</h2>
      <div className="space-y-2">
        {payments.map((p) => (
          <Card key={p.ref} className="flex items-center justify-between p-4">
            <div>
              <div className="text-sm font-semibold">{p.plan}</div>
              <div className="text-xs text-muted">
                {p.date} · {p.ref}
              </div>
            </div>
            <div className="text-sm font-bold">
              {p.amount}{" "}
              <span className="flex items-center gap-1 text-[11px] font-semibold text-success">
                <CheckIcon size={12} /> {p.status}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}

/* ---------------- Audit log ---------------- */
export function AuditLog() {
  return (
    <Page title="Activity log" role="staff">
      <ol className="space-y-3 border-l-2 border-line pl-4">
        {auditLog.map((a, i) => (
          <li key={i} className="relative">
            <span
              className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold"
              aria-hidden="true"
            />
            <Card className="p-4">
              <div className="text-sm font-semibold">{a.action}</div>
              <div className="text-xs text-muted">
                {a.actor} · {a.time}
              </div>
              <div className="mt-1 text-xs font-semibold text-gold">
                {a.record}
              </div>
            </Card>
          </li>
        ))}
      </ol>
    </Page>
  );
}
