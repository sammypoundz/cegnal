/* Zone API layer — every piece of zone data comes from the backend database.
   No bundled sample fallbacks: if the API has no data the UI shows empty
   states instead of fake records. */
import { useEffect, useState } from "react";
import { api, setToken } from "./api.js";

/* GET hook: returns { data, live, loading, error } */
export function useZoneApi(path, { deps = [] } = {}) {
  const [state, setState] = useState({
    data: null,
    live: false,
    loading: true,
    error: "",
  });

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setState({ data: null, live: false, loading: false, error: "" });
      return;
    }
    (async () => {
      try {
        const data = await api(path);
        if (!cancelled)
          setState({ data, live: true, loading: false, error: "" });
      } catch (err) {
        if (!cancelled)
          setState({
            data: null,
            live: false,
            loading: false,
            error: err.message,
          });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls re-fetch via deps
  }, [path, ...deps]);

  return state;
}

/* Directory of zone traders. `refetch` re-pulls from the DB. */
export function useZoneTraders() {
  const [nonce, setNonce] = useState(0);
  const { data, live, loading } = useZoneApi("/zone/traders", {
    deps: [nonce],
  });
  return {
    traders: live ? data?.traders || [] : [],
    live,
    loading,
    refetch: () => setNonce((n) => n + 1),
  };
}

/* Zones the current user has joined. */
/* Renewal countdown between a date and now, e.g. "Renews in 12d 4h". */
export function renewalCountdown(renewsAt) {
  if (!renewsAt) return null;
  const ms = new Date(renewsAt).getTime() - Date.now();
  if (ms <= 0) return "Renewal due";
  const totalHours = Math.floor(ms / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days >= 1) return `${days}d ${hours}h`;
  if (totalHours >= 1) return `${totalHours}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
  return `${Math.floor(ms / 60_000)}m`;
}

export function useZoneSubscriptions() {
  const { data, live, loading, error, refetchKey } = useZoneApi(
    "/zone/me/subscriptions",
  );
  const subs = live ? data?.subscriptions || [] : [];
  const joined = subs.map((s) => ({
    traderId: s.trader.handle,
    joinedAt: `Joined ${new Date(s.joinedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`,
    renews: s.renewsAt
      ? `Renews ${new Date(s.renewsAt).toLocaleDateString("en-GB")}`
      : "Active",
    renewsAt: s.renewsAt || null,
    countdown: renewalCountdown(s.renewsAt),
    status: s.status || "active",
    liveSignals: s.liveSignals ?? 0,
  }));
  return { subscriptions: subs, joined, live, loading, error, refetchKey };
}

/* Zone signals for one trader's room: live signal + closed history.
   `refresh` re-fetches from the DB after a mutation. */
export function useZoneSignals(handle) {
  const [nonce, setNonce] = useState(0);
  const { data, live, loading } = useZoneApi(
    handle ? `/zone/${handle}/signals` : null,
    { deps: [nonce] },
  );
  const refresh = () => setNonce((n) => n + 1);
  const all = live ? (data?.signals || []).map(serializeSignal) : [];

  /* status is the display label ("Live", "Target hit", …) from the API. */
  const liveSignal = all.find((s) => s.status === "Live") || null;
  const history = all.filter((s) => s.status !== "Live");

  return { liveSignal, history, all, live, loading, refresh };
}

/* Members of a zone (from the backend subscription list). */
export function useZoneMembers(handle) {
  const { data, live, loading } = useZoneApi(
    handle ? `/zone/${handle}/members` : null,
  );
  return { members: live ? data?.members || [] : [], live, loading };
}

/* Presence heartbeat: while mounted, keeps the signed-in user marked as
   "online" in the DB (server window: last 2 minutes) and refreshes the
   member list periodically so other members' status stays current. */
export function usePresence(handle) {
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!handle) return;
    const beat = () => {
      api("/zone/heartbeat", { method: "POST" }).catch(() => {});
    };
    beat();
    const beatTimer = setInterval(beat, 60_000); // every minute
    const refreshTimer = setInterval(() => setNonce((n) => n + 1), 90_000);
    return () => {
      clearInterval(beatTimer);
      clearInterval(refreshTimer);
    };
  }, [handle]);
  const { data, live, loading } = useZoneApi(
    handle ? `/zone/${handle}/members` : null,
    { deps: [nonce] },
  );
  return { members: live ? data?.members || [] : [], live, loading };
}

/* Toggle "I took this signal" — persisted per user per signal in the DB.
   Returns { took, takersCount } from the server. */
export async function toggleSignalTake(signalId, took) {
  return api(`/zone/signals/${signalId}/take`, {
    method: "POST",
    body: { took },
  });
}

/* The zone notifications feed (member side). */
export function useZoneNotifications() {
  const { data, live, loading } = useZoneApi("/notifications");
  if (!live) return { notifications: [], live, loading };
  return {
    notifications: (data?.notifications || []).map((n) => ({
      id: n.id,
      read: n.read,
      category:
        n.category === "new_signal"
          ? "New signal"
          : n.category === "billing"
            ? "Payment"
            : n.category === "signal_update"
              ? "Trader update"
              : "Account",
      title: n.title,
      body: n.body,
      time: new Date(n.createdAt).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    })),
    live,
    loading,
  };
}

/* Live mutations */
export async function subscribeToZone(handle) {
  return api("/zone/subscribe", { method: "POST", body: { handle } });
}

export async function unsubscribeFromZone(handle) {
  return api(`/zone/subscribe/${handle}`, { method: "DELETE" });
}

export async function postZoneSignal(handle, draft) {
  return api(`/zone/${handle}/signals`, {
    method: "POST",
    body: {
      pair: draft.pair,
      direction: draft.direction === "Sell" ? "sell" : "buy",
      entry: draft.entry,
      stopLoss: draft.stopLoss,
      targets: draft.targets,
      rr: draft.rr,
      timeframe: draft.timeframe,
      note: draft.note || "",
    },
  });
}

/* Analyst updates zone settings (name, fees, status) — persisted server-side. */
export async function updateZone(handle, patch) {
  return api(`/zone/${handle}`, { method: "PATCH", body: patch });
}

/* Mock-KYC completion: registers the user as a verified analyst in the DB
   and provisions their own zone. Returns { token, user, zone } — the fresh
   token carries the upgraded analyst role. */
export async function completeKyc(profile) {
  const res = await api("/zone/kyc", { method: "POST", body: profile });
  if (res.token) setToken(res.token);
  return res;
}

/* The signed-in user's analyst state + owned zone from the DB. */
export function useMyZone() {
  const [nonce, setNonce] = useState(0);
  const { data, live, loading } = useZoneApi("/zone/me/zone", {
    deps: [nonce],
  });
  return {
    kycVerified: live ? Boolean(data?.kycVerified) : false,
    role: data?.role || null,
    zone: live ? data?.zone || null : null,
    live,
    loading,
    refetch: () => setNonce((n) => n + 1),
  };
}

/* Member ratings for a zone + the caller's own rating (if any). */
export function useZoneRatings(handle) {
  const [nonce, setNonce] = useState(0);
  const { data, live, loading } = useZoneApi(
    handle ? `/zone/${handle}/ratings` : null,
    { deps: [nonce] },
  );
  return {
    rating: live ? data?.rating : null,
    reviewCount: live ? data?.reviewCount : null,
    myRating: live ? data?.myRating || null : null,
    isOwner: Boolean(data?.isOwner),
    ratings: live ? data?.ratings || [] : [],
    loading,
    refresh: () => setNonce((n) => n + 1),
  };
}

/* Submit or update a star rating for a zone. Returns the recomputed average. */
export async function rateZone(handle, stars, comment = "") {
  return api(`/zone/${handle}/rate`, {
    method: "POST",
    body: { stars, comment },
  });
}

/* The zone owner's subscription earnings ledger + summary. */
export function useZoneEarnings() {
  const [nonce, setNonce] = useState(0);
  const { data, live, loading } = useZoneApi("/zone/me/earnings", {
    deps: [nonce],
  });
  return {
    zone: live ? data?.zone || null : null,
    summary: live ? data?.summary || null : null,
    earnings: live ? data?.earnings || [] : [],
    live,
    loading,
    refetch: () => setNonce((n) => n + 1),
  };
}

/* Request a withdrawal of the zone owner's available balance. */
export async function withdrawEarnings(amount, bankName, accountNumber) {
  return api("/zone/me/withdraw", {
    method: "POST",
    body: { amount, bankName, accountNumber },
  });
}

/* Promote (sponsor) or unpromote a zone for boosted directory placement. */
export async function promoteZone(handle, promote = true) {
  return api(`/zone/${handle}/promote`, {
    method: "POST",
    body: { promote },
  });
}

function serializeSignal(s) {
  return {
    id: s.id,
    pair: s.pair,
    direction: s.direction,
    status: s.statusLabel,
    entry: s.entry,
    stopLoss: s.stopLoss,
    targets: s.targets,
    rr: s.rr,
    timeframe: s.timeframe,
    note: s.note,
    result: s.result,
    outcome: s.outcome,
    postedAt: s.postedLabel,
    progressPct: s.progressPct ?? 0,
    takersCount: s.takersCount ?? 0,
    myTake: Boolean(s.myTake),
  };
}
