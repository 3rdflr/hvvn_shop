const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless body limit ~4.5MB — leave headroom
const INITIAL_MAX_DIM = 2048;
const MIN_DIM = 480;
const MAX_ATTEMPTS = 7;

export const UPLOAD_MAX_BYTES = MAX_BYTES;

/**
 * Client-side resize preserving aspect ratio. Iteratively shrinks the longest
 * side (and JPEG quality) until the encoded blob fits MAX_BYTES. PNGs keep alpha.
 * Returns the original for non-rasters (SVG/GIF) or if it can't shrink enough.
 */
export async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_BYTES) return file;
  if (file.type === "image/svg+xml" || file.type === "image/gif") return file;

  const isPng = file.type === "image/png";
  const mime = isPng ? "image/png" : "image/jpeg";
  const ext = isPng ? "png" : "jpg";

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const { width: srcW, height: srcH } = bitmap;
  const longest = Math.max(srcW, srcH);
  let targetLongest = Math.min(longest, INITIAL_MAX_DIM);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const scale = targetLongest / longest;
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    ctx.drawImage(bitmap, 0, 0, w, h);

    const quality = isPng ? undefined : Math.max(0.55, 0.92 - attempt * 0.07);
    const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, mime, quality));
    if (!blob) break;

    if (blob.size <= MAX_BYTES) {
      const name = file.name.replace(/\.[^.]+$/, "") + "." + ext;
      bitmap.close?.();
      return new File([blob], name, { type: mime });
    }

    const next = Math.round(targetLongest * 0.82);
    if (next < MIN_DIM) break;
    targetLongest = next;
  }

  bitmap.close?.();
  return file;
}

/** Compress (if needed) + upload to the product-images bucket. Returns public URL. */
export async function uploadImage(file: File): Promise<string> {
  let prepared = file;
  if (file.size > MAX_BYTES) {
    prepared = await compressImage(file);
    if (prepared.size > MAX_BYTES) {
      throw new Error(
        `이미지를 ${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB 이하로 줄이지 못했습니다 (현재 ${(
          prepared.size /
          1024 /
          1024
        ).toFixed(1)}MB). 원본을 더 작게 저장해 다시 시도해주세요.`
      );
    }
  }

  const fd = new FormData();
  fd.append("file", prepared);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const text = await res.text();
  let json: { url?: string; error?: string } = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    // non-JSON (e.g., 413 HTML)
  }
  if (!res.ok || !json.url) {
    throw new Error(json.error ?? `업로드 실패 (${res.status})`);
  }
  return json.url;
}
