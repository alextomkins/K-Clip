namespace KClip.Api.Models;

public class MigrationRequest
{
    public List<GameState> Games { get; set; } = [];
    public StatsRecord? Stats { get; set; }
}
