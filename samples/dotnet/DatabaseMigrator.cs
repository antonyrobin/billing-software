// =============================================================================
// DatabaseMigrator/Program.cs
//
// Database Migration Orchestrator
//
// This console application runs as a Kubernetes Job before each service
// deployment. It orchestrates two migration tools:
//
//   Tool 1: EF Core Migrations
//     → Manages structural schema changes (tables, columns, indexes, FKs)
//     → Tracked in: _migrations.__EFMigrationsHistory
//
//   Tool 2: DbUp
//     → Manages SQL scripts: views, functions, procedures, triggers, RLS, seeds
//     → Versioned scripts (V*.sql): run once, never re-applied
//     → Rerunnable scripts (R*.sql): run on every deployment (must be idempotent)
//     → Tracked in: _migrations.schemaversions
//
// Exit codes:
//   0 = success (all migrations applied)
//   1 = failure (Kubernetes Job will mark as failed, blocking service deploy)
//
// Usage:
//   dotnet run                     (uses env var ConnectionStrings__DefaultConnection)
//   dotnet run --dry-run           (show pending migrations without applying)
// =============================================================================

using DbUp;
using DbUp.Engine;
using DbUp.Helpers;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Polly;
using Polly.Retry;
using System.Diagnostics;
using System.Reflection;

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────
var configuration = new ConfigurationBuilder()
    .AddEnvironmentVariables()
    .AddJsonFile("appsettings.json", optional: true)
    .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")}.json",
        optional: true)
    .Build();

using var loggerFactory = LoggerFactory.Create(builder =>
    builder.AddConsole().SetMinimumLevel(LogLevel.Information));

var logger = loggerFactory.CreateLogger<Program>();

// ─────────────────────────────────────────────────────────────────────────────
// Parse arguments
// ─────────────────────────────────────────────────────────────────────────────
bool isDryRun = args.Contains("--dry-run");

logger.LogInformation("==============================================");
logger.LogInformation("  Billing Software – Database Migrator");
logger.LogInformation("  Environment: {Env}", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production");
logger.LogInformation("  Mode: {Mode}", isDryRun ? "DRY RUN" : "APPLY");
logger.LogInformation("==============================================");

var connectionString = configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Missing connection string 'ConnectionStrings__DefaultConnection'. " +
        "Set it as an environment variable or in appsettings.json.");

var stopwatch = Stopwatch.StartNew();

// ─────────────────────────────────────────────────────────────────────────────
// Step 1: Wait for PostgreSQL to be ready (retry with backoff)
// ─────────────────────────────────────────────────────────────────────────────
logger.LogInformation("Step 1/4: Waiting for database connection...");

var retryPolicy = Policy
    .Handle<Exception>()
    .WaitAndRetryAsync(
        retryCount: 10,
        sleepDurationProvider: attempt => TimeSpan.FromSeconds(Math.Pow(2, attempt)),
        onRetry: (exception, delay, attempt, _) =>
        {
            logger.LogWarning(
                "Database not ready (attempt {Attempt}/10). Retrying in {Delay}s. Error: {Message}",
                attempt, delay.TotalSeconds, exception.Message);
        });

await retryPolicy.ExecuteAsync(async () =>
{
    using var connection = new Npgsql.NpgsqlConnection(connectionString);
    await connection.OpenAsync();
    logger.LogInformation("  ✓ Database connection established");
});

// ─────────────────────────────────────────────────────────────────────────────
// Step 2: Ensure _migrations schema exists (prerequisite for tracking tables)
// ─────────────────────────────────────────────────────────────────────────────
logger.LogInformation("Step 2/4: Ensuring _migrations schema exists...");

await EnsureBootstrapAsync(connectionString, logger);

// ─────────────────────────────────────────────────────────────────────────────
// Step 3: Run EF Core migrations
// ─────────────────────────────────────────────────────────────────────────────
logger.LogInformation("Step 3/4: Running EF Core migrations...");

var efMigrationResults = await RunEfCoreMigrationsAsync(connectionString, isDryRun, logger, loggerFactory);
if (!efMigrationResults.Success)
{
    logger.LogCritical("  ✗ EF Core migrations FAILED: {Error}", efMigrationResults.Error);
    return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4: Run DbUp scripts (versioned then rerunnable)
// ─────────────────────────────────────────────────────────────────────────────
logger.LogInformation("Step 4/4: Running DbUp SQL scripts...");

// 4a: Versioned scripts (run once)
var versionedResult = RunDbUpScripts(
    connectionString: connectionString,
    scriptDirectory: "Scripts/Versioned",
    filter: script => script.StartsWith("V"),
    isDryRun: isDryRun,
    logger: logger,
    isRerunnable: false);

if (!versionedResult.Successful)
{
    logger.LogCritical("  ✗ Versioned script FAILED: {Error}", versionedResult.ErrorScript?.Name);
    if (versionedResult.Error != null)
        logger.LogCritical("  Error: {Error}", versionedResult.Error);
    return 1;
}

// 4b: Rerunnable scripts (run every deploy — must be idempotent)
var rerunnableResult = RunDbUpScripts(
    connectionString: connectionString,
    scriptDirectory: "Scripts/Rerunnable",
    filter: script => script.StartsWith("R"),
    isDryRun: isDryRun,
    logger: logger,
    isRerunnable: true);

if (!rerunnableResult.Successful)
{
    logger.LogCritical("  ✗ Rerunnable script FAILED: {Error}", rerunnableResult.ErrorScript?.Name);
    if (rerunnableResult.Error != null)
        logger.LogCritical("  Error: {Error}", rerunnableResult.Error);
    return 1;
}

// ─────────────────────────────────────────────────────────────────────────────
// Done
// ─────────────────────────────────────────────────────────────────────────────
stopwatch.Stop();
logger.LogInformation("==============================================");
logger.LogInformation("  ✓ All migrations completed successfully");
logger.LogInformation("  Total time: {Ms}ms", stopwatch.ElapsedMilliseconds);
logger.LogInformation("==============================================");

return 0;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Ensure bootstrap schema and tables exist
// ─────────────────────────────────────────────────────────────────────────────
static async Task EnsureBootstrapAsync(string connectionString, ILogger logger)
{
    using var connection = new Npgsql.NpgsqlConnection(connectionString);
    await connection.OpenAsync();

    // Create _migrations schema if it doesn't exist
    using var cmd = connection.CreateCommand();
    cmd.CommandText = @"
        CREATE SCHEMA IF NOT EXISTS _migrations;

        -- DbUp journal table for versioned scripts
        CREATE TABLE IF NOT EXISTS _migrations.schemaversions (
            schemaversionsid  SERIAL        PRIMARY KEY,
            scriptname        VARCHAR(255)  NOT NULL UNIQUE,
            applied           TIMESTAMPTZ   NOT NULL DEFAULT now()
        );

        -- EF Core migrations history table (in _migrations schema)
        CREATE TABLE IF NOT EXISTS _migrations.""__EFMigrationsHistory"" (
            ""MigrationId""    VARCHAR(150) NOT NULL PRIMARY KEY,
            ""ProductVersion"" VARCHAR(32)  NOT NULL
        );
    ";
    await cmd.ExecuteNonQueryAsync();

    logger.LogInformation("  ✓ Bootstrap schema verified");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Run EF Core migrations for all service DbContexts
// ─────────────────────────────────────────────────────────────────────────────
static async Task<(bool Success, string? Error)> RunEfCoreMigrationsAsync(
    string connectionString,
    bool isDryRun,
    ILogger logger,
    ILoggerFactory loggerFactory)
{
    // Each service's DbContext is registered here.
    // In a real project, these would be imported from the service projects.
    // For the migrator, we reference the service assemblies directly.

    var dbContextTypes = new[]
    {
        // These types must be imported from your service projects
        // Example: typeof(Identity.Infrastructure.IdentityDbContext),
        //          typeof(Catalog.Infrastructure.CatalogDbContext),
        // etc.
        // For now, this serves as a placeholder pattern.
    };

    foreach (var contextType in dbContextTypes)
    {
        logger.LogInformation("  Running EF Core migrations for: {Context}", contextType.Name);

        try
        {
            var optionsBuilderType = typeof(DbContextOptionsBuilder<>).MakeGenericType(contextType);
            var optionsBuilder = (DbContextOptionsBuilder)Activator.CreateInstance(optionsBuilderType)!;

            optionsBuilder.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "_migrations");
                npgsqlOptions.CommandTimeout(300);  // 5 min timeout for large migrations
            });

            var options = optionsBuilder.Options;
            var context = (DbContext)Activator.CreateInstance(contextType, options)!;

            if (isDryRun)
            {
                var pending = await context.Database.GetPendingMigrationsAsync();
                foreach (var migration in pending)
                    logger.LogInformation("    [DRY RUN] Pending: {Migration}", migration);
            }
            else
            {
                await context.Database.MigrateAsync();
                logger.LogInformation("  ✓ {Context} migrations applied", contextType.Name);
            }
        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }

    logger.LogInformation("  ✓ EF Core migrations complete (no contexts registered yet — placeholder)");
    return (true, null);
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Run DbUp SQL scripts from a directory
// ─────────────────────────────────────────────────────────────────────────────
static DatabaseUpgradeResult RunDbUpScripts(
    string connectionString,
    string scriptDirectory,
    Func<string, bool> filter,
    bool isDryRun,
    ILogger logger,
    bool isRerunnable)
{
    var absoluteDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, scriptDirectory);

    if (!Directory.Exists(absoluteDir))
    {
        logger.LogInformation("  Script directory not found (skipping): {Dir}", scriptDirectory);
        return new DatabaseUpgradeResult([], true, null, null);
    }

    var scriptFiles = Directory
        .GetFiles(absoluteDir, "*.sql", SearchOption.AllDirectories)
        .Where(f => filter(Path.GetFileName(f)))
        .OrderBy(f => Path.GetFileName(f))   // Sort by filename (V000_001 < V000_002)
        .ToArray();

    if (scriptFiles.Length == 0)
    {
        logger.LogInformation("  No {Type} scripts found in: {Dir}",
            isRerunnable ? "rerunnable" : "versioned", scriptDirectory);
        return new DatabaseUpgradeResult([], true, null, null);
    }

    logger.LogInformation("  Found {Count} {Type} scripts",
        scriptFiles.Length, isRerunnable ? "rerunnable" : "versioned");

    // Build DbUp upgrader
    var upgraderBuilder = DeployChanges
        .To
        .PostgresqlDatabase(connectionString)
        .WithScripts(scriptFiles.Select(f => new SqlScript(Path.GetFileName(f), File.ReadAllText(f))))
        .LogToAutodetectedLog();

    if (isRerunnable)
    {
        // Rerunnable scripts: always run, don't track in journal
        upgraderBuilder = upgraderBuilder.JournalTo(new NullJournal());
    }
    else
    {
        // Versioned scripts: use custom journal in _migrations schema
        upgraderBuilder = upgraderBuilder
            .JournalToPostgresqlTable("_migrations", "schemaversions");
    }

    var upgrader = upgraderBuilder.Build();

    if (isDryRun)
    {
        var scripts = upgrader.GetScriptsToExecute();
        foreach (var script in scripts)
            logger.LogInformation("    [DRY RUN] Would run: {Script}", script.Name);

        return new DatabaseUpgradeResult(scripts, true, null, null);
    }

    // Log scripts that will run
    var pendingScripts = upgrader.GetScriptsToExecute();
    if (!pendingScripts.Any())
    {
        logger.LogInformation("  ✓ No pending {Type} scripts",
            isRerunnable ? "rerunnable" : "versioned");
        return new DatabaseUpgradeResult([], true, null, null);
    }

    foreach (var script in pendingScripts)
        logger.LogInformation("    Executing: {Script}", script.Name);

    // Execute scripts
    var result = upgrader.PerformUpgrade();

    if (result.Successful)
    {
        logger.LogInformation("  ✓ {Count} {Type} script(s) applied successfully",
            pendingScripts.Count, isRerunnable ? "rerunnable" : "versioned");
    }

    return result;
}
