# 🎵 K-Clip — Project Constitution

## 1. Purpose

This project is a web-based daily puzzle game inspired by Wordle.

Users listen to progressively longer snippets of a song and attempt to guess the correct track within a limited number of attempts.

The goal is to create a simple, fast, and engaging daily experience that is easy to share among friends.

---

## 2. Core Game Rules

* Each day, there is **one song (shared across all users)**.

* Users have **6 total guesses**.

* The song is revealed in increasing clip durations:

  1. 1 second
  2. 2 seconds
  3. 5 seconds
  4. 10 seconds
  5. 20 seconds
  6. 30 seconds

* After each incorrect guess:

  * The next (longer) clip becomes available.

* Users can **replay the currently unlocked clip freely**.

* The game ends when:

  * The user guesses correctly, OR
  * The user uses all 6 guesses.

* A **‹ / ›** navigation in the header allows users to browse and play any **past puzzle** (archive mode).

  * The active day is tracked via a `selectedDay` state in `App.tsx`, defaulting to today.
  * A `?day=N` query string parameter sets the initial day on load.
  * Archive puzzles are fully playable with independent persisted state.
  * Tab-focus date reload only fires when viewing today's puzzle.

---

## 3. Game Outcome & Sharing

After the game ends:

* Display:

  * Win or loss state
  * Number of guesses used
* On a correct guess, a **confetti burst** fires once via `canvas-confetti` (triggered by the `justWon` flag from `useGameState`).
* Provide a **"Share Result"** button:

  * Generates a text-based summary (Wordle-style)
  * Copies it to clipboard

### Share Output Format

```text
🎵 K-Clip #12
🟩🟥🟥⬜⬜⬜
Guessed in 1/6

alextomkins.github.io/K-Clip/ 🎵
```

* Emoji key: 🟩 correct, 🟧 partial (right artist), 🟥 incorrect or skipped, ⬜ unused
* Score shows `X/6` on a loss

---

## 4. Technical Architecture

### Frontend

* Framework: React 19 (TypeScript 5)
* Build tool: Vite
* Styling: Tailwind CSS 3
* Linting: ESLint 9 (flat config) with typescript-eslint and eslint-plugin-react-hooks
* Hosting: GitHub Pages (base path `/K-Clip/`)
* Deployment: `gh-pages` package (`npm run deploy`)
* App type: Fully static frontend (no backend)

### Audio Handling (Current)

* Audio files are stored in `public/audio/` in the repository
* Each song has a **single 30-second MP3 file**
* Clips are generated client-side by controlling playback timing
* File naming convention: `{artist-slug}-{song-slug}.mp3` (e.g. `aespa-black-mamba.mp3`)
* Playback volume is set to **0.7** by default via the `volume` prop on `useAudioPlayer`

### UI Features

* **How to Play modal** — an ℹ️ button in the header opens a `HowToPlay` overlay explaining the rules and colour legend. Close via ✕ button or backdrop click.
* **Stats modal** — a 📊 button in the header opens a `StatsModal` overlay showing Played, Win %, Current Streak, Max Streak, and a guess distribution bar chart. Only today’s puzzle results count toward stats. Close via ✕ button or backdrop click.
* **Footer** — displayed below the guess history:
  * `Next song in hh:mm:ss` — live countdown to 00:00 AEST, driven by the `useCountdown` hook.
  * `v{version}` — sourced from `package.json` via Vite's `define` (`__APP_VERSION__`), declared in `vite-env.d.ts`.

### Audio Handling (Future)

* Audio files will be fetched from blob storage (e.g. AWS S3)
* Must support:

  * Streaming or partial playback
  * Efficient loading (avoid downloading full files unnecessarily)

---

## 5. State Management

The application should manage:

* Current day’s puzzle
* Number of guesses used
* Guess history
* Game result (win/loss)
* Clip progression state

Persistence:

* Uses `localStorage` with per-date keys: `kclip-state-{YYYY-MM-DD}`
* Stores the full `GameState` object as JSON (date, guesses, status)
* On load, validates the stored shape and rejects data from a different date
* Automatically saves after each guess
* Each day's state is stored independently, enabling the puzzle archive
* Tab re-focus triggers a date check; reloads the page if the day has changed (only when viewing today's puzzle)
* Stats are stored separately under `kclip-stats` as a `StatsRecord` object:
  * Tracks played, wins, current streak, max streak, guess distribution (1–6 + X), and last played/won dates
  * Updated only when today’s puzzle ends (archive plays do not count)
  * Streak resets to 0 if a day is missed (detected on load via `lastPlayedDate`)
  * Schema merges with defaults on load, so future fields are additive

---

## 6. Puzzle Selection Logic

* Puzzle selection is **deterministic and date-based**
* All users receive the **same song for a given date**
* Daily reset is at **00:00 AEST (UTC+10)**
* Algorithm:

  1. The full song list is **Fisher-Yates shuffled** at build time using a seeded PRNG (mulberry32, seed `20260322`)
  2. Each day maps to an index: `dayNumber % songCount`
  3. The shuffled order ensures songs cycle without clustering by artist

* Epoch: **2026-03-22 AEST** (Day 1)
* Consistent across devices and browsers (all calculations use a fixed AEST offset of UTC+10)
* Helper `getDateForDay(dayNumber: number): string` in `puzzle.ts` converts a day number back to its AEST date string (inverse of `getDayNumber`)

---

## 7. Guessing System

* Users select guesses from a **predefined list of songs** via a searchable autocomplete dropdown
* The dropdown filters by song title or artist name as the user types
* Selecting a song from the dropdown **populates the input** but does **not** immediately submit the guess
* A **Submit Guess** button becomes active only when a song is selected; clicking it calls `onGuess` and resets the component
* Pressing Escape or editing the input after selection clears the selection
* Keyboard navigation is supported (↑↓ arrows, Enter to select/submit, Escape to clear)
* Each song entry includes:

  * Song title
  * Artist name

### Song List

* Defined as a static TypeScript array in `src/data/songs.ts`
* Currently contains **157 K-pop tracks** across ~30 artists
* Entries specify `title` and `artist`; `id` and `audioFile` are auto-generated:

  * ID: `{artist-slug}-{title-slug}` (e.g. `ikon-killing-me`)
  * Audio: `{artist-slug}-{title-slug}.mp3`
* The list is sorted alphabetically by artist, then by title

### Matching Rules

* Matching is based on **selected list items**, not free-text input
* A guess for the **wrong song but correct artist** is scored as **partial** (🟧)
* Unique song + artist slug combinations ensure no ID collisions
* Already-guessed songs are excluded from the dropdown

---

## 8. Constraints & Principles

### Simplicity First

* Avoid unnecessary complexity
* Prioritize a clean, fast user experience

### Static-First Architecture

* No backend required initially
* All logic should run client-side

### Deterministic Daily Puzzle

* All users must get the same song each day

### Performance

* Minimize bundle size
* Avoid large unnecessary downloads (especially audio)

### Mobile-First UX

* Primary usage is mobile browsers
* Design should:

  * Be responsive
  * Work well on small screens
  * Avoid desktop-only interactions

### Accessibility

* Ensure basic usability across devices and browsers

---

## 9. Known Tradeoffs (Accepted)

These are intentional decisions for this project:

* No concern about:

  * Audio licensing (private use only)
  * Users inspecting frontend code to find answers
* No backend security or protection mechanisms

---

## 10. Future Considerations (Not in Scope Yet)

These are **explicitly NOT required now**, but should influence design decisions:

* User accounts / authentication
* Song database management
* Admin tools for adding songs
* Multiple difficulty modes
* Leaderboards or social features
* Obfuscation or protection of answers
* **CI/CD & Branching Strategy** — Move away from pushing directly to `main`. Adopt a branching model (e.g. feature branches with PRs) and set up a CI/CD pipeline to automate linting, testing, and deployment.
* **Unit Testing** — Add unit test coverage across utility functions, hooks, and components (e.g. with Vitest + React Testing Library).
* **End-to-End Testing** — Introduce Playwright for E2E tests covering core user flows (daily puzzle play, guess submission, result sharing, archive navigation).

---

## 11. AI Agent Guidelines

When modifying or extending this project:

* Do NOT introduce backend dependencies unless explicitly requested
* Prefer simple, readable solutions over complex abstractions
* Keep components small and focused
* Avoid over-engineering state management
* Ensure changes align with core game rules
* Do not break deterministic daily puzzle behavior
* Maintain compatibility with static hosting (GitHub Pages)
* Optimize for mobile UX first

---

## 12. Planned Changes

### Firebase Integration (branch: `feature/firebase-integration`)

Migration of audio files from `public/audio/` in the repository to Firebase Storage, laying the groundwork for future Firebase Auth / user accounts

#### Phase 1 — Firebase Project Setup *(manual, no code changes)*

* Create a Firebase project at console.firebase.google.com
* Enable **Firebase Storage** (production mode)
* Add `alextomkins.github.io` to **Authentication → Settings → Authorised domains**
* Install the Firebase CLI: `npm install -g firebase-tools`
* Configure **Storage CORS** via a `cors.json` applied with `gsutil` to allow requests from the GitHub Pages domain
* Write **Storage Security Rules** — public read on all audio files, block all writes

#### Phase 2 — Install SDK & Firebase Config

* Install `firebase` package: `npm install firebase`
* Create `src/lib/firebase.ts` — initialise the Firebase app using `VITE_FIREBASE_*` env vars
* Add `.env.local` with Firebase project config values (gitignored)
* Add `.env.example` documenting the required env vars

#### Phase 3 — Upload Audio Files to Firebase Storage *(manual)*

* Upload all files from `public/audio/` to an `/audio/` folder in Firebase Storage
* Naming convention stays identical: `{artist-slug}-{song-slug}.mp3`
* Verify a test file is accessible via its public download URL

#### Phase 4 — Wire Firebase Storage URLs into the App

* Create `src/lib/storage.ts` — export a `getAudioUrl(audioFile: string): string` helper that returns the Firebase Storage download URL
* Update `src/App.tsx` — replace the single `BASE_URL`-based `audioSrc` line with a call to `getAudioUrl()`
* No changes needed to `useAudioPlayer.ts` or `songs.ts`

#### Phase 5 — Test & Validate

* Test locally against the live Firebase Storage bucket
* Verify playback works across all 6 clip durations
* Verify correct CORS headers are returned
* Test on mobile (Safari iOS + Chrome Android)
* Confirm no regressions in game logic

#### Phase 6 — Cleanup

* Remove audio files from `public/audio/` (reduces repo size)
* Update `constitution.md` — revise "Audio Handling (Current)" section to reflect Firebase Storage
* Deploy: `npm run deploy`

#### Files Changed

| File | Change |
| --- | --- |
| `src/lib/firebase.ts` | New — Firebase app init |
| `src/lib/storage.ts` | New — `getAudioUrl()` helper |
| `src/App.tsx` | 1-line change — swap audio URL source |
| `.env.local` | New — local Firebase config (gitignored) |
| `.env.example` | New — documents required env vars |
| `public/audio/` | Deleted after Phase 6 |
| `constitution.md` | Updated to reflect new architecture |
| `package.json` | `firebase` added as dependency |

---

## 13. Open Questions / To Be Defined

*All previously open questions have been resolved and documented above.*

---

## 14. Versioning Philosophy

* Start minimal and iterate
* Avoid premature scaling decisions
* Refactor only when necessary

---

## 15. Definition of Done (MVP)

The MVP is complete when:

* A user can:

  * Play the daily puzzle
  * Hear progressively longer clips
  * Replay unlocked clips freely
  * Select guesses from a predefined list
  * Win or lose after up to 6 attempts
  * See a result screen
  * Copy a shareable result

---
