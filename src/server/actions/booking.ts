"use server";

import { after } from "next/server";
import { categories } from "@/data/site";
import { backendEnabled } from "@/lib/backend";
import { eventMinutes, timeRange } from "@/lib/event-time";
import { nextOrderNumber, orderId } from "@/lib/order-id";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ALL_ORDERS_TAB, istNow, notifyEnabled, runJob, runOrQueue, spamNote, spamSubject, teamEmails, type Job } from "@/server/notify";

// Saves a booking request to the same Supabase `bookings` table as aod.co.in, so it shows in the
// admin, My Bookings and the orders sheet like any other website order (the same row shape as the
// live site's createBookingRequest). Every field is checked here again; the page only says
// "received" once this has saved. There is no WhatsApp step: the order lives in the database.

export type SaveResult = { ok: true; ref: string } | { ok: false; error: string; verify?: boolean };

export type BookingInput = {
  categories: string[]; // slugs, as picked
  kinds?: string[]; // the kinds of artist picked in question 02 (Photographers, DJs…)
  occasion?: string; // question 03
  brief?: string; // for the artists
  lines?: { category: string; name: string; count: number }[]; // how many of each kind (question 02, under the kinds)
  date: string; // yyyy-mm-dd
  startTime: string; // HH:MM
  endTime: string; // HH:MM (earlier than the start = ends after midnight)
  venue: string; // the exact venue (from Google Maps suggestions, or typed)
  city: string; // the venue's city, when Google Maps gave one
  details: string; // optional: guest count, venue, budget…
  name: string;
  phone: string;
  email: string;
  website?: string; // hidden spam-trap field (see spamNote in server/notify.ts)
};

const ADMIN_URL = "https://admin.aod.co.in/bookings";
const SITE_URL = "https://www.aod.co.in";

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
// Indian mobile numbers, with or without +91 / 0 in front; other countries need at least 8 digits.
const phoneOk = (p: string) => {
  const d = p.replace(/\D/g, "");
  return /^(?:91|0)?[6-9]\d{9}$/.test(d) || (d.length >= 8 && d.length <= 15);
};
// A real yyyy-mm-dd date, from tomorrow (India time) onwards.
const dateOk = (d: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || Number.isNaN(Date.parse(d))) return false;
  return d > new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);
};

export async function createBookingRequest(input: BookingInput): Promise<SaveResult> {
  if (!backendEnabled || !process.env.SUPABASE_SECRET_KEY) return { ok: false, error: "Saving isn't set up yet." };
  const suspect = text(input.website, 200) !== "";

  const picked = Array.isArray(input.categories) ? input.categories : [];
  const needs = categories.filter((c) => picked.includes(c.slug)).sort((a, b) => picked.indexOf(a.slug) - picked.indexOf(b.slug));
  const date = text(input.date, 10);
  const startTime = text(input.startTime, 5);
  const endTime = text(input.endTime, 5);
  const venue = text(input.venue, 200);
  const city = text(input.city, 60);
  // Only kinds that belong to the categories picked; they go at the top of the booking's notes.
  const allowed = needs.flatMap((c) => c.types);
  const kinds = (Array.isArray(input.kinds) ? input.kinds : []).filter((k) => allowed.includes(k));
  // How many of each: kept to the categories picked and their kinds (or the category's own name),
  // 1 to 20 each (MAX_ARTISTS, as on the main site).
  const lines = (Array.isArray(input.lines) ? input.lines : [])
    .filter((l) => l && needs.some((c) => c.slug === l.category && (c.types.includes(l.name) || c.name === l.name)))
    .map((l) => ({ category: l.category, name: l.name, count: Math.max(1, Math.min(20, Math.floor(Number(l.count) || 1))) }));
  const countOf = (slug: string) => lines.filter((l) => l.category === slug).reduce((n, l) => n + l.count, 0) || 1;
  const wantedLines = lines.map((l) => (l.count > 1 ? `${l.name} × ${l.count}` : l.name)).join(", ");
  const occasion = text(input.occasion, 80);
  const brief = text(input.brief, 1500);
  const details = [
    wantedLines ? `Who: ${wantedLines}` : kinds.length ? `Kinds: ${kinds.join(", ")}` : "",
    occasion && `Occasion: ${occasion}`,
    text(input.details, 1500),
    brief && `Brief for the artists:\n${brief}`,
  ]
    .filter(Boolean)
    .join("\n");
  const name = text(input.name, 80);
  const phone = text(input.phone, 20);
  const email = text(input.email, 120).toLowerCase();

  if (!needs.length) return { ok: false, error: "Pick who you need." };
  if (!dateOk(date)) return { ok: false, error: "Choose the event date, from tomorrow onwards." };
  if (eventMinutes(startTime, endTime) === null) return { ok: false, error: "Add the start time and how many hours." };
  if (venue.length < 3) return { ok: false, error: "Add where the event is." };
  if (name.length < 2) return { ok: false, error: "Enter your name." };
  if (!phoneOk(phone)) return { ok: false, error: "Enter a valid phone number." };
  if (!emailOk(email)) return { ok: false, error: "Enter a valid email address." };

  // Keeps bots from ordering: the email must have been confirmed with the emailed code.
  const { data: auth } = await (await createClient()).auth.getUser();
  if (auth.user?.email?.toLowerCase() !== email) return { ok: false, error: "Confirm your email with the 6-digit code we send to it.", verify: true };

  const when = timeRange(startTime, endTime);
  const wanted = needs.map((c) => c.name).join(", ");
  const now = new Date().toISOString();
  // One line per category, with how many artists it needs (its kinds added up).
  const items = needs.map((c) => ({ category: c.slug, service: c.name, count: countOf(c.slug), artistIds: [] as string[] }));
  const db = createAdminClient();

  try {
    // The next free order ID across every order (both sites), retrying if someone took it first;
    // the database refuses a second order with the same year and number.
    let ref = "";
    for (let attempt = 0; attempt < 4 && !ref; attempt++) {
      const { data, error: readError } = await db.from("bookings").select("id").like("id", "AOD-%");
      if (readError) throw new Error(readError.message);
      const id = orderId(items.map((i) => i.category), nextOrderNumber((data ?? []).map((r) => String(r.id))));
      const { error } = await db.from("bookings").insert({
        id,
        request_ref: id,
        created_at: now,
        audience: "Personal",
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        items,
        category: items[0].category,
        service: items[0].service,
        artists_needed: items.reduce((n, i) => n + i.count, 0),
        event: occasion,
        event_date: date,
        event_time: startTime,
        event_end_time: endTime,
        city,
        venue,
        notes: details,
        status: "new",
        history: [{ at: now, by: "Website", status: "new" }],
        notes_log: suspect ? [spamNote(now)] : [],
        source: "website",
      });
      if (!error) ref = id;
      else if (error.code !== "23505") throw new Error(error.message); // 23505 = taken: try the next number
    }
    if (!ref) throw new Error("Couldn't get a free order number.");

    after(async () => {
      const summary = [`Ref: ${ref}`, `Looking for: ${wanted}`, `Date: ${date}`, `Time: ${when}`, `Venue: ${venue}`, details && `Anything else:\n${details}`]
        .filter(Boolean)
        .join("\n");
      // "All orders" only: the sheet's category tabs are named after the live site's categories.
      const jobs: Job[] = [
        { kind: "sheet", tab: ALL_ORDERS_TAB, rows: [[ref, ref, istNow(), "Personal", "", wanted, name, phone, email, date, when, city || venue, details, "New", "Website", String(items.reduce((n, i) => n + i.count, 0)), ""]] },
      ];
      if (await notifyEnabled("New booking request")) {
        jobs.push({
          kind: "email",
          to: await teamEmails(),
          subject: spamSubject(suspect, `New booking request ${ref}: ${wanted} in ${city || venue}`),
          text: `${summary}\n\nCustomer: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nOpen the admin: ${ADMIN_URL}`,
          replyTo: email,
        });
      }
      if (!suspect) {
        jobs.push({
          kind: "email",
          to: [email],
          subject: `We've received your request ${ref}`,
          text: `Hi ${name},\n\nThanks for your request. We're finding the right artist for you and will be in touch soon.\n\n${summary}\n\nSee it any time under My Bookings: ${SITE_URL}/my-bookings\n\n– Team AOD`,
        });
      }
      await runOrQueue(jobs);
    });

    return { ok: true, ref };
  } catch (e) {
    console.error("[booking request]", e);
    // Don't let the request vanish: email the team everything straight away, without the database.
    after(async () => {
      try {
        await runJob({
          kind: "email",
          to: await teamEmails(),
          subject: `Couldn't save a booking request: add it in the admin (${name}, ${wanted})`,
          text: [
            "The website couldn't save this booking request, so it isn't in the admin. Add it there (Bookings → New booking).",
            "",
            `Looking for: ${wanted}`,
            `Date: ${date}`,
            `Time: ${when}`,
            `Venue: ${venue}`,
            `Anything else: ${details || "—"}`,
            "",
            `Customer: ${name}`,
            `Phone: ${phone}`,
            `Email: ${email}`,
            "",
            `Error: ${e instanceof Error ? e.message : String(e)}`.slice(0, 500),
          ].join("\n"),
          replyTo: email,
        });
      } catch (mailError) {
        console.error("[booking request] couldn't email the team either", mailError);
      }
    });
    return { ok: false, error: "Couldn't save your request just now. Please try again in a minute." };
  }
}
