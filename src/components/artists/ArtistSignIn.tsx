"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";
import { setPortalEmail } from "@/lib/portal-session";

// Artist portal sign-in, as on aod.co.in: the email AOD knows them by, then a 6-digit code.
// Test mode: no email is sent and any code (or none) opens the portal: an applicant's email shows
// their application's progress; any other email opens the sample artist.
const input = "h-12 w-full rounded-lg border border-line bg-paper px-4 text-base outline-none transition-colors placeholder:text-muted focus:border-ink";

export function ArtistSignIn() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  return (
    <div className="max-w-md border-t border-ink pt-10">
      {step === "email" ? (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" className={input} />
          </label>
          <button className={`${primaryButton} w-full`}>Send OTP</button>
        </form>
      ) : (
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setPortalEmail(email);
            router.push("/artists/dashboard");
          }}
        >
          <label className="block">
            <span className="mb-2 block text-sm text-muted">Enter The OTP</span>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className={`${input} max-w-48 tracking-[0.3em]`} />
          </label>
          <div className="flex flex-wrap gap-3 max-sm:*:flex-1">
            <button type="button" onClick={() => setStep("email")} className={secondaryButton}>
              Back
            </button>
            <button className={primaryButton}>Sign In</button>
          </div>
        </form>
      )}
      <p className="mt-10 text-muted">
        New To AOD?{" "}
        <Link href="/artists/apply" className="font-medium text-ink underline underline-offset-4">
          Apply To Join
        </Link>
      </p>
    </div>
  );
}
