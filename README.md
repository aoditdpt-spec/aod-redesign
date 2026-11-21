# aod-redesign

The design workspace for aod.co.in's new look (clean black and white, AOD orange for the main action, Instrument Sans). It runs on **mock data only**: everything is kept in the browser, nothing is emailed or saved, every field may be left empty and any code works, so each screen can be clicked straight through.

On 21 Nov 2026 this design (up to commit 333c77f) became the live site: it was moved into the `aod` repo (aod.co.in) and connected there to the real backend. Changes made here don't reach aod.co.in by themselves; they have to be carried over to `aod`.

```bash
npm install
npm run dev     # http://localhost:3000 (admin: /admin, artist portal: /artists/dashboard, Dispute Desk: /dispute-desk)
npm run build
npm run check:search
```

What's where: pages in `src/app` (`(site)` the customer site, `(portal)` the artist portal, `(desk)` the Dispute Desk, `admin`), copy and data in `src/data`, the sample "database" in `src/lib/mock-db.ts`. `WHATS-LEFT.md` lists how it differed from aod.co.in before the move. The guides for the live site are in the private `guides` folder next to this one.
