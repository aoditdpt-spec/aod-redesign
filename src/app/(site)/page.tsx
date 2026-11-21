import type { Viewport } from "next";
import { Categories } from "@/components/home/Categories";
import { Closing } from "@/components/home/Closing";
import { Hero } from "@/components/home/Hero";
import { BrandStrip } from "@/components/home/BrandStrip";
import { Partner } from "@/components/home/Partner";
import { NoZoom } from "@/components/home/NoZoom";
import { Places } from "@/components/home/Places";

// The homepage, in the owner's order (2026-11-20): the one idea (the heading, with our promises
// beside it) -> who they can book -> the brands we've worked with -> real work (GCCI GATE Expo
// 2026) -> every part of AOD (the page turns black) -> the last word ("Ready When You Are.").
// No pinch-zoom on the homepage (with NoZoom and the CSS in globals.css); the rest of the root
// layout's viewport repeated, since a page's viewport takes over from the layout's.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function Home() {
  return (
    <main data-no-zoom className="flex-1">
      <NoZoom />
      <Hero />
      <Categories />
      <BrandStrip />
      <Partner />
      <Places />
      <Closing />
    </main>
  );
}
