-- =============================================================================
-- trg_updated_at.sql  (Rerunnable — R prefix in DbUp)
--
-- Auto-update updated_at Timestamp Trigger
--
-- Automatically sets the updated_at column to the current UTC timestamp
-- whenever a row is updated. This eliminates the need for application code
-- to manually set updated_at on every save.
--
-- Usage: Attach to any table with an updated_at column.
-- Pattern: All entity tables in this system have:
--   created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
--   updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
--
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only update if the row actually changed (prevents infinite loops
    -- and unnecessary updates from no-op UPDATE statements)
    IF NEW IS DISTINCT FROM OLD THEN
        NEW.updated_at := clock_timestamp();
    END IF;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_set_updated_at() IS
    'Trigger function: sets updated_at to current timestamp on UPDATE. '
    'Only fires when row data has actually changed.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper procedure: Attach updated_at trigger to a table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE public.attach_updated_at_trigger(
    p_schema TEXT,
    p_table  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trigger_name TEXT := 'trg_set_updated_at';
    v_full_table   TEXT := format('%I.%I', p_schema, p_table);
BEGIN
    -- Check that the table has an updated_at column
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = p_schema
          AND table_name   = p_table
          AND column_name  = 'updated_at'
    ) THEN
        RAISE WARNING 'Table %.% does not have an updated_at column — skipping',
            p_schema, p_table;
        RETURN;
    END IF;

    -- Drop existing trigger (rerunnable / idempotent)
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', v_trigger_name, v_full_table);

    -- Create BEFORE UPDATE trigger (modifies NEW before it's written)
    EXECUTE format($$
        CREATE TRIGGER %I
        BEFORE UPDATE ON %s
        FOR EACH ROW
        EXECUTE FUNCTION public.fn_set_updated_at()
    $$, v_trigger_name, v_full_table);

    RAISE NOTICE 'updated_at trigger attached to: %', v_full_table;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Attach to all entity tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Identity schema
CALL public.attach_updated_at_trigger('identity', 'tenants');
CALL public.attach_updated_at_trigger('identity', 'branches');
CALL public.attach_updated_at_trigger('identity', 'users');
CALL public.attach_updated_at_trigger('identity', 'roles');
CALL public.attach_updated_at_trigger('identity', 'feature_flags');
CALL public.attach_updated_at_trigger('identity', 'tenant_config');

-- Catalog schema
CALL public.attach_updated_at_trigger('catalog', 'products');
CALL public.attach_updated_at_trigger('catalog', 'product_variants');
CALL public.attach_updated_at_trigger('catalog', 'categories');
CALL public.attach_updated_at_trigger('catalog', 'brands');
CALL public.attach_updated_at_trigger('catalog', 'inventory_locations');
CALL public.attach_updated_at_trigger('catalog', 'stock_entries');

-- Commerce schema
CALL public.attach_updated_at_trigger('commerce', 'orders');
CALL public.attach_updated_at_trigger('commerce', 'invoices');
CALL public.attach_updated_at_trigger('commerce', 'payments');
CALL public.attach_updated_at_trigger('commerce', 'discounts');
CALL public.attach_updated_at_trigger('commerce', 'deliveries');

-- Engagement schema
CALL public.attach_updated_at_trigger('engagement', 'notifications');
CALL public.attach_updated_at_trigger('engagement', 'notification_templates');
CALL public.attach_updated_at_trigger('engagement', 'reviews');
CALL public.attach_updated_at_trigger('engagement', 'support_tickets');
CALL public.attach_updated_at_trigger('engagement', 'service_providers');

RAISE NOTICE 'trg_updated_at.sql: updated_at triggers installed';
