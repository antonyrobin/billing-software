-- =============================================================================
-- vw_stock_summary.sql  (Rerunnable — R prefix in DbUp)
--
-- Stock Summary View with Expiry Analysis
--
-- Provides a real-time summary of stock levels per product per location per
-- tenant. Includes expiry categorization for pharmaceutical/FMCG businesses.
--
-- Categories:
--   expired       → expiry_date < today
--   expiring_soon → expiry_date within next 30 days
--   near_expiry   → expiry_date within 31-90 days
--   good          → expiry_date > 90 days from today OR no expiry date
--
-- Used by:
--   • Inventory dashboard (current stock levels)
--   • Low stock alerts (stock <= reorder_level)
--   • Expiry management (pharmacy, FMCG)
--   • Stock valuation reports
--
-- Dependencies:
--   catalog.products
--   catalog.product_variants
--   catalog.stock_entries
--   catalog.inventory_locations
-- =============================================================================

CREATE OR REPLACE VIEW catalog.vw_stock_summary AS
WITH stock_aggregated AS (
    -- Aggregate stock entries by product + variant + location + batch
    SELECT
        se.tenant_id,
        se.product_id,
        se.variant_id,
        se.location_id,
        se.batch_number,
        se.expiry_date,
        se.unit_cost,
        se.mrp,                          -- Maximum Retail Price
        SUM(se.quantity_in)  AS qty_in,  -- Total quantity received
        SUM(se.quantity_out) AS qty_out, -- Total quantity issued/sold
        SUM(se.quantity_in) - SUM(se.quantity_out) AS qty_available,
        MIN(se.created_at)   AS first_receipt_date,
        MAX(se.created_at)   AS last_receipt_date
    FROM catalog.stock_entries se
    GROUP BY
        se.tenant_id,
        se.product_id,
        se.variant_id,
        se.location_id,
        se.batch_number,
        se.expiry_date,
        se.unit_cost,
        se.mrp
    HAVING
        -- Only show rows with positive available quantity
        -- (negative = data error, should be investigated separately)
        SUM(se.quantity_in) - SUM(se.quantity_out) > 0
),

stock_with_expiry AS (
    SELECT
        sa.*,
        CASE
            WHEN sa.expiry_date IS NULL THEN 'no_expiry'
            WHEN sa.expiry_date < CURRENT_DATE THEN 'expired'
            WHEN sa.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
            WHEN sa.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'near_expiry'
            ELSE 'good'
        END AS expiry_status,
        CASE
            WHEN sa.expiry_date IS NOT NULL THEN
                sa.expiry_date - CURRENT_DATE
            ELSE NULL
        END AS days_until_expiry
    FROM stock_aggregated sa
)

SELECT
    -- Identifiers
    swe.tenant_id,
    swe.product_id,
    swe.variant_id,
    swe.location_id,
    swe.batch_number,

    -- Product information
    p.name                  AS product_name,
    p.sku                   AS product_sku,
    p.hsn_code,
    p.gst_rate,
    p.category_id,
    c.name                  AS category_name,
    p.brand_id,
    b.name                  AS brand_name,
    p.unit_of_measure       AS uom,
    p.reorder_level,
    p.minimum_order_qty,

    -- Variant information (NULL if product has no variants)
    pv.name                 AS variant_name,
    pv.barcode              AS variant_barcode,
    pv.sku                  AS variant_sku,

    -- Location information
    il.name                 AS location_name,
    il.location_type,       -- warehouse, shelf, cold_storage

    -- Stock quantities
    swe.qty_in              AS total_received,
    swe.qty_out             AS total_issued,
    swe.qty_available       AS current_stock,

    -- Pricing
    swe.unit_cost,
    swe.mrp,
    ROUND(swe.qty_available * swe.unit_cost, 2) AS stock_value,  -- At cost
    ROUND(swe.qty_available * swe.mrp, 2)       AS stock_value_at_mrp,

    -- Expiry information
    swe.expiry_date,
    swe.days_until_expiry,
    swe.expiry_status,

    -- Reorder analysis
    CASE
        WHEN swe.qty_available <= 0 THEN 'out_of_stock'
        WHEN swe.qty_available <= p.reorder_level THEN 'reorder_required'
        WHEN swe.qty_available <= (p.reorder_level * 1.5) THEN 'low_stock'
        ELSE 'adequate'
    END AS stock_status,

    -- Timestamps
    swe.first_receipt_date,
    swe.last_receipt_date,
    CURRENT_TIMESTAMP       AS report_generated_at

FROM stock_with_expiry swe

-- Join product details
INNER JOIN catalog.products p
    ON p.id = swe.product_id
    AND p.tenant_id = swe.tenant_id
    AND p.is_deleted = FALSE

-- Join category
LEFT JOIN catalog.categories c
    ON c.id = p.category_id
    AND c.tenant_id = swe.tenant_id

-- Join brand
LEFT JOIN catalog.brands b
    ON b.id = p.brand_id
    AND b.tenant_id = swe.tenant_id

-- Join variant (optional)
LEFT JOIN catalog.product_variants pv
    ON pv.id = swe.variant_id
    AND pv.tenant_id = swe.tenant_id

-- Join location
INNER JOIN catalog.inventory_locations il
    ON il.id = swe.location_id
    AND il.tenant_id = swe.tenant_id
    AND il.is_active = TRUE

-- Only show active products
WHERE p.is_active = TRUE;

COMMENT ON VIEW catalog.vw_stock_summary IS
    'Real-time stock summary with expiry analysis. '
    'Aggregates stock_entries by product/variant/location/batch. '
    'Includes stock status (out_of_stock/reorder/low/adequate) and '
    'expiry categorization (expired/expiring_soon/near_expiry/good/no_expiry).';

-- ─────────────────────────────────────────────────────────────────────────────
-- Supporting view: Expired stock report (for write-off)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW catalog.vw_expired_stock AS
SELECT
    tenant_id,
    product_id,
    product_name,
    product_sku,
    location_name,
    batch_number,
    expiry_date,
    current_stock         AS expired_quantity,
    stock_value           AS expired_value_at_cost,
    ABS(days_until_expiry) AS days_since_expiry,
    report_generated_at
FROM catalog.vw_stock_summary
WHERE expiry_status = 'expired'
ORDER BY expiry_date ASC;

COMMENT ON VIEW catalog.vw_expired_stock IS
    'Shows only expired stock that needs to be written off. '
    'Used for inventory write-off reports and compliance.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Supporting view: Low/Out-of-stock report (for reordering)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW catalog.vw_reorder_list AS
SELECT
    tenant_id,
    product_id,
    product_name,
    product_sku,
    category_name,
    brand_name,
    location_name,
    current_stock,
    reorder_level,
    minimum_order_qty,
    reorder_level - current_stock AS shortfall,
    stock_status,
    last_receipt_date,
    report_generated_at
FROM catalog.vw_stock_summary
WHERE stock_status IN ('out_of_stock', 'reorder_required')
  AND expiry_status != 'expired'
ORDER BY stock_status DESC, shortfall DESC;

COMMENT ON VIEW catalog.vw_reorder_list IS
    'Products at or below reorder level, sorted by urgency. '
    'Used for purchase order generation and inventory alerts.';

RAISE NOTICE 'vw_stock_summary.sql: Stock summary views created';
