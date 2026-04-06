# 🐘 PostgreSQL 16 — Database

> **Role in Project:** Primary relational database with multi-tenant isolation via Row-Level Security (RLS)
> **Version:** 16.x
> **Extensions:** pgvector, pg_trgm, uuid-ossp, pgcrypto
> **Related:** [EF Core + DbUp](./ef-core-dbup.md) | [.NET Web API](./dotnet-web-api.md) | [Redis](./redis.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose PostgreSQL](#2-why-we-chose-postgresql)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Database Creation](#6-database-creation)
7. [Schema Design](#7-schema-design)
8. [Development Guide](#8-development-guide)
9. [Row-Level Security (RLS)](#9-row-level-security-rls)
10. [Full-Text Search (pg_trgm)](#10-full-text-search-pg_trgm)
11. [Vector Search (pgvector)](#11-vector-search-pgvector)
12. [Indexing Strategies](#12-indexing-strategies)
13. [Performance Optimization](#13-performance-optimization)
14. [Backup & Recovery](#14-backup--recovery)
15. [Best Practices (Do's & Don'ts)](#15-best-practices-dos--donts)
16. [Monitoring](#16-monitoring)
17. [How to Run](#17-how-to-run)
18. [Local Deployment](#18-local-deployment)
19. [Cloud Deployment with Docker](#19-cloud-deployment-with-docker)
20. [Troubleshooting](#20-troubleshooting)
21. [Useful Commands](#21-useful-commands)
22. [References](#22-references)

---

## 1. Purpose & Overview

**PostgreSQL** is a powerful, open-source object-relational database system with 35+ years of active development. It's known for reliability, feature richness, and performance.

### Key Features Used in This Project

| Feature | Purpose |
|---|---|
| **ACID Compliance** | Guaranteed data integrity for financial transactions (invoices, payments) |
| **Row-Level Security (RLS)** | Database-level tenant isolation — every query scoped to tenant automatically |
| **JSONB** | Store flexible configuration, feature flags, metadata as semi-structured JSON |
| **Full-text Search (pg_trgm)** | Fuzzy product search without Elasticsearch |
| **pgvector** | Store AI embeddings for RAG (Retrieval-Augmented Generation) |
| **Materialized Views** | Pre-computed analytics (GST reports, stock summaries) |
| **UUID Generation** | Built-in UUID v7 support for globally unique IDs |
| **Extensions** | Extensible — add capabilities without external infrastructure |

### Database Architecture

```
PostgreSQL Instance
├── billing (database)
│   ├── identity schema    → users, tenants, branches, roles, permissions, configs
│   ├── catalog schema     → products, categories, inventory, suppliers, purchase_orders
│   ├── commerce schema    → orders, invoices, payments, cart, delivery, ledger
│   ├── engagement schema  → notifications, reviews, reports, ai_embeddings
│   └── public schema      → shared functions, extensions, types
│
├── RLS Policies           → Tenant isolation on every table
├── Functions/Triggers     → GST calculation, audit logs, auto-timestamps
└── Materialized Views     → Stock summary, GST report, sales analytics
```

---

## 2. Why We Chose PostgreSQL

| Factor | Decision Rationale |
|---|---|
| **Single Database** | One DB instead of DB-per-service → simpler ops, lower cost, easier joins |
| **RLS for Multi-tenancy** | Database-level tenant isolation — even raw SQL is tenant-scoped |
| **JSONB** | Store tenant config, feature flags without separate config DB |
| **pg_trgm** | Fuzzy search replaces Elasticsearch — no extra infra |
| **pgvector** | AI embeddings stored natively — no separate vector DB (Pinecone/Weaviate) |
| **Free & Open Source** | No license costs; runs everywhere |
| **.NET Support** | Excellent via Npgsql (top-tier EF Core provider) |
| **Proven at Scale** | Used by Instagram, Spotify, Apple — handles billions of rows |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **ACID Transactions** | Critical for billing/invoice/payment integrity |
| 2 | **Row-Level Security** | Tenant isolation enforced at DB level — defense-in-depth |
| 3 | **Rich Data Types** | JSONB, arrays, UUID, interval, inet, geometry |
| 4 | **Extensions** | pgvector, pg_trgm, PostGIS, pgcrypto — add features without new infra |
| 5 | **Materialized Views** | Pre-compute reports; refresh on schedule |
| 6 | **Partitioning** | Table partitioning for large tables (orders by date range) |
| 7 | **Replication** | Built-in streaming replication for read replicas |
| 8 | **Free** | No license costs at any scale |
| 9 | **SQL Standard** | Most SQL-compliant open-source database |
| 10 | **Ecosystem** | pgAdmin, DBeaver, excellent CLI (`psql`), cloud-managed options |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Write-Heavy Performance** | MVCC can bloat → schedule VACUUM; use autovacuum tuning |
| 2 | **Connection Overhead** | Process-per-connection model → use PgBouncer connection pooling |
| 3 | **No Built-in Sharding** | Single-node limit → Citus extension or cloud-managed scaling |
| 4 | **Complex Tuning** | Many config parameters → use PGTune for initial settings |
| 5 | **Backup Complexity** | Large DBs need pg_basebackup + WAL archiving → managed backup service |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Docker** | 24.x | Run PostgreSQL in container (recommended for dev) |
| **psql** | 16 | PostgreSQL CLI client |
| **pgAdmin 4** | Latest | GUI administration tool |
| **DBeaver** | Latest | Alternative GUI (free, cross-platform) |

---

## 5. Installation & Setup

### Option 1: Docker (Recommended for Development)

```powershell
# Run PostgreSQL 16 in Docker
docker run -d `
  --name billing-postgres `
  -e POSTGRES_DB=billing `
  -e POSTGRES_USER=billing_user `
  -e POSTGRES_PASSWORD=dev_password `
  -p 5432:5432 `
  -v billing_pgdata:/var/lib/postgresql/data `
  postgres:16-alpine

# Verify
docker exec -it billing-postgres psql -U billing_user -d billing -c "SELECT version();"
```

### Option 2: Native Install (Windows)

```powershell
# Using winget
winget install PostgreSQL.PostgreSQL.16

# Or download from https://www.postgresql.org/download/windows/
# Default port: 5432
# Default superuser: postgres
```

### Option 3: WSL2 (Ubuntu)

```bash
# Install on WSL2/Ubuntu
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create user
sudo -u postgres createuser --interactive billing_user
sudo -u postgres createdb billing -O billing_user
```

### Install psql Client (Windows)

```powershell
# psql is included with PostgreSQL installation
# Or install just the client:
winget install PostgreSQL.pgAdmin

# Connect
psql -h localhost -U billing_user -d billing
```

---

## 6. Database Creation

### Initial Setup Script

```sql
-- Connect as superuser (postgres)
-- Create application user
CREATE USER billing_user WITH PASSWORD 'secure_password_here';
CREATE USER billing_readonly WITH PASSWORD 'readonly_password_here';

-- Create database
CREATE DATABASE billing OWNER billing_user;

-- Connect to billing database
\c billing

-- Create schemas
CREATE SCHEMA IF NOT EXISTS identity AUTHORIZATION billing_user;
CREATE SCHEMA IF NOT EXISTS catalog AUTHORIZATION billing_user;
CREATE SCHEMA IF NOT EXISTS commerce AUTHORIZATION billing_user;
CREATE SCHEMA IF NOT EXISTS engagement AUTHORIZATION billing_user;

-- Install extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "vector";          -- pgvector for AI embeddings

-- Set default search path
ALTER USER billing_user SET search_path TO identity, catalog, commerce, engagement, public;

-- Grant schema permissions
GRANT ALL ON SCHEMA identity TO billing_user;
GRANT ALL ON SCHEMA catalog TO billing_user;
GRANT ALL ON SCHEMA commerce TO billing_user;
GRANT ALL ON SCHEMA engagement TO billing_user;

-- Read-only user
GRANT USAGE ON SCHEMA identity, catalog, commerce, engagement TO billing_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA identity, catalog, commerce, engagement TO billing_readonly;
```

---

## 7. Schema Design

### Core Tables (Example)

```sql
-- identity.tenants
CREATE TABLE identity.tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(100) NOT NULL UNIQUE,
    plan            VARCHAR(50) NOT NULL DEFAULT 'free',
    config          JSONB NOT NULL DEFAULT '{}',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- catalog.products
CREATE TABLE catalog.products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES identity.tenants(id),
    name            VARCHAR(200) NOT NULL,
    sku             VARCHAR(50) NOT NULL,
    price           DECIMAL(18, 2) NOT NULL,
    gst_rate        DECIMAL(5, 2) NOT NULL DEFAULT 0,
    category_id     UUID REFERENCES catalog.categories(id),
    description     TEXT,
    image_url       TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    is_deleted      BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    CONSTRAINT uq_product_sku_tenant UNIQUE (tenant_id, sku)
);

-- commerce.orders
CREATE TABLE commerce.orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES identity.tenants(id),
    order_number    VARCHAR(50) NOT NULL,
    customer_id     UUID,
    status          VARCHAR(30) NOT NULL DEFAULT 'draft',
    subtotal        DECIMAL(18, 2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(18, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(18, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_order_number_tenant UNIQUE (tenant_id, order_number)
);

-- commerce.party_ledger (Accounts & Ledger)
CREATE TABLE commerce.party_ledger (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES identity.tenants(id),
    party_id        UUID NOT NULL,
    party_type      VARCHAR(20) NOT NULL, -- 'customer', 'supplier', 'dual'
    transaction_type VARCHAR(20) NOT NULL, -- 'invoice', 'payment', 'advance', 'purchase'
    reference_id    UUID,
    debit           DECIMAL(18, 2) NOT NULL DEFAULT 0,
    credit          DECIMAL(18, 2) NOT NULL DEFAULT 0,
    balance         DECIMAL(18, 2) NOT NULL DEFAULT 0,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Naming Conventions

| Element | Convention | Example |
|---|---|---|
| **Tables** | `snake_case`, plural | `products`, `order_items`, `party_ledger` |
| **Columns** | `snake_case` | `tenant_id`, `created_at`, `is_active` |
| **Primary Keys** | `id` (UUID) | `id UUID PRIMARY KEY` |
| **Foreign Keys** | `<entity>_id` | `category_id`, `tenant_id` |
| **Indexes** | `idx_<table>_<columns>` | `idx_products_tenant_sku` |
| **Constraints** | `uq_`, `fk_`, `chk_` prefix | `uq_product_sku_tenant` |
| **Functions** | `fn_<name>` | `fn_calculate_gst` |
| **Triggers** | `trg_<name>` | `trg_updated_at` |
| **Views** | `vw_<name>` | `vw_stock_summary` |

---

## 8. Development Guide

### 8.1 Common Query Patterns

```sql
-- Paginated query with search
SELECT p.id, p.name, p.sku, p.price, c.name AS category_name
FROM catalog.products p
LEFT JOIN catalog.categories c ON p.category_id = c.id
WHERE p.tenant_id = :tenant_id
  AND p.is_deleted = false
  AND (p.name ILIKE '%' || :search || '%' OR p.sku ILIKE '%' || :search || '%')
ORDER BY p.created_at DESC
LIMIT :page_size OFFSET (:page - 1) * :page_size;

-- Aggregate with grouping
SELECT
    DATE_TRUNC('month', o.created_at) AS month,
    COUNT(*) AS order_count,
    SUM(o.total_amount) AS revenue
FROM commerce.orders o
WHERE o.tenant_id = :tenant_id
  AND o.created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', o.created_at)
ORDER BY month DESC;

-- JSONB query (tenant config)
SELECT config->>'currency' AS currency,
       config->'features'->>'procurement_enabled' AS procurement_enabled
FROM identity.tenants
WHERE id = :tenant_id;

-- Update JSONB field
UPDATE identity.tenants
SET config = jsonb_set(config, '{features,procurement_enabled}', 'true')
WHERE id = :tenant_id;
```

### 8.2 Functions

```sql
-- GST calculation function
CREATE OR REPLACE FUNCTION fn_calculate_gst(
    base_price DECIMAL(18,2),
    gst_rate DECIMAL(5,2),
    is_inclusive BOOLEAN DEFAULT false
) RETURNS TABLE(
    taxable_amount DECIMAL(18,2),
    cgst DECIMAL(18,2),
    sgst DECIMAL(18,2),
    igst DECIMAL(18,2),
    total DECIMAL(18,2)
) AS $$
BEGIN
    IF is_inclusive THEN
        taxable_amount := ROUND(base_price * 100 / (100 + gst_rate), 2);
    ELSE
        taxable_amount := base_price;
    END IF;

    cgst := ROUND(taxable_amount * gst_rate / 200, 2);
    sgst := cgst;
    igst := ROUND(taxable_amount * gst_rate / 100, 2);
    total := taxable_amount + cgst + sgst;

    RETURN NEXT;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 8.3 Triggers

```sql
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON catalog.products
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON commerce.orders
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
```

### 8.4 Materialized Views

```sql
-- Stock summary view
CREATE MATERIALIZED VIEW catalog.vw_stock_summary AS
SELECT
    p.tenant_id,
    p.id AS product_id,
    p.name AS product_name,
    p.sku,
    COALESCE(SUM(i.quantity), 0) AS total_stock,
    COALESCE(SUM(i.quantity * p.price), 0) AS stock_value
FROM catalog.products p
LEFT JOIN catalog.inventory_items i ON p.id = i.product_id
WHERE p.is_deleted = false
GROUP BY p.tenant_id, p.id, p.name, p.sku;

-- Create index on materialized view
CREATE UNIQUE INDEX idx_stock_summary_pk ON catalog.vw_stock_summary (tenant_id, product_id);

-- Refresh (scheduled via cron or background service)
REFRESH MATERIALIZED VIEW CONCURRENTLY catalog.vw_stock_summary;
```

---

## 9. Row-Level Security (RLS)

### How RLS Works

```
1. Application sets session variable: SET app.current_tenant_id = 'tenant-uuid'
2. RLS policy checks: tenant_id = current_setting('app.current_tenant_id')::UUID
3. Every SELECT/INSERT/UPDATE/DELETE is automatically filtered by tenant
4. Even raw SQL or SQL injection cannot access other tenants' data
```

### Enable RLS

```sql
-- Enable RLS on a table
ALTER TABLE catalog.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.products FORCE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY tenant_isolation ON catalog.products
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Policy for INSERT (ensure new rows have correct tenant_id)
CREATE POLICY tenant_insert ON catalog.products
    FOR INSERT
    WITH CHECK (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- Apply to all relevant tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN
        SELECT table_schema || '.' || table_name
        FROM information_schema.columns
        WHERE column_name = 'tenant_id'
          AND table_schema IN ('identity', 'catalog', 'commerce', 'engagement')
    LOOP
        EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', tbl);
        EXECUTE format(
            'CREATE POLICY tenant_isolation ON %s USING (tenant_id = current_setting(''app.current_tenant_id'')::UUID)',
            tbl
        );
    END LOOP;
END;
$$;
```

### Setting Tenant Context from .NET

```csharp
// In EF Core DbContext or interceptor:
await using var cmd = connection.CreateCommand();
cmd.CommandText = "SET app.current_tenant_id = @tenantId";
cmd.Parameters.AddWithValue("tenantId", tenantContext.TenantId.ToString());
await cmd.ExecuteNonQueryAsync(ct);
```

---

## 10. Full-Text Search (pg_trgm)

```sql
-- Enable trigram extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram indexes
CREATE INDEX idx_products_name_trgm ON catalog.products
    USING gin (name gin_trgm_ops);

CREATE INDEX idx_products_sku_trgm ON catalog.products
    USING gin (sku gin_trgm_ops);

-- Fuzzy search query
SELECT name, sku, similarity(name, 'bassmati rice') AS score
FROM catalog.products
WHERE name % 'bassmati rice'   -- % operator: similarity > 0.3
   OR sku % 'bassmati rice'
ORDER BY score DESC
LIMIT 10;

-- ILIKE with trigram index acceleration
SELECT * FROM catalog.products
WHERE name ILIKE '%rice%';  -- pg_trgm makes ILIKE fast via GIN index
```

---

## 11. Vector Search (pgvector)

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table
CREATE TABLE engagement.ai_embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES identity.tenants(id),
    content     TEXT NOT NULL,
    embedding   vector(1536),  -- OpenAI ada-002 uses 1536 dimensions
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create HNSW index for fast similarity search
CREATE INDEX idx_embeddings_vector ON engagement.ai_embeddings
    USING hnsw (embedding vector_cosine_ops);

-- Similarity search (RAG: find relevant documents)
SELECT content, metadata,
       1 - (embedding <=> :query_embedding) AS similarity
FROM engagement.ai_embeddings
WHERE tenant_id = :tenant_id
ORDER BY embedding <=> :query_embedding
LIMIT 5;
```

---

## 12. Indexing Strategies

| Index Type | Use Case | Example |
|---|---|---|
| **B-tree** (default) | Equality, range, sorting | `CREATE INDEX idx_orders_date ON orders(created_at)` |
| **GIN** | JSONB, arrays, full-text, trigram | `CREATE INDEX idx_config ON tenants USING gin(config)` |
| **GiST** | Geometry, range types, nearest-neighbor | pgvector ANN search |
| **HNSW** | Vector similarity search | `CREATE INDEX USING hnsw (embedding vector_cosine_ops)` |
| **Partial** | Subset of rows | `CREATE INDEX idx_active ON products(tenant_id) WHERE is_active = true` |
| **Covering** | Include extra columns | `CREATE INDEX idx_prod INCLUDE (name, price)` |

### Recommended Indexes for This Project

```sql
-- Products: most common lookup patterns
CREATE INDEX idx_products_tenant ON catalog.products(tenant_id);
CREATE INDEX idx_products_tenant_sku ON catalog.products(tenant_id, sku);
CREATE INDEX idx_products_category ON catalog.products(tenant_id, category_id);
CREATE INDEX idx_products_active ON catalog.products(tenant_id) WHERE is_active = true AND is_deleted = false;

-- Orders: date-range queries
CREATE INDEX idx_orders_tenant_date ON commerce.orders(tenant_id, created_at DESC);
CREATE INDEX idx_orders_status ON commerce.orders(tenant_id, status);

-- Ledger: party lookups
CREATE INDEX idx_ledger_party ON commerce.party_ledger(tenant_id, party_id, created_at DESC);
```

---

## 13. Performance Optimization

| Technique | Implementation |
|---|---|
| **Connection Pooling** | Use PgBouncer (production) or Npgsql built-in pooling (dev) |
| **EXPLAIN ANALYZE** | Always analyze slow queries with `EXPLAIN (ANALYZE, BUFFERS)` |
| **Partial Indexes** | Index only active, non-deleted rows |
| **VACUUM** | Autovacuum enabled; tune for write-heavy tables |
| **Materialized Views** | Refresh `CONCURRENTLY` for zero-downtime |
| **Partitioning** | Partition orders table by month for time-range queries |
| **Covering Indexes** | Include frequently selected columns in index |
| **Read Replicas** | Use streaming replication for read-heavy reports |
| **pg_stat_statements** | Monitor most expensive queries |

### Configuration Tuning (PGTune)

```ini
# postgresql.conf (for 4GB RAM server)
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
work_mem = 16MB
wal_buffers = 16MB
max_connections = 200
random_page_cost = 1.1          # SSD storage
effective_io_concurrency = 200  # SSD storage
```

---

## 14. Backup & Recovery

### Logical Backup (pg_dump)

```powershell
# Full database backup
pg_dump -h localhost -U billing_user -d billing -F custom -f backup.dump

# Schema-only backup
pg_dump -h localhost -U billing_user -d billing --schema-only -f schema.sql

# Restore
pg_restore -h localhost -U billing_user -d billing backup.dump
```

### Continuous Archiving (WAL)

```ini
# postgresql.conf — enable WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

---

## 15. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Always use `tenant_id` in WHERE** | EF Core global filter + RLS handles this, but verify |
| 2 | **Use UUID v7 for IDs** | Time-sortable; better B-tree index performance than UUID v4 |
| 3 | **Use TIMESTAMPTZ** | Always store timestamps with timezone (UTC) |
| 4 | **Use DECIMAL for money** | Never use FLOAT/DOUBLE for financial calculations |
| 5 | **Index foreign keys** | FK columns need indexes for JOIN performance |
| 6 | **Use soft delete** | `is_deleted = true` instead of `DELETE` — audit trail |
| 7 | **Parameterize all queries** | Prevent SQL injection — never concatenate user input |
| 8 | **Set statement_timeout** | Prevent runaway queries: `SET statement_timeout = '30s'` |
| 9 | **Use EXPLAIN ANALYZE** | Profile every slow query (>100ms) |
| 10 | **Vacuum regularly** | Ensure autovacuum is running; monitor bloat |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't use `SELECT *`** | Select only needed columns |
| 2 | **Don't store files in DB** | Use S3/MinIO for files; store URL in DB |
| 3 | **Don't skip indexes** | Monitor `pg_stat_user_tables` for sequential scans |
| 4 | **Don't use FLOAT for money** | Use `DECIMAL(18,2)` |
| 5 | **Don't use `TIMESTAMP` without TZ** | Use `TIMESTAMPTZ` (always UTC) |
| 6 | **Don't skip RLS** | Every table with `tenant_id` must have RLS policy |
| 7 | **Don't use superuser for app** | Create dedicated `billing_user` with minimal privileges |
| 8 | **Don't ignore connection limits** | Use connection pooling (PgBouncer or Npgsql pool) |

---

## 16. Monitoring

### Key Metrics

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

-- Database size
SELECT pg_size_pretty(pg_database_size('billing'));

-- Table sizes
SELECT schemaname || '.' || tablename AS table,
       pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname IN ('identity', 'catalog', 'commerce', 'engagement')
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Slowest queries (requires pg_stat_statements)
SELECT query, calls, mean_exec_time, total_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;  -- Low idx_scan = unused index
```

---

## 17. How to Run

```powershell
# Start PostgreSQL via Docker
docker run -d --name billing-postgres `
  -e POSTGRES_DB=billing `
  -e POSTGRES_USER=billing_user `
  -e POSTGRES_PASSWORD=dev_password `
  -p 5432:5432 `
  postgres:16-alpine

# Connect via psql
docker exec -it billing-postgres psql -U billing_user -d billing

# Connect via connection string
psql "host=localhost port=5432 dbname=billing user=billing_user password=dev_password"
```

---

## 18. Local Deployment

### Docker Compose (with pgvector)

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16  # PostgreSQL 16 with pgvector pre-installed
    environment:
      POSTGRES_DB: billing
      POSTGRES_USER: billing_user
      POSTGRES_PASSWORD: ${DB_PASSWORD:-dev_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d  # Auto-run SQL on first start
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U billing_user -d billing"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

---

## 19. Cloud Deployment with Docker

### Production Dockerfile (Custom Config)

```dockerfile
FROM pgvector/pgvector:pg16

# Copy custom PostgreSQL config
COPY postgresql.conf /etc/postgresql/postgresql.conf
COPY pg_hba.conf /etc/postgresql/pg_hba.conf

# Copy initialization scripts
COPY init-scripts/ /docker-entrypoint-initdb.d/

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
```

### Cloud-Managed Options

| Provider | Service | Best For |
|---|---|---|
| **AWS** | RDS PostgreSQL / Aurora PostgreSQL | Auto-scaling, backups |
| **Azure** | Azure Database for PostgreSQL Flexible Server | .NET integration |
| **GCP** | Cloud SQL for PostgreSQL | Simplicity |
| **DigitalOcean** | Managed PostgreSQL | Low cost startup |
| **Supabase** | Supabase (PostgreSQL + pgvector) | Fastest to start |

---

## 20. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Connection refused** | PostgreSQL not running | `docker start billing-postgres` |
| **Too many connections** | No connection pooling | Add PgBouncer or increase `max_connections` |
| **Slow queries** | Missing indexes | Run `EXPLAIN ANALYZE`; add appropriate index |
| **RLS blocking all rows** | Missing `SET app.current_tenant_id` | Check TenantInterceptor in .NET |
| **Disk full** | WAL files or bloat | `VACUUM FULL`; archive WAL; check `pg_wal` size |
| **Extension not found** | Missing from docker image | Use `pgvector/pgvector:pg16` image |

---

## 21. Useful Commands

```sql
-- Database management
\l                              -- List databases
\c billing                      -- Connect to database
\dt identity.*                  -- List tables in schema
\d+ catalog.products            -- Describe table with details
\dn                             -- List schemas
\dx                             -- List extensions

-- Query helpers
EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM catalog.products WHERE tenant_id = '...';
SELECT pg_size_pretty(pg_database_size('billing'));
SELECT pg_size_pretty(pg_total_relation_size('catalog.products'));

-- Maintenance
VACUUM ANALYZE catalog.products;
REINDEX INDEX idx_products_tenant;
REFRESH MATERIALIZED VIEW CONCURRENTLY catalog.vw_stock_summary;
```

```powershell
# CLI commands
psql -h localhost -U billing_user -d billing           # Connect
pg_dump -h localhost -U billing_user -d billing > backup.sql  # Backup
pg_restore -h localhost -U billing_user -d billing backup.dump # Restore
```

---

## 22. References

| Resource | URL |
|---|---|
| **Official Docs** | https://www.postgresql.org/docs/16 |
| **pgvector** | https://github.com/pgvector/pgvector |
| **pg_trgm** | https://www.postgresql.org/docs/16/pgtrgm.html |
| **RLS Guide** | https://www.postgresql.org/docs/16/ddl-rowsecurity.html |
| **PGTune** | https://pgtune.leopard.in.ua |
| **Npgsql (.NET)** | https://www.npgsql.org |
| **pgAdmin** | https://www.pgadmin.org |
| **Docker Image** | https://hub.docker.com/_/postgres |
| **pgvector Docker** | https://hub.docker.com/r/pgvector/pgvector |
