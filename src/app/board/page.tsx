import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { News, INews } from "@/models/News";
import { Event, IEvent } from "@/models/Event";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

async function fetchAll() {
  await connectToDatabase();
  const [news, events] = await Promise.all([
    News.find().sort({ createdAt: -1 }).lean<INews[]>(),
    Event.find().sort({ eventDate: 1, createdAt: -1 }).lean<IEvent[]>(),
  ]);
  return { news, events };
}

// ── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  count,
  accent,
}: {
  title: string;
  count: number;
  accent: string;
}) {
  return (
    <div className="mb-6 flex items-end gap-3 border-b border-gray-200 pb-3">
      <h2 className={`text-[28px] font-bold ${accent}`}>{title}</h2>
      <span className="mb-1 text-[14px] text-gray-400">{count} record{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

// ── Thumb image ──────────────────────────────────────────────────────────────

function Thumb({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gray-100 text-[13px] text-gray-400">
        No image
      </div>
    );
  }
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gray-100">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        unoptimized
      />
    </div>
  );
}

// ── Meta row ─────────────────────────────────────────────────────────────────

function MetaRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex gap-2 text-[13px]">
      <span className="w-24 shrink-0 font-medium text-gray-500">{label}</span>
      <span className="text-gray-800">{value}</span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function Empty({ label }: { label: string }) {
  return (
    <div className="col-span-full flex h-30 items-center justify-center rounded-2xl border border-dashed border-gray-300 text-[15px] text-gray-400">
      No {label} in database
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function BoardPage() {
  const { news, events } = await fetchAll();

  return (
    <div style={{ minWidth: "100vw", minHeight: "100vh" }} className="bg-gray-50 px-10 py-10">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-[36px] font-black text-gray-900">
            <span className="text-red-600">INFO</span>
            <span>grid</span>
            <span className="ml-3 text-[20px] font-semibold text-gray-400">/ Data Board</span>
          </h1>
          <p className="mt-1 text-[14px] text-gray-400">
            Live data from MongoDB · Images served from Cloudflare R2 ·{" "}
            {new Date().toLocaleString("en-IN", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        {/* Live refresh hint */}
        <a
          href="/board"
          className="rounded-xl bg-gray-900 px-5 py-3 text-[13px] font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          ↻ Refresh
        </a>
      </div>

      {/* ═══ NEWS ════════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        <SectionHeading title="News" count={news.length} accent="text-blue-600" />
        {news.length === 0 ? (
          <Empty label="news" />
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {news.map((item) => (
              <article
                key={String(item._id)}
                className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm"
              >
                <Thumb src={item.imageUrl || undefined} alt={item.title} />
                <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                  {item.title}
                </h3>
                <p className="line-clamp-3 text-[13px] leading-relaxed text-gray-500">
                  {item.description}
                </p>
                <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-3">
                  <MetaRow label="Category" value={item.category} />
                  <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                  <MetaRow label="Updated" value={fmtDate(item.updatedAt)} />
                  {item.newsUrl && <MetaRow label="URL" value={<a href={item.newsUrl} target="_blank" rel="noopener noreferrer" className="break-all text-blue-500 hover:underline">{item.newsUrl}</a>} />}
                  {item.imagePath && <MetaRow label="R2 key" value={<span className="break-all font-mono text-[11px] text-gray-400">{item.imagePath}</span>} />}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ═══ EVENTS ══════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        <SectionHeading title="Events" count={events.length} accent="text-purple-600" />
        {events.length === 0 ? (
          <Empty label="events" />
        ) : (
          <div className="grid grid-cols-2 gap-6">
            {events.map((item) => (
              <article
                key={String(item._id)}
                className="flex gap-5 rounded-2xl bg-white p-5 shadow-sm"
              >
                {/* Image column */}
                <div className="w-40 shrink-0">
                  <Thumb src={item.imageUrl || undefined} alt={item.title} />
                </div>
                {/* Content column */}
                <div className="flex flex-1 flex-col gap-2">
                  <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                  <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-3">
                    <MetaRow
                      label="Date"
                      value={item.eventDate ? fmtDate(item.eventDate) : "Not set"}
                    />
                    {item.eventTime && <MetaRow label="Time" value={item.eventTime} />}
                    {item.eventUrl && <MetaRow label="URL" value={<a href={item.eventUrl} target="_blank" rel="noopener noreferrer" className="break-all text-blue-500 hover:underline">{item.eventUrl}</a>} />}
                    <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                    {item.imagePath && <MetaRow label="R2 key" value={<span className="break-all font-mono text-[11px] text-gray-400">{item.imagePath}</span>} />}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
