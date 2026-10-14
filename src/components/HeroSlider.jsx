﻿import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowIcon, PauseIcon, PlayIcon } from "./icons";
import heroResources from "../assets/hero-resources.svg";
import heroSignals from "../assets/hero-signals.svg";
import heroPremium from "../assets/hero-premium.svg";
import heroZones from "../assets/hero-zones.svg";

const AUTOPLAY_MS = 5000;

const SLIDES = [
  {
    id: "resources",
    title: "Free trading resources",
    body: "Courses, chart templates and risk tools — everything you need to trade with structure.",
    cta: { label: "Browse resources", to: "/how-it-works" },
    image: heroResources,
    alt: "Candlestick chart with a rising trend line",
    chip: { label: "New", tone: "#4dffa0" },
  },
  {
    id: "signals",
    title: "Structured trade signals",
    body: "Every setup arrives with a clear entry range, stop loss and targets before you commit.",
    cta: { label: "See a sample signal", to: "/how-it-works" },
    image: heroSignals,
    alt: "Chart marked with entry, stop-loss and target levels",
    chip: { label: "Daily setups", tone: "#ffd66b" },
  },
  {
    id: "premium",
    title: "Go premium, see everything",
    body: "Unlock full analyst rationale, update history and priority notifications on every signal.",
    cta: { label: "Compare plans", to: "/plans" },
    image: heroPremium,
    alt: "Gold bars under a rising XAU/USD price line",
    chip: { label: "Premium", tone: "#f2c14e" },
  },
  {
    id: "markets",
    title: "Forex, gold & crypto zones",
    body: "Follow top-rated signal zones across the markets you trade — subscribe to the ones you trust.",
    cta: { label: "Explore signal zones", to: "/faq" },
    image: heroZones,
    alt: "Globe with signal-zone pins next to a candlestick panel",
    chip: { label: "Live zones", tone: "#ff8fa3" },
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const count = SLIDES.length;

  const goTo = useCallback(
    (i) => setIndex(((i % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused, count]);

  const onTouchStart = (e) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Trading resources and offers"
      className="mb-8"
    >
      <div
        className="relative h-[300px] w-full overflow-hidden rounded-card border border-line md:h-[360px]"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {SLIDES.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: active ? 1 : 0,
                pointerEvents: active ? "auto" : "none",
              }}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              {/* readability gradient over the image */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(6,10,18,0.88) 0%, rgba(6,10,18,0.55) 45%, rgba(6,10,18,0.05) 100%)",
                }}
              />
              <div className="relative flex h-full flex-col justify-end p-5 md:p-8">
                <span
                  className="mb-2 w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                  style={{
                    background: `${slide.chip.tone}22`,
                    color: slide.chip.tone,
                  }}
                >
                  {slide.chip.label}
                </span>
                <h1 className="max-w-[300px] text-[26px] font-extrabold leading-tight tracking-tight text-white md:max-w-[460px] md:text-[34px]">
                  {slide.title}
                </h1>
                <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-white/75 md:max-w-[440px] md:text-[15px]">
                  {slide.body}
                </p>
                <Link
                  to={slide.cta.to}
                  tabIndex={active ? 0 : -1}
                  className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-white"
                >
                  {slide.cta.label}
                  <ArrowIcon size={16} />
                </Link>
              </div>
            </div>
          );
        })}

        {/* Controls */}
        <div className="absolute bottom-4 left-5 flex items-center gap-2.5 md:left-8">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              aria-current={i === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-6 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play carousel" : "Pause carousel"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
          >
            {paused ? (
              <PlayIcon size={16} />
            ) : (
              <PauseIcon size={16} />
            )}
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55"
            >
              <ArrowIcon size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
