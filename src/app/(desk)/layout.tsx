import Image from "next/image";
import Link from "next/link";
import { disputePage as p } from "@/data/pages";
import { Container } from "@/components/ui/Container";
import { MainSiteLink } from "@/components/ui/MainSiteLink";
import { Footer } from "@/components/layout/Footer";

// The Dispute Desk as its own small site, as on aod.co.in (resolve.aod.co.in): its own header
// (the logo with "Dispute Desk", Raise A Dispute, Track A Dispute and Back To Main Site), so it
// reads as a separate, formal place rather than part of the booking site; the footer is the same
// as on every other page (on request, 2026-11-21). The group doesn't change any address (/dispute-desk…).
const nav = [
  { href: "/dispute-desk/new", label: "Raise A Dispute" },
  { href: "/dispute-desk/track", label: "Track A Dispute" },
];

export default function DeskLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-30 border-b border-ink bg-paper/95 backdrop-blur">
        <Container className="flex h-16 items-center justify-between gap-4">
          <Link href="/dispute-desk" className="flex shrink-0 items-center gap-2.5" aria-label={p.label}>
            <Image src="/aod-wordmark-sm.png" alt="AOD." width={78} height={22} priority unoptimized className="h-[22px] w-auto" />
            <span className="rounded-full bg-wash px-2.5 py-1 text-xs font-medium text-ink">Dispute Desk</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hidden rounded-full px-3.5 py-2 font-medium text-ink transition-colors hover:bg-wash sm:block">
                {n.label}
              </Link>
            ))}
            <MainSiteLink className="ml-2" />
          </nav>
        </Container>
        {/* Phones: the two actions as tabs under the logo row. */}
        <nav className="grid grid-cols-2 border-t border-line text-center text-sm font-medium sm:hidden">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="py-2.5 text-ink hover:bg-wash">
              {n.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}

      {/* The same footer as every other page. */}
      <Footer />
    </div>
  );
}
