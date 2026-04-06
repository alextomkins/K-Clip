using KClip.Api.Models;

namespace KClip.Api.Services;

public interface IGameRepository
{
    // Game state
    Task<GameState?> GetGameState(string uid, string date);
    Task SaveGameState(string uid, GameState state);
    Task<List<GameState>> GetAllGameStates(string uid);

    // Stats
    Task<StatsRecord?> GetStats(string uid);
    Task SaveStats(string uid, StatsRecord stats);

    // Puzzle results (individual + aggregation)
    Task SubmitResult(string uid, string date, PuzzleResult result);
    Task<List<PuzzleResult>> GetResultsForDate(string date);
    Task<PuzzleSummary?> GetPuzzleSummary(string date);
    Task SavePuzzleSummary(string date, PuzzleSummary summary);

    // User profiles
    Task<UserProfile?> GetProfile(string uid);
    Task SaveProfile(string uid, UserProfile profile);

    // All user stats (for leaderboard)
    Task<List<(string Uid, StatsRecord Stats, UserProfile? Profile)>> GetAllUserStats();

    // Account deletion
    Task DeleteAllUserData(string uid);
}
