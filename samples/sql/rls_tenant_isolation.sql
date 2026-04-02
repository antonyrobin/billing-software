-- =============================================================================
-- rls_tenant_isolation.sql  (Rerunnable — R prefix in DbUp)
--
-- Row-Level Security (RLS) Policies for Tenant Isolation
--
-- How it works:
--   1. Every table has a tenant_id UUID column
--   2. RLS is enabled on each table (FORCE ROW LEVEL SECURITY)
--   3. Each policy checks: tenant_id = current_setting('app.tenant_id')::uuid
--   4. The API Gateway extracts tenant_id from JWT and injects X-Tenant-Id header
--   5. Each service's DbContext interceptor runs:
--        SET LOCAL app.tenant_id = '<tenant_id>';
--      at the start of every request
--
-- The migrator_user is BYPASSED by RLS (BYPASSRLS privilege) so migrations
-- can create seed data and manage all tenants.
--
-- Security notes:
--   • FORCE ROW LEVEL SECURITY applies even to table owners
--   • BYPASSRLS is only granted to migrator_user (never service users)
--   • If app.tenant_id is not set, queries return 0 rows (fail-safe)
--   • Admin queries can use SET LOCAL app.tenant_id = '' to bypass
--     (but service users don't have this ability)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Grant BYPASSRLS to migrator only (never to service users)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER ROLE migrator_user BYPASSRLS;

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper macro: Create standard RLS policy for a table
-- (PL/pgSQL does not support DDL macros, so we use a helper procedure)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE _migrations.create_tenant_rls_policy(
    p_schema TEXT,
    p_table  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_policy_name TEXT;
    v_full_table  TEXT;
BEGIN
    v_full_table  := format('%I.%I', p_schema, p_table);
    v_policy_name := 'rls_tenant_isolation';

    -- Enable RLS (idempotent)
    EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', v_full_table);

    -- FORCE applies RLS even to table owners (prevents accidental full scans)
    EXECUTE format('ALTER TABLE %s FORCE ROW LEVEL SECURITY', v_full_table);

    -- Drop existing policy if it exists (rerunnable)
    EXECUTE format('DROP POLICY IF EXISTS %I ON %s', v_policy_name, v_full_table);

    -- Create isolation policy:
    --   SELECT / UPDATE / DELETE: only rows matching current tenant
    --   INSERT: tenant_id must match current tenant (prevents cross-tenant writes)
    EXECUTE format($$
        CREATE POLICY %I ON %s
        AS RESTRICTIVE
        USING (
            tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
        )
        WITH CHECK (
            tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
        )
    $$, v_policy_name, v_full_table);

    RAISE NOTICE 'RLS policy created on: %', v_full_table;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Apply RLS to all tenant-scoped tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Identity schema
CALL _migrations.create_tenant_rls_policy('identity', 'branches');
CALL _migrations.create_tenant_rls_policy('identity', 'users');
CALL _migrations.create_tenant_rls_policy('identity', 'user_roles');
CALL _migrations.create_tenant_rls_policy('identity', 'refresh_tokens');
CALL _migrations.create_tenant_rls_policy('identity', 'feature_flags');
CALL _migrations.create_tenant_rls_policy('identity', 'tenant_config');
-- Note: 'tenants' table is NOT RLS-scoped (it IS the tenant root record)

-- Catalog schema
CALL _migrations.create_tenant_rls_policy('catalog', 'products');
CALL _migrations.create_tenant_rls_policy('catalog', 'product_variants');
CALL _migrations.create_tenant_rls_policy('catalog', 'categories');
CALL _migrations.create_tenant_rls_policy('catalog', 'brands');
CALL _migrations.create_tenant_rls_policy('catalog', 'inventory_locations');
CALL _migrations.create_tenant_rls_policy('catalog', 'stock_entries');
CALL _migrations.create_tenant_rls_policy('catalog', 'stock_adjustments');
CALL _migrations.create_tenant_rls_policy('catalog', 'barcodes');
CALL _migrations.create_tenant_rls_policy('catalog', 'files');

-- Commerce schema
CALL _migrations.create_tenant_rls_policy('commerce', 'orders');
CALL _migrations.create_tenant_rls_policy('commerce', 'order_items');
CALL _migrations.create_tenant_rls_policy('commerce', 'carts');
CALL _migrations.create_tenant_rls_policy('commerce', 'cart_items');
CALL _migrations.create_tenant_rls_policy('commerce', 'invoices');
CALL _migrations.create_tenant_rls_policy('commerce', 'invoice_items');
CALL _migrations.create_tenant_rls_policy('commerce', 'payments');
CALL _migrations.create_tenant_rls_policy('commerce', 'payment_transactions');
CALL _migrations.create_tenant_rls_policy('commerce', 'discounts');
CALL _migrations.create_tenant_rls_policy('commerce', 'offers');
CALL _migrations.create_tenant_rls_policy('commerce', 'deliveries');
CALL _migrations.create_tenant_rls_policy('commerce', 'returns');
CALL _migrations.create_tenant_rls_policy('commerce', 'invoice_number_sequences');
-- Note: 'gst_rates' and 'hsn_codes' are global (no tenant_id) — no RLS needed

-- Engagement schema
CALL _migrations.create_tenant_rls_policy('engagement', 'notifications');
CALL _migrations.create_tenant_rls_policy('engagement', 'notification_templates');
CALL _migrations.create_tenant_rls_policy('engagement', 'reviews');
CALL _migrations.create_tenant_rls_policy('engagement', 'reports');
CALL _migrations.create_tenant_rls_policy('engagement', 'support_tickets');
CALL _migrations.create_tenant_rls_policy('engagement', 'service_providers');

-- ─────────────────────────────────────────────────────────────────────────────
-- Special policy for tenants table (admin access only)
-- Service users should NEVER directly query the tenants table in production.
-- Only the Identity Service can read tenants (and it uses the migrator connection
-- for admin-level queries behind a separate admin endpoint).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE identity.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity.tenants FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_tenants_own ON identity.tenants;
CREATE POLICY rls_tenants_own ON identity.tenants
    AS RESTRICTIVE
    USING (
        -- Allow: reading your own tenant record
        id = NULLIF(current_setting('app.tenant_id', true), '')::uuid
        OR
        -- Allow: superadmin mode (explicit admin flag in session)
        current_setting('app.is_admin', true) = 'true'
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- Global tables (no RLS — shared across all tenants)
-- ─────────────────────────────────────────────────────────────────────────────
-- These tables contain reference data shared by all tenants:
--   commerce.gst_rates      — GST rate slabs (0%, 5%, 12%, 18%, 28%)
--   commerce.hsn_codes      — HSN code master
--   identity.roles          — System-level role definitions
--   identity.permissions    — System-level permission definitions

-- Explicitly disable RLS on global/reference tables (in case it was set)
ALTER TABLE IF EXISTS commerce.gst_rates   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS commerce.hsn_codes   DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS identity.roles       DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS identity.permissions DISABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- Verification: List all tables with RLS enabled
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_count INT;
    v_table RECORD;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
    WHERE t.schemaname IN ('identity', 'catalog', 'commerce', 'engagement')
      AND c.relrowsecurity = TRUE;

    RAISE NOTICE 'RLS enabled on % tables', v_count;

    -- List any tables WITHOUT RLS (should only be global/reference tables)
    FOR v_table IN
        SELECT t.schemaname, t.tablename
        FROM pg_tables t
        JOIN pg_class c ON c.relname = t.tablename
        JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.schemaname
        WHERE t.schemaname IN ('identity', 'catalog', 'commerce', 'engagement')
          AND c.relrowsecurity = FALSE
    LOOP
        RAISE NOTICE 'Table WITHOUT RLS (expected for global tables): %.%',
            v_table.schemaname, v_table.tablename;
    END LOOP;

    RAISE NOTICE 'rls_tenant_isolation.sql: Complete';
END
$$;
