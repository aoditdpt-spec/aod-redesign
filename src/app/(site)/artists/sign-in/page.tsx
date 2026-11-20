import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArtistSignIn } from "@/components/artists/ArtistSignIn";

export const metadata: Metadata = { title: "Artist Sign In", robots: { index: false } };

export default function ArtistSignInPage() {
  return (
    <main className="flex-1">
      <PageHeader label="Artist Portal" title="Sign In." />
      <Container className="pb-24 lg:pb-32">
        <ArtistSignIn />
      </Container>
    </main>
  );
}
