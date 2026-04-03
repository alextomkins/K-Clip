# 🔑 K-Clip — Auth & Cloud Data Integration Plan

## Overview

Migrate K-Clip from a fully local (localStorage) app to one with a Cloud Run ASP.NET API backend and Firebase Auth, enabling:

1. **Cross-device sync** — Users sign in and see the same stats/results on any device.
2. **Daily averages** — Show the average number of guesses for each day's puzzle.
3. **Leaderboard** — Rank players by performance (win %, streak, etc.).

### Architecture

```
React App (GitHub Pages → later Firebase Hosting)
  ├── Firebase Auth → Google Sign-In → JWT (ID token)
  ├── Firebase Storage → Audio files (unchanged)
  └── Cloud Run (ASP.NET Web API)
        ├── Validates Firebase JWT via middleware
        ├── Reads/writes Firestore via Google.Cloud.Firestore server SDK
        ├── Computes leaderboard, averages, aggregations in C# with LINQ
        ├── Repository pattern (IGameRepository) for future SQL migration
        └── Exposes REST API endpoints
```

### Key Decisions

- **Firebase Auth** handles sign-in on the client (Google Sign-In popup/redirect).
- **All data operations go through the ASP.NET API** — the React client never reads/writes Firestore directly.
- **Firestore security rules deny all client access** — only the Cloud Run service account has access.
- **No Cloud Functions** — the ASP.NET API handles all server-side logic.
- **Repository pattern** from day one — swap Firestore for SQL later with zero API/client changes.
- **CORS** configured on the API while hosted on GitHub Pages; removed after migrating to Firebase Hosting.

---

## Phase 1: Firebase Auth Setup (Client-Side)

### 1.1 Auth Providers

Start with **Google Sign-In** (lowest friction, widely used). Optionally add:
- Anonymous auth (for try-before-you-sign-up flow)
- Apple Sign-In (for iOS Safari users)

### 1.2 Firebase Console Setup

- Enable **Google** as a sign-in provider in Firebase Console → Authentication → Sign-in method.
- Add GitHub Pages domain to Authorized Domains.
- Optionally enable **Anonymous** auth for guest play.

### 1.3 Client Code Changes

#### `src/lib/firebase.ts`
- Add `getAuth(app)` initialization.
- Export the `auth` instance.

#### New: `src/hooks/useAuth.ts`
- Hook wrapping `onAuthStateChanged` listener.
- Returns `{ user, loading, signIn, signOut, getIdToken }`.
- `signIn()` uses `signInWithPopup(auth, new GoogleAuthProvider())`.
- `signOut()` calls `firebaseSignOut(auth)`.
- `getIdToken()` returns the current Firebase ID token for API calls.

#### New: `src/contexts/AuthContext.tsx`
- React context providing auth state app-wide.
- Wraps `useAuth` hook so any component can access the current user.

#### New: `src/lib/api.ts`
- API client wrapping `fetch()` with base URL and auth header injection.
- Automatically attaches `Authorization: Bearer <idToken>` to all requests.
- Methods: `api.get<T>(path)`, `api.post<T>(path, body)`, `api.put<T>(path, body)`.

#### `src/App.tsx`
- Wrap app in `<AuthProvider>`.
- Show sign-in button in header (or a user avatar when signed in).
- Gate cloud features behind auth; the game itself remains playable without sign-in (localStorage fallback).

### 1.4 UX Flow

```
First Visit
├── User can play immediately (anonymous / localStorage mode)
├── Prompt to sign in after first game completion
│   └── "Sign in to save your stats across devices"
└── Header shows "Sign In" button

After Sign-In
├── Migrate any existing localStorage data to API (one-time)
├── Header shows user avatar + display name
├── Settings dropdown: Sign Out
└── All future game results sync via API
```

---

## Phase 2: ASP.NET Web API (Cloud Run)

### 2.1 Project Structure

```
api/
├── KClip.Api/
│   ├── Program.cs                    # Host config, DI, middleware
│   ├── appsettings.json
│   ├── Dockerfile
│   ├── Controllers/
│   │   ├── GamesController.cs        # GET/PUT per-day game state
│   │   ├── StatsController.cs        # GET/PUT user stats
│   │   ├── PuzzlesController.cs      # GET daily summary/averages
│   │   ├── LeaderboardController.cs  # GET leaderboard
│   │   └── MigrationController.cs    # POST bulk migration from localStorage
│   ├── Models/
│   │   ├── GameState.cs
│   │   ├── Guess.cs
│   │   ├── StatsRecord.cs
│   │   ├── PuzzleSummary.cs
│   │   ├── PuzzleResult.cs
│   │   ├── LeaderboardEntry.cs
│   │   └── UserProfile.cs
│   ├── Services/
│   │   ├── IGameRepository.cs        # Repository interface
│   │   ├── FirestoreGameRepository.cs # Firestore implementation
│   │   ├── LeaderboardService.cs     # Ranking logic (LINQ)
│   │   └── PuzzleSummaryService.cs   # Aggregation logic (LINQ)
│   ├── Auth/
│   │   └── FirebaseAuthHandler.cs    # JWT validation middleware
│   └── KClip.Api.csproj
└── KClip.Api.sln
```

### 2.2 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/games/{date}` | Required | Get user's game state for a date |
| `PUT` | `/api/games/{date}` | Required | Save/update game state for a date |
| `GET` | `/api/stats` | Required | Get user's stats |
| `PUT` | `/api/stats` | Required | Save/update user's stats |
| `POST` | `/api/games/{date}/complete` | Required | Submit final result (triggers aggregation) |
| `GET` | `/api/puzzles/{date}/summary` | Required | Get daily puzzle summary (avg guesses, total plays) |
| `GET` | `/api/leaderboard` | Required | Get all-time leaderboard (top N) |
| `POST` | `/api/migrate` | Required | Bulk import localStorage data |

### 2.3 Firebase JWT Validation

```csharp
// Auth/FirebaseAuthHandler.cs
// Validates Firebase ID tokens using Google's public keys
// Extracts uid, email, displayName, photoURL from token claims
// Sets HttpContext.User with uid as the primary identity
```

ASP.NET middleware validates the `Authorization: Bearer <token>` header on every request using Firebase Admin SDK for .NET (`FirebaseAdmin` NuGet package).

### 2.4 Repository Interface

```csharp
public interface IGameRepository
{
    // Game state
    Task<GameState?> GetGameState(string uid, string date);
    Task SaveGameState(string uid, GameState state);
    Task<List<GameState>> GetAllGameStates(string uid);

    // Stats
    Task<StatsRecord?> GetStats(string uid);
    Task SaveStats(string uid, StatsRecord stats);

    // Puzzle results (individual + aggregation)
    Task SubmitResult(string uid, PuzzleResult result);
    Task<PuzzleSummary?> GetPuzzleSummary(string date);

    // User profiles (for leaderboard display names)
    Task<UserProfile?> GetProfile(string uid);
    Task SaveProfile(string uid, UserProfile profile);

    // Leaderboard
    Task<List<LeaderboardEntry>> GetLeaderboard(int limit = 50);
}
```

### 2.5 Firestore Implementation

Uses `Google.Cloud.Firestore` NuGet package (server SDK — no security rules needed, uses service account).

```
firestore-root/
├── users/{uid}/
│   ├── profile: { displayName, photoURL, createdAt }
│   ├── stats: { played, wins, currentStreak, maxStreak,
│   │            guessDistribution, lastPlayedDate, lastWonDate }
│   └── games/{YYYY-MM-DD}: { date, guesses[], status, completedAt }
│
├── puzzles/{YYYY-MM-DD}/
│   ├── summary: { totalPlays, totalGuesses, avgGuesses,
│   │              winCount, distribution: {1:n, 2:n, ..., 6:n, X:n} }
│   └── results/{uid}: { displayName, guessCount, status, completedAt }
```

No separate `leaderboard` collection needed — the API computes rankings on the fly by reading all user stats documents and sorting with LINQ. For a small user base this is fast; can add caching or a materialized view later.

### 2.6 Firestore Security Rules

Since only the Cloud Run service account accesses Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Deny all client-side access — API is the only entry point
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### 2.7 Aggregation Logic (Server-Side)

When a game completes (`POST /api/games/{date}/complete`):

1. Write `PuzzleResult` to `puzzles/{date}/results/{uid}`.
2. Read all results for that date.
3. Compute `PuzzleSummary` in C#:
   ```csharp
   var results = await GetResultsForDate(date);
   var summary = new PuzzleSummary
   {
       TotalPlays = results.Count,
       TotalGuesses = results.Sum(r => r.GuessCount),
       AvgGuesses = results.Average(r => (double)r.GuessCount),
       WinCount = results.Count(r => r.Status == "won"),
       Distribution = results.GroupBy(r => r.Status == "won" ? r.GuessCount.ToString() : "X")
                              .ToDictionary(g => g.Key, g => g.Count())
   };
   ```
4. Write summary back to `puzzles/{date}/summary`.

This avoids race conditions — a single API instance processes sequentially. At scale, add distributed locking or eventual consistency.

### 2.8 Deployment (Cloud Run)

```dockerfile
# Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app
FROM runtime
WORKDIR /app
COPY --from=build /app .
ENTRYPOINT ["dotnet", "KClip.Api.dll"]
```

Deploy:
```bash
gcloud run deploy kclip-api \
  --source ./api/KClip.Api \
  --region australia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=your-project-id"
```

Cloud Run free tier: 2M requests/month, 360K vCPU-seconds — more than enough.

---

## Phase 3: Client Cloud Sync

### 3.1 Updating `useGameState.ts`

- Accept `user` from auth context.
- If authenticated: read/write via API client (with localStorage as cache/fallback).
- If not authenticated: use localStorage only (current behavior).
- On game end: call `POST /api/games/{date}/complete` to submit result.

### 3.2 Updating `useStats.ts`

- If authenticated: load stats from API on mount; save to both API and localStorage.
- If not authenticated: localStorage only.

### 3.3 Migration: localStorage → API

On first sign-in, call `POST /api/migrate`:

1. Client scans localStorage for all `kclip-state-*` keys.
2. Sends them in a single batch request to the migration endpoint.
3. API writes each to Firestore under the user's UID.
4. Client also sends local stats.
5. Mark migration complete with a `kclip-migrated-{uid}` localStorage flag.
6. API merges: for dates that exist in both Firestore and local, Firestore wins; local fills gaps.

---

## Phase 4: Daily Average Guesses

### 4.1 How It Works

When a user completes a puzzle, `POST /api/games/{date}/complete` triggers server-side aggregation (see 2.7). The summary is immediately available.

### 4.2 UI Integration

#### `src/components/ResultScreen.tsx`
After game ends, fetch and display:
```
📊 Community Stats
Average: 3.2 guesses · 12 players today
```

#### `src/components/StatsModal.tsx`
- Show today's average vs. the user's score.

---

## Phase 5: Leaderboard

### 5.1 Ranking Criteria

Primary sort: **Win %** (minimum 5 games played to qualify)
Tiebreakers:
1. Average guesses (lower is better, wins only)
2. Max streak (higher is better)
3. Games played (higher is better)

### 5.2 Leaderboard Types

Start with **All-Time** only for MVP. Daily and weekly can be added later.

### 5.3 Implementation

#### Server-side (`LeaderboardService.cs`)
```csharp
public async Task<List<LeaderboardEntry>> GetLeaderboard(int limit = 50)
{
    var allStats = await _repo.GetAllUserStats(); // reads users/{uid}/stats
    return allStats
        .Where(s => s.Played >= 5)
        .Select(s => new LeaderboardEntry
        {
            Uid = s.Uid,
            DisplayName = s.DisplayName,
            PhotoURL = s.PhotoURL,
            Played = s.Played,
            Wins = s.Wins,
            WinPct = s.Played > 0 ? (double)s.Wins / s.Played * 100 : 0,
            MaxStreak = s.MaxStreak,
            CurrentStreak = s.CurrentStreak,
            AvgGuesses = s.WinGuessSum > 0 ? (double)s.WinGuessSum / s.Wins : 0
        })
        .OrderByDescending(e => e.WinPct)
        .ThenBy(e => e.AvgGuesses)
        .ThenByDescending(e => e.MaxStreak)
        .ThenByDescending(e => e.Played)
        .Select((e, i) => e with { Rank = i + 1 })
        .Take(limit)
        .ToList();
}
```

#### New: `src/components/LeaderboardModal.tsx`
- 🏆 button in header opens leaderboard modal.
- Fetches `GET /api/leaderboard`.
- Displays ranked list: position, avatar, name, win %, streak, avg guesses.
- Highlights the current user's row.

#### New: `src/hooks/useLeaderboard.ts`
- Fetches and caches leaderboard data.
- Returns `{ entries, loading, userRank }`.

---

## Phase 6: Updated Types

### Client types to add to `src/types/index.ts`

```typescript
// Auth
interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
}

// Puzzle community stats
interface PuzzleSummary {
  totalPlays: number;
  avgGuesses: number;
  winCount: number;
  distribution: Record<DistributionKey, number>;
}

// Leaderboard
interface LeaderboardEntry {
  uid: string;
  displayName: string;
  photoURL: string | null;
  played: number;
  wins: number;
  winPct: number;
  currentStreak: number;
  maxStreak: number;
  avgGuesses: number;
  rank: number;
}
```

### Server models (C#)

Equivalent C# record types in `Models/` directory, decorated with `[FirestoreData]` attributes for the Firestore implementation.

---

## Implementation Order

```
Phase 1  Firebase Auth (Client)
  ├── 1a  Enable Google Auth in Firebase Console
  ├── 1b  Add auth initialization to firebase.ts
  ├── 1c  Create useAuth hook + AuthContext
  ├── 1d  Add sign-in/out UI to App header
  └── 1e  Test auth flow end-to-end

Phase 2  ASP.NET API (Cloud Run)
  ├── 2a  Scaffold ASP.NET Web API project
  ├── 2b  Implement Firebase JWT auth middleware
  ├── 2c  Define IGameRepository interface + models
  ├── 2d  Implement FirestoreGameRepository
  ├── 2e  Build controllers (Games, Stats, Migration)
  ├── 2f  Dockerize and deploy to Cloud Run
  ├── 2g  Configure CORS for GitHub Pages origin
  └── 2h  Test API end-to-end with auth

Phase 3  Client Cloud Sync
  ├── 3a  Create api.ts client with auth token injection
  ├── 3b  Update useGameState for API read/write
  ├── 3c  Update useStats for API read/write
  ├── 3d  Implement localStorage → API migration
  └── 3e  Test cross-device sync

Phase 4  Daily Averages
  ├── 4a  Add aggregation logic to PuzzleSummaryService
  ├── 4b  Add PuzzlesController endpoint
  ├── 4c  Display average guesses on ResultScreen
  └── 4d  Display average in StatsModal

Phase 5  Leaderboard
  ├── 5a  Add LeaderboardService with ranking logic
  ├── 5b  Add LeaderboardController endpoint
  ├── 5c  Create LeaderboardModal component
  ├── 5d  Create useLeaderboard hook
  └── 5e  Add 🏆 button to header

Phase 6  Polish & Edge Cases
  ├── 6a  Handle offline/network errors gracefully
  ├── 6b  Handle account deletion
  ├── 6c  Add response caching on API (leaderboard, summaries)
  └── 6d  Test on mobile browsers

Future  Firebase Hosting Migration
  ├── Remove /K-Clip/ base path from vite.config.ts
  ├── Update share URL in src/utils/share.ts
  ├── Swap gh-pages deploy for firebase deploy
  ├── Remove CORS config from API
  └── Update authorized domains
```

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Firestore costs at scale | API caches reads; aggregation reduces per-request doc reads |
| Cold start latency (Cloud Run) | Set min instances to 1 if needed (~$0/month at low traffic); keep container slim |
| CORS complexity on GitHub Pages | Temporary; resolved when migrating to Firebase Hosting |
| Slow auth popup on mobile | Pre-load auth SDK; consider redirect flow instead of popup on mobile |
| localStorage migration conflicts | Merge strategy: API/Firestore wins for dates that exist in both; local fills gaps |
| Leaderboard gaming (fake accounts) | Minimum games threshold (5+); future: manual review |
| Offline play | localStorage remains the primary cache; sync to API when back online |
| Future SQL migration | Repository pattern ensures swap is isolated to one class |

---

## GCP Services Required

| Service | Current | After Integration |
|---------|---------|-------------------|
| Firebase Storage | ✅ Audio files | ✅ No change |
| Firebase Analytics | ✅ Events | ✅ Link to user IDs |
| Firebase Auth | ❌ | ✅ Google Sign-In (client-side) |
| Cloud Firestore | ❌ | ✅ Data store (server-side access only) |
| Cloud Run | ❌ | ✅ ASP.NET Web API |
| Cloud Functions | ❌ | ❌ Not needed (API handles everything) |

### Cost Estimate

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|---------------|------|
| Firebase Auth | 10K users/month | < 50 users | $0 |
| Cloud Firestore | 50K reads, 20K writes/day | < 1K reads, < 200 writes/day | $0 |
| Cloud Run | 2M requests, 360K vCPU-sec/month | < 10K requests/month | $0 |
| Firebase Storage | 5GB, 1GB/day downloads | < 1GB stored | $0 |
| **Total** | | | **$0/month** |

---

## Future SQL Migration Path

When/if you outgrow Firestore:

1. Provision Cloud SQL (PostgreSQL) or use Supabase/Neon free tier.
2. Create EF Core `DbContext` + entity classes mirroring the existing models.
3. Write `SqlGameRepository : IGameRepository` — same interface, SQL implementation.
4. Data migration script: read all Firestore docs → insert into SQL tables.
5. Swap DI registration in `Program.cs`: one line change.
6. No changes to controllers, services, API contract, or React client.

---

## Notes

- The game remains fully playable without signing in (localStorage fallback).
- Signing in is encouraged but never required.
- Archive puzzle results sync via API but do NOT count toward stats or leaderboard (preserving current behavior).
- All times continue to use AEST (UTC+10) for consistency.
- The React client never accesses Firestore directly — all data flows through the API.
