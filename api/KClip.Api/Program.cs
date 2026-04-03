using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using KClip.Api.Auth;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

// Firebase Admin SDK
var projectId = builder.Configuration["GOOGLE_CLOUD_PROJECT"]
    ?? Environment.GetEnvironmentVariable("GOOGLE_CLOUD_PROJECT")
    ?? throw new InvalidOperationException("GOOGLE_CLOUD_PROJECT not configured");

if (FirebaseApp.DefaultInstance is null)
{
    FirebaseApp.Create(new AppOptions
    {
        Credential = GoogleCredential.GetApplicationDefault(),
        ProjectId = projectId,
    });
}

// Firestore
var firestoreDb = new FirestoreDbBuilder { ProjectId = projectId }.Build();
builder.Services.AddSingleton(firestoreDb);

// Repository + services
builder.Services.AddScoped<IGameRepository, FirestoreGameRepository>();
builder.Services.AddScoped<PuzzleSummaryService>();
builder.Services.AddScoped<LeaderboardService>();

// Auth
builder.Services.AddAuthentication(FirebaseAuthHandler.SchemeName)
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthHandler>(
        FirebaseAuthHandler.SchemeName, null);
builder.Services.AddAuthorization();

// CORS (temporary while on GitHub Pages)
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["https://alextomkins.github.io", "http://localhost:5173"];

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
