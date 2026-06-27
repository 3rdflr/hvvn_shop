import Link from "next/link";
import Image from "next/image";
import { formatKRW } from "@/lib/format";
import type { Product } from "@/types";

// Deterministic per-index tilt (hydration-safe — no Math.random at render).
const TILTS = [-3, 2.2, -1.4, 3, -2.4, 1.6, -2.8, 1.2];

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const tilt = TILTS[index % TILTS.length] ?? 0;

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col items-center text-center"
    >
      <div
        className="tilt relative w-full max-w-[320px] aspect-square bg-velvetGlow/20 overflow-hidden"
        style={{ ["--tilt" as string]: `${tilt}deg` }}
      >
        {product.thumbnail_url && (
          <Image
            src={product.thumbnail_url}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw"
          />
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 text-[10px] tracking-widest2 uppercase bg-chrome text-black px-2 py-0.5">
            Sold out
          </span>
        )}
      </div>
      <div className="mt-5 chrome-text text-2xl md:text-3xl leading-none">{product.name}</div>
      <div className="mt-1 text-sm chrome-text-soft tracking-wider">{formatKRW(product.price_krw)}</div>
    </Link>
  );
}
