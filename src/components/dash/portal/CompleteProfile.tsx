"use client";

import { useState } from "react";
import { categories } from "@/data/site";
import { workQuestions, type WorkQuestion } from "@/data/work-questions";
import { act, catName, type AppDetails, type Application } from "@/lib/mock-db";
import { checkDriveLink } from "@/lib/portfolio-links";
import { TestNote, btn, btnInk, btnMain, field, label } from "../ui";

// Complete Your Profile: everything the 2-step sign-up didn't ask, in the artist portal's Profile
// page (as on aod.co.in's application, now after joining): a photo (chosen or taken), date of
// birth, area, languages, other categories, each category's own work questions, about your work
// and the declaration. Saving keeps it; Submit For Review sends it to the team.

const languages = ["Gujarati", "Hindi", "English", "Marathi", "Punjabi", "Urdu"];

// The photo, shrunk in the browser so it fits in this browser's storage.
function shrink(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const size = 240;
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const s = Math.min(img.width, img.height);
      c.getContext("2d")!.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
      resolve(c.toDataURL("image/webp", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve("");
    img.src = URL.createObjectURL(file);
  });
}

export function completeness(app: Application) {
  const d = app.details ?? {};
  const checks = [!!d.photo, !!d.dob, !!d.area, !!d.languages?.length, !!d.about, !!d.agree, Object.keys(d.work ?? {}).length > 0];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function CompleteProfile({ app }: { app: Application }) {
  const [d, setD] = useState<AppDetails>(app.details ?? {});
  const [saved, setSaved] = useState(false);
  const work = d.work ?? {};
  const sections = [app.cat, ...(d.other ?? [])].filter(Boolean).map((slug) => ({ slug, name: catName(slug), questions: workQuestions[slug] ?? [] }));
  const update = (patch: AppDetails) => {
    setD({ ...d, ...patch });
    setSaved(false);
  };
  const toggle = (k: "languages" | "other", v: string) => update({ [k]: (d[k] ?? []).includes(v) ? (d[k] ?? []).filter((x) => x !== v) : [...(d[k] ?? []), v] });
  const answer = (key: string, q: WorkQuestion, v: string) => {
    if (q.kind !== "many") return update({ work: { ...work, [key]: v } });
    const now = (work[key] as string[] | undefined) ?? [];
    update({ work: { ...work, [key]: now.includes(v) ? now.filter((x) => x !== v) : [...now, v] } });
  };
  const pct = completeness({ ...app, details: d });

  return (
    <>
      <div className="border-b border-line pb-7">
        <h1 className="text-[34px]">Complete Your Profile</h1>
        <p className="mt-2 text-muted">{pct}% complete. The team reviews it once you submit.</p>
        <div className="mt-4 h-1 max-w-sm rounded-full bg-line">
          <i className="block h-full rounded-full bg-ink" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <dl className="mt-8 grid max-w-2xl gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
        {(
          [
            ["Name", app.name],
            ["Email", app.email],
            ["Phone", app.phone],
            ["Location", app.city],
            ["Category", [catName(app.cat), app.craft].filter((x, i, a) => x && a.indexOf(x) === i).join(": ")],
            ["Experience", app.experience ?? ""],
            ["Instagram", app.instagram ? `instagram.com/${app.instagram}` : ""],
            ["Portfolio", app.link ?? ""],
          ] as [string, string][]
        ).map(([k, v]) => (
          <div key={k} className="border-t border-line pt-2">
            <dt className="text-muted">{k}</dt>
            <dd className="break-words">{v || "—"}</dd>
          </div>
        ))}
      </dl>

      <form
        className="mt-10 max-w-2xl space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          act.saveAppDetails(app.id, d, app.name);
          setSaved(true);
        }}
      >
        <div>
          <span className={label}>Profile Photo</span>
          <div className="flex items-center gap-4">
            <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-wash text-xs text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local photo the artist just picked */}
              {d.photo ? <img src={d.photo} alt="" className="h-full w-full object-cover" /> : "Photo"}
            </span>
            <div className="flex flex-wrap gap-2">
              <label className={`${btn} cursor-pointer`}>
                Choose From Gallery
                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => e.target.files?.[0] && update({ photo: await shrink(e.target.files[0]) })} />
              </label>
              <label className={`${btn} cursor-pointer`}>
                Take A Photo
                <input type="file" accept="image/*" capture="user" className="sr-only" onChange={async (e) => e.target.files?.[0] && update({ photo: await shrink(e.target.files[0]) })} />
              </label>
            </div>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className={label}>Date Of Birth</span>
            <input type="date" value={d.dob ?? ""} onChange={(e) => update({ dob: e.target.value })} className={field} />
          </label>
          <label>
            <span className={label}>Area Of Your City</span>
            <input value={d.area ?? ""} onChange={(e) => update({ area: e.target.value })} placeholder="Navrangpura" className={field} />
          </label>
        </div>
        <div>
          <span className={label}>Languages</span>
          <div className="flex flex-wrap gap-2">
            {languages.map((x) => (
              <button key={x} type="button" aria-pressed={(d.languages ?? []).includes(x)} onClick={() => toggle("languages", x)} className={(d.languages ?? []).includes(x) ? btnInk : btn}>
                {x}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span className={label}>Do You Also Work In (Optional)</span>
          <div className="flex flex-wrap gap-2">
            {categories
              .filter((c) => c.slug !== app.cat)
              .map((c) => (
                <button key={c.slug} type="button" aria-pressed={(d.other ?? []).includes(c.slug)} onClick={() => toggle("other", c.slug)} className={(d.other ?? []).includes(c.slug) ? btnInk : btn}>
                  {c.name}
                </button>
              ))}
          </div>
        </div>

        {sections.map((sec) => (
          <section key={sec.slug} className="space-y-6 border-t border-line pt-6">
            <h2 className="text-2xl">Your Work: {sec.name}</h2>
            {sec.questions.map((q) => {
              const key = `${sec.slug}.${q.id}`;
              const v = work[key];
              if (q.id === "brandWorkDetails" && work[`${sec.slug}.brandWork`] !== "Yes") return null;
              const drive = q.kind === "link" && typeof v === "string" && v.trim() ? checkDriveLink(v) : null;
              return (
                <div key={key}>
                  <span className={label}>{q.label}</span>
                  {q.kind === "one" || q.kind === "many" ? (
                    <div className="flex flex-wrap gap-2">
                      {q.options!.map((o) => {
                        const on = q.kind === "many" ? ((v as string[] | undefined) ?? []).includes(o) : v === o;
                        return (
                          <button key={o} type="button" aria-pressed={on} onClick={() => answer(key, q, o)} className={on ? btnInk : btn}>
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  ) : q.kind === "long" ? (
                    <textarea value={(v as string) ?? ""} onChange={(e) => update({ work: { ...work, [key]: e.target.value } })} rows={3} className={`${field} h-auto py-2`} />
                  ) : (
                    <input value={(v as string) ?? ""} onChange={(e) => update({ work: { ...work, [key]: e.target.value } })} placeholder={q.kind === "link" ? "drive.google.com/…" : undefined} className={field} />
                  )}
                  {q.hint && <span className="mt-1.5 block text-[13px] text-muted">{q.hint}</span>}
                  {drive && <span className={`mt-1.5 block text-[13px] ${drive.ok ? "text-muted" : "text-red-600"}`}>{drive.ok ? (drive.warning ?? "Looks good.") : drive.message}</span>}
                </div>
              );
            })}
          </section>
        ))}

        <label className="block border-t border-line pt-6">
          <span className={label}>About Your Work (Optional)</span>
          <textarea value={d.about ?? ""} onChange={(e) => update({ about: e.target.value })} rows={4} className={`${field} h-auto py-2`} />
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line p-4 has-[:checked]:border-ink">
          <input type="checkbox" checked={!!d.agree} onChange={(e) => update({ agree: e.target.checked })} className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]" />
          <span>I confirm the details and work I&apos;ve shared are my own and true, and I agree to AOD&apos;s terms for artists.</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <button className={btnInk}>Save</button>
          <button
            type="button"
            onClick={() => {
              act.saveAppDetails(app.id, d, app.name);
              act.submitForReview(app.id, app.name);
              setSaved(true);
            }}
            className={btnMain}
          >
            {app.submittedAt ? "Send Update To AOD" : "Submit For Review"}
          </button>
          {saved && <span className="text-sm text-muted">Saved.</span>}
        </div>
      </form>
      <TestNote className="mt-14" />
    </>
  );
}
