namespace KClip.Api.Models;

public class CompleteGameRequest
{
    public string DisplayName { get; set; } = "";
    public int GuessCount { get; set; }
    public string Status { get; set; } = ""; // won | lost
}
