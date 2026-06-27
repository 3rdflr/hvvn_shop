"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-image";

export type DetailImage = { url: string; alt: string | null; position: number };

/** Detail-image gallery uploader: add (upload), reorder, remove. */
export function MultiImageUploader({
  images,
  onChange,
}: {
  images: DetailImage[];
  onChange: (images: DetailImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reindex = (list: DetailImage[]) => list.map((img, i) => ({ ...img, position: i }));

  async function handleFiles(files: FileList) {
    setErr(null);
    setUploading(true);
    try {
      const next = [...images];
      for (const file of Array.from(files)) {
        const url = await uploadImage(file);
        next.push({ url, alt: null, position: next.length });
      }
      onChange(reindex(next));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 중 오류");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(reindex(images.filter((_, i) => i !== idx)));
  }

  function move(idx: number, dir: -1 | 1) {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const a = next[idx];
    const b = next[target];
    if (!a || !b) return;
    next[idx] = b;
    next[target] = a;
    onChange(reindex(next));
  }

  return (
    <div>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-3">
          {images.map((img, idx) => (
            <li key={`${img.url}-${idx}`} className="border border-line">
              <div className="relative aspect-square">
                <Image src={img.url} alt={img.alt ?? ""} fill className="object-cover" sizes="120px" />
              </div>
              <div className="flex items-center justify-between px-1 py-1 text-[11px] text-muted">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="앞으로"
                    className="px-1 hover:text-chrome disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === images.length - 1}
                    aria-label="뒤로"
                    className="px-1 hover:text-chrome disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label="삭제"
                  className="px-1 hover:text-accent"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <label className="btn-outline cursor-pointer text-center inline-block">
        {uploading ? "Uploading..." : "상세 이미지 추가"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
          }}
        />
      </label>
      {err && <div className="text-xs text-accent mt-2 break-words">{err}</div>}
    </div>
  );
}
