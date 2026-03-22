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

---

## 3. Game Outcome & Sharing

After the game ends:

* Display:

  * Win or loss state
  * Number of guesses used
* Provide a **"Share Result"** button:

  * Generates a text-based summary (Wordle-style)
  * Copies it to clipboard

### Share Output Format

```
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

* Uses `localStorage` under the key `songguess-state`
* Stores the full `GameState` object as JSON (date, guesses, status)
* On load, validates the stored shape and rejects data from a different date
* Automatically saves after each guess
* Tab re-focus triggers a date check; reloads the page if the day has changed

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

---

## 7. Guessing System

* Users select guesses from a **predefined list of songs** via a searchable autocomplete dropdown
* The dropdown filters by song title or artist name as the user types
* Keyboard navigation is supported (↑↓ arrows, Enter, Escape)
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
* Streak tracking
* Song database management
* Admin tools for adding songs
* Multiple difficulty modes
* Leaderboards or social features
* Obfuscation or protection of answers

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

## 12. Open Questions / To Be Defined

*All previously open questions have been resolved and documented above.*

---

## 13. Versioning Philosophy

* Start minimal and iterate
* Avoid premature scaling decisions
* Refactor only when necessary

---

## 14. Definition of Done (MVP)

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
