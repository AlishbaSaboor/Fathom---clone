# Fathom Clone

A 1-day rebuild of [Fathom](https://fathom.video), an AI meeting notetaker that records calls and turns them into transcripts, summaries, and action items. Built for the 8x Software Engineer assignment.

**Live:** https://fathom-clone-nine.vercel.app/

## In scope

- Meeting list with search, seeded with realistic demo meetings (including an 8-person, hour-long call)
- Meeting detail page: video, AI summary with switchable templates, transcript with search and highlights, action items
- **Real upload feature**: upload a recording (up to 200MB / 30 min) and get a genuine transcript, summary, and action items from the Gemini API, with real playback
- **Share links for uploads**: each processed upload gets a shareable link. The transcript/summary/action items are saved server-side (Vercel KV); the recording itself stays in your browser, so the shared page has no player, transcript and summary only
- **Real Ask Fathom chatbot**, per-meeting and account-wide, answers from actual call data with clickable citations
- "Copy for" Asana, Gmail, Google Docs, Todoist, Microsoft Word: formats action items for each
- Public share links for the demo meetings

## Out of scope

- **Live meeting capture** (a bot joining Zoom/Meet/Teams): explicitly allowed to stub per the assignment brief
- **A full database**: only uploaded results are stored server-side (see above); everything else lives in the browser, so it isn't synced across devices
- **Authentication**: no login, the app is fully open by design
- **A browser extension**: the product being rebuilt is the web app
- **Team/paid features** (Team Calls, Playlists, Alerts, Deals): shown as real nav tabs matching Fathom's UI, each is an honest "not part of this build" stub

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Gemini API, Vercel KV, deployed on Vercel.

## Setup

```bash
npm install
```

Create `.env.local`:

```bash
GEMINI_API_KEY=your-gemini-api-key-here
```

Optional, for upload share links, connect a Vercel KV (Upstash Redis) store and add:

```bash
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

Then run:

```bash
npm run dev
```