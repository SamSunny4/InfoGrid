import Image from "next/image";
import Clock from "@/components/Clock";
import PosterCarousel from "@/components/PosterCarousel";
/* ── Placeholder posters (replace with real paths) ── */
const POSTERS: string[] = [
  // Add poster paths here, e.g.:
  // "/posters/event1.jpg",
  // "/posters/event2.jpg",
];

export default function Home() {
  return (
    <div className="flex h-[1920px] w-[1080px] flex-col bg-white">
      {/* ═══════ TOP 60% — Static Information Panel ═══════ */}
      <section className="flex h-[60%] flex-col items-center justify-between px-16 py-14">
        {/* Logo */}
        <div className="flex w-full items-start">
          <Image
            src="/MITSLogo.png"
            alt="MITS Logo"
            width={220}
            height={220}
            priority
            className="object-contain"
            unoptimized
          />
        </div>

        {/* Clock & Date — centred */}
        <Clock />

        {/* College name tagline */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-[36px] font-semibold tracking-tight text-foreground">
            MITS Information Board
          </h1>
          <p className="text-[20px] font-light tracking-wide text-foreground-secondary">
            Stay informed. Stay inspired.
          </p>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="divider mx-16" />

      {/* ═══════ BOTTOM 40% — Dynamic Poster Carousel ═══════ */}
      <section className="flex h-[40%] items-center overflow-hidden px-0 py-8">
        <PosterCarousel posters={POSTERS} duration={30} />
      </section>
    </div>
  );
}
