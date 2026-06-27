import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminSignOut } from "@/components/admin/admin-signout";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sb = await createSupabaseServerClient();
  // Tolerate stale/invalid auth cookies (refresh_token_not_found) so the login
  // page still renders instead of erroring.
  let user = null;
  try {
    const { data } = await sb.auth.getUser();
    user = data.user;
  } catch {
    user = null;
  }

  return (
    <div className="container-page py-8 md:py-10 min-h-screen">
      {/* Back to store — top-left */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-[12px] tracking-widest2 uppercase text-muted hover:text-chrome transition mb-5"
      >
        ← 스토어로
      </Link>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-6">
        <Link href="/admin">
          <h1 className="chrome-text text-3xl md:text-4xl">admin</h1>
        </Link>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted truncate max-w-[40vw] sm:max-w-none">
              {user.email}
            </span>
            <AdminSignOut />
          </div>
        )}
      </div>
      {user && (
        <nav className="flex gap-5 md:gap-6 text-[12px] tracking-widest2 uppercase border-b border-line pb-3 mb-8 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-muted hover:text-chrome transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
      {children}
    </div>
  );
}
