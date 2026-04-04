using KClip.Api.Auth;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KClip.Api.Controllers;

[ApiController]
[Route("api/account")]
[Authorize]
public class AccountController : ControllerBase
{
    private readonly IGameRepository _repo;

    public AccountController(IGameRepository repo)
    {
        _repo = repo;
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var uid = User.GetUid();
        await _repo.DeleteAllUserData(uid);
        return NoContent();
    }
}
