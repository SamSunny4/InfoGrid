"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  newsUrl?: string;
  createdAt: string;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  eventDate?: string;
  eventTime?: string;
  eventUrl?: string;
}

// ── Carousel hook ─────────────────────────────────────────────────────────────

function useCarousel(count: number, duration: number) {
  const [index, setIndex]   = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback((to?: number) => {
    setIndex((i) => {
      const next = to !== undefined ? to : (i + 1) % Math.max(count, 1);
      return next;
    });
    setAnimKey((k) => k + 1);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setTimeout(() => advance(), duration * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [animKey, count, duration, advance]);

  return { index, animKey, advance };
}

// ── Header clock ──────────────────────────────────────────────────────────────

function HeaderClock() {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const date = now
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <div className="flex flex-col items-end">
      <span className="text-[16px] font-medium tracking-widest text-gray-400 leading-tight">{date}</span>
      <span className="text-[30px] font-bold leading-tight text-gray-900 tabular-nums">{time}</span>
    </div>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ animKey, duration, color = "bg-blue-500" }: { animKey: number; duration: number; color?: string }) {
  return (
    <div className="relative h-0.75 w-full rounded-full bg-gray-200 overflow-hidden">
      <div
        key={animKey}
        className={`absolute left-0 top-0 h-full rounded-full ${color} animate-progress`}
        style={{ "--progress-duration": `${duration}s` } as React.CSSProperties}
      />
    </div>
  );
}

// ── Dot indicators ────────────────────────────────────────────────────────────

function Dots({ total, active, onSelect, color = "bg-blue-500" }: {
  total: number; active: number; onSelect: (i: number) => void; color?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`rounded-full transition-all duration-300 ${
            i === active
              ? `${color} w-6 h-2`
              : "bg-gray-300 w-2 h-2 hover:bg-gray-400"
          }`}
        />
      ))}
    </div>
  );
}

// ── No image fallback ─────────────────────────────────────────────────────────

function NoImage({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 text-gray-300 text-[13px] ${className}`}>
      No image
    </div>
  );
}

// ── News carousel (split layout) ─────────────────────────────────────────────

const NEWS_DURATION = 8;

function NewsCarousel({ items }: { items: NewsItem[] }) {
  const { index, animKey, advance } = useCarousel(items.length, NEWS_DURATION);
  const item = items[index];

  const qrUrl = item.newsUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(item.newsUrl)}`
    : null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Card */}
      <div
        key={animKey}
        className="relative flex-1 flex rounded-3xl overflow-hidden shadow-lg bg-white animate-slide-up"
      >
        {/* Left: text + QR */}
        <div className="flex flex-col p-7" style={{ width: "55%" }}>
          {/* Category + title */}
          <div className="flex flex-col gap-3 mb-3">
            {item.category && (
              <span className="self-start bg-orange-500 text-white text-[12px] font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
                {item.category}
              </span>
            )}
            <h3 className="text-gray-900 text-[23px] font-black leading-snug line-clamp-3">
              {item.title}
            </h3>
          </div>
          {/* Description – fills all remaining space */}
          <div className="flex-1 overflow-hidden mb-3 min-h-0">
            <p className="text-gray-500 text-[14px] leading-relaxed whitespace-pre-line h-full overflow-hidden">
              {item.description}
            </p>
          </div>
          {/* QR */}
          {qrUrl ? (
            <div className="flex items-center gap-3">
              <Image
                src={qrUrl}
                alt="QR Code"
                width={90}
                height={90}
                className="rounded-xl border border-gray-200 shrink-0"
                unoptimized
              />
              <span className="text-gray-400 text-[11px] leading-tight">
                Scan to<br />read more
              </span>
            </div>
          ) : null}
        </div>

        {/* Right: image */}
        <div className="relative flex-1">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
          ) : (
            <NoImage className="absolute inset-0" />
          )}
          {/* Counter badge */}
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
            {index + 1} / {items.length}
          </div>
        </div>
      </div>

      {/* Progress + dots */}
      <div className="flex items-center gap-5 px-1">
        <div className="flex-1">
          <ProgressBar animKey={animKey} duration={NEWS_DURATION} color="bg-orange-500" />
        </div>
        <Dots total={items.length} active={index} onSelect={(i) => advance(i)} color="bg-orange-500" />
      </div>
    </div>
  );
}

// ── Event carousel (split layout) ────────────────────────────────────────────

const EVENT_DURATION = 10;

function EventCarousel({ items }: { items: EventItem[] }) {
  const { index, animKey, advance } = useCarousel(items.length, EVENT_DURATION);
  const item = items[index];

  const dateLabel = item.eventDate
    ? new Date(item.eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null;

  const qrUrl = item.eventUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.eventUrl)}`
    : null;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Card */}
      <div
        key={animKey}
        className="relative flex-1 flex rounded-3xl overflow-hidden shadow-lg bg-white animate-slide-up"
      >
        {/* Left: text + QR */}
        <div className="flex flex-col p-6" style={{ width: "55%" }}>
          {/* Date + title */}
          <div className="flex flex-col gap-2 mb-3">
            {dateLabel && (
              <span className="self-start bg-purple-600 text-white text-[12px] font-bold px-3 py-1.5 rounded-full tracking-wide uppercase">
                {dateLabel}
              </span>
            )}
            <h3 className="text-gray-900 text-[24px] font-black uppercase tracking-wide leading-tight line-clamp-2">
              {item.title}
            </h3>
            {item.eventTime && (
              <p className="text-gray-600 text-[14px] font-semibold">🕐 {item.eventTime}</p>
            )}
          </div>
          {/* Description – fills all remaining space */}
          <div className="flex-1 overflow-hidden mb-3 min-h-0">
            <p className="text-gray-500 text-[14px] leading-relaxed whitespace-pre-line h-full overflow-hidden">
              {item.description}
            </p>
          </div>
          {/* QR */}
          {qrUrl ? (
            <div className="flex items-center gap-3">
              <Image
                src={qrUrl}
                alt="QR Code"
                width={80}
                height={80}
                className="rounded-xl border border-gray-200 shrink-0"
                unoptimized
              />
              <span className="text-gray-400 text-[11px] leading-tight">
                Scan for<br />details
              </span>
            </div>
          ) : null}
        </div>

        {/* Right: image */}
        <div className="relative flex-1">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
          ) : (
            <NoImage className="absolute inset-0" />
          )}
          {/* Counter badge */}
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-[12px] font-semibold px-3 py-1.5 rounded-full">
            {index + 1} / {items.length}
          </div>
        </div>
      </div>

      {/* Progress + dots */}
      <div className="flex items-center gap-5 px-1">
        <div className="flex-1">
          <ProgressBar animKey={animKey} duration={EVENT_DURATION} color="bg-purple-500" />
        </div>
        <Dots total={items.length} active={index} onSelect={(i) => advance(i)} color="bg-purple-500" />
      </div>
    </div>
  );
}

// ── Leaderboard (removed – restore from git if needed) ───────────────────────

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, accent, count, unit }: { label: string; accent: string; count?: number; unit?: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className={`h-7 w-1.5 rounded-full ${accent}`} />
      <h2 className="text-[22px] font-extrabold text-gray-900 tracking-tight">{label}</h2>
      {count !== undefined && (
        <span className="ml-auto text-[12px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {count} {unit}{count !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`rounded-3xl bg-gray-100 animate-pulse ${className}`} style={style} />;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  const [news,   setNews]   = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [nr, er] = await Promise.all([
        fetch("/api/news").then((r) => r.json()),
        fetch("/api/events").then((r) => r.json()),
      ]);
      if (nr.success) setNews(nr.data);
      if (er.success) setEvents(er.data);
    } catch { /* silent on display board */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60_000);
    return () => clearInterval(id);
  }, [fetchData]);

  return (
    <div className="flex flex-col bg-[#f5f6fa]" style={{ width: 1080, height: 1920 }}>

      {/* ════ HEADER (110px) ═════════════════════════════════════ */}
      <header
        className="flex items-center justify-between px-10 bg-white border-b border-gray-100"
        style={{ height: 110 }}
      >
        <Image src="/MITSLogo.png" alt="MITS Logo" width={74} height={74} priority className="object-contain" unoptimized />

        <Image
          src="/nextgridblack.png"
          alt="nexGrid"
          width={180}
          height={52}
          priority
          className="object-contain"
          unoptimized
        />

        <HeaderClock />
      </header>

      {/* ════ NEWS (615px) ═══════════════════════════════════════ */}
      <section className="px-10 pt-8 pb-5 bg-white" style={{ height: 615 }}>
        <SectionHeader label="News &amp; Campus News" accent="bg-orange-500" count={loading ? undefined : news.length} unit="article" />

        {loading ? (
          <Skeleton className="flex-1" style={{ height: 510 } as React.CSSProperties} />
        ) : news.length === 0 ? (
          <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 text-[15px]" style={{ height: 510 }}>
            No news in database
          </div>
        ) : (
          <div style={{ height: 510 }}>
            <NewsCarousel items={news} />
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="h-2 bg-[#f5f6fa]" />

      {/* ════ EVENTS (450px) ═════════════════════════════════════ */}
      <section className="px-10 pt-8 pb-5 bg-white" style={{ height: 450 }}>
        <SectionHeader label="Events" accent="bg-purple-500" count={loading ? undefined : events.length} unit="event" />

        {loading ? (
          <Skeleton className="flex-1" style={{ height: 345 } as React.CSSProperties} />
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 text-[15px]" style={{ height: 345 }}>
            No events in database
          </div>
        ) : (
          <div style={{ height: 345 }}>
            <EventCarousel items={events} />
          </div>
        )}
      </section>

      {/* ════ LEADERBOARD: commented out ════════════════════════ */}
      {/* <section className="flex-1 px-10 pt-8 pb-8 bg-white">
        <SectionHeader label="LeaderBoard" accent="bg-blue-500" />
        <div>
          {LEADERBOARD.map((entry) => (
            <LeaderRow key={entry.rank} {...entry} />
          ))}
        </div>
      </section> */}

    </div>
  );
}
