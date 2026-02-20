"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface PosterCarouselProps {
  /** Array of image paths (relative to /public) */
  posters: string[];
  /** Scroll speed in seconds for one full cycle */
  duration?: number;
}

export default function PosterCarousel({
  posters,
  duration = 30,
}: PosterCarouselProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => setIsClient(true), []);

  if (!isClient || posters.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <span className="text-[22px] text-foreground-secondary">
          No posters available
        </span>
      </div>
    );
  }

  // Duplicate posters for seamless infinite scroll
  const doubled = [...posters, ...posters];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        className="animate-scroll-left flex h-full items-center gap-10 will-change-transform"
        style={
          {
            "--duration": `${duration}s`,
            width: "max-content",
          } as React.CSSProperties
        }
      >
        {doubled.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-[90%] w-[420px] flex-shrink-0 overflow-hidden rounded-3xl bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          >
            <Image
              src={src}
              alt={`Poster ${(i % posters.length) + 1}`}
              fill
              className="object-cover"
              sizes="420px"
              priority={i < 4}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
