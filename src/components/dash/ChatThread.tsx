"use client";

import { useEffect, useRef, useState } from "react";
import { act, ago, useDb } from "@/lib/mock-db";
import { btnMain, field } from "./ui";

// One artist's conversation with the team, shared by the admin (Chat With Artists) and the
// portal (Messages). In the portal every team member shows as "AOD Team". A box of its own height
// (on request, 2026-11-21: the whole page used to scroll with the chat): only the messages scroll
// inside it, starting at the newest, and the message box stays at its bottom, as in a chat app.
export function ChatThread({ artist, side, className = "h-[min(640px,calc(100dvh-17rem))] min-h-[380px]" }: { artist: string; side: "team" | "artist"; className?: string }) {
  const db = useDb()!;
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const list = db.messages.filter((m) => m.artist === artist);
  const name = db.artists.find((a) => a.id === artist)?.name ?? "";
  const unread = side === "team" ? list.some((m) => m.from === "artist" && m.at > (db.teamRead[artist] ?? "")) : list.some((m) => m.from === "team" && m.at > db.artistRead);

  // Opening the conversation marks it read.
  useEffect(() => {
    if (!unread) return;
    if (side === "team") act.readByTeam(artist);
    else act.readByArtist();
  }, [unread, side, artist]);

  // The newest message in view, by scrolling the box itself (never the page).
  useEffect(() => {
    const box = scroller.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [list.length, artist]);

  return (
    <div className={`flex flex-col overflow-hidden rounded-2xl border border-line ${className}`}>
      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto overscroll-contain p-4 sm:p-5">
        {list.length ? (
          list.map((m) => {
            const mine = m.from === side;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : ""}`}>
                <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 ${mine ? "bg-ink text-paper" : "bg-wash"}`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <small className={`mt-1 block text-xs ${mine ? "text-paper/60" : "text-muted"}`}>
                    {m.from === "artist" ? name : side === "team" ? m.by : "AOD Team"}, {ago(m.at)}
                  </small>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-muted">No messages yet.</p>
        )}
      </div>
      <form
        className="flex shrink-0 gap-2 border-t border-line bg-paper p-3"
        onSubmit={(e) => {
          e.preventDefault();
          act.send(artist, side, text);
          setText("");
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write A Message" aria-label="Message" className={field} />
        <button className={btnMain}>Send</button>
      </form>
    </div>
  );
}
