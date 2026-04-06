using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/puzzles")]
[Authorize]
public class PuzzlesController : ControllerBase
{
    private readonly IGameRepository _repo;

    public PuzzlesController(IGameRepository repo)
    {
        _repo = repo;
    }

    [HttpGet("{date}/summary")]
    [ResponseCache(Duration = 30)]
    public async Task<ActionResult<PuzzleSummary>> GetSummary(string date)
    {
        var summary = await _repo.GetPuzzleSummary(date);
        return summary is null ? Ok(new PuzzleSummary()) : Ok(summary);
    }
}
