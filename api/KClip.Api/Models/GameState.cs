using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class GameState
{
    [FirestoreProperty("date")]
    public string Date { get; set; } = "";

    [FirestoreProperty("guesses")]
    public List<Guess> Guesses { get; set; } = [];

    [FirestoreProperty("status")]
    public string Status { get; set; } = "playing"; // playing | won | lost

    [FirestoreProperty("completedAt")]
    public string? CompletedAt { get; set; }
}
