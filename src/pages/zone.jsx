import React, { useEffect, useState } from "react";
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
import { zoneTraders, zoneUser, zoneNotifications, zoneMembers, zoneLiveSignal, zoneSignalHistory, zoneJoined, analystProfile, analystZones, analystSignals } from "../lib/zoneData";
import { CheckIcon, ChevronRightIcon, ArrowUpIcon as UpIcon, ArrowDownIcon as DownIcon, ClockHistoryIcon, UserIcon, CloseIcon, PlusIcon, StarIcon as StarIc, EditIcon } from "../components/icons";
import { getTheme, toggleTheme } from "../lib/theme";

function ZoneShell({ children, tabs = false, onTab }) {
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

  useEffect(() => {
    if (tabParam === "zones") setTab("Zones");
    else if (tabParam === "top") setTab("Top-rated");
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
                {zoneJoined.map(({ traderId, joinedAt, renews, liveSignals }) => {
                  const t =
                    zoneTraders.find((x) => x.id === traderId) ||
                    zoneTraders[0];
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
                {zoneJoined.length === 0 && (
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
            <TopTraders traders={zoneTraders.slice(0, 4)} />
          </div>
        )}
        {tab === "Zones" && (
          <div>
            <h2 className="mb-3 text-[18px] font-semibold text-z-ink">
              Signal Zones
            </h2>
            <div className="space-y-4">
              {zoneTraders.map((t) => (
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
              {[...zoneTraders]
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
      </main>
    </ZoneShell>
  );
}

/* ---------------- Full trader directory ---------------- */

export function ZoneTradersPage() {
  return (
    <ZoneShell>
      <ZoneHeader title="All Traders" back />
      <main className="px-3 pt-4">
        <div className="space-y-3">
          {zoneTraders.map((t) => (
            <SignalZoneCard key={t.id} zone={t} />
          ))}
        </div>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Trader profile / zone details ---------------- */

export function ZoneTraderProfile() {
  const { traderId } = useParams();
  const navigate = useNavigate();
  const trader = zoneTraders.find((t) => t.id === traderId) || zoneTraders[0];
  const [preview, setPreview] = useState(null);

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
        <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-z-line z-surface px-4 py-3">
          <div className="mx-auto w-full max-w-[480px]">
            <ZoneButton
              className="w-full"
              onClick={() =>
                navigate("/zone/checkout", { state: { traderId: trader.id } })
              }
            >
              Subscribe Now · {trader.fee}
            </ZoneButton>
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
  const trader = zoneTraders.find((t) => t.id === traderId) || zoneTraders[0];
  const [tab, setTab] = useState("signal"); // signal | history | members
  const [tookSignal, setTookSignal] = useState(false);
  const onlineCount = zoneMembers.filter((m) => m.online).length;
  const live = zoneLiveSignal;
  const takersCount = live.takersCount + (tookSignal ? 1 : 0);

  const tabs = [
    { id: "signal", label: "Live Signal" },
    { id: "history", label: "History" },
    { id: "members", label: `Members (${zoneMembers.length})` },
  ];

  return (
    <div className="min-h-dvh z-page">
      <div className="app-max">
        <ZoneHeader title={trader.displayName} back />

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
                          {zoneMembers
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
                        {Math.round((takersCount / zoneMembers.length) * 100)}%
                        of zone
                      </span>
                    </div>

                    <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-z-gray">
                      <div
                        className="h-full rounded-full bg-z-blue transition-all duration-500"
                        style={{
                          width: `${(takersCount / zoneMembers.length) * 100}%`,
                        }}
                      />
                    </div>

                    <ZoneButton
                      variant={tookSignal ? "outline" : "blue"}
                      className="mt-3 w-full min-h-[42px] text-[14px]"
                      aria-pressed={tookSignal}
                      onClick={() => setTookSignal((v) => !v)}
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
                {zoneMembers.map((m) => (
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
                ))}
              </div>
            </>
          )}
        </main>

        <div className="h-24" />
        <ZoneBottomNav />
      </div>
    </div>
  );
}

/* ---------------- Notifications ---------------- */

export function ZoneNotificationsPage() {
  return (
    <ZoneShell>
      <ZoneHeader title="Notifications" back />
      <main className="px-3 pt-4">
        <div className="space-y-3">
          {zoneNotifications.map((n) => (
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
  const trader = zoneTraders[0];

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
            <ZoneButton className="w-full" onClick={() => setState("done")}>
              Pay {trader.fee}
            </ZoneButton>
            <p className="text-center text-[11px] text-z-mute">
              Demo checkout — no real payment is processed.
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
              You now have access to the {trader.name} signal zone. (Demo state
              — a real backend payment provider must confirm actual
              transactions.)
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
  return (
    <ZoneShell>
      <ZoneHeader title="My Subscriptions" back />
      <main className="px-3 pt-4">
        <div className="space-y-3">
          {zoneTraders.slice(0, 2).map((t, i) => (
            <div
              key={t.id}
              className="z-card flex items-center gap-3 p-4"
            >
              <ZoneAvatar name={t.name} size={44} />
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-z-ink">
                  {t.name}
                </div>
                <div className="text-[12px] text-z-mute">
                  {i === 0 ? "Renews 16 Oct 2026" : "Active · Free zone"}
                </div>
              </div>
              <Link to={`/zone/trader/${t.id}`} className="ml-auto">
                <ZoneButton
                  variant="outline"
                  className="min-h-[36px] px-3 text-[13px]"
                >
                  Open
                </ZoneButton>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Profile ---------------- */

export function ZoneProfilePage() {
  return (
    <ZoneShell>
      <ZoneHeader title="Profile" back />
      <main className="px-3 pt-4">
        <section className="z-card flex flex-col items-center p-6">
          <ZoneAvatar name={zoneUser.name} size={72} ring />
          <h2 className="mt-3 text-[18px] font-bold text-z-ink">
            {zoneUser.name}
          </h2>
          <p className="text-[13px] text-z-mute">{zoneUser.email}</p>
        </section>
        <section className="z-card mt-3 px-4">
          {
            [
            ["Plan", "Free member"],
            ["Zones joined", "2"],
            ["Member since", "Mar 2026"],
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
        <Link to="/zone/analyst" className="z-card mt-3 flex items-center gap-3 p-4">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f2d68a] text-[#0b0b0b]"
            aria-hidden="true"
          >
            <StarIc size={18} filled />
          </span>
          <span className="flex-1">
            <span className="block text-[15px] font-semibold text-z-ink">
              Analyst Studio
            </span>
            <span className="block text-[12px] text-z-mute">
              Create and manage zones, post signals
            </span>
          </span>
          <ChevronRightIcon size={18} />
        </Link>
      </main>
    </ZoneShell>
  );
}

/* ---------------- Settings ---------------- */

export function ZoneSettingsPage() {
  const [notify, setNotify] = useState(true);
  const [dark, setDark] = useState(getTheme() === "dark");
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
        <button className="z-card mt-4 w-full py-3.5 text-[15px] font-semibold text-z-red">
          Logout
        </button>
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
  const [signal, setSignal] = useState(null); // signal being composed
  const [managing, setManaging] = useState(null); // zone being edited
  const [toast, setToast] = useState("");
  const [posted, setPosted] = useState(analystSignals);
  const [tab, setTab] = useState("signals"); // signals | zones

  const zones = analystZones;
  const liveCount = posted.filter((s) => s.status === "Live").length;
  const totalTakers = posted.reduce((a, s) => a + s.takers, 0);
  const wins = posted.filter((s) => s.status === "Target hit").length;
  const closed = posted.filter((s) =>
    ["Target hit", "Stopped out", "Breakeven"].includes(s.status),
  ).length;

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  };

  const publishSignal = (draft) => {
    setPosted([
      {
        id: `asig-${Date.now()}`,
        zoneId: draft.zoneId,
        pair: draft.pair,
        direction: draft.direction,
        status: "Live",
        entry: draft.entry,
        stopLoss: draft.stopLoss,
        targets: draft.targets,
        rr: draft.rr || "—",
        timeframe: draft.timeframe,
        postedAt: "Just now",
        takers: 0,
      },
      ...posted,
    ]);
    setSignal(null);
    flash("Signal published to your subscribers");
  };

  const toggleZoneStatus = (zone) => {
    zone.status = zone.status === "Active" ? "Paused" : "Active";
    setManaging({ ...zone });
    flash(zone.status === "Active" ? "Zone activated" : "Zone paused");
  };

  return (
    <ZoneShell>
      <ZoneHeader title="Analyst" />

      {/* owner header */}
      <section className="z-surface flex items-center gap-3 px-4 pb-4 pt-3">
        <ZoneAvatar name={analystProfile.name} size={52} ring />
        <div className="min-w-0">
          <h2 className="truncate text-[16px] font-bold text-z-ink">
            {analystProfile.name}
          </h2>
          <div className="flex items-center gap-1.5 text-[12px] text-z-mute">
            <StarIc size={12} filled /> {analystProfile.rating} ·{" "}
            {analystProfile.reviewCount} reviews
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
          ["signals", `Signals (${posted.length})`],
          ["zones", `My Zones (${zones.length})`],
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
              {posted.map((s) => (
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
              ))}
              {posted.length === 0 && (
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
          onSave={(patch) => {
            Object.assign(managing, patch);
            setManaging(null);
            flash("Zone updated");
          }}
        />
      )}

      {toast && (
        <div
          role="status"
          className="safe-bottom fixed inset-x-0 bottom-24 z-50 flex justify-center px-6"
        >
          <span className="rounded-full bg-z-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg">
            {toast}
          </span>
        </div>
      )}
    </ZoneShell>
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
