using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/dev/seed")]
public class SeedController : ControllerBase
{
    private readonly IGameRepository _repo;
    private readonly PuzzleSummaryService _summaryService;
    private readonly IWebHostEnvironment _env;

    public SeedController(
        IGameRepository repo,
        PuzzleSummaryService summaryService,
        IWebHostEnvironment env)
    {
        _repo = repo;
        _summaryService = summaryService;
        _env = env;
    }

    [HttpPost]
    public async Task<IActionResult> Seed()
    {
        if (!_env.IsDevelopment())
            return NotFound();

        // Today in AEST (UTC+10)
        var today = DateTimeOffset.UtcNow
            .ToOffset(TimeSpan.FromHours(10))
            .ToString("yyyy-MM-dd");

        var testUsers = new[]
        {
            ("seed-user-1", "Alice Kim",    8, 7, 4, 12),
            ("seed-user-2", "Bob Park",    15, 12, 3, 6),
            ("seed-user-3", "Claire Lee",  10, 9, 5, 5),
            ("seed-user-4", "David Cho",   20, 14, 2, 8),
            ("seed-user-5", "Ella Song",    6, 5, 3, 3),
            ("seed-user-6", "Frank Yoon",  12, 8, 1, 4),
            ("seed-user-7", "Grace Han",   18, 16, 7, 9),
        };

        var rng = new Random(42);

        foreach (var (uid, name, played, wins, currentStreak, maxStreak) in testUsers)
        {
            // Profile
            await _repo.SaveProfile(uid, new UserProfile
            {
                DisplayName = name,
                PhotoURL = null,
                CreatedAt = DateTime.UtcNow.AddDays(-30).ToString("o"),
            });

            // Stats with realistic distribution
            var dist = new Dictionary<string, int>
            {
                ["1"] = rng.Next(0, 3),
                ["2"] = rng.Next(1, 4),
                ["3"] = rng.Next(2, 6),
                ["4"] = rng.Next(1, 4),
                ["5"] = rng.Next(0, 3),
                ["6"] = rng.Next(0, 2),
                ["X"] = played - wins,
            };
            // Adjust wins to match distribution sum
            var distWins = dist.Where(kv => kv.Key != "X").Sum(kv => kv.Value);
            dist["3"] += wins - distWins; // absorb the difference into guess-3 bucket
            if (dist["3"] < 0) dist["3"] = 0;

            await _repo.SaveStats(uid, new StatsRecord
            {
                Played = played,
                Wins = wins,
                CurrentStreak = currentStreak,
                MaxStreak = maxStreak,
                GuessDistribution = dist,
                LastPlayedDate = today,
                LastWonDate = today,
            });

            // Submit a puzzle result for today
            var guessCount = rng.Next(1, 7);
            var status = rng.NextDouble() < 0.75 ? "won" : "lost";
            await _repo.SubmitResult(uid, today, new PuzzleResult
            {
                DisplayName = name,
                GuessCount = status == "won" ? guessCount : 6,
                Status = status,
                CompletedAt = DateTime.UtcNow.ToString("o"),
            });
        }

        // Recompute today's puzzle summary
        var summary = await _summaryService.RecomputeSummary(today);

        return Ok(new
        {
            message = "Seeded test data",
            date = today,
            usersSeeded = testUsers.Length,
            puzzleSummary = summary,
        });
    }
}
