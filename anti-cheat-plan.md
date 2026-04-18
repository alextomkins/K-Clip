# Anti-Cheat Plan for K-Clip

## Current Cheating Vectors

| Vector | Severity |
|--------|----------|
| Audio filenames follow `{artist}-{title}.mp3` — visible in Network tab | Critical |
| Full `Song` object (title, artist) in React state — visible in DevTools | Medium |
| Client-side answer validation (`songId === puzzle.song.id`) | Medium |
| Deterministic shuffle + full song list in bundle — all puzzles precomputable | Low (accepted risk) |

---

## Option 1: Date-Named Audio Files (Low effort, high impact)

**What changes:** Rename audio files in Firebase Storage from `aespa-black-mamba.mp3` to `{YYYY-MM-DD}.mp3` (e.g., `2026-04-17.mp3`). The client requests audio by date instead of by song identity — it never needs to know the filename-to-song mapping.

A script can pre-generate date-named files for the next year in one batch. The song list will be expanded before the ~160-day cycle completes, so duplicate date-to-song mappings are not a concern.

**Changes required:**

- One-time script to copy/rename all audio files in Firebase Storage
- Update `getAudioUrl()` in `storage.ts` to fetch `audio/{date}.mp3` instead of `audio/{artist-slug}.mp3`
- Remove `audioFile` from the `Song` type and `songs.ts` (no longer needed)

**Pros:**

- Eliminates the most obvious cheat (song name visible in Network tab)
- No backend changes, no architecture changes
- Audio still served directly from Firebase Storage CDN — zero latency impact
- Client code becomes simpler (no song-to-filename mapping)

**Cons:**

- Need to upload new date-named files when adding songs or extending the calendar
- Song list + shuffle logic still in the bundle (accepted risk — requires code inspection)

**Effort:** ~1-2 hours

---

## Option 2: Obfuscated Audio Filenames (Low effort, high impact)

**What changes:** Rename audio files in Firebase Storage from `aespa-black-mamba.mp3` to opaque hashes (e.g., `a3f7c2d1.mp3` or UUIDs). Update `songs.ts` to map songs to hashed filenames.

**Pros:**

- Eliminates the easiest cheat (glancing at the Network tab)
- No backend changes, no architecture changes
- No duplicate files — each song has one file with an opaque name

**Cons:**

- Song list + shuffle logic still in the bundle — determined users can match the hash back to the song entry and read the title
- Doesn't prevent DevTools inspection of React state

**Effort:** ~1-2 hours (rename files, update `audioFile` values)

---

## Option 3: Server-Side Puzzle Resolution (Medium effort, strongest protection)

**What changes:** The client no longer knows today's answer. The server becomes the source of truth for puzzle identity, audio delivery, and guess validation.

### Audio Delivery

The server provides a **pre-signed Firebase Storage URL** for the puzzle's audio. The client still downloads directly from the CDN (no latency penalty), but never sees a meaningful filename.

- **New endpoint:** `GET /api/puzzles/{date}/audio-url` — returns a pre-signed CDN URL to the audio file (opaque path). Called once per puzzle load.
- Audio playback remains CDN-fast, identical to today.

### Guess Validation

Guesses are validated server-side. The answer is only revealed after the game ends.

- **New endpoint:** `POST /api/puzzles/{date}/guess` — accepts a `songId`, returns `{ result: "correct" | "incorrect" | "partial", guessNumber: 3 }`. On game completion, the response includes the answer.
- **Optimistic UI:** Show the guess immediately in the history on submit, then reconcile when the server responds (~50-200ms). The app already uses a similar pattern for offline write queuing.

### Puzzle Resolution

- **Remove `getDailyPuzzle()` from the client** — the shuffle logic moves to the backend.
- **Song list stays in the client** for the search/autocomplete dropdown (knowing the ~160 candidates isn't cheating).

### Latency Profile

| Action | Where | Latency |
|--------|-------|---------|
| Fetch audio URL | `GET /api/puzzles/{date}/audio-url` → returns pre-signed CDN URL | Once per puzzle load |
| Play audio | Direct from Firebase Storage CDN | Same as today |
| Submit guess | `POST /api/puzzles/{date}/guess` | ~50-200ms per guess (optimistic UI) |
| Get answer | Returned in final guess response | Included in above |

### Cold Start Mitigation

Cloud Run cold starts (2-5s) could make the first interaction feel slow. Options:
- Set `--min-instances=1` on Cloud Run (~$5-10/month) to keep one container warm
- The audio URL fetch happens on puzzle load, so the container warms up before the user is ready to guess

**Pros:**

- Eliminates all major cheating vectors
- Network tab, DevTools, and bundle inspection reveal nothing useful
- Audio still served from CDN — no latency or bandwidth penalty
- Guess submission feels instant with optimistic UI
- Minimal UI changes — `SongSearch`, `GuessHistory`, `ResultScreen` stay the same

**Cons:**

- Requires the API for gameplay (currently the game works offline/anonymously)
- Anonymous users would either need a lightweight session or a separate approach
- Adds 2 new endpoints and modifies the game loop

**Effort:** ~1-2 days

---

## Option 4: Hybrid — Server Puzzle + Anonymous Fallback (Highest effort, best UX)

**What changes:** Same as Option 3 for authenticated users. Anonymous users get a degraded-security experience using date-named audio files (Option 1) with client-side validation. Since anonymous users can't appear on the leaderboard, cheating has no competitive impact.

- **Authenticated users:** Full server-side validation (Option 3)
- **Anonymous users:** Client-side logic with date-named audio files (Option 1)

**Pros:**

- Strong anti-cheat for competitive users, no sign-in wall for casual players
- Preserves offline play for anonymous users
- Leaderboard integrity is protected (only authenticated results are server-validated)

**Cons:**

- Two code paths for puzzle resolution
- More complex to maintain

**Effort:** ~2-3 days

---

## Recommendation

**Start with Option 1 now** — renaming audio files to dates is the fastest way to close the most obvious cheating vector (song name in Network tab), with zero impact on performance or architecture.

Then implement **Option 3 or 4** as the proper fix. Since the backend already has game state endpoints, adding server-side puzzle resolution is a natural extension. Pre-signed URLs keep audio delivery CDN-fast, and optimistic UI makes guess submission feel instant.

Option 4 is ideal to keep the game playable without sign-in. Option 3 is simpler if requiring authentication for gameplay is acceptable.
