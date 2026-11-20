"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { btn, btnMain, field, label } from "./ui";

// The admin's sign-in, as on aod.co.in: a work email listed in Team And Roles, then a 6-digit code.
// Test mode: no email is sent, any code works, and the session is kept in this browser
// (localStorage `aod-admin-session`) until Sign Out.

const KEY = "aod-admin-session";
const listeners = new Set<() => void>();
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};
export function setAdminSession(email: string) {
  try {
    if (email) localStorage.setItem(KEY, email);
    else localStorage.removeItem(KEY);
  } catch {}
  listeners.forEach((l) => l());
}
// The signed-in email; "" when signed out; null on the server and while hydrating.
export function useAdminSession() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => null,
  );
}

export function AdminSignIn() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="grid min-h-dvh place-items-center px-4 text-sm">
      <div className="w-full max-w-sm">
        <Image src="/aod-wordmark-sm.png" alt="AOD." width={78} height={22} priority unoptimized className="h-[22px] w-auto" />
        <h1 className="mt-8 text-[28px]">Team Sign In</h1>
        <p className="mt-2 text-muted">Your work email, listed in Team And Roles.</p>
        {step === "email" ? (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setStep("code");
            }}
          >
            <label className="block">
              <span className={label}>Work Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email" placeholder="aditi@example.com" className={field} />
            </label>
            <button className={`${btnMain} w-full`}>Send OTP</button>
          </form>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setAdminSession(email.trim().toLowerCase() || "aditi@example.com");
            }}
          >
            <label className="block">
              <span className={label}>Enter The OTP</span>
              <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className={`${field} tracking-[0.3em]`} />
            </label>
            <div className="flex gap-2 *:flex-1">
              <button type="button" onClick={() => setStep("email")} className={btn}>
                Back
              </button>
              <button className={btnMain}>Sign In</button>
            </div>
          </form>
        )}
        <p className="mt-6 text-xs text-muted">Test mode: no email is sent. Any code works, or none.</p>
        <Link href="/" className="mt-10 block text-xs text-muted hover:text-ink">
          Back To Main Site
        </Link>
      </div>
    </div>
  );
}
