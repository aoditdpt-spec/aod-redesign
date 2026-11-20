// Order IDs, the same as aod.co.in's (the two sites share one database and one count):
// AOD-<category code>-<YYMM><number>, such as AOD-PH-261113 (Photography & Film, November 2026, the
// year's 113th order). The number counts every order of the year whatever its category and starts
// again at 01 each January; the year and month are India time. More than one category is AOD-MIX-….
// The codes reuse the live site's: Photography & Film takes Photographers' PH, and so on. No imports.

export const categoryCodes: Record<string, string> = {
  "photo-video": "PH",
  "models-creators": "MO",
  "anchors-hosts": "AH",
  "musicians-djs": "DJ",
  comedians: "CO",
  "makeup-styling": "MU",
};
export const MIX = "MIX";
export const B2B = "B2B";

const ORDER_ID = /^AOD-([A-Z][A-Z0-9]{1,2})-(\d{2})(\d{2})(\d{2,})$/;

export function codeFor(category: string) {
  return categoryCodes[category] ?? category.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase().padEnd(2, "X");
}

// The parts of an order or line ID; null for anything else (the live site's older B-1215 …). The
// live site's earliest IDs put the month first (AOD-PH-102601); a month is 01 to 12 and a year 13
// or more, so both read correctly.
export function parseOrderId(id: string) {
  const m = ORDER_ID.exec(id.trim().toUpperCase());
  if (!m) return null;
  const legacy = Number(m[2]) >= 1 && Number(m[2]) <= 12;
  const [year, month] = legacy ? [m[3], m[2]] : [m[2], m[3]];
  return { code: m[1], month, year, number: Number(m[4]), stamp: `${m[2]}${m[3]}${m[4]}` };
}

// Month and year (two digits each) of `now` in India.
export function monthYear(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", month: "2-digit", year: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return { month: part("month"), year: part("year") };
}

// The next free number this year, given the IDs already taken.
export function nextOrderNumber(ids: Iterable<string>, now = new Date()) {
  const { year } = monthYear(now);
  let max = 0;
  for (const id of ids) {
    const p = parseOrderId(id);
    if (p && p.year === year && p.number > max) max = p.number;
  }
  return max + 1;
}

// The ID for an order of these categories (slugs) with number `n`. A business account's order is
// AOD-B2B-… whatever it holds.
export function orderId(categories: string[], n: number, now = new Date(), business = false) {
  const kinds = [...new Set(categories)];
  const { month, year } = monthYear(now);
  const code = business ? B2B : kinds.length === 1 ? codeFor(kinds[0]) : MIX;
  return `AOD-${code}-${year}${month}${String(n).padStart(2, "0")}`;
}

// One line's ID: the order's number with that line's category code. An older order (B-1215) has
// no line IDs, so its lines show the order's own ID.
export function lineId(order: string, category: string) {
  const p = parseOrderId(order);
  return p ? `AOD-${codeFor(category)}-${p.stamp}` : order;
}
