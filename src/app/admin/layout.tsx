import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminShell } from "@/components/dash/AdminShell";
import { Loading } from "@/components/dash/ui";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · AOD Admin" },
  robots: { index: false, follow: false },
};

// The team's admin, on sample data in test mode (src/lib/mock-db.ts). The pages read the address
// (?open=), so they wait inside Suspense.
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AdminShell>
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </AdminShell>
  );
}
