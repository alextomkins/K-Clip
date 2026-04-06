using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class StatsRecord
{
    [FirestoreProperty("played")]
    public int Played { get; set; }

    [FirestoreProperty("wins")]
    public int Wins { get; set; }

    [FirestoreProperty("currentStreak")]
    public int CurrentStreak { get; set; }

    [FirestoreProperty("maxStreak")]
    public int MaxStreak { get; set; }

    [FirestoreProperty("guessDistribution")]
    public Dictionary<string, int> GuessDistribution { get; set; } = new()
    {
        ["1"] = 0, ["2"] = 0, ["3"] = 0,
        ["4"] = 0, ["5"] = 0, ["6"] = 0, ["X"] = 0
    };

    [FirestoreProperty("lastPlayedDate")]
    public string? LastPlayedDate { get; set; }

    [FirestoreProperty("lastWonDate")]
    public string? LastWonDate { get; set; }
}
