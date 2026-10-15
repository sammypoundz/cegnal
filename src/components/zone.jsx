import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  zoneTraders,
  zoneNotifications,
  zoneCatalogLabels,
} from "../lib/zoneData";
import {
  GridIcon,
  SignalIcon,
  StarIcon,
  CheckIcon,
  WalletIcon,
  BellIcon,
  GearIcon,
  UserIcon,
  CloseIcon,
  PowerIcon,
  TrendUpIcon,
  ArrowLeftIcon,
} from "./icons";

/* ---------------- Shared bits ---------------- */

export function ZoneAvatar({ name, size = 40, ring = false }) {
  const initials = name
    .replace(/[^a-zA-Z]/g, "")
    .slice(0, 2)
    .toUpperCase();
  const palette = ["#c99a2e", "#0b0b0b", "#7a5c14", "#b54708", "#3d3d3d"];
  const bg = palette[(name.length + name.charCodeAt(0)) % palette.length];
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.38,
      }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${
        ring ? "ring-2 ring-z-blue ring-offset-2" : ""
      }`}
    >
      {initials}
    </span>
  );
}

export function ZoneStars({ rating = 0, size = 14, max = 5 }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < Math.round(rating) ? "var(--color-z-amber)" : "none"}
          stroke={i < Math.round(rating) ? "var(--color-z-amber)" : "#c9ccd1"}
          strokeWidth="1.6"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export function ZoneButton({ variant = "blue", className = "", ...props }) {
  const variants = {
    blue: "bg-z-blue text-white active:brightness-95 hover:brightness-105",
    charcoal: "bg-z-charcoal text-white hover:bg-[#2b2b2b]",
    outline: "border border-z-line z-surface text-z-ink hover:bg-z-gray/50",
  };
  return (
    <button
      className={`inline-flex min-h-[44px] items-center justify-center rounded-[10px] px-4 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

/* ---------------- App header ---------------- */

export function ZoneHeader({ title, back = false, right = null }) {
  const navigate = useNavigate();
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-z-line z-surface">
      <div className="mx-auto flex h-14 w-full max-w-[480px] items-center gap-2 px-4">
        {back ? (
          <button
            onClick={() =>
              window.history.length > 1 ? navigate(-1) : navigate("/zone")
            }
            aria-label="Go back"
            className="flex h-10 w-10 items-center justify-center rounded-full text-z-ink hover:bg-z-gray"
          >
            <ArrowLeftIcon size={20} />
          </button>
        ) : (
          <NotificationButton />
        )}
        {title && (
          <h1 className="truncate text-[17px] font-semibold text-z-ink">
            {title}
          </h1>
        )}
        <div className="ml-auto flex items-center gap-2">
          {right ?? (back ? null : <ZoneDrawerButton />)}
        </div>
      </div>
    </header>
  );
}

export function NotificationButton() {
  const unread = zoneNotifications.filter((n) => !n.read).length;
  return (
    <Link
      to="/zone/notifications"
      aria-label="Notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full border border-z-line text-z-ink"
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-z-red" />
      )}
    </Link>
  );
}

export function ZoneDrawerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-full text-z-ink hover:bg-z-gray"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>
      <ZoneDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const drawerLinks = [
  { to: "/zone", label: "Dashboard", Icon: GridIcon },
  { to: "/zone?tab=zones", label: "Signal Zones", Icon: SignalIcon },
  { to: "/zone?tab=top", label: "Top Traders", Icon: StarIcon },
  { to: "/zone/subscriptions", label: "My Subscriptions", Icon: CheckIcon },
  { to: "/zone/checkout", label: "Transaction History", Icon: WalletIcon },
  { to: "/zone/notifications", label: "Notifications", Icon: BellIcon },
  { to: "/zone/settings", label: "Settings", Icon: GearIcon },
  { to: "/zone/profile", label: "Profile", Icon: UserIcon },
];

export function ZoneDrawer({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className="safe-top h-full w-[280px] z-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-z-line px-4 py-4">
          <span className="text-lg font-extrabold tracking-tight text-z-ink">
            Signal Zone
          </span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-full text-z-mute hover:bg-z-gray"
          >
            <CloseIcon size={18} />
          </button>
        </div>
        <nav className="flex flex-col p-2">
          {drawerLinks.map((l) => (
            <Link
              key={l.label}
              to={l.to}
              onClick={onClose}
              className="flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-z-ink hover:bg-z-gray/60"
            >
              <span aria-hidden="true" className="flex w-5 justify-center text-z-blue">
                <l.Icon size={18} />
              </span>
              {l.label}
            </Link>
          ))}
          <button
            onClick={onClose}
            className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-z-red hover:bg-z-gray/60"
          >
            <span aria-hidden="true" className="flex w-5 justify-center">
              <PowerIcon size={18} />
            </span>{" "}
            Logout
          </button>
        </nav>
      </aside>
    </div>
  );
}

/* ---------------- Bottom navigation ---------------- */

export function ZoneBottomNav() {
  const { pathname, search } = useLocation();
  const isZoneTab = search.includes("tab=zones");
  const tabs = [
    { to: "/zone", label: "Dashboard", end: true, icon: DashboardIcon },
    {
      to: "/zone?tab=zones",
      label: "Signal Zone",
      end: false,
      icon: ZoneChartIcon,
    },
    { to: "/zone/settings", label: "Settings", end: true, icon: ZoneGearIcon },
  ];
  return (
    <nav
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto w-full max-w-[480px] px-4 pb-3">
        <div
          className="z-dock relative flex items-center justify-between gap-1 rounded-full px-2 py-1.5 backdrop-blur"
        >
          {tabs.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              end={end}
              className="group"
              aria-label={label}
            >
              {({ isActive }) => {
                // Exactly one tab can be active: each tab owns an exclusive
                // set of routes, evaluated from the current location.
                const active =
                  label === "Dashboard"
                    ? pathname === "/zone" && !isZoneTab
                    : label === "Signal Zone"
                      ? isZoneTab
                      : pathname.startsWith("/zone/settings");
                void isActive;
                return (
                  <span
                    className={`relative flex min-h-[44px] items-center gap-2 rounded-full px-3 transition-all duration-300 ${
                      active
                        ? "z-dock-active"
                        : "bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        active
                          ? "bg-gradient-to-b from-[#f2d68a] to-[#c99a2e] shadow-[0_0_10px_rgba(201,154,46,0.55),inset_0_1px_0_rgba(255,255,255,0.5)]"
                          : "bg-transparent"
                      }`}
                    >
                      <span
                        className={`transition-colors duration-300 ${
                          active ? "text-[#0b0b0b]" : "text-[#6b6f78] group-hover:text-[#c99a2e]"
                        }`}
                      >
                        <Icon active={active} />
                      </span>
                    </span>
                    {/* label: hidden for inactive tabs, slides in when active */}
                    <span
                      aria-hidden={!active}
                      className={`overflow-hidden whitespace-nowrap text-[12px] font-bold tracking-wide transition-all duration-300 ${
                        active
                          ? "max-w-[110px] opacity-100 text-gold"
                          : "max-w-0 opacity-0"
                      }`}
                    >
                      {label}
                    </span>
                  </span>
                );
              }}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

function DashboardIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ZoneChartIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
    >
      <path d="M3 3v18h18" />
      <path d="M7 14l4-4 3 3 6-8" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ZoneGearIcon({ active }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1" />
    </svg>
  );
}

/* ---------------- Promotional banner ---------------- */

export function PromotionalBanner() {
  return (
    <div className="mx-auto w-full max-w-[480px] px-3 pt-3">
      <div
        className="relative h-[190px] w-full overflow-hidden rounded-[14px]"
        style={{
          background:
            "linear-gradient(120deg,#0b0b0b 0%,#161006 45%,#3a2c07 100%)",
        }}
        role="img"
        aria-label="The Best Place for Forex Trading"
      >
        {/* decorative glow */}
        <div
          aria-hidden="true"
          className="absolute -left-10 top-6 h-40 w-40 rounded-full bg-z-blue/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-6 h-32 w-32 rounded-full bg-[#f2c14e]/25 blur-3xl"
        />
        {/* chart line */}
        <svg
          aria-hidden="true"
          viewBox="0 0 400 200"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,160 60,140 110,150 160,110 210,120 260,80 320,90 400,40"
            fill="none"
            stroke="#c99a2e"
            strokeWidth="2.5"
          />
          <polyline
            points="0,170 70,155 130,160 190,130 250,140 310,105 400,70"
            fill="none"
            stroke="#f2c14e"
            strokeWidth="1.5"
            opacity="0.6"
          />
        </svg>
        {/* phone mock */}
        <div
          aria-hidden="true"
          className="absolute bottom-4 right-5 h-[110px] w-[62px] rounded-[10px] border border-white/20 bg-white/5 p-1.5 backdrop-blur-sm"
        >
          <svg viewBox="0 0 60 80" className="h-full w-full">
            <polyline
              points="2,68 12,58 20,62 30,44 40,50 54,18"
              fill="none"
              stroke="#4dffa0"
              strokeWidth="2.5"
            />
          </svg>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center px-5">
          <h2 className="max-w-[220px] text-[22px] font-extrabold leading-tight text-white">
            The Best Place for Forex Trading
          </h2>
          <span className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-z-blue px-3 py-1 text-[11px] font-semibold text-black">
            <span className="h-1.5 w-1.5 rounded-full bg-black" />
            Live zones
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Category tabs ---------------- */

export function CategoryTabs({ active, onChange }) {
  const tabs = ["All", "Zones", "Top-rated"];
  return (
    <div className="sticky top-14 z-30 mx-auto w-full max-w-[480px] border-b border-z-line z-surface">
      <div className="flex">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => onChange(t)}
            aria-current={active === t ? "true" : undefined}
            className={`relative flex-1 py-3 text-center text-[14px] font-medium transition-colors ${
              active === t ? "text-z-ink" : "text-z-mute"
            }`}
          >
            {t}
            <span
              className={`absolute inset-x-1/4 bottom-0 h-[2.5px] rounded-full transition-all ${
                active === t ? "bg-z-ink opacity-100" : "opacity-0"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Cards ---------------- */

export function SubscriptionCard() {
  const due = 1;
  return (
    <section className="z-card p-4">
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-z-blue-soft text-z-blue"
          aria-hidden="true"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <rect x="2" y="5" width="20" height="14" rx="3" />
            <path d="M2 10h20" />
          </svg>
        </span>
        <h2 className="text-[15px] font-semibold text-z-ink">
          Upcoming subscription
        </h2>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[13px] text-z-mute">{due} Payment Due</span>
        <Link to="/zone/checkout">
          <ZoneButton className="min-h-[36px] px-4 text-[13px]">
            Subscribe
          </ZoneButton>
        </Link>
      </div>
      <hr className="my-3 border-z-line" />
      {zoneTraders.slice(0, 1).map((t) => (
        <Link
          key={t.id}
          to={`/zone/trader/${t.id}`}
          className="flex items-center gap-3"
        >
          <ZoneAvatar name={t.name} size={36} />
          <span className="text-[15px] font-semibold text-z-ink">{t.name}</span>
          <span className="ml-auto text-[15px] font-bold text-z-ink">
            {t.fee}
          </span>
        </Link>
      ))}
    </section>
  );
}

export function TraderCard({ trader }) {
  return (
    <Link
      to={`/zone/trader/${trader.id}`}
      className="z-card flex w-[118px] shrink-0 flex-col items-center px-3 py-4"
    >
      <ZoneAvatar name={trader.name} size={52} />
      <span className="mt-2 w-full truncate text-center text-[13px] font-semibold text-z-ink">
        {trader.name}
      </span>
      <span className="text-[12px] font-bold text-z-blue">{trader.fee}</span>
      <span className="mt-1 flex items-center gap-1 text-[11px] text-z-mute">
        <ZoneStars rating={trader.rating} size={10} /> {trader.rating}
      </span>
    </Link>
  );
}

export function TopTraders({ traders }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[17px] font-semibold text-z-ink">Top Traders</h2>
        <Link
          to="/zone/traders"
          className="text-[13px] font-semibold text-z-blue"
        >
          View all
        </Link>
      </div>
      <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-1">
        {traders.map((t) => (
          <TraderCard key={t.id} trader={t} />
        ))}
      </div>
    </section>
  );
}

export function SignalZoneCard({ zone }) {
  return (
    <article className="z-card p-4">
      <div className="flex items-center gap-3">
        <ZoneAvatar name={zone.name} size={40} />
        <span className="text-[16px] font-semibold text-z-ink">
          {zone.name}
        </span>
        <div className="ml-auto flex flex-col items-end">
          <span className="text-[12px] text-z-mute">
            {zone.reviewCount} Reviews
          </span>
          <ZoneStars rating={zone.rating} size={13} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 rounded-xl bg-z-gray py-3">
        {[
          [zone.entryFee, "Entry Fee"],
          [zone.subscribers, "Subscribers"],
          [zone.winRate, "Win Rates"],
        ].map(([value, label], i) => (
          <div
            key={label}
            className={`flex flex-col items-center ${i > 0 ? "border-l border-[#d7d7d7]" : ""}`}
          >
            <span className="text-[17px] font-bold text-z-ink">{value}</span>
            <span className="text-[11px] text-z-mute">{label}</span>
          </div>
        ))}
      </div>

      <Link to={`/zone/trader/${zone.id}`} className="mt-3 block">
        <ZoneButton variant="charcoal" className="w-full">
          View Details
        </ZoneButton>
      </Link>
    </article>
  );
}

/* ---------------- Profile catalog ---------------- */

export function CatalogGrid({ trader, onOpen }) {
  return (
    <div className="z-card p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-z-ink">Catalogs</h3>
        <span className="text-[12px] font-semibold text-z-blue">
          {trader.catalogs.length} available
        </span>
      </div>
      <p className="mb-4 text-[12px] text-z-mute">
        Resources included with your zone access
      </p>
      <div className="grid grid-cols-2 gap-3">
        {trader.catalogs.map((c) => {
          const meta = zoneCatalogLabels[c] || {
            label: c,
            Icon: TrendUpIcon,
            desc: "Zone resource",
            count: "Included",
            bg: "#0b1220",
          };
          return (
            <button
              key={c}
              onClick={() => onOpen(meta)}
              className="relative flex flex-col overflow-hidden rounded-2xl p-4 text-left shadow-[0_8px_20px_-8px_rgba(11,11,11,0.45)] transition-transform active:scale-[0.98]"
              style={{ background: meta.bg }}
              aria-label={`Open catalog: ${meta.label}`}
            >
              {/* decorative layer */}
              <svg
                aria-hidden="true"
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
                className="absolute inset-x-0 top-0 h-16 w-full opacity-30"
              >
                <polyline
                  points="0,50 20,38 40,44 65,20 100,8"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                />
              </svg>
              <span
                aria-hidden="true"
                className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10"
              />

              {/* icon tile */}
              <span
                aria-hidden="true"
                className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#0b0b0b] shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
              >
                <meta.Icon size={22} />
              </span>

              {/* text block — high contrast */}
              <span className="relative mt-4">
                <span className="block text-[15px] font-extrabold leading-tight text-white">
                  {meta.label}
                </span>
                <span className="mt-1 block text-[12px] font-medium leading-snug text-white/90">
                  {meta.desc}
                </span>
              </span>

              {/* footer: count + open affordance */}
              <span className="relative mt-3 flex items-center justify-between border-t border-white/25 pt-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wide text-white/95">
                  {meta.count}
                </span>
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#0b0b0b]"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

