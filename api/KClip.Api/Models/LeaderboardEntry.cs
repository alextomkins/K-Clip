namespace KClip.Api.Models;

public class LeaderboardEntry
{
    public string Uid { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public string? PhotoURL { get; set; }
    public int Played { get; set; }
    public int Wins { get; set; }
    public double WinPct { get; set; }
    public int CurrentStreak { get; set; }
    public int MaxStreak { get; set; }
    public double AvgGuesses { get; set; }
    public int Rank { get; set; }
}
