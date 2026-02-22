import Image from "next/image";
import { connectToDatabase } from "@/lib/mongodb";
import { News, INews } from "@/models/News";
import { Poster, IPoster } from "@/models/Poster";
import { Event, IEvent } from "@/models/Event";
import { QRCode, IQRCode } from "@/models/QRCode";

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d?: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtTime(d?: Date | string | null) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchAll() {
  await connectToDatabase();
  const [news, posters, events, qrcodes] = await Promise.all([
    News.find().sort({ priority: -1, createdAt: -1 }).lean<INews[]>(),
    Poster.find().sort({ createdAt: -1 }).lean<IPoster[]>(),
    Event.find().sort({ eventDate: 1, createdAt: -1 }).lean<IEvent[]>(),
    QRCode.find().sort({ createdAt: -1 }).lean<IQRCode[]>(),
  ]);
  return { news, posters, events, qrcodes };
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

// ── Status badge ─────────────────────────────────────────────────────────────

function Badge({ on, labels = ["Published", "Draft"] }: { on: boolean; labels?: [string, string] }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        on
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {on ? labels[0] : labels[1]}
    </span>
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
  const { news, posters, events, qrcodes } = await fetchAll();

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
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                    {item.title}
                  </h3>
                  <Badge on={item.isPublished} />
                </div>
                <p className="line-clamp-3 text-[13px] leading-relaxed text-gray-500">
                  {item.description}
                </p>
                <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-3">
                  <MetaRow label="Priority" value={`${item.priority} / 10`} />
                  <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                  <MetaRow label="Updated" value={fmtDate(item.updatedAt)} />
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
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[15px] font-semibold text-gray-900 leading-snug">
                      {item.title}
                    </h3>
                    <Badge on={item.isPublished} />
                  </div>
                  <p className="line-clamp-3 text-[13px] leading-relaxed text-gray-500">
                    {item.description}
                  </p>
                  <div className="mt-auto flex flex-col gap-1 border-t border-gray-100 pt-3">
                    <MetaRow
                      label="Date"
                      value={
                        item.eventDate
                          ? `${fmtDate(item.eventDate)}  ${fmtTime(item.eventDate)}`
                          : "Not set"
                      }
                    />
                    <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                    {item.imagePath && <MetaRow label="R2 key" value={<span className="break-all font-mono text-[11px] text-gray-400">{item.imagePath}</span>} />}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ═══ POSTERS ═════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        <SectionHeading title="Posters" count={posters.length} accent="text-orange-600" />
        {posters.length === 0 ? (
          <Empty label="posters" />
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {posters.map((item) => (
              <article
                key={String(item._id)}
                className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="relative aspect-3/4 w-full overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || "Poster"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-gray-700">
                    {item.title || <span className="italic text-gray-400">Untitled</span>}
                  </span>
                  <Badge on={item.isPublished} />
                </div>
                <div className="flex flex-col gap-1">
                  <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                  {item.imagePath && <MetaRow label="R2 key" value={<span className="break-all font-mono text-[11px] text-gray-400">{item.imagePath}</span>} />}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ═══ QR CODES ════════════════════════════════════════════════════════ */}
      <section className="mb-14">
        <SectionHeading title="QR Codes" count={qrcodes.length} accent="text-teal-600" />
        {qrcodes.length === 0 ? (
          <Empty label="QR codes" />
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {qrcodes.map((item) => (
              <article
                key={String(item._id)}
                className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                {/* QR image — square */}
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-contain p-4"
                    unoptimized
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-gray-800">{item.title}</span>
                  <Badge on={item.isActive} labels={["Active", "Inactive"]} />
                </div>
                <div className="flex flex-col gap-1">
                  {item.redirectUrl && (
                    <MetaRow
                      label="URL"
                      value={
                        <a
                          href={item.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="break-all text-blue-500 hover:underline"
                        >
                          {item.redirectUrl}
                        </a>
                      }
                    />
                  )}
                  <MetaRow label="Created" value={fmtDate(item.createdAt)} />
                  <MetaRow label="R2 key" value={<span className="break-all font-mono text-[11px] text-gray-400">{item.imagePath}</span>} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
