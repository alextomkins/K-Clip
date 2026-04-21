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

* A **« ‹ / › »** navigation in the header allows users to browse and play any **past puzzle** (archive mode).

  * `«` jumps to the first puzzle ever, `»` jumps to today's puzzle.
  * `‹` / `›` step one day at a time.
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

https://alextomkins.github.io/K-Clip/ 🎵
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
* PWA: `vite-plugin-pwa` provides service worker, offline caching (including CacheFirst for audio MP3s), and an installable web app manifest

### Backend

* Framework: ASP.NET Web API (C# / .NET 10)
* Hosting: Google Cloud Run (australia-southeast1)
* Database: Cloud Firestore (database ID: `k-clip`, server-side access only via `Google.Cloud.Firestore` SDK)
* Auth validation: Firebase Admin SDK (`FirebaseAdmin`) — custom `AuthenticationHandler` validates Firebase ID tokens
* Container: Dockerfile based on `mcr.microsoft.com/dotnet/aspnet:10.0`
* CORS: Configured for GitHub Pages origin + localhost dev
* Swagger/OpenAPI: Enabled in development mode
* Response caching: Leaderboard (60s), puzzle summaries (30s)

### Deployment

Both frontend and backend deploy automatically via GitHub Actions on push to `master`.

**Frontend** (`.github/workflows/deploy.yml`):
* Triggers on any push to `master`
* Builds with Vite, injecting Firebase + API secrets as env vars
* Deploys static output to GitHub Pages via `peaceiris/actions-gh-pages`

**Backend** (`.github/workflows/deploy-api.yml`):
* Triggers on push to `master` only when `api/**` files change
* Authenticates to GCP via Workload Identity Federation (no long-lived keys)
* Deploys to Cloud Run from source (`gcloud run deploy --source`)
* Sets env vars: `GOOGLE_CLOUD_PROJECT`, `FIRESTORE_DATABASE_ID`, `ASPNETCORE_URLS`

**Required GitHub Secrets:**

| Secret | Purpose |
|--------|----------------------------|
| `VITE_FIREBASE_API_KEY` | Firebase client config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase client config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase client config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase client config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase client config |
| `VITE_FIREBASE_APP_ID` | Firebase client config |
| `VITE_API_BASE_URL` | Cloud Run service URL |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity provider |
| `GCP_SERVICE_ACCOUNT` | GCP service account email |

### Audio Handling

* Audio files are stored in **Firebase Storage** under an `/audio/` folder
* Each song has a **single 30-second MP3 file**
* Clips are generated client-side by controlling playback timing
* File naming convention: `{artist-slug}-{song-slug}.mp3` (e.g. `aespa-black-mamba.mp3`)
* Download URLs are fetched at runtime via `getAudioUrl()` in `src/lib/storage.ts`
* Firebase app is initialised in `src/lib/firebase.ts` using `VITE_FIREBASE_*` env vars
* Playback volume is set to **0.7** by default via the `volume` prop on `useAudioPlayer`
* While audio URLs are loading, the `AudioPlayer` component shows a skeleton UI with a spinner

### UI Features

* **How to Play modal** — an ℹ️ button in the header opens a `HowToPlay` overlay explaining the rules and colour legend. Close via ✕ button or backdrop click.
* **Stats modal** — a 📊 button in the header opens a `StatsModal` overlay showing Played, Win %, Current Streak, Max Streak, guess distribution bar chart, and community stats for today. Close via ✕ button or backdrop click.
* **Leaderboard modal** — a 🏆 button in the header opens a `LeaderboardModal` showing ranked players (visible to all users, including anonymous). Authenticated users see their own position and a visibility toggle. Close via ✕ button or backdrop click.
* **User menu** — when signed in, the user's avatar appears in the header. Clicking it opens the **Profile modal**.
* **Profile modal** — shows the user's avatar, email (read-only), and an editable display name. Below the form: Reset Password (email/password users only), Sign Out, and Delete Account actions.
* **Toast notifications** — a `ToastContainer` at the bottom of the screen shows messages via the `useToast` hook. Toasts support `error` (red, default) and `success` (green) variants. API errors are routed through `setApiErrorHandler`.
* **Avatar colours** — when a user has no photo (e.g. email/password sign-up), a coloured circle with their initial is shown. The colour is deterministic, derived from a hash of the full display name via `avatarColor()` in `src/utils/avatar.ts`.
* **Footer** — displayed below the guess history:
  * `Next song in hh:mm:ss` — live countdown to 00:00 AEST, driven by the `useCountdown` hook.
  * `v{version}` — sourced from `package.json` via Vite's `define` (`__APP_VERSION__`), declared in `vite-env.d.ts`.

---

## 5. Authentication & User Accounts

* **Firebase Authentication** with two sign-in methods:
  * **Google Sign-In** (popup flow)
  * **Email/Password** — sign up (with required display name), sign in, and password reset
* Auth is **optional** — the game is fully playable without signing in (localStorage only).
* `useAuth` hook wraps Firebase auth methods, provides `{ user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, signOut, getIdToken }`.
  * `signUpWithEmail` sets the display name on the Firebase user via `updateProfile`, force-refreshes the ID token, then pushes the display name to the backend via `PUT /api/profile` to avoid race conditions with the auto-created profile.
* `useProfile` hook manages profile state (display name, photo URL) fetched from `GET /api/profile`, with fallback to Firebase auth claims.
* `AuthContext` provides auth state and profile data app-wide; composes `useAuth` + `useProfile`. Triggers one-time localStorage migration on first sign-in, then loads the profile.
  * A `skipAutoFetchRef` prevents the automatic profile fetch from racing with the sign-up flow.
* `SignInModal` — a modal with Google sign-in button, email/password form (with mode switching between sign-in, sign-up, and password reset), and user-friendly Firebase error messages. Sign-up mode includes a required display name field (max 30 chars). Error messages avoid user enumeration (all credential errors show the same generic message).
* Header shows a sign-in button when not authenticated. When signed in, shows the user's avatar (from profile, not Firebase auth) — clicking opens the Profile modal. Neither the avatar nor the sign-in button renders while the profile is loading, preventing UI flashes.
* **Account deletion** — `DELETE /api/account` deletes all Firestore data and the Firebase Auth record.

---

## 6. State Management & Cloud Sync

### Local State

* Uses `localStorage` with per-date keys: `kclip-state-{YYYY-MM-DD}`
* Stores the full `GameState` object as JSON (date, guesses, status)
* On load, validates the stored shape and rejects data from a different date
* Automatically saves after each guess
* Each day's state is stored independently, enabling the puzzle archive
* Tab re-focus triggers a date check; reloads the page if the day has changed (only when viewing today's puzzle)
* Stats are stored separately under `kclip-stats` as a `StatsRecord` object:
  * Tracks played, wins, current streak, max streak, guess distribution (1–6 + X), and last played/won dates
  * Updated only when today's puzzle ends (archive plays do not count)
  * Streak resets to 0 if a day is missed (detected on load via `lastPlayedDate`)
  * Schema merges with defaults on load, so future fields are additive

### Cloud Sync (Authenticated Users)

* When signed in, `useGameState` immediately shows cached localStorage state, then fetches from the API in the background. API response overwrites local state and is cached to localStorage.
* A `loading` flag is exposed so the UI can show skeleton/dimmed states during the brief API fetch.
* `useStats` loads stats from the API on mount when authenticated; saves to both API and localStorage.
* On game completion, `POST /api/games/{date}/complete` submits the result for aggregation and returns the updated `PuzzleSummary`.
* Game state changes are synced to the API via `PUT /api/games/{date}`.

### Offline Resilience

* The API client (`src/lib/api.ts`) detects network errors (`Failed to fetch`) on PUT/POST and queues them as pending writes.
* When the browser comes back online, queued writes are flushed automatically.
* Pending writes are deduplicated by method + path.
* Toast notifications inform the user when offline: "You're offline — changes will sync when reconnected".

### localStorage Migration

* On first sign-in, `migrateLocalData()` scans all `kclip-state-*` keys and sends them via `POST /api/migrate`.
* API merge strategy: Firestore wins for dates that already exist; local fills gaps.
* Stats are migrated only if no stats exist in Firestore yet.
* A user profile is created from auth claims if none exists.
* Migration is idempotent — flagged with `kclip-migrated-{uid}` in localStorage.

---

## 7. Puzzle Selection Logic

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

## 8. Guessing System

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
* Currently contains **145 K-pop tracks** across ~30 artists
* Entries specify `title` and `artist`; `id` and `audioFile` are auto-generated:

  * ID: `{artist-slug}-{title-slug}` (e.g. `ikon-killing-me`)
  * Audio: `{artist-slug}-{title-slug}.mp3`
* The list is sorted alphabetically by artist, then by title
* A `songLookup` Map is exported for O(1) lookup by ID

### Matching Rules

* Matching is based on **selected list items**, not free-text input
* A guess for the **wrong song but correct artist** is scored as **partial** (🟧)
* Unique song + artist slug combinations ensure no ID collisions
* Already-guessed songs are excluded from the dropdown

---

## 9. Community Features

### Daily Averages / Puzzle Summaries

* When a game is completed by an authenticated user, the result is submitted to `POST /api/games/{date}/complete`.
* The API recomputes the `PuzzleSummary` (total plays, total guesses, average guesses, win count, distribution) and returns it.
* The summary is displayed on the `ResultScreen` ("📊 Community Stats: Average X.X guesses · N players today") and in the `StatsModal`.
* Summaries are fetched via `GET /api/puzzles/{date}/summary` for previously completed games.
* Response cached for 30 seconds on the server.

### Leaderboard

* Accessible to **all users** (including anonymous) via the 🏆 button in the header.
* Authenticated users see their own position and can toggle visibility.
* Anonymous users see the public leaderboard via a direct fetch (no auth token).
* **Ranking criteria** — Primary: Win % (min 5 games). Tiebreakers: Average guesses (lower better), Max streak (higher better), Games played (higher better).
* **Visibility opt-out** — Users can hide themselves from the public leaderboard via a toggle in the modal. Hidden users still see their own true rank. The `hideFromLeaderboard` flag is stored on the user's profile in Firestore.
* Server-side: `LeaderboardService` computes rankings from all user stats. Hidden users are excluded from the public `entries` list but included when computing the requesting user's rank. Response cached for 60 seconds (with cache-busting after visibility toggle).

---

## 10. API Architecture

### ASP.NET Web API (Cloud Run)

```
api/
├── KClip.Api/
│   ├── Program.cs                    # Host config, DI, middleware, CORS, Swagger
│   ├── Dockerfile                    # .NET 10 multi-stage build, port 8080
│   ├── appsettings.json / .Development.json
│   ├── Controllers/
│   │   ├── AccountController.cs      # DELETE account (Firestore + Firebase Auth)
│   │   ├── GamesController.cs        # GET/PUT game state, POST complete
│   │   ├── StatsController.cs        # GET/PUT user stats
│   │   ├── PuzzlesController.cs      # GET daily summary
│   │   ├── LeaderboardController.cs  # GET leaderboard (anonymous OK)
│   │   ├── ProfileController.cs      # GET/PUT profile, GET/PUT visibility
│   │   ├── MigrationController.cs    # POST bulk migration from localStorage
│   │   └── SeedController.cs         # POST dev-only test data seeding
│   ├── Models/
│   │   ├── GameState.cs, Guess.cs, StatsRecord.cs
│   │   ├── PuzzleSummary.cs, PuzzleResult.cs
│   │   ├── LeaderboardEntry.cs, LeaderboardResponse.cs
│   │   ├── UserProfile.cs, MigrationRequest.cs
│   │   ├── ProfileResponse.cs, UpdateProfileRequest.cs
│   │   ├── VisibilityRequest.cs, VisibilityResponse.cs
│   │   └── CompleteGameRequest.cs
│   ├── Services/
│   │   ├── IGameRepository.cs        # Repository interface
│   │   ├── FirestoreGameRepository.cs # Firestore implementation
│   │   ├── LeaderboardService.cs     # Ranking logic (LINQ)
│   │   └── PuzzleSummaryService.cs   # Aggregation logic (LINQ)
│   └── Auth/
│       └── FirebaseAuthHandler.cs    # JWT validation + ClaimsPrincipal extensions
```

### API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/games/{date}` | Required | Get user's game state for a date |
| `PUT` | `/api/games/{date}` | Required | Save/update game state for a date |
| `POST` | `/api/games/{date}/complete` | Required | Submit final result (triggers aggregation) |
| `GET` | `/api/stats` | Required | Get user's stats |
| `PUT` | `/api/stats` | Required | Save/update user's stats |
| `GET` | `/api/puzzles/{date}/summary` | Required | Get daily puzzle summary |
| `GET` | `/api/leaderboard` | Optional | Get all-time leaderboard (anonymous OK) |
| `GET` | `/api/profile` | Required | Get user's profile (auto-creates if missing) |
| `PUT` | `/api/profile` | Required | Update display name |
| `GET` | `/api/profile/visibility` | Required | Get leaderboard visibility setting |
| `PUT` | `/api/profile/visibility` | Required | Set leaderboard visibility |
| `POST` | `/api/migrate` | Required | Bulk import localStorage data |
| `DELETE` | `/api/account` | Required | Delete all user data + Firebase Auth record |

### Firestore Schema

```
users/{uid}/
  ├── data/profile: { displayName, photoURL, createdAt, hideFromLeaderboard }
  ├── data/stats:   { played, wins, currentStreak, maxStreak,
  │                   guessDistribution, lastPlayedDate, lastWonDate }
  └── games/{YYYY-MM-DD}: { date, guesses[], status, completedAt }

puzzles/{YYYY-MM-DD}/
  ├── data/summary:  { totalPlays, totalGuesses, avgGuesses, winCount, distribution }
  └── results/{uid}: { displayName, guessCount, status, completedAt }
```

### Repository Pattern

`IGameRepository` defines the data access interface. `FirestoreGameRepository` is the only implementation. Swapping to SQL requires implementing the same interface — no changes to controllers, services, or the React client.

---

## 11. Analytics

* **Firebase Analytics** is initialised conditionally via `isSupported()`.
* Events logged:
  * `game_start` — when a fresh puzzle is opened (day_number, puzzle_date)
  * `guess` — after each guess (day_number, guess_number, result)
  * `game_end` — when the game ends (day_number, outcome, guess_count)
  * `share_result` — when the user copies their result (day_number)

---

## 12. Constraints & Principles

### Simplicity First

* Avoid unnecessary complexity
* Prioritize a clean, fast user experience

### Static-First Frontend

* Frontend is static (GitHub Pages); all game logic runs client-side
* Backend handles data persistence, aggregation, and authentication only

### Deterministic Daily Puzzle

* All users must get the same song each day

### Performance

* Minimize bundle size
* Avoid large unnecessary downloads (especially audio)
* PWA caching for audio files and static assets

### Mobile-First UX

* Primary usage is mobile browsers
* Design should:

  * Be responsive
  * Work well on small screens
  * Avoid desktop-only interactions

### Accessibility

* Ensure basic usability across devices and browsers

---

## 13. Known Tradeoffs (Accepted)

These are intentional decisions for this project:

* No concern about:

  * Audio licensing (private use only)
  * Users inspecting frontend code to find answers
* No backend security or protection mechanisms beyond Firebase Auth + Firestore security rules
* Leaderboard computed on the fly from all user stats (no materialized view) — acceptable for small user base
* Puzzle results are not deleted when a user deletes their account, to preserve aggregate summaries

---

## 14. Future Considerations (Not in Scope Yet)

These are **explicitly NOT required now**, but should influence design decisions:

* Song database management
* Admin tools for adding songs
* Multiple difficulty modes
* Obfuscation or protection of answers
* **Firebase Hosting Migration** — Move from GitHub Pages to Firebase Hosting (remove `/K-Clip/` base path, update share URL, remove CORS config)
* **CI/CD & Branching Strategy** — Move away from pushing directly to `master`. Adopt a branching model (e.g. feature branches with PRs) and add linting/testing to the CI pipeline.
* **Unit Testing** — Add unit test coverage across utility functions, hooks, and components (e.g. with Vitest + React Testing Library).
* **End-to-End Testing** — Introduce Playwright for E2E tests covering core user flows (daily puzzle play, guess submission, result sharing, archive navigation).
* **Future SQL Migration** — Repository pattern enables swapping Firestore for PostgreSQL (e.g. Cloud SQL, Supabase) with one DI registration change.
* **Signed Guess Chain** — The guess endpoint is stateless and unauthenticated, so a caller can fabricate `previousGuessIds` to force a game-over and retrieve the answer. A future improvement would have the server return a HMAC-signed token encoding the guess history with each response; the client sends the token back on the next guess, and the server verifies it before evaluating. This prevents answer extraction without adding auth requirements or database reads.

---

## 15. AI Agent Guidelines

When modifying or extending this project:

* Do NOT introduce new infrastructure or services unless explicitly requested
* Prefer simple, readable solutions over complex abstractions
* Keep components small and focused
* Avoid over-engineering state management
* Ensure changes align with core game rules
* Do not break deterministic daily puzzle behavior
* Maintain compatibility with static hosting (GitHub Pages)
* Optimize for mobile UX first
* When modifying API endpoints, update both the C# backend and the TypeScript frontend client

---

## 16. Open Questions / To Be Defined

*All previously open questions have been resolved and documented above.*

---

## 17. Versioning Philosophy

* Start minimal and iterate
* Avoid premature scaling decisions
* Refactor only when necessary

---

## 18. Definition of Done (MVP)

The MVP is complete when:

* A user can:

  * Play the daily puzzle
  * Hear progressively longer clips
  * Replay unlocked clips freely
  * Select guesses from a predefined list
  * Win or lose after up to 6 attempts
  * See a result screen
  * Copy a shareable result
  * Sign in with Google or email/password to sync across devices
  * View their stats and the community leaderboard
  * Edit their display name via the profile modal
  * Browse and play past puzzles from the archive
