import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import appLogo from "../assets/Group 15776.png";
import appIcon from "../assets/Frame 156243.png";
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import {
  HomeIcon,
  SignalIcon,
  HeartIcon,
  BellIcon,
  UserIcon,
  GridIcon,
  PlusIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "./icons";

const memberTabs = [
  { to: "/app", label: "Home", Icon: HomeIcon },
  { to: "/app/signals", label: "Signals", Icon: SignalIcon },
  { to: "/app/saved", label: "Saved", Icon: HeartIcon },
  { to: "/app/notifications", label: "Alerts", Icon: BellIcon, badge: true },
  { to: "/app/profile", label: "Profile", Icon: UserIcon },
];

const roleTabs = [
  { to: "/work", label: "Overview", Icon: GridIcon },
  { to: "/work/signals/new", label: "Create Signal", Icon: PlusIcon },
  { to: "/work/queue", label: "Review Queue", Icon: CheckCircleIcon },
  { to: "/work/signals", label: "Signals", Icon: SignalIcon },
  { to: "/work/users", label: "Users", Icon: UserIcon },
];

export function TopBar({ title, back, action }) {
  return (
    <header className="safe-top sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[480px] items-center gap-2 px-4 md:max-w-[768px] xl:max-w-[1104px]">
        {back ? (
          <BackButton />
        ) : (
          <Link
            to="/"
            className="flex items-center"
            aria-label="Cegnal home"
          >
            <AppLogo height={44} />
          </Link>
        )}
        {title && (
          <h1 className="truncate text-[15px] font-bold text-body">{title}</h1>
        )}
        <div className="ml-auto flex items-center gap-1">{action}</div>
      </div>
    </header>
  );
}

export function BackButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() =>
        window.history.length > 1 ? navigate(-1) : navigate("/app")
      }
      aria-label="Go back"
      className="flex h-11 w-11 items-center justify-center rounded-full text-body hover:bg-canvas"
    >
      <ArrowLeftIcon size={20} />
    </button>
  );
}

/* Full logo (wordmark + icon). Use in headers and auth screens.
   Has a fixed black background so the wordmark stays visible on any theme.
   The image keeps its natural aspect ratio (no squashing/compression). */
export function AppLogo({ height = 40, className = "" }) {
  return (
    <span
      className="inline-flex items-center rounded-lg"
      style={{
        background: "#0b0b0b",
        padding: `${Math.round(height * 0.09)}px ${Math.round(height * 0.35)}px`,
      }}
    >
      <img
        src={appLogo}
        alt="Cegnal"
        style={{ height, width: "auto" }}
        className={`inline-block object-contain ${className}`}
      />
    </span>
  );
}

export function BrandMark({ size = 28 }) {
  return (
    <img
      src={appIcon}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="inline-block rounded-lg object-contain"
    />
  );
}

/* Unread notification count, straight from the database. */
function useUnreadCount() {
  const [unread, setUnread] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api("/notifications")
      .then((d) => {
        if (!cancelled) setUnread(d.unread || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return unread;
}

export function BottomNav({ role }) {
  const tabs = role === "member" ? memberTabs : roleTabs;
  const unread = useUnreadCount();
  return (
    <nav
      className="safe-bottom app-fixed fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-[480px]">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === "/app" || t.to === "/work"}
            className={({ isActive }) =>
              `relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-semibold ${
                isActive ? "text-gold" : "text-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative" aria-hidden="true">
                  <t.Icon size={20} active={isActive} />
                  {t.badge && unread > 0 && (
                    <span className="absolute -right-2.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[9px] font-bold text-white">
                      {unread}
                    </span>
                  )}
                </span>
                <span>{t.label}</span>
                {isActive && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Page({
  title,
  back,
  action,
  children,
  role = "member",
  _wide = false,
}) {
  return (
    <div className="app-max app-page">
      <TopBar title={title} back={back} action={action} />
      <main className="px-4 pb-28 pt-4">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
