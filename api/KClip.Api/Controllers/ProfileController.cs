using System.Security.Claims;
using KClip.Api.Auth;
using KClip.Api.Models;
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

    [HttpGet]
    public async Task<ActionResult<ProfileResponse>> GetProfile()
    {
        var uid = User.GetUid();
        var profile = await _repo.GetProfile(uid);
        if (profile is null)
        {
            profile = new UserProfile
            {
                DisplayName = User.GetDisplayName() ?? User.FindFirst(ClaimTypes.Email)?.Value ?? "Anonymous",
                PhotoURL = User.GetPhotoURL(),
                CreatedAt = DateTime.UtcNow.ToString("o"),
            };
            await _repo.SaveProfile(uid, profile);
        }
        return Ok(new ProfileResponse
        {
            DisplayName = profile.DisplayName,
            PhotoURL = profile.PhotoURL,
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var uid = User.GetUid();
        var profile = await _repo.GetProfile(uid);
        if (profile is null)
        {
            profile = new UserProfile
            {
                CreatedAt = DateTime.UtcNow.ToString("o"),
            };
        }

        if (request.DisplayName is not null)
        {
            var trimmed = request.DisplayName.Trim();
            if (trimmed.Length == 0 || trimmed.Length > 30)
                return BadRequest("Display name must be 1-30 characters.");
            profile.DisplayName = trimmed;
        }

        await _repo.SaveProfile(uid, profile);
        return NoContent();
    }

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
