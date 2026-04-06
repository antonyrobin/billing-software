# 🗄️ EF Core + DbUp — Database Migrations

> **Role in Project:** Manage database schema changes across development and production
> **Versions:** EF Core 9.x + DbUp 5.x
> **Related:** [.NET Web API](./dotnet-web-api.md) | [PostgreSQL](./postgresql.md) | [GitHub Actions](./github-actions.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Two-Tool Strategy](#2-two-tool-strategy)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [EF Core Migrations (Development)](#6-ef-core-migrations-development)
7. [DbUp Versioned Scripts (Production)](#7-dbup-versioned-scripts-production)
8. [Database Migrator Project](#8-database-migrator-project)
9. [Migration Script Conventions](#9-migration-script-conventions)
10. [Development Workflow](#10-development-workflow)
11. [Multi-Schema Management](#11-multi-schema-management)
12. [Seed Data](#12-seed-data)
13. [Best Practices (Do's & Don'ts)](#13-best-practices-dos--donts)
14. [How to Run](#14-how-to-run)
15. [Local Deployment](#15-local-deployment)
16. [Cloud Deployment with Docker](#16-cloud-deployment-with-docker)
17. [Rollback Strategy](#17-rollback-strategy)
18. [Troubleshooting](#18-troubleshooting)
19. [References](#19-references)

---

## 1. Purpose & Overview

Database migrations manage schema changes (tables, columns, indexes, functions) in a versioned, repeatable manner. This project uses a **two-tool strategy**: EF Core for development speed and DbUp for production safety.

### Migration Flow

```
Developer Workflow                 Production Workflow
┌─────────────────┐               ┌─────────────────┐
│  EF Core CLI    │               │  DbUp Migrator  │
│                 │               │                 │
│  dotnet ef      │  ──export──►  │  V001__Create   │
│  migrations add │  SQL scripts  │  V002__Add...   │
│  + update       │               │  V003__Alter... │
│                 │               │                 │
│  (dev database) │               │  (staging/prod) │
└─────────────────┘               └─────────────────┘
```

---

## 2. Two-Tool Strategy

| Aspect | EF Core Migrations | DbUp |
|---|---|---|
| **When** | Development (local) | Staging & Production |
| **How** | C# code → auto-generated SQL | Hand-written SQL scripts |
| **Speed** | Fast iteration | Controlled, reviewed |
| **Safety** | Can lose data if careless | Explicit SQL = full control |
| **Rollback** | `dotnet ef database update Previous` | Manual rollback script |
| **CI/CD** | Not used in pipeline | Run via DatabaseMigrator project |

### Why Both?

- **EF Core** is fast for development — change a C# entity, add migration, update DB
- **DbUp** is safe for production — every SQL script is reviewed, versioned, and idempotent
- Production DB changes should NEVER be auto-generated — they must be deliberate

---

## 3. Advantages & Disadvantages

### EF Core Migrations

| ✅ Advantage | ❌ Disadvantage |
|---|---|
| Fast development cycle | Auto-generated SQL can be suboptimal |
| C# entity = truth | Hard to handle complex migrations (data transforms) |
| Tracks migration history | Not safe for production without review |

### DbUp

| ✅ Advantage | ❌ Disadvantage |
|---|---|
| Full SQL control | Must write SQL manually |
| Production-safe (reviewed scripts) | Slower development cycle |
| Tracks applied scripts in DB table | No auto-rollback |
| Works with any SQL (functions, triggers, RLS) | — |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **.NET 9 SDK** | 9.x | Build and run projects |
| **EF Core CLI** | 9.x | `dotnet ef` commands |
| **PostgreSQL** | 16 | Target database |

```powershell
# Install EF Core CLI globally
dotnet tool install --global dotnet-ef
```

---

## 5. Installation & Setup

### NuGet Packages

```powershell
# Service projects (EF Core runtime)
dotnet add package Microsoft.EntityFrameworkCore
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL

# For adding migrations via CLI
dotnet add package Microsoft.EntityFrameworkCore.Design

# DatabaseMigrator project (DbUp)
dotnet add package dbup-postgresql
```

---

## 6. EF Core Migrations (Development)

### 6.1 Entity Definition

```csharp
// Entities/Product.cs
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Sku { get; set; }
    public string? Barcode { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal CostPrice { get; set; }
    public decimal StockQuantity { get; set; }
    public decimal ReorderLevel { get; set; }
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}
```

### 6.2 DbContext Configuration

```csharp
// Data/CatalogDbContext.cs
public class CatalogDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("catalog");

        modelBuilder.Entity<Product>(entity =>
        {
            entity.ToTable("products");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).HasMaxLength(200).IsRequired();
            entity.Property(e => e.Sku).HasMaxLength(50);
            entity.Property(e => e.Barcode).HasMaxLength(50);
            entity.Property(e => e.SellingPrice).HasColumnType("numeric(12,2)");
            entity.Property(e => e.CostPrice).HasColumnType("numeric(12,2)");

            entity.HasIndex(e => new { e.TenantId, e.Sku }).IsUnique()
                  .HasFilter("sku IS NOT NULL AND is_deleted = false");

            entity.HasQueryFilter(e => e.TenantId == _tenantContext.TenantId);
        });
    }
}
```

### 6.3 EF Core CLI Commands

```powershell
# Add a new migration
dotnet ef migrations add AddBarcodeToProduct `
  --project src/Services/Catalog.Api `
  --context CatalogDbContext

# Apply migration to dev DB
dotnet ef database update `
  --project src/Services/Catalog.Api `
  --context CatalogDbContext

# Generate SQL script (for review)
dotnet ef migrations script `
  --project src/Services/Catalog.Api `
  --context CatalogDbContext `
  --output migrations/catalog_latest.sql

# Revert last migration (before applying)
dotnet ef migrations remove `
  --project src/Services/Catalog.Api

# Revert to specific migration
dotnet ef database update PreviousMigrationName `
  --project src/Services/Catalog.Api `
  --context CatalogDbContext
```

---

## 7. DbUp Versioned Scripts (Production)

### 7.1 Script Naming Convention

```
V{major}_{minor}__{Description}.sql

Examples:
  V000_001__CreateSchemas.sql
  V000_002__InstallExtensions.sql
  V001_001__CreateTenantsTable.sql
  V001_002__CreateUsersTable.sql
  V002_001__CreateProductsTable.sql
  V002_002__CreateCategoriesTable.sql
  V003_001__AddBarcodeToProducts.sql
  V999_001__SeedGSTRates.sql
```

| Prefix | Purpose |
|---|---|
| `V000_xxx` | Infrastructure (schemas, extensions, roles) |
| `V001_xxx` | Identity schema tables |
| `V002_xxx` | Catalog schema tables |
| `V003_xxx` | Commerce schema tables |
| `V004_xxx` | Engagement schema tables |
| `V9xx_xxx` | Seed data |

### 7.2 Script Examples

```sql
-- V002_001__CreateProductsTable.sql
CREATE TABLE IF NOT EXISTS catalog.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES identity.tenants(id),
    name            VARCHAR(200) NOT NULL,
    sku             VARCHAR(50),
    barcode         VARCHAR(50),
    selling_price   NUMERIC(12,2) NOT NULL DEFAULT 0,
    cost_price      NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_quantity   NUMERIC(12,3) NOT NULL DEFAULT 0,
    reorder_level   NUMERIC(12,3) NOT NULL DEFAULT 0,
    category_id     UUID REFERENCES catalog.categories(id),
    is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_tenant
    ON catalog.products(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tenant_sku
    ON catalog.products(tenant_id, sku) WHERE sku IS NOT NULL AND is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON catalog.products(barcode) WHERE barcode IS NOT NULL;

-- RLS
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON catalog.products
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Trigger
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON catalog.products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
```

---

## 8. Database Migrator Project

```csharp
// src/Migrations/DatabaseMigrator/Program.cs
using DbUp;
using DbUp.Engine;

var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? args.FirstOrDefault()
    ?? throw new InvalidOperationException("Connection string required");

Console.WriteLine("Starting database migration...");

var upgrader = DeployChanges.To
    .PostgresqlDatabase(connectionString)
    .WithScriptsEmbeddedInAssembly(
        typeof(Program).Assembly,
        s => s.EndsWith(".sql", StringComparison.OrdinalIgnoreCase))
    .WithTransactionPerScript()
    .LogToConsole()
    .Build();

// Show pending migrations
var scriptsToExecute = upgrader.GetScriptsToExecute();
if (!scriptsToExecute.Any())
{
    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine("No new migrations to apply.");
    Console.ResetColor();
    return 0;
}

Console.WriteLine($"Found {scriptsToExecute.Count} pending migration(s):");
foreach (var script in scriptsToExecute)
{
    Console.WriteLine($"  → {script.Name}");
}

var result = upgrader.PerformUpgrade();

if (!result.Successful)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine($"Migration FAILED: {result.Error}");
    Console.ResetColor();
    return -1;
}

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Migration completed successfully!");
Console.ResetColor();
return 0;
```

### Project File

```xml
<!-- DatabaseMigrator.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net9.0</TargetFramework>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="dbup-postgresql" Version="5.*" />
  </ItemGroup>

  <!-- Embed all SQL files in the Scripts folder -->
  <ItemGroup>
    <EmbeddedResource Include="Scripts\**\*.sql" />
  </ItemGroup>
</Project>
```

### Folder Structure

```
src/Migrations/DatabaseMigrator/
├── Program.cs
├── DatabaseMigrator.csproj
└── Scripts/
    ├── V000_001__CreateSchemas.sql
    ├── V000_002__InstallExtensions.sql
    ├── V001_001__CreateTenantsTable.sql
    ├── V001_002__CreateUsersTable.sql
    ├── V002_001__CreateCategoriesTable.sql
    ├── V002_002__CreateProductsTable.sql
    ├── V003_001__CreateOrdersTable.sql
    └── V999_001__SeedGSTRates.sql
```

---

## 9. Migration Script Conventions

| Rule | Example |
|---|---|
| **Always use `IF NOT EXISTS`** | `CREATE TABLE IF NOT EXISTS` |
| **Always use `IF EXISTS` for drops** | `DROP INDEX IF EXISTS` |
| **Version-prefixed names** | `V002_001__CreateProductsTable.sql` |
| **Double underscore separator** | `V002_001__Description.sql` |
| **Lowercase SQL identifiers** | `catalog.products` not `Catalog.Products` |
| **Include indexes with tables** | Create indexes in the same script as the table |
| **Include RLS with tables** | Enable RLS + create policy in the same script |
| **Include triggers** | Create triggers in the same script as the table |
| **One schema per major version** | V001 = identity, V002 = catalog, etc. |

---

## 10. Development Workflow

### Adding a New Feature (e.g., Adding a `barcode` column)

```
1. Update C# Entity
   └── Add `public string? Barcode { get; set; }` to Product.cs

2. Update EF Configuration
   └── Add `entity.Property(e => e.Barcode).HasMaxLength(50);`

3. Create EF Migration (for local dev)
   └── dotnet ef migrations add AddBarcodeToProduct

4. Apply to Local DB
   └── dotnet ef database update

5. ✅ Test locally

6. Create DbUp Script (for production)
   └── V003_001__AddBarcodeToProducts.sql
   └── ALTER TABLE catalog.products ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);

7. PR Review → Merge → CI/CD runs DatabaseMigrator
```

### Script for Step 6

```sql
-- V003_001__AddBarcodeToProducts.sql
ALTER TABLE catalog.products
    ADD COLUMN IF NOT EXISTS barcode VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_products_barcode
    ON catalog.products(barcode) WHERE barcode IS NOT NULL;
```

---

## 11. Multi-Schema Management

Each service has its own EF Core DbContext pointing to a specific schema:

```csharp
// Identity service
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.HasDefaultSchema("identity");
}

// Catalog service
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.HasDefaultSchema("catalog");
}

// Commerce service
protected override void OnModelCreating(ModelBuilder builder)
{
    builder.HasDefaultSchema("commerce");
}
```

### Cross-Schema References in DbUp

```sql
-- commerce.orders references identity.tenants and catalog.products
ALTER TABLE commerce.orders
    ADD CONSTRAINT fk_orders_tenant
    FOREIGN KEY (tenant_id) REFERENCES identity.tenants(id);

ALTER TABLE commerce.order_items
    ADD CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES catalog.products(id);
```

---

## 12. Seed Data

```sql
-- V999_001__SeedGSTRates.sql
INSERT INTO catalog.gst_rates (id, rate_percent, description)
VALUES
    (gen_random_uuid(), 0.00, 'Exempt'),
    (gen_random_uuid(), 5.00, 'GST 5%'),
    (gen_random_uuid(), 12.00, 'GST 12%'),
    (gen_random_uuid(), 18.00, 'GST 18%'),
    (gen_random_uuid(), 28.00, 'GST 28%')
ON CONFLICT DO NOTHING;

-- V999_002__SeedUnitOfMeasures.sql
INSERT INTO catalog.units_of_measure (id, name, abbreviation)
VALUES
    (gen_random_uuid(), 'Piece', 'PCS'),
    (gen_random_uuid(), 'Kilogram', 'KG'),
    (gen_random_uuid(), 'Gram', 'G'),
    (gen_random_uuid(), 'Litre', 'L'),
    (gen_random_uuid(), 'Millilitre', 'ML'),
    (gen_random_uuid(), 'Metre', 'M'),
    (gen_random_uuid(), 'Box', 'BOX'),
    (gen_random_uuid(), 'Dozen', 'DZ')
ON CONFLICT DO NOTHING;
```

---

## 13. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use `IF NOT EXISTS` / `IF EXISTS`** | Idempotent scripts — safe to rerun |
| 2 | **Version scripts sequentially** | Clear execution order |
| 3 | **One change per script** | Easier to debug and rollback |
| 4 | **Test scripts on staging first** | Catch issues before production |
| 5 | **Include RLS + indexes with tables** | Complete setup in one script |
| 6 | **Review auto-generated SQL** | EF Core may produce suboptimal SQL |
| 7 | **Use transactions** | `WithTransactionPerScript()` in DbUp |
| 8 | **Back up before production migration** | `pg_dump` before applying |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't use EF Core in production** | Use DbUp with reviewed SQL |
| 2 | **Don't drop columns without migration** | Always add migration script |
| 3 | **Don't modify existing scripts** | Create a new script instead |
| 4 | **Don't skip version numbers** | Keep sequential for clarity |
| 5 | **Don't auto-migrate on startup** | Run migrations as a separate step (Job in K8s) |
| 6 | **Don't break existing data** | Additive changes only; use `ALTER` not `DROP + CREATE` |

---

## 14. How to Run

### Local Development (EF Core)

```powershell
# Apply all migrations
dotnet ef database update --project src/Services/Catalog.Api

# Revert to specific migration
dotnet ef database update MigrationName --project src/Services/Catalog.Api
```

### Staging/Production (DbUp)

```powershell
# Run migrator
dotnet run --project src/Migrations/DatabaseMigrator -- "Host=localhost;Database=billing;Username=billing_admin;Password=dev_password"
```

---

## 15. Local Deployment

```powershell
# 1. Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d postgres

# 2. Run migrations
dotnet run --project src/Migrations/DatabaseMigrator

# Or via Docker
docker compose -f docker-compose.dev.yml up db-migrator
```

---

## 16. Cloud Deployment with Docker

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src
COPY ["src/Migrations/DatabaseMigrator/DatabaseMigrator.csproj", "./"]
RUN dotnet restore
COPY src/Migrations/DatabaseMigrator/ .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DatabaseMigrator.dll"]
```

### Kubernetes Job

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrator-v1-0-0
  namespace: billing
spec:
  backoffLimit: 3
  template:
    spec:
      containers:
        - name: migrator
          image: ghcr.io/your-org/billing-migrator:1.0.0
          env:
            - name: ConnectionStrings__DefaultConnection
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: postgres-connection
      restartPolicy: Never
```

---

## 17. Rollback Strategy

| Scenario | Strategy |
|---|---|
| **Added column** | `ALTER TABLE DROP COLUMN IF EXISTS` (in new script) |
| **Added table** | `DROP TABLE IF EXISTS` (in new script) |
| **Data migration** | Write reverse script; restore from backup if needed |
| **Failed migration** | DbUp transaction rolls back automatically |
| **Major disaster** | Restore from `pg_dump` backup |

```sql
-- V003_002__RevertAddBarcodeToProducts.sql (rollback script)
ALTER TABLE catalog.products DROP COLUMN IF EXISTS barcode;
DROP INDEX IF EXISTS catalog.idx_products_barcode;
```

---

## 18. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Migration already applied** | Script name in `schemaversions` table | DbUp skips it automatically |
| **EF migration conflict** | Multiple developers adding migrations | Rebase and recreate migration |
| **Script failed midway** | SQL error | Fix script; DbUp tracks partial failures |
| **Schema mismatch** | EF model ≠ actual DB | Re-generate EF migrations from current DB |
| **Permission denied** | DB user lacks privileges | Grant necessary privileges |

### Check Applied Migrations

```sql
-- DbUp tracking table
SELECT * FROM schemaversions ORDER BY applied DESC;

-- EF Core tracking table
SELECT * FROM "__EFMigrationsHistory" ORDER BY "MigrationId" DESC;
```

---

## 19. References

| Resource | URL |
|---|---|
| **EF Core Migrations** | https://learn.microsoft.com/ef/core/managing-schemas/migrations |
| **EF Core CLI** | https://learn.microsoft.com/ef/core/cli/dotnet |
| **DbUp** | https://dbup.readthedocs.io |
| **DbUp PostgreSQL** | https://www.nuget.org/packages/dbup-postgresql |
| **PostgreSQL ALTER TABLE** | https://www.postgresql.org/docs/current/sql-altertable.html |
