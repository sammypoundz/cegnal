import React from "react";
import { STATUS } from "../lib/data";
import {
  WarningIcon,
  LockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "./icons";

/* ---------- Buttons ---------- */
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-4 min-h-[44px] text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none";

export function Button({
  variant = "primary",
  className = "",
  loading,
  children,
  ...props
}) {
  const variants = {
    primary: "bg-ink text-surface hover:brightness-125 active:brightness-90",
    gold: "bg-gold text-ink hover:brightness-105 active:brightness-95",
    secondary: "border border-line bg-surface text-body hover:bg-canvas",
    text: "text-gold hover:underline px-1 min-h-[44px]",
    danger: "bg-danger text-white hover:brightness-105",
  };
  return (
    <button
      className={`${btnBase} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function Spinner({
  className = "w-4 h-4 border-2 border-current border-t-transparent",
}) {
  return (
    <span
      className={`inline-block animate-spin rounded-full ${className}`}
      aria-hidden="true"
    />
  );
}

/* ---------- Inputs ---------- */
export function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-body">
        {label}
      </span>
      {children}
      {hint && !error && (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      )}
      {error && (
        <span className="mt-1 block text-xs font-medium text-danger">
          {error}
        </span>
      )}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-line bg-surface px-3.5 min-h-[44px] text-[15px] text-body placeholder:text-muted focus:border-gold focus:outline-none";

export function Input(props) {
  return (
    <input
      className={`${inputCls} ${props.error ? "border-danger" : ""}`}
      {...props}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select className={inputCls} {...props}>
      {children}
    </select>
  );
}

export function Textarea(props) {
  return <textarea className={`${inputCls} min-h-[110px] py-2.5`} {...props} />;
}

/* ---------- Chips & status ---------- */
const toneCls = {
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warn: "bg-warn-soft text-warn",
  gold: "bg-gold-soft text-gold",
  muted: "bg-canvas text-muted border border-line",
  ink: "bg-ink text-surface",
};

export function StatusChip({ status }) {
  const s = STATUS[status] || { label: status, tone: "muted" };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${toneCls[s.tone]}`}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 rounded-full bg-current"
      />{" "}
      {s.label}
    </span>
  );
}

export function Tag({ children, tone = "ink" }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${toneCls[tone]}`}
    >
      {children}
    </span>
  );
}

export function DirectionBadge({ direction }) {
  const buy = direction === "Buy";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${buy ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}
    >
      {buy ? <ArrowUpIcon size={11} /> : <ArrowDownIcon size={11} />}
      {direction}
    </span>
  );
}

/* ---------- Cards & layout ---------- */
export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`rounded-card border border-line bg-surface ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-[15px] font-bold text-body">{children}</h2>
      {action}
    </div>
  );
}

export function LevelRow({ label, value, tone = "default" }) {
  const colors = {
    default: "text-body",
    success: "text-success",
    danger: "text-danger",
    gold: "text-gold",
  };
  return (
    <div className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className={`text-sm font-bold ${colors[tone]}`}>{value}</span>
    </div>
  );
}

/* ---------- Feedback ---------- */
export function EmptyState({ icon = null, title, body, action }) {
  return (
    <div className="flex flex-col items-center rounded-card border border-dashed border-line bg-surface px-6 py-10 text-center">
      {icon && (
        <span
          className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-canvas text-muted"
          aria-hidden="true"
        >
          {React.isValidElement(icon) ? icon : null}
        </span>
      )}
      <h3 className="mb-1 text-sm font-bold text-body">{title}</h3>
      <p className="mb-4 max-w-[280px] text-sm text-muted">{body}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body = "We could not load this content. Check your connection and try again.",
  onRetry,
}) {
  return (
    <Card className="p-6 text-center">
      <div
        className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger"
        aria-hidden="true"
      >
        <WarningIcon size={24} />
      </div>
      <h3 className="mb-1 text-sm font-bold text-danger">{title}</h3>
      <p className="mb-4 text-sm text-muted">{body}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </Card>
  );
}

export function SkeletonCard() {
  return (
    <Card className="p-4">
      <div className="skeleton mb-3 h-4 w-1/3 rounded" />
      <div className="skeleton mb-2 h-3 w-2/3 rounded" />
      <div className="skeleton h-3 w-1/2 rounded" />
    </Card>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4"
    >
      <div className="rounded-xl bg-ink px-4 py-2.5 text-sm font-medium text-surface shadow-lg">
        {message}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
  danger,
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="safe-bottom w-full max-w-md rounded-t-2xl bg-surface p-5 md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1.5 text-base font-bold text-body">{title}</h3>
        <p className="mb-5 text-sm text-muted">{body}</p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={danger ? "danger" : "gold"}
            className="flex-1"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Lock panel ---------- */
export function LockedPanel({ onUpgrade }) {
  return (
    <Card className="relative overflow-hidden p-5">
      <div
        className="absolute right-0 top-0 h-full w-1.5 bg-gold"
        aria-hidden="true"
      />
      <div className="mb-2 flex items-center gap-2">
        <span className="text-gold" aria-hidden="true">
          <LockIcon size={18} />
        </span>
        <span className="text-sm font-bold text-body">Premium signal</span>
        <Tag tone="gold">Premium</Tag>
      </div>
      <p className="mb-4 text-sm text-muted">
        Full entry, stop-loss and target details for this signal are available
        on a paid plan. Free members can view the summary and open the full
        detail after subscribing.
      </p>
      <Button variant="gold" onClick={onUpgrade} className="w-full">
        View plan options
      </Button>
    </Card>
  );
}
