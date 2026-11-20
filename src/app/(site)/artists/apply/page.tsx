import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ApplyForm } from "@/components/artists/ApplyForm";

export const metadata: Metadata = { title: "Apply To Join", description: "Apply to join AOD as a photographer, anchor, musician, comedian, model or makeup artist.", robots: { index: false } };

export default function ApplyPage() {
  return (
    <main className="flex-1">
      <PageHeader label="Artist Portal" title="Apply To Join AOD." />
      <Container className="pb-24 lg:pb-32">
        <ApplyForm />
      </Container>
    </main>
  );
}
