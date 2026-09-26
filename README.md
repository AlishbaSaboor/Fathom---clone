# Fathom Clone

A rebuild of [Fathom](https://fathom.video), an AI meeting notetaker that turns recordings into transcripts, summaries and action items. Built for the 8x Software Engineer assignment.

**Live:** https://fathom-clone-nine.vercel.app/

Everything in the app is real, stored data: there are no seeded or hardcoded meetings. A recording you upload is stored in Vercel Blob, analyzed by Gemini, and saved to MongoDB Atlas.

## What it does

- **Upload a recording** (audio or video, up to 200 MB and 30 minutes). It is stored, transcribed and summarized, and shows up in My Calls.
- **My Calls**: your recordings, with search by title or attendee, and a delete action that removes the file, the data and the share link.
- **Call page**: real playback of the stored recording (video or audio, with seeking), an AI summary, a searchable transcript that plays from any timestamp, and action items whose checkboxes are saved.
- **Share links**: every recording gets a link that works for anyone, logged in or not, and shows the full result with real video/audio playback. It stops working when you delete the recording.
- **Ask Fathom**, per call and across all your calls, answered by Gemini from the real transcript or summaries, with clickable citations.
- **Copy for** Asana, Gmail, Google Docs, Todoist and Microsoft Word: formats action items for each.

## How it works

Upload flow (one browser upload, then everything else happens on the server):

1. **Register**: the server checks the file's type, size, length and the storage limits, creates an `uploading` meeting in MongoDB and picks the file's Blob pathname.
2. **Upload**: the browser sends the file straight to Vercel Blob with a short-lived token that is only valid for that pathname, type and size (a function request can't carry more than 4.5 MB).
3. **Import**: the server confirms the file is in Blob, then streams it from Blob to the Gemini Files API.
4. **Prepare**: the browser waits for Gemini to finish preparing the file.
5. **Process**: one Gemini call returns the transcript, title, speakers, summary and action items. The server saves them to MongoDB and the meeting becomes `ready`.

Retrying after a failure never repeats finished steps: a file already in Blob is not uploaded again, and one Gemini already has is not copied again.

Data (MongoDB Atlas): `meetings` (attendees, summary, share token, and the Blob URL of the recording, never the file itself), `transcripts` (one per meeting, kept apart because it is the largest part), `actionItems` (one per item, so a checkbox saves on its own), `users` (email + scrypt password hash and/or a linked Google account) and `sessions` (one per signed-in session, so logout revokes it server-side rather than just clearing a cookie). Recordings live only in Vercel Blob.

Accounts: email/password (hashed with `node:crypto`'s scrypt, no external dependency) and Google sign-in (a hand-rolled OAuth 2.0 Authorization Code flow with PKCE, verifying the id_token against Google's published keys). My Calls, Upload and a meeting's own page all require a signed-in session — see `src/lib/server/auth.ts`. A recording uploaded before signing in (under the old anonymous-cookie model) is claimed by the account on its first login.

Limits, chosen from measurements of Gemini's behavior: 200 MB and 30 minutes per recording (longer audio gets an incomplete transcript in one call, so it is refused up front). Blob's free tier holds 1 GB and locks the store for 30 days if exceeded, so the app stops accepting uploads at 800 MB in total and 400 MB per visitor, and removes uploads that never finished after 24 hours.

## Out of scope

- **Live meeting capture** (a bot joining Zoom/Meet/Teams): explicitly allowed to be stubbed per the assignment brief.
- **A browser extension**: the product being rebuilt is the web app.
- **Team and paid features** (Team Calls, Playlists, Alerts, Deals).

## Stack

Next.js (App Router), TypeScript, Tailwind CSS, Gemini API, MongoDB Atlas, Vercel Blob, deployed on Vercel.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

`.env.local` is git-ignored: never commit real values, and never paste them into a chat or prompt.

| Variable | Where it comes from |
| --- | --- |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `MONGODB_URI` | MongoDB Atlas (free M0 cluster). Create a database user with `readWrite` on a single database (not an admin user), allow network access from `0.0.0.0/0` (Vercel has no fixed IPs), and use the `mongodb+srv://` connection string with the database name in it. |
| `BLOB_READ_WRITE_TOKEN` | Vercel: Storage, create a **Public** Blob store, connect it to the project, then `vercel env pull .env.local`. |

Optional: `MONGODB_DB` (if the connection string names no database) and `GEMINI_MODEL` (one model id or a comma-separated fallback list). The same variables go in the Vercel project's environment variables for the deployed app.

Useful checks: `npm run typecheck` and `npm run lint`.
