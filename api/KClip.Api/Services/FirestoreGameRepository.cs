using Google.Cloud.Firestore;
using KClip.Api.Models;

namespace KClip.Api.Services;

public class FirestoreGameRepository : IGameRepository
{
    private readonly FirestoreDb _db;

    public FirestoreGameRepository(FirestoreDb db)
    {
        _db = db;
    }

    // --- Game State ---

    public async Task<GameState?> GetGameState(string uid, string date)
    {
        var doc = await _db.Collection("users").Document(uid)
            .Collection("games").Document(date).GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<GameState>() : null;
    }

    public async Task SaveGameState(string uid, GameState state)
    {
        await _db.Collection("users").Document(uid)
            .Collection("games").Document(state.Date)
            .SetAsync(state);
    }

    public async Task<List<GameState>> GetAllGameStates(string uid)
    {
        var snapshot = await _db.Collection("users").Document(uid)
            .Collection("games").GetSnapshotAsync();
        return snapshot.Documents
            .Select(d => d.ConvertTo<GameState>())
            .ToList();
    }

    // --- Stats ---

    public async Task<StatsRecord?> GetStats(string uid)
    {
        var doc = await _db.Collection("users").Document(uid)
            .Collection("data").Document("stats").GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<StatsRecord>() : null;
    }

    public async Task SaveStats(string uid, StatsRecord stats)
    {
        await _db.Collection("users").Document(uid)
            .Collection("data").Document("stats")
            .SetAsync(stats);
    }

    // --- Puzzle Results ---

    public async Task SubmitResult(string uid, string date, PuzzleResult result)
    {
        await _db.Collection("puzzles").Document(date)
            .Collection("results").Document(uid)
            .SetAsync(result);
    }

    public async Task<List<PuzzleResult>> GetResultsForDate(string date)
    {
        var snapshot = await _db.Collection("puzzles").Document(date)
            .Collection("results").GetSnapshotAsync();
        return snapshot.Documents
            .Select(d => d.ConvertTo<PuzzleResult>())
            .ToList();
    }

    public async Task<PuzzleSummary?> GetPuzzleSummary(string date)
    {
        var doc = await _db.Collection("puzzles").Document(date)
            .Collection("data").Document("summary").GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<PuzzleSummary>() : null;
    }

    public async Task SavePuzzleSummary(string date, PuzzleSummary summary)
    {
        await _db.Collection("puzzles").Document(date)
            .Collection("data").Document("summary")
            .SetAsync(summary);
    }

    // --- User Profiles ---

    public async Task<UserProfile?> GetProfile(string uid)
    {
        var doc = await _db.Collection("users").Document(uid)
            .Collection("data").Document("profile").GetSnapshotAsync();
        return doc.Exists ? doc.ConvertTo<UserProfile>() : null;
    }

    public async Task SaveProfile(string uid, UserProfile profile)
    {
        await _db.Collection("users").Document(uid)
            .Collection("data").Document("profile")
            .SetAsync(profile);
    }

    // --- All User Stats (for leaderboard) ---

    public async Task<List<(string Uid, StatsRecord Stats, UserProfile? Profile)>> GetAllUserStats()
    {
        var usersSnapshot = await _db.Collection("users").GetSnapshotAsync();
        var results = new List<(string, StatsRecord, UserProfile?)>();

        foreach (var userDoc in usersSnapshot.Documents)
        {
            var statsDoc = await userDoc.Reference
                .Collection("data").Document("stats").GetSnapshotAsync();
            if (!statsDoc.Exists) continue;

            var stats = statsDoc.ConvertTo<StatsRecord>();
            var profileDoc = await userDoc.Reference
                .Collection("data").Document("profile").GetSnapshotAsync();
            var profile = profileDoc.Exists ? profileDoc.ConvertTo<UserProfile>() : null;

            results.Add((userDoc.Id, stats, profile));
        }

        return results;
    }
}
