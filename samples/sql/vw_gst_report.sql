-- =============================================================================
-- vw_gst_report.sql  (Rerunnable — R prefix in DbUp)
--
-- GST Report View for GSTR-1 Filing
--
-- GSTR-1 is the monthly/quarterly return of outward supplies filed with the
-- Indian GST portal. This view pre-aggregates invoice data in the format
-- required for GSTR-1 filing.
--
-- GSTR-1 Sections:
--   B2B  → Invoices to registered businesses (B2B supplies)
--   B2C  → Invoices to consumers (B2C supplies, state-wise)
--   CDNR → Credit/Debit notes to registered parties
--   EXP  → Export invoices (zero-rated)
--   HSN  → HSN-wise summary of outward supplies
--
-- Key GSTR-1 fields:
--   • GSTIN of buyer (for B2B)
--   • Invoice number and date
--   • Taxable value
--   • IGST / CGST / SGST amounts
--   • HSN/SAC code
--
-- Dependencies:
--   commerce.invoices, commerce.invoice_items
--   identity.tenants, catalog.products
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GSTR-1 B2B Summary: Business-to-Business supplies
-- (All invoices where buyer has a GSTIN)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW commerce.vw_gstr1_b2b AS
SELECT
    -- Tenant/Filing period
    i.tenant_id,
    t.gstin                              AS supplier_gstin,
    t.legal_name                         AS supplier_name,
    DATE_TRUNC('month', i.invoice_date)::DATE AS tax_period,   -- YYYY-MM-01

    -- Buyer details
    i.buyer_gstin,
    i.buyer_name,
    i.buyer_state_code,

    -- Invoice details
    i.invoice_number,
    i.invoice_date,
    i.invoice_type,      -- 'REGULAR', 'DEBIT_NOTE', 'CREDIT_NOTE'
    i.supply_type,       -- 'INTRA_STATE', 'INTER_STATE'
    i.reverse_charge,    -- TRUE if reverse charge applicable

    -- Financial summary
    i.taxable_amount,
    i.cgst_amount,
    i.sgst_amount,
    i.igst_amount,
    i.cess_amount,
    i.total_amount,

    -- HSN-wise breakdown
    (
        SELECT jsonb_agg(
            jsonb_build_object(
                'hsn_code',       ii.hsn_code,
                'description',    ii.description,
                'uom',            ii.unit_of_measure,
                'quantity',       SUM(ii.quantity),
                'taxable_value',  SUM(ii.taxable_amount),
                'gst_rate',       ii.gst_rate,
                'cgst',           SUM(ii.cgst_amount),
                'sgst',           SUM(ii.sgst_amount),
                'igst',           SUM(ii.igst_amount),
                'cess',           SUM(ii.cess_amount)
            )
            ORDER BY ii.hsn_code
        )
        FROM commerce.invoice_items ii
        WHERE ii.invoice_id = i.id
          AND ii.tenant_id  = i.tenant_id
        GROUP BY ii.hsn_code, ii.description, ii.unit_of_measure, ii.gst_rate
    ) AS hsn_breakdown,

    -- Metadata
    i.id                                 AS invoice_id,
    i.created_at

FROM commerce.invoices i

INNER JOIN identity.tenants t
    ON t.id = i.tenant_id

WHERE
    -- Only B2B: buyer has GSTIN
    i.buyer_gstin IS NOT NULL
    AND i.buyer_gstin != ''
    -- Only confirmed invoices (not draft/cancelled)
    AND i.status IN ('confirmed', 'paid', 'partially_paid')
    AND i.is_deleted = FALSE;

COMMENT ON VIEW commerce.vw_gstr1_b2b IS
    'GSTR-1 B2B supplies: Invoices issued to registered businesses (have GSTIN). '
    'Required for monthly/quarterly GSTR-1 filing on GST portal.';

-- ─────────────────────────────────────────────────────────────────────────────
-- GSTR-1 B2C Summary: Business-to-Consumer supplies (state-wise)
-- (Invoices where buyer does NOT have a GSTIN, aggregated by state)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW commerce.vw_gstr1_b2c AS
SELECT
    i.tenant_id,
    t.gstin                              AS supplier_gstin,
    DATE_TRUNC('month', i.invoice_date)::DATE AS tax_period,

    -- B2C: aggregate by state + rate (no individual invoice needed for small amounts)
    i.buyer_state_code,
    ii.gst_rate,
    i.supply_type,

    -- Aggregated amounts
    COUNT(DISTINCT i.id)                 AS invoice_count,
    SUM(ii.taxable_amount)               AS total_taxable_value,
    SUM(ii.cgst_amount)                  AS total_cgst,
    SUM(ii.sgst_amount)                  AS total_sgst,
    SUM(ii.igst_amount)                  AS total_igst,
    SUM(ii.cess_amount)                  AS total_cess,
    SUM(ii.total_amount)                 AS total_invoice_value

FROM commerce.invoices i

INNER JOIN identity.tenants t
    ON t.id = i.tenant_id

INNER JOIN commerce.invoice_items ii
    ON ii.invoice_id = i.id
    AND ii.tenant_id = i.tenant_id

WHERE
    -- Only B2C: buyer does NOT have GSTIN
    (i.buyer_gstin IS NULL OR i.buyer_gstin = '')
    AND i.status IN ('confirmed', 'paid', 'partially_paid')
    AND i.is_deleted = FALSE

GROUP BY
    i.tenant_id,
    t.gstin,
    DATE_TRUNC('month', i.invoice_date),
    i.buyer_state_code,
    ii.gst_rate,
    i.supply_type;

COMMENT ON VIEW commerce.vw_gstr1_b2c IS
    'GSTR-1 B2C supplies: Invoices issued to unregistered consumers, '
    'aggregated by state and GST rate as required by GSTR-1 Table 7.';

-- ─────────────────────────────────────────────────────────────────────────────
-- GSTR-1 HSN Summary: HSN/SAC-wise outward supply summary
-- (Mandatory for annual turnover > ₹1.5 Cr)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW commerce.vw_gstr1_hsn AS
SELECT
    i.tenant_id,
    t.gstin                              AS supplier_gstin,
    DATE_TRUNC('month', i.invoice_date)::DATE AS tax_period,

    -- HSN details
    ii.hsn_code,
    ii.description,
    ii.unit_of_measure                   AS uom,
    ii.gst_rate,

    -- Aggregated quantities and values
    SUM(ii.quantity)                     AS total_quantity,
    SUM(ii.taxable_amount)               AS total_taxable_value,
    SUM(ii.cgst_amount)                  AS total_cgst,
    SUM(ii.sgst_amount)                  AS total_sgst,
    SUM(ii.igst_amount)                  AS total_igst,
    SUM(ii.cess_amount)                  AS total_cess,

    -- Count of invoices with this HSN
    COUNT(DISTINCT i.id)                 AS invoice_count

FROM commerce.invoices i

INNER JOIN identity.tenants t
    ON t.id = i.tenant_id

INNER JOIN commerce.invoice_items ii
    ON ii.invoice_id = i.id
    AND ii.tenant_id = i.tenant_id

WHERE
    i.status IN ('confirmed', 'paid', 'partially_paid')
    AND i.is_deleted = FALSE
    AND ii.hsn_code IS NOT NULL

GROUP BY
    i.tenant_id,
    t.gstin,
    DATE_TRUNC('month', i.invoice_date),
    ii.hsn_code,
    ii.description,
    ii.unit_of_measure,
    ii.gst_rate

ORDER BY
    i.tenant_id,
    tax_period,
    ii.hsn_code;

COMMENT ON VIEW commerce.vw_gstr1_hsn IS
    'GSTR-1 HSN Summary: Outward supplies grouped by HSN/SAC code and tax rate. '
    'Required in GSTR-1 Table 12 for taxpayers with turnover > ₹1.5 Cr.';

-- ─────────────────────────────────────────────────────────────────────────────
-- Monthly GST liability summary (for ITC and payment calculation)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW commerce.vw_gst_liability_summary AS
SELECT
    i.tenant_id,
    t.gstin                              AS supplier_gstin,
    t.legal_name                         AS supplier_name,
    DATE_TRUNC('month', i.invoice_date)::DATE AS tax_period,

    -- Supply type breakdown
    COUNT(DISTINCT i.id)                 AS total_invoices,
    COUNT(DISTINCT CASE WHEN i.supply_type = 'INTRA_STATE' THEN i.id END) AS intra_state_invoices,
    COUNT(DISTINCT CASE WHEN i.supply_type = 'INTER_STATE' THEN i.id END) AS inter_state_invoices,

    -- Taxable turnover
    SUM(i.taxable_amount)                AS total_taxable_value,

    -- GST liability (output tax)
    SUM(i.cgst_amount)                   AS output_cgst,
    SUM(i.sgst_amount)                   AS output_sgst,
    SUM(i.igst_amount)                   AS output_igst,
    SUM(i.cess_amount)                   AS output_cess,
    SUM(i.cgst_amount + i.sgst_amount + i.igst_amount + i.cess_amount) AS total_output_tax,

    -- Total invoice value
    SUM(i.total_amount)                  AS total_invoice_value

FROM commerce.invoices i

INNER JOIN identity.tenants t
    ON t.id = i.tenant_id

WHERE
    i.status IN ('confirmed', 'paid', 'partially_paid')
    AND i.is_deleted = FALSE

GROUP BY
    i.tenant_id,
    t.gstin,
    t.legal_name,
    DATE_TRUNC('month', i.invoice_date)

ORDER BY
    i.tenant_id,
    tax_period DESC;

COMMENT ON VIEW commerce.vw_gst_liability_summary IS
    'Monthly GST output tax liability summary per tenant. '
    'Used for GST return filing, ITC utilization planning, and tax payment.';

RAISE NOTICE 'vw_gst_report.sql: GST report views created (B2B, B2C, HSN, Liability)';
