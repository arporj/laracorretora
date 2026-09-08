import { SiteHeader } from "@/components/public/SiteHeader";
import { SiteFooter } from "@/components/public/SiteFooter";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import { MockModeBanner } from "@/components/MockModeBanner";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MockModeBanner />
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
      <WhatsAppFloatButton />
    </>
  );
}
