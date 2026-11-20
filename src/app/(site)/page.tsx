import { Categories } from "@/components/home/Categories";
import { Closing } from "@/components/home/Closing";
import { Hero } from "@/components/home/Hero";
import { BrandStrip } from "@/components/home/BrandStrip";
import { Partner } from "@/components/home/Partner";
import { Places } from "@/components/home/Places";

// The homepage, in the order a first-time visitor decides:
// the one idea (the heading, with our promises beside it) -> who they can book -> every part of AOD
// (the page turns black) -> real work (GATE 2026) -> the brands we've worked with -> the last word.
export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <Categories />
      <Places />
      <Partner />
      <BrandStrip />
      <Closing />
    </main>
  );
}
