"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/upload-image";

/** Single-image uploader (used for the product main/thumbnail image). */
export function ImageUploader({
  value,
  onUploaded,
}: {
  value: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(file: File) {
    setErr(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "업로드 중 오류");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {value && (
        <div className="relative aspect-square mb-3 max-w-[200px] border border-line">
          <Image src={value} alt="" fill className="object-cover" sizes="200px" />
        </div>
      )}
      <label className="btn-outline cursor-pointer text-center inline-block">
        {uploading ? "Uploading..." : value ? "다시 업로드" : "메인 이미지 업로드"}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </label>
      {err && <div className="text-xs text-accent mt-2 break-words">{err}</div>}
    </div>
  );
}
