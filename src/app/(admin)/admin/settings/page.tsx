import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import type { Settings } from "@/types";

export default async function AdminSettingsPage() {
  const sb = createSupabaseServiceClient();
  const { data } = await sb.from("settings").select("*").eq("id", 1).maybeSingle<Settings>();

  return (
    <div>
      <h2 className="chrome-text text-2xl mb-6">설정</h2>
      <SettingsForm settings={data ?? null} />
    </div>
  );
}
