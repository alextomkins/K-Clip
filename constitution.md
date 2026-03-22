# 🎵 Daily Song Guessing Game — Project Constitution

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

### Example Share Output (TBD format)

```
Daily Song #12
🟩⬜⬜⬜⬜⬜
Guessed in 3/6

🎵
```

(*Exact format to be finalized*)

---

## 4. Technical Architecture

### Frontend

* Framework: React (TypeScript)
* Styling: Tailwind CSS
* Hosting: GitHub Pages
* App type: Fully static frontend (no backend initially)

### Audio Handling (Current)

* Audio files are stored locally in the repository
* Initial implementation uses a **single 30-second audio file**
* Clips are generated client-side by controlling playback timing

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

Persistence (initial approach):

* Use browser storage (e.g. localStorage) to:

  * Prevent replaying the same day’s puzzle
  * Maintain progress on refresh

---

## 6. Puzzle Selection Logic

* Puzzle selection is **deterministic and date-based**
* All users receive the **same song for a given date**
* Implementation should use a **date-based hash or index system**
* Must be consistent across:

  * Devices
  * Browsers
  * Timezones (define clearly — e.g. UTC or local)

---

## 7. Guessing System

* Users select guesses from a **predefined list of songs**
* Each song entry includes:

  * Song name
  * Artist name

### Matching Rules

* Matching is based on **selected list items**, not free-text input
* Avoid ambiguity by ensuring:

  * Unique song + artist combinations
  * Clean, consistent formatting

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

* Final share text format
* Exact timezone definition for daily reset (UTC vs local)
* Structure and storage of the predefined song list
* UI/UX for song selection (search, dropdown, autocomplete)
* Handling duplicate or similar song names

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
