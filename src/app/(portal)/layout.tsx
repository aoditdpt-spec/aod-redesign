import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalShell } from "@/components/dash/PortalShell";
import { Loading } from "@/components/dash/ui";

export const metadata: Metadata = {
  title: { default: "Artist Portal", template: "%s · AOD Artist Portal" },
  robots: { index: false, follow: false },
};

// The artist portal's signed-in pages, on sample data in test mode (src/lib/mock-db.ts). The
// sign-in and the application live with the customer site, under (site)/artists.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </PortalShell>
  );
}
