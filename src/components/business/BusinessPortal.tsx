"use client";

import { useState, type ReactNode } from "react";
import { cities } from "@/data/site";
import { business, blankCompany, companyTypes, useCompany, type Company } from "@/lib/business";
import { shortDate, useDb, type Booking, type Db } from "@/lib/mock-db";
import { BookForm } from "@/components/book/BookForm";
import { Container } from "@/components/ui/Container";
import { Dots } from "@/components/ui/Dots";
import { primaryButton, secondaryButton } from "@/components/ui/buttons";
import { MonthAgenda, MonthGrid, MonthSwitch } from "@/components/dash/MonthGrid";
import { ArtistCards, EventRows, Payments, Timeline, bookAgain } from "@/components/bookings/OrderParts";

// aod.co.in/business, as on the main site: signed out, the page's introduction (rendered on the
// server) and a Sign In / Create Account card; a signed-in company sees its portal instead:
// Calendar, Book Artists (the booking questions as a business), Orders and Company. Test mode: no
// email is sent, any code works, and the account and orders stay in this browser.

const input = "h-12 w-full rounded-lg border border-line bg-paper px-4 text-base outline-none transition-colors placeholder:text-muted focus:border-ink";
const fieldLabel = "mb-2 block text-sm text-muted";

// Signed out: the heading, then Sign In / Create Account, then the three points under it.
export function BusinessPortal({ header, after }: { header: ReactNode; after: ReactNode }) {
  const company = useCompany();
  if (company === "unknown")
    return (
      <>
        {header}
        {after}
      </>
    );
  if (!company)
    return (
      <>
        {header}
        <Container className="pb-20 lg:pb-28">
          <BusinessAuth />
        </Container>
        {after}
      </>
    );
  return (
    <Container className="pb-20 pt-8 sm:pt-10 lg:pt-14">
      <BusinessApp company={company} />
    </Container>
  );
}

function BusinessAuth() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [step, setStep] = useState<"details" | "code">("details");
  const [f, setF] = useState<Company>(blankCompany);
  const [code, setCode] = useState("");
  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  return (
    <section className="max-w-xl border-t border-ink pt-10">
      <div role="tablist" aria-label="Sign in or create an account" className="flex gap-6 text-lg">
        {(
          [
            ["in", "Sign In"],
            ["up", "Create Account"],
          ] as const
        ).map(([id, text]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={mode === id}
            onClick={() => {
              setMode(id);
              setStep("details");
            }}
            className={`border-b-2 pb-1 transition-colors ${mode === id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {text}
          </button>
        ))}
      </div>

      {step === "details" ? (
        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
          }}
        >
          {mode === "up" && (
            <>
              <label className="block">
                <span className={fieldLabel}>Company Name</span>
                <input value={f.name} onChange={set("name")} autoComplete="organization" className={input} />
              </label>
              <div>
                <span className={fieldLabel}>We Are A</span>
                <div className="flex flex-wrap gap-2">
                  {companyTypes.map((t) => (
                    <button key={t} type="button" aria-pressed={f.type === t} onClick={() => setF({ ...f, type: t })} className={`h-11 rounded-lg border px-4 text-[15px] transition-colors ${f.type === t ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                {f.type === "Other" && <input value={f.typeOther} onChange={set("typeOther")} placeholder="Please Specify" aria-label="What kind of company you are" className={`${input} mt-3`} />}
              </div>
              <label className="block">
                <span className={fieldLabel}>Contact Person</span>
                <input value={f.contactName} onChange={set("contactName")} autoComplete="name" className={input} />
              </label>
            </>
          )}
          <label className="block">
            <span className={fieldLabel}>Company Email</span>
            <input value={f.email} onChange={set("email")} type="email" autoComplete="email" className={input} />
          </label>
          {mode === "up" && (
            <>
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block">
                  <span className={fieldLabel}>Phone</span>
                  <input value={f.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" className={input} />
                </label>
                <label className="block">
                  <span className={fieldLabel}>City</span>
                  <select value={f.city} onChange={set("city")} className={input}>
                    <option value="">Choose</option>
                    {cities.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className={fieldLabel}>Website, LinkedIn Or Linktree</span>
                <input value={f.website} onChange={set("website")} inputMode="url" placeholder="yourcompany.in" className={input} />
              </label>
            </>
          )}
          <button className={`${primaryButton} w-full`}>Send OTP</button>
        </form>
      ) : (
        <form
          className="mt-10 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (mode === "up") business.create({ ...f, email: f.email.trim().toLowerCase() });
            else business.signIn(f.email);
          }}
        >
          <label className="block">
            <span className={fieldLabel}>Enter The OTP</span>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" className={`${input} max-w-48 tracking-[0.3em]`} />
          </label>
          <p className="text-sm text-muted">Test mode: no email is sent. Any code works, or none.</p>
          <div className="flex flex-wrap gap-3 max-sm:*:flex-1">
            <button type="button" onClick={() => setStep("details")} className={secondaryButton}>
              Back
            </button>
            <button className={primaryButton}>{mode === "up" ? "Create Account" : "Sign In"}</button>
          </div>
        </form>
      )}
    </section>
  );
}

type Tab = "calendar" | "book" | "orders" | "company";
const tabs: { id: Tab; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "book", label: "Book Artists" },
  { id: "orders", label: "Orders" },
  { id: "company", label: "Company" },
];

// The calendar's three stages (and Cancelled, shown quietly), and an order's four-step track,
// both worked out from the admin's one pipeline, as on aod.co.in.
type BizStage = "inquired" | "assigned" | "done" | "cancelled";
const stageOf = (b: Booking): BizStage => (b.stage === "cancelled" ? "cancelled" : b.stage === "completed" ? "done" : b.stage !== "new" || b.assigned.length ? "assigned" : "inquired");
const stageText: Record<BizStage, string> = { inquired: "Inquired", assigned: "Artist Assigned", done: "Done", cancelled: "Cancelled" };
const stageDot: Record<BizStage, string> = { inquired: "bg-brand", assigned: "bg-ink", done: "bg-ink/30", cancelled: "bg-ink/15" };
const track = ["Inquiry", "Accepted", "Fulfilled", "Payment Received"];
function trackDone(b: Booking, db: Db) {
  if (b.stage === "cancelled") return 0;
  const paid = db.payments.filter((p) => p.booking === b.id && p.verified).reduce((n, p) => n + p.amount, 0);
  const fulfilled = b.stage === "completed";
  return fulfilled && b.quote && paid >= b.quote ? 4 : fulfilled ? 3 : b.stage === "advance" || b.stage === "confirmed" ? 2 : 1;
}

// The company's orders: its business requests from this browser (by its email), then labelled
// samples. The admin's changes to them show here too (src/lib/mock-db.ts).
function ordersOf(db: Db, c: Company) {
  const mine = db.bookings.filter((b) => b.source === "Test Booking" && b.id.includes("-B2B-") && (!c.email || !b.email || b.email.toLowerCase() === c.email.toLowerCase()));
  const samples = db.bookings.filter((b) => b.source === "Business");
  return [...mine.map((b) => ({ b, sample: false })), ...samples.map((b) => ({ b, sample: true }))];
}

function BusinessApp({ company }: { company: Company }) {
  const db = useDb();
  const [tab, setTab] = useState<Tab>("calendar");
  const [open, setOpen] = useState<string | null>(null);
  const orders = db ? ordersOf(db, company) : [];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-sm text-muted">AOD For Business</p>
          <h1 className="mt-3 text-4xl sm:text-6xl">
            <Dots>{`${company.name || "Your Company"}.`}</Dots>
          </h1>
        </div>
        <button type="button" onClick={() => business.signOut()} className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          Sign Out
        </button>
      </div>

      <div role="tablist" aria-label="Business portal" className="mt-10 flex gap-5 overflow-x-auto border-b border-line text-base sm:mt-12 sm:gap-6 sm:text-lg">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setOpen(null);
            }}
            className={`-mb-px shrink-0 border-b-2 pb-3 transition-colors ${tab === t.id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-12">
        {!db ? (
          <p className="text-muted">Loading…</p>
        ) : tab === "book" ? (
          <BookForm forceAudience="business" contact={{ name: company.contactName, phone: company.phone, email: company.email }} />
        ) : tab === "company" ? (
          <CompanyDetails key={company.email} company={company} />
        ) : open && orders.find((o) => o.b.id === open) ? (
          <OrderDetail
            db={db}
            order={orders.find((o) => o.b.id === open)!}
            onBack={() => setOpen(null)}
            onBookAgain={() => {
              setOpen(null);
              setTab("book");
            }}
          />
        ) : tab === "calendar" ? (
          <CompanyCalendar db={db} orders={orders} onOpen={setOpen} />
        ) : (
          <OrderList orders={orders} onOpen={setOpen} />
        )}
      </div>
      <p className="mt-16 text-xs text-muted">Test mode: sample data. Your account and orders stay in this browser.</p>
    </>
  );
}

type Order = { b: Booking; sample: boolean };

function CompanyCalendar({ db, orders, onOpen }: { db: Db; orders: Order[]; onOpen: (id: string) => void }) {
  const [month, setMonth] = useState(() => new Date(db.today.getFullYear(), db.today.getMonth(), 1));
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-5 text-sm text-muted">
          {(["inquired", "assigned", "done"] as BizStage[]).map((s) => (
            <span key={s} className="flex items-center gap-2">
              <i className={`h-2 w-2 rounded-full ${stageDot[s]}`} />
              {stageText[s]}
            </span>
          ))}
        </div>
        <MonthSwitch month={month} onChange={setMonth} />
      </div>
      {/* Phones: the month as a list of the days with orders. */}
      <div className="mt-6 sm:hidden">
        <MonthAgenda
          month={month}
          today={db.todayKey}
          empty="No orders this month."
          day={(k) =>
            orders
              .filter((o) => o.b.date === k)
              .map((o) => (
                <button key={o.b.id} type="button" onClick={() => onOpen(o.b.id)} className="block w-full text-left">
                  {o.b.needs}
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <i className={`h-1.5 w-1.5 rounded-full ${stageDot[stageOf(o.b)]}`} />
                    {stageText[stageOf(o.b)]} · {o.b.city}
                  </span>
                </button>
              ))
          }
        />
      </div>
      <div className="mt-6 hidden overflow-x-auto sm:block">
        <div className="min-w-[640px]">
          <MonthGrid
            month={month}
            cell={(k, d) => (
              <>
                <span className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs ${k === db.todayKey ? "bg-brand text-white" : "text-muted"}`}>{d}</span>
                <div className="mt-1 space-y-1">
                  {orders
                    .filter((o) => o.b.date === k)
                    .map((o) => (
                      <button key={o.b.id} type="button" onClick={() => onOpen(o.b.id)} className="flex w-full items-center gap-1.5 truncate rounded px-1 py-0.5 text-left text-xs hover:bg-wash">
                        <i className={`h-1.5 w-1.5 shrink-0 rounded-full ${stageDot[stageOf(o.b)]}`} />
                        <span className="truncate">{o.b.needs}</span>
                      </button>
                    ))}
                </div>
              </>
            )}
          />
        </div>
      </div>
    </>
  );
}

function OrderList({ orders, onOpen }: { orders: Order[]; onOpen: (id: string) => void }) {
  if (!orders.length) return <p className="text-lg text-muted">No orders yet.</p>;
  return (
    <ul className="border-t border-ink">
      {orders.map(({ b, sample }) => (
        <li key={b.id} className="border-b border-line">
          <button type="button" onClick={() => onOpen(b.id)} className="grid w-full gap-1 py-6 text-left transition-colors hover:bg-wash sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-8">
            <span>
              <span className="block text-2xl font-medium tracking-tight">{b.needs}</span>
              <span className="mt-1 block text-muted">
                {shortDate(b.date)} · {b.city} · {b.id}
                {sample && " · Sample"}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <i className={`h-2 w-2 rounded-full ${stageDot[stageOf(b)]}`} />
              {stageText[stageOf(b)]}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function OrderDetail({ db, order: { b, sample }, onBack, onBookAgain }: { db: Db; order: Order; onBack: () => void; onBookAgain: () => void }) {
  const done = trackDone(b, db);
  return (
    <>
      <button type="button" onClick={onBack} className={secondaryButton}>
        Back
      </button>
      <h2 className="mt-10 text-4xl sm:text-5xl">{b.needs}</h2>
      <p className="mt-3 text-muted">
        {b.id}
        {sample && " · Sample"}
      </p>
      <ol className="mt-10 grid grid-cols-4 gap-2">
        {track.map((t, i) => (
          <li key={t}>
            <i className={`block h-1 rounded-full ${i < done ? "bg-ink" : "bg-line"}`} />
            <span className={`mt-3 block text-sm ${i < done ? "text-ink" : "text-muted"}`}>{t}</span>
          </li>
        ))}
      </ol>
      <div className="mt-12">
        <EventRows b={b} />
      </div>
      <h3 className="mb-5 mt-12 text-2xl">Shortlisted For You</h3>
      <ArtistCards db={db} b={b} />
      <h3 className="mb-5 mt-12 text-2xl">Payments</h3>
      <Payments db={db} b={b} />
      {b.delivery && (
        <>
          <h3 className="mb-3 mt-12 text-2xl">Your Files</h3>
          <a href={b.delivery} target="_blank" rel="noopener noreferrer" className="break-all font-medium underline underline-offset-4">
            {b.delivery}
          </a>
        </>
      )}
      <h3 className="mb-5 mt-12 text-2xl">Timeline</h3>
      <Timeline b={b} />
      <div className="mt-12 flex flex-wrap gap-3 max-sm:*:flex-1">
        <button
          type="button"
          onClick={() => {
            bookAgain(b);
            onBookAgain();
          }}
          className={primaryButton}
        >
          Book Again
        </button>
      </div>
    </>
  );
}

function CompanyDetails({ company }: { company: Company }) {
  const [f, setF] = useState(company);
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Company) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setF({ ...f, [k]: e.target.value });
    setSaved(false);
  };
  return (
    <form
      className="max-w-xl space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        business.update(f);
        setSaved(true);
      }}
    >
      <label className="block">
        <span className={fieldLabel}>Company Name</span>
        <input value={f.name} onChange={set("name")} className={input} />
      </label>
      <label className="block">
        <span className={fieldLabel}>Company Email</span>
        <input value={f.email} readOnly className={`${input} bg-wash text-muted`} />
      </label>
      <label className="block">
        <span className={fieldLabel}>Contact Person</span>
        <input value={f.contactName} onChange={set("contactName")} className={input} />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={fieldLabel}>Phone</span>
          <input value={f.phone} onChange={set("phone")} inputMode="tel" className={input} />
        </label>
        <label className="block">
          <span className={fieldLabel}>City</span>
          <select value={f.city} onChange={set("city")} className={input}>
            <option value="">Choose</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block">
        <span className={fieldLabel}>Website, LinkedIn Or Linktree</span>
        <input value={f.website} onChange={set("website")} inputMode="url" className={input} />
      </label>
      <div className="flex items-center gap-4">
        <button className={primaryButton}>Save Changes</button>
        {saved && <span className="text-sm text-muted">Saved.</span>}
      </div>
    </form>
  );
}
