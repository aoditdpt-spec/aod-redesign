"use client";

import { useState } from "react";
import { newsletterPages as p } from "@/data/pages";
import { primaryButton } from "@/components/ui/buttons";
import { Dots } from "@/components/ui/Dots";

// The confirm or unsubscribe page's one button (as on aod.co.in, a button rather than acting on
// the link itself, since mail filters open links by themselves). Mock mode: nothing is saved.
export function NewsletterAction({ mode }: { mode: "confirm" | "unsubscribe" }) {
  const c = p[mode];
  const [done, setDone] = useState(false);
  return (
    <div className="max-w-xl" aria-live="polite">
      <h1 className="text-5xl sm:text-6xl">
        <Dots>{done ? c.doneTitle : c.title}</Dots>
      </h1>
      <p className="mt-6 text-lg text-muted">{done ? c.doneText : c.text}</p>
      {!done && (
        <button type="button" onClick={() => setDone(true)} className={`${primaryButton} mt-9`}>
          {c.button}
        </button>
      )}
    </div>
  );
}
