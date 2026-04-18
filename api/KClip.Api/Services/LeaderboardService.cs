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

    public async Task<LeaderboardResponse> GetLeaderboard(string? currentUid, int limit = 50)
    {
        var allStats = await _repo.GetAllUserStats();

        // Build ranked list from all qualifying users (including hidden)
        var allRanked = allStats
            .Where(s => s.Stats.Played >= MinGamesPlayed)
            .Select(BuildEntry)
            .OrderByDescending(e => e.WinPct)
            .ThenBy(e => e.AvgGuesses)
            .ThenByDescending(e => e.MaxStreak)
            .ThenByDescending(e => e.Played)
            .Select((e, i) => { e.Rank = i + 1; return e; })
            .ToList();

        // Public entries exclude hidden users, then re-rank for display
        var visibleRanked = allRanked
            .Where(e =>
            {
                var (Uid, Stats, Profile) = allStats.First(s => s.Uid == e.Uid);
                return !(Profile?.HideFromLeaderboard ?? false);
            })
            .Select((e, i) => { var copy = CloneEntry(e); copy.Rank = i + 1; return copy; })
            .ToList();

        var topEntries = visibleRanked.Take(limit).ToList();

        // Find current user — use the full ranking (including hidden) for true rank
        var currentUserEntry = allRanked.FirstOrDefault(e => e.Uid == currentUid);
        var currentUserHidden = false;

        if (currentUserEntry is null)
        {
            // User doesn't qualify — build their entry anyway (rank = 0 means unranked)
            var userData = allStats.FirstOrDefault(s => s.Uid == currentUid);
            if (userData.Stats is not null)
            {
                currentUserEntry = BuildEntry(userData);
                currentUserEntry.Rank = 0;
            }
            currentUserHidden = userData.Profile?.HideFromLeaderboard ?? false;
        }
        else
        {
            var userData = allStats.First(s => s.Uid == currentUid);
            currentUserHidden = userData.Profile?.HideFromLeaderboard ?? false;
        }

        return new LeaderboardResponse
        {
            Entries = topEntries,
            CurrentUser = currentUserEntry,
            CurrentUserHidden = currentUserHidden,
        };
    }

    private static LeaderboardEntry CloneEntry(LeaderboardEntry e)
    {
        return new LeaderboardEntry
        {
            Uid = e.Uid,
            DisplayName = e.DisplayName,
            PhotoURL = e.PhotoURL,
            Played = e.Played,
            Wins = e.Wins,
            WinPct = e.WinPct,
            CurrentStreak = e.CurrentStreak,
            MaxStreak = e.MaxStreak,
            AvgGuesses = e.AvgGuesses,
            Rank = e.Rank,
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
