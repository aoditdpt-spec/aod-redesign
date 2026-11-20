import { hero, promises } from "@/data/home";
import { Container } from "@/components/ui/Container";
import { HeroMosaic } from "./HeroMosaic";
import { ScrambleWord } from "@/components/motion/ScrambleWord";
import { Reveal } from "@/components/motion/Reveal";

// The first screen: "Book a <artist>" (the kind of artist scrambles from one to the next) with
// Our Promises beside it (under it on phones), then the artists at work in an uneven photo grid
// (HeroMosaic). The promises moved here from their own section on request (2026-11-19).
export function Hero() {
  return (
    <section>
      <Container className="pb-4 pt-8 sm:pt-10 lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
          <h1 aria-label={hero.label} className="overflow-x-clip text-[2.2rem] sm:text-5xl lg:text-6xl">
            {/* The word sits on its own line, so the heading never reflows as it changes. */}
            <ScrambleWord lead={hero.before} words={hero.words} className="block whitespace-nowrap" />
          </h1>
          <Reveal delay={0.05} className="lg:w-80">
            <p className="text-sm text-muted">{promises.title}</p>
            <ul className="mt-3">
              {promises.items.map((t) => (
                <li key={t} className="border-t border-line py-2.5 text-[15px] font-medium sm:text-base">
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <Reveal delay={0.1} className="mt-8 lg:mt-12">
          <HeroMosaic />
        </Reveal>
      </Container>
    </section>
  );
}
