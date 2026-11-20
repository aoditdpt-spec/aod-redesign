// Whether the real backend (Supabase, the same project as aod.co.in) is used.
//
// Switched off for now (2026-11-18, on request): the redesign runs on mock data only, so nothing is
// emailed or saved, every field may be left empty and any code passes (the booking form skips its
// checks while this is off). The save and sign-in code stays ready in src/server/; to go live, put
// this back to the keys check:
//   Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
export const backendEnabled = false as boolean;
