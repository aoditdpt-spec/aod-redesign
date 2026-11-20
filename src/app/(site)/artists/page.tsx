import type { Metadata } from "next";
import Link from "next/link";
import { artistsPage as p } from "@/data/pages";
import { PageHeader, Points } from "@/components/ui/PageHeader";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";

export const metadata: Metadata = { title: "For Artists", description: p.meta };

// For artists. Joining is through the artist portal only, as on aod.co.in: Apply To Join opens the
// application, Sign In the portal.
export default function ArtistsPage() {
  return (
    <main className="flex-1">
      <PageHeader label={p.label} title={p.title}>
        <Link href="/artists/apply" className={primaryButton}>
          {p.apply}
        </Link>
        <Link href="/artists/sign-in" className={secondaryButton}>
          {p.signIn}
        </Link>
      </PageHeader>
      <Points items={p.points} />
    </main>
  );
}
