using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/leaderboard")]
[Authorize]
public class LeaderboardController : ControllerBase
{
    private readonly LeaderboardService _leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService)
    {
        _leaderboardService = leaderboardService;
    }

    [HttpGet]
    [ResponseCache(Duration = 60)]
    public async Task<ActionResult<List<LeaderboardEntry>>> GetLeaderboard(
        [FromQuery] int limit = 50)
    {
        var entries = await _leaderboardService.GetLeaderboard(limit);
        return Ok(entries);
    }
}
