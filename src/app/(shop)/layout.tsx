import { SiteDecor } from "@/components/layouts/site-decor";
import { SiteHeader } from "@/components/layouts/site-header";
import { SiteFooter } from "@/components/layouts/site-footer";
import { CommerceDrawer } from "@/components/layouts/commerce-drawer";
import { SubscribeModal } from "@/components/layouts/subscribe-modal";
import { SiteInfoSheet } from "@/components/layouts/site-info-sheet";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteDecor />
      <div className="relative z-10">
        <SiteHeader />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </div>
      <CommerceDrawer />
      <SubscribeModal />
      <SiteInfoSheet />
    </>
  );
}
