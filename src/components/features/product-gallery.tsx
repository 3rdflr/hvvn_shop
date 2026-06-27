"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryImage = { url: string; alt?: string | null };

/**
 * Product image gallery. The main image is swappable — clicking a detail
 * thumbnail promotes it to the main view.
 */
export function ProductGallery({
  main,
  alt,
  images,
}: {
  main: string | null;
  alt: string;
  images: GalleryImage[];
}) {
  // Unified, de-duplicated list: main first, then detail images.
  const all: GalleryImage[] = [];
  if (main) all.push({ url: main, alt });
  for (const img of images) {
    if (!all.some((x) => x.url === img.url)) all.push(img);
  }

  const [active, setActive] = useState(all[0]?.url ?? null);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-velvetGlow/10">
        {active && (
          <Image
            src={active}
            alt={alt}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
      </div>

      {all.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {all.map((img) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(img.url)}
              aria-label="이미지 보기"
              aria-current={active === img.url}
              className={cn(
                "relative aspect-square overflow-hidden border transition",
                active === img.url ? "border-chrome" : "border-line hover:border-chrome/60"
              )}
            >
              <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
