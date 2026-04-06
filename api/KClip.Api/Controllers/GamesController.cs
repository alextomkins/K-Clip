using KClip.Api.Auth;
using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/games")]
[Authorize]
public class GamesController : ControllerBase
{
    private readonly IGameRepository _repo;
    private readonly PuzzleSummaryService _summaryService;

    public GamesController(IGameRepository repo, PuzzleSummaryService summaryService)
    {
        _repo = repo;
        _summaryService = summaryService;
    }

    [HttpGet("{date}")]
    public async Task<ActionResult<GameState>> GetGameState(string date)
    {
        var uid = User.GetUid();
        var state = await _repo.GetGameState(uid, date);
        return state is null ? NotFound() : Ok(state);
    }

    [HttpPut("{date}")]
    public async Task<IActionResult> SaveGameState(string date, [FromBody] GameState state)
    {
        if (state.Date != date)
            return BadRequest("Date in body must match URL");

        var uid = User.GetUid();
        await _repo.SaveGameState(uid, state);
        return NoContent();
    }

    [HttpPost("{date}/complete")]
    public async Task<ActionResult<PuzzleSummary>> CompleteGame(
        string date, [FromBody] CompleteGameRequest request)
    {
        var uid = User.GetUid();

        var result = new PuzzleResult
        {
            DisplayName = request.DisplayName,
            GuessCount = request.GuessCount,
            Status = request.Status,
            CompletedAt = DateTime.UtcNow.ToString("o"),
        };

        await _repo.SubmitResult(uid, date, result);

        var summary = await _summaryService.RecomputeSummary(date);
        return Ok(summary);
    }
}
