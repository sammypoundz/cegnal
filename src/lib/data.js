/* Display metadata for signal statuses. All real data (signals, users,
   notifications, payments, plans, FAQs…) is served from the database via
   src/lib/api.js — nothing is hardcoded here. */

export const STATUS = {
  active: { label: "Active", tone: "success" },
  "target-reached": { label: "Target Reached", tone: "success" },
  "stop-loss": { label: "Stop Loss Reached", tone: "danger" },
  closed: { label: "Closed", tone: "muted" },
  cancelled: { label: "Cancelled", tone: "warn" },
  expired: { label: "Expired", tone: "muted" },
};
