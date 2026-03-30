# LOW-LEVEL REQUIREMENTS DOCUMENT

---

## MODULE 1: BUSINESS SETUP & CONFIGURATION

### 1.1 Company/Shop Registration (BUS-001)

| FR ID | Requirement | Priority |
|---|---|---|
| BUS-001-FR-01 | System shall allow business owner to register with company name, address, contact details | High |
| BUS-001-FR-02 | System shall support GSTIN/Tax ID, PAN, and business registration number capture | High |
| BUS-001-FR-03 | System shall allow logo upload and brand color customization | Medium |
| BUS-001-FR-04 | System shall support multiple contact persons per business | Medium |
| BUS-001-FR-05 | System shall allow business hours configuration (open/close times per day) | High |
| BUS-001-FR-06 | System shall support currency, timezone, and locale settings | High |
| BUS-001-FR-07 | System shall generate a unique Business ID upon successful registration | High |

**Acceptance Criteria:**
- Business registration completes within 5 minutes
- All mandatory fields validated before submission
- Unique GSTIN/Tax ID enforced across tenants
- Confirmation email sent after successful registration

**Technical Specs:**
- REST API: `POST /api/v1/businesses`
- Authentication: Admin token required
- Data storage: PostgreSQL `businesses` table
- File storage: S3/Cloud bucket for logo

---

### 1.2 Multi-Location Setup (BUS-002)

| FR ID | Requirement | Priority |
|---|---|---|
| BUS-002-FR-01 | System shall allow a business to add multiple physical locations/branches | High |
| BUS-002-FR-02 | Each location shall have its own address, contact, and operating hours | High |
| BUS-002-FR-03 | System shall support location-specific inventory management | High |
| BUS-002-FR-04 | System shall allow central and decentralized pricing per location | Medium |
| BUS-002-FR-05 | System shall provide location-level and consolidated reporting | High |
| BUS-002-FR-06 | System shall allow inter-location stock transfers | Medium |
| BUS-002-FR-07 | System shall support location-specific tax configurations | Medium |

**Acceptance Criteria:**
- Unlimited locations supported per business
- Location manager role can be assigned per branch
- Stock visibility configurable (centralized vs. per-location)
- Reports filterable by location

**Technical Specs:**
- REST API: `POST /api/v1/businesses/{business_id}/locations`
- Data storage: PostgreSQL `business_locations` table
- Location hierarchy: Business → Location → Shelf/Rack

---

### 1.3 Business Type Configuration (BUS-003)

**Supported Business Types:**
- **Retail** — Standard POS, barcode scanning, inventory
- **Restaurant** — Table management, kitchen display, menu
- **Pharmacy** — Expiry tracking, prescription management, drug catalog
- **Grocery** — Weight-based billing, perishables, bulk pricing
- **Hotel** — Room booking, housekeeping, food & beverage
- **Hospital** — Patient billing, OPD/IPD management, insurance
- **School** — Fee management, batch/class config, subscription
- **E-commerce** — Online catalog, cart, delivery management

| FR ID | Requirement | Priority |
|---|---|---|
| BUS-003-FR-01 | System shall present business type selection during onboarding | High |
| BUS-003-FR-02 | System shall automatically enable/disable modules based on business type | High |
| BUS-003-FR-03 | System shall allow business type change with data migration support | Low |
| BUS-003-FR-04 | System shall support hybrid business types (e.g., Pharmacy + Retail) | Medium |
| BUS-003-FR-05 | System shall provide business-type-specific default configurations | High |

**Acceptance Criteria:**
- All 8 business types supported at launch
- Module toggling takes effect immediately
- Hybrid configuration saves without conflict

**Technical Specs:**
- Configuration stored in `business_configurations` table (JSONB)
- Feature flags evaluated at runtime per business type
- REST API: `PUT /api/v1/businesses/{business_id}/configuration`

---

## MODULE 2: MASTER DATA MANAGEMENT

### 2.1 Item Master (MDM-001)

| FR ID | Requirement | Priority |
|---|---|---|
| MDM-001-FR-01 | System shall allow creation of product/item with name, description, SKU | High |
| MDM-001-FR-02 | System shall support multiple images per item | Medium |
| MDM-001-FR-03 | System shall allow item categorization with multi-level categories | High |
| MDM-001-FR-04 | System shall support custom attributes per item type | High |
| MDM-001-FR-05 | System shall allow multiple pricing tiers per item | High |
| MDM-001-FR-06 | System shall support unit of measure (UOM) configuration | High |
| MDM-001-FR-07 | System shall allow item variants (size, color, weight) | Medium |
| MDM-001-FR-08 | System shall support item bundling/combo creation | Medium |

**Item Attributes:**
```
Item {
  id: UUID
  business_id: UUID
  name: string
  description: text
  sku: string (unique per business)
  barcode: string
  qr_code: string
  category_id: UUID
  brand_id: UUID
  type_id: UUID
  packing_size_id: UUID
  unit_of_measure: enum(kg, g, l, ml, pcs, box, dozen)
  cost_price: decimal
  selling_price: decimal
  mrp: decimal
  tax_category_id: UUID
  min_stock_level: integer
  max_stock_level: integer
  reorder_level: integer
  is_active: boolean
  is_perishable: boolean
  has_variants: boolean
  custom_attributes: JSONB
  images: array[string]
  created_at: timestamp
  updated_at: timestamp
}
```

**Acceptance Criteria:**
- Item creation/update completes in < 2 seconds
- SKU uniqueness enforced per business
- Barcode auto-generated if not provided
- Bulk import via CSV supported (up to 10,000 items)

**Technical Specs:**
- REST API: `POST /api/v1/items`, `GET /api/v1/items`, `PUT /api/v1/items/{id}`
- Elasticsearch indexing for search
- Image upload: S3 with CDN
- Bulk import: Background job with progress tracking

---

### 2.2 Categories Management (MDM-002)

| FR ID | Requirement | Priority |
|---|---|---|
| MDM-002-FR-01 | System shall support hierarchical category structure (unlimited depth) | High |
| MDM-002-FR-02 | System shall allow category image and description | Medium |
| MDM-002-FR-03 | System shall support category-level tax and discount configurations | High |
| MDM-002-FR-04 | System shall allow drag-and-drop reordering of categories | Low |
| MDM-002-FR-05 | System shall support category-specific attributes/fields | Medium |

**Acceptance Criteria:**
- Category tree renders correctly for 5+ levels
- Category deletion handles re-assignment of child items
- Category-level configurations cascade to items

---

### 2.3 Brands/Types/Packing Sizes (MDM-003)

| FR ID | Requirement | Priority |
|---|---|---|
| MDM-003-FR-01 | System shall allow management of product brands | Medium |
| MDM-003-FR-02 | System shall allow management of product types/sub-types | Medium |
| MDM-003-FR-03 | System shall allow management of packing sizes and units | High |
| MDM-003-FR-04 | System shall support brand logo upload | Low |
| MDM-003-FR-05 | System shall allow linking brands/types to specific categories | Medium |

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, name)
);

CREATE TABLE types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE packing_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(100) NOT NULL,
    value DECIMAL(10,3),
    unit VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.4 Barcode & QR Code Management (MDM-004)

| FR ID | Requirement | Priority |
|---|---|---|
| MDM-004-FR-01 | System shall auto-generate EAN-13 barcodes for items without one | High |
| MDM-004-FR-02 | System shall support manual barcode entry and validation | High |
| MDM-004-FR-03 | System shall generate QR codes with embedded item details | High |
| MDM-004-FR-04 | System shall allow barcode scanning via device camera | High |
| MDM-004-FR-05 | System shall support bulk barcode printing (PDF) | Medium |

**Barcode Formats Supported:**
- EAN-13 (default for retail)
- EAN-8 (compact)
- Code-128 (alphanumeric)
- QR Code (multi-data)
- DataMatrix (pharmaceutical)

**QR Code Data Structure:**
```json
{
  "item_id": "uuid",
  "sku": "SKU-001",
  "name": "Product Name",
  "mrp": 100.00,
  "business_id": "uuid",
  "url": "https://app.example.com/items/uuid"
}
```

**API Endpoints:**
- `GET /api/v1/items/{id}/barcode` — Download barcode image
- `GET /api/v1/items/{id}/qrcode` — Download QR code image
- `POST /api/v1/items/scan` — Scan barcode/QR and return item details
- `POST /api/v1/items/barcodes/bulk-print` — Generate bulk barcode PDF

---

## MODULE 3: INVENTORY MANAGEMENT

### 3.1 Stock Management by Location (INV-001)

| FR ID | Requirement | Priority |
|---|---|---|
| INV-001-FR-01 | System shall track stock quantity per item per location | High |
| INV-001-FR-02 | System shall record all stock movements (in/out/transfer/adjustment) | High |
| INV-001-FR-03 | System shall support shelf/rack level stock tracking | Medium |
| INV-001-FR-04 | System shall provide real-time stock level visibility | High |
| INV-001-FR-05 | System shall alert on low stock (below reorder level) | High |
| INV-001-FR-06 | System shall support stock adjustment with reason codes | High |
| INV-001-FR-07 | System shall handle negative stock scenarios with configuration | Medium |

**Stock Calculation Logic:**
```
Current Stock = Opening Stock
              + Purchase Received
              + Stock Transfer IN
              - Sales
              - Stock Transfer OUT
              - Damaged/Expired Write-off
              ± Adjustment
```

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id),
    location_id UUID NOT NULL REFERENCES business_locations(id),
    shelf_id UUID REFERENCES shelves(id),
    quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(10,3) DEFAULT 0,
    available_quantity DECIMAL(10,3) GENERATED ALWAYS AS (quantity - reserved_quantity) STORED,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(item_id, location_id, shelf_id)
);

CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id),
    location_id UUID NOT NULL REFERENCES business_locations(id),
    transaction_type VARCHAR(50) NOT NULL, -- PURCHASE, SALE, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT, WRITE_OFF
    quantity DECIMAL(10,3) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    reason_code VARCHAR(100),
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria:**
- Stock updates are atomic (no partial updates)
- Stock history retained for minimum 3 years
- Concurrent stock updates handled without race conditions
- Low stock alerts triggered within 30 seconds

---

### 3.2 Expiry Date & ROL Management (INV-002)

| FR ID | Requirement | Priority |
|---|---|---|
| INV-002-FR-01 | System shall track expiry dates per batch/lot for perishable items | High |
| INV-002-FR-02 | System shall alert when items are within configurable days of expiry | High |
| INV-002-FR-03 | System shall implement FEFO (First Expired First Out) dispatch logic | High |
| INV-002-FR-04 | System shall allow Reorder Level (ROL) configuration per item per location | High |
| INV-002-FR-05 | System shall auto-generate purchase recommendations when ROL is breached | Medium |
| INV-002-FR-06 | System shall block sale of expired items by default | High |

**Expiry Logic:**
```
Expiry Alert = Current Date >= (Expiry Date - Alert Days Threshold)
Expired = Current Date > Expiry Date
Near Expiry = Expiry Date - Current Date <= 30 days (configurable)
```

**Acceptance Criteria:**
- Expiry alerts sent daily at configured time
- Expired items marked and moved out of available stock
- FEFO enforced during order fulfillment
- ROL breach triggers purchase order suggestion

---

## MODULE 4: PRODUCT DISCOVERY

### 4.1 Search Functionality (DISC-001)

**Search Methods:**

| Method | Description | Technology |
|---|---|---|
| Text Search | Full-text search on name, description, SKU | Elasticsearch |
| Barcode Scan | Camera or scanner input, exact match | Database lookup |
| QR Code Scan | QR code decode then item lookup | Database lookup |
| Category Browse | Hierarchical category navigation | Database query |
| Voice Search | Speech-to-text then text search | Speech API + ES |
| Image Search | Visual similarity search | ML model |

| FR ID | Requirement | Priority |
|---|---|---|
| DISC-001-FR-01 | System shall provide full-text search across item name, SKU, description | High |
| DISC-001-FR-02 | System shall support barcode/QR scan-based search | High |
| DISC-001-FR-03 | System shall return search results in < 500ms | High |
| DISC-001-FR-04 | System shall support search suggestions/autocomplete | Medium |
| DISC-001-FR-05 | System shall handle typos and fuzzy matching | Medium |
| DISC-001-FR-06 | System shall show only in-stock items by default (configurable) | High |

**Search Implementation:**
```python
def search_items(query, business_id, filters=None):
    es_query = {
        "query": {
            "bool": {
                "must": [
                    {"term": {"business_id": business_id}},
                    {"multi_match": {
                        "query": query,
                        "fields": ["name^3", "sku^2", "description", "brand_name", "category_name"],
                        "fuzziness": "AUTO"
                    }}
                ],
                "filter": [
                    {"term": {"is_active": True}}
                ]
            }
        },
        "sort": [
            {"_score": "desc"},
            {"sales_count": "desc"}
        ]
    }
    if filters:
        es_query["query"]["bool"]["filter"].extend(build_filters(filters))
    return elasticsearch.search(index="items", body=es_query)
```

**Elasticsearch Index Mapping:**
```json
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "business_id": {"type": "keyword"},
      "name": {"type": "text", "analyzer": "standard"},
      "sku": {"type": "keyword"},
      "description": {"type": "text"},
      "brand_name": {"type": "text"},
      "category_name": {"type": "text"},
      "selling_price": {"type": "float"},
      "mrp": {"type": "float"},
      "is_active": {"type": "boolean"},
      "stock_available": {"type": "boolean"},
      "sales_count": {"type": "integer"},
      "rating": {"type": "float"}
    }
  }
}
```

**API Endpoints:**
- `GET /api/v1/search?q={query}&business_id={id}` — Full-text search
- `GET /api/v1/search/autocomplete?q={query}` — Autocomplete suggestions
- `POST /api/v1/search/barcode` — Barcode/QR scan lookup

**Acceptance Criteria:**
- Search returns results in < 500ms for 99th percentile
- Fuzzy matching handles up to 2 character errors
- Autocomplete suggestions appear within 200ms
- Barcode scan resolves item in < 300ms

---

### 4.2 Filtering & Advanced Search (DISC-002)

| FR ID | Requirement | Priority |
|---|---|---|
| DISC-002-FR-01 | System shall support filtering by category, brand, price range | High |
| DISC-002-FR-02 | System shall support sorting by price, name, rating, popularity | High |
| DISC-002-FR-03 | System shall support filtering by availability/stock status | High |
| DISC-002-FR-04 | System shall support multi-select filters | Medium |
| DISC-002-FR-05 | System shall persist filter state across page navigation | Low |

**Filter UI Example:**
```
Filters:
├── Category: [All] [Groceries] [Electronics] [Clothing]
├── Price Range: [₹0 — ₹5000] slider
├── Brand: [☑ Brand A] [☐ Brand B] [☑ Brand C]
├── Availability: [● In Stock] [○ All]
├── Rating: [★★★★☆ & above]
└── Sort By: [Relevance ▼] [Price Low-High] [Price High-Low] [Newest]
```

---

## MODULE 5: SHOPPING CART & WISHLIST

### 5.1 Cart Management (CART-001)

| FR ID | Requirement | Priority |
|---|---|---|
| CART-001-FR-01 | System shall allow adding items to cart with quantity selection | High |
| CART-001-FR-02 | System shall persist cart across sessions (logged-in users) | High |
| CART-001-FR-03 | System shall calculate cart subtotal, taxes, charges in real-time | High |
| CART-001-FR-04 | System shall handle out-of-stock items gracefully | High |
| CART-001-FR-05 | System shall apply applicable discounts/coupons to cart | High |
| CART-001-FR-06 | System shall show cart item count in navigation | Medium |
| CART-001-FR-07 | System shall support cart merging (guest cart + logged-in cart) | Medium |

**Cart Data Structure:**
```javascript
const cart = {
  cart_id: "uuid",
  customer_id: "uuid",
  business_id: "uuid",
  location_id: "uuid",
  items: [
    {
      item_id: "uuid",
      name: "Product Name",
      sku: "SKU-001",
      quantity: 2,
      unit_price: 100.00,
      mrp: 120.00,
      discount_amount: 10.00,
      tax_amount: 5.40,
      total: 195.40,
      stock_available: 50,
      image_url: "https://..."
    }
  ],
  summary: {
    subtotal: 200.00,
    discount: 10.00,
    tax: 5.40,
    delivery_charge: 30.00,
    packing_charge: 5.00,
    coupon_discount: 0.00,
    total: 230.40
  },
  applied_coupon: null,
  created_at: "2026-03-30T00:00:00Z",
  updated_at: "2026-03-30T00:00:00Z"
};
```

**Cart Calculation Logic:**
```
Item Total = (Unit Price - Item Discount) * Quantity
Subtotal = Sum of all Item Totals
Tax Amount = Subtotal * Applicable Tax Rate
Order Discount = Subtotal * Order-Level Discount %
Coupon Discount = Based on coupon rules
Delivery Charge = Based on location/distance/weight rules
Packing Charge = Based on business configuration
Grand Total = Subtotal - Order Discount - Coupon Discount + Tax Amount + Delivery Charge + Packing Charge
```

**API Endpoints:**
- `GET /api/v1/cart` — Get current cart
- `POST /api/v1/cart/items` — Add item to cart
- `PUT /api/v1/cart/items/{item_id}` — Update item quantity
- `DELETE /api/v1/cart/items/{item_id}` — Remove item from cart
- `POST /api/v1/cart/coupon` — Apply coupon
- `DELETE /api/v1/cart/coupon` — Remove coupon
- `DELETE /api/v1/cart` — Clear cart

**Acceptance Criteria:**
- Cart updates reflect immediately (< 300ms)
- Cart survives browser refresh for logged-in users
- Out-of-stock items flagged but not auto-removed
- Cart calculation is always accurate to 2 decimal places

---

### 5.2 Wishlist Management (CART-002)

| FR ID | Requirement | Priority |
|---|---|---|
| CART-002-FR-01 | System shall allow customers to save items to wishlist | Medium |
| CART-002-FR-02 | System shall persist wishlist across sessions | Medium |
| CART-002-FR-03 | System shall support multiple wishlists per customer | Low |
| CART-002-FR-04 | System shall notify customers when wishlist items go on sale | Low |
| CART-002-FR-05 | System shall allow moving items from wishlist to cart | Medium |

**API Endpoints:**
- `GET /api/v1/wishlist` — Get wishlist
- `POST /api/v1/wishlist/items` — Add item
- `DELETE /api/v1/wishlist/items/{item_id}` — Remove item
- `POST /api/v1/wishlist/items/{item_id}/move-to-cart` — Move to cart

---

## MODULE 6: PRICING, DISCOUNTS & OFFERS

### 6.1 Discount Management (PRICE-001)

| FR ID | Requirement | Priority |
|---|---|---|
| PRICE-001-FR-01 | System shall support item-level percentage and flat discounts | High |
| PRICE-001-FR-02 | System shall support order-level discounts | High |
| PRICE-001-FR-03 | System shall support customer-group-specific discounts | Medium |
| PRICE-001-FR-04 | System shall support time-limited discount validity | High |
| PRICE-001-FR-05 | System shall support minimum purchase amount conditions | Medium |
| PRICE-001-FR-06 | System shall stack discounts with configurable priority | Medium |

**Discount Types Logic:**
```
PERCENTAGE: discount_amount = price * (discount_pct / 100)
FLAT: discount_amount = flat_amount (if price >= min_price)
TIERED: discount_pct = get_tier(quantity_purchased)
BUNDLE: discount_amount = bundle_price - sum(item_prices)
```

```sql
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(50) NOT NULL, -- PERCENTAGE, FLAT, TIERED, BUNDLE
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    applies_to VARCHAR(50) NOT NULL, -- ITEM, CATEGORY, ORDER, CUSTOMER_GROUP
    target_id UUID,
    customer_group_id UUID,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discount_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    discount_id UUID NOT NULL REFERENCES discounts(id),
    rule_type VARCHAR(50),
    rule_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria:**
- Discount applied instantly on cart update
- Conflicting discounts resolved by priority
- Discount history preserved for audit

---

### 6.2 Coupon Management (PRICE-002)

| FR ID | Requirement | Priority |
|---|---|---|
| PRICE-002-FR-01 | System shall support alphanumeric coupon codes | High |
| PRICE-002-FR-02 | System shall support usage limits (global and per customer) | High |
| PRICE-002-FR-03 | System shall support coupon validity periods | High |
| PRICE-002-FR-04 | System shall support minimum order value for coupon applicability | High |
| PRICE-002-FR-05 | System shall support first-time-user-only coupons | Medium |
| PRICE-002-FR-06 | System shall track coupon usage analytics | Medium |

```sql
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    code VARCHAR(50) NOT NULL,
    description TEXT,
    discount_type VARCHAR(50) NOT NULL, -- PERCENTAGE, FLAT, FREE_DELIVERY
    discount_value DECIMAL(10,2) NOT NULL,
    max_discount_amount DECIMAL(10,2),
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    total_usage_limit INTEGER,
    per_customer_limit INTEGER DEFAULT 1,
    is_first_time_only BOOLEAN DEFAULT FALSE,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, code)
);

CREATE TABLE coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID NOT NULL REFERENCES coupons(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    discount_amount DECIMAL(10,2) NOT NULL,
    used_at TIMESTAMP DEFAULT NOW()
);
```

**Python Coupon Validation Logic:**
```python
def validate_coupon(coupon_code, customer_id, order_amount, business_id):
    coupon = db.query(Coupon).filter(
        Coupon.code == coupon_code,
        Coupon.business_id == business_id,
        Coupon.is_active == True,
        Coupon.valid_from <= datetime.now(),
        Coupon.valid_until >= datetime.now()
    ).first()

    if not coupon:
        raise ValueError("Invalid or expired coupon")

    if order_amount < coupon.min_order_amount:
        raise ValueError(f"Minimum order amount ₹{coupon.min_order_amount} required")

    total_usage = db.query(CouponUsage).filter(CouponUsage.coupon_id == coupon.id).count()
    if coupon.total_usage_limit and total_usage >= coupon.total_usage_limit:
        raise ValueError("Coupon usage limit exceeded")

    customer_usage = db.query(CouponUsage).filter(
        CouponUsage.coupon_id == coupon.id,
        CouponUsage.customer_id == customer_id
    ).count()
    if customer_usage >= coupon.per_customer_limit:
        raise ValueError("You have already used this coupon")

    return calculate_coupon_discount(coupon, order_amount)
```

---

### 6.3 Offers & Promotions (PRICE-003)

**Offer Types:**

| Offer Type | Description | Example |
|---|---|---|
| Buy One Get One (BOGO) | Buy X get Y free/discounted | Buy 1 get 1 free |
| Bundle Offer | Set of items at special price | Combo meal at ₹199 |
| Seasonal Offer | Festival/seasonal discounts | Diwali 30% off |
| Flash Sale | Time-limited deep discount | 2-hour sale 50% off |
| Loyalty Offer | Exclusive for loyalty members | Extra 10% for Gold members |
| Cashback Offer | Percentage returned as credit | 5% cashback on UPI |

| FR ID | Requirement | Priority |
|---|---|---|
| PRICE-003-FR-01 | System shall support BOGO offers | High |
| PRICE-003-FR-02 | System shall support bundle/combo pricing | High |
| PRICE-003-FR-03 | System shall support time-limited flash sales | Medium |
| PRICE-003-FR-04 | System shall support loyalty-member-exclusive offers | Medium |
| PRICE-003-FR-05 | System shall support cashback offers credited to wallet | Medium |

```sql
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    offer_type VARCHAR(50) NOT NULL,
    conditions JSONB NOT NULL,
    -- Example BOGO: {"buy_item_id": "uuid", "buy_qty": 1, "get_item_id": "uuid", "get_qty": 1, "get_discount_pct": 100}
    -- Example Bundle: {"items": [{"item_id": "uuid", "qty": 1}], "bundle_price": 199.00}
    -- Example Cashback: {"cashback_pct": 5, "max_cashback": 100, "payment_method": "UPI"}
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## MODULE 7: ORDER MANAGEMENT

### 7.1 Order Creation & Processing (ORD-001)

| FR ID | Requirement | Priority |
|---|---|---|
| ORD-001-FR-01 | System shall create order from cart with all pricing details | High |
| ORD-001-FR-02 | System shall assign unique order number | High |
| ORD-001-FR-03 | System shall support multiple delivery types (pickup, delivery, dine-in) | High |
| ORD-001-FR-04 | System shall reserve inventory on order confirmation | High |
| ORD-001-FR-05 | System shall support scheduled delivery with time-window selection | Medium |
| ORD-001-FR-06 | System shall send order confirmation notification | High |
| ORD-001-FR-07 | System shall support order notes/special instructions | Medium |

**Order Status Flow:**
```
PENDING → CONFIRMED → PROCESSING → PACKED → DISPATCHED → DELIVERED
                                                        → CANCELLED (from any state)
                                                        → RETURNED (after DELIVERED)
```

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    business_id UUID NOT NULL REFERENCES businesses(id),
    location_id UUID REFERENCES business_locations(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_type VARCHAR(50) NOT NULL, -- DELIVERY, PICKUP, DINE_IN
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    delivery_address_id UUID REFERENCES customer_addresses(id),
    scheduled_delivery_at TIMESTAMP,
    delivery_time_window VARCHAR(100),
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    coupon_discount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    packing_charge DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    item_id UUID NOT NULL REFERENCES items(id),
    item_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT
);

CREATE TABLE order_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Order Number Generation:**
```
Format: {BUSINESS_PREFIX}-{YYYYMMDD}-{SEQUENCE}
Example: SHOP-20260330-001234
Sequence: Auto-increment per business per day, padded to 6 digits
```

**Acceptance Criteria:**
- Order created in < 3 seconds
- Inventory reserved atomically on order creation
- Order number unique globally
- Status transitions validated (no invalid state jumps)

---

### 7.2 Return & Exchange Management (ORD-002)

| FR ID | Requirement | Priority |
|---|---|---|
| ORD-002-FR-01 | System shall allow return requests within configurable return window | High |
| ORD-002-FR-02 | System shall support full and partial returns | High |
| ORD-002-FR-03 | System shall support exchange with same/different item | Medium |
| ORD-002-FR-04 | System shall process refund to original payment method or wallet | High |
| ORD-002-FR-05 | System shall update inventory on return completion | High |
| ORD-002-FR-06 | System shall support return reason codes | Medium |

**Return Status Flow:**
```
REQUESTED → APPROVED → PICKUP_SCHEDULED → PICKED_UP → INSPECTED → REFUND_INITIATED → COMPLETED
          → REJECTED
```

```sql
CREATE TABLE returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    return_type VARCHAR(50) NOT NULL, -- RETURN, EXCHANGE
    status VARCHAR(50) NOT NULL DEFAULT 'REQUESTED',
    reason_code VARCHAR(100),
    reason_description TEXT,
    refund_method VARCHAR(50), -- ORIGINAL_PAYMENT, WALLET, STORE_CREDIT
    refund_amount DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE return_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID NOT NULL REFERENCES returns(id),
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Python Return Eligibility Logic:**
```python
def check_return_eligibility(order_id, customer_id):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.customer_id == customer_id,
        Order.status == 'DELIVERED'
    ).first()

    if not order:
        raise ValueError("Order not found or not eligible for return")

    business_config = get_business_config(order.business_id)
    return_window_days = business_config.get('return_window_days', 7)

    delivery_date = get_delivery_date(order_id)
    days_since_delivery = (datetime.now() - delivery_date).days

    if days_since_delivery > return_window_days:
        raise ValueError(f"Return window of {return_window_days} days has expired")

    return True
```

---

### 7.3 Re-order Functionality (ORD-003)

| FR ID | Requirement | Priority |
|---|---|---|
| ORD-003-FR-01 | System shall allow customers to re-order from order history | Medium |
| ORD-003-FR-02 | System shall check current availability and prices for re-order | High |
| ORD-003-FR-03 | System shall notify customer of any unavailable/price-changed items | High |
| ORD-003-FR-04 | System shall add all available re-order items to cart | High |

**API Endpoints:**
- `POST /api/v1/orders/{order_id}/reorder` — Add previous order items to cart
- `GET /api/v1/orders/{order_id}/reorder/preview` — Preview re-order with current prices

---

## MODULE 8: PAYMENT PROCESSING

### 8.1 Payment Gateway Integration (PAY-001)

**Supported Gateways:**

| Gateway | Use Case | Region |
|---|---|---|
| Razorpay | Primary India gateway | India |
| Stripe | International | Global |
| PayPal | International | Global |
| Paytm | India wallet/UPI | India |
| PhonePe | India UPI | India |
| Cash on Delivery | Offline payment | All |
| Bank Transfer | B2B payments | All |

| FR ID | Requirement | Priority |
|---|---|---|
| PAY-001-FR-01 | System shall support multiple payment gateways | High |
| PAY-001-FR-02 | System shall support UPI, card, wallet, netbanking, COD | High |
| PAY-001-FR-03 | System shall handle payment success/failure webhooks | High |
| PAY-001-FR-04 | System shall support partial payments and split payments | Medium |
| PAY-001-FR-05 | System shall process refunds through original payment gateway | High |
| PAY-001-FR-06 | System shall maintain payment audit trail | High |

**Payment Processing Flow:**
```
Customer → Select Payment Method
        → Payment Gateway (Razorpay/Stripe)
        → Bank/UPI Authorization
        → Webhook → Update Order Status
        → Send Confirmation → Generate Invoice
```

```sql
CREATE TABLE payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    gateway_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    configuration JSONB NOT NULL, -- API keys (encrypted)
    supported_methods JSONB, -- ["CARD", "UPI", "WALLET", "NETBANKING"]
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    gateway_id UUID REFERENCES payment_gateways(id),
    gateway_transaction_id VARCHAR(255),
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- PENDING, SUCCESS, FAILED, REFUNDED
    gateway_response JSONB,
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES payment_transactions(id),
    return_id UUID REFERENCES returns(id),
    amount DECIMAL(10,2) NOT NULL,
    reason TEXT,
    gateway_refund_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    initiated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

**Razorpay Python Integration Example:**
```python
import razorpay

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

def create_razorpay_order(order_id, amount_paise):
    data = {
        "amount": int(amount_paise),
        "currency": "INR",
        "receipt": f"order_{order_id}",
        "payment_capture": 1
    }
    return client.order.create(data=data)

def verify_payment_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    params = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }
    return client.utility.verify_payment_signature(params)
```

**Acceptance Criteria:**
- Payment initiation < 2 seconds
- Webhook processing < 5 seconds
- 100% audit trail for all transactions
- Failed payment retry supported (up to 3 times)

---

### 8.2 Secure Card Management (PAY-002)

| FR ID | Requirement | Priority |
|---|---|---|
| PAY-002-FR-01 | System shall allow customers to save cards securely | High |
| PAY-002-FR-02 | System shall never store raw card numbers (use tokenization) | High |
| PAY-002-FR-03 | System shall display only last 4 digits of card | High |
| PAY-002-FR-04 | System shall allow customers to delete saved cards | High |
| PAY-002-FR-05 | System shall support multiple saved cards per customer | Medium |

```sql
CREATE TABLE saved_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    gateway_id UUID NOT NULL REFERENCES payment_gateways(id),
    payment_method VARCHAR(50) NOT NULL,
    token VARCHAR(255) NOT NULL, -- Gateway token (not raw card)
    card_last4 VARCHAR(4),
    card_brand VARCHAR(50),
    card_expiry VARCHAR(7), -- MM/YYYY
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Card Display Format:**
```
VISA **** **** **** 4242 | Exp: 12/2028 | [Default] [Delete]
MASTERCARD **** **** **** 5555 | Exp: 06/2027 | [Delete]
```

---

## MODULE 9: TAX & FINANCIAL MANAGEMENT

### 9.1 GST/VAT Calculation (TAX-001)

| FR ID | Requirement | Priority |
|---|---|---|
| TAX-001-FR-01 | System shall support GST slabs (0%, 5%, 12%, 18%, 28%) | High |
| TAX-001-FR-02 | System shall compute CGST + SGST for intra-state, IGST for inter-state | High |
| TAX-001-FR-03 | System shall support tax exemptions per item/category/customer | High |
| TAX-001-FR-04 | System shall generate GST-compliant invoices | High |
| TAX-001-FR-05 | System shall produce GSTR-1 and GSTR-3B summary reports | Medium |
| TAX-001-FR-06 | System shall support VAT for international deployments | Medium |

**Python GST Calculation Logic:**
```python
def calculate_gst(price, gst_rate, transaction_type):
    """
    transaction_type: 'intra_state' or 'inter_state'
    """
    gst_amount = price * (gst_rate / 100)

    if transaction_type == 'intra_state':
        cgst = gst_amount / 2
        sgst = gst_amount / 2
        igst = 0
    else:  # inter_state
        cgst = 0
        sgst = 0
        igst = gst_amount

    return {
        'base_price': price,
        'gst_rate': gst_rate,
        'cgst': round(cgst, 2),
        'sgst': round(sgst, 2),
        'igst': round(igst, 2),
        'total_tax': round(gst_amount, 2),
        'total_price': round(price + gst_amount, 2)
    }
```

```sql
CREATE TABLE tax_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    tax_type VARCHAR(50) NOT NULL, -- GST, VAT, CUSTOM
    slab_name VARCHAR(100) NOT NULL,
    rate DECIMAL(5,2) NOT NULL,
    applies_to VARCHAR(50), -- ITEM, CATEGORY, ALL
    target_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tax_exemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    exemption_type VARCHAR(50) NOT NULL, -- CUSTOMER, ITEM, CATEGORY
    target_id UUID NOT NULL,
    reason TEXT,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Acceptance Criteria:**
- Tax calculated correctly for all GST slabs
- CGST/SGST/IGST split based on business and customer state
- Tax-exempt items excluded from tax calculation
- GST reports generated within 30 seconds

---

### 9.2 Charges Management (TAX-002)

**Charge Types:**

| Charge | Description | Calculation |
|---|---|---|
| Delivery Charge | Based on distance/weight/order value | Configurable rules |
| Packing Charge | Per-order or per-item | Fixed or percentage |
| Platform Fee | Service fee charged by platform | Percentage |
| Convenience Fee | Payment method surcharge | Fixed or percentage |
| COD Fee | Extra charge for cash on delivery | Fixed amount |

| FR ID | Requirement | Priority |
|---|---|---|
| TAX-002-FR-01 | System shall configure delivery charges by distance/zone/order value | High |
| TAX-002-FR-02 | System shall support free delivery above threshold | High |
| TAX-002-FR-03 | System shall configure packing charges per order or item | Medium |
| TAX-002-FR-04 | System shall support surcharges for specific payment methods | Medium |
| TAX-002-FR-05 | System shall display all charges transparently before checkout | High |

**Python Delivery Charge Calculation:**
```python
def calculate_delivery_charge(order_amount, distance_km, weight_kg, business_id):
    config = get_delivery_config(business_id)

    # Free delivery check
    if order_amount >= config['free_delivery_above']:
        return 0.00

    # Distance-based
    if config['charge_type'] == 'DISTANCE':
        base = config['base_charge']
        per_km = config['per_km_charge']
        return base + (distance_km * per_km)

    # Weight-based
    elif config['charge_type'] == 'WEIGHT':
        base = config['base_charge']
        per_kg = config['per_kg_charge']
        return base + (weight_kg * per_kg)

    # Fixed
    else:
        return config['fixed_charge']
```

```sql
CREATE TABLE charge_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    charge_type VARCHAR(50) NOT NULL, -- DELIVERY, PACKING, PLATFORM_FEE, COD_FEE
    calculation_type VARCHAR(50), -- FIXED, PERCENTAGE, DISTANCE_BASED, WEIGHT_BASED
    base_amount DECIMAL(10,2) DEFAULT 0,
    percentage_value DECIMAL(5,2),
    free_above_amount DECIMAL(10,2),
    configuration JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE charge_exemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    charge_config_id UUID NOT NULL REFERENCES charge_configurations(id),
    exemption_type VARCHAR(50), -- CUSTOMER_GROUP, LOYALTY_TIER
    target_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## MODULE 10: BILLING & DOCUMENTATION

### 10.1 Bill/Receipt Generation (BILL-001)

| FR ID | Requirement | Priority |
|---|---|---|
| BILL-001-FR-01 | System shall generate bill/receipt on order completion | High |
| BILL-001-FR-02 | System shall support PDF and thermal print formats | High |
| BILL-001-FR-03 | System shall include all order, tax, charge, and discount details | High |
| BILL-001-FR-04 | System shall support business logo and branding on bills | Medium |
| BILL-001-FR-05 | System shall allow email/WhatsApp delivery of bills | Medium |
| BILL-001-FR-06 | System shall archive bills for configured retention period | High |

**Bill Template (ASCII Example):**
```
═══════════════════════════════════════════
         SHOP NAME                        
         Address Line 1                   
         City - PIN | Ph: 9999999999     
         GSTIN: 29ABCDE1234F1Z5          
═══════════════════════════════════════════
Bill No : SHOP-20260330-001234
Date    : 30-Mar-2026 | Time: 10:30 AM
Customer: John Doe | Ph: 9876543210
═══════════════════════════════════════════
Item            Qty  Rate   Disc   Total
───────────────────────────────────────────
Product A       2    100.00  10%   180.00
Product B       1    250.00  0%    250.00
───────────────────────────────────────────
                          Subtotal: 430.00
                    GST (18% CGST):  38.70
                    GST (18% SGST):  38.70
                    Delivery Charge:  30.00
                    Coupon Discount: -20.00
═══════════════════════════════════════════
                    GRAND TOTAL:    517.40
═══════════════════════════════════════════
Payment: UPI | Ref: UPI123456789
Thank you for shopping with us!
```

```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_number VARCHAR(50) NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES orders(id),
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_id UUID REFERENCES customers(id),
    bill_type VARCHAR(50) DEFAULT 'RECEIPT', -- RECEIPT, INVOICE, PROFORMA
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    grand_total DECIMAL(10,2) NOT NULL,
    tax_breakdown JSONB,
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**API Endpoints:**
- `GET /api/v1/bills/{order_id}` — Get bill for order
- `GET /api/v1/bills/{order_id}/pdf` — Download PDF bill
- `POST /api/v1/bills/{order_id}/email` — Email bill to customer
- `POST /api/v1/bills/{order_id}/print` — Send to thermal printer

---

### 10.2 Invoice Management (BILL-002)

| FR ID | Requirement | Priority |
|---|---|---|
| BILL-002-FR-01 | System shall generate GST-compliant tax invoices | High |
| BILL-002-FR-02 | System shall support proforma invoices | Medium |
| BILL-002-FR-03 | System shall support B2B invoicing with customer GSTIN | High |
| BILL-002-FR-04 | System shall allow manual invoice creation | Medium |
| BILL-002-FR-05 | System shall support invoice numbering as per GST rules | High |
| BILL-002-FR-06 | System shall track invoice payment status | High |

**Acceptance Criteria:**
- Invoice generated within 3 seconds of order completion
- PDF invoice size < 1MB
- Invoice number unique and sequential per financial year
- All mandatory GST fields present on invoice

---

## MODULE 11: CUSTOMER MANAGEMENT

### 11.1 Customer Registration & Profile (CUST-001)

| FR ID | Requirement | Priority |
|---|---|---|
| CUST-001-FR-01 | System shall support customer registration via email, phone, or social login | High |
| CUST-001-FR-02 | System shall verify phone number via OTP | High |
| CUST-001-FR-03 | System shall allow profile update (name, photo, preferences) | Medium |
| CUST-001-FR-04 | System shall support customer groups/segments | Medium |
| CUST-001-FR-05 | System shall allow account blocking with reason | Medium |
| CUST-001-FR-06 | System shall track customer purchase history | High |
| CUST-001-FR-07 | System shall support GDPR-compliant data deletion | High |

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    date_of_birth DATE,
    gender VARCHAR(20),
    profile_image_url VARCHAR(500),
    gstin VARCHAR(15),
    customer_group_id UUID,
    loyalty_points DECIMAL(10,2) DEFAULT 0,
    wallet_balance DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    block_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(business_id, phone)
);

CREATE TABLE customer_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(customer_id, preference_key)
);
```

**Acceptance Criteria:**
- Registration via phone completes in < 60 seconds (OTP flow)
- Profile updates reflect immediately
- Customer data export available for GDPR requests
- Account blocking prevents login and new orders

---

### 11.2 Address Management (CUST-002)

| FR ID | Requirement | Priority |
|---|---|---|
| CUST-002-FR-01 | System shall allow customers to save multiple delivery addresses | High |
| CUST-002-FR-02 | System shall support address validation (pincode lookup) | Medium |
| CUST-002-FR-03 | System shall support GPS location-based address capture | Medium |
| CUST-002-FR-04 | System shall allow setting default delivery address | High |
| CUST-002-FR-05 | System shall validate delivery serviceability by address | High |

```sql
CREATE TABLE customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    label VARCHAR(100), -- HOME, WORK, OTHER
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Python Address Validation:**
```python
def validate_address(pincode, city, state):
    pincode_data = db.query(PincodeDirectory).filter(
        PincodeDirectory.pincode == pincode
    ).first()

    if not pincode_data:
        raise ValueError("Invalid pincode")

    if pincode_data.city.lower() != city.lower():
        warnings.append(f"City mismatch: Expected {pincode_data.city}, got {city}")

    return {
        'is_valid': True,
        'city': pincode_data.city,
        'state': pincode_data.state,
        'district': pincode_data.district
    }
```

---

## MODULE 12: SERVICE PROVIDER MANAGEMENT

### 12.1 Registration & Approval (SP-001)

| FR ID | Requirement | Priority |
|---|---|---|
| SP-001-FR-01 | System shall allow service provider (delivery agent) registration | High |
| SP-001-FR-02 | System shall collect identity documents (Aadhaar, PAN, Driving License) | High |
| SP-001-FR-03 | System shall require admin approval for new providers | High |
| SP-001-FR-04 | System shall collect bank account details for payment | High |
| SP-001-FR-05 | System shall support vehicle type and registration details | Medium |

```sql
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255),
    approval_status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, SUSPENDED
    vehicle_type VARCHAR(50), -- BIKE, SCOOTER, CAR, TRUCK
    vehicle_number VARCHAR(20),
    current_latitude DECIMAL(10,8),
    current_longitude DECIMAL(11,8),
    is_available BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provider_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    document_type VARCHAR(100) NOT NULL, -- AADHAAR, PAN, DRIVING_LICENSE, VEHICLE_RC
    document_number VARCHAR(100),
    document_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provider_bank_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    bank_name VARCHAR(100),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 12.2 Configuration (SP-002)

| FR ID | Requirement | Priority |
|---|---|---|
| SP-002-FR-01 | System shall allow providers to set service areas (geofence) | High |
| SP-002-FR-02 | System shall allow providers to set operating hours | High |
| SP-002-FR-03 | System shall support provider-specific charge configurations | Medium |
| SP-002-FR-04 | System shall track provider real-time location during delivery | High |

```sql
CREATE TABLE provider_service_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    area_name VARCHAR(255),
    polygon_coordinates JSONB, -- Array of {lat, lng} points
    max_delivery_distance_km DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE provider_operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE provider_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES service_providers(id),
    base_charge DECIMAL(10,2) DEFAULT 0,
    per_km_charge DECIMAL(10,2) DEFAULT 0,
    max_charge DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 12.3 Status Management (SP-003)

**Status Options:**

| Status | Description |
|---|---|
| ONLINE | Available and accepting deliveries |
| OFFLINE | Not available |
| BUSY | Currently on a delivery |
| ON_BREAK | Temporarily unavailable |
| SUSPENDED | Administratively suspended |

| FR ID | Requirement | Priority |
|---|---|---|
| SP-003-FR-01 | System shall allow providers to toggle availability (online/offline) | High |
| SP-003-FR-02 | System shall allow admin to suspend/reinstate providers | High |
| SP-003-FR-03 | System shall auto-set status to OFFLINE after inactivity | Medium |
| SP-003-FR-04 | System shall track status change history | Medium |

**Status Management API:**
- `PUT /api/v1/providers/{id}/status` — Update provider status
- `GET /api/v1/providers/available` — List available providers near location
- `POST /api/v1/providers/{id}/suspend` — Admin suspend provider

---

## MODULE 13: NOTIFICATIONS & COMMUNICATION

### 13.1 Email Notifications (NOTIF-001)

| FR ID | Requirement | Priority |
|---|---|---|
| NOTIF-001-FR-01 | System shall send order confirmation email | High |
| NOTIF-001-FR-02 | System shall send shipping/dispatch notification | High |
| NOTIF-001-FR-03 | System shall send delivery confirmation with bill attached | High |
| NOTIF-001-FR-04 | System shall support customizable email templates | Medium |
| NOTIF-001-FR-05 | System shall track email delivery status | Medium |

**Email Templates:**
- Order Confirmation: Order details, expected delivery
- Order Shipped: Tracking link, provider details
- Order Delivered: Bill PDF attached, review request
- Return Initiated: Return instructions, pickup date
- Refund Processed: Amount and timeline

**Python SendGrid Integration:**
```python
import sendgrid
from sendgrid.helpers.mail import Mail

def send_order_confirmation_email(customer_email, order_details):
    sg = sendgrid.SendGridAPIClient(api_key=SENDGRID_API_KEY)
    message = Mail(
        from_email='noreply@yourbusiness.com',
        to_emails=customer_email,
        subject=f'Order Confirmed - #{order_details["order_number"]}',
        html_content=render_template('order_confirmation.html', order=order_details)
    )
    response = sg.send(message)
    log_notification(customer_email, 'EMAIL', 'ORDER_CONFIRMATION', response.status_code)
    return response
```

---

### 13.2 SMS Notifications (NOTIF-002)

| FR ID | Requirement | Priority |
|---|---|---|
| NOTIF-002-FR-01 | System shall send OTP via SMS for phone verification | High |
| NOTIF-002-FR-02 | System shall send order status SMS updates | High |
| NOTIF-002-FR-03 | System shall support DLT-registered templates | High |
| NOTIF-002-FR-04 | System shall support WhatsApp Business API messages | Medium |

**Python Twilio Integration:**
```python
from twilio.rest import Client

def send_sms(phone_number, message_body):
    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    message = client.messages.create(
        body=message_body,
        from_=TWILIO_PHONE_NUMBER,
        to=f'+91{phone_number}'
    )
    log_notification(phone_number, 'SMS', message.sid, message.status)
    return message.sid

def send_otp(phone_number, otp):
    message = f'Your OTP is {otp}. Valid for 10 minutes. Do not share with anyone.'
    return send_sms(phone_number, message)
```

---

### 13.3 Push Notifications (NOTIF-003)

| FR ID | Requirement | Priority |
|---|---|---|
| NOTIF-003-FR-01 | System shall send push notifications to mobile app users | High |
| NOTIF-003-FR-02 | System shall support notification topics/segments | Medium |
| NOTIF-003-FR-03 | System shall track push notification delivery and open rates | Low |
| NOTIF-003-FR-04 | System shall support scheduled push notifications | Medium |

**Python Firebase Integration:**
```python
import firebase_admin
from firebase_admin import messaging

def send_push_notification(device_token, title, body, data=None):
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=data or {},
        token=device_token
    )
    response = firebase_admin.messaging.send(message)
    return response

def send_order_status_push(customer_device_token, order_number, status):
    title = f'Order #{order_number} Update'
    body = get_status_message(status)
    data = {'order_id': order_number, 'status': status, 'type': 'ORDER_UPDATE'}
    return send_push_notification(customer_device_token, title, body, data)
```

---

## MODULE 14: DASHBOARDS & ANALYTICS

### 14.1 Customer Dashboard (DASH-001)

**Components:**

| Component | Description |
|---|---|
| Recent Orders | Last 5 orders with status |
| Order History | Paginated order list with filters |
| Wallet & Loyalty | Balance, points, transaction history |
| Saved Addresses | Address book management |
| Wishlist | Saved items |
| Profile | Personal details management |
| Notifications | In-app notification center |

```sql
CREATE OR REPLACE VIEW customer_dashboard_metrics AS
SELECT
    c.id as customer_id,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.grand_total) as lifetime_value,
    AVG(o.grand_total) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    c.loyalty_points,
    c.wallet_balance
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id AND o.status = 'DELIVERED'
GROUP BY c.id, c.loyalty_points, c.wallet_balance;
```

---

### 14.2 Business/Shop Dashboard (DASH-002)

**Sections:**

| Section | Metrics |
|---|---|
| Today's Summary | Orders, Revenue, Items Sold |
| Sales Trend | Daily/Weekly/Monthly chart |
| Top Products | Best-selling items |
| Inventory Alerts | Low stock, expiring items |
| Customer Insights | New vs returning, top customers |
| Payment Summary | Payment method breakdown |

**Revenue Dashboard (ASCII):**
```
┌─────────────────────────────────────────────────┐
│  TODAY'S OVERVIEW          30-Mar-2026          │
├─────────────────────────────────────────────────┤
│  Orders: 142  │  Revenue: ₹54,320  │  Items: 489│
├─────────────────────────────────────────────────┤
│  SALES TREND (Last 7 days)                      │
│  ₹60K ┤                    ██                   │
│  ₹40K ┤         ██    ██   ██   ██              │
│  ₹20K ┤  ██   ████  ████  ███  ████  ██         │
│  ₹0   └─────────────────────────────────────    │
│       Mon  Tue  Wed  Thu  Fri  Sat  Sun          │
├─────────────────────────────────────────────────┤
│  LOW STOCK ALERTS: 12 items  │  EXPIRING: 3    │
└─────────────────────────────────────────────────┘
```

---

### 14.3 Service Provider Dashboard (DASH-003)

**Components:**

| Component | Description |
|---|---|
| Today's Deliveries | Count and earnings |
| Active Orders | Current delivery assignments |
| Earnings Summary | Daily/weekly/monthly |
| Performance Rating | Average rating and feedback |
| Navigation | Live map with delivery route |

---

### 14.4 Reports & Filtering (DASH-004)

**Report Types:**

| Report | Description | Schedule |
|---|---|---|
| Sales Report | Revenue, orders, items | Daily/Weekly/Monthly |
| Inventory Report | Stock levels, movements | Weekly |
| Customer Report | Registrations, LTV, churn | Monthly |
| Tax Report | GST collected, breakdowns | Monthly |
| Payment Report | Gateway-wise settlements | Daily |
| Provider Report | Deliveries, ratings, earnings | Weekly |

**Report Filters:**
```
Date Range: [From Date] to [To Date]
Location: [All Locations ▼]
Category: [All Categories ▼]
Payment Method: [All Methods ▼]
Customer Group: [All Groups ▼]
Export Format: [PDF] [Excel] [CSV]
```

**Report API Endpoints:**
- `POST /api/v1/reports/sales` — Generate sales report
- `POST /api/v1/reports/inventory` — Generate inventory report
- `POST /api/v1/reports/tax` — Generate GST report
- `GET /api/v1/reports/{report_id}/download` — Download report

---

## MODULE 15: CUSTOMER ENGAGEMENT

### 15.1 Loyalty Programs (ENG-001)

**Features:**

| Feature | Description |
|---|---|
| Points Earning | Earn X points per ₹Y spent |
| Points Redemption | Redeem points for discount |
| Tier System | Bronze/Silver/Gold/Platinum |
| Tier Benefits | Extra discounts, free delivery |
| Expiry Policy | Points expire after X months |
| Bonus Events | Double points on festival days |

**Python Points Calculation:**
```python
def calculate_loyalty_points(order_amount, customer_tier, business_id):
    config = get_loyalty_config(business_id)
    base_rate = config['points_per_rupee']  # e.g., 1 point per ₹10
    tier_multiplier = config['tier_multipliers'].get(customer_tier, 1.0)

    points_earned = (order_amount / config['rupee_divisor']) * base_rate * tier_multiplier
    return round(points_earned)

def redeem_loyalty_points(customer_id, points_to_redeem, order_id):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    config = get_loyalty_config(customer.business_id)

    max_redeemable = get_order_amount(order_id) * (config['max_redemption_pct'] / 100)
    points_value = points_to_redeem * config['point_value']  # e.g., 1 point = ₹0.5

    if points_value > max_redeemable:
        raise ValueError(f"Maximum redemption limit is ₹{max_redeemable:.2f}")

    if customer.loyalty_points < points_to_redeem:
        raise ValueError("Insufficient loyalty points")

    return points_value
```

```sql
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    points_per_rupee DECIMAL(5,2) NOT NULL,
    rupee_divisor DECIMAL(10,2) DEFAULT 10,
    point_value DECIMAL(5,2) NOT NULL, -- monetary value of 1 point
    max_redemption_pct DECIMAL(5,2) DEFAULT 20, -- max % of order payable by points
    expiry_months INTEGER DEFAULT 12,
    tier_config JSONB, -- {"BRONZE": {"min_points": 0, "multiplier": 1.0}, ...}
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customer_loyalty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL UNIQUE REFERENCES customers(id),
    program_id UUID NOT NULL REFERENCES loyalty_programs(id),
    current_tier VARCHAR(50) DEFAULT 'BRONZE',
    total_points_earned DECIMAL(10,2) DEFAULT 0,
    total_points_redeemed DECIMAL(10,2) DEFAULT 0,
    current_points DECIMAL(10,2) DEFAULT 0,
    lifetime_spend DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    transaction_type VARCHAR(50) NOT NULL, -- EARNED, REDEEMED, EXPIRED, ADJUSTED
    points DECIMAL(10,2) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 15.2 Referral & Invite-to-Earn (ENG-002)

| FR ID | Requirement | Priority |
|---|---|---|
| ENG-002-FR-01 | System shall generate unique referral codes for each customer | High |
| ENG-002-FR-02 | System shall credit referrer on referred customer's first order | High |
| ENG-002-FR-03 | System shall credit referred customer with welcome bonus | High |
| ENG-002-FR-04 | System shall prevent self-referral | High |
| ENG-002-FR-05 | System shall cap total referral earnings per customer | Medium |

**Python Referral Logic:**
```python
def process_referral(referral_code, new_customer_id, first_order_id):
    referral = db.query(Referral).filter(
        Referral.referral_code == referral_code,
        Referral.status == 'PENDING'
    ).first()

    if not referral:
        raise ValueError("Invalid referral code")

    if referral.referrer_id == new_customer_id:
        raise ValueError("Self-referral not allowed")

    program = get_referral_program(referral.business_id)
    referrer_reward = program['referrer_reward']
    referee_reward = program['referee_reward']

    # Credit referrer
    add_wallet_credit(referral.referrer_id, referrer_reward, f"Referral reward for {referral_code}")

    # Credit referee
    add_wallet_credit(new_customer_id, referee_reward, "Welcome referral bonus")

    referral.status = 'COMPLETED'
    referral.completed_order_id = first_order_id
    db.commit()
```

```sql
CREATE TABLE referral_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id),
    name VARCHAR(255) NOT NULL,
    referrer_reward DECIMAL(10,2) NOT NULL,
    referee_reward DECIMAL(10,2) NOT NULL,
    reward_type VARCHAR(50) DEFAULT 'WALLET', -- WALLET, POINTS, COUPON
    max_referrals_per_customer INTEGER,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES referral_programs(id),
    referrer_id UUID NOT NULL REFERENCES customers(id),
    referee_id UUID REFERENCES customers(id),
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, EXPIRED
    completed_order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

---

### 15.3 Welcome Offers (ENG-003)

**Offer Types:**
- First-order discount (flat or percentage)
- Welcome wallet credit
- Free delivery on first N orders
- Exclusive welcome coupon code

| FR ID | Requirement | Priority |
|---|---|---|
| ENG-003-FR-01 | System shall apply welcome offers to first-time customers | High |
| ENG-003-FR-02 | System shall support configurable welcome offer types | Medium |
| ENG-003-FR-03 | System shall not double-apply welcome offers | High |
| ENG-003-FR-04 | System shall track welcome offer usage | Medium |

---

## MODULE 16: CUSTOMER SUPPORT

### 16.1 Support Ticketing (SUP-001)

| FR ID | Requirement | Priority |
|---|---|---|
| SUP-001-FR-01 | System shall allow customers to raise support tickets | High |
| SUP-001-FR-02 | System shall support ticket categorization | High |
| SUP-001-FR-03 | System shall assign tickets to support agents | High |
| SUP-001-FR-04 | System shall track ticket status and resolution time | High |
| SUP-001-FR-05 | System shall allow attachment of images/documents | Medium |
| SUP-001-FR-06 | System shall collect feedback after ticket closure | Medium |

**Ticket Categories:**
- Order Issues (delay, wrong item, damaged)
- Payment Issues (failed, refund)
- Account Issues (login, profile)
- Product Issues (quality, expiry)
- Delivery Issues (not received, address)
- General Inquiry

```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) NOT NULL UNIQUE,
    business_id UUID NOT NULL REFERENCES businesses(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    order_id UUID REFERENCES orders(id),
    category VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    status VARCHAR(50) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id),
    sender_type VARCHAR(50) NOT NULL, -- CUSTOMER, AGENT, SYSTEM
    sender_id UUID,
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_ticket_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL UNIQUE REFERENCES support_tickets(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 16.2 Live Chat Support (SUP-002)

| FR ID | Requirement | Priority |
|---|---|---|
| SUP-002-FR-01 | System shall provide real-time chat between customer and agent | High |
| SUP-002-FR-02 | System shall show agent typing indicator | Medium |
| SUP-002-FR-03 | System shall support file/image sharing in chat | Medium |
| SUP-002-FR-04 | System shall maintain chat history | High |
| SUP-002-FR-05 | System shall queue customers when all agents are busy | High |

**Python Socket.IO Integration:**
```python
from flask_socketio import SocketIO, emit, join_room, leave_room

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('join_support_room')
def handle_join(data):
    room = f"support_{data['ticket_id']}"
    join_room(room)
    emit('joined', {'room': room}, room=room)

@socketio.on('send_message')
def handle_message(data):
    room = f"support_{data['ticket_id']}"
    message = save_chat_message(data)
    emit('new_message', {
        'sender': data['sender'],
        'message': data['message'],
        'timestamp': message.created_at.isoformat()
    }, room=room)

@socketio.on('typing')
def handle_typing(data):
    room = f"support_{data['ticket_id']}"
    emit('user_typing', {'user': data['sender']}, room=room, include_self=False)
```

---

### 16.3 AI Assistance (SUP-003)

**AI Features:**

| Feature | Description |
|---|---|
| Chatbot | Automated responses to common queries |
| FAQ Bot | Answers from knowledge base |
| Order Status Bot | Real-time order tracking via chat |
| Return Guide | Step-by-step return process |
| Smart Routing | Route tickets to right agent/team |
| Sentiment Analysis | Detect frustrated customers |

---

## MODULE 17: CONFIGURABILITY & CUSTOMIZATION

### 17.1 Business Type Configuration (CONFIG-001)

**Retail Shop Configuration:**
```json
{
  "business_type": "RETAIL",
  "modules_enabled": [
    "INVENTORY", "POS", "BILLING", "CUSTOMER", "LOYALTY", "REPORTS"
  ],
  "features": {
    "barcode_scanning": true,
    "multi_location": true,
    "online_ordering": false,
    "delivery": false,
    "table_management": false,
    "prescription_required": false,
    "expiry_tracking": true,
    "loyalty_program": true
  },
  "billing": {
    "gst_enabled": true,
    "invoice_format": "TAX_INVOICE",
    "print_on_sale": true
  }
}
```

**Restaurant Configuration:**
```json
{
  "business_type": "RESTAURANT",
  "modules_enabled": [
    "MENU", "TABLE_MANAGEMENT", "KDS", "BILLING", "DELIVERY", "CUSTOMER"
  ],
  "features": {
    "table_management": true,
    "kitchen_display_system": true,
    "online_ordering": true,
    "delivery": true,
    "barcode_scanning": false,
    "expiry_tracking": false,
    "loyalty_program": true,
    "split_bill": true,
    "tips": true
  },
  "billing": {
    "gst_enabled": true,
    "service_charge_pct": 10,
    "invoice_format": "RECEIPT"
  }
}
```

**Subscription Service Configuration:**
```json
{
  "business_type": "SUBSCRIPTION",
  "modules_enabled": [
    "CATALOG", "SUBSCRIPTIONS", "BILLING", "CUSTOMER", "NOTIFICATIONS"
  ],
  "features": {
    "recurring_billing": true,
    "subscription_pause": true,
    "subscription_upgrade_downgrade": true,
    "trial_period": true,
    "proration": true,
    "auto_renewal": true,
    "online_ordering": true,
    "delivery": false,
    "loyalty_program": false
  },
  "billing": {
    "billing_cycle": "MONTHLY",
    "invoice_format": "TAX_INVOICE",
    "auto_collect": true
  }
}
```

---

## MODULE 18: COMPLIANCE & SECURITY

### 18.1 Data Security (SEC-001)

**Security Measures:**

| Measure | Implementation |
|---|---|
| Data Encryption | AES-256 for data at rest, TLS 1.3 in transit |
| Password Storage | bcrypt hashing with salt (cost factor 12) |
| API Authentication | JWT with 15-minute access tokens + refresh tokens |
| Rate Limiting | 100 req/min per IP, 1000 req/min per authenticated user |
| Input Validation | Parameterized queries, strict schema validation |
| Audit Logging | All write operations logged with user and timestamp |
| Secret Management | Environment variables / AWS Secrets Manager |
| SQL Injection | ORM with parameterized queries only |
| XSS Prevention | Content Security Policy headers, output encoding |

**Password Policy:**
```
Minimum length: 8 characters
Must contain: uppercase, lowercase, number, special character
Maximum age: 90 days (configurable)
Reuse prevention: Last 5 passwords
Account lockout: 5 failed attempts → 15-minute lockout
```

---

### 18.2 PCI-DSS Compliance (SEC-002)

**Requirements:**

| Requirement | Implementation |
|---|---|
| Cardholder Data | Never stored raw; tokenized via gateway |
| Network Segmentation | Payment server isolated in VPC |
| Access Control | Least privilege, MFA for admin |
| Vulnerability Management | Regular security scans, patch management |
| Monitoring | Real-time transaction monitoring, fraud detection |
| Incident Response | Defined procedure for data breach |

**Card Data Handling Rules:**
- Raw card numbers (PAN): **NEVER** stored
- CVV/CVC: **NEVER** stored (even temporarily)
- Expiry date: Only stored as MM/YYYY for display
- Card number display: Only last 4 digits shown
- All card processing via PCI-DSS certified gateway (Razorpay/Stripe)

---

### 18.3 GDPR Compliance (SEC-003)

**GDPR Features:**

| Feature | Implementation |
|---|---|
| Consent Management | Explicit consent captured at registration |
| Data Portability | Export all customer data as JSON/CSV |
| Right to Erasure | Delete personal data on request (within 30 days) |
| Data Minimization | Collect only necessary fields |
| Privacy Policy | Versioned policy with acceptance tracking |
| Data Breach Notification | 72-hour notification to authorities |
| DPO Contact | Data Protection Officer contact in app |

---

## CONCLUSION

This Low-Level Requirements Document covers all 18 modules of the Configurable Billing & Order Management Software with complete technical specifications.

✅ **MODULE 1** — Business Setup & Configuration: Company registration, multi-location, business type config

✅ **MODULE 2** — Master Data Management: Item master, categories, brands, barcodes/QR codes

✅ **MODULE 3** — Inventory Management: Stock tracking, expiry & ROL management

✅ **MODULE 4** — Product Discovery: Search (text/barcode/QR), filtering & advanced search

✅ **MODULE 5** — Shopping Cart & Wishlist: Cart management, wishlist management

✅ **MODULE 6** — Pricing, Discounts & Offers: Discount management, coupons, offers & promotions

✅ **MODULE 7** — Order Management: Order creation, returns & exchanges, re-order

✅ **MODULE 8** — Payment Processing: Gateway integration (Razorpay/Stripe/PayPal), secure card management

✅ **MODULE 9** — Tax & Financial Management: GST/VAT calculation, charges management

✅ **MODULE 10** — Billing & Documentation: Bill/receipt generation, invoice management

✅ **MODULE 11** — Customer Management: Registration & profiles, address management

✅ **MODULE 12** — Service Provider Management: Registration & approval, configuration, status management

✅ **MODULE 13** — Notifications & Communication: Email (SendGrid), SMS (Twilio), Push (Firebase)

✅ **MODULE 14** — Dashboards & Analytics: Customer, business, provider dashboards, reports

✅ **MODULE 15** — Customer Engagement: Loyalty programs, referral system, welcome offers

✅ **MODULE 16** — Customer Support: Ticketing, live chat (Socket.IO), AI assistance

✅ **MODULE 17** — Configurability & Customization: Business type configurations (Retail, Restaurant, Subscription)

✅ **MODULE 18** — Compliance & Security: Data security, PCI-DSS, GDPR compliance