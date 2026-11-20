# What's Still Different From aod.co.in

The redesign (`aod-redesign`) compared with the main site (`aod`), updated 19 November 2026. Every frontend flow from the main site is now in the redesign, working on test data kept in the browser. What's left needs the backend, was left out on purpose, or was removed on request.

## Needs the backend (switch `backendEnabled` on in `src/lib/backend.ts`)

- **Saving to the database:** bookings, applications, disputes, reviews, company accounts, the admin's changes, the blog and the newsletter are all kept in the browser (`localStorage`), so other people and devices don't see them.
- **Real email codes (OTP):** for booking, My Bookings, the business portal, the artist portal and the admin. Any code works for now.
- **Emails, the Google Sheet and retries:** team and customer emails, the "All orders" sheet rows and the outbox.
- **Live updates** between people and devices, and the admin's "Saving…" state.
- **Uploads to storage:** artists' portfolio photos (they stay in the open tab) and blog covers (kept in the browser).
- **Push notifications** for chat messages.
- **Google Maps suggestions** for the venue: add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (see `.env.example`).

## Required fields and checks

Test mode lets every field be empty, so nothing is required yet. When the backend is switched on, the main site's rules apply again:

- every booking field
- the company link and "Other" company type on AOD For Business
- both an Instagram and a portfolio link for some artist categories

The link checks already show as notes while typing.

## Left out on purpose or removed on request

- **City picker in the navbar:** replaced by the exact venue in the booking.
- **"Request A Quote" on services:** services were removed from category pages.
- **WhatsApp buttons and the floating WhatsApp button:** contact stays in the navbar, bottom bar and footer.
- **Homepage sections from the main site:** stats, brand strip, hero video, category carousel and Get Matched.
- **The "Get The AOD App" install popup:** a popup on every phone visit didn't fit the clean design; it can be added if wanted.
- **Separate addresses:** the redesign uses /admin, /artists/… and /dispute-desk on the same domain. artists., admin. and resolve.aod.co.in are a hosting setting, done when this moves to the main project.
- **Newsletter sign-up:** removed on the main site too. Confirm and unsubscribe pages aren't needed until it's back.
