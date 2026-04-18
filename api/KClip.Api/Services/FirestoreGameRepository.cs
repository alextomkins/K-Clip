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
        // Use CollectionGroup to find all "stats" docs under users/{uid}/data/stats.
        // This avoids relying on the parent users/{uid} document existing.
        var statsSnapshots = await _db.CollectionGroup("data").GetSnapshotAsync();
        var userIds = new HashSet<string>();
        var statsByUid = new Dictionary<string, StatsRecord>();
        var profilesByUid = new Dictionary<string, UserProfile>();

        foreach (var doc in statsSnapshots.Documents)
        {
            // Path: users/{uid}/data/{docId}
            var pathParts = doc.Reference.Path.Split('/');
            if (pathParts.Length < 4) continue;
            if (pathParts[^2] != "data" || pathParts[^4] != "users") continue;
            var uid = pathParts[^3];

            userIds.Add(uid);

            if (doc.Id == "stats")
            {
                statsByUid[uid] = doc.ConvertTo<StatsRecord>();
            }
            else if (doc.Id == "profile")
            {
                profilesByUid[uid] = doc.ConvertTo<UserProfile>();
            }
        }

        return userIds
            .Where(statsByUid.ContainsKey)
            .Select(uid => (
                uid,
                statsByUid[uid],
                profilesByUid.GetValueOrDefault(uid)
            ))
            .ToList();
    }

    // --- Account Deletion ---

    public async Task DeleteAllUserData(string uid)
    {
        var userRef = _db.Collection("users").Document(uid);

        // Delete games subcollection
        await DeleteCollection(userRef.Collection("games"));

        // Delete data subcollection (stats, profile)
        await DeleteCollection(userRef.Collection("data"));

        // Delete the user document itself
        await userRef.DeleteAsync();

        // Note: puzzle results (puzzles/{date}/results/{uid}) are left intact
        // to preserve aggregate puzzle summaries.
    }

    private static async Task DeleteCollection(CollectionReference collection)
    {
        var snapshot = await collection.GetSnapshotAsync();
        foreach (var doc in snapshot.Documents)
        {
            await doc.Reference.DeleteAsync();
        }
    }
}
