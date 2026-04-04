using KClip.Api.Models;

namespace KClip.Api.Services;

public class LeaderboardService
{
    private readonly IGameRepository _repo;
    public const int MinGamesPlayed = 5;

    public LeaderboardService(IGameRepository repo)
    {
        _repo = repo;
    }

    public async Task<LeaderboardResponse> GetLeaderboard(string currentUid, int limit = 50)
    {
        var allStats = await _repo.GetAllUserStats();

        // Build ranked list from all qualifying users
        var allRanked = allStats
            .Where(s => s.Stats.Played >= MinGamesPlayed)
            .Select(s => BuildEntry(s))
            .OrderByDescending(e => e.WinPct)
            .ThenBy(e => e.AvgGuesses)
            .ThenByDescending(e => e.MaxStreak)
            .ThenByDescending(e => e.Played)
            .Select((e, i) => { e.Rank = i + 1; return e; })
            .ToList();

        var topEntries = allRanked.Take(limit).ToList();

        // Find current user — either in the ranked list or build an unqualified entry
        var currentUserEntry = allRanked.FirstOrDefault(e => e.Uid == currentUid);
        if (currentUserEntry is null)
        {
            // User doesn't qualify — build their entry anyway (rank = 0 means unranked)
            var userData = allStats.FirstOrDefault(s => s.Uid == currentUid);
            if (userData.Stats is not null)
            {
                currentUserEntry = BuildEntry(userData);
                currentUserEntry.Rank = 0; // indicates not ranked
            }
        }

        return new LeaderboardResponse
        {
            Entries = topEntries,
            CurrentUser = currentUserEntry,
        };
    }

    private static LeaderboardEntry BuildEntry(
        (string Uid, StatsRecord Stats, UserProfile? Profile) s)
    {
        var winPct = s.Stats.Played > 0
            ? (double)s.Stats.Wins / s.Stats.Played * 100
            : 0;

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
    }
}
