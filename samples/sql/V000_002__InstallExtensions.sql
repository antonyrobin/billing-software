-- =============================================================================
-- V000_002__InstallExtensions.sql
--
-- Installs PostgreSQL extensions required by the billing software.
-- Extensions must be installed by a superuser (typically the migrator role
-- which is granted SUPERUSER in the migration pipeline, or the DB owner).
--
-- Extensions installed:
--   uuid-ossp     → UUID generation functions (uuid_generate_v4())
--   pgcrypto      → Cryptographic functions (gen_random_uuid, crypt, encode)
--   pg_trgm       → Trigram-based fuzzy text search (replaces Elasticsearch)
--   unaccent      → Remove accents for accent-insensitive search
--   btree_gin     → GIN indexes for composite searches on btree types
--   pg_stat_statements → Query performance monitoring
--   tablefunc     → Pivot/crosstab for report generation
--   hstore        → Key-value storage for flexible metadata
--
-- Run order: Must run after V000_001 (schemas), before any table creation.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Core extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- uuid-ossp: Standard UUID generation
-- Used as default values for primary keys (uuid_generate_v4())
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    WITH SCHEMA public
    VERSION '1.1'
    COMMENT 'UUID generation functions';

-- pgcrypto: Cryptographic functions
-- Used for: gen_random_uuid() (faster than uuid-ossp), password hashing,
--           token generation, encryption of sensitive fields
CREATE EXTENSION IF NOT EXISTS pgcrypto
    WITH SCHEMA public
    COMMENT 'Cryptographic functions including gen_random_uuid()';

-- ─────────────────────────────────────────────────────────────────────────────
-- Search extensions (replaces Elasticsearch for startup scale)
-- ─────────────────────────────────────────────────────────────────────────────

-- pg_trgm: Trigram similarity search
-- Enables fast fuzzy search on product names, customer names, descriptions
-- Usage: CREATE INDEX idx_products_name_trgm ON catalog.products
--          USING GIN (name gin_trgm_ops);
--        SELECT * FROM products WHERE name % 'paracetamol';  -- fuzzy
--        SELECT * FROM products WHERE name ILIKE '%para%';   -- with GIN index
CREATE EXTENSION IF NOT EXISTS pg_trgm
    WITH SCHEMA public
    COMMENT 'Trigram similarity for fuzzy text search on products/customers';

-- unaccent: Removes diacritics for accent-insensitive search
-- Example: searching "cafe" finds "café"
-- Used with: to_tsvector('unaccent', column_name)
CREATE EXTENSION IF NOT EXISTS unaccent
    WITH SCHEMA public
    COMMENT 'Accent-insensitive text search';

-- btree_gin: Allows GIN indexes on btree data types (int, timestamp, etc.)
-- Useful for composite GIN indexes (text + date ranges)
CREATE EXTENSION IF NOT EXISTS btree_gin
    WITH SCHEMA public
    COMMENT 'GIN indexes for btree-compatible data types';

-- ─────────────────────────────────────────────────────────────────────────────
-- Monitoring extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- pg_stat_statements: Query performance tracking
-- Required for: Grafana dashboards, query optimization, identifying slow queries
-- Must be added to postgresql.conf: shared_preload_libraries = 'pg_stat_statements'
CREATE EXTENSION IF NOT EXISTS pg_stat_statements
    WITH SCHEMA public
    COMMENT 'Query execution statistics for performance monitoring';

-- ─────────────────────────────────────────────────────────────────────────────
-- Report/analytics extensions
-- ─────────────────────────────────────────────────────────────────────────────

-- tablefunc: crosstab() for pivot tables in SQL reports
-- Used in GSTR-1, sales summary, inventory reports
-- Example: Pivot monthly sales by category
CREATE EXTENSION IF NOT EXISTS tablefunc
    WITH SCHEMA public
    COMMENT 'Cross-tab/pivot functions for SQL-based reports';

-- hstore: Flexible key-value storage within a column
-- Used for: product_variants (size=L, color=red), tenant_config (key=value pairs)
CREATE EXTENSION IF NOT EXISTS hstore
    WITH SCHEMA public
    COMMENT 'Key-value store within a column for flexible metadata';

-- ─────────────────────────────────────────────────────────────────────────────
-- Custom text search configuration (for Indian product names)
-- Combines English dictionary + unaccent for better search results
-- ─────────────────────────────────────────────────────────────────────────────

-- Create a custom text search configuration for product search
CREATE TEXT SEARCH CONFIGURATION IF NOT EXISTS billing_search (COPY = english);

ALTER TEXT SEARCH CONFIGURATION billing_search
    ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, word, hword, hword_part
    WITH unaccent, english_stem;

-- ─────────────────────────────────────────────────────────────────────────────
-- Shared utility functions (available across all schemas)
-- ─────────────────────────────────────────────────────────────────────────────

-- Function: Generate a ULID-style sortable ID
-- Combines timestamp + random for time-ordered UUIDs (better index performance)
-- Returns: text like "01HQ..." (26 chars, base32 Crockford encoding)
CREATE OR REPLACE FUNCTION public.generate_ulid()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    ts_ms    BIGINT;
    rand_hex TEXT;
    ulid     TEXT;
BEGIN
    -- Millisecond timestamp (48 bits)
    ts_ms := FLOOR(EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

    -- 10 random bytes (80 bits)
    rand_hex := encode(gen_random_bytes(10), 'hex');

    -- Combine: timestamp as hex + random hex → UUID-like string
    ulid := LPAD(TO_HEX(ts_ms), 12, '0') || rand_hex;

    RETURN ulid;
END;
$$;

COMMENT ON FUNCTION public.generate_ulid() IS
    'Generates a time-ordered ULID-style ID using timestamp + random bytes';

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    ext_list TEXT;
BEGIN
    SELECT string_agg(extname, ', ' ORDER BY extname)
    INTO ext_list
    FROM pg_extension
    WHERE extname IN (
        'uuid-ossp', 'pgcrypto', 'pg_trgm', 'unaccent',
        'btree_gin', 'pg_stat_statements', 'tablefunc', 'hstore'
    );

    RAISE NOTICE 'V000_002 complete. Extensions installed: %', ext_list;
END
$$;
