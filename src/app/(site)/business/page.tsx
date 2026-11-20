import type { Metadata } from "next";
import { businessPage as p } from "@/data/pages";
import { PageHeader, Points } from "@/components/ui/PageHeader";
import { BusinessPortal } from "@/components/business/BusinessPortal";

export const metadata: Metadata = { title: "For Business", description: p.meta };

// AOD For Business, as on aod.co.in: companies book signed in. Signed out: the heading, the Sign In
// / Create Account card, then the three points; signed in: the company's portal.
export default function BusinessPage() {
  return (
    <main className="flex-1">
      <BusinessPortal header={<PageHeader label={p.label} title={p.title} />} after={<Points items={p.points} />} />
    </main>
  );
}
