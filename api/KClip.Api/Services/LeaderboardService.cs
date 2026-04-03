using KClip.Api.Models;

namespace KClip.Api.Services;

public class LeaderboardService
{
    private readonly IGameRepository _repo;
    private const int MinGamesPlayed = 5;

    public LeaderboardService(IGameRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<LeaderboardEntry>> GetLeaderboard(int limit = 50)
    {
        var allStats = await _repo.GetAllUserStats();

        var ranked = allStats
            .Where(s => s.Stats.Played >= MinGamesPlayed)
            .Select(s =>
            {
                var winPct = s.Stats.Played > 0
                    ? (double)s.Stats.Wins / s.Stats.Played * 100
                    : 0;

                // Compute average guesses across wins only
                var winDistribution = s.Stats.GuessDistribution
                    .Where(kv => kv.Key != "X" && kv.Value > 0);
                var totalWinGuesses = winDistribution.Sum(kv => int.Parse(kv.Key) * kv.Value);
                var totalWins = winDistribution.Sum(kv => kv.Value);
                var avgGuesses = totalWins > 0 ? (double)totalWinGuesses / totalWins : 0;

                return new LeaderboardEntry
                {
                    Uid = s.Uid,
                    DisplayName = s.Profile?.DisplayName ?? "Anonymous",
                    PhotoURL = s.Profile?.PhotoURL,
                    Played = s.Stats.Played,
                    Wins = s.Stats.Wins,
                    WinPct = Math.Round(winPct, 1),
                    CurrentStreak = s.Stats.CurrentStreak,
                    MaxStreak = s.Stats.MaxStreak,
                    AvgGuesses = Math.Round(avgGuesses, 2),
                };
            })
            .OrderByDescending(e => e.WinPct)
            .ThenBy(e => e.AvgGuesses)
            .ThenByDescending(e => e.MaxStreak)
            .ThenByDescending(e => e.Played)
            .Take(limit)
            .Select((e, i) =>
            {
                e.Rank = i + 1;
                return e;
            })
            .ToList();

        return ranked;
    }
}
