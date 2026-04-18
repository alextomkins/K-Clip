using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/puzzles")]
public class PuzzlesController(IGameRepository repo) : ControllerBase
{
    private const int MaxGuesses = 6;
    private readonly IGameRepository _repo = repo;

    [HttpGet("{date}/summary")]
    [ResponseCache(Duration = 30)]
    public async Task<ActionResult<PuzzleSummary>> GetSummary(string date)
    {
        var summary = await _repo.GetPuzzleSummary(date);
        return summary is null ? Ok(new PuzzleSummary()) : Ok(summary);
    }

    [HttpPost("{date}/guess")]
    [EnableRateLimiting("guess")]
    public ActionResult<GuessResponse> SubmitGuess(string date, [FromBody] GuessRequest request)
    {
        // Validate date format
        if (!DateOnly.TryParse(date, out _))
            return BadRequest("Invalid date format");

        // Reject future dates (AEST)
        var todayAest = PuzzleService.GetTodayAest();
        if (string.Compare(date, todayAest, StringComparison.Ordinal) > 0)
            return BadRequest("Cannot guess for future puzzles");

        // Validate songId exists (empty string = skip)
        if (request.SongId != "" && !PuzzleService.SongLookup.ContainsKey(request.SongId))
            return BadRequest("Unknown songId");

        // Validate previous guesses
        if (request.PreviousGuessIds.Count >= MaxGuesses)
            return BadRequest("Maximum guesses already reached");

        foreach (var prevId in request.PreviousGuessIds)
        {
            if (!PuzzleService.SongLookup.ContainsKey(prevId) && prevId != "")
                return BadRequest($"Unknown songId in previousGuessIds: {prevId}");
        }

        // Check none of the previous guesses were correct (game would have ended)
        var answer = PuzzleService.GetPuzzleSong(date);
        foreach (var prevId in request.PreviousGuessIds)
        {
            if (prevId == answer.Id)
                return BadRequest("Game already completed — a previous guess was correct");
        }

        // Evaluate the current guess (skip = incorrect)
        var result = request.SongId == "" ? "incorrect" : PuzzleService.EvaluateGuess(request.SongId, answer);
        var guessCount = request.PreviousGuessIds.Count + 1;
        var isGameOver = result == "correct" || guessCount >= MaxGuesses;

        var response = new GuessResponse { Result = result };

        if (isGameOver)
        {
            response.Answer = new SongAnswer
            {
                SongId = answer.Id,
                Title = answer.Title,
                Artist = answer.Artist,
            };
        }

        return Ok(response);
    }
}
