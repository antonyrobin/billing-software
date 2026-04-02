-- =============================================================================
-- V000_001__CreateSchemas.sql
--
-- Creates the top-level PostgreSQL schemas that separate each service domain.
-- This script is versioned (V prefix) — it runs ONCE and is never re-applied.
--
-- Schema layout:
--   identity   → Auth, Users, Tenants, Branches, Config, RBAC
--   catalog    → Products, Categories, Inventory, Stock, Files
--   commerce   → Orders, Billing, Payments, Tax, Discounts, Delivery
--   engagement → Notifications, Reviews, Reports, Support
--   _migrations→ Migration tracking tables (EF Core + DbUp)
--
-- Run order: This is the very first script to run (000_001).
-- =============================================================================

-- Prevent re-running with an error (idempotent guard)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.schemata
        WHERE schema_name = 'identity'
    ) THEN
        RAISE NOTICE 'Schemas already exist — skipping V000_001';
        RETURN;
    END IF;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Service schemas
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS identity
    COMMENT 'Identity Service: tenants, users, roles, permissions, auth tokens';

CREATE SCHEMA IF NOT EXISTS catalog
    COMMENT 'Catalog Service: products, categories, inventory, stock, files';

CREATE SCHEMA IF NOT EXISTS commerce
    COMMENT 'Commerce Service: orders, invoices, payments, tax, discounts, delivery';

CREATE SCHEMA IF NOT EXISTS engagement
    COMMENT 'Engagement Service: notifications, reviews, reports, support tickets';

-- ─────────────────────────────────────────────────────────────────────────────
-- Migration tracking schema
-- ─────────────────────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS _migrations
    COMMENT 'Internal: EF Core and DbUp migration history tables';

-- ─────────────────────────────────────────────────────────────────────────────
-- Database-level service users (read/write per schema)
-- In production these passwords come from Azure Key Vault, not hardcoded.
-- The CREATE ROLE ... IF NOT EXISTS is PostgreSQL 9.5+.
-- ─────────────────────────────────────────────────────────────────────────────

-- Identity service user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'identity_user') THEN
        CREATE ROLE identity_user WITH LOGIN PASSWORD 'REPLACE_IN_KEY_VAULT';
    END IF;
END
$$;

-- Catalog service user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'catalog_user') THEN
        CREATE ROLE catalog_user WITH LOGIN PASSWORD 'REPLACE_IN_KEY_VAULT';
    END IF;
END
$$;

-- Commerce service user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'commerce_user') THEN
        CREATE ROLE commerce_user WITH LOGIN PASSWORD 'REPLACE_IN_KEY_VAULT';
    END IF;
END
$$;

-- Engagement service user
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'engagement_user') THEN
        CREATE ROLE engagement_user WITH LOGIN PASSWORD 'REPLACE_IN_KEY_VAULT';
    END IF;
END
$$;

-- Migrator user (needs access to all schemas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'migrator_user') THEN
        CREATE ROLE migrator_user WITH LOGIN PASSWORD 'REPLACE_IN_KEY_VAULT';
    END IF;
END
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Grant schema-level permissions
-- Each service user only sees its own schema (principle of least privilege).
-- ─────────────────────────────────────────────────────────────────────────────

-- Identity user: full access to identity schema only
GRANT USAGE ON SCHEMA identity TO identity_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA identity TO identity_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA identity TO identity_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT ALL ON TABLES TO identity_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT ALL ON SEQUENCES TO identity_user;

-- Catalog user: full access to catalog schema only
GRANT USAGE ON SCHEMA catalog TO catalog_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalog TO catalog_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA catalog TO catalog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT ALL ON TABLES TO catalog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT ALL ON SEQUENCES TO catalog_user;

-- Catalog also needs READ access to identity (to verify tenant exists)
GRANT USAGE ON SCHEMA identity TO catalog_user;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO catalog_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA identity
    GRANT SELECT ON TABLES TO catalog_user;

-- Commerce user: full access to commerce schema
GRANT USAGE ON SCHEMA commerce TO commerce_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA commerce TO commerce_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA commerce TO commerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce
    GRANT ALL ON TABLES TO commerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA commerce
    GRANT ALL ON SEQUENCES TO commerce_user;

-- Commerce needs READ access to catalog (to get product prices)
GRANT USAGE ON SCHEMA catalog TO commerce_user;
GRANT SELECT ON ALL TABLES IN SCHEMA catalog TO commerce_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA catalog
    GRANT SELECT ON TABLES TO commerce_user;

-- Commerce needs READ access to identity (tenant validation)
GRANT USAGE ON SCHEMA identity TO commerce_user;
GRANT SELECT ON ALL TABLES IN SCHEMA identity TO commerce_user;

-- Engagement user: full access to engagement schema
GRANT USAGE ON SCHEMA engagement TO engagement_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA engagement TO engagement_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA engagement TO engagement_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA engagement
    GRANT ALL ON TABLES TO engagement_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA engagement
    GRANT ALL ON SEQUENCES TO engagement_user;

-- Migrator user: full access to everything (needed for DDL)
GRANT ALL ON SCHEMA identity, catalog, commerce, engagement, _migrations TO migrator_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA identity TO migrator_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA catalog TO migrator_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA commerce TO migrator_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA engagement TO migrator_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA _migrations TO migrator_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA identity TO migrator_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA catalog TO migrator_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA commerce TO migrator_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA engagement TO migrator_user;

-- Allow migrator to create objects in all schemas
ALTER ROLE migrator_user CREATEROLE;

-- ─────────────────────────────────────────────────────────────────────────────
-- Set default search_path per role so unqualified table names resolve correctly
-- ─────────────────────────────────────────────────────────────────────────────

ALTER ROLE identity_user   SET search_path = identity,   public;
ALTER ROLE catalog_user    SET search_path = catalog,    identity, public;
ALTER ROLE commerce_user   SET search_path = commerce,   catalog, identity, public;
ALTER ROLE engagement_user SET search_path = engagement, public;
ALTER ROLE migrator_user   SET search_path = identity, catalog, commerce, engagement, _migrations, public;

-- ─────────────────────────────────────────────────────────────────────────────
-- Confirmation
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
    schema_list TEXT;
BEGIN
    SELECT string_agg(schema_name, ', ' ORDER BY schema_name)
    INTO schema_list
    FROM information_schema.schemata
    WHERE schema_name IN ('identity', 'catalog', 'commerce', 'engagement', '_migrations');

    RAISE NOTICE 'V000_001 complete. Schemas created: %', schema_list;
END
$$;
