using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class PuzzleResult
{
    [FirestoreProperty("displayName")]
    public string DisplayName { get; set; } = "";

    [FirestoreProperty("guessCount")]
    public int GuessCount { get; set; }

    [FirestoreProperty("status")]
    public string Status { get; set; } = ""; // won | lost

    [FirestoreProperty("completedAt")]
    public string CompletedAt { get; set; } = "";
}
