"use server";

import { backendEnabled } from "@/lib/backend";
import { createClient } from "@/lib/supabase/server";

// The booking's email check: a 6-digit code emailed through Supabase Auth (the same sign-in as
// aod.co.in's My Bookings, on the same project). Verifying it signs the visitor in as that email,
// kept in cookies, so the booking save knows the email is theirs.

export type Result = { ok: true } | { ok: false; error: string };

const clean = (email: string) => email.trim().toLowerCase();
const emailOk = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// Supabase's messages, in plainer words where we know them.
function friendly(message: string) {
  if (/security purposes|rate limit|too many/i.test(message)) return "Please wait a minute before asking for another code.";
  return "Couldn't send the code just now. Please try again in a minute.";
}

export async function requestCode(rawEmail: string): Promise<Result> {
  if (!backendEnabled) return { ok: false, error: "Sign-in isn't set up yet." };
  const email = clean(rawEmail);
  if (!emailOk(email)) return { ok: false, error: "Enter a valid email address." };
  const { error } = await (await createClient()).auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
  return error ? { ok: false, error: friendly(error.message) } : { ok: true };
}

export async function verifyCode(rawEmail: string, code: string): Promise<Result> {
  if (!backendEnabled) return { ok: false, error: "Sign-in isn't set up yet." };
  const email = clean(rawEmail);
  if (!emailOk(email) || !/^\d{6}$/.test(code)) return { ok: false, error: "Enter the 6-digit code from the email." };
  const { error } = await (await createClient()).auth.verifyOtp({ email, token: code, type: "email" });
  return error ? { ok: false, error: "That code didn't work or has expired. Check it, or ask for a new one." } : { ok: true };
}

// The email signed in on this browser (confirmed before), or null.
export async function signedInEmail(): Promise<string | null> {
  if (!backendEnabled) return null;
  const { data } = await (await createClient()).auth.getUser();
  return data.user?.email?.toLowerCase() ?? null;
}
