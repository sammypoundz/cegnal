import React, { useEffect, useState } from "react";

/* Zone-style loading placeholders (shimmer via .skeleton utility). */
function ZoneSkeletonCard() {
  return (
    <div className="z-card flex items-center gap-3 p-3" aria-hidden="true">
      <div className="skeleton h-11 w-11 shrink-0 rounded-full" />
      <div className="flex-1">
        <div className="skeleton mb-2 h-3.5 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
function ZoneSkeletonList({ count = 3 }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <ZoneSkeletonCard key={i} />
      ))}
    </div>
  );
}
import {
  Link,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import {
  ZoneHeader,
  ZoneBottomNav,
  CategoryTabs,
  SubscriptionCard,
  TopTraders,
  SignalZoneCard,
  ZoneAvatar,
  ZoneStars,
  ZoneButton,
  CatalogGrid,
} from "../components/zone";
import ZoneHeroSlider from "../components/ZoneHeroSlider";
import {
  useZoneTraders,
  useZoneSubscriptions,
  useZoneSignals,
  useZoneNotifications,
  usePresence,
  useZoneRatings,
  rateZone,
  useZoneEarnings,
  promoteZone,
  toggleSignalTake,
  postZoneSignal,
  updateZone,
  completeKyc,
  useMyZone,
} from "../lib/zoneApi";
import { CheckIcon, ChevronRightIcon, ArrowUpIcon as UpIcon, ArrowDownIcon as DownIcon, ClockHistoryIcon, UserIcon, CloseIcon, PlusIcon, StarIcon as StarIc, EditIcon } from "../components/icons";
import { getTheme, toggleTheme } from "../lib/theme";
import { useAuth } from "../lib/auth.jsx";
import { api, payWithPaystack } from "../lib/api";

function ZoneShell({ children, _tabs = false, _onTab }) {
  return (
    <div className="min-h-dvh z-page">
      <div className="app-max">
        {children}
        <div className="h-20" />
        <ZoneBottomNav />
      </div>
    </div>
  );
}

/* ---------------- Main tabbed screen ---------------- */

export function ZoneApp() {
  const [params, setParams] = useSearchParams();
  const tabParam = params.get("tab");
  const [tab, setTab] = useState(
    tabParam === "zones" ? "Zones" : tabParam === "top" ? "Top-rated" : "All",
  );
  const { traders, loading } = useZoneTraders();
  const { joined, live: joinedLive } = useZoneSubscriptions();

  useEffect(() => {
    if (tabParam === "zones") setTab("Zones");
    else if (tabParam === "top") setTab("Top-rated");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- syncing tab with URL param is the external system here
  }, [tabParam]);

  const changeTab = (t) => {
    setTab(t);
    const map = { Zones: "zones", "Top-rated": "top" };
    if (map[t]) setParams({ tab: map[t] }, { replace: true });
    else setParams({}, { replace: true });
  };

  return (
    <ZoneShell>
      <ZoneHeader />
      {tab === "All" && <ZoneHeroSlider />}
      <div className="pt-3">
        <CategoryTabs active={tab} onChange={changeTab} />
      </div>
      <main className="px-3 pt-4">
        {loading ? (
          <ZoneSkeletonList count={4} />
        ) : (
        <>
        {tab === "All" && (
          <div className="space-y-5">
            {/* Zones joined */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-[17px] font-semibold text-z-ink">
                  My Zones
                </h2>
                <Link
                  to="/zone/subscriptions"
                  className="text-[13px] font-semibold text-z-blue"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {(joinedLive ? joined : joined.map((j) => ({ ...j, trader: traders.find((t) => t.id === j.traderId) || traders[0] }))).map(({ traderId, trader, joinedAt, renews, liveSignals }) => {
                  const t = trader || traders.find((x) => x.id === traderId) || traders[0];
                  if (!t) return null;
                  return (
                    <Link
                      key={traderId}
                      to={`/zone/room/${t.id}`}
                      className="z-card flex items-center gap-3 p-3"
                    >
                      <div className="relative">
                        <ZoneAvatar name={t.name} size={44} ring />
                        <span
                          aria-hidden="true"
                          className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-success ring-2 ring-white"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[15px] font-semibold text-z-ink">
                            {t.name}
                          </span>
                          {liveSignals > 0 && (
                            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="text-[12px] text-z-mute">
                          {joinedAt} · {renews}
                        </div>
                      </div>
                      <ChevronRightIcon size={18} />
                    </Link>
                  );
                })}
                {joined.length === 0 && (
                  <div className="z-card p-5 text-center">
                    <p className="text-[14px] font-semibold text-z-ink">
                      You haven't joined any zones yet
                    </p>
                    <p className="mt-1 text-[13px] text-z-mute">
                      Browse signal zones and subscribe to enter a trader's
                      zone.
                    </p>
                    <Link to="/zone?tab=zones" className="mt-3 block">
                      <ZoneButton variant="charcoal" className="w-full">
                        Explore zones
                      </ZoneButton>
                    </Link>
                  </div>
                )}
              </div>
            </section>
            <SubscriptionCard />
            <TopTraders traders={traders.slice(0, 4)} />
          </div>
        )}
        {tab === "Zones" && (
          <div>
            <h2 className="mb-3 text-[18px] font-semibold text-z-ink">
              Signal Zones
            </h2>
            <div className="space-y-4">
              {traders.map((t) => (
                <SignalZoneCard key={t.id} zone={t} />
              ))}
            </div>
          </div>
        )}
        {tab === "Top-rated" && (
          <div>
            <h2 className="mb-3 text-[18px] font-semibold text-z-ink">
              Top Rated Traders
            </h2>
            <div className="space-y-3">
              {[...traders]
                .sort((a, b) => b.rating - a.rating)
                .map((t, i) => (
                  <Link
                    key={t.id}
                    to={`/zone/trader/${t.id}`}
                    className="z-card flex items-center gap-3 p-3"
                  >
                    <span className="w-5 text-center text-[15px] font-bold text-z-mute">
                      {i + 1}
                    </span>
                    <ZoneAvatar name={t.name} size={44} />
                    <div className="min-w-0">
                      <div className="truncate text-[15px] font-semibold text-z-ink">
                        {t.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[12px] text-z-mute">
                        <ZoneStars rating={t.rating} size={11} /> {t.rating} ·{" "}
                        {t.reviewCount} reviews
                      </div>
                    </div>
                    <span className="ml-auto text-[14px] font-bold text-z-blue">
                      {t.fee}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </ZoneShell>
  );
}

/* ---------------- Full trader directory ---------------- */

export function ZoneTradersPage() {
  const { traders, loading } = useZoneTraders();
  return (
    <ZoneShell>
      <ZoneHeader title="All Traders" back />
      <main className="px-3 pt-4">
        {loading ? (
          <ZoneSkeletonList count={4} />
        ) : (
          <div className="space-y-3">
            {traders.map((t) => (
              <SignalZoneCard key={t.id} zone={t} />
            ))}
          </div>
        )}
      </main>
    </ZoneShell>
  );
}

/* ---------------- Trader profile / zone details ---------------- */

export function ZoneTraderProfile() {
  const { traderId } = useParams();
  const navigate = useNavigate();
  const { traders, loading } = useZoneTraders();
  const { joined } = useZoneSubscriptions();
  const trader = traders.find((t) => t.id === traderId) || traders[0];
  const [preview, setPreview] = useState(null);
  const subscription = joined.find((j) => j.traderId === (trader?.id || ""));

  if (loading) {
    return (
      <div className="min-h-dvh z-page">
        <div className="app-max">
          <ZoneHeader title="Zones" back />
          <div className="px-3 pt-4">
            <ZoneSkeletonList count={3} />
          </div>
        </div>
      </div>
    );
  }

  if (!trader) {
    return (
      <div className="min-h-dvh z-page">
        <div className="app-max">
          <ZoneHeader title="Zones" back />
          <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[15px] font-semibold text-z-ink">
              Zone not found
            </p>
            <p className="text-[13px] text-z-mute">
              This trader zone may have been removed or is unavailable.
            </p>
            <ZoneButton onClick={() => navigate("/zone")}>Back to Zones</ZoneButton>
          </main>
        </div>
      </div>
    );
  }

  const infoRows = [
    ["Status", trader.status],
    ["Win Rate", trader.winRate],
    ["Loss Rate", trader.lossRate],
    ["Ratings", `${trader.rating}/5`],
    ["Market Type", trader.marketType],
  ];

  return (
    <div className="min-h-dvh z-page">
      <div className="app-max">
        <ZoneHeader title="Zones" back />
        <main className="pb-32">
          {/* profile header */}
          <section className="flex flex-col items-center z-surface px-4 pb-5 pt-4">
            <ZoneAvatar name={trader.name} size={88} ring />
            <h1 className="mt-3 text-[22px] font-bold text-z-ink">
              {trader.displayName}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-[13px] text-z-mute">
              <ZoneStars rating={trader.rating} size={13} />
              {trader.rating} · {trader.reviewCount} Reviews
            </div>
            <p className="mt-2 text-center text-[13px] leading-relaxed text-z-mute">
              {trader.bio}
            </p>
          </section>

          {/* info rows */}
          <section className="z-card mx-3 mt-3 px-4 py-2">
            {infoRows.map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-z-line py-3.5 last:border-0"
              >
                <span className="text-[14px] text-z-mute">{label}</span>
                <span className="text-[14px] font-semibold text-z-ink">
                  {value}
                </span>
              </div>
            ))}
          </section>

          {/* catalogs */}
          <section className="mt-3 px-3">
            <CatalogGrid trader={trader} onOpen={setPreview} />
          </section>
        </main>

        {/* fixed subscribe action */}
        <div className="safe-bottom app-fixed fixed inset-x-0 bottom-0 z-40 border-t border-z-line z-surface px-4 py-3">
          <div className="mx-auto w-full max-w-[480px]">
            {subscription ? (
              <div className="flex items-center gap-2 rounded-xl bg-success-soft px-4 py-3">
                <span className="text-[13px] font-semibold text-success">
                  {subscription.countdown === "Renewal due"
                    ? "Renewal due — tap to resubscribe"
                    : `Subscribed · renews in ${subscription.countdown}`}
                </span>
                <ZoneButton
                  className="ml-auto min-h-[36px] px-3 text-[13px]"
                  variant="outline"
                  onClick={() => navigate(`/zone/room/${trader.id}`)}
                >
                  Enter zone
                </ZoneButton>
              </div>
            ) : (
              <ZoneButton
                className="w-full"
                onClick={() =>
                  navigate(`/zone/checkout?trader=${encodeURIComponent(trader.id)}`)
                }
              >
                Subscribe Now · {trader.fee}
              </ZoneButton>
            )}
          </div>
        </div>

        {/* catalog preview */}
        {preview && (
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
            onClick={() => setPreview(null)}
            role="dialog"
            aria-modal="true"
            aria-label={preview.label}
          >
            <div
              className="w-full overflow-hidden rounded-t-3xl sm:max-w-sm sm:rounded-3xl"
              style={{ background: preview.bg }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col p-5">
                <div className="mb-4 flex items-start justify-between">
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25"
                  >
                    {preview.Icon ? <preview.Icon size={24} /> : null}
                  </span>
                  <button
                    onClick={() => setPreview(null)}
                    aria-label="Close preview"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white"
                  >
                    <CloseIcon size={14} />
                  </button>
                </div>
                <span className="text-[19px] font-bold text-white">
                  {preview.label}
                </span>
                <span className="mt-1 text-[13px] text-white/75">
                  {preview.desc}
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <CheckIcon size={11} /> {preview.count}
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">
                    Included in access
                  </span>
                </div>
                <button
                  onClick={() => setPreview(null)}
                  className="mt-5 min-h-[46px] w-full rounded-xl bg-white text-[14px] font-bold text-[#0b0b0b] transition-transform active:scale-[0.98]"
                >
                  Open {preview.label}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Zone room (inside a joined zone) ---------------- */

const memberStatusColors = {
  win: "bg-success-soft text-success",
  loss: "bg-danger-soft text-danger",
  be: "bg-z-gray text-z-mute",
};

export function ZoneRoom() {
  const { traderId } = useParams();
  const { traders, loading: tradersLoading } = useZoneTraders();
  const trader = traders.find((t) => t.id === traderId) || traders[0];
  const { liveSignal: live, history: zoneSignalHistory, loading: signalsLoading } = useZoneSignals(traderId);
  const { members: zoneMembers, loading: membersLoading } = usePresence(traderId);
  const [tab, setTab] = useState("signal"); // signal | history | members
  const [tookOverride, setTookOverride] = useState(null); // null = use server value
  const [takersDelta, setTakersDelta] = useState(0);
  const [takers, setTakers] = useState(null);
  // Derive from server data (persists across reloads); local override applies
  // immediately after a click while the mutation is in flight.
  const tookSignal = tookOverride ?? Boolean(live?.myTake);
  // Optimistic count: server value if we have one, else base + local delta
  // from clicks made while the mutation is in flight.
  const takersCount =
    takers ??
    (live?.takersCount || 0) + takersDelta + (tookOverride == null ? 0 : tookOverride ? 1 : -1);
  const onlineCount = (zoneMembers || []).filter((m) => m.online).length;
  const memberCount = (zoneMembers || []).length || 1;

  const tabs = [
    { id: "signal", label: "Live Signal" },
    { id: "history", label: "History" },
    { id: "members", label: `Members (${(zoneMembers || []).length})` },
  ];

  return (
    <div className="min-h-dvh z-page">
      <div className="app-max">
        <ZoneHeader title={trader?.displayName || "Zone"} back />

        {tradersLoading ? (
          <div className="px-3 pt-4">
            <ZoneSkeletonList count={2} />
          </div>
        ) : !trader ? (
          <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[15px] font-semibold text-z-ink">Zone not found</p>
            <p className="text-[13px] text-z-mute">
              This trader zone may have been removed or is unavailable.
            </p>
            <ZoneButton onClick={() => navigate("/zone")}>Back to Zones</ZoneButton>
          </main>
        ) : (
        <>

        {/* room banner */}
        <section className="z-surface px-4 pb-4 pt-3">
          <div className="flex items-center gap-3">
            <ZoneAvatar name={trader.name} size={52} ring />
            <div className="min-w-0">
              <h2 className="truncate text-[16px] font-bold text-z-ink">
                {trader.displayName} · Zone
              </h2>
              <p className="text-[12px] text-z-mute">
                {trader.marketType} · {trader.winRate} win rate
              </p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[11px] font-bold text-success">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Joined
            </span>
          </div>

          {/* room tab switcher */}
          <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl bg-z-gray p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? "true" : undefined}
                className={`min-h-[38px] rounded-lg text-[13px] font-semibold transition ${
                  tab === t.id
                    ? "z-surface text-z-ink shadow-sm"
                    : "text-z-mute hover:text-z-ink"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <main className="px-3 pt-3">
          {tab === "signal" && (
            <>
              {/* live signal card */}
              {signalsLoading ? (
                <ZoneSkeletonCard />
              ) : live ? (
              <article className="z-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-z-line bg-z-charcoal px-4 py-3 text-white">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-extrabold">{live.pair}</span>
                    <span
                      className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                        live.direction === "Buy"
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                      }`}
                    >
                      {live.direction === "Buy" ? (
                        <UpIcon size={12} />
                      ) : (
                        <DownIcon size={12} />
                      )}
                      {live.direction}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white/70">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-z-amber" />
                    Live · {live.timeframe}
                  </span>
                </div>

                <div className="px-4 py-4">
                  <div className="grid grid-cols-3 gap-2 rounded-xl bg-z-gray p-3 text-center">
                    {[
                      ["Entry", live.entry],
                      ["Stop Loss", live.stopLoss],
                      ["Targets", live.targets],
                    ].map(([l, v]) => (
                      <div key={l}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-z-mute">
                          {l}
                        </div>
                        <div className="mt-0.5 text-[13px] font-bold text-z-ink">{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* progress to TP1 */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-z-mute">
                      <span>SL</span>
                      <span className="text-z-ink">
                        Progress to TP1 · {live.progressPct}%
                      </span>
                      <span>TP1</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-z-gray">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-z-amber to-z-blue"
                        style={{ width: `${live.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed text-z-mute">
                    {live.note}
                  </p>

                  {/* signal participation */}
                  <div className="mt-4 rounded-xl border border-z-line z-page p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                          {(zoneMembers || [])
                            .filter((m) => m.online)
                            .slice(0, 3)
                            .map((m) => (
                              <ZoneAvatar
                                key={m.id}
                                name={m.name}
                                size={24}
                              />
                            ))}
                        </div>
                        <span className="text-[13px] font-semibold text-z-ink">
                          {takersCount} member{takersCount === 1 ? "" : "s"} took
                          this signal
                        </span>
                      </div>
                      <span className="ml-auto text-[11px] font-semibold text-z-mute">
                        {Math.round((takersCount / memberCount) * 100)}%
                        of zone
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-z-gray">
                      <div
                        className="h-full rounded-full bg-z-blue transition-all duration-500"
                        style={{
                          width: `${(takersCount / memberCount) * 100}%`,
                        }}
                      />
                    </div>

                    <ZoneButton
                      variant={tookSignal ? "outline" : "blue"}
                      className="mt-3 w-full min-h-[42px] text-[14px]"
                      aria-pressed={tookSignal}
                      disabled={!live?.id}
                      onClick={async () => {
                        if (!live?.id) return;
                        const next = !tookSignal;
                        setTookOverride(next);
                        try {
                          const res = await toggleSignalTake(live.id, next);
                          if (typeof res?.takersCount === "number") setTakers(res.takersCount);
                          setTakersDelta((d) => d + (next ? 1 : -1));
                        } catch {
                          setTookOverride(null); // revert on failure
                        }
                      }}
                    >
                      {tookSignal ? (
                        <span className="flex items-center gap-2 text-success">
                          <CheckIcon size={15} /> You took this signal · tap to
                          undo
                        </span>
                      ) : (
                        "I took this signal"
                      )}
                    </ZoneButton>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-z-mute">
                    <span>R:R {live.rr}</span>
                    <span>Posted {live.postedAt}</span>
                  </div>
                </div>
              </article>
              ) : (
                <div className="z-card p-5 text-center">
                  <p className="text-[14px] font-semibold text-z-ink">
                    No live signal right now
                  </p>
                  <p className="mt-1 text-[13px] text-z-mute">
                    The next setup from this trader will appear here.
                  </p>
                </div>
              )}

              {/* quick stats */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  [trader.winRate, "Win rate"],
                  [`${onlineCount} online`, "Members"],
                  [trader.reviewCount, "Reviews"],
                ].map(([v, l]) => (
                  <div key={l} className="z-card flex flex-col items-center py-3">
                    <span className="text-[15px] font-bold text-z-ink">{v}</span>
                    <span className="text-[11px] text-z-mute">{l}</span>
                  </div>
                ))}
              </div>

              <RateZoneCard handle={traderId} traderName={trader.displayName} />

              <p className="mt-3 px-1 text-[11px] leading-relaxed text-z-mute">
                Signals are informational and not financial advice. Always apply
                your own risk management.
              </p>
            </>
          )}

          {tab === "history" && (
            <>
              <div className="mb-3 flex items-center gap-2 px-1">
                <ClockHistoryIcon size={16} />
                <h2 className="text-[15px] font-bold text-z-ink">
                  Signal History
                </h2>
                <span className="ml-auto text-[12px] text-z-mute">
                  {zoneSignalHistory.length} closed trades
                </span>
              </div>
              <div className="space-y-3">
                {zoneSignalHistory.map((s) => (
                  <article key={s.id} className="z-card p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-z-ink">
                        {s.pair}
                      </span>
                      <span
                        className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${
                          s.direction === "Buy"
                            ? "bg-success-soft text-success"
                            : "bg-danger-soft text-danger"
                        }`}
                      >
                        {s.direction === "Buy" ? <UpIcon size={12} /> : <DownIcon size={12} />}
                        {s.direction}
                      </span>
                      <span
                        className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold ${memberStatusColors[s.outcome]}`}
                      >
                        {s.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-z-gray p-3 text-center">
                      {[
                        ["Entry", s.entry],
                        ["Stop Loss", s.stopLoss],
                        ["Targets", s.targets],
                      ].map(([l, v]) => (
                        <div key={l}>
                          <div className="text-[10px] font-semibold uppercase tracking-wide text-z-mute">
                            {l}
                          </div>
                          <div className="mt-0.5 text-[12px] font-bold text-z-ink">{v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[12px]">
                      <span
                        className={`font-bold ${
                          s.outcome === "win"
                            ? "text-success"
                            : s.outcome === "loss"
                              ? "text-danger"
                              : "text-z-mute"
                        }`}
                      >
                        {s.result}
                      </span>
                      <span className="text-z-mute">
                        {s.timeframe} · R:R {s.rr} · {s.closedAt}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-3 px-1 text-[11px] text-z-mute">
                Historical outcomes shown are illustrative examples only — not
                live or verified performance data.
              </p>
            </>
          )}

          {tab === "members" && (
            <>
              <div className="mb-3 flex items-center gap-2 px-1">
                <UserIcon size={16} />
                <h2 className="text-[15px] font-bold text-z-ink">
                  Zone Members
                </h2>
                <span className="ml-auto text-[12px] text-z-mute">
                  {onlineCount} online now
                </span>
              </div>
              <div className="z-card divide-y divide-z-line overflow-hidden">
                {membersLoading ? (
                  <div className="p-4">
                    <ZoneSkeletonList count={3} />
                  </div>
                ) : (
                  (zoneMembers || []).map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="relative">
                      <ZoneAvatar name={m.name} size={40} />
                      <span
                        aria-hidden="true"
                        className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${
                          m.online ? "bg-success" : "bg-[#c9ccd1]"
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-[14px] font-semibold text-z-ink">
                        {m.name}
                        {m.role === "Trader" && (
                          <span className="ml-2 rounded-full bg-gold-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gold">
                            Trader
                          </span>
                        )}
                        {m.role === "You" && (
                          <span className="ml-2 rounded-full bg-z-gray px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-z-mute">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-z-mute">
                        {m.online ? "Online now" : "Last seen recently"}
                      </div>
                    </div>
                    <span
                      className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        m.plan === "Premium" || m.plan === "Owner"
                          ? "bg-gold-soft text-gold"
                          : "bg-z-gray text-z-mute"
                      }`}
                    >
                      {m.plan}
                    </span>
                  </div>
                  ))
                )}
              </div>
            </>
          )}
        </main>

        <div className="h-24" />
        <ZoneBottomNav />
        </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */

export function ZoneNotificationsPage() {
  const { notifications } = useZoneNotifications();
  return (
    <ZoneShell>
      <ZoneHeader title="Notifications" back />
      <main className="px-3 pt-4">
        <div className="space-y-3">
          {notifications.map((n) => (
            <article
              key={n.id}
              className={`z-card p-4 ${!n.read ? "border-l-4 border-l-z-blue" : ""}`}
            >
              <div className="text-[11px] font-semibold uppercase tracking-wide text-z-blue">
                {n.category}
              </div>
              <div className="mt-0.5 text-[15px] font-semibold text-z-ink">
                {n.title}
              </div>
              <p className="text-[13px] text-z-mute">{n.body}</p>
              <div className="mt-1 text-[11px] text-z-mute">{n.time}</div>
            </article>
          ))}
        </div>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Checkout ---------------- */

export function ZoneCheckoutPage() {
  const navigate = useNavigate();
  const [state, setState] = useState("confirm"); // confirm | done
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [renewsAt, setRenewsAt] = useState(null);
  const { traders, loading } = useZoneTraders();
  const params = useSearchParams()[0];
  const traderId = params.get("trader") || undefined;
  const trader =
    (traderId && traders.find((t) => t.id === traderId)) ||
    traders[0];

  if (loading) {
    return (
      <ZoneShell>
        <ZoneHeader title="Checkout" back />
        <main className="px-3 pt-4">
          <ZoneSkeletonList count={3} />
        </main>
      </ZoneShell>
    );
  }

  if (!trader) {
    return (
      <ZoneShell>
        <ZoneHeader title="Checkout" back />
        <main className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-[15px] font-semibold text-z-ink">
            Zone not found
          </p>
          <p className="text-[13px] text-z-mute">
            This trader zone may have been removed or is unavailable.
          </p>
          <ZoneButton onClick={() => navigate("/zone")}>Back to Zones</ZoneButton>
        </main>
      </ZoneShell>
    );
  }

  const pay = async () => {
    setPaying(true);
    setError("");
    try {
      const { renewsAt } = await payWithPaystack({
        traderHandle: trader.handle || trader.id,
      });
      setRenewsAt(renewsAt);
      setState("done");
    } catch (err) {
      if (err.status !== 499) setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <ZoneShell>
      <ZoneHeader title="Checkout" back />
      <main className="px-3 pt-4">
        {state === "confirm" ? (
          <div className="space-y-4">
            <section className="z-card p-4">
              <h2 className="mb-3 text-[16px] font-semibold text-z-ink">
                Subscription summary
              </h2>
              <div className="flex items-center gap-3">
                <ZoneAvatar name={trader.name} size={44} />
                <div>
                  <div className="text-[15px] font-semibold text-z-ink">
                    {trader.name}
                  </div>
                  <div className="text-[12px] text-z-mute">
                    Monthly signal zone access
                  </div>
                </div>
                <span className="ml-auto text-[17px] font-bold text-z-ink">
                  {trader.fee}
                </span>
              </div>
            </section>
            <section className="z-card p-4">
              <h2 className="mb-3 text-[16px] font-semibold text-z-ink">
                Payment method
              </h2>
              <label className="flex min-h-[48px] items-center gap-3 rounded-xl border border-z-blue bg-z-blue-soft/50 px-3">
                <input
                  type="radio"
                  name="pay"
                  defaultChecked
                  className="accent-z-blue"
                />
                <span className="text-[14px] font-medium text-z-ink">
                  Card / Bank transfer
                </span>
              </label>
              <label className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl border border-z-line px-3">
                <input type="radio" name="pay" className="accent-z-blue" />
                <span className="text-[14px] font-medium text-z-ink">
                  Mobile money
                </span>
              </label>
            </section>
            <ZoneButton className="w-full" loading={paying} onClick={pay}>
              Pay {trader.fee}
            </ZoneButton>
            {error && <p className="text-center text-[12px] font-semibold text-z-red">{error}</p>}
            <p className="text-center text-[11px] text-z-mute">
              Payments are processed securely by Paystack.
            </p>
          </div>
        ) : (
          <div className="z-card flex flex-col items-center px-6 py-12 text-center">
            <div
              className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-z-blue-soft text-z-blue"
              aria-hidden="true"
            >
              <CheckIcon size={26} />
            </div>
            <h2 className="text-[18px] font-bold text-z-ink">
              Subscription confirmed
            </h2>
            <p className="mt-1 text-[13px] text-z-mute">
              Payment successful. You now have full access to the{" "}
              {trader.displayName} signal zone
              {renewsAt
                ? ` until ${new Date(renewsAt).toLocaleDateString("en-GB")}`
                : "."}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-success">
              Recorded in your payment history ✓
            </p>
            <ZoneButton
              className="mt-5"
              onClick={() => navigate(`/zone/room/${trader.id}`)}
            >
              Enter zone
            </ZoneButton>
          </div>
        )}
      </main>
    </ZoneShell>
  );
}

/* ---------------- My subscriptions ---------------- */

export function ZoneSubscriptionsPage() {
  const { joined, live, loading } = useZoneSubscriptions();
  const { traders } = useZoneTraders();
  const rows = joined.map((j) => ({
    t: traders.find((x) => x.id === j.traderId),
    j,
  }));
  return (
    <ZoneShell>
      <ZoneHeader title="My Subscriptions" back />
      <main className="px-3 pt-4">
        <div className="space-y-3">
          {loading && <ZoneSkeletonList count={2} />}
          {rows.map(({ t, j }) =>
            t ? (
            <div key={t.id} className="z-card p-4">
              <div className="flex items-center gap-3">
                <ZoneAvatar name={t.name} size={44} />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold text-z-ink">
                    {t.displayName}
                  </div>
                  <div className="text-[12px] text-z-mute">
                    {j.joinedAt} · {j.renews}
                  </div>
                </div>
                <Link to={`/zone/room/${t.id}`} className="ml-auto">
                  <ZoneButton
                    variant="outline"
                    className="min-h-[36px] px-3 text-[13px]"
                  >
                    Open
                  </ZoneButton>
                </Link>
              </div>
              {/* renewal counter */}
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-z-blue-soft/50 px-3 py-2.5">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${
                    j.countdown === "Renewal due" ? "bg-z-red" : "bg-success"
                  }`}
                />
                <span className="text-[12px] font-semibold text-z-ink">
                  {j.countdown === "Renewal due"
                    ? "Renewal due — resubscribe to keep access"
                    : `Renews in ${j.countdown}`}
                </span>
                <span className="ml-auto rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-z-mute">
                  {j.status}
                </span>
              </div>
            </div>
            ) : null,
          )}
          {live && rows.length === 0 && (
            <div className="z-card p-5 text-center">
              <p className="text-[14px] font-semibold text-z-ink">No subscriptions yet</p>
              <p className="mt-1 text-[13px] text-z-mute">Subscribe to a trader's zone to see it here.</p>
              <Link to="/zone?tab=zones" className="mt-3 block">
                <ZoneButton variant="charcoal" className="w-full">Explore zones</ZoneButton>
              </Link>
            </div>
          )}
        </div>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Transaction history ---------------- */

export function ZoneTransactionsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api("/payments")
      .then((d) => {
        if (!cancelled)
          setPayments(
            (d.payments || []).map((p) => ({
              ref: p.ref,
              planName: p.planName,
              amount: p.amount,
              date: new Date(p.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              status: p.status === "paid" ? "Paid" : p.status,
            })),
          );
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ZoneShell>
      <ZoneHeader title="Transaction History" back />
      <main className="px-3 pt-4">
        {loading ? (
          <ZoneSkeletonList count={3} />
        ) : payments.length === 0 ? (
          <div className="z-card p-5 text-center">
            <p className="text-[14px] font-semibold text-z-ink">No transactions yet</p>
            <p className="mt-1 text-[13px] text-z-mute">
              Payments for zone subscriptions will appear here.
            </p>
            <Link to="/zone?tab=zones" className="mt-3 block">
              <ZoneButton variant="charcoal" className="w-full">
                Explore zones
              </ZoneButton>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div key={p.ref} className="z-card flex items-center gap-3 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success"
                  aria-hidden="true"
                >
                  <CheckIcon size={18} />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-z-ink">
                    {p.planName}
                  </div>
                  <div className="text-[12px] text-z-mute">
                    {p.date} · {p.ref}
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[14px] font-bold text-z-ink">{p.amount}</div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-success">
                    {p.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </ZoneShell>
  );
}

/* ---------------- Profile ---------------- */

export function ZoneProfilePage() {
  const { user: me } = useAuth();
  const { kycVerified } = useMyZone();
  return (
    <ZoneShell>
      <ZoneHeader title="Profile" back />
      <main className="px-3 pt-4">
        <section className="z-card flex flex-col items-center p-6">
          <ZoneAvatar name={me?.name || "Member"} size={72} ring />
          <h2 className="mt-3 text-[18px] font-bold text-z-ink">
            {me?.name || "Member"}
          </h2>
          <p className="text-[13px] text-z-mute">{me?.email || ""}</p>
        </section>
        <section className="z-card mt-3 px-4">
          {
            [
            ["Plan", me?.plan === "premium" || me?.plan === "Premium" ? "Premium member" : "Free member"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between border-b border-z-line py-3.5 last:border-0"
            >
              <span className="text-[14px] text-z-mute">{label}</span>
              <span className="text-[14px] font-semibold text-z-ink">
                {value}
              </span>
            </div>
          ))}
        </section>
        <Link
          to="/zone/analyst"
          className="z-card mt-3 flex items-center gap-3 p-4"
        >
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              kycVerified ? "bg-[#f2d68a] text-[#0b0b0b]" : "bg-z-gray text-z-mute"
            }`}
            aria-hidden="true"
          >
            <StarIc size={18} filled />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-z-ink">
              Analyst Studio
            </span>
            <span className="block text-[12px] text-z-mute">
              {kycVerified
                ? "Create and manage zones, post signals"
                : "Toggle analyst mode on & verify to unlock"}
            </span>
          </span>
          {kycVerified ? (
            <ChevronRightIcon size={18} />
          ) : (
            <span className="rounded-full bg-success-soft px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-success">
              Get started
            </span>
          )}
        </Link>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Settings ---------------- */

export function ZoneSettingsPage() {
  const [notify, setNotify] = useState(true);
  const [dark, setDark] = useState(getTheme() === "dark");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <ZoneShell>
      <ZoneHeader title="Settings" back />
      <main className="px-3 pt-4">
        <section className="z-surface px-4">
          {[
            ["Account", "Name, email, password"],
            ["Payment methods", "Cards and transfers"],
            ["Language", "English"],
          ].map(([label, sub]) => (
            <button
              key={label}
              className="flex w-full items-center justify-between border-b border-z-line py-3.5 text-left last:border-0"
            >
              <span>
                <span className="block text-[15px] font-medium text-z-ink">
                  {label}
                </span>
                <span className="block text-[12px] text-z-mute">{sub}</span>
              </span>
              <span className="flex items-center gap-1 text-z-mute" aria-hidden="true">
                <ChevronRightIcon size={16} />
              </span>
            </button>
          ))}
        </section>
        <section className="mt-3 z-surface px-4">
          <div className="flex items-center justify-between border-b border-z-line py-3.5">
            <span className="text-[15px] font-medium text-z-ink">
              Push notifications
            </span>
            <button
              role="switch"
              aria-checked={notify}
              onClick={() => setNotify(!notify)}
              className={`h-6 w-11 rounded-full p-0.5 transition ${notify ? "bg-z-blue" : "bg-z-gray"}`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition ${notify ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between py-3.5">
            <span className="text-[15px] font-medium text-z-ink">
              Dark mode
            </span>
            <button
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark mode"
              onClick={() => setDark(toggleTheme() === "dark")}
              className={`h-6 w-11 rounded-full p-0.5 transition ${dark ? "bg-z-blue" : "bg-z-gray"}`}
            >
              <span
                className={`block h-5 w-5 rounded-full bg-white transition ${dark ? "translate-x-5" : ""}`}
              />
            </button>
          </div>
        </section>
        <button
          className="z-card mt-4 w-full py-3.5 text-[15px] font-semibold text-z-red"
          onClick={() => setConfirmLogout(true)}
        >
          Logout
        </button>
      </main>

      {/* Logout confirmation */}
      {confirmLogout && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
          onClick={() => setConfirmLogout(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm logout"
        >
          <div
            className="w-full rounded-t-3xl z-surface p-5 sm:max-w-sm sm:rounded-3xl"
            onClick={(ev) => ev.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-z-ink">Log out?</h3>
              <button
                onClick={() => setConfirmLogout(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-z-gray text-z-ink"
              >
                <CloseIcon size={14} />
              </button>
            </div>
            <p className="text-[13px] leading-relaxed text-z-mute">
              You'll need to log in again to access your zones and signals.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmLogout(false)}
                className="min-h-[46px] rounded-xl border border-z-line text-[14px] font-bold text-z-ink hover:bg-z-gray/50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmLogout(false);
                  logout();
                  navigate("/login", { replace: true });
                }}
                className="min-h-[46px] rounded-xl bg-z-red text-[14px] font-bold text-white active:brightness-95"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </ZoneShell>
  );
}

/* ================= ANALYST MODE + KYC GATE =================
   Analyst Studio is opt-in: a member toggles analyst mode on from their
   profile, then completes a mock KYC flow. Completion is registered
   server-side: the user is persisted as a verified analyst (role=analyst,
   kycVerified=true) and their own zone is provisioned for others to join. */

const KYC_STEPS = ["Identity", "Document", "Liveness", "Experience", "Review"];

function KycGate({ onDone, submitting = false }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    legalName: "",
    dob: "",
    country: "Nigeria",
    address: "",
    idType: "National ID (NIN)",
    idNumber: "",
    experience: "Beginner",
    markets: "",
  });
  const [captured, setCaptured] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const field =
    "min-h-[44px] w-full rounded-xl border border-z-line bg-white px-3 text-[14px] text-z-ink outline-none focus:border-z-blue";
  const label = "mb-1.5 block text-[12px] font-semibold text-z-mute";

  const validate = () => {
    const e = {};
    if (step === 0) {
      if (!form.legalName.trim()) e.legalName = "Enter your legal name";
      if (!form.dob) e.dob = "Required";
      if (!form.address.trim()) e.address = "Required";
    }
    if (step === 1 && !form.idNumber.trim()) e.idNumber = "Required";
    if (step === 2 && !captured) e.selfie = "Capture a live selfie to continue";
    if (step === 3 && !form.markets.trim()) e.markets = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (step < KYC_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // final submit — hand off to the parent, which registers the analyst
    // in the DB and advances to the approved screen on success.
    setProcessing(true);
    onDone(form); // parent keeps `submitting` true until done
  };

  const busy = processing || submitting;

  const capture = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCaptured(true);
      setErrors({});
    }, 1500);
  };

  // approved screen
  if (step === KYC_STEPS.length) {
    return (
      <div className="z-surface mx-3 mt-4 flex flex-col items-center p-8 text-center">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success"
          aria-hidden="true"
        >
          <CheckIcon size={30} />
        </span>
        <h2 className="mt-4 text-[18px] font-bold text-z-ink">Verification approved</h2>
        <p className="mt-2 text-[13px] leading-relaxed text-z-mute">
          Your analyst KYC is complete. You can now create zones and publish
          signals as a verified analyst.
        </p>
        <button
          onClick={() => onDone(form)}
          className="mt-6 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-z-blue text-[15px] font-bold text-white active:brightness-95"
        >
          Enter Analyst Studio
        </button>
      </div>
    );
  }

  return (
    <div className="z-surface mx-3 mt-4 p-5">
      {/* step indicator */}
      <div className="mb-4 flex gap-1.5">
        {KYC_STEPS.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-z-blue" : "bg-z-gray"}`}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-z-mute">
        Step {step + 1} of {KYC_STEPS.length} · {KYC_STEPS[step]}
      </p>
      <h2 className="mt-1 text-[17px] font-bold text-z-ink">
        Become a verified analyst
      </h2>

      <div className="mt-4 space-y-3">
        {step === 0 && (
          <>
            <div>
              <span className={label}>Legal name</span>
              <input className={field} value={form.legalName} onChange={set("legalName")} placeholder="As it appears on your ID" />
              {errors.legalName && <p className="mt-1 text-[11px] text-danger">{errors.legalName}</p>}
            </div>
            <div>
              <span className={label}>Date of birth</span>
              <input type="date" className={field} value={form.dob} onChange={set("dob")} />
              {errors.dob && <p className="mt-1 text-[11px] text-danger">{errors.dob}</p>}
            </div>
            <div>
              <span className={label}>Country of residence</span>
              <select className={field} value={form.country} onChange={set("country")}>
                <option>Nigeria</option>
                <option>Ghana</option>
                <option>Kenya</option>
                <option>United Kingdom</option>
              </select>
            </div>
            <div>
              <span className={label}>Residential address</span>
              <input className={field} value={form.address} onChange={set("address")} placeholder="Street, city, state" />
              {errors.address && <p className="mt-1 text-[11px] text-danger">{errors.address}</p>}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <p className="text-[13px] leading-relaxed text-z-mute">
              We simulate an identity-document check. Provide a document number
              to run the (demo) verification.
            </p>
            <div>
              <span className={label}>Document type</span>
              <select className={field} value={form.idType} onChange={set("idType")}>
                <option>National ID (NIN)</option>
                <option>International passport</option>
                <option>Driver's licence</option>
                <option>Voter's card</option>
              </select>
            </div>
            <div>
              <span className={label}>Document number</span>
              <input className={field} value={form.idNumber} onChange={set("idNumber")} placeholder="Enter document number" />
              {errors.idNumber && <p className="mt-1 text-[11px] text-danger">{errors.idNumber}</p>}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="text-center">
            <p className="mb-4 text-[13px] leading-relaxed text-z-mute">
              Complete a simulated liveness check — look at the camera and keep
              your face inside the frame.
            </p>
            <div
              className={`mx-auto flex h-40 w-40 items-center justify-center rounded-full border-4 ${
                captured ? "border-success bg-success-soft text-success" : "border-z-line bg-z-gray text-z-mute"
              }`}
              aria-hidden="true"
            >
              {captured ? <CheckIcon size={36} /> : <UserIcon size={48} />}
            </div>
            {scanning && (
              <p className="mt-3 text-[13px] font-semibold text-z-blue">
                Scanning face…
              </p>
            )}
            {errors.selfie && !captured && (
              <p className="mt-3 text-[11px] text-danger">{errors.selfie}</p>
            )}
            <button
              onClick={capture}
              disabled={scanning}
              className="mt-5 flex min-h-[44px] w-full items-center justify-center rounded-xl border border-z-line text-[14px] font-semibold text-z-ink hover:bg-z-gray/50 disabled:opacity-50"
            >
              {captured ? "Retake selfie" : scanning ? "Scanning…" : "Capture selfie"}
            </button>
          </div>
        )}

        {step === 3 && (
          <>
            <div>
              <span className={label}>Trading experience</span>
              <select className={field} value={form.experience} onChange={set("experience")}>
                <option>Beginner — under 1 year</option>
                <option>Intermediate — 1 to 3 years</option>
                <option>Advanced — over 3 years</option>
                <option>Professional — licensed or fund-managed</option>
              </select>
            </div>
            <div>
              <span className={label}>Markets you analyse</span>
              <input className={field} value={form.markets} onChange={set("markets")} placeholder="e.g. Forex, Gold, Indices" />
              {errors.markets && <p className="mt-1 text-[11px] text-danger">{errors.markets}</p>}
            </div>
          </>
        )}

        {step === 4 && (
          <div className="space-y-2 text-[13px]">
            {[
              ["Name", form.legalName],
              ["DOB", form.dob],
              ["Country", form.country],
              ["Document", `${form.idType} · ${form.idNumber}`],
              ["Liveness", captured ? "Selfie captured ✓" : "—"],
              ["Experience", form.experience],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-z-line py-2 last:border-0">
                <span className="text-z-mute">{k}</span>
                <span className="max-w-[60%] truncate font-semibold text-z-ink">{v || "—"}</span>
              </div>
            ))}
            <p className="pt-2 text-[11px] leading-relaxed text-z-mute">
              By submitting you confirm the details are accurate. This is a
              simulated verification for the demo environment.
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            disabled={busy}
            className="flex min-h-[48px] items-center justify-center rounded-2xl border border-z-line px-5 text-[14px] font-semibold text-z-ink hover:bg-z-gray/50 disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          onClick={next}
          disabled={busy}
          className="flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-2xl bg-z-blue text-[15px] font-bold text-white active:brightness-95 disabled:opacity-60"
        >
          {busy ? (
            <>
              <ClockHistoryIcon size={16} /> Verifying…
            </>
          ) : step === KYC_STEPS.length - 1 ? (
            "Submit for verification"
          ) : (
            "Continue"
          )}
        </button>
      </div>
    </div>
  );
}

/* Opt-in screen: analyst-mode toggle + mock KYC that registers the analyst
   in the DB. `onVerified(profile)` receives the KYC profile to submit. */
function AnalystOnboarding({ onVerified }) {
  const { user } = useAuth();
  const [toggled, setToggled] = useState(false);
  const [kycOpen, setKycOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (kycOpen) {
    return (
      <ZoneShell>
        <ZoneHeader title="Analyst" back />
        {error && (
          <div className="mx-3 mt-3 rounded-xl bg-danger-soft px-4 py-3 text-[13px] font-semibold text-danger">
            {error}
          </div>
        )}
        <KycGate
          submitting={submitting}
          onDone={async (form) => {
            setSubmitting(true);
            setError("");
            try {
              await onVerified({
                legalName: form.legalName,
                country: form.country,
                idType: form.idType,
                idNumber: form.idNumber,
                experience: form.experience,
                markets: form.markets,
              });
            } catch (err) {
              setError(
                err.status === 401
                  ? "Your session has expired — please log out and sign in again."
                  : err.message || "Verification failed — try again",
              );
              setSubmitting(false);
              return;
            }
            setSubmitting(false);
          }}
        />
      </ZoneShell>
    );
  }

  return (
    <ZoneShell>
      <ZoneHeader title="Analyst" back />
      <main className="px-3 pt-4">
        <div className="z-surface p-6 text-center">
          <span
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2d68a] text-[#0b0b0b]"
            aria-hidden="true"
          >
            <StarIc size={30} filled />
          </span>
          <h1 className="mt-4 text-[19px] font-bold text-z-ink">
            Become an analyst
          </h1>
          <p className="mx-auto mt-2 max-w-[300px] text-[13px] leading-relaxed text-z-mute">
            Turn on analyst mode to create your own signal zone, publish
            structured setups and grow a subscriber base.
          </p>
          {user?.name && (
            <p className="mt-3 text-[12px] text-z-mute">
              Applying as <span className="font-semibold text-z-ink">{user.name}</span>
            </p>
          )}

          <button
            onClick={() => setToggled((v) => !v)}
            role="switch"
            aria-checked={toggled}
            className="mt-5 flex w-full items-center justify-between rounded-2xl bg-z-gray px-4 py-3.5 text-left"
          >
            <span>
              <span className="block text-[14px] font-semibold text-z-ink">
                Analyst mode
              </span>
              <span className="block text-[12px] text-z-mute">
                {toggled ? "Ready to verify" : "Toggle on to get started"}
              </span>
            </span>
            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                toggled ? "bg-success" : "bg-[#c9c9c9]"
              }`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  toggled ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          </button>

          {toggled && (
            <button
              onClick={() => setKycOpen(true)}
              className="mt-3 flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-z-blue text-[15px] font-bold text-white active:brightness-95"
            >
              Start verification
            </button>
          )}
        </div>

        {!toggled && (
          <div className="mt-3 space-y-3">
            {[
              ["1", "Toggle analyst mode on", "Switch on the toggle above to begin."],
              ["2", "Complete KYC verification", "Identity, document, liveness and experience checks."],
              ["3", "Start publishing signals", "Create a zone and post setups to subscribers."],
            ].map(([n, t, s]) => (
              <div key={n} className="z-card flex items-start gap-3 p-4">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-z-blue/10 text-[13px] font-bold text-z-blue"
                  aria-hidden="true"
                >
                  {n}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-z-ink">{t}</span>
                  <span className="block text-[12px] text-z-mute">{s}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
    </ZoneShell>
  );
}

/* ================= ANALYST DASHBOARD =================
   For the people who create, own and manage zones,
   and post signals to their subscribers. */

const signalStatusStyle = {
  Live: "bg-success-soft text-success",
  "Target hit": "bg-success-soft text-success",
  "Stopped out": "bg-danger-soft text-danger",
  Draft: "bg-z-gray text-z-mute",
  Breakeven: "bg-z-gray text-z-mute",
};

const directionStyle = {
  Buy: "bg-success-soft text-success",
  Sell: "bg-danger-soft text-danger",
};

function AnalystStat({ label, value, hint }) {
  return (
    <div className="z-card p-3">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-z-mute">
        {label}
      </span>
      <span className="mt-1 block text-[20px] font-extrabold text-z-ink">
        {value}
      </span>
      {hint && <span className="text-[11px] text-z-mute">{hint}</span>}
    </div>
  );
}

function AnalystZoneRow({ zone, onManage }) {
  const statusStyle =
    zone.status === "Active"
      ? "bg-success-soft text-success"
      : "bg-z-gray text-z-mute";
  return (
    <div className="z-card p-4">
      <div className="flex items-center gap-3">
        <ZoneAvatar name={zone.name} size={42} ring={zone.status === "Active"} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[15px] font-semibold text-z-ink">
              {zone.name}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusStyle}`}
            >
              {zone.status}
            </span>
          </div>
          <span className="text-[12px] text-z-mute">
            {zone.marketType} · {zone.fee} · {zone.created}
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 rounded-xl bg-z-gray py-2.5">
        {[
          [zone.subscribers, "Subscribers"],
          [zone.liveSignals, "Live signals"],
          [zone.winRate, "Win rate"],
        ].map(([v, l], i) => (
          <div
            key={l}
            className={`flex flex-col items-center ${i > 0 ? "border-l border-[#d7d7d7]" : ""}`}
          >
            <span className="text-[15px] font-bold text-z-ink">{v}</span>
            <span className="text-[10px] text-z-mute">{l}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => onManage(zone)}
          className="flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-xl border border-z-line text-[13px] font-semibold text-z-ink hover:bg-z-gray/50"
        >
          <EditIcon size={14} /> Manage
        </button>
        <Link
          to={`/zone/room/${zone.id}`}
          className="flex min-h-[40px] flex-1 items-center justify-center rounded-xl bg-z-charcoal text-[13px] font-semibold text-white hover:bg-[#2b2b2b]"
        >
          Open zone
        </Link>
      </div>
    </div>
  );
}

export function AnalystDashboard() {
  const { kycVerified, zone, live, loading, refetch } = useMyZone();

  if (loading && !live) {
    return (
      <ZoneShell>
        <ZoneHeader title="Analyst" />
        <main className="px-3 pt-4">
          <ZoneSkeletonList count={4} />
        </main>
      </ZoneShell>
    );
  }

  // Not yet a verified analyst — show the opt-in toggle + mock KYC flow.
  if (!kycVerified || !zone) {
    return (
      <ZoneShell>
        <ZoneHeader title="Analyst" />
        <AnalystOnboarding
          onVerified={(profile) =>
            completeKyc(profile)
              .then(refetch)
              .catch(() => {})
          }
        />
      </ZoneShell>
    );
  }

  return <AnalystDashboardInner zone={zone} />;
}

function AnalystDashboardInner({ zone }) {
  const [signal, setSignal] = useState(null); // signal being composed
  const [managing, setManaging] = useState(null); // zone being edited
  const [toast, setToast] = useState("");
  const [tab, setTab] = useState("signals"); // signals | zones | earnings
  const { refetch: refetchTraders } = useZoneTraders();
  const ownerHandle = zone.handle;
  const {
    all: apiSignals,
    loading: signalsLoading,
    refresh: refetchSignals,
  } = useZoneSignals(ownerHandle);

  const signals = apiSignals.map((s) => ({
    id: s.id,
    zoneId: ownerHandle,
    pair: s.pair,
    direction: s.direction,
    status: s.status,
    entry: s.entry,
    stopLoss: s.stopLoss,
    targets: s.targets,
    rr: s.rr,
    timeframe: s.timeframe,
    postedAt: s.postedAt,
    takers: 0,
  }));

  const me = zone.displayName;
  const [createdLabel] = useState(
    () =>
      "Created " +
      new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" }),
  );
  const zones = [
    {
      id: ownerHandle,
      name: `${me} Zone`,
      marketType: zone.marketType || "Forex",
      fee: zone.fee || "Free",
      entryFee: zone.entryFee || "Free",
      status: zone.status || "Active",
      subscribers: zone.subscribers || "0",
      liveSignals: signals.filter((s) => s.status === "Live").length,
      winRate: zone.winRate || "0%",
      catalogs: zone.catalogs || ["chart", "terminal", "analysis"],
      created: createdLabel,
    },
  ];

  const liveCount = signals.filter((s) => s.status === "Live").length;
  const totalTakers = signals.reduce((a, s) => a + s.takers, 0);
  const wins = signals.filter((s) => s.status === "Target hit").length;
  const closed = signals.filter((s) =>
    ["Target hit", "Stopped out", "Breakeven"].includes(s.status),
  ).length;

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const publishSignal = async (draft) => {
    try {
      await postZoneSignal(draft.zoneId, draft);
      await refetchSignals(); // reload the zone from the DB
      flash("Signal published to your subscribers");
    } catch (err) {
      flash(err.status === 0 ? "Offline — signal not saved" : err.message);
    }
    setSignal(null);
  };

  const saveZone = async (zone, patch) => {
    try {
      await updateZone(zone.id, patch);
      await refetchTraders(); // re-pull the persisted zone state
      flash("Zone updated");
    } catch (err) {
      flash(err.status === 0 ? "Offline — changes not saved" : err.message);
    }
  };

  const toggleZoneStatus = async (zone) => {
    const next = zone.status === "Active" ? "Paused" : "Active";
    zone.status = next;
    setManaging({ ...zone });
    try {
      await updateZone(zone.id, { status: next });
      await refetchTraders();
      flash(next === "Active" ? "Zone activated" : "Zone paused");
    } catch (err) {
      flash(err.status === 0 ? "Offline — status not saved" : err.message);
    }
  };

  return (
    <ZoneShell>
      <ZoneHeader title="Analyst" />

      {/* owner header */}
      <section className="z-surface flex items-center gap-3 px-4 pb-4 pt-3">
        <ZoneAvatar name={me} size={52} ring />
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-bold text-z-ink">
            {me}
          </h2>
          <div className="flex items-center gap-1.5 text-[12px] text-z-mute">
            <StarIc size={12} filled /> Verified analyst · {zone.marketType}
          </div>
        </div>
        <span className="ml-auto rounded-full bg-[#3a2c07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#f2c14e]">
          Zone Owner
        </span>
      </section>

      {/* stats */}
      <section className="grid grid-cols-2 gap-3 px-3 pt-4">
        <AnalystStat label="Zones owned" value={zones.length} />
        <AnalystStat label="Live signals" value={liveCount} hint="Across all zones" />
        <AnalystStat label="Signal takers" value={totalTakers} hint="All time" />
        <AnalystStat
          label="Win rate"
          value={closed ? `${Math.round((wins / closed) * 100)}%` : "—"}
          hint={`${wins}W / ${closed - wins}L closed`}
        />
      </section>

      {/* tabs */}
      <div className="mt-4 flex border-b border-z-line">
        {[
          ["signals", `Signals (${signals.length})`],
          ["zones", `My Zones (${zones.length})`],
          ["earnings", "Earnings"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            aria-current={tab === id ? "true" : undefined}
            className={`relative flex-1 py-3 text-center text-[14px] font-medium ${
              tab === id ? "text-z-ink" : "text-z-mute"
            }`}
          >
            {label}
            <span
              className={`absolute inset-x-1/4 bottom-0 h-[2.5px] rounded-full ${
                tab === id ? "bg-z-ink opacity-100" : "opacity-0"
              }`}
            />
          </button>
        ))}
      </div>

      <main className="px-3 pt-4">
        {tab === "signals" && (
          <div className="space-y-4">
            {/* post a signal */}
            <button
              onClick={() => setSignal({ zoneId: zones[0]?.id || "katforex" })}
              className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-z-blue text-[15px] font-bold text-white active:brightness-95"
            >
              <PlusIcon size={18} /> Post New Signal
            </button>
            <h3 className="text-[15px] font-semibold text-z-ink">
              Recent signals
            </h3>
            <div className="space-y-3">
              {signalsLoading && signals.length === 0 ? (
                <ZoneSkeletonList count={3} />
              ) : (
              signals.map((s) => (
                <div key={s.id} className="z-card p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-z-ink">
                      {s.pair}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${directionStyle[s.direction]}`}
                    >
                      {s.direction}
                    </span>
                    <span
                      className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${signalStatusStyle[s.status] || "bg-z-gray text-z-mute"}`}
                    >
                      {s.status}
                    </span>
                  </div>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-[12px]">
                    {[
                      ["Entry", s.entry],
                      ["Stop loss", s.stopLoss],
                      ["Targets", s.targets],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-lg bg-z-gray p-2">
                        <span className="block text-[10px] text-z-mute">
                          {l}
                        </span>
                        <span className="font-semibold text-z-ink">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-z-mute">
                    <span>
                      {s.rr} R:R · {s.timeframe} · {s.postedAt}
                    </span>
                    <span className="font-semibold text-z-blue">
                      {s.takers} takers
                    </span>
                  </div>
                </div>
              ))
              )}
              {signals.length === 0 && !signalsLoading && (
                <div className="z-card p-5 text-center">
                  <p className="text-[14px] font-semibold text-z-ink">
                    No signals yet
                  </p>
                  <p className="mt-1 text-[13px] text-z-mute">
                    Post your first signal to your subscribers.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "earnings" && (
          <EarningsPanel zone={zones[0]} onFlash={flash} />
        )}

        {tab === "zones" && (
          <div className="space-y-4">
            <div className="space-y-3">
              {zones.map((z) => (
                <AnalystZoneRow key={z.id} zone={z} onManage={setManaging} />
              ))}
            </div>
            <p className="px-1 text-[12px] text-z-mute">
              Zones you create here appear in the public Signal Zone directory
              where members can subscribe.
            </p>
          </div>
        )}
      </main>

      {/* Post signal sheet */}
      {signal && (
        <PostSignalSheet
          zones={zones}
          draft={signal}
          onClose={() => setSignal(null)}
          onPublish={publishSignal}
        />
      )}

      {/* Manage zone sheet */}
      {managing && (
        <ManageZoneSheet
          zone={managing}
          onClose={() => setManaging(null)}
          onToggleStatus={() => toggleZoneStatus(managing)}
          onSave={(patch) => saveZone(managing, patch)}
        />
      )}

      {toast && (
        <div
          role="status"
          className="safe-bottom app-fixed fixed inset-x-0 bottom-24 z-50 flex justify-center px-6"
        >
          <span className="rounded-full bg-z-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
            {toast}
          </span>
        </div>
      )}
    </ZoneShell>
  );
}

/* ---------------- Zone owner earnings + promotion ---------------- */

function EarningsPanel({ zone, onFlash }) {
  const { summary, earnings, loading, live } = useZoneEarnings();
  const [busy, setBusy] = useState(false);

  const togglePromotion = async () => {
    if (!zone) return;
    setBusy(true);
    try {
      const res = await promoteZone(zone.id, !zone.sponsored);
      onFlash(
        res.trader?.sponsored
          ? "Zone promoted — sponsored for 30 days"
          : "Promotion removed",
      );
    } catch (err) {
      onFlash(err.status === 0 ? "Offline — not saved" : err.message);
    } finally {
      setBusy(false);
    }
  };

  const fmt = (v, cur) =>
    `${cur || "NGN"} ${Number(v || 0).toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

  if (loading) return <ZoneSkeletonList count={3} />;

  if (!live || !summary) {
    return (
      <div className="z-card p-5 text-center">
        <p className="text-[14px] font-semibold text-z-ink">
          Earnings will appear here
        </p>
        <p className="mt-1 text-[13px] text-z-mute">
          When members pay to subscribe to your zone, each payment is credited
          to your earnings ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* summary */}
      <div className="grid grid-cols-2 gap-3">
        <AnalystStat
          label="Net earnings"
          value={fmt(summary.net, summary.currency)}
          hint={`${summary.payouts} payments received`}
        />
        <AnalystStat
          label="Active subscribers"
          value={summary.activeSubscribers}
          hint="Paying members"
        />
        <AnalystStat
          label="Gross revenue"
          value={fmt(summary.gross, summary.currency)}
        />
        <AnalystStat
          label="Platform fee"
          value={fmt(summary.fees, summary.currency)}
          hint="10% commission"
        />
      </div>

      {/* promote / sponsor */}
      <div className="z-card p-4">
        <div className="flex items-center gap-2">
          <StarIc size={16} filled />
          <h2 className="text-[15px] font-bold text-z-ink">Promote your zone</h2>
          {zone?.sponsored && (
            <span className="ml-auto rounded-full bg-[#3a2c07] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#f2c14e]">
              Sponsored
            </span>
          )}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-z-mute">
          Sponsored zones appear at the top of the Signal Zone directory and in
          the featured carousel, reaching more potential subscribers.
        </p>
        <ul className="mt-3 space-y-1.5 text-[12px] text-z-mute">
          <li className="flex items-center gap-2">
            <CheckIcon size={12} className="text-success" /> Top placement in the
            zone directory
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={12} className="text-success" /> "Sponsored" badge on
            your zone card
          </li>
          <li className="flex items-center gap-2">
            <CheckIcon size={12} className="text-success" /> Runs for 30 days ·
            ₦5,000
          </li>
        </ul>
        <ZoneButton
          className="mt-3 w-full min-h-[44px]"
          variant={zone?.sponsored ? "outline" : "blue"}
          loading={busy}
          onClick={togglePromotion}
        >
          {zone?.sponsored ? "Remove sponsorship" : "Promote zone · ₦5,000"}
        </ZoneButton>
      </div>

      {/* ledger */}
      <div>
        <h3 className="mb-2 px-1 text-[15px] font-semibold text-z-ink">
          Payment history
        </h3>
        <div className="space-y-2">
          {earnings.length === 0 ? (
            <div className="z-card p-5 text-center text-[13px] text-z-mute">
              No payments received yet.
            </div>
          ) : (
            earnings.map((e) => (
              <div key={e.id} className="z-card flex items-center gap-3 p-4">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success"
                  aria-hidden="true"
                >
                  <CheckIcon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-z-ink">
                    {fmt(e.net, e.currency)}
                  </div>
                  <div className="text-[12px] text-z-mute">
                    {new Date(e.date).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })} {" · "}
                    gross {fmt(e.amount, e.currency)} − fee {fmt(e.fee, e.currency)}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    e.status === "available"
                      ? "bg-success-soft text-success"
                      : "bg-z-gray text-z-mute"
                  }`}
                >
                  {e.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Rate a zone (member side) ----------------
   Members star-rate the trader's zone; the trader's displayed rating is
   recomputed server-side as the live average, so it stays dynamic. */

function RateZoneCard({ handle, traderName }) {
  const { myRating, ratings, rating, reviewCount, refresh } =
    useZoneRatings(handle);
  const [stars, setStars] = useState(myRating?.stars || 0);
  const [comment, setComment] = useState(myRating?.comment || "");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");

  // Keep the form in sync once the server value arrives.
  useEffect(() => {
    if (myRating && stars === 0) {
      setStars(myRating.stars);
      setComment(myRating.comment || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from server once
  }, [myRating]);

  const submit = async () => {
    if (!stars) return;
    setSaving(true);
    try {
      await rateZone(handle, stars, comment.trim());
      setDone("Rating saved — thanks for the feedback!");
      refresh();
      setTimeout(() => setDone(""), 2500);
    } catch {
      setDone("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="z-card p-4">
      <div className="flex items-center gap-2">
        <StarIc size={16} filled />
        <h2 className="text-[15px] font-bold text-z-ink">Rate this zone</h2>
        <span className="ml-auto text-[12px] text-z-mute">
          {rating != null ? `${rating} · ${reviewCount} reviews` : ""}
        </span>
      </div>
      <div className="mt-3 flex gap-1.5" role="radiogroup" aria-label="Your rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n === 1 ? "" : "s"}`}
            onClick={() => setStars(n)}
            className="p-0.5 transition-transform active:scale-90"
          >
            <StarIc size={26} filled={n <= stars} />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        maxLength={500}
        placeholder={`How is ${traderName}'s zone? (optional)`}
        className="mt-3 w-full rounded-xl border border-z-line bg-white px-3 py-2 text-[13px] text-z-ink outline-none focus:border-z-blue"
      />
      <ZoneButton
        className="mt-2 w-full min-h-[42px] text-[14px]"
        loading={saving}
        disabled={!stars}
        onClick={submit}
      >
        {myRating && myRating.stars === stars ? "Update rating" : "Submit rating"}
      </ZoneButton>
      {done && (
        <p className="mt-2 text-center text-[12px] font-semibold text-success">{done}</p>
      )}
      {ratings.length > 0 && (
        <div className="mt-4 divide-y divide-z-line">
          {ratings.slice(0, 4).map((r) => (
            <div key={r.id} className="flex items-start gap-2.5 py-2.5 first:pt-0">
              <ZoneAvatar name={r.name} size={28} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[12px] font-semibold text-z-ink">
                    {r.name}
                  </span>
                  <ZoneStars rating={r.stars} size={10} />
                </div>
                {r.comment && (
                  <p className="text-[12px] leading-snug text-z-mute">{r.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Post signal (bottom sheet form) ---------------- */

function PostSignalSheet({ zones, draft, onClose, onPublish }) {
  const [form, setForm] = useState({
    zoneId: draft.zoneId,
    pair: "",
    direction: "Buy",
    timeframe: "4H",
    entry: "",
    stopLoss: "",
    targets: "",
    rr: "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = () => {
    const e = {};
    if (!form.pair.trim()) e.pair = "Required";
    if (!form.entry.trim()) e.entry = "Required";
    if (!form.stopLoss.trim()) e.stopLoss = "Never post without a stop loss";
    setErrors(e);
    if (Object.keys(e).length) return;
    onPublish(form);
  };

  const field =
    "min-h-[44px] w-full rounded-xl border border-z-line bg-white px-3 text-[14px] text-z-ink outline-none focus:border-z-blue";
  const label = "mb-1.5 block text-[12px] font-semibold text-z-mute";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Post new signal"
    >
      <div
        className="max-h-[88dvh] w-full overflow-y-auto rounded-t-3xl z-surface p-5 sm:max-w-sm sm:rounded-3xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-z-ink">Post New Signal</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-z-gray text-z-ink"
          >
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className={label}>Zone</span>
            <select className={field} value={form.zoneId} onChange={set("zoneId")}>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Pair / instrument</span>
            <input
              className={field}
              placeholder="e.g. XAU/USD"
              value={form.pair}
              onChange={set("pair")}
            />
            {errors.pair && (
              <span className="text-[11px] font-semibold text-z-red">
                {errors.pair}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Direction</span>
              <select
                className={field}
                value={form.direction}
                onChange={set("direction")}
              >
                <option>Buy</option>
                <option>Sell</option>
              </select>
            </div>
            <div>
              <span className={label}>Timeframe</span>
              <select
                className={field}
                value={form.timeframe}
                onChange={set("timeframe")}
              >
                <option>1H</option>
                <option>4H</option>
                <option>Daily</option>
              </select>
            </div>
          </div>
          <div>
            <span className={label}>Entry price / range</span>
            <input
              className={field}
              inputMode="decimal"
              placeholder="2,312.40 – 2,315.80"
              value={form.entry}
              onChange={set("entry")}
            />
            {errors.entry && (
              <span className="text-[11px] font-semibold text-z-red">
                {errors.entry}
              </span>
            )}
          </div>
          <div>
            <span className={label}>Stop loss</span>
            <input
              className={field}
              inputMode="decimal"
              placeholder="2,304.00"
              value={form.stopLoss}
              onChange={set("stopLoss")}
            />
            {errors.stopLoss && (
              <span className="text-[11px] font-semibold text-z-red">
                {errors.stopLoss}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Targets</span>
              <input
                className={field}
                inputMode="decimal"
                placeholder="2,328.00 / 2,341.50"
                value={form.targets}
                onChange={set("targets")}
              />
            </div>
            <div>
              <span className={label}>R:R (optional)</span>
              <input
                className={field}
                placeholder="1:2.4"
                value={form.rr}
                onChange={set("rr")}
              />
            </div>
          </div>
        </div>
        <button
          onClick={submit}
          className="mt-5 min-h-[48px] w-full rounded-xl bg-z-blue text-[15px] font-bold text-white active:brightness-95"
        >
          Publish to subscribers
        </button>
        <p className="mt-2 text-center text-[11px] text-z-mute">
          Goes live instantly in the selected zone. Stop loss is required.
        </p>
      </div>
    </div>
  );
}

/* ---------------- Manage zone (bottom sheet) ---------------- */

function ManageZoneSheet({ zone, onClose, onToggleStatus, onSave }) {
  const [name, setName] = useState(zone.name);
  const [fee, setFee] = useState(zone.fee);
  const [entryFee, setEntryFee] = useState(zone.entryFee);
  const field =
    "min-h-[44px] w-full rounded-xl border border-z-line bg-white px-3 text-[14px] text-z-ink outline-none focus:border-z-blue";
  const label = "mb-1.5 block text-[12px] font-semibold text-z-mute";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Manage ${zone.name}`}
    >
      <div
        className="w-full rounded-t-3xl z-surface p-5 sm:max-w-sm sm:rounded-3xl"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-z-ink">Manage Zone</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-z-gray text-z-ink"
          >
            <CloseIcon size={14} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <span className={label}>Zone name</span>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={label}>Subscription fee</span>
              <input
                className={field}
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
            <div>
              <span className={label}>Entry fee</span>
              <input
                className={field}
                value={entryFee}
                onChange={(e) => setEntryFee(e.target.value)}
              />
            </div>
          </div>
          <div className="rounded-xl bg-z-gray p-3 text-[12px] text-z-mute">
            <span className="block font-semibold text-z-ink">
              Status: {zone.status}
            </span>
            Pausing hides the zone from new subscriptions — existing subscribers
            keep access.
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            onClick={onToggleStatus}
            className="min-h-[46px] rounded-xl border border-z-line text-[14px] font-bold text-z-ink hover:bg-z-gray/50"
          >
            {zone.status === "Active" ? "Pause zone" : "Activate zone"}
          </button>
          <button
            onClick={() =>
              onSave({
                name: name.trim() || zone.name,
                fee: fee.trim() || zone.fee,
                entryFee: entryFee.trim() || zone.entryFee,
              })
            }
            className="min-h-[46px] rounded-xl bg-z-blue text-[14px] font-bold text-white active:brightness-95"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
