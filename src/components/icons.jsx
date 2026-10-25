import React from "react";

/* Lightweight stroke icon set (24x24 viewBox, currentColor).
   Replaces emoji glyphs across the app so icons render consistently
   on every platform and match the design system. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function Svg({ size = 18, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      {...base}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ size, active }) {
  return (
    <Svg size={size} strokeWidth={active ? 2.2 : 1.8}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h5v-5h4v5h5V9.5" />
    </Svg>
  );
}

export function SignalIcon({ size, active }) {
  return (
    <Svg size={size} strokeWidth={active ? 2.2 : 1.8}>
      <path d="M3 20h18" />
      <path d="m5 15 4.5-4.5 3 3L17 9l3-3" />
    </Svg>
  );
}

export function HeartIcon({ size, filled = false }) {
  return (
    <Svg
      size={size}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 0 : 1.8}
    >
      <path d="M12 20.5S3.5 15 3.5 9.3A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.7C20.5 15 12 20.5 12 20.5Z" />
    </Svg>
  );
}

export function BellIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </Svg>
  );
}

export function UserIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </Svg>
  );
}

export function GridIcon({ size, active }) {
  return (
    <Svg size={size} strokeWidth={active ? 2.2 : 1.8}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

export function PlusIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function CheckCircleIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </Svg>
  );
}

export function CheckIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="m5 13 4 4 10-10" />
    </Svg>
  );
}

export function SearchIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </Svg>
  );
}

export function InboxIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M3 13.5 5.5 5h13L21 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19Z" />
      <path d="M3 13.5h5a4 4 0 0 0 8 0h5" />
    </Svg>
  );
}

export function ClockIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  );
}

export function ClockHistoryIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" />
      <path d="M3 4v4h4" />
      <path d="M12 8v4l2.8 1.8" />
    </Svg>
  );
}

export function CardIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="2.5" y="5" width="19" height="14" rx="3" />
      <path d="M2.5 10h19" />
    </Svg>
  );
}

export function FileIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M6 3h8l4 4v14H6Z" />
      <path d="M14 3v4h4" />
    </Svg>
  );
}

export function MailIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </Svg>
  );
}

export function KeyIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="8.5" cy="14.5" r="4" />
      <path d="m11.5 11.5 7-7 2 2-2 2" />
    </Svg>
  );
}

export function LockIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.5" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </Svg>
  );
}

export function ShieldIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 3 5 5.5V12c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V5.5Z" />
    </Svg>
  );
}

export function WarningIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 4 2.8 20h18.4Z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ArrowLeftIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </Svg>
  );
}

export function ArrowRightIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function ChevronRightIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="m9 5 7 7-7 7" />
    </Svg>
  );
}

export function ChevronDownIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="m5 9 7 7 7-7" />
    </Svg>
  );
}

export function ArrowUpIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2.4}>
      <path d="M12 19V6" />
      <path d="m6 11 6-6 6 6" />
    </Svg>
  );
}

export function ArrowDownIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2.4}>
      <path d="M12 5v13" />
      <path d="m6 13 6 6 6-6" />
    </Svg>
  );
}

export function CloseIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Svg>
  );
}

export function EyeIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function EyeOffIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M9.9 5.8A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-2.4 3.2" />
      <path d="M6.1 7.3A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4.3-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="m3 3 18 18" />
    </Svg>
  );
}

export function LogoutIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M9 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M15 8l4 4-4 4" />
      <path d="M19 12H9" />
    </Svg>
  );
}

export function PowerIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 3v9" />
      <path d="M6.2 6.6a8 8 0 1 0 11.6 0" />
    </Svg>
  );
}

export function TrendUpIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="m3.5 17 5.5-5.5 3.5 3.5 8-8" />
      <path d="M15 7h5.5v5.5" />
    </Svg>
  );
}

export function StarIcon({ size, filled = false }) {
  return (
    <Svg
      size={size}
      fill={filled ? "currentColor" : "none"}
      strokeWidth={filled ? 0 : 1.8}
    >
      <path d="m12 3.2 2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.5l6-.9Z" />
    </Svg>
  );
}

export function GearIcon({ size, active }) {
  return (
    <Svg size={size} strokeWidth={active ? 2.2 : 1.8}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M2.5 12h3M18.5 12h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" />
    </Svg>
  );
}

export function WalletIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function PauseIcon({ size }) {
  return (
    <Svg size={size} fill="currentColor" strokeWidth={0}>
      <rect x="7" y="5" width="3.4" height="14" rx="1.4" />
      <rect x="13.6" y="5" width="3.4" height="14" rx="1.4" />
    </Svg>
  );
}

export function PlayIcon({ size }) {
  return (
    <Svg size={size} fill="currentColor" strokeWidth={0}>
      <path d="M8 5.5v13l11-6.5Z" />
    </Svg>
  );
}

export function ArrowIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2.2}>
      <path d="M5 12h13" />
      <path d="m13 6.5 5.5 5.5-5.5 5.5" />
    </Svg>
  );
}

export function TerminalIcon({ size }) {
  return (
    <Svg size={size}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="m7 9 3 3-3 3" />
      <path d="M13 15h4" />
    </Svg>
  );
}

export function CompassIcon({ size }) {
  return (
    <Svg size={size}>
      <circle cx="12" cy="12" r="8.5" />
      <path
        d="m15 9-1.8 4.2L9 15l1.8-4.2Z"
        fill="currentColor"
        strokeWidth={0}
      />
    </Svg>
  );
}

export function GraduationIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="m12 4 10 4.5L12 13 2 8.5Z" />
      <path d="M6 10.5V15c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
    </Svg>
  );
}

export function ReceiptIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21Z" />
      <path d="M9.5 8h5M9.5 12h5" />
    </Svg>
  );
}

export function EditIcon({ size }) {
  return (
    <Svg size={size}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </Svg>
  );
}

export function WaveIcon({ size }) {
  return (
    <Svg size={size} strokeWidth={2}>
      <path d="M4 13c1.5-2.5 3-2.5 4.5 0s3 2.5 4.5 0 3-2.5 4.5 0" />
    </Svg>
  );
}
