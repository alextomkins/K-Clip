using KClip.Api.Auth;
using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/stats")]
[Authorize]
public class StatsController : ControllerBase
{
    private readonly IGameRepository _repo;

    public StatsController(IGameRepository repo)
    {
        _repo = repo;
    }

    [HttpGet]
    public async Task<ActionResult<StatsRecord>> GetStats()
    {
        var uid = User.GetUid();
        var stats = await _repo.GetStats(uid);
        return stats is null ? Ok(new StatsRecord()) : Ok(stats);
    }

    [HttpPut]
    public async Task<IActionResult> SaveStats([FromBody] StatsRecord stats)
    {
        var uid = User.GetUid();
        await _repo.SaveStats(uid, stats);
        return NoContent();
    }
}
