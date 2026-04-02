-- =============================================================================
-- V999_001__SeedGSTRates.sql
--
-- Seed Data: Indian GST Rate Slabs and HSN Code Mappings
--
-- This is a versioned script (V prefix) — it runs ONCE.
-- If rates change, create a new versioned script (V999_002, etc.)
--
-- Covers:
--   1. GST rate slabs (0%, 5%, 12%, 18%, 28%)
--   2. Common HSN code mappings for billing/pharmacy/FMCG/retail
--
-- Source: CBIC (Central Board of Indirect Taxes and Customs) GST rate schedule
-- Reference: https://www.cbic.gov.in/resources/htdocs-cbec/gst/chapter-1.pdf
-- Last updated: April 2025 (includes GST Council 53rd meeting changes)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GST Rate Slabs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.gst_rates (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    rate        NUMERIC(5,2) NOT NULL UNIQUE,   -- 0.00, 5.00, 12.00, 18.00, 28.00
    description TEXT         NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO commerce.gst_rates (rate, description) VALUES
    (0.00,  'Exempt / Zero-rated (essential goods, exports)'),
    (0.10,  'Special 0.1% rate (rough precious stones)'),
    (0.25,  'Special 0.25% rate (rough diamonds)'),
    (1.00,  '1% GST (affordable housing)'),
    (1.50,  '1.5% GST (cut/semi-polished precious stones)'),
    (3.00,  '3% GST (gold, silver, jewellery)'),
    (5.00,  '5% GST (essential commodities, daily use items)'),
    (6.00,  '6% GST (textile job work)'),
    (7.50,  '7.5% GST (caissons, coffer dams)'),
    (12.00, '12% GST (processed food, computers, business services)'),
    (18.00, '18% GST (standard rate — most goods and services)'),
    (28.00, '28% GST (luxury goods, sin goods, demerit goods)')
ON CONFLICT (rate) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- HSN Code Master Table
-- HSN = Harmonised System of Nomenclature (6-digit international code)
-- SAC = Services Accounting Code (for services)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS commerce.hsn_codes (
    id              UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    hsn_code        TEXT         NOT NULL UNIQUE,   -- 2 to 8 digit code
    description     TEXT         NOT NULL,
    chapter         TEXT,                            -- 2-digit chapter (e.g. '30' for pharma)
    gst_rate        NUMERIC(5,2) NOT NULL DEFAULT 0,
    cess_rate       NUMERIC(5,2) NOT NULL DEFAULT 0, -- Additional cess (tobacco, luxury)
    unit_of_measure TEXT         NOT NULL DEFAULT 'NOS', -- NOS, KGS, LTR, MTR, etc.
    is_service      BOOLEAN      NOT NULL DEFAULT FALSE,  -- TRUE for SAC codes
    notes           TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

COMMENT ON TABLE commerce.hsn_codes IS
    'HSN (Harmonised System of Nomenclature) code master for GST. '
    'Used for invoice line items and GSTR-1 HSN summary.';

CREATE INDEX IF NOT EXISTS idx_hsn_code ON commerce.hsn_codes (hsn_code);
CREATE INDEX IF NOT EXISTS idx_hsn_chapter ON commerce.hsn_codes (chapter);

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed: Common HSN codes for retail/FMCG/pharmacy
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO commerce.hsn_codes (hsn_code, description, chapter, gst_rate, unit_of_measure, notes)
VALUES

-- ── Chapter 02: Meat ────────────────────────────────────────────────────────
('0201', 'Meat of bovine animals, fresh or chilled', '02', 0.00, 'KGS', NULL),
('0207', 'Poultry meat, fresh or chilled', '02', 0.00, 'KGS', NULL),

-- ── Chapter 03: Fish ────────────────────────────────────────────────────────
('0301', 'Live fish', '03', 0.00, 'KGS', NULL),
('0302', 'Fish, fresh or chilled', '03', 5.00, 'KGS', NULL),
('0304', 'Fish fillets and fish meat', '03', 5.00, 'KGS', NULL),

-- ── Chapter 04: Dairy ────────────────────────────────────────────────────────
('0401', 'Milk and cream, not concentrated', '04', 0.00, 'LTR', 'Exempt'),
('0402', 'Milk and cream, concentrated', '04', 5.00, 'LTR', NULL),
('0405', 'Butter and dairy spreads', '04', 12.00, 'KGS', NULL),
('0406', 'Cheese', '04', 12.00, 'KGS', NULL),

-- ── Chapter 07: Vegetables ───────────────────────────────────────────────────
('0701', 'Potatoes, fresh or chilled', '07', 0.00, 'KGS', 'Exempt'),
('0702', 'Tomatoes, fresh or chilled', '07', 0.00, 'KGS', 'Exempt'),
('0703', 'Onions, fresh or chilled', '07', 0.00, 'KGS', 'Exempt'),

-- ── Chapter 08: Fruits ───────────────────────────────────────────────────────
('0803', 'Bananas, fresh', '08', 0.00, 'KGS', 'Exempt'),
('0804', 'Dates, figs, mangoes, fresh', '08', 0.00, 'KGS', 'Exempt'),
('0806', 'Grapes, fresh', '08', 0.00, 'KGS', 'Exempt'),

-- ── Chapter 10: Cereals ──────────────────────────────────────────────────────
('1001', 'Wheat and meslin', '10', 0.00, 'KGS', 'Exempt in unprocessed form'),
('1006', 'Rice', '10', 0.00, 'KGS', 'Unbranded exempt; branded 5%'),
('1006101', 'Rice — branded', '10', 5.00, 'KGS', NULL),

-- ── Chapter 17: Sugar ────────────────────────────────────────────────────────
('1701', 'Cane or beet sugar', '17', 5.00, 'KGS', NULL),
('1703', 'Molasses', '17', 28.00, 'KGS', NULL),

-- ── Chapter 19: Preparations of cereals ─────────────────────────────────────
('1902', 'Pasta, instant noodles', '19', 18.00, 'KGS', NULL),
('1905', 'Bread, pastry, biscuits, waffles', '19', 18.00, 'KGS', '28% for premium biscuits >₹100/kg'),

-- ── Chapter 21: Miscellaneous food ───────────────────────────────────────────
('2101', 'Extracts of coffee, tea, chicory', '21', 18.00, 'KGS', NULL),
('2106', 'Food preparations n.e.c.', '21', 18.00, 'KGS', NULL),

-- ── Chapter 22: Beverages ────────────────────────────────────────────────────
('2201', 'Waters, including mineral and aerated', '22', 18.00, 'LTR', 'Packaged water 18%'),
('2202', 'Aerated drinks with sugar', '22', 28.00, 'LTR', '28% + 12% cess'),
('2203', 'Beer', '22', 28.00, 'LTR', NULL),
('2208', 'Spirits (whisky, vodka, etc.)', '22', 28.00, 'LTR', '+ additional state cess'),

-- ── Chapter 24: Tobacco ──────────────────────────────────────────────────────
('2401', 'Unmanufactured tobacco', '24', 28.00, 'KGS', '+ 71% ad valorem cess'),
('2402', 'Cigars, cigarillos, cigarettes', '24', 28.00, 'NOS', '+ Rs.5/stick cess'),

-- ── Chapter 30: Pharmaceutical ───────────────────────────────────────────────
('3001', 'Glands and other organs for therapeutic use', '30', 12.00, 'KGS', NULL),
('3002', 'Human blood, vaccines, toxins', '30', 5.00, 'NOS', NULL),
('3003', 'Medicaments (mixed), not in measured doses', '30', 12.00, 'KGS', NULL),
('3004', 'Medicaments in measured doses (retail)', '30', 12.00, 'NOS', 'Prescription drugs'),
('3005', 'Wadding, gauze, bandages', '30', 12.00, 'NOS', NULL),
('3006', 'Pharmaceutical goods', '30', 12.00, 'NOS', NULL),

-- ── Chapter 33: Cosmetics ────────────────────────────────────────────────────
('3301', 'Essential oils', '33', 18.00, 'LTR', NULL),
('3304', 'Beauty/make-up preparations', '33', 18.00, 'NOS', NULL),
('3305', 'Preparations for hair', '33', 18.00, 'NOS', NULL),
('3306', 'Oral hygiene, toothpaste', '33', 18.00, 'NOS', NULL),

-- ── Chapter 34: Soap ─────────────────────────────────────────────────────────
('3401', 'Soap, cleansing products', '34', 18.00, 'NOS', NULL),
('3402', 'Detergents, washing preparations', '34', 18.00, 'KGS', NULL),

-- ── Chapter 39: Plastics ─────────────────────────────────────────────────────
('3923', 'Sacks, bags and cases of plastic', '39', 18.00, 'KGS', NULL),
('3924', 'Tableware, kitchenware of plastics', '39', 18.00, 'NOS', NULL),

-- ── Chapter 48: Paper ────────────────────────────────────────────────────────
('4817', 'Envelopes, letter cards, postcards', '48', 12.00, 'NOS', NULL),
('4820', 'Registers, account books, notebooks', '48', 12.00, 'NOS', NULL),
('4821', 'Paper or paperboard labels', '48', 12.00, 'KGS', NULL),

-- ── Chapter 52: Cotton ───────────────────────────────────────────────────────
('5208', 'Cotton fabrics, ≤200g/m²', '52', 5.00, 'MTR', NULL),

-- ── Chapter 61: Apparel ──────────────────────────────────────────────────────
('6101', 'Overcoats, jackets (men)', '61', 12.00, 'NOS', NULL),
('6109', 'T-shirts, singlets (knitted)', '61', 12.00, 'NOS', NULL),
('6115', 'Pantyhose, tights, hosiery', '61', 12.00, 'NOS', NULL),

-- ── Chapter 62: Woven apparel ────────────────────────────────────────────────
('6201', 'Men''s overcoats and similar (woven)', '62', 12.00, 'NOS', NULL),
('6211', 'Track suits, swimwear', '62', 12.00, 'NOS', NULL),

-- ── Chapter 64: Footwear ─────────────────────────────────────────────────────
('6401', 'Waterproof footwear', '64', 5.00, 'PAIR', '≤₹1000 MRP: 5%; >₹1000: 18%'),
('6403', 'Footwear with outer soles of rubber', '64', 18.00, 'PAIR', NULL),
('6404', 'Footwear with outer soles of rubber (textile)', '64', 18.00, 'PAIR', NULL),

-- ── Chapter 73: Iron/Steel ───────────────────────────────────────────────────
('7313', 'Barbed wire of iron/steel', '73', 18.00, 'KGS', NULL),
('7323', 'Household articles of iron/steel', '73', 18.00, 'NOS', NULL),

-- ── Chapter 84: Machinery ────────────────────────────────────────────────────
('8415', 'Air conditioning machines', '84', 28.00, 'NOS', NULL),
('8471', 'Computers', '84', 18.00, 'NOS', NULL),
('8517', 'Mobile phones', '85', 18.00, 'NOS', NULL),

-- ── Chapter 85: Electrical ───────────────────────────────────────────────────
('8504', 'Electrical transformers, static converters', '85', 18.00, 'NOS', NULL),
('8507', 'Batteries (electric accumulators)', '85', 28.00, 'NOS', NULL),
('8516', 'Electric water heaters, hair dryers', '85', 28.00, 'NOS', NULL),

-- ── Chapter 87: Motor vehicles ───────────────────────────────────────────────
('8703', 'Motor cars and vehicles', '87', 28.00, 'NOS', '+ 15-22% cess for luxury'),
('8711', 'Motorcycles', '87', 28.00, 'NOS', NULL),
('8714', 'Parts for motor cycles, cycles', '87', 28.00, 'NOS', NULL),

-- ── SAC Codes (Services) ─────────────────────────────────────────────────────
('9954', 'Construction services', '99', 18.00, 'NOS', 'SAC code for services'),
('9963', 'Accommodation, food and beverage services', '99', 18.00, 'NOS', NULL),
('9971', 'Financial and related services', '99', 18.00, 'NOS', NULL),
('9972', 'Real estate services', '99', 18.00, 'NOS', NULL),
('9973', 'Leasing or rental services', '99', 18.00, 'NOS', NULL),
('9982', 'Research and development services', '99', 18.00, 'NOS', NULL),
('9983', 'Other professional and business services', '99', 18.00, 'NOS', NULL),
('9984', 'Telecommunications and broadcasting', '99', 18.00, 'NOS', NULL),
('9985', 'Support services', '99', 18.00, 'NOS', NULL),
('9997', 'Other services n.e.c.', '99', 18.00, 'NOS', NULL)

ON CONFLICT (hsn_code) DO NOTHING;

-- Update SAC codes
UPDATE commerce.hsn_codes SET is_service = TRUE WHERE chapter = '99';

DO $$
DECLARE
    v_hsn_count  INT;
    v_rate_count INT;
BEGIN
    SELECT COUNT(*) INTO v_hsn_count  FROM commerce.hsn_codes;
    SELECT COUNT(*) INTO v_rate_count FROM commerce.gst_rates;
    RAISE NOTICE 'V999_001 complete: % GST rates, % HSN codes seeded',
        v_rate_count, v_hsn_count;
END
$$;
