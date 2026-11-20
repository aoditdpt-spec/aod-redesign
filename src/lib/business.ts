"use client";

import { useSyncExternalStore } from "react";

// AOD For Business in test mode: the signed-in company, and every company account made in this
// browser (so signing in again finds it). Kept in localStorage until the browsing data is cleared.
// As on aod.co.in, a company signs up or signs in with its email and an emailed 6-digit code; here
// no email is sent and any code (or none) works.

export const companyTypes = ["Brand Owner", "Event Planner", "Agency", "Other"] as const;

export type Company = { name: string; type: string; typeOther: string; contactName: string; email: string; phone: string; city: string; website: string };
export const blankCompany: Company = { name: "", type: "", typeOther: "", contactName: "", email: "", phone: "", city: "", website: "" };

const SESSION = "aod-business-company";
const ACCOUNTS = "aod-business-accounts";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: Company | null } = { raw: null, value: null };

function read(): Company | null {
  try {
    const raw = localStorage.getItem(SESSION);
    if (raw !== cache.raw) cache = { raw, value: raw ? { ...blankCompany, ...(JSON.parse(raw) as Partial<Company>) } : null };
    return cache.value;
  } catch {
    return null;
  }
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => (e.key === SESSION || e.key === null) && l();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const notify = () => listeners.forEach((l) => l());

function accounts(): Company[] {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS) ?? "[]") as Company[];
  } catch {
    return [];
  }
}

function save(c: Company | null) {
  try {
    if (c) {
      localStorage.setItem(SESSION, JSON.stringify(c));
      const others = accounts().filter((a) => a.email.toLowerCase() !== c.email.toLowerCase());
      localStorage.setItem(ACCOUNTS, JSON.stringify([...others, c]));
    } else localStorage.removeItem(SESSION);
  } catch {
    // Storage blocked: nothing is kept.
  }
  notify();
}

// The signed-in company; null when signed out; "unknown" on the server and while hydrating.
export function useCompany(): Company | null | "unknown" {
  return useSyncExternalStore<Company | null | "unknown">(subscribe, read, () => "unknown");
}

export const business = {
  // Create an account (sign up) and sign in with it.
  create: (c: Company) => save(c),
  // Sign in: the account made with this email in this browser, or a new one with just the email
  // (test mode lets anyone through).
  signIn(email: string) {
    const e = email.trim().toLowerCase();
    const found = accounts().find((a) => a.email.toLowerCase() === e);
    save(found ?? { ...blankCompany, email: e });
  },
  update: (c: Company) => save(c),
  signOut: () => save(null),
};
