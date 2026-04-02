-- =============================================================================
-- fn_calculate_gst.sql  (Rerunnable — R prefix in DbUp)
--
-- GST Calculation Function for Indian billing software
--
-- Indian GST Rules:
--   • Intra-state sale (supplier and buyer in SAME state):
--       CGST = rate/2   (goes to Central Government)
--       SGST = rate/2   (goes to State Government)
--       IGST = 0
--
--   • Inter-state sale (supplier and buyer in DIFFERENT states):
--       CGST = 0
--       SGST = 0
--       IGST = rate     (goes to Central Government, redistributed to destination state)
--
--   • Union Territory sale:
--       CGST = rate/2
--       UTGST = rate/2  (Union Territory GST, same as SGST for our purposes)
--
--   • Pricing models:
--       Exclusive: price does NOT include GST (GST added on top)
--       Inclusive: price ALREADY includes GST (need to back-calculate)
--
-- Function: commerce.fn_calculate_gst(
--     p_base_amount    NUMERIC  — pre-tax amount per unit
--     p_quantity       INTEGER  — number of units
--     p_gst_rate       NUMERIC  — GST rate as percentage (e.g. 18.0 for 18%)
--     p_supplier_state TEXT     — 2-letter state code (e.g. 'KA', 'MH', 'DL')
--     p_buyer_state    TEXT     — 2-letter state code
--     p_is_inclusive   BOOLEAN  — if TRUE, p_base_amount already includes GST
-- )
-- Returns: TABLE with all GST component amounts
--
-- Standard GST rates in India: 0%, 5%, 12%, 18%, 28%
-- =============================================================================

CREATE OR REPLACE FUNCTION commerce.fn_calculate_gst(
    p_base_amount    NUMERIC,
    p_quantity       INTEGER,
    p_gst_rate       NUMERIC,
    p_supplier_state TEXT    DEFAULT 'KA',   -- Karnataka (seller's state)
    p_buyer_state    TEXT    DEFAULT 'KA',   -- Karnataka (buyer's state)
    p_is_inclusive   BOOLEAN DEFAULT FALSE   -- price is exclusive of GST by default
)
RETURNS TABLE (
    -- Input values (for audit/display)
    base_amount         NUMERIC,  -- amount per unit (before tax)
    quantity            INTEGER,
    gst_rate_pct        NUMERIC,  -- rate as percentage (e.g. 18.00)
    is_intra_state      BOOLEAN,
    is_inclusive_price  BOOLEAN,

    -- Calculated values
    taxable_amount      NUMERIC,  -- base_amount * quantity (after backing out GST if inclusive)
    cgst_rate_pct       NUMERIC,  -- CGST rate (rate/2 for intra, 0 for inter)
    sgst_rate_pct       NUMERIC,  -- SGST/UTGST rate (rate/2 for intra, 0 for inter)
    igst_rate_pct       NUMERIC,  -- IGST rate (rate for inter, 0 for intra)
    cgst_amount         NUMERIC,  -- CGST payable
    sgst_amount         NUMERIC,  -- SGST/UTGST payable
    igst_amount         NUMERIC,  -- IGST payable
    total_tax_amount    NUMERIC,  -- Total GST (cgst + sgst + igst)
    total_amount        NUMERIC,  -- taxable_amount + total_tax_amount
    cess_amount         NUMERIC   -- Additional cess (used for 28% luxury goods, tobacco, cars)
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_is_intra_state   BOOLEAN;
    v_taxable_amount   NUMERIC;
    v_cgst_rate        NUMERIC;
    v_sgst_rate        NUMERIC;
    v_igst_rate        NUMERIC;
    v_cgst_amount      NUMERIC;
    v_sgst_amount      NUMERIC;
    v_igst_amount      NUMERIC;
    v_total_tax        NUMERIC;
    v_total_amount     NUMERIC;
    v_cess_amount      NUMERIC;

    -- Union Territory state codes (UTGST applies instead of SGST)
    UT_STATE_CODES     TEXT[] := ARRAY['AN', 'CH', 'DN', 'DD', 'LD', 'JK', 'LA'];
BEGIN
    -- ─────────────────────────────────────────────────────────────────────
    -- Input validation
    -- ─────────────────────────────────────────────────────────────────────
    IF p_base_amount < 0 THEN
        RAISE EXCEPTION 'base_amount cannot be negative: %', p_base_amount;
    END IF;

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'quantity must be positive: %', p_quantity;
    END IF;

    IF p_gst_rate NOT IN (0, 0.1, 0.25, 1, 1.5, 3, 5, 6, 7.5, 12, 18, 28) THEN
        RAISE WARNING 'Non-standard GST rate: %. Standard rates: 0,5,12,18,28%%', p_gst_rate;
    END IF;

    -- ─────────────────────────────────────────────────────────────────────
    -- Determine transaction type
    -- ─────────────────────────────────────────────────────────────────────
    v_is_intra_state := (UPPER(p_supplier_state) = UPPER(p_buyer_state));

    -- ─────────────────────────────────────────────────────────────────────
    -- Calculate taxable amount
    -- If inclusive pricing: back-calculate the pre-tax amount
    --   taxable = (inclusive_price * 100) / (100 + gst_rate)
    -- ─────────────────────────────────────────────────────────────────────
    IF p_is_inclusive AND p_gst_rate > 0 THEN
        -- Back-calculate: remove GST from the inclusive price
        v_taxable_amount := ROUND(
            (p_base_amount * p_quantity * 100.0) / (100.0 + p_gst_rate),
            2
        );
    ELSE
        v_taxable_amount := ROUND(p_base_amount * p_quantity, 2);
    END IF;

    -- ─────────────────────────────────────────────────────────────────────
    -- Calculate GST components
    -- ─────────────────────────────────────────────────────────────────────
    IF v_is_intra_state THEN
        -- Intra-state: CGST + SGST (or UTGST)
        v_cgst_rate   := p_gst_rate / 2.0;
        v_sgst_rate   := p_gst_rate / 2.0;  -- SGST or UTGST
        v_igst_rate   := 0;

        v_cgst_amount  := ROUND(v_taxable_amount * v_cgst_rate / 100.0, 2);
        v_sgst_amount  := ROUND(v_taxable_amount * v_sgst_rate / 100.0, 2);
        v_igst_amount  := 0;
    ELSE
        -- Inter-state: IGST only
        v_cgst_rate   := 0;
        v_sgst_rate   := 0;
        v_igst_rate   := p_gst_rate;

        v_cgst_amount  := 0;
        v_sgst_amount  := 0;
        v_igst_amount  := ROUND(v_taxable_amount * v_igst_rate / 100.0, 2);
    END IF;

    -- ─────────────────────────────────────────────────────────────────────
    -- Cess calculation (applicable for specific categories at 28% rate)
    -- Tobacco products: 5% cess
    -- Luxury cars: 15-22% cess
    -- Aerated drinks: 12% cess
    -- For general billing: assume no cess unless explicitly handled
    -- ─────────────────────────────────────────────────────────────────────
    v_cess_amount := 0;

    -- ─────────────────────────────────────────────────────────────────────
    -- Totals
    -- ─────────────────────────────────────────────────────────────────────
    v_total_tax    := ROUND(v_cgst_amount + v_sgst_amount + v_igst_amount, 2);
    v_total_amount := ROUND(v_taxable_amount + v_total_tax + v_cess_amount, 2);

    -- ─────────────────────────────────────────────────────────────────────
    -- Return result set
    -- ─────────────────────────────────────────────────────────────────────
    RETURN QUERY SELECT
        p_base_amount          AS base_amount,
        p_quantity             AS quantity,
        p_gst_rate             AS gst_rate_pct,
        v_is_intra_state       AS is_intra_state,
        p_is_inclusive         AS is_inclusive_price,
        v_taxable_amount       AS taxable_amount,
        v_cgst_rate            AS cgst_rate_pct,
        v_sgst_rate            AS sgst_rate_pct,
        v_igst_rate            AS igst_rate_pct,
        v_cgst_amount          AS cgst_amount,
        v_sgst_amount          AS sgst_amount,
        v_igst_amount          AS igst_amount,
        v_total_tax            AS total_tax_amount,
        v_total_amount         AS total_amount,
        v_cess_amount          AS cess_amount;
END;
$$;

COMMENT ON FUNCTION commerce.fn_calculate_gst(NUMERIC, INTEGER, NUMERIC, TEXT, TEXT, BOOLEAN) IS
    'Calculates Indian GST components (CGST+SGST for intra-state, IGST for inter-state). '
    'Supports both inclusive and exclusive pricing models.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Convenience overload: calculate GST for a single unit
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION commerce.fn_calculate_gst(
    p_base_amount    NUMERIC,
    p_gst_rate       NUMERIC,
    p_supplier_state TEXT    DEFAULT 'KA',
    p_buyer_state    TEXT    DEFAULT 'KA',
    p_is_inclusive   BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    taxable_amount   NUMERIC,
    cgst_amount      NUMERIC,
    sgst_amount      NUMERIC,
    igst_amount      NUMERIC,
    total_tax_amount NUMERIC,
    total_amount     NUMERIC
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        taxable_amount,
        cgst_amount,
        sgst_amount,
        igst_amount,
        total_tax_amount,
        total_amount
    FROM commerce.fn_calculate_gst(
        p_base_amount, 1, p_gst_rate,
        p_supplier_state, p_buyer_state, p_is_inclusive
    );
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Unit tests (run in a transaction that is rolled back)
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Test 1: Intra-state 18% exclusive
    -- ₹100 goods, 18% GST, Karnataka → Karnataka
    -- Expected: taxable=100, cgst=9, sgst=9, igst=0, total=118
    SELECT * INTO r
    FROM commerce.fn_calculate_gst(100.00, 1, 18.0, 'KA', 'KA', FALSE);

    ASSERT r.taxable_amount  = 100.00, 'Test 1: taxable_amount failed';
    ASSERT r.cgst_amount     = 9.00,   'Test 1: cgst_amount failed';
    ASSERT r.sgst_amount     = 9.00,   'Test 1: sgst_amount failed';
    ASSERT r.igst_amount     = 0.00,   'Test 1: igst_amount failed';
    ASSERT r.total_amount    = 118.00, 'Test 1: total_amount failed';

    -- Test 2: Inter-state 18% exclusive
    -- ₹100 goods, 18% GST, Karnataka → Maharashtra
    -- Expected: taxable=100, cgst=0, sgst=0, igst=18, total=118
    SELECT * INTO r
    FROM commerce.fn_calculate_gst(100.00, 1, 18.0, 'KA', 'MH', FALSE);

    ASSERT r.cgst_amount     = 0.00,   'Test 2: cgst_amount failed';
    ASSERT r.sgst_amount     = 0.00,   'Test 2: sgst_amount failed';
    ASSERT r.igst_amount     = 18.00,  'Test 2: igst_amount failed';
    ASSERT r.total_amount    = 118.00, 'Test 2: total_amount failed';

    -- Test 3: Inclusive pricing 18%
    -- ₹118 inclusive, 18% GST → taxable should be 100
    SELECT * INTO r
    FROM commerce.fn_calculate_gst(118.00, 1, 18.0, 'KA', 'KA', TRUE);

    ASSERT r.taxable_amount  = 100.00, 'Test 3: taxable_amount (inclusive) failed';
    ASSERT r.total_amount    = 118.00, 'Test 3: total_amount (inclusive) failed';

    -- Test 4: Zero GST rate
    -- ₹50 goods, 0% GST
    -- Expected: all tax amounts = 0, total = 50
    SELECT * INTO r
    FROM commerce.fn_calculate_gst(50.00, 1, 0.0, 'KA', 'KA', FALSE);

    ASSERT r.total_tax_amount = 0.00, 'Test 4: total_tax_amount (0%) failed';
    ASSERT r.total_amount     = 50.00,'Test 4: total_amount (0%) failed';

    -- Test 5: Multiple quantities
    -- ₹100 × 5 units, 5% GST, intra-state
    -- Expected: taxable=500, cgst=12.5, sgst=12.5, total=525
    SELECT * INTO r
    FROM commerce.fn_calculate_gst(100.00, 5, 5.0, 'KA', 'KA', FALSE);

    ASSERT r.taxable_amount  = 500.00, 'Test 5: taxable_amount (qty) failed';
    ASSERT r.cgst_amount     = 12.50,  'Test 5: cgst_amount (qty) failed';
    ASSERT r.total_amount    = 525.00, 'Test 5: total_amount (qty) failed';

    RAISE NOTICE 'fn_calculate_gst: All 5 unit tests PASSED';
END
$$;
