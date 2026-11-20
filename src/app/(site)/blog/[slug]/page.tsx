import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { BlogPost } from "@/components/blog/BlogPost";

export const metadata: Metadata = { title: "Blog" };

// A post. In test mode the posts live in the browser, so the page reads its address there.
export default function BlogPostPage() {
  return (
    <main className="flex-1">
      <Container className="pb-24 pt-8 sm:pt-10 lg:pb-32 lg:pt-14">
        <Suspense fallback={<p className="text-muted">Loading…</p>}>
          <BlogPost />
        </Suspense>
      </Container>
    </main>
  );
}
