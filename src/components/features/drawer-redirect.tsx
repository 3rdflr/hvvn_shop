"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUi, type DrawerTab } from "@/store/ui";

/**
 * Legacy routes (/cart, /orders, /checkout, /checkout/complete) are folded into
 * the commerce drawer. Visiting them opens the drawer and returns home so old
 * links / bookmarks keep working.
 */
export function DrawerRedirect({ tab }: { tab?: DrawerTab }) {
  const router = useRouter();
  const openDrawer = useUi((s) => s.openDrawer);

  useEffect(() => {
    if (tab) openDrawer(tab);
    router.replace("/");
  }, [tab, openDrawer, router]);

  return null;
}
