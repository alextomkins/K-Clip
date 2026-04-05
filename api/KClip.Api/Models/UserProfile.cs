using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class UserProfile
{
    [FirestoreProperty("displayName")]
    public string DisplayName { get; set; } = "";

    [FirestoreProperty("photoURL")]
    public string? PhotoURL { get; set; }

    [FirestoreProperty("createdAt")]
    public string CreatedAt { get; set; } = "";

    [FirestoreProperty("hideFromLeaderboard")]
    public bool HideFromLeaderboard { get; set; } = false;
}
