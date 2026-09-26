<div align="center">

# Fathom AI

**AI-powered meeting intelligence platform — automatic transcription, summaries, action items, and conversational call search.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-8E75B2?style=flat-square&logo=google)](https://aistudio.google.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Anthropic-D97706?style=flat-square&logo=anthropic)](https://claude.ai)
[![Antigravity](https://img.shields.io/badge/Antigravity-Google_DeepMind-4285F4?style=flat-square&logo=google)](https://deepmind.google/)

[Live Demo](https://fathom-clone-nine.vercel.app/) • [Overview](#overview) • [Key Features](#key-features) • [Tech Stack](#tech-stack) • [Quick Start](#getting-started)

</div>

---

## Overview

**Fathom AI** is a full-stack rebuild of [Fathom](https://fathom.video). It transforms raw meeting audio and video recordings into interactive transcripts, structured summaries, and trackable action items powered by Google's Gemini multimodal models.

Every piece of data is live and persisted — recordings are stored in Vercel Blob, analyzed by Gemini, and stored in MongoDB Atlas with zero mock data.

---

## Key Features

- **Media Processing:** Upload Zoom, Google Meet, or Teams recordings (video or audio up to 200 MB / 30 mins) with automatic frame extraction and native playback.
- **Interactive Call Intelligence:**
  - Synchronized video/audio player with smooth seeking and timestamp navigation.
  - Comprehensive AI summaries (key takeaways, chapter discussions, topics).
  - Searchable, speaker-attributed transcript with jump-to-time playback.
  - Interactive action items checklist with real-time database state persistence.
- **Ask Fathom (Conversational AI):**
  - Chat with a single recording or search across your entire meeting history.
  - Fact-grounded answers with clickable citations linked directly to transcript segments.
- **Playlists & Sharing:**
  - Organize related recordings into curated playlists.
  - Dedicated public share links for calls and playlists with full dark/light mode support.
- **Rich Exports:** One-click formatted export for Asana, Gmail, Google Docs, Todoist, and Microsoft Word.
- **Contact Inquiries:** Fully functional contact form with submissions saved directly to MongoDB.
- **Authentication & Security:** Secure session management with email/password (scrypt) and Google OAuth 2.0 PKCE sign-in.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Components, Route Handlers) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 (Full Light & Dark Theme) |
| **AI / LLM** | Google Gemini API (Multimodal video & audio processing) |
| **AI Tooling** | Claude Code & Google Antigravity |
| **Database** | MongoDB Atlas |
| **Media Storage** | Vercel Blob |
| **Auth** | Scrypt password hashing & Hand-rolled Google OAuth (PKCE) |


---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/AlishbaSaboor/Fathom---clone.git
cd Fathom---clone
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the required credentials:

| Variable | Description | Source |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Google Gemini API Key | [Google AI Studio](https://aistudio.google.com/apikey) |
| `MONGODB_URI` | MongoDB Atlas connection string | [MongoDB Atlas](https://www.mongodb.com/atlas) |
| `BLOB_READ_WRITE_TOKEN` | Read/write token for media uploads | [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |
| `SESSION_SECRET` | 32+ character random string for session encryption | Generated locally |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Quality Checks

```bash
npm run typecheck   # TypeScript validation
npm run lint        # ESLint code quality checks
```
