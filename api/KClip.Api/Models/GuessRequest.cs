namespace KClip.Api.Models;

public class GuessRequest
{
    public required string SongId { get; set; }
    public List<string> PreviousGuessIds { get; set; } = [];
}

public class GuessResponse
{
    public required string Result { get; set; } // "correct" | "partial" | "incorrect"
    public SongAnswer? Answer { get; set; }
}

public class SongAnswer
{
    public required string SongId { get; set; }
    public required string Title { get; set; }
    public required string Artist { get; set; }
}
