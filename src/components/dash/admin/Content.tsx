"use client";

import { useRef, useState } from "react";
import { act, ago, dayKey, shortDate, slugOf, useDb, type Post, type PostStatus } from "@/lib/mock-db";
import { Markdown } from "@/components/ui/Markdown";
import { Drawer, Head, Loading, Status, Tabs, Title, btn, btnMain, btnText, field, label, sub, td, th, useOpen } from "../ui";

// The blog and the newsletter, as on aod.co.in's admin. Blog: write a post in simple Markdown
// (with a toolbar and a preview), a cover photo, tags, the author and a publish date (a future
// date schedules it); published posts show on /blog. Newsletter: the subscribers (unsubscribe
// one; staff can't add anyone) and the issues (write one, send a test, send it to every confirmed
// subscriber). Test mode: nothing is emailed, and it all stays in this browser.

export function Blog() {
  const db = useDb();
  const o = useOpen();
  const [title, setTitle] = useState("");
  if (!db) return <Loading />;
  const open = db.posts.find((p) => p.id === o.value);
  return (
    <>
      <Title title="Blog" text="Posts on aod.co.in/blog." />
      <form
        className="mt-7 flex max-w-lg gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          act.addPost(title);
          setTitle("");
        }}
      >
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title Of A New Post" aria-label="New post title" className={field} />
        <button className={btn}>New Draft</button>
      </form>
      <table className="mt-7 w-full border-collapse">
        <thead>
          <tr>
            <th className={th}>Post</th>
            <th className={th}>Status</th>
            <th className={`${th} text-right`} />
          </tr>
        </thead>
        <tbody>
          {db.posts.map((p) => (
            <tr key={p.id} className="cursor-pointer hover:bg-wash" onClick={() => o.open(p.id)}>
              <td className={td}>
                <button type="button" className="text-left" onClick={() => o.open(p.id)}>
                  {p.title}
                </button>
                <small className={sub}>
                  {p.author}, {shortDate(p.date)}
                </small>
              </td>
              <td className={td}>
                <Status tone={p.status === "Published" ? "ink" : p.status === "Scheduled" ? "mid" : "dim"}>{p.status}</Status>
              </td>
              <td className={`${td} text-right`}>
                <span className="text-[13px] text-muted">Edit</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Drawer open={!!open} onClose={o.close} title={open?.title || "Post"} subtitle={open ? `/blog/${open.slug}` : undefined}>
        {open && <PostEditor key={open.id} post={open} onDone={o.close} />}
      </Drawer>
    </>
  );
}

// The cover photo, shrunk in the browser (it's kept in this browser in test mode).
function shrink(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = Math.min(1200, img.width);
      const h = Math.round((img.height * w) / img.width);
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/webp", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve("");
    img.src = URL.createObjectURL(file);
  });
}

function PostEditor({ post, onDone }: { post: Post; onDone: () => void }) {
  const [f, setF] = useState(post);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const box = useRef<HTMLTextAreaElement>(null);
  const set = (k: keyof Post) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value, ...(k === "title" && post.slug === slugOf(post.title) ? { slug: slugOf(e.target.value) } : {}) });
  // Wraps the selected text (or adds at the cursor) with Markdown.
  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = box.current;
    if (!el) return;
    const { selectionStart: a, selectionEnd: b, value } = el;
    const chosen = value.slice(a, b) || placeholder;
    setF({ ...f, body: value.slice(0, a) + before + chosen + after + value.slice(b) });
  };
  const save = (status: PostStatus) => {
    const finalStatus = status === "Published" && f.date > dayKey(new Date()) ? "Scheduled" : status;
    act.savePost(post.id, { ...f, slug: f.slug || slugOf(f.title), status: finalStatus });
    onDone();
  };
  return (
    <div className="space-y-5">
      <label className="block">
        <span className={label}>Title</span>
        <input value={f.title} onChange={set("title")} className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className={label}>Address</span>
          <input value={f.slug} onChange={(e) => setF({ ...f, slug: slugOf(e.target.value) })} className={field} />
        </label>
        <label className="block">
          <span className={label}>Publish Date</span>
          <input type="date" value={f.date} onChange={set("date")} className={field} />
        </label>
        <label className="block">
          <span className={label}>Author</span>
          <input value={f.author} onChange={set("author")} className={field} />
        </label>
        <label className="block">
          <span className={label}>Tags</span>
          <input value={f.tags} onChange={set("tags")} placeholder="Weddings, Photography" className={field} />
        </label>
      </div>
      <label className="block">
        <span className={label}>Summary</span>
        <textarea value={f.summary} onChange={set("summary")} rows={2} className={`${field} h-auto py-2`} />
      </label>
      <div>
        <span className={label}>Cover Photo</span>
        {f.cover && (
          // eslint-disable-next-line @next/next/no-img-element -- a local file or a data URL
          <img src={f.cover} alt="" className="mb-2 aspect-[16/9] w-full rounded-lg object-cover" />
        )}
        <div className="flex gap-2">
          <label className={`${btn} cursor-pointer`}>
            {f.cover ? "Change Photo" : "Add Photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={async (e) => e.target.files?.[0] && setF({ ...f, cover: await shrink(e.target.files[0]) })} />
          </label>
          {f.cover && (
            <button type="button" onClick={() => setF({ ...f, cover: undefined })} className={btnText}>
              Remove
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { id: "write", label: "Write" },
              { id: "preview", label: "Preview" },
            ]}
          />
          {tab === "write" && (
            <span className="flex gap-1">
              <button type="button" onClick={() => wrap("**")} className={`${btn} h-8 px-2.5`}>
                Bold
              </button>
              <button type="button" onClick={() => wrap("*")} className={`${btn} h-8 px-2.5`}>
                Italic
              </button>
              <button type="button" onClick={() => wrap("\n## ", "\n", "Heading")} className={`${btn} h-8 px-2.5`}>
                Heading
              </button>
              <button type="button" onClick={() => wrap("\n- ", "\n", "Point")} className={`${btn} h-8 px-2.5`}>
                List
              </button>
              <button type="button" onClick={() => wrap("[", "](https://)", "link text")} className={`${btn} h-8 px-2.5`}>
                Link
              </button>
            </span>
          )}
        </div>
        {tab === "write" ? (
          <textarea ref={box} value={f.body} onChange={set("body")} rows={12} aria-label="Post text in Markdown" className={`${field} h-auto py-2 font-mono text-[13px]`} />
        ) : (
          <div className="min-h-48 rounded-lg border border-line p-4">
            <Markdown text={f.body || "Nothing written yet."} />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-line pt-5">
        <button type="button" onClick={() => save("Draft")} className={btn}>
          Save Draft
        </button>
        <button type="button" onClick={() => save("Published")} className={btnMain}>
          {f.date > dayKey(new Date()) ? "Schedule" : "Publish"}
        </button>
        {post.status === "Published" && (
          <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className={btnText}>
            View On The Site
          </a>
        )}
      </div>
    </div>
  );
}

export function Newsletter() {
  const db = useDb();
  const [tab, setTab] = useState<"subscribers" | "issues">("subscribers");
  const [draft, setDraft] = useState({ subject: "", body: "" });
  const [note, setNote] = useState("");
  if (!db) return <Loading />;
  const confirmed = db.subscribers.filter((s) => s.status === "Confirmed").length;
  return (
    <>
      <Title title="Newsletter" text={`${confirmed} confirmed subscribers.`} />
      <div className="mt-7 border-t border-ink pt-4">
        <Tabs
          value={tab}
          onChange={setTab}
          options={[
            { id: "subscribers", label: "Subscribers", count: db.subscribers.length },
            { id: "issues", label: "Issues", count: db.issues.length },
          ]}
        />
      </div>
      {tab === "subscribers" ? (
        <table className="mt-5 w-full border-collapse">
          <thead>
            <tr>
              <th className={th}>Email</th>
              <th className={th}>Status</th>
              <th className={`${th} text-right`} />
            </tr>
          </thead>
          <tbody>
            {db.subscribers.map((s) => (
              <tr key={s.email} className="hover:bg-wash">
                <td className={td}>
                  {s.email}
                  <small className={sub}>Since {shortDate(s.since)}</small>
                </td>
                <td className={td}>
                  <Status tone={s.status === "Confirmed" ? "ink" : "dim"}>{s.status}</Status>
                </td>
                <td className={`${td} text-right`}>
                  <button type="button" onClick={() => act.unsubscribe(s.email)} className={btn}>
                    Unsubscribe
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <section>
            <Head title="New Issue" />
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                act.sendIssue(draft.subject.trim(), draft.body);
                setDraft({ subject: "", body: "" });
                setNote(`Sent to ${confirmed} subscribers (test mode: no email went out).`);
              }}
            >
              <input value={draft.subject} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="Subject" aria-label="Subject" className={field} />
              <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={8} placeholder="Write in simple Markdown, or add a blog post below." aria-label="Issue text" className={`${field} h-auto py-2`} />
              <div className="flex flex-wrap gap-2">
                {db.posts
                  .filter((p) => p.status === "Published")
                  .slice(0, 3)
                  .map((p) => (
                    <button key={p.id} type="button" onClick={() => setDraft({ ...draft, body: `${draft.body}\n\n## ${p.title}\n\n${p.summary}\n\n[Read it on the blog](/blog/${p.slug})`.trim() })} className={`${btn} h-8`}>
                      Add: {p.title.slice(0, 28)}…
                    </button>
                  ))}
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" onClick={() => setNote("Test sent to aditi@example.com (test mode: no email went out).")} className={btn}>
                  Send Me A Test
                </button>
                <button className={btnMain}>Send To {confirmed} Subscribers</button>
              </div>
              {note && <p className="text-[13px] text-muted">{note}</p>}
            </form>
          </section>
          <section>
            <Head title="Sent" />
            <ul className="border-b border-line">
              {db.issues.map((i) => (
                <li key={i.id} className="border-t border-line py-3">
                  {i.subject}
                  <small className={sub}>{i.sentAt ? `Sent ${ago(i.sentAt)} to ${i.count}` : "Draft"}</small>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}

