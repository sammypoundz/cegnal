import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  StatusChip,
  DirectionBadge,
  Tag,
  Button,
  LockedPanel,
} from "./ui";
import { risks } from "../lib/data";
import { HeartIcon, ClockIcon } from "./icons";

export function SignalCard({ signal, isPremiumUser = true, saved, onSave }) {
  const locked = signal.tier === "Premium" && !isPremiumUser;
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-body">
            {signal.instrument}
          </h3>
          <DirectionBadge direction={signal.direction} />
        </div>
        <StatusChip status={signal.status} />
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="flex items-center gap-1">
          <ClockIcon size={12} /> {signal.timeframe}
        </span>
        <span>· {signal.updated || signal.published}</span>
        <Tag tone={signal.tier === "Premium" ? "gold" : "muted"}>
          {signal.tier}
        </Tag>
        {saved && (
          <span className="flex items-center gap-1 text-gold">
            <HeartIcon size={12} filled /> Saved
          </span>
        )}
      </div>
      <div className="mb-3 grid grid-cols-3 gap-2 rounded-xl bg-canvas p-3 text-center">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Entry
          </div>
          <div className="truncate text-[13px] font-bold text-body">
            {locked ? "••••" : signal.entry}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Stop loss
          </div>
          <div className="text-[13px] font-bold text-danger">
            {locked ? "••••" : signal.stopLoss}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            Targets
          </div>
          <div className="truncate text-[13px] font-bold text-success">
            {locked ? "••••" : signal.targets.join(" / ")}
          </div>
        </div>
      </div>
      {locked ? (
        <LockedPanel onUpgrade={() => (window.location.hash = "#upgrade")} />
      ) : (
        <div className="flex gap-2">
          <Link to={`/app/signals/${signal.id}`} className="flex-1">
            <Button className="w-full">View details</Button>
          </Link>
          <Button
            variant="secondary"
            aria-pressed={saved}
            onClick={() => onSave?.(signal.id)}
            aria-label={saved ? "Remove from saved" : "Save signal"}
            className="px-4"
          >
            {saved ? <HeartIcon size={18} filled /> : <HeartIcon size={18} />}
          </Button>
        </div>
      )}
    </Card>
  );
}

export function RiskDisclaimer({ className = "" }) {
  return (
    <p
      className={`rounded-xl bg-canvas p-3 text-[11px] leading-relaxed text-muted border border-line ${className}`}
    >
      <strong className="text-body">Risk notice:</strong> {risks}
    </p>
  );
}
