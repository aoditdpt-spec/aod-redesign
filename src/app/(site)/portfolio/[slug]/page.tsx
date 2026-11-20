import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories } from "@/data/site";
import { portfolioArtists, portfolioPage as p } from "@/data/portfolio";
import { Container } from "@/components/ui/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { ArtistCard } from "@/components/portfolio/PortfolioGrid";

// One artist's portfolio: their name, a row of facts, a line about them, their work as a photo
// grid with captions, then more artists from the same category. Mock artists for now.

export function generateStaticParams() {
  return portfolioArtists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = portfolioArtists.find((x) => x.slug === slug);
  return a ? { title: `${a.name}, ${a.craft}`, description: `${a.craft} in ${a.city}. ${a.about}` } : {};
}

export default async function ArtistPortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = portfolioArtists.find((x) => x.slug === slug);
  if (!a) notFound();
  const category = categories.find((c) => c.slug === a.category);
  const facts = [a.craft, a.city, a.experience, a.languages.join(", ")];
  const more = portfolioArtists.filter((x) => x.slug !== a.slug && x.category === a.category).concat(portfolioArtists.filter((x) => x.category !== a.category)).slice(0, 3);

  return (
    <main className="flex-1">
      <Container className="pt-8 sm:pt-10 lg:pt-14">
        <Link href="/portfolio" className="text-sm font-medium text-ink underline underline-offset-4 hover:text-brand">
          {p.back}
        </Link>
      </Container>
      <PageHeader label={category?.name} title={`${a.name}.`} />
      <Container className="pb-20 lg:pb-28">
        <ul className="grid grid-cols-2 gap-x-8 gap-y-4 border-t border-ink pt-6 sm:grid-cols-4">
          {facts.map((f) => (
            <li key={f} className="text-lg font-medium">
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-10 max-w-3xl text-xl leading-relaxed sm:text-2xl sm:leading-relaxed">{a.about}</p>

        <h2 className="mt-16 text-3xl sm:text-4xl">{p.workTitle}</h2>
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-3">
          {a.works.map((w, i) => (
            <li key={`${w.src}-${i}`} className={i === 0 ? "col-span-2 lg:col-span-2 lg:row-span-2" : ""}>
              <figure className="h-full">
                <div className={`relative overflow-hidden rounded-lg bg-wash sm:rounded-xl ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-[calc(100%-2rem)]" : "aspect-square"}`}>
                  <Image src={w.src} alt={w.caption} fill sizes={i === 0 ? "(min-width: 1024px) 60vw, 100vw" : "(min-width: 1024px) 30vw, 50vw"} priority={i === 0} className="object-cover transition-transform duration-700 ease-out hover:scale-[1.04]" />
                </div>
                <figcaption className="mt-2 text-sm text-muted">{w.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {more.length > 0 && (
          <>
            <h2 className="mt-20 border-t border-line pt-10 text-3xl sm:text-4xl">{p.moreTitle}</h2>
            <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-3">
              {more.map((x, i) => (
                <li key={x.slug} className={i === 2 ? "max-lg:hidden" : ""}>
                  <ArtistCard artist={x} />
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="mt-16 text-xs text-muted">{p.testNote}</p>
      </Container>
    </main>
  );
}
