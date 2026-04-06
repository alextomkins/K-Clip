using KClip.Api.Auth;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(IGameRepository repo) : ControllerBase
{
    private readonly IGameRepository _repo = repo;

    [HttpGet("visibility")]
    public async Task<ActionResult<VisibilityResponse>> GetVisibility()
    {
        var uid = User.GetUid();
        var profile = await _repo.GetProfile(uid);
        return Ok(new VisibilityResponse { Visible = !(profile?.HideFromLeaderboard ?? false) });
    }

    [HttpPut("visibility")]
    public async Task<IActionResult> SetVisibility([FromBody] VisibilityRequest request)
    {
        var uid = User.GetUid();
        var profile = await _repo.GetProfile(uid);
        if (profile is null)
            return NotFound("Profile not found");

        profile.HideFromLeaderboard = !request.Visible;
        await _repo.SaveProfile(uid, profile);
        return NoContent();
    }
}

public class VisibilityRequest
{
    public bool Visible { get; set; }
}

public class VisibilityResponse
{
    public bool Visible { get; set; }
}
