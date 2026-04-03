using KClip.Api.Auth;
using KClip.Api.Models;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/migrate")]
[Authorize]
public class MigrationController : ControllerBase
{
    private readonly IGameRepository _repo;

    public MigrationController(IGameRepository repo)
    {
        _repo = repo;
    }

    [HttpPost]
    public async Task<IActionResult> Migrate([FromBody] MigrationRequest request)
    {
        var uid = User.GetUid();

        // Save game states — Firestore wins for dates that already exist
        var existingGames = await _repo.GetAllGameStates(uid);
        var existingDates = existingGames.Select(g => g.Date).ToHashSet();

        foreach (var game in request.Games)
        {
            if (!existingDates.Contains(game.Date))
            {
                await _repo.SaveGameState(uid, game);
            }
        }

        // Save stats — only if no stats exist yet in Firestore
        var existingStats = await _repo.GetStats(uid);
        if (existingStats is null && request.Stats is not null)
        {
            await _repo.SaveStats(uid, request.Stats);
        }

        // Upsert profile from auth claims
        var profile = await _repo.GetProfile(uid);
        if (profile is null)
        {
            await _repo.SaveProfile(uid, new UserProfile
            {
                DisplayName = User.GetDisplayName() ?? "Anonymous",
                PhotoURL = User.GetPhotoURL(),
                CreatedAt = DateTime.UtcNow.ToString("o"),
            });
        }

        return Ok(new { migrated = true });
    }
}
