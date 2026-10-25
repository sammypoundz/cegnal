import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../lib/theme";
import { AppLogo } from "./shell";

/* Native-app style onboarding slides for the index page */

const SLIDES = [
  {
    id: "welcome",
    emoji: "📈",
    title: "Structured trade signals, made clear.",
    body: "Follow analyst setups with clear entry, stop-loss and target levels — free and premium access.",
  },
  {
    id: "how",
    emoji: "🧭",
    title: "Read every level with confidence.",
    body: "Entry, stop loss and targets are shown clearly for each signal. Filter by instrument, direction and timeframe.",
  },
  {
    id: "plans",
    emoji: "⚡",
    title: "Start free. Upgrade any time.",
    body: "Create a free account in seconds, then unlock premium signal detail whenever you're ready.",
  },
  {
    id: "risk",
    emoji: "🛡️",
    title: "Trade with a plan, always.",
    body: "Signals are ideas, not guarantees. We surface risk notes on every call so you can manage your own risk.",
  },
];

export default function Onboarding() {
  const theme = useTheme();
  const dark = theme === "dark";
  const [index, setIndex] = useState(0);
  const [dx, setDx] = useState(0); // live drag offset for slide-follow effect
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef(null);
  const count = SLIDES.length;
  const last = index === count - 1;

  const goTo = useCallback(
    (i) => setIndex(Math.min(Math.max(i, 0), count - 1)),
    [count],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  /* keyboard navigation (desktop) */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, next, goTo]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
    setDragging(true);
  };
  const onTouchMove = (e) => {
    if (touchStart.current === null) return;
    setDx(e.touches[0].clientX - touchStart.current);
  };
  const onTouchEnd = () => {
    if (touchStart.current === null) return;
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
    setDx(0);
    setDragging(false);
  };

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 ${
        dark ? "bg-[#0c1116] text-white" : "bg-[#f4f1e8] text-ink"
      }`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Cegnal introduction"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* gold accent line — subtle, not glowing */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-[max(4rem,calc(env(safe-area-inset-top)+4rem))] h-px ${
          dark ? "bg-gold/30" : "bg-gold/50"
        }`}
      />

      {/* top bar: brand + skip */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <span className="flex items-center">
          <AppLogo height={40} />
        </span>
        {!last && (
          <Link
            to="/register"
            className={`rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors ${
              dark
                ? "text-white/60 hover:text-white"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            Skip
          </Link>
        )}
      </div>

      {/* slides — horizontal track that follows the finger */}
      <div className="relative z-10 flex flex-1 items-center">
        <div
          className="flex w-full"
          style={{
            transform: `translateX(calc(${-index * 100}% + ${dx}px))`,
            transition: dragging
              ? "none"
              : "transform 450ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== index}
              className="w-full shrink-0 px-8"
              style={{
                opacity: i === index ? 1 : 0.35,
                transition: "opacity 450ms ease",
              }}
            >
              {/* illustration — flat, solid app-icon style tile */}
              <div
                className={`mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-[22px] ring-1 ${
                  dark
                    ? "bg-[#1a222e] ring-white/10"
                    : "bg-white ring-ink/10 shadow-sm"
                }`}
              >
                <span
                  className="text-[44px] leading-none"
                  style={{
                    transform: `scale(${i === index ? 1 : 0.92})`,
                    transition: "transform 450ms cubic-bezier(0.22,1,0.36,1)",
                  }}
                  role="img"
                  aria-label=""
                >
                  {s.emoji}
                </span>
              </div>

              <h1 className="text-center text-[26px] font-extrabold leading-tight tracking-tight">
                {s.title}
              </h1>
              <p
                className={`mx-auto mt-3 max-w-[320px] text-center text-[15px] leading-relaxed ${
                  dark ? "text-white/65" : "text-ink/65"
                }`}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* bottom controls */}
      <div className="relative z-10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {/* progress dots */}
        <div className="mb-5 flex justify-center gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-7 bg-gold"
                  : dark
                    ? "w-2 bg-white/25 hover:bg-white/40"
                    : "w-2 bg-ink/20 hover:bg-ink/35"
              }`}
            />
          ))}
        </div>

        {last ? (
          <div className="flex flex-col gap-3">
            <Link to="/register" className="block">
              <button
                type="button"
                className="w-full rounded-2xl bg-gold py-4 text-[15px] font-bold text-[#101820] transition-transform active:scale-[0.98]"
              >
                Create free account
              </button>
            </Link>
            <Link to="/login" className="block">
              <button
                type="button"
                className={`w-full rounded-2xl border py-4 text-[15px] font-bold transition-transform active:scale-[0.98] ${
                  dark
                    ? "border-white/15 bg-white/5 text-white"
                    : "border-ink/15 bg-white/60 text-ink"
                }`}
              >
                I already have an account
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/register" className="flex-1">
              <button
                type="button"
                className={`w-full rounded-2xl border py-4 text-[15px] font-bold transition-transform active:scale-[0.98] ${
                  dark
                    ? "border-white/15 bg-white/5 text-white"
                    : "border-ink/15 bg-white/60 text-ink"
                }`}
              >
                Get started
              </button>
            </Link>
            <button
              type="button"
              onClick={next}
              className="flex-1 rounded-2xl bg-gold py-4 text-[15px] font-bold text-[#101820] transition-transform active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        )}

        <p
          className={`mt-3 text-center text-[11px] ${
            dark ? "text-white/40" : "text-ink/45"
          }`}
        >
          Swipe to explore · Trading involves risk
        </p>
      </div>
    </div>
  );
}
