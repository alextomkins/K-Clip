# 🎵 K-Clip

A daily K-pop music guessing game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html) and [Heardle](https://www.spotify.com/heardle/).

**[Play now →](https://alextomkins.github.io/K-Clip/)**

## How It Works

Each day, every player gets the same K-pop song. You hear a short clip and try to guess the track — get it wrong and the clip gets longer.

| Guess | Clip Length |
|-------|------------|
| 1 | 1 second |
| 2 | 2 seconds |
| 3 | 5 seconds |
| 4 | 10 seconds |
| 5 | 20 seconds |
| 6 | 30 seconds |

- **🟩** Correct guess
- **🟧** Wrong song, right artist
- **🟥** Wrong guess or skipped
- **⬜** Unused guess

Share your result with friends after each game!

```
🎵 K-Clip #7
🟥🟧🟩⬜⬜⬜
Guessed in 3/6

alextomkins.github.io/K-Clip/ 🎵
```

## Features

- 🎶 **145 K-pop tracks** across ~30 artists
- 📅 **New puzzle every day** at midnight AEST
- 🗂️ **Puzzle archive** — browse and play any past day
- 📊 **Stats tracking** — win %, streaks, guess distribution
- 🏆 **Leaderboard** — compete with friends for the best win rate
- 📋 **Shareable results** — copy your score to clipboard
- 🔐 **Google Sign-In** — sync progress across devices (optional)
- 📈 **Community stats** — see the daily average guesses and player count
- 🎉 **Confetti** on a correct guess
- 📱 **Mobile-first** responsive PWA

## Tech Stack

### Frontend

- **React 19** + **TypeScript 5**
- **Vite** for builds
- **Tailwind CSS 3** for styling
- **Firebase Auth** (Google Sign-In)
- **Firebase Storage** for audio hosting
- **Firebase Analytics** for event tracking
- **vite-plugin-pwa** for offline support
- **GitHub Pages** for hosting

### Backend

- **ASP.NET Web API** (.NET 10 / C#)
- **Cloud Firestore** for data storage
- **Google Cloud Run** for hosting
- **Firebase Admin SDK** for auth validation

## Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd api/KClip.Api
dotnet run
```

### Other Commands

```bash
# Lint
npm run lint

# Build for production
npm run build

# Deploy frontend to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
  components/    # React UI components
  contexts/      # Auth context provider
  data/          # Song list
  hooks/         # Custom React hooks
  lib/           # Firebase, API client, analytics, storage
  types/         # TypeScript type definitions
  utils/         # Puzzle selection, sharing, localStorage
api/
  KClip.Api/
    Controllers/ # REST API endpoints
    Models/      # C# data models (Firestore-mapped)
    Services/    # Repository, leaderboard, aggregation
    Auth/        # Firebase JWT validation
public/          # Static assets (icons, favicon)
```

## License

ISC
