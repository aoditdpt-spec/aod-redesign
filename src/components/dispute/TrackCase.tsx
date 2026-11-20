"use client";

import { useState, useSyncExternalStore } from "react";
import { caseForm as f } from "@/data/dispute-form";
import { act, ago, useDb } from "@/lib/mock-db";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";

// Track a dispute, as on aod.co.in: the case number and the email it was raised with show its
// progress and AOD's decision, and Escalate sends it to the grievance officer. It never shows the
// team's internal notes. Test mode: sample cases (raised without an email) open with any email.

const input = "h-12 w-full rounded-lg border border-line bg-paper px-4 text-base outline-none transition-colors placeholder:text-muted focus:border-ink";
const noop = () => () => {};

export function TrackCase() {
  const db = useDb();
  const fromLink = useSyncExternalStore(noop, () => new URLSearchParams(window.location.search).get("case") ?? "", () => "");
  const [num, setNum] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [asked, setAsked] = useState(false);
  const caseNo = (num ?? fromLink).trim().toUpperCase();
  const found = db?.cases.find((c) => c.id === caseNo && (!c.email || !email.trim() || c.email === email.trim().toLowerCase()));

  return (
    <div className="max-w-3xl">
      <form
        className="grid gap-4 border-t border-ink pt-8 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setAsked(true);
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Case Number</span>
          <input value={num ?? fromLink} onChange={(e) => setNum(e.target.value)} placeholder="DC-1004" className={input} />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm text-muted">Email You Raised It With</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className={input} />
        </label>
        <button className={primaryButton}>Track</button>
      </form>

      {(asked || fromLink) && db && !found && <p className="mt-8 text-muted">No case matches that number and email.</p>}

      {(asked || fromLink) && found && (
        <div className="mt-12">
          <p className="text-sm text-muted">{found.outside ? "AOD Mediates" : "Booked Through AOD"}</p>
          <h2 className="mt-2 text-4xl">
            {found.id} · {found.about}
          </h2>
          <p className="mt-2 text-muted">Raised {ago(found.raisedAt)}</p>
          <ol className="mt-10 space-y-6">
            {(found.outside ? f.stepsOutside : f.steps).map((s, i) => {
              const at = found.status === "resolved" ? 2 : found.status === "new" ? 0 : 1;
              return (
                <li key={s.id} className="grid grid-cols-[28px_1fr] gap-4">
                  <span className={`mt-1 grid h-6 w-6 place-items-center rounded-full text-xs ${i <= at ? "bg-ink text-paper" : "border border-line text-muted"}`}>{i + 1}</span>
                  <span>
                    <span className={`block font-medium ${i <= at ? "" : "text-muted"}`}>{s.label}</span>
                    <span className="mt-1 block text-sm text-muted">{s.text}</span>
                  </span>
                </li>
              );
            })}
          </ol>
          {found.status === "escalated" && <p className="mt-8 rounded-lg bg-wash p-4">Escalated: AOD&apos;s grievance officer is reviewing the case afresh.</p>}
          {found.decision && (
            <section className="mt-10 border-t border-line pt-6">
              <h3 className="text-2xl">AOD&apos;s Decision</h3>
              <p className="mt-3 whitespace-pre-line text-ink/80">{found.decision}</p>
            </section>
          )}
          {found.status !== "escalated" && (
            <div className="mt-10 border-t border-line pt-6">
              <p className="text-muted">Not happy with the outcome? The grievance officer reviews it afresh.</p>
              <button type="button" onClick={() => act.escalate(found.id)} className={`${secondaryButton} mt-4`}>
                Escalate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
