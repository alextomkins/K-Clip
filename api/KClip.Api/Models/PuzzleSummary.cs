using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class PuzzleSummary
{
    [FirestoreProperty("totalPlays")]
    public int TotalPlays { get; set; }

    [FirestoreProperty("totalGuesses")]
    public int TotalGuesses { get; set; }

    [FirestoreProperty("avgGuesses")]
    public double AvgGuesses { get; set; }

    [FirestoreProperty("winCount")]
    public int WinCount { get; set; }

    [FirestoreProperty("distribution")]
    public Dictionary<string, int> Distribution { get; set; } = [];
}
