# Fathom Clone

A 1-day rebuild of [fathom.video](https://fathom.video), the AI meeting notetaker, built for the 8x Software Engineer assignment.

## What's built

- **Real upload feature**: upload a recording and get a genuine transcript, summary, key takeaways, and action items from the Gemini API, with real playback
- **Copy for Asana, Gmail, Google Docs, Todoist, Microsoft Word**: formats action items for each destination
- **Real Ask Fathom chatbot**, per-meeting and account-wide, answers questions using actual call data, with clickable source citations
- Meeting list with search, seeded with realistic demo meetings (including an 8-person, hour-long call)
- Meeting detail page: video, AI summary with switchable templates, transcript with search and highlights, action items
- Public share links for the seeded demo meetings

## What's intentionally not built

- **Live meeting capture** (a bot joining Zoom/Meet/Teams): explicitly allowed to stub per the assignment brief. Seeded meetings use realistic mock data instead.
- **A database**: uploaded recordings and their results are stored in the browser (localStorage/IndexedDB), not shared or synced across devices, this is why uploaded recordings have no share link, unlike the seeded demo meetings.
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
GEMINI_API_KEY=your-gemini-api-key-here


Then run:

```bash
npm run dev
```