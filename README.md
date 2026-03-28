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

- 🎶 **143 K-pop tracks** across ~30 artists
- 📅 **New puzzle every day** at midnight AEST
- 🗂️ **Puzzle archive** — browse and play any past day
- 📊 **Stats tracking** — win %, streaks, guess distribution
- 📋 **Shareable results** — copy your score to clipboard
- 🎉 **Confetti** on a correct guess
- 📱 **Mobile-first** responsive design

## Tech Stack

- **React 19** + **TypeScript 5**
- **Vite** for builds
- **Tailwind CSS 3** for styling
- **GitHub Pages** for hosting

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Lint
npm run lint

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Project Structure

```
src/
  components/    # React UI components
  data/          # Song list
  hooks/         # Custom React hooks (audio, game state, countdown)
  types/         # TypeScript type definitions
  utils/         # Puzzle selection, sharing, localStorage
public/
  audio/         # 30-second MP3 clips
```

## License

ISC
