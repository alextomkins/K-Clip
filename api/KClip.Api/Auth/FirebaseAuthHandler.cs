using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;

namespace KClip.Api.Auth;

public class FirebaseAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Firebase";

    public FirebaseAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
            return AuthenticateResult.NoResult();

        var token = authHeader.ToString();
        if (!token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.NoResult();

        token = token["Bearer ".Length..].Trim();

        try
        {
            var firebaseToken = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(token);

            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, firebaseToken.Uid),
                new("uid", firebaseToken.Uid),
            };

            if (firebaseToken.Claims.TryGetValue("name", out var name) && name is string nameStr)
                claims.Add(new Claim(ClaimTypes.Name, nameStr));

            if (firebaseToken.Claims.TryGetValue("email", out var email) && email is string emailStr)
                claims.Add(new Claim(ClaimTypes.Email, emailStr));

            if (firebaseToken.Claims.TryGetValue("picture", out var picture) && picture is string pictureStr)
                claims.Add(new Claim("picture", pictureStr));

            var identity = new ClaimsIdentity(claims, SchemeName);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, SchemeName);

            return AuthenticateResult.Success(ticket);
        }
        catch (FirebaseAuthException)
        {
            return AuthenticateResult.Fail("Invalid Firebase token");
        }
    }
}

public static class ClaimsPrincipalExtensions
{
    public static string GetUid(this ClaimsPrincipal user)
        => user.FindFirstValue("uid")
           ?? throw new InvalidOperationException("User UID not found in claims");

    public static string? GetDisplayName(this ClaimsPrincipal user)
        => user.FindFirstValue(ClaimTypes.Name);

    public static string? GetPhotoURL(this ClaimsPrincipal user)
        => user.FindFirstValue("picture");
}
