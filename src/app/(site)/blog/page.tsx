import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { BlogList } from "@/components/blog/BlogList";

export const metadata: Metadata = { title: "Blog", description: "Ideas for weddings, events and shoots in Gujarat, from the AOD team." };

export default function BlogPage() {
  return (
    <main className="flex-1">
      <PageHeader label="AOD Blog" title="Stories And Ideas." />
      <Container className="pb-24 lg:pb-32">
        <BlogList />
      </Container>
    </main>
  );
}
