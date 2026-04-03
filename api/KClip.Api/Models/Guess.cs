using Google.Cloud.Firestore;

namespace KClip.Api.Models;

[FirestoreData]
public class Guess
{
    [FirestoreProperty("songId")]
    public string SongId { get; set; } = "";

    [FirestoreProperty("result")]
    public string Result { get; set; } = ""; // correct | partial | incorrect | skipped
}
