"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { audiencePrompt as ap, bookPage as p } from "@/data/pages";
import { categories } from "@/data/site";
import { setAudience, useAudience, type Audience } from "@/lib/audience";
import { backendEnabled } from "@/lib/backend";
import { endAfter, timeRange } from "@/lib/event-time";
import { orderId } from "@/lib/order-id";
import { takeRebook } from "@/lib/rebook";
import { requestCode, signedInEmail, verifyCode } from "@/server/actions/auth";
import { createBookingRequest, type SaveResult } from "@/server/actions/booking";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";
import { Dots } from "@/components/ui/Dots";
import { DurationField, TimeField } from "@/components/ui/TimePicker";
import { withCount } from "@/components/ui/CountPicker";
import { VenueField, blankVenue, type Venue } from "@/components/ui/VenueField";

// The booking request, with as few clicks as possible (on request, 2026-11-19): each pick moves on
// by itself, with no Next button.
//   01 Who Are You Looking For?  tap one category
//   02 Which Kind Of Artist?     tap one kind, then How Many? below it on the same question: 1, 2, 3
//                                or More (a box for 4 to 20); nothing picked to start with. A category
//                                with only one kind asks How Many? alone. Tapping a number moves on.
//   03 When, Where And Your Details   date, start time, how many hours, where, anything else, then
//                                name, phone and email; Send OTP, then Confirm
//      Request saves it straight away (no review page) and says "Request Received." with the ref.
// The answers so far show as chips that jump back; Back, Undo and Clear All sit by the progress.
// Business events are booked from the company's account (/business), as on aod.co.in: there the
// portal's Book Artists tab shows these questions with `forceAudience="business"` and the company's
// contact details filled in; anywhere else a visitor who chose Business Events goes to /business
// (on a category page, a line points there instead). Mock mode (backendEnabled off): no email goes
// out, nothing is required, any code or none passes, and the request is kept in this browser.

export const MOCK_ORDERS_EVENT = "aod-mock-orders";

const noop = () => () => {};
// "?for=photo-video" picks that category to start with.
function usePreset() {
  return useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("for") ?? "",
    () => "",
  );
}

// The earliest date to offer (tomorrow), worked out in the browser only.
const tomorrow = () => {
  const d = new Date(Date.now() + 864e5);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function useTomorrow() {
  return useSyncExternalStore(noop, tomorrow, () => "");
}

// Mock mode's "database": requests kept in this browser (localStorage). Returns the order's number.
function saveMock(order: Record<string, unknown>) {
  try {
    const list = JSON.parse(localStorage.getItem("aod-mock-orders") ?? "[]") as unknown[];
    list.push({ ...order, at: new Date().toISOString() });
    localStorage.setItem("aod-mock-orders", JSON.stringify(list));
    // Tells this tab's other readers (the admin's data, the business portal's orders).
    window.dispatchEvent(new Event(MOCK_ORDERS_EVENT));
    return list.length;
  } catch {
    return 1;
  }
}

const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const input = "mt-2 h-12 w-full rounded-lg border border-line bg-paper px-4 text-base text-ink outline-none transition-colors focus:border-ink";
const tile = (on: boolean) => `rounded-xl border text-left font-medium leading-tight transition-colors ${on ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"}`;
const textButton = "text-sm font-medium text-ink underline underline-offset-4 hover:text-brand disabled:cursor-not-allowed disabled:no-underline disabled:opacity-40";
const blank = { date: "", time: "", hours: 0, venue: blankVenue as Venue, details: "", name: "", phone: "", email: "" };
const LAST = p.steps.length - 1;
const COUNTS = [1, 2, 3]; // then More, a box for 4 to 20

type Contact = { name: string; phone: string; email: string };
type Snapshot = { step: number; cat: string | null; kind: string | null; count: number | null; form: typeof blank };

export function BookForm({ forceAudience, contact, presetCategory, presetDate }: { forceAudience?: Audience; contact?: Contact; presetCategory?: string; presetDate?: string }) {
  const chosenAudience = useAudience();
  const router = useRouter();
  const toBusiness = !forceAudience && chosenAudience === "business";
  const redirect = toBusiness && !presetCategory;
  useEffect(() => {
    if (redirect) router.replace("/business");
  }, [redirect, router]);
  if (redirect) return <p className="text-muted">Opening AOD For Business…</p>;
  if (toBusiness)
    return (
      <p className="text-lg text-muted">
        Business events are booked from your company account.{" "}
        <Link href="/business" className="font-medium text-ink underline underline-offset-4">
          Open AOD For Business
        </Link>
      </p>
    );
  return <Questions audience={forceAudience ?? chosenAudience} forced={!!forceAudience} contact={contact} presetCategory={presetCategory} presetDate={presetDate} />;
}

// `presetDate` ("YYYY-MM-DD"): the event date already filled in (a day picked on the business calendar).
function Questions({ audience, forced, contact, presetCategory, presetDate }: { audience: Audience | null | "unknown"; forced: boolean; contact?: Contact; presetCategory?: string; presetDate?: string }) {
  const queryPreset = usePreset();
  const preset = categories.some((c) => c.slug === (presetCategory ?? queryPreset)) ? (presetCategory ?? queryPreset) : "";
  const minDate = useTomorrow();
  const [picked, setPicked] = useState<string | null | undefined>(undefined); // undefined: the preset
  const cat = picked === undefined ? preset || null : picked;
  const category = categories.find((c) => c.slug === cat);
  const single = category ? category.types.length <= 1 : false;
  // A preset category opens at its next question.
  const [stepState, setStep] = useState<number | null>(null);
  const step = stepState ?? (preset ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [kindState, setKind] = useState<string | null>(null);
  const kind = single ? (category?.types[0] ?? category?.name ?? null) : kindState;
  const [count, setCount] = useState<number | null>(null); // nothing picked to start with
  const [more, setMore] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [form, setForm] = useState(() => ({ ...blank, date: presetDate ?? "", ...contact }));
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [view, setView] = useState<"form" | "done">("form");
  const [ref, setRef] = useState("");
  const [codeFor, setCodeFor] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "code" | "verify" | "save">(null);
  const [website, setWebsite] = useState(""); // the hidden spam-trap field
  const top = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const codeBox = useRef<HTMLInputElement>(null);
  const moved = useRef(false);

  const email = form.email.trim().toLowerCase();
  const confirmed = verified === email;
  const codeSent = !confirmed && codeFor === email;
  const endTime = endAfter(form.time, form.hours);
  const kindName = kind ?? category?.name ?? "";
  const needsText = kindName ? withCount(kindName, count ?? 1) : "";

  // Book Again (My Bookings, the business portal): that order's answers, opened at the details.
  useEffect(() => {
    const again = takeRebook();
    if (!again) return;
    void Promise.resolve().then(() => {
      const c = again.categories[0] ?? null;
      const k = (c && again.kinds[c]?.[0]) || categories.find((x) => x.slug === c)?.types[0] || null;
      setPicked(c);
      setKind(k);
      setCount((k && again.counts[k]) || 1);
      setForm((f) => ({ ...f, venue: { ...blankVenue, text: again.venue }, time: again.time, hours: again.hours, details: again.details }));
      moved.current = true;
      setStep(LAST);
    });
  }, []);

  // Already signed in with this email? Typing it skips the code.
  useEffect(() => {
    if (!backendEnabled) return;
    signedInEmail()
      .then((e) => e && setVerified(e))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const box = top.current;
    if (box && box.getBoundingClientRect().top < 64) box.scrollIntoView({ block: "start" });
    if (view === "form") window.setTimeout(() => heading.current?.focus({ preventScroll: true }), 50);
  }, [step, view]);

  const goStep = (n: number) => {
    const to = Math.max(0, Math.min(LAST, n));
    moved.current = true;
    setDir(to >= step ? 1 : -1);
    setStep(to);
  };
  const remember = () => setHistory((h) => [...h.slice(-49), { step, cat, kind: kindState, count, form }]);
  function undo() {
    const last = history.at(-1);
    if (!last) return;
    setHistory((h) => h.slice(0, -1));
    setPicked(last.cat);
    setKind(last.kind);
    setCount(last.count);
    setForm(last.form);
    if (last.step !== step) goStep(last.step);
  }
  function clearAll() {
    remember();
    setPicked(null);
    setKind(null);
    setCount(null);
    setShowMore(false);
    setForm({ ...blank, ...contact });
    setMissing([]);
    goStep(0);
  }
  const back = () => goStep(step - 1);

  const pickCategory = (slug: string) => {
    remember();
    if (slug !== cat) {
      setKind(null);
      setCount(null);
      setShowMore(false);
    }
    setPicked(slug);
    goStep(1);
  };
  // Picking a kind stays on question 02, where How Many? appears under the kinds.
  const pickKind = (k: string) => {
    remember();
    if (k !== kindState) {
      setCount(null);
      setShowMore(false);
    }
    setKind(k);
  };
  const pickCount = (n: number) => {
    remember();
    setCount(Math.max(1, Math.min(20, n)));
    goStep(LAST);
  };
  const set = (key: "details" | "name" | "phone" | "email") => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const change = (patch: Partial<typeof blank>) => {
    remember();
    setForm((f) => ({ ...f, ...patch }));
  };

  function stillNeeded() {
    const f = p.fields;
    return [
      !cat && p.rows.who,
      !form.date && f.date,
      !form.time && f.time,
      !form.hours && f.hours.replace("?", ""),
      !form.venue.text.trim() && f.venue,
      !form.name.trim() && f.name,
      form.phone.replace(/\D/g, "").length < 10 && f.phone,
      !isEmail(email) && f.email,
    ].filter((x): x is string => Boolean(x));
  }

  // The last question's button: Send OTP, then Confirm Request (saves it straight away).
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const need = backendEnabled ? stillNeeded() : [];
    setMissing(need);
    if (need.length > 0) return;
    if (!confirmed && !codeSent) return sendCode();
    if (!confirmed && backendEnabled) {
      if (!/^\d{6}$/.test(code)) return codeBox.current?.focus();
      setBusy("verify");
      setCodeError(null);
      const res = await verifyCode(email, code).catch(() => ({ ok: false as const, error: "Couldn't check the code just now. Please try again." }));
      setBusy(null);
      if (!res.ok) return setCodeError(res.error);
      setVerified(email);
    }
    return confirm();
  }

  async function sendCode() {
    setBusy("code");
    setCodeError(null);
    setCode("");
    const res = backendEnabled
      ? await requestCode(email).catch(() => ({ ok: false as const, error: "Couldn't send the code just now. Please try again in a minute." }))
      : await new Promise<{ ok: true }>((done) => window.setTimeout(() => done({ ok: true }), 500));
    setBusy(null);
    if (!res.ok) {
      setCodeFor(null);
      return setCodeError(res.error);
    }
    setCodeFor(email);
    window.setTimeout(() => codeBox.current?.focus(), 0);
  }

  async function confirm() {
    setSaveError(null);
    const lines = cat ? [{ category: cat, name: kindName, count: count ?? 1 }] : [];
    if (!backendEnabled) {
      const n = saveMock({
        audience,
        categories: cat ? [cat] : [],
        kinds: kind ? [kind] : [],
        counts: kind ? { [kind]: count ?? 1 } : {},
        lines,
        needs: needsText,
        ...form,
        endTime,
        email,
      });
      setRef(orderId(cat ? [cat] : [], n, new Date(), audience === "business"));
      moved.current = true;
      return setView("done");
    }
    setBusy("save");
    const res = await createBookingRequest({
      categories: cat ? [cat] : [],
      kinds: kind ? [kind] : [],
      lines,
      date: form.date,
      startTime: form.time,
      endTime,
      venue: form.venue.text,
      city: form.venue.city,
      details: form.details,
      name: form.name,
      phone: form.phone,
      email,
      website,
    }).catch((): SaveResult => ({ ok: false, error: "Couldn't save your request just now. Please try again in a minute." }));
    setBusy(null);
    if (res.ok) {
      setRef(res.ref);
      moved.current = true;
      return setView("done");
    }
    if (res.verify) {
      setVerified(null);
      setCodeFor(null);
      setCodeError(res.error);
      return;
    }
    setSaveError(res.error);
  }

  // Book Another Event: the questions again from the start, keeping the contact details.
  function another() {
    setPicked(null);
    setKind(null);
    setCount(null);
    setShowMore(false);
    setForm((f) => ({ ...blank, name: f.name, phone: f.phone, email: f.email }));
    setHistory([]);
    setMissing([]);
    setSaveError(null);
    setDir(-1);
    setStep(0);
    moved.current = true;
    setView("form");
  }

  // The answers so far, as chips that jump back to their question.
  const chips = [
    { text: category?.name ?? "", step: 0 },
    { text: count ? needsText : single ? "" : (kind ?? ""), step: 1 },
  ].filter((c) => c.text && c.step < step);

  if (view === "done")
    return (
      <div ref={top} className="max-w-3xl scroll-mt-24" role="status">
        <h2 className="text-4xl sm:text-5xl">
          <Dots>{p.confirmedTitle}</Dots>
        </h2>
        <p className="mt-6 text-2xl font-medium tabular-nums">
          <span className="text-muted">{p.orderLabel}</span> {ref}
        </p>
        <p className="mt-4 max-w-xl text-lg text-muted">
          {p.confirmedNote}
          {backendEnabled && (
            <>
              {" "}
              {p.copySent} <span className="text-ink">{email}</span>.
            </>
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-3 max-sm:*:flex-1">
          <button type="button" onClick={another} className={primaryButton}>
            {p.another}
          </button>
          <Link href="/my-bookings" className={secondaryButton}>
            {p.myBookings}
          </Link>
        </div>
        {!backendEnabled && <p className="mt-6 text-sm text-muted">{p.previewNote}</p>}
      </div>
    );

  return (
    <div ref={top} className="max-w-3xl scroll-mt-24">
      {/* The first-visit choice (AudiencePrompt); "Change" asks the question again. */}
      {!forced && ap.choices.some((c) => c.value === audience) && (
        <p className="mb-8 text-muted">
          {ap.bookingFor}: <span className="font-medium text-ink">{ap.choices.find((c) => c.value === audience)?.title}</span>{" "}
          <button type="button" onClick={() => setAudience(null)} className={`ml-2 ${textButton}`}>
            {ap.change}
          </button>
        </p>
      )}

      {/* Progress, with Back, Undo and Clear All. */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-5">
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{p.question(step + 1, p.steps.length)}</span>
          <span className="flex gap-1" aria-hidden>
            {p.steps.map((_, i) => (
              <i key={i} className={`h-1 w-6 rounded-full transition-colors ${i <= step ? "bg-ink" : "bg-line"}`} />
            ))}
          </span>
        </div>
        <div className="flex gap-5">
          {step > 0 && (
            <button type="button" onClick={back} className={textButton}>
              {p.back}
            </button>
          )}
          <button type="button" onClick={undo} disabled={!history.length} className={textButton}>
            {p.undo}
          </button>
          <button type="button" onClick={clearAll} disabled={!cat && JSON.stringify(form) === JSON.stringify({ ...blank, ...contact })} className={textButton}>
            {p.clear}
          </button>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Your answers so far">
          {chips.map((c) => (
            <li key={c.step}>
              <button type="button" onClick={() => goStep(c.step)} className="max-w-[18rem] truncate rounded-full bg-wash px-3.5 py-1.5 text-sm text-ink hover:bg-line">
                {c.text}
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-10">
        <div className="overflow-x-clip">
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.section
              key={step}
              custom={dir}
              variants={{
                enter: (d: number) => ({ x: d * 48, opacity: 0 }),
                shown: { x: 0, opacity: 1, transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] } },
                leave: (d: number) => ({ x: d * -48, opacity: 0, transition: { duration: 0.18 } }),
              }}
              initial="enter"
              animate="shown"
              exit="leave"
              aria-labelledby="book-question"
            >
              <p className="text-sm text-muted">{String(step + 1).padStart(2, "0")}</p>
              <h2 id="book-question" ref={heading} tabIndex={-1} className="mt-2 text-2xl outline-none sm:text-3xl">
                {step === 1 && single && kindName ? p.howMany(kindName) : p.steps[step]}
              </h2>
              <div className="mt-6">
                {step === 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {categories.map((c) => (
                      <button key={c.slug} type="button" aria-pressed={cat === c.slug} onClick={() => pickCategory(c.slug)} className={`flex min-h-20 items-end p-4 text-base ${tile(cat === c.slug)}`}>
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}

                {step === 1 && category && !single && (
                  <div className="flex flex-wrap gap-2">
                    {category.types.map((t) => (
                      <button key={t} type="button" aria-pressed={kindState === t} onClick={() => pickKind(t)} className={`h-12 px-5 text-base ${tile(kindState === t)}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
                {step === 1 && !category && <p className="text-lg text-muted">{p.pickFirst}</p>}

                {/* How Many?, on the same question once a kind is picked (or straight away for a
                    category with only one kind): 1, 2, 3, or More for a box up to 20. */}
                {step === 1 && category && kind && (
                  <div className={single ? "" : "mt-10"}>
                    {!single && <h3 className="text-xl sm:text-2xl">{p.howMany(kindName)}</h3>}
                    <div className={`flex flex-wrap gap-2 ${single ? "" : "mt-4"}`}>
                      {COUNTS.map((n) => (
                        <button key={n} type="button" aria-pressed={count === n} onClick={() => pickCount(n)} className={`h-12 min-w-14 px-4 text-base tabular-nums ${tile(count === n)} justify-center text-center`}>
                          {n}
                        </button>
                      ))}
                      <button type="button" aria-pressed={showMore} onClick={() => setShowMore(true)} className={`h-12 px-5 text-base ${tile(showMore || (count ?? 0) > COUNTS.length)}`}>
                        {p.more}
                      </button>
                    </div>
                    {showMore && (
                      <div className="mt-5 flex max-w-sm gap-2">
                        <input
                          type="number"
                          min={COUNTS.length + 1}
                          max={20}
                          value={more}
                          onChange={(e) => setMore(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              pickCount(Number(more) || COUNTS.length + 1);
                            }
                          }}
                          placeholder={`${COUNTS.length + 1} to 20`}
                          aria-label={`How many ${kindName}, up to 20`}
                          autoFocus
                          className={`${input} mt-0`}
                        />
                        <button type="button" onClick={() => pickCount(Number(more) || COUNTS.length + 1)} className={primaryButton}>
                          {p.continue}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {step === LAST && (
                  <>
                    {/* Date, start time, how many hours, then where (on request, 2026-11-20).
                        Phones: the date across the width, start time and hours side by side under
                        it; from 640px all three in one row of equal columns. */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                      <label className="col-span-2 min-w-0 text-sm text-muted sm:col-span-1">
                        {p.fields.date}
                        <input
                          type="date"
                          min={minDate || undefined}
                          value={form.date}
                          onChange={(e) => change({ date: e.target.value })}
                          className={`${input} block min-w-0 appearance-none text-left [&::-webkit-date-and-time-value]:text-left`}
                        />
                      </label>
                      <div className="min-w-0">
                        <TimeField label={p.fields.time} value={form.time} onChange={(time) => time !== form.time && change({ time })} />
                      </div>
                      <div className="min-w-0">
                        <DurationField label={p.fields.hours} value={form.hours} onChange={(hours) => hours !== form.hours && change({ hours })} align="right" />
                      </div>
                    </div>
                    {form.time && form.hours > 0 && (
                      <p className="mt-4 text-base text-ink" aria-live="polite">
                        {timeRange(form.time, endTime)}
                      </p>
                    )}
                    <div className="mt-6">
                      <VenueField
                        label={p.fields.venue}
                        placeholder={p.venuePlaceholder}
                        value={form.venue}
                        // Picking a suggestion can be undone; typing is kept as it goes.
                        onChange={(venue) => (venue.placeId && venue.placeId !== form.venue.placeId ? change({ venue }) : setForm((f) => ({ ...f, venue })))}
                        inputClass={input}
                        testNote={!backendEnabled}
                      />
                    </div>
                    <label className="mt-4 block text-sm text-muted">
                      {p.fields.details}
                      <textarea value={form.details} onChange={set("details")} rows={3} placeholder={p.detailsPlaceholder} className={`${input} h-auto py-3 placeholder:text-muted/70`} />
                    </label>

                    <h3 className="mt-10 border-t border-line pt-8 text-2xl">{p.detailsTitle}</h3>
                    {/* Name and phone side by side, half the width each; email on its own line. */}
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                      <label className="text-sm text-muted">
                        {p.fields.name}
                        <input value={form.name} onChange={set("name")} autoComplete="name" className={input} />
                      </label>
                      <label className="text-sm text-muted">
                        {p.fields.phone}
                        <input value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" className={input} />
                      </label>
                      <label className="col-span-2 text-sm text-muted">
                        {p.fields.email}
                        <input type="email" inputMode="email" value={form.email} onChange={set("email")} autoComplete="email" className={input} />
                      </label>
                    </div>
                    {/* The spam trap: hidden, so autofill and people never reach it. */}
                    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <input tabIndex={-1} autoComplete="off" name="aod-hp" value={website} onChange={(e) => setWebsite(e.target.value)} />
                    </div>

                    {codeSent && (
                      <div className="mt-8 rounded-xl bg-wash p-5 sm:p-6">
                        <p className="text-xl font-medium text-ink">{p.codeTitle}</p>
                        <p className="mt-1 text-muted">
                          {p.codeSent} <span className="text-ink">{email || "your email"}</span>
                        </p>
                        <label className="mt-4 block max-w-56 text-sm text-muted">
                          {p.codeLabel}
                          <input
                            ref={codeBox}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            className={`${input} text-xl tracking-[0.3em] tabular-nums`}
                          />
                        </label>
                        {codeError && (
                          <p role="alert" className="mt-3 text-red-600">
                            {codeError}
                          </p>
                        )}
                        {!backendEnabled && <p className="mt-3 text-sm text-muted">{p.codePreview}</p>}
                        <button type="button" onClick={sendCode} disabled={Boolean(busy)} className={`mt-3 ${textButton}`}>
                          {p.newCode}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Only the last question has a button: Send OTP, then Confirm Request. */}
        {step === LAST && (
          <div className="mt-12 flex flex-wrap items-center gap-3 max-sm:*:flex-1">
            <button type="submit" disabled={Boolean(busy) || (backendEnabled && codeSent && code.length !== 6)} className={`${primaryButton} disabled:opacity-40`}>
              {busy === "code" ? p.sending : busy === "verify" ? p.checking : busy === "save" ? p.saving : confirmed || codeSent ? p.confirm : p.sendCode}
            </button>
          </div>
        )}
        {missing.length > 0 && (
          <p role="alert" className="mt-4 text-red-600">
            Still needed: {missing.join(", ")}
          </p>
        )}
        {codeError && !codeSent && (
          <p role="alert" className="mt-4 text-red-600">
            {codeError}
          </p>
        )}
        {saveError && (
          <p role="alert" className="mt-4 text-red-600">
            {saveError}
          </p>
        )}
      </form>
    </div>
  );
}
