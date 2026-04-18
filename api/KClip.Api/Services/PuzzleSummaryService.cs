using KClip.Api.Models;

namespace KClip.Api.Services;

public class PuzzleSummaryService(IGameRepository repo)
{
    private readonly IGameRepository _repo = repo;

    public async Task<PuzzleSummary> RecomputeSummary(string date)
    {
        var results = await _repo.GetResultsForDate(date);

        if (results.Count == 0)
        {
            return new PuzzleSummary();
        }

        var summary = new PuzzleSummary
        {
            TotalPlays = results.Count,
            TotalGuesses = results.Sum(r => r.GuessCount),
            AvgGuesses = results.Average(r => (double)r.GuessCount),
            WinCount = results.Count(r => r.Status == "won"),
            Distribution = results
                .GroupBy(r => r.Status == "won" ? r.GuessCount.ToString() : "X")
                .ToDictionary(g => g.Key, g => g.Count())
        };

        await _repo.SavePuzzleSummary(date, summary);
        return summary;
    }
}
