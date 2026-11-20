"use client";

import { useEffect, useRef, useState } from "react";
import { act, ago, useDb } from "@/lib/mock-db";
import { btnMain, field } from "./ui";

// One artist's conversation with the team, shared by the admin (Chat With Artists) and the
// portal (Messages). In the portal every team member shows as "AOD Team".
export function ChatThread({ artist, side }: { artist: string; side: "team" | "artist" }) {
  const db = useDb()!;
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const list = db.messages.filter((m) => m.artist === artist);
  const name = db.artists.find((a) => a.id === artist)?.name ?? "";
  const unread = side === "team" ? list.some((m) => m.from === "artist" && m.at > (db.teamRead[artist] ?? "")) : list.some((m) => m.from === "team" && m.at > db.artistRead);

  // Opening the conversation marks it read.
  useEffect(() => {
    if (!unread) return;
    if (side === "team") act.readByTeam(artist);
    else act.readByArtist();
  }, [unread, side, artist]);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [list.length]);

  return (
    <div className="flex min-h-[420px] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto py-2">
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
        <div ref={end} />
      </div>
      <form
        className="mt-4 flex gap-2 border-t border-line pt-4"
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
