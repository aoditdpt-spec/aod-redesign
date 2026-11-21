"use client";

import Image from "next/image";
import { Avatar } from "@/components/ui/Avatar";
import Link from "next/link";
import { MainSiteLink } from "@/components/ui/MainSiteLink";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { artistUnread, myOrders, useDb } from "@/lib/mock-db";
import { setPortalEmail } from "@/lib/portal-session";

// The artist portal around every page (design-tests/test1.html): the sidebar with what needs the
// artist counted in orange, and the artist at the bottom. Phones: one scrolling row.
const items: { href: string; label: string; count?: "requests" | "messages" }[] = [
  { href: "/artists/dashboard", label: "Overview" },
  { href: "/artists/availability", label: "Availability" },
  { href: "/artists/approval", label: "Approval" },
  { href: "/artists/profile", label: "Profile" },
  { href: "/artists/portfolio", label: "Portfolio" },
  { href: "/artists/bookings", label: "Bookings", count: "requests" },
  { href: "/artists/messages", label: "Messages", count: "messages" },
  { href: "/artists/documents", label: "Documents" },
];

export function PortalShell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const db = useDb();
  const n = db ? { requests: myOrders(db).toAnswer.length, messages: artistUnread(db) } : { requests: 0, messages: 0 };
  const me = db?.artists.find((a) => a.id === "ART-201");

  return (
    <div className="grid min-h-dvh text-[15px] md:grid-cols-[220px_1fr]">
      <aside className="flex items-center gap-4 overflow-x-auto border-b border-line px-4 py-3 md:sticky md:top-0 md:h-dvh md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-5 md:py-6">
        <Link href="/artists/dashboard" className="block shrink-0 self-start" aria-label="Artist Portal overview">
          <Image src="/aod-wordmark-sm.png" alt="AOD." width={78} height={22} priority unoptimized className="h-[22px] w-auto" />
        </Link>
        <div className="-mt-2 hidden text-[13px] text-muted md:block">Artist Portal</div>
        <nav aria-label="Artist portal" className="flex gap-[18px] md:mt-7 md:block">
          {items.map((it) => {
            const on = path.startsWith(it.href);
            const c = it.count ? n[it.count] : 0;
            return (
              <Link key={it.href} href={it.href} aria-current={on ? "page" : undefined} className={`flex items-center gap-2 whitespace-nowrap py-[7px] transition-colors ${on ? "font-medium text-ink" : "text-muted hover:text-ink"}`}>
                {on && <i className="h-1.5 w-1.5 rounded-full bg-brand" />}
                {it.label}
                {c > 0 && <span className="ml-auto text-[13px] font-semibold text-brand">{c}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden md:block">
          {me && (
            <div className="flex items-center gap-2.5 text-sm">
              <Avatar src={me.photo} name={me.name} size={32} />
              <div>
                {db?.profile.name}
                <small className="block text-xs text-muted">{me.craft}</small>
              </div>
            </div>
          )}
          <div className="mt-5 flex gap-4 text-xs text-muted">
            <Link href="/artists/sign-in" onClick={() => setPortalEmail("")} className="hover:text-ink">
              Sign Out
            </Link>
          </div>
        </div>
      </aside>
      <main className="min-w-0 max-w-[1120px] px-4 pb-24 pt-5 md:px-12 md:pt-6">
        {/* Back To Main Site, on every device (the portal is its own site, artists.aod.co.in). */}
        <div className="mb-5 flex justify-end md:mb-6">
          <MainSiteLink />
        </div>
        {children}
      </main>
    </div>
  );
}
