import React, { useCallback, useEffect, useRef, useState } from "react";

const AUTOPLAY_MS = 4000;

/* Resource / ad banners — external images */
const SLIDES = [
  {
    id: "ad-signals",
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1000&q=70",
    alt: "Ad: Trade gold and forex signals daily",
    label: "Ad",
    caption: "Premium gold signals — 70% win rate",
    sub: "Daily setups · XAUUSD & majors",
  },
  {
    id: "ad-course",
    src: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1000&q=70",
    alt: "Ad: Free forex trading course",
    label: "Free",
    caption: "Learn forex trading — free starter course",
    sub: "12 lessons · beginner friendly",
  },
  {
    id: "ad-market",
    src: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1000&q=70",
    alt: "Ad: Crypto zones now live",
    label: "New",
    caption: "Crypto signal zones are now live",
    sub: "BTC · ETH · SOL covered daily",
  },
];

export default function ZoneHeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef(null);
  const count = SLIDES.length;

  const goTo = useCallback(
    (i) => setIndex(((i % count) + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % count),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [count, paused]);

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
      aria-label="Featured ads and resources"
      className="relative mx-auto w-full max-w-[480px] px-3 pt-5 pb-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative h-[200px] w-full">
        <div
          className="relative h-full w-full overflow-hidden rounded-[18px] bg-z-charcoal ring-1 ring-gold/40 shadow-[0_12px_32px_-12px_rgba(11,11,11,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]"
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
                className="absolute inset-0"
                style={{
                  opacity: active ? 1 : 0,
                  transform: `scale(${active ? 1 : 1.04})`,
                  pointerEvents: active ? "auto" : "none",
                  transition: "opacity 700ms ease, transform 6000ms ease",
                }}
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  style={{
                    transform: active ? "scale(1.06)" : "scale(1)",
                    transition: "transform 6000ms ease-out",
                  }}
                />
              {/* Layered readability gradients: vertical scrim + gold edge sheen */}
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(11,11,11,0.35) 0%, rgba(11,11,11,0.05) 35%, rgba(11,11,11,0.85) 100%)",
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(100deg, rgba(11,11,11,0.85) 0%, rgba(11,11,11,0.35) 40%, rgba(201,154,46,0.12) 100%)",
                }}
              />
              {/* Hairline gold top sheen */}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(201,154,46,0.7), transparent)",
                }}
              />
                {/* Caption block */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full border border-gold/60 bg-black/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-gold backdrop-blur-sm">
                      {slide.label}
                    </span>
                    <span className="h-px flex-1 bg-white/15" />
                  </div>
                  <p className="max-w-[85%] text-[16px] font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                    {slide.caption}
                  </p>
                  <p className="mt-1 max-w-[85%] text-[12px] font-medium leading-snug text-white/65">
                    {slide.sub}
                  </p>
                </div>
            </div>
          );
        })}

                {/* Slide indicator pills — top right */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-black/30 px-2 py-1.5 backdrop-blur-sm">
                  {SLIDES.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      aria-current={i === index ? "true" : undefined}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === index
                          ? "w-5 bg-gold shadow-[0_0_8px_rgba(201,154,46,0.8)]"
                          : "w-1.5 bg-white/50 hover:bg-white/80"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Gold progress bar — synced to autoplay, resets per slide */}
              <div
                key={`${index}-${paused}`}
                aria-hidden="true"
                className="absolute inset-x-4 -bottom-1.5 h-[3px] overflow-hidden rounded-full bg-black/10"
              >
                <div
                  className="h-full origin-left rounded-full bg-gradient-to-r from-gold via-z-amber to-gold"
                  style={{
                    transform: "scaleX(0)",
                    animation: paused
                      ? "none"
                      : `zone-hero-progress ${AUTOPLAY_MS}ms linear forwards`,
                  }}
                />
              </div>
            </div>

            <style>{`
              @keyframes zone-hero-progress {
                from { transform: scaleX(0); }
                to { transform: scaleX(1); }
              }
            `}</style>
          </section>
        );
}
