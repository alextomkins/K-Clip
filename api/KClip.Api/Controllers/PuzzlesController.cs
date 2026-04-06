using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/puzzles")]
public class PuzzlesController(IGameRepository repo) : ControllerBase
{
    private readonly IGameRepository _repo = repo;

    [HttpGet("{date}/summary")]
    [ResponseCache(Duration = 30)]
    public async Task<ActionResult<PuzzleSummary>> GetSummary(string date)
    {
        var summary = await _repo.GetPuzzleSummary(date);
        return summary is null ? Ok(new PuzzleSummary()) : Ok(summary);
    }
}
