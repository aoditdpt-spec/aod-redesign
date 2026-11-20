import type { Metadata } from "next";
import { portfolioArtists, portfolioPage as p } from "@/data/portfolio";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";

export const metadata: Metadata = { title: "Portfolio", description: p.meta };

// Our artists' work (in the navbar in place of the Dispute Desk, on request 2026-11-20). Mock
// artists for now: see src/data/portfolio.ts.
export default function PortfolioPage() {
  return (
    <main className="flex-1">
      <PageHeader label={p.label} title={p.title} />
      <Container className="pb-20 lg:pb-28">
        <PortfolioGrid artists={portfolioArtists} />
        <p className="mt-16 text-xs text-muted">{p.testNote}</p>
      </Container>
    </main>
  );
}
