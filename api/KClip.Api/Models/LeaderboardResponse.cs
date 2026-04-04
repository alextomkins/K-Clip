namespace KClip.Api.Models;

public class LeaderboardResponse
{
    public List<LeaderboardEntry> Entries { get; set; } = [];
    public LeaderboardEntry? CurrentUser { get; set; }
}
