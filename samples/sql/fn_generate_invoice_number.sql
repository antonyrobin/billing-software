-- =============================================================================
-- fn_generate_invoice_number.sql  (Rerunnable — R prefix in DbUp)
--
-- Sequential Invoice Number Generator
--
-- Generates human-readable invoice numbers per tenant per financial year.
-- Format: {PREFIX}/{FINANCIAL_YEAR}/{PADDED_SEQUENCE}
--   Example: INV/2025-26/000001
--            INV/2025-26/000002
--            RCT/2025-26/000001  (receipt)
--            CN/2025-26/000001   (credit note)
--            DN/2025-26/000001   (debit note)
--
-- Indian Financial Year: April 1 to March 31
--   April 2025 – March 2026 = "2025-26"
--
-- Design decisions:
--   • Uses a dedicated invoice_number_sequences table (avoids gaps from rollbacks)
--   • Advisory lock prevents race conditions under concurrent requests
--   • Sequence is per-tenant, per-document-type, per-financial-year
--   • Resets to 1 on April 1 each year (new financial year)
--
-- Dependencies: commerce schema, commerce.invoice_number_sequences table
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- Sequence tracking table
-- (Created here since it is business logic, not schema structure)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.invoice_number_sequences (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id       UUID         NOT NULL,
    document_type   TEXT         NOT NULL,   -- 'INV', 'RCT', 'CN', 'DN', 'EST'
    financial_year  TEXT         NOT NULL,   -- '2025-26'
    prefix          TEXT         NOT NULL,   -- Custom prefix set by tenant
    current_seq     BIGINT       NOT NULL DEFAULT 0,
    pad_length      SMALLINT     NOT NULL DEFAULT 6,   -- Zero-padding width
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT uq_invoice_seq UNIQUE (tenant_id, document_type, financial_year),
    CONSTRAINT chk_seq_positive CHECK (current_seq >= 0),
    CONSTRAINT chk_pad_length CHECK (pad_length BETWEEN 4 AND 10),
    CONSTRAINT chk_document_type CHECK (document_type IN ('INV','RCT','CN','DN','EST','PO','GRN'))
);

COMMENT ON TABLE commerce.invoice_number_sequences IS
    'Tracks the last-used sequence number for invoice number generation per tenant/year/type';

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_invoice_seq_lookup
    ON commerce.invoice_number_sequences (tenant_id, document_type, financial_year);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: Get current Indian financial year string
-- April 2025 = '2025-26'  |  January 2026 = '2025-26'  |  April 2026 = '2026-27'
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION commerce.fn_get_financial_year(
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
    SELECT
        CASE
            WHEN EXTRACT(MONTH FROM p_date) >= 4 THEN
                -- April onwards: FY starts this year
                EXTRACT(YEAR FROM p_date)::INT::TEXT || '-' ||
                LPAD((EXTRACT(YEAR FROM p_date)::INT + 1 - 2000)::TEXT, 2, '0')
            ELSE
                -- Jan-March: FY started last year
                (EXTRACT(YEAR FROM p_date)::INT - 1)::TEXT || '-' ||
                LPAD((EXTRACT(YEAR FROM p_date)::INT - 2000)::TEXT, 2, '0')
        END;
$$;

COMMENT ON FUNCTION commerce.fn_get_financial_year(DATE) IS
    'Returns Indian financial year string (e.g. "2025-26") for a given date. '
    'FY starts April 1 and ends March 31 of next calendar year.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Main function: Generate next invoice number
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION commerce.fn_generate_invoice_number(
    p_tenant_id     UUID,
    p_document_type TEXT    DEFAULT 'INV',   -- INV, RCT, CN, DN, EST
    p_custom_prefix TEXT    DEFAULT NULL,    -- Override default prefix (e.g. 'BILL' instead of 'INV')
    p_date          DATE    DEFAULT CURRENT_DATE
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    v_financial_year TEXT;
    v_prefix         TEXT;
    v_next_seq       BIGINT;
    v_pad_length     SMALLINT;
    v_invoice_number TEXT;
    v_lock_key       BIGINT;
BEGIN
    -- ─────────────────────────────────────────────────────────────────────
    -- Input validation
    -- ─────────────────────────────────────────────────────────────────────
    IF p_tenant_id IS NULL THEN
        RAISE EXCEPTION 'tenant_id cannot be NULL';
    END IF;

    IF p_document_type NOT IN ('INV','RCT','CN','DN','EST','PO','GRN') THEN
        RAISE EXCEPTION 'Invalid document_type: %. Must be one of: INV,RCT,CN,DN,EST,PO,GRN',
            p_document_type;
    END IF;

    -- ─────────────────────────────────────────────────────────────────────
    -- Determine prefix
    -- ─────────────────────────────────────────────────────────────────────
    v_prefix := COALESCE(
        p_custom_prefix,
        CASE p_document_type
            WHEN 'INV' THEN 'INV'
            WHEN 'RCT' THEN 'RCT'
            WHEN 'CN'  THEN 'CN'
            WHEN 'DN'  THEN 'DN'
            WHEN 'EST' THEN 'EST'
            WHEN 'PO'  THEN 'PO'
            WHEN 'GRN' THEN 'GRN'
            ELSE p_document_type
        END
    );

    -- ─────────────────────────────────────────────────────────────────────
    -- Calculate financial year
    -- ─────────────────────────────────────────────────────────────────────
    v_financial_year := commerce.fn_get_financial_year(p_date);

    -- ─────────────────────────────────────────────────────────────────────
    -- Acquire advisory lock to prevent race conditions
    -- Lock key = hash of (tenant_id || document_type || financial_year)
    -- This ensures only one invoice number is generated at a time per tenant/type/year
    -- ─────────────────────────────────────────────────────────────────────
    v_lock_key := abs(
        hashtext(p_tenant_id::TEXT || p_document_type || v_financial_year)
    );

    PERFORM pg_advisory_xact_lock(v_lock_key);

    -- ─────────────────────────────────────────────────────────────────────
    -- Upsert sequence row and increment atomically
    -- ─────────────────────────────────────────────────────────────────────
    INSERT INTO commerce.invoice_number_sequences (
        tenant_id,
        document_type,
        financial_year,
        prefix,
        current_seq,
        pad_length
    )
    VALUES (
        p_tenant_id,
        p_document_type,
        v_financial_year,
        v_prefix,
        1,          -- First invoice in this FY for this tenant
        6           -- Default: 000001
    )
    ON CONFLICT (tenant_id, document_type, financial_year)
    DO UPDATE SET
        current_seq = invoice_number_sequences.current_seq + 1,
        updated_at  = now()
    RETURNING current_seq, pad_length
    INTO v_next_seq, v_pad_length;

    -- ─────────────────────────────────────────────────────────────────────
    -- Format the invoice number
    -- Format: PREFIX/FY/SEQUENCE
    -- Example: INV/2025-26/000001
    -- ─────────────────────────────────────────────────────────────────────
    v_invoice_number := v_prefix || '/' ||
                        v_financial_year || '/' ||
                        LPAD(v_next_seq::TEXT, v_pad_length, '0');

    RETURN v_invoice_number;
END;
$$;

COMMENT ON FUNCTION commerce.fn_generate_invoice_number(UUID, TEXT, TEXT, DATE) IS
    'Generates a sequential, gap-free invoice number per tenant per financial year. '
    'Format: PREFIX/FY/SEQUENCE (e.g. INV/2025-26/000001). '
    'Uses advisory locks to prevent duplicate numbers under concurrent load.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Unit tests
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    v_tenant_1 UUID := gen_random_uuid();
    v_tenant_2 UUID := gen_random_uuid();
    v_inv_1    TEXT;
    v_inv_2    TEXT;
    v_inv_3    TEXT;
    v_fy       TEXT;
BEGIN
    -- Test 1: Financial year calculation
    ASSERT commerce.fn_get_financial_year('2025-04-01'::DATE) = '2025-26',
        'FY April 2025 should be 2025-26';
    ASSERT commerce.fn_get_financial_year('2026-03-31'::DATE) = '2025-26',
        'FY March 2026 should be 2025-26';
    ASSERT commerce.fn_get_financial_year('2026-04-01'::DATE) = '2026-27',
        'FY April 2026 should be 2026-27';
    ASSERT commerce.fn_get_financial_year('2025-01-15'::DATE) = '2024-25',
        'FY January 2025 should be 2024-25';

    -- Test 2: Sequential invoice numbering for tenant_1
    v_inv_1 := commerce.fn_generate_invoice_number(v_tenant_1, 'INV', NULL, '2025-05-01');
    v_inv_2 := commerce.fn_generate_invoice_number(v_tenant_1, 'INV', NULL, '2025-06-01');
    v_inv_3 := commerce.fn_generate_invoice_number(v_tenant_1, 'INV', NULL, '2025-07-01');

    ASSERT v_inv_1 = 'INV/2025-26/000001', 'First invoice should be 000001: ' || v_inv_1;
    ASSERT v_inv_2 = 'INV/2025-26/000002', 'Second invoice should be 000002: ' || v_inv_2;
    ASSERT v_inv_3 = 'INV/2025-26/000003', 'Third invoice should be 000003: ' || v_inv_3;

    -- Test 3: Different tenants have independent sequences
    v_inv_1 := commerce.fn_generate_invoice_number(v_tenant_2, 'INV', NULL, '2025-05-01');
    ASSERT v_inv_1 = 'INV/2025-26/000001',
        'Different tenant should start at 000001: ' || v_inv_1;

    -- Test 4: Different document types have independent sequences
    v_inv_1 := commerce.fn_generate_invoice_number(v_tenant_1, 'CN', NULL, '2025-05-01');
    ASSERT v_inv_1 = 'CN/2025-26/000001',
        'Credit note should start at 000001: ' || v_inv_1;

    -- Test 5: New financial year resets sequence
    v_inv_1 := commerce.fn_generate_invoice_number(v_tenant_1, 'INV', NULL, '2026-04-01');
    ASSERT v_inv_1 = 'INV/2026-27/000001',
        'New FY should start at 000001: ' || v_inv_1;

    -- Test 6: Custom prefix
    v_inv_1 := commerce.fn_generate_invoice_number(v_tenant_1, 'INV', 'BILL', '2025-05-01');
    ASSERT v_inv_1 LIKE 'BILL/2025-26/%',
        'Custom prefix BILL should be used: ' || v_inv_1;

    -- Cleanup test data (transactions are auto-rolled back in DO blocks for tests
    -- but since this is not in a BEGIN/ROLLBACK block, we delete explicitly)
    DELETE FROM commerce.invoice_number_sequences
    WHERE tenant_id IN (v_tenant_1, v_tenant_2);

    RAISE NOTICE 'fn_generate_invoice_number: All 6 unit tests PASSED';
END
$$;
