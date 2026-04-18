using KClip.Api.Auth;
using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController(LeaderboardService leaderboardService) : ControllerBase
{
    private readonly LeaderboardService _leaderboardService = leaderboardService;

    [HttpGet]
    [ResponseCache(Duration = 60, VaryByQueryKeys = ["limit"], VaryByHeader = "Authorization")]
    public async Task<ActionResult<LeaderboardResponse>> GetLeaderboard(
        [FromQuery] int limit = 10)
    {
        var uid = User.Identity?.IsAuthenticated == true ? User.GetUid() : null;
        var response = await _leaderboardService.GetLeaderboard(uid, limit);
        return Ok(response);
    }
}
