import { DrawerRedirect } from "@/components/features/drawer-redirect";

// Order completion now renders inside the commerce drawer; this legacy route
// just sends visitors home.
export default function CompletePage() {
  return <DrawerRedirect />;
}
