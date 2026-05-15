using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Google.Cloud.Firestore;
using KClip.Api.Auth;
using KClip.Api.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.RateLimiting;

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
var firestoreDbId = builder.Configuration["FIRESTORE_DATABASE_ID"]
    ?? Environment.GetEnvironmentVariable("FIRESTORE_DATABASE_ID")
    ?? "(default)";
var firestoreDb = new FirestoreDbBuilder { ProjectId = projectId, DatabaseId = firestoreDbId }.Build();
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

builder.Services.AddResponseCaching();
builder.Services.AddControllers();

// Rate limiting: 50 requests per minute per IP for guess/answer endpoints
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("guess", limiter =>
    {
        limiter.PermitLimit = 50;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Paste your Firebase ID token here",
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer",
                },
            },
            Array.Empty<string>()
        },
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseResponseCaching();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
