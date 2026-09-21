# Fathom Clone

A 1-day rebuild of [fathom.video](https://fathom.video), the AI meeting notetaker, built for the 8x Software Engineer assignment.

**Live**: https://fathom-clone-nine.vercel.app/

## What's built

- **Real upload feature**: upload a recording and get a genuine transcript, summary, key takeaways, and action items from the Gemini API, with real playback
- **Copy for Asana, Gmail, Google Docs, Todoist, Microsoft Word**: formats action items for each destination
- **Real Ask Fathom chatbot**, per-meeting and account-wide, answers questions using actual call data, with clickable source citations
- Meeting list with search, seeded with realistic demo meetings (including an 8-person, hour-long call)
- Meeting detail page: video, AI summary with switchable templates, transcript with search and highlights, action items
- Public share links for the seeded demo meetings, and for uploads: each processed upload gets a link to its transcript and summary (see below)

## Upload limits

Recordings can be up to **200 MB** and **30 minutes** long, in WAV, MP3, M4A, AAC, OGG, FLAC, MP4, MOV, or WebM. The 30-minute cap is deliberate: in testing, Gemini transcribed a 62-minute recording in one pass but stopped partway through at about 30 minutes, so longer files are refused up front rather than silently truncated.

## Share links for uploads

When an upload finishes processing, its **transcript, summary, action items, title and attendees** are saved to Vercel KV (Upstash Redis) under a random 128-bit token, and the owner gets a link: `/share/upload/<token>`.

- **The recording itself is never stored server-side.** It stays in the uploader's browser (IndexedDB), so the shared page is read-only and has no player. It says "Recording not available in this preview, only the transcript and summary."
- **Anyone with the link can read it.** There is no login, like the demo share links. Tokens are unguessable, the page is `noindex`, and attendee emails are stripped.
- **Entries expire after 30 days** and there is deliberately no way to revoke one earlier. Deleting an upload in the app removes the local copy only.
- **Optional.** If no store is configured, uploads still work exactly as before, just without a share link.

## What's intentionally not built

- **Live meeting capture** (a bot joining Zoom/Meet/Teams): explicitly allowed to stub per the assignment brief. Seeded meetings use realistic mock data instead.
- **A relational database**: the recording file and your library of uploads live in the browser (localStorage/IndexedDB), so they are not synced across devices. The one server-side store is a key-value copy of each upload's *processed result* (see "Share links for uploads").
- **Authentication**: no login system. The app is fully open by design, matching the requirement that the live link works for anyone, signed in or not.
- **Browser extension**: not part of the assignment's scope; the product being rebuilt is the web app.
- **Team/paid features** (Team Calls, Playlists, Alerts, Deals): shown as real nav tabs matching Fathom's UI, but each is an honest "not part of this build" stub rather than faked functionality.

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Gemini API, deployed on Vercel.

## Setup

```bash
npm install
```

Create a `.env.local` file in the project root:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

To enable share links for uploads, also connect a Vercel KV (Upstash Redis) store. Vercel adds these two variables automatically when the store is connected to the project; add them to `.env.local` to try it locally:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Then run:

```bash
npm run dev
```