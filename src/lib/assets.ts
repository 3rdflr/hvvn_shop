/** Build public URLs for files in the Supabase `site-assets` bucket. */
export function siteAsset(file: string): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/site-assets/${file}`;
}
