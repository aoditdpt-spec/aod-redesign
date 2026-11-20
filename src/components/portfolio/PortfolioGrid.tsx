"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { categories } from "@/data/site";
import { portfolioPage as p, type PortfolioArtist } from "@/data/portfolio";

// The Portfolio page's artists: category chips (All first), then a card per artist, its cover
// photo zooming a little on hover like the homepage's grid, with name, craft and city. A card
// opens the artist's portfolio (/portfolio/<slug>).
const chip = (on: boolean) => `h-10 shrink-0 rounded-full border px-4 text-[15px] transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"}`;

export function PortfolioGrid({ artists }: { artists: PortfolioArtist[] }) {
  const [cat, setCat] = useState("all");
  const used = categories.filter((c) => artists.some((a) => a.category === c.slug));
  const shown = cat === "all" ? artists : artists.filter((a) => a.category === cat);

  return (
    <>
      <div role="group" aria-label="Filter by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")} className={chip(cat === "all")}>
          {p.all}
        </button>
        {used.map((c) => (
          <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => setCat(c.slug)} className={chip(cat === c.slug)}>
            {c.name}
          </button>
        ))}
      </div>

      {shown.length ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-4 lg:grid-cols-3 lg:gap-y-12">
          {shown.map((a) => (
            <li key={a.slug}>
              <ArtistCard artist={a} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 text-lg text-muted">{p.empty}</p>
      )}
    </>
  );
}

export function ArtistCard({ artist: a }: { artist: PortfolioArtist }) {
  return (
    <Link href={`/portfolio/${a.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-wash sm:rounded-xl">
        <Image src={a.works[0].src} alt={`${a.name}'s work: ${a.works[0].caption}`} fill sizes="(min-width: 1024px) 30vw, 50vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
      </div>
      <p className="mt-3 text-lg font-medium leading-tight tracking-tight sm:text-xl">{a.name}</p>
      <p className="mt-1 text-sm text-muted sm:text-base">
        {a.craft} · {a.city}
      </p>
    </Link>
  );
}
