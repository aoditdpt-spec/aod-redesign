import type { Metadata } from "next";
import { disputePage as p } from "@/data/pages";
import { brand } from "@/data/site";
import { Container } from "@/components/ui/Container";
import Link from "next/link";
import { PageHeader, Points } from "@/components/ui/PageHeader";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";
import { Section, Steps } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Dispute Desk", description: p.meta };

// The Dispute Desk, with aod.co.in's content (resolve.aod.co.in): what it's for, AOD's three
// promises, how a dispute is settled, the two kinds of case (booked through AOD or outside it),
// who can raise one and about what, and how to escalate, with Raise A Dispute (/dispute-desk/new)
// and Track A Dispute (/dispute-desk/track). No WhatsApp or contact buttons (the navbar, bottom bar
// and footer carry them).
export default function DisputeDeskPage() {
  const { aod, outside } = p.paths;
  return (
    <main className="flex-1">
      <PageHeader label={p.label} title={p.title}>
        <Link href="/dispute-desk/new" className={primaryButton}>
          Raise A Dispute
        </Link>
        <Link href="/dispute-desk/track" className={secondaryButton}>
          Track A Dispute
        </Link>
      </PageHeader>
      <Container className="pb-16 lg:pb-20">
        <p className="max-w-3xl text-xl leading-relaxed sm:text-2xl sm:leading-relaxed">{p.lead}</p>
        <p className="mt-6 max-w-3xl text-lg text-ink/80">{p.intro}</p>
        <p className="mt-6 max-w-3xl text-muted">{p.notSupport}</p>
      </Container>

      <Points items={p.promises} className="pb-20 lg:pb-28" />

      <Section title={p.stepsTitle}>
        <Steps items={p.steps} />
      </Section>

      <Section title={p.pathsTitle}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-2xl">{aod.title}</h3>
            <p className="mt-3 text-ink/80">{aod.text}</p>
            <ol className="mt-6 border-t border-line">
              {p.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[32px_1fr] border-b border-line py-3">
                  <span className="text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="text-2xl">{outside.title}</h3>
            <p className="mt-3 text-ink/80">{outside.text}</p>
            <ol className="mt-6 border-t border-line">
              {outside.steps.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[32px_1fr] border-b border-line py-3">
                  <span className="text-sm text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    {s.title}
                    <span className="mt-1 block text-sm text-muted">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <div>
                <h4 className="font-medium">{outside.canTitle}</h4>
                <ul className="mt-3 space-y-2 text-sm text-ink/80">
                  {outside.can.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">{outside.cantTitle}</h4>
                <ul className="mt-3 space-y-2 text-sm text-muted">
                  {outside.cant.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title={p.whoTitle}>
        <p className="max-w-3xl text-lg text-ink/80">{p.whoText}</p>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {p.roles.map((r) => (
            <div key={r.title}>
              <h3 className="text-2xl">{r.title}</h3>
              <p className="mt-2 text-muted">{r.text}</p>
              <ul className="mt-5 border-t border-line">
                {r.issues.map((i) => (
                  <li key={i} className="border-b border-line py-2.5 text-[15px]">
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={p.escalateTitle}>
        <p className="max-w-3xl text-lg text-ink/80">{p.escalateText}</p>
        <dl className="mt-6 max-w-xl border-t border-ink">
          <div className="flex gap-4 border-b border-line py-3">
            <dt className="w-36 shrink-0 text-muted">{p.officerLabel}</dt>
            <dd className="space-y-1">
              <a href={`mailto:${brand.email}`} className="block">
                {brand.email}
              </a>
              <a href={brand.phoneHref} className="block">
                {brand.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>
        <p className="mt-8 max-w-3xl text-muted">{p.furtherHelp}</p>
      </Section>
    </main>
  );
}
