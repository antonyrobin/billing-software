-- =============================================================================
-- trg_audit_log.sql  (Rerunnable — R prefix in DbUp)
--
-- Automatic Audit Logging Trigger
--
-- Captures INSERT / UPDATE / DELETE on sensitive tables and writes a record
-- to the audit_log table. Useful for:
--   • Compliance (GST audit, financial audit)
--   • Security incident investigation
--   • Debugging data changes
--   • "Who deleted my invoice?" questions
--
-- Captures:
--   • Table name and schema
--   • Operation (INSERT/UPDATE/DELETE)
--   • Old values (for UPDATE/DELETE)
--   • New values (for INSERT/UPDATE)
--   • Changed columns only (UPDATE)
--   • tenant_id and user_id from PostgreSQL session variables
--   • Timestamp (UTC)
--
-- Performance note:
--   Audit log is written to a separate partition per month (partitioned table)
--   to keep it from bloating the main database and allow easy archival.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Audit log table (partitioned by month for performance)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS _migrations.audit_log (
    id              BIGSERIAL,
    tenant_id       UUID,
    user_id         UUID,
    schema_name     TEXT         NOT NULL,
    table_name      TEXT         NOT NULL,
    operation       TEXT         NOT NULL,   -- INSERT, UPDATE, DELETE
    record_id       TEXT,                    -- PK of the changed record (as text)
    old_values      JSONB,                   -- Previous values (NULL for INSERT)
    new_values      JSONB,                   -- New values (NULL for DELETE)
    changed_columns TEXT[],                  -- List of columns that changed (UPDATE only)
    ip_address      INET,                    -- Client IP (if available in session)
    session_info    TEXT,                    -- Additional context (API endpoint, etc.)
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT pk_audit_log PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

COMMENT ON TABLE _migrations.audit_log IS
    'Audit trail for INSERT/UPDATE/DELETE operations on sensitive tables. '
    'Partitioned by month for efficient querying and archival.';

-- Create monthly partitions for current and next 3 months
-- In production, add a scheduled job to create partitions 1 month ahead
DO $$
DECLARE
    v_start DATE;
    v_end   DATE;
    v_name  TEXT;
    i       INT;
BEGIN
    FOR i IN 0..3 LOOP
        v_start := date_trunc('month', CURRENT_DATE + (i || ' months')::INTERVAL)::DATE;
        v_end   := (v_start + INTERVAL '1 month')::DATE;
        v_name  := '_migrations.audit_log_' || TO_CHAR(v_start, 'YYYY_MM');

        EXECUTE format(
            'CREATE TABLE IF NOT EXISTS %s PARTITION OF _migrations.audit_log '
            'FOR VALUES FROM (%L) TO (%L)',
            v_name, v_start, v_end
        );
    END LOOP;
END
$$;

-- Index for fast tenant-scoped audit queries
CREATE INDEX IF NOT EXISTS idx_audit_tenant_table
    ON _migrations.audit_log (tenant_id, table_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_record
    ON _migrations.audit_log (table_name, record_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Trigger function
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION _migrations.fn_audit_log_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER   -- Runs as owner, not caller (audit_user can always write)
AS $$
DECLARE
    v_tenant_id      UUID;
    v_user_id        UUID;
    v_record_id      TEXT;
    v_old_values     JSONB;
    v_new_values     JSONB;
    v_changed_cols   TEXT[];
    v_col            TEXT;
    v_old_val        TEXT;
    v_new_val        TEXT;
BEGIN
    -- ─────────────────────────────────────────────────────────────────────
    -- Extract context from PostgreSQL session variables
    -- Set by the service's DbContext interceptor at request start:
    --   SET LOCAL app.tenant_id = '...';
    --   SET LOCAL app.user_id   = '...';
    -- ─────────────────────────────────────────────────────────────────────
    BEGIN
        v_tenant_id := NULLIF(current_setting('app.tenant_id', true), '')::UUID;
    EXCEPTION WHEN others THEN
        v_tenant_id := NULL;
    END;

    BEGIN
        v_user_id := NULLIF(current_setting('app.user_id', true), '')::UUID;
    EXCEPTION WHEN others THEN
        v_user_id := NULL;
    END;

    -- ─────────────────────────────────────────────────────────────────────
    -- Extract record ID (assumes 'id' column is the primary key)
    -- ─────────────────────────────────────────────────────────────────────
    CASE TG_OP
        WHEN 'DELETE' THEN
            v_record_id  := (OLD.*)::TEXT;
            BEGIN v_record_id := OLD.id::TEXT; EXCEPTION WHEN others THEN NULL; END;
            v_old_values := to_jsonb(OLD);
            v_new_values := NULL;
        WHEN 'INSERT' THEN
            BEGIN v_record_id := NEW.id::TEXT; EXCEPTION WHEN others THEN NULL; END;
            v_old_values := NULL;
            v_new_values := to_jsonb(NEW);
        WHEN 'UPDATE' THEN
            BEGIN v_record_id := NEW.id::TEXT; EXCEPTION WHEN others THEN NULL; END;
            v_old_values := to_jsonb(OLD);
            v_new_values := to_jsonb(NEW);

            -- Find which columns actually changed
            v_changed_cols := ARRAY[]::TEXT[];
            FOR v_col IN
                SELECT key
                FROM jsonb_each_text(to_jsonb(NEW))
            LOOP
                v_old_val := (to_jsonb(OLD) ->> v_col);
                v_new_val := (to_jsonb(NEW) ->> v_col);

                IF v_old_val IS DISTINCT FROM v_new_val THEN
                    -- Exclude audit metadata columns from the changed list
                    IF v_col NOT IN ('updated_at', 'updated_by') THEN
                        v_changed_cols := array_append(v_changed_cols, v_col);
                    END IF;
                END IF;
            END LOOP;

            -- Skip audit entry if only updated_at changed (no real change)
            IF array_length(v_changed_cols, 1) IS NULL OR
               array_length(v_changed_cols, 1) = 0 THEN
                RETURN NEW;
            END IF;
    END CASE;

    -- ─────────────────────────────────────────────────────────────────────
    -- Remove sensitive fields from audit values
    -- Never log passwords, tokens, or encryption keys
    -- ─────────────────────────────────────────────────────────────────────
    IF v_old_values IS NOT NULL THEN
        v_old_values := v_old_values
            - 'password_hash'
            - 'password'
            - 'token'
            - 'refresh_token'
            - 'secret'
            - 'private_key'
            - 'card_number'
            - 'cvv';
    END IF;

    IF v_new_values IS NOT NULL THEN
        v_new_values := v_new_values
            - 'password_hash'
            - 'password'
            - 'token'
            - 'refresh_token'
            - 'secret'
            - 'private_key'
            - 'card_number'
            - 'cvv';
    END IF;

    -- ─────────────────────────────────────────────────────────────────────
    -- Write audit record
    -- ─────────────────────────────────────────────────────────────────────
    INSERT INTO _migrations.audit_log (
        tenant_id,
        user_id,
        schema_name,
        table_name,
        operation,
        record_id,
        old_values,
        new_values,
        changed_columns,
        session_info,
        created_at
    ) VALUES (
        v_tenant_id,
        v_user_id,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        TG_OP,
        v_record_id,
        v_old_values,
        v_new_values,
        v_changed_cols,
        current_setting('app.request_id', true),
        clock_timestamp()   -- Use clock_timestamp() not now() for accurate timing
    );

    -- Return appropriate row
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

COMMENT ON FUNCTION _migrations.fn_audit_log_trigger() IS
    'Audit trigger function. Logs INSERT/UPDATE/DELETE to audit_log. '
    'Redacts sensitive fields (passwords, tokens). Skips no-op updates.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: Attach audit trigger to a table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE PROCEDURE _migrations.attach_audit_trigger(
    p_schema TEXT,
    p_table  TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_trigger_name TEXT := 'trg_audit_log';
    v_full_table   TEXT := format('%I.%I', p_schema, p_table);
BEGIN
    -- Drop existing trigger (rerunnable)
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON %s', v_trigger_name, v_full_table);

    -- Create AFTER trigger (so we don't interfere with the original operation)
    EXECUTE format($$
        CREATE TRIGGER %I
        AFTER INSERT OR UPDATE OR DELETE ON %s
        FOR EACH ROW
        EXECUTE FUNCTION _migrations.fn_audit_log_trigger()
    $$, v_trigger_name, v_full_table);

    RAISE NOTICE 'Audit trigger attached to: %', v_full_table;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Attach audit triggers to sensitive tables
-- (Not all tables need auditing — focus on financial and security tables)
-- ─────────────────────────────────────────────────────────────────────────────

-- Identity: Security-sensitive tables
CALL _migrations.attach_audit_trigger('identity', 'tenants');
CALL _migrations.attach_audit_trigger('identity', 'users');
CALL _migrations.attach_audit_trigger('identity', 'user_roles');
CALL _migrations.attach_audit_trigger('identity', 'roles');
CALL _migrations.attach_audit_trigger('identity', 'permissions');

-- Commerce: Financial tables (mandatory for GST compliance)
CALL _migrations.attach_audit_trigger('commerce', 'invoices');
CALL _migrations.attach_audit_trigger('commerce', 'invoice_items');
CALL _migrations.attach_audit_trigger('commerce', 'payments');
CALL _migrations.attach_audit_trigger('commerce', 'payment_transactions');
CALL _migrations.attach_audit_trigger('commerce', 'orders');
CALL _migrations.attach_audit_trigger('commerce', 'returns');

-- Catalog: Inventory changes (for stock audit)
CALL _migrations.attach_audit_trigger('catalog', 'stock_adjustments');

RAISE NOTICE 'trg_audit_log.sql: Audit triggers installed on all sensitive tables';
