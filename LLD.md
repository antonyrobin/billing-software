## **LOW-LEVEL REQUIREMENTS DOCUMENT**

### **MODULE 1: BUSINESS SETUP & CONFIGURATION**

#### **1.1 Company/Shop Registration**

**Requirement ID:** BUS-001

**Description:** System allows business owners to register their shop/company and configure basic details.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-1.1.1 | Registration form with email/phone validation | High |
| FR-1.1.2 | Unique GSTIN validation and storage | High |
| FR-1.1.3 | Shop name, type, industry selection | High |
| FR-1.1.4 | Billing address with postal code validation | High |
| FR-1.1.5 | Shop logo and stamp/watermark upload | Medium |
| FR-1.1.6 | Contact person details (name, phone, email) | High |
| FR-1.1.7 | Business registration number & license | Medium |
| FR-1.1.8 | Tax configuration (GST rate, VAT) | High |
| FR-1.1.9 | Currency & timezone selection | High |
| FR-1.1.10 | Welcome email with credentials | High |

**Acceptance Criteria:**
- Registration takes <3 minutes
- All validations work correctly
- Email confirmation required before activation
- Admin approval workflow available
- Data encrypted before storage

**Technical Specifications:**
- Database: `companies` table with fields: id, gstin, name, shop_type, address, logo_url, stamp_url, tax_config, status, created_at, updated_at
- API Endpoint: `POST /api/v1/companies/register`
- Validation: GSTIN format (IN[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})

---

#### **1.2 Multi-Location Setup**

**Requirement ID:** BUS-002

**Description:** Large businesses with multiple locations can manage different shops under one account.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-1.2.1 | Add multiple shop locations | High |
| FR-1.2.2 | Each location has separate GSTIN/tax | High |
| FR-1.2.3 | Separate inventory per location | High |
| FR-1.2.4 | Central dashboard with all locations | High |
| FR-1.2.5 | Location-specific user assignments | Medium |
| FR-1.2.6 | Location-wise order management | High |
| FR-1.2.7 | Consolidated reports across locations | Medium |
| FR-1.2.8 | Transfer inventory between locations | Medium |

**Acceptance Criteria:**
- Support 100+ locations per company
- Each location independently operational
- Cross-location reporting available
- Stock transfer with approval workflow

**Technical Specifications:**
- Database: `locations` table linked to `companies`
- Fields: location_id, company_id, name, address, gstin, manager_id, status
- API: `POST /api/v1/locations`, `GET /api/v1/locations`

---

#### **1.3 Business Type Configuration**

**Requirement ID:** BUS-003

**Description:** System auto-configures based on business type selected during setup.

**Supported Business Types:**

1. **Retail Shop**
   - Features: Inventory, POS, customer management
   - Charges: Delivery, packing, platform fee

2. **Restaurant/Cafe**
   - Features: Menu management, table orders, delivery, takeaway
   - Charges: Service charge, delivery fee
   - Special: Kitchen display system support

3. **Pharmacy/Medical Store**
   - Features: Prescription handling, expiry tracking
   - Charges: Delivery, consultation fee
   - Special: Government compliance, license tracking

4. **Grocery Store**
   - Features: Category management, bulk ordering
   - Charges: Delivery by weight/distance
   - Special: Seasonal offers, fresh produce tracking

5. **Hotel/Lodging**
   - Features: Room booking, service management
   - Charges: Room rate, service tax, occupancy tax
   - Special: Reservation system

6. **Hospital/Clinic**
   - Features: Patient management, appointments, billing
   - Charges: Consultation fee, service fees
   - Special: Compliance, privacy, emergency handling

7. **School/College**
   - Features: Student management, fee collection
   - Charges: Tuition, activity fees
   - Special: Batch management, attendance

8. **E-commerce Marketplace**
   - Features: Multi-seller, catalog aggregation
   - Charges: Commission, platform fee
   - Special: Rating system, disputes

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-1.3.1 | Business type selection during registration | High |
| FR-1.3.2 | Auto-enable/disable features based on type | High |
| FR-1.3.3 | Type-specific workflows & approvals | High |
| FR-1.3.4 | Type-specific reporting templates | Medium |
| FR-1.3.5 | Type-specific dashboards | Medium |
| FR-1.3.6 | Change business type (with data migration) | Low |

**Acceptance Criteria:**
- Configuration takes <5 minutes
- All type-specific features working
- Data preserved during migration
- Support team can manage transitions

**Technical Specifications:**
- Database: `business_types` reference table with configurations
- Field: `companies.business_type` (enum or foreign key)
- Configuration stored in JSON: `type_config` field
- API: `POST /api/v1/companies/{id}/business-type`

---

### **MODULE 2: MASTER DATA MANAGEMENT**

#### **2.1 Item Master**

**Requirement ID:** MDM-001

**Description:** Comprehensive product/item catalog management with multiple attributes.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-2.1.1 | Create item with SKU, name, description | High |
| FR-2.1.2 | Multiple categories per item | High |
| FR-2.1.3 | Brand, type, packing size selection | High |
| FR-2.1.4 | Item images (multiple) & thumbnail | High |
| FR-2.1.5 | HSN/SAC code for taxation | High |
| FR-2.1.6 | Cost price, selling price, MRP | High |
| FR-2.1.7 | Tax rate applicable (IGST/CGST/SGST) | High |
| FR-2.1.8 | Unit of measurement (Kg, Liter, Piece) | High |
| FR-2.1.9 | Barcode & QR code linking | High |
| FR-2.1.10 | Item tags/labels | Medium |
| FR-2.1.11 | Expiry date tracking | Medium |
| FR-2.1.12 | Item status (Active/Inactive/Discontinued) | High |
| FR-2.1.13 | Bulk import from CSV/Excel | Medium |
| FR-2.1.14 | Item versioning/history | Low |

**Item Attributes:**

```
Item {
  id: UUID
  company_id: UUID
  sku: String (unique per company)
  name: String
  description: Text
  category_id: UUID (can be multiple)
  brand_id: UUID
  type_id: UUID
  packing_size: String
  unit: String (Kg, Liter, Piece, etc.)
  cost_price: Decimal
  selling_price: Decimal
  mrp: Decimal
  hsn_code: String
  tax_rate: Decimal (0-28%)
  images: Array<URL>
  barcode: String (unique)
  qr_code: String (unique)
  expiry_date: Date (optional)
  status: Enum (Active, Inactive, Discontinued)
  created_at: Timestamp
  updated_at: Timestamp
  created_by: UUID
}
```

**Acceptance Criteria:**
- Support 1M+ items per company
- Bulk operations in <1 second
- Image compression & optimization
- Barcode/QR validation
- Audit trail for changes

**Technical Specifications:**
- Database Tables: `items`, `item_categories`, `item_images`, `item_attributes`
- Search Index: Elasticsearch for full-text search
- API Endpoints:
  - `POST /api/v1/items` - Create item
  - `GET /api/v1/items` - List with filters
  - `GET /api/v1/items/{id}` - Get details
  - `PUT /api/v1/items/{id}` - Update item
  - `DELETE /api/v1/items/{id}` - Soft delete
  - `POST /api/v1/items/bulk-import` - Bulk import

---

#### **2.2 Categories Management**

**Requirement ID:** MDM-002

**Description:** Hierarchical category management for item organization.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-2.2.1 | Create parent & sub-categories | High |
| FR-2.2.2 | Multi-level hierarchy (up to 5 levels) | High |
| FR-2.2.3 | Category images & thumbnails | Medium |
| FR-2.2.4 | Category-level discounts & offers | Medium |
| FR-2.2.5 | Category-level tax configuration | High |
| FR-2.2.6 | Reorder categories (drag-drop) | Low |
| FR-2.2.7 | Archive/soft-delete categories | Medium |
| FR-2.2.8 | Category analytics & reports | Low |

**Acceptance Criteria:**
- Support deep hierarchies
- Fast category navigation
- No orphaned items after deletion
- Cached hierarchy for performance

---

#### **2.3 Brands, Types, & Packing Sizes**

**Requirement ID:** MDM-003

**Description:** Master data for brand, type, and packing size management.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-2.3.1 | Add/edit/delete brands | High |
| FR-2.3.2 | Brand logos & descriptions | Medium |
| FR-2.3.3 | Add/edit/delete types | High |
| FR-2.3.4 | Add/edit/delete packing sizes | High |
| FR-2.3.5 | Bulk operations on masters | Medium |
| FR-2.3.6 | Archive unused masters | Medium |
| FR-2.3.7 | Master data validation & constraints | High |

**Database Schema:**

```sql
CREATE TABLE brands (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP,
  UNIQUE(company_id, name)
);

CREATE TABLE types (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  created_at TIMESTAMP,
  UNIQUE(company_id, name)
);

CREATE TABLE packing_sizes (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  volume DECIMAL,
  unit VARCHAR(50),
  status VARCHAR(50),
  created_at TIMESTAMP,
  UNIQUE(company_id, name)
);
```

---

#### **2.4 Barcode & QR Code Management**

**Requirement ID:** MDM-004

**Description:** Generate, link, and manage barcodes and QR codes for items.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-2.4.1 | Auto-generate barcodes (EAN-13, Code-128) | High |
| FR-2.4.2 | Auto-generate QR codes | High |
| FR-2.4.3 | Manual barcode entry & validation | High |
| FR-2.4.4 | Barcode uniqueness check | High |
| FR-2.4.5 | QR code contains item metadata | Medium |
| FR-2.4.6 | Barcode/QR print with label size options | Medium |
| FR-2.4.7 | Bulk barcode generation | Medium |
| FR-2.4.8 | Barcode history & tracking | Low |

**Barcode Formats Supported:**
- EAN-13 (Primary)
- Code-128
- UPC-A
- ITF-14

**QR Code Data Structure:**
```json
{
  "item_id": "uuid",
  "sku": "SKU123",
  "name": "Product Name",
  "price": 99.99,
  "company_id": "uuid",
  "timestamp": "2026-03-30T10:00:00Z"
}
```

**API Endpoints:**
- `POST /api/v1/items/{id}/barcode/generate` - Generate barcode
- `POST /api/v1/items/{id}/qrcode/generate` - Generate QR code
- `GET /api/v1/barcode/{code}/details` - Get item by barcode
- `GET /api/v1/qrcode/{code}/scan` - Scan QR code
- `POST /api/v1/barcodes/print` - Print labels

---

### **MODULE 3: INVENTORY MANAGEMENT**

#### **3.1 Stock Management by Location**

**Requirement ID:** INV-001

**Description:** Real-time inventory tracking across multiple locations, shelves, and racks.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-3.1.1 | Maintain stock by location, shelf, rack | High |
| FR-3.1.2 | Real-time stock updates | High |
| FR-3.1.3 | Available quantity calculation | High |
| FR-3.1.4 | Reserved stock for pending orders | High |
| FR-3.1.5 | Damaged/defective stock tracking | Medium |
| FR-3.1.6 | Stock history/audit trail | High |
| FR-3.1.7 | Stock transfer between locations | High |
| FR-3.1.8 | Barcode/QR scanning for stock update | High |
| FR-3.1.9 | Low stock alerts | High |
| FR-3.1.10 | Automatic reorder generation | Medium |

**Stock Calculation Logic:**
```
Available Stock = Total Stock - Reserved Stock - Damaged Stock
Total Stock = Sum of stock in all locations
Reserved Stock = Sum of stock in orders (Pending, Processing)
```

**Database Schema:**

```sql
CREATE TABLE inventory (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL,
  location_id UUID NOT NULL,
  shelf_id VARCHAR(50),
  rack_id VARCHAR(50),
  quantity_total INT,
  quantity_reserved INT,
  quantity_damaged INT,
  quantity_available INT (calculated),
  last_stock_update TIMESTAMP,
  updated_by UUID,
  UNIQUE(item_id, location_id, shelf_id, rack_id)
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY,
  inventory_id UUID NOT NULL,
  transaction_type VARCHAR(50), -- IN, OUT, TRANSFER, DAMAGE, RETURN
  quantity INT,
  reference_id UUID, -- Order ID, Transfer ID, etc.
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP
);
```

**Acceptance Criteria:**
- Real-time inventory updates
- No negative stock allowed
- Transaction history audited
- Stock levels accurate within 99.9%

---

#### **3.2 Expiry Date & ROL Management**

**Requirement ID:** INV-002

**Description:** Manage product expiry dates and reorder levels.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-3.2.1 | Set expiry date for items | High |
| FR-3.2.2 | Auto-alert for items expiring soon | High |
| FR-3.2.3 | Prevent selling expired items | High |
| FR-3.2.4 | Set Reorder Level (ROL) per item-location | High |
| FR-3.2.5 | Auto-generate PO when stock < ROL | Medium |
| FR-3.2.6 | Expiry date prioritization in FIFO | High |
| FR-3.2.7 | Expired item reporting & disposal | Medium |
| FR-3.2.8 | Days-to-expiry tracking | Medium |

**Expiry Logic:**
```
IF expiry_date - today <= alert_days (e.g., 30 days)
  THEN send alert to store manager
  
IF expiry_date < today
  THEN mark as expired, remove from available stock
```

**Acceptance Criteria:**
- Expired items blocked from sales
- Alerts sent at configurable intervals
- FIFO respected in picking

---

### **MODULE 4: PRODUCT DISCOVERY**

#### **4.1 Search Functionality**

**Requirement ID:** DISC-001

**Description:** Multiple search methods for product discovery.

**Search Methods:**

| Method | Description | Implementation |
|--------|-------------|-----------------|
| Barcode Scan | Real-time barcode search | Barcode regex + database lookup |
| QR Code Scan | QR code decoding + item fetch | QR decoder library |
| Text Search | Full-text search by name/SKU | Elasticsearch |
| Category Navigation | Browse by categories | Hierarchical tree |
| Filters & Advanced | Multi-attribute filtering | Database query builder |
| Quick Search | Instant suggestions | Autocomplete with caching |

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-4.1.1 | Barcode search with fuzzy matching | High |
| FR-4.1.2 | QR code scanning & decoding | High |
| FR-4.1.3 | Full-text search on name, SKU, description | High |
| FR-4.1.4 | Autocomplete suggestions | Medium |
| FR-4.1.5 | Search results ranking & relevance | Medium |
| FR-4.1.6 | Search history & saved searches | Low |
| FR-4.1.7 | Similar item recommendations | Low |

**Search Implementation:**

```
Frontend: Barcode Scanner → API → Elasticsearch
          QR Scanner → Decoder → Item Lookup
          Text Input → Debounce → Elasticsearch
          Category → API → Items

Elasticsearch Mapping:
{
  "properties": {
    "item_id": {"type": "keyword"},
    "name": {"type": "text", "analyzer": "standard"},
    "sku": {"type": "keyword"},
    "description": {"type": "text"},
    "category": {"type": "keyword"},
    "brand": {"type": "keyword"},
    "barcode": {"type": "keyword"},
    "price": {"type": "float"},
    "status": {"type": "keyword"}
  }
}
```

**API Endpoints:**
- `GET /api/v1/search?q=query&type=text|barcode|qr`
- `GET /api/v1/items/barcode/{barcode}`
- `POST /api/v1/items/qrcode/decode`
- `GET /api/v1/categories/{id}/items`
- `GET /api/v1/search/autocomplete?q=query`

**Acceptance Criteria:**
- Search <500ms response time
- Support 100+ concurrent searches
- 95%+ accuracy in barcode recognition
- Case-insensitive search

---

#### **4.2 Filtering & Advanced Search**

**Requirement ID:** DISC-002

**Description:** Advanced filtering options for refined product discovery.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-4.2.1 | Filter by price range | High |
| FR-4.2.2 | Filter by category/brand/type | High |
| FR-4.2.3 | Filter by rating/reviews | Medium |
| FR-4.2.4 | Filter by availability | High |
| FR-4.2.5 | Filter by discount % | Medium |
| FR-4.2.6 | Multi-select filters | High |
| FR-4.2.7 | Save filter preferences | Low |
| FR-4.2.8 | Filter by custom attributes | Medium |

**Filter UI Example:**
```
┌─ Filters ─────────────────┐
├─ Price                    │
│  ├─ $0-$100              │
│  ├─ $100-$500            │
│  └─ $500+                │
├─ Brand                    │
│  ├─ □ Brand A            │
│  ├─ □ Brand B            │
│  └─ □ Brand C            │
├─ Rating                   │
│  ├─ ★★★★★ 5 stars       │
│  ├─ ★★★★☆ 4+ stars      │
│  └─ ★★★☆☆ 3+ stars      │
├─ Availability             │
│  ├─ □ In Stock           │
│  ├─ □ Coming Soon        │
│  └─ □ Pre-order          │
└────────────────────────────┘
```

---

### **MODULE 5: SHOPPING CART & WISHLIST**

#### **5.1 Cart Management**

**Requirement ID:** CART-001

**Description:** Add, update, and manage shopping cart with persistence.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-5.1.1 | Add items to cart | High |
| FR-5.1.2 | Remove items from cart | High |
| FR-5.1.3 | Update quantity | High |
| FR-5.1.4 | View cart summary | High |
| FR-5.1.5 | Calculate total with tax/discount | High |
| FR-5.1.6 | Save cart for later | High |
| FR-5.1.7 | Cart persistence across sessions | High |
| FR-5.1.8 | Sync cart across devices | Medium |
| FR-5.1.9 | Clear cart | High |
| FR-5.1.10 | Merge carts (guest → login) | Medium |
| FR-5.1.11 | Show stock availability in cart | High |
| FR-5.1.12 | Apply coupon codes | High |

**Cart Data Structure:**

```javascript
Cart {
  id: UUID,
  customer_id: UUID,
  company_id: UUID,
  items: [
    {
      item_id: UUID,
      quantity: Integer,
      price: Decimal,
      discount: Decimal,
      tax: Decimal,
      subtotal: Decimal
    }
  ],
  subtotal: Decimal,
  tax_total: Decimal,
  discount_total: Decimal,
  delivery_charge: Decimal,
  packing_charge: Decimal,
  platform_charge: Decimal,
  total: Decimal,
  coupon_code: String,
  created_at: Timestamp,
  updated_at: Timestamp,
  expires_at: Timestamp (24 hours)
}
```

**Cart Calculation Logic:**
```
For each item:
  item_subtotal = quantity × price
  item_tax = item_subtotal × (tax_rate / 100)
  item_discount = (item_subtotal × discount_percent) / 100
  item_total = item_subtotal + item_tax - item_discount

Cart Total = Sum(item_subtotal) + Sum(item_tax) - Sum(item_discount) + 
             delivery_charge + packing_charge + platform_charge - coupon_discount
```

**API Endpoints:**
- `POST /api/v1/cart/add` - Add item to cart
- `PUT /api/v1/cart/items/{item_id}` - Update item quantity
- `DELETE /api/v1/cart/items/{item_id}` - Remove item
- `GET /api/v1/cart` - Get cart details
- `POST /api/v1/cart/apply-coupon` - Apply coupon code
- `POST /api/v1/cart/checkout` - Proceed to checkout

**Acceptance Criteria:**
- Cart persists 24 hours
- Real-time stock validation
- Cart sync <1 second
- Support 1000+ items in cart

---

#### **5.2 Wishlist Management**

**Requirement ID:** CART-002

**Description:** Save items for future purchase.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-5.2.1 | Add items to wishlist | High |
| FR-5.2.2 | Remove from wishlist | High |
| FR-5.2.3 | View wishlist | High |
| FR-5.2.4 | Move from wishlist to cart | High |
| FR-5.2.5 | Share wishlist | Medium |
| FR-5.2.6 | Wishlist size limits | Medium |
| FR-5.2.7 | Price drop notifications | Low |
| FR-5.2.8 | Wishlist priority/reordering | Low |

**API Endpoints:**
- `POST /api/v1/wishlist/add` - Add to wishlist
- `DELETE /api/v1/wishlist/{item_id}` - Remove from wishlist
- `GET /api/v1/wishlist` - Get wishlist
- `POST /api/v1/wishlist/{item_id}/move-to-cart` - Move to cart
- `GET /api/v1/wishlist/share/{share_id}` - Share wishlist

---

### **MODULE 6: PRICING, DISCOUNTS & OFFERS**

#### **6.1 Discount Management**

**Requirement ID:** PRICE-001

**Description:** Flexible discount application at item and order levels.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-6.1.1 | Item-level percentage discount | High |
| FR-6.1.2 | Item-level fixed amount discount | High |
| FR-6.1.3 | Order-level discounts | High |
| FR-6.1.4 | Quantity-based discounts (tiered) | High |
| FR-6.1.5 | Time-based discounts (start/end date) | High |
| FR-6.1.6 | Category-level discounts | Medium |
| FR-6.1.7 | Brand-level discounts | Medium |
| FR-6.1.8 | Customer segment discounts | Medium |
| FR-6.1.9 | First purchase discount | Medium |
| FR-6.1.10 | Discount priority/stacking rules | Medium |

**Discount Types:**

```
1. Percentage Discount
   Discount Amount = (Original Price × Discount %) / 100
   
2. Fixed Amount Discount
   Discount Amount = Fixed Amount (capped at original price)
   
3. Buy More Save More (Tiered)
   IF quantity >= tier1 THEN discount = 5%
   ELSE IF quantity >= tier2 THEN discount = 10%
   
4. Free Item on Purchase
   BUY 2 GET 1 FREE
   
5. Category Discount
   All items in category get discount
```

**Discount Storage:**

```sql
CREATE TABLE discounts (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255),
  type VARCHAR(50), -- PERCENTAGE, FIXED, TIERED, BOGO, etc.
  value DECIMAL,
  min_cart_value DECIMAL,
  max_discount_amount DECIMAL,
  applicable_to VARCHAR(50), -- ITEM, CATEGORY, ORDER, CUSTOMER_SEGMENT
  applicable_id UUID, -- item_id, category_id, etc.
  start_date DATE,
  end_date DATE,
  active BOOLEAN,
  priority INTEGER,
  created_at TIMESTAMP
);

CREATE TABLE discount_rules (
  id UUID PRIMARY KEY,
  discount_id UUID NOT NULL,
  condition VARCHAR(255), -- min_quantity, day_of_week, customer_type
  condition_value VARCHAR(255),
  discount_value DECIMAL
);
```

**Acceptance Criteria:**
- Multiple discounts applied correctly
- Discount stacking rules enforced
- Max discount cap respected
- Discount limits honored (qty-based)

---

#### **6.2 Coupon Management**

**Requirement ID:** PRICE-002

**Description:** Create and manage coupon codes for promotions.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-6.2.1 | Create unique coupon codes | High |
| FR-6.2.2 | Set coupon validity (date range) | High |
| FR-6.2.3 | Set coupon usage limit | High |
| FR-6.2.4 | Per-customer usage limit | High |
| FR-6.2.5 | Minimum cart value requirement | High |
| FR-6.2.6 | Specific item/category applicability | Medium |
| FR-6.2.7 | Discount amount/percentage | High |
| FR-6.2.8 | Track coupon usage & analytics | Medium |
| FR-6.2.9 | Auto-apply eligible coupons | Low |
| FR-6.2.10 | Coupon code visibility rules | Medium |

**Coupon Fields:**
```sql
CREATE TABLE coupons (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  code VARCHAR(50) UNIQUE,
  discount_type VARCHAR(50), -- PERCENTAGE, FIXED
  discount_value DECIMAL,
  min_cart_value DECIMAL,
  max_discount_amount DECIMAL,
  usage_limit INTEGER,
  usage_count INTEGER,
  per_customer_limit INTEGER,
  valid_from DATE,
  valid_until DATE,
  applicable_items TEXT[], -- item IDs (NULL = all)
  applicable_categories TEXT[], -- category IDs (NULL = all)
  customer_segments TEXT[], -- segments (NULL = all)
  status VARCHAR(50),
  created_at TIMESTAMP
);

CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY,
  coupon_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  order_id UUID NOT NULL,
  discount_amount DECIMAL,
  used_at TIMESTAMP
);
```

**Coupon Validation Logic:**
```python
def validate_coupon(code, cart_value, customer_id, items):
  coupon = get_coupon(code)
  
  # Check expiry
  if coupon.valid_until < today:
    return {'valid': False, 'reason': 'Coupon expired'}
  
  # Check usage limit
  if coupon.usage_count >= coupon.usage_limit:
    return {'valid': False, 'reason': 'Usage limit exceeded'}
  
  # Check per-customer limit
  customer_usage = get_customer_coupon_usage(customer_id, coupon.id)
  if customer_usage >= coupon.per_customer_limit:
    return {'valid': False, 'reason': 'Per-customer limit reached'}
  
  # Check min cart value
  if cart_value < coupon.min_cart_value:
    return {'valid': False, 'reason': 'Cart value too low'}
  
  # Check item applicability
  if coupon.applicable_items and not any(item in coupon.applicable_items for item in items):
    return {'valid': False, 'reason': 'Not applicable to items'}
  
  return {'valid': True, 'discount': calculate_discount(coupon, cart_value)}
```

---

#### **6.3 Offers & Promotions**

**Requirement ID:** PRICE-003

**Description:** Complex promotional offers including seasonal, bundle, cashback.

**Offer Types:**

| Type | Description | Example |
|------|-------------|---------|
| Seasonal Offer | Festival/season-based discount | Diwali: 20% off |
| Bundle Offer | Buy multiple items, get discount | Buy 2 shirts, get 20% off |
| Buy X Get Y Free | Purchase requirement with free item | Buy 1 get 1 free |
| Cashback Offer | Return amount to wallet/account | 10% cashback up to $50 |
| Credit Score Offer | Based on customer credit score | Score>800: Extra 5% |
| First Purchase | New customer offer | 15% off first order |
| Loyalty Offer | Based on customer tier | Gold members: 2x points |
| Time-Based | Flash sale, hourly deals | Happy hour: 30% off |

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-6.3.1 | Create various offer types | High |
| FR-6.3.2 | Set offer duration & validity | High |
| FR-6.3.3 | Offer targeting (customer segments) | High |
| FR-6.3.4 | Offer priority/precedence rules | Medium |
| FR-6.3.5 | Offer analytics & performance | Medium |
| FR-6.3.6 | Auto-apply eligible offers | Medium |
| FR-6.3.7 | Manual offer application | Low |
| FR-6.3.8 | Offer redemption tracking | High |

**Offer Storage:**

```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255),
  type VARCHAR(50), -- SEASONAL, BUNDLE, BOGO, CASHBACK, etc.
  description TEXT,
  offer_config JSONB, -- Type-specific configuration
  valid_from DATE,
  valid_until DATE,
  target_customers VARCHAR(50), -- ALL, SEGMENT, NEW, LOYAL, etc.
  target_customer_ids TEXT[], -- Specific customer IDs if needed
  min_cart_value DECIMAL,
  max_benefit DECIMAL,
  priority INTEGER,
  active BOOLEAN,
  created_at TIMESTAMP
);

-- Example offer_config for BOGO:
{
  "trigger_item_id": "item-123",
  "trigger_quantity": 1,
  "free_item_id": "item-456",
  "free_quantity": 1,
  "max_redemptions": 100
}

-- Example offer_config for CASHBACK:
{
  "cashback_percentage": 10,
  "max_cashback": 500,
  "applicable_items": ["item-1", "item-2"],
  "credit_to": "WALLET" -- or ACCOUNT, NEXT_PURCHASE
}
```

---

### **MODULE 7: ORDER MANAGEMENT**

#### **7.1 Order Creation & Processing**

**Requirement ID:** ORD-001

**Description:** Complete order lifecycle from creation to fulfillment.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-7.1.1 | Create order from cart | High |
| FR-7.1.2 | Generate unique order ID | High |
| FR-7.1.3 | Capture delivery address | High |
| FR-7.1.4 | Capture payment details | High |
| FR-7.1.5 | Calculate final billing | High |
| FR-7.1.6 | Order confirmation email/SMS | High |
| FR-7.1.7 | Reserve inventory for order | High |
| FR-7.1.8 | Support multiple order statuses | High |
| FR-7.1.9 | Track order status in real-time | High |
| FR-7.1.10 | Order timeline/history | High |

**Order Status Flow:**

```
PENDING
  ↓ (Payment confirmed)
CONFIRMED
  ↓ (Items packed)
PACKED
  ↓ (Picked for delivery)
PICKED_UP
  ↓ (In transit)
IN_TRANSIT
  ↓ (Delivered)
DELIVERED
  ↓ (Partial return)
PARTIALLY_RETURNED

Alternate flows:
CANCELLED (at any stage before PACKED)
FAILED (payment failed)
RETURNED (full return)
```

**Order Schema:**

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE,
  company_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  status VARCHAR(50),
  subtotal DECIMAL,
  tax_total DECIMAL,
  discount_total DECIMAL,
  delivery_charge DECIMAL,
  packing_charge DECIMAL,
  platform_charge DECIMAL,
  total_amount DECIMAL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50), -- PENDING, COMPLETED, FAILED
  delivery_address_id UUID NOT NULL,
  delivery_date DATE,
  delivery_time_window VARCHAR(50), -- e.g., "10:00-14:00"
  service_provider_id UUID, -- Assigned delivery partner
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  delivered_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancelled_by UUID,
  cancellation_reason TEXT
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  item_id UUID NOT NULL,
  quantity INT,
  unit_price DECIMAL,
  discount DECIMAL,
  tax DECIMAL,
  subtotal DECIMAL,
  return_quantity INT DEFAULT 0,
  return_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
);

CREATE TABLE order_timeline (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  status VARCHAR(50),
  notes TEXT,
  updated_by UUID,
  updated_at TIMESTAMP
);
```

**Order Number Generation:**
```
Format: SHOP-YYYY-MM-XXXXX
Example: SHOP-2026-03-00001

Components:
- SHOP: Company code (configurable)
- YYYY: Year
- MM: Month
- XXXXX: Sequential number
```

**Acceptance Criteria:**
- Order creation <3 seconds
- Inventory reserved immediately
- No double-booking of items
- Order history complete & accurate

---

#### **7.2 Return & Exchange Management**

**Requirement ID:** ORD-002

**Description:** Handle product returns and exchanges after delivery.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-7.2.1 | Initiate return request | High |
| FR-7.2.2 | Set return window (e.g., 7/30 days) | High |
| FR-7.2.3 | Return reason selection | High |
| FR-7.2.4 | Item condition verification | Medium |
| FR-7.2.5 | Partial return support | High |
| FR-7.2.6 | Exchange items instead of return | High |
| FR-7.2.7 | Track return shipping | Medium |
| FR-7.2.8 | Refund processing | High |
| FR-7.2.9 | Return cancellation | Medium |
| FR-7.2.10 | Return analytics & trends | Low |

**Return Status Flow:**

```
REQUEST_INITIATED
  ↓ (Approved)
APPROVED
  ↓ (Item picked up)
RETURN_PICKUP_SCHEDULED
  ↓ (In transit)
RETURN_IN_TRANSIT
  ↓ (Received & verified)
RETURN_RECEIVED
  ↓ (Inspection passed)
RETURN_VERIFIED
  ↓ (Refund issued)
REFUND_PROCESSED

Rejection flow:
REQUEST_REJECTED (outside return window, item damaged, etc.)
```

**Return Schema:**

```sql
CREATE TABLE returns (
  id UUID PRIMARY KEY,
  return_number VARCHAR(50) UNIQUE,
  order_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  return_type VARCHAR(50), -- FULL_RETURN, PARTIAL_RETURN, EXCHANGE
  reason VARCHAR(255),
  reason_details TEXT,
  items_returned JSONB, -- [{item_id, quantity, condition, notes}]
  return_status VARCHAR(50),
  refund_amount DECIMAL,
  refund_method VARCHAR(50), -- WALLET, ORIGINAL_PAYMENT, CREDIT
  refund_initiated_at TIMESTAMP,
  refund_completed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE return_timeline (
  id UUID PRIMARY KEY,
  return_id UUID NOT NULL,
  event_type VARCHAR(50), -- REQUESTED, APPROVED, REJECTED, SHIPPED, etc.
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP
);
```

**Return Eligibility Logic:**
```python
def is_return_eligible(order, return_request):
  # Check delivery status
  if order.status != 'DELIVERED':
    return False, "Order not delivered yet"
  
  # Check return window
  days_since_delivery = (today - order.delivered_at).days
  if days_since_delivery > company.return_window_days:
    return False, "Return window expired"
  
  # Check item condition
  if return_request.item_condition == 'DAMAGED':
    if return_request.damage_severity == 'MAJOR':
      return False, "Item severely damaged"
  
  return True, "Eligible for return"
```

---

#### **7.3 Re-order Functionality**

**Requirement ID:** ORD-003

**Description:** Allow customers to quickly re-order previous purchases.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-7.3.1 | Display previous orders | High |
| FR-7.3.2 | One-click re-order | High |
| FR-7.3.3 | Modify quantities before re-order | High |
| FR-7.3.4 | Update pricing for re-order | High |
| FR-7.3.5 | Auto-fill delivery address | High |
| FR-7.3.6 | Re-order from wishlist | Medium |
| FR-7.3.7 | Subscription re-order | Low |

**API Endpoints:**
- `GET /api/v1/orders` - Get customer orders
- `POST /api/v1/orders/{id}/reorder` - Create re-order
- `GET /api/v1/orders/{id}/details` - Order details

---

### **MODULE 8: PAYMENT PROCESSING**

#### **8.1 Payment Gateway Integration**

**Requirement ID:** PAY-001

**Description:** Secure payment processing with multiple gateway support.

**Supported Payment Gateways:**
- Razorpay (India)
- Stripe (Global)
- PayPal
- Square
- 2Checkout

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-8.1.1 | Multiple payment gateway support | High |
| FR-8.1.2 | Payment encryption & security (PCI-DSS) | High |
| FR-8.1.3 | Payment verification & reconciliation | High |
| FR-8.1.4 | Payment failure handling & retry | High |
| FR-8.1.5 | Webhook integration for updates | High |
| FR-8.1.6 | Payment transaction logging | High |
| FR-8.1.7 | Refund processing | High |
| FR-8.1.8 | Payment receipt generation | High |

**Payment Processing Flow:**

```
Customer → Cart → Checkout
                      ↓
                 Payment Page
                      ↓
          Select Payment Method
                      ↓
         ┌────────────────────────┐
         ↓                        ↓
    Card/Wallet          Mobile Payment
         ↓                        ↓
   Gateway API ←──────── Gateway API
         ↓                        ↓
    Verify Signature    Verify Signature
         ↓                        ↓
    Order Confirmation  Order Confirmation
         ↓                        ↓
    Inventory Update    Inventory Update
         ↓                        ↓
    Notification        Notification
```

**Payment Integration Schema:**

```sql
CREATE TABLE payment_gateways (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  gateway_name VARCHAR(50), -- razorpay, stripe, etc.
  api_key VARCHAR(500),
  secret_key VARCHAR(500),
  is_active BOOLEAN,
  is_test_mode BOOLEAN,
  config JSONB,
  created_at TIMESTAMP
);

CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  gateway_transaction_id VARCHAR(255),
  payment_gateway VARCHAR(50),
  amount DECIMAL,
  currency VARCHAR(10),
  status VARCHAR(50), -- INITIATED, COMPLETED, FAILED, REFUNDED
  method VARCHAR(50), -- CARD, WALLET, NETBANKING, etc.
  metadata JSONB,
  error_message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE refunds (
  id UUID PRIMARY KEY,
  payment_transaction_id UUID NOT NULL,
  refund_amount DECIMAL,
  refund_status VARCHAR(50), -- INITIATED, COMPLETED, FAILED
  gateway_refund_id VARCHAR(255),
  reason VARCHAR(255),
  initiated_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

**Razorpay Integration Example:**

```python
import razorpay

class RazorpayPaymentProcessor:
    def __init__(self, key_id, key_secret):
        self.client = razorpay.Client(auth=(key_id, key_secret))
    
    def create_order(self, amount, currency='INR', receipt=''):
        try:
            order = self.client.order.create(
                amount=int(amount * 100),  # Razorpay expects paise
                currency=currency,
                receipt=receipt,
                payment_capture=1  # Auto-capture
            )
            return {'success': True, 'order_id': order['id']}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_payment(self, order_id, payment_id, signature):
        try:
            self.client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
            return {'verified': True}
        except:
            return {'verified': False}
    
    def process_refund(self, payment_id, amount=None):
        try:
            if amount:
                refund = self.client.payment.refund(
                    payment_id,
                    {'amount': int(amount * 100)}
                )
            else:
                refund = self.client.payment.refund(payment_id)
            return {'success': True, 'refund_id': refund['id']}
        except Exception as e:
            return {'success': False, 'error': str(e)}
```

**Acceptance Criteria:**
- PCI-DSS compliance verified
- Payment success rate >99.5%
- Fraud detection enabled
- <500ms payment processing
- Webhook updates real-time

---

#### **8.2 Secure Card Management**

**Requirement ID:** PAY-002

**Description:** Store customer payment methods securely.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-8.2.1 | Save card details securely | High |
| FR-8.2.2 | Tokenization support | High |
| FR-8.2.3 | One-click checkout with saved card | High |
| FR-8.2.4 | Manage saved payment methods | High |
| FR-8.2.5 | Delete saved card option | High |
| FR-8.2.6 | Set default payment method | High |
| FR-8.2.7 | Card expiry validation | High |
| FR-8.2.8 | Card security (masked display) | High |

**Saved Card Schema:**

```sql
CREATE TABLE saved_payments (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  gateway_token VARCHAR(255),
  card_type VARCHAR(50), -- CREDIT, DEBIT
  card_brand VARCHAR(50), -- VISA, MASTERCARD, AMEX
  last_4_digits VARCHAR(4),
  expiry_month INT,
  expiry_year INT,
  card_holder_name VARCHAR(255),
  is_default BOOLEAN,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Card Display Format:**
```
Visa ●●●● ●●●● ●●●● 4242
Expires: 12/2026

Save this card for future purchases
☑ Make this my default payment method
```

---

### **MODULE 9: TAX & FINANCIAL MANAGEMENT**

#### **9.1 GST/VAT Calculation**

**Requirement ID:** TAX-001

**Description:** Accurate tax calculation based on Indian GST regulations.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-9.1.1 | Slab-wise GST configuration (5%, 12%, 18%, 28%) | High |
| FR-9.1.2 | HSN code mapping to GST rate | High |
| FR-9.1.3 | Item-level tax rate override | High |
| FR-9.1.4 | IGST/CGST/SGST split calculation (intra-state) | High |
| FR-9.1.5 | IGST calculation (inter-state) | High |
| FR-9.1.6 | Tax-free items handling | High |
| FR-9.1.7 | Reverse charge mechanism | Medium |
| FR-9.1.8 | E-way bill generation | Low |
| FR-9.1.9 | GST return filing support | Low |
| FR-9.1.10 | Tax audit trail | High |

**GST Calculation Logic:**

```python
def calculate_tax(item_value, gst_rate, state_from, state_to):
    tax_amount = (item_value * gst_rate) / 100
    
    if state_from == state_to:  # Intra-state
        cgst = tax_amount / 2
        sgst = tax_amount / 2
        igst = 0
    else:  # Inter-state
        cgst = 0
        sgst = 0
        igst = tax_amount
    
    return {
        'total_tax': tax_amount,
        'cgst': cgst,
        'sgst': sgst,
        'igst': igst,
        'taxable_value': item_value,
        'total_value': item_value + tax_amount
    }
```

**Tax Configuration:**

```sql
CREATE TABLE tax_configurations (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  hsn_code VARCHAR(20),
  gst_rate DECIMAL(5,2), -- 0, 5, 12, 18, 28
  tax_type VARCHAR(50), -- STANDARD, EXEMPT, ZERO_RATED
  applicable_from DATE,
  applicable_to DATE,
  notes TEXT,
  created_at TIMESTAMP
);

CREATE TABLE tax_exemptions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  item_id UUID,
  category_id UUID,
  exemption_reason VARCHAR(255),
  applicable_from DATE,
  applicable_to DATE
);
```

**Acceptance Criteria:**
- Tax calculations 100% accurate
- Compliance with GST rules
- Tax reports exportable
- Audit trail maintained

---

#### **9.2 Charges Management**

**Requirement ID:** TAX-002

**Description:** Flexible delivery, packing, and platform charge management.

**Charge Types:**

| Type | Description | Example |
|------|-------------|---------|
| Delivery Charge | Based on distance, location, provider | $2 per km |
| Packing Charge | Per item or fixed | $0.50 per item |
| Platform Charge | Commission on order | 2-5% of order value |
| Service Tax | Tax on services | 18% on delivery |
| Handling Charge | Specialty item handling | $5 for fragile items |

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-9.2.1 | Configurable delivery charge formula | High |
| FR-9.2.2 | Location-based charges | High |
| FR-9.2.3 | Service provider-based charges | High |
| FR-9.2.4 | Item weight/size-based charges | High |
| FR-9.2.5 | Time-based charges (rush delivery) | Medium |
| FR-9.2.6 | Charge exemption for orders above value | Medium |
| FR-9.2.7 | Promotional charge waivers | Medium |
| FR-9.2.8 | Charge transparency in checkout | High |

**Delivery Charge Calculation:**

```python
def calculate_delivery_charge(order):
    # Base logic
    base_charge = 0
    
    # Distance-based
    distance = order.delivery_distance_km
    base_charge += distance * RATE_PER_KM
    
    # Location-based surge
    location_config = get_location_config(order.delivery_location)
    base_charge *= location_config.surge_multiplier
    
    # Service provider-based
    provider_config = get_provider_config(order.service_provider_id)
    base_charge *= provider_config.charge_multiplier
    
    # Item-based
    total_weight = sum(item.weight for item in order.items)
    if total_weight > 5:
        base_charge += (total_weight - 5) * RATE_PER_KG_EXTRA
    
    # Exemption for high-value orders
    if order.subtotal >= DELIVERY_FREE_THRESHOLD:
        base_charge = 0
    
    # Cap delivery charge
    if base_charge > MAX_DELIVERY_CHARGE:
        base_charge = MAX_DELIVERY_CHARGE
    
    return base_charge
```

**Charge Configuration Schema:**

```sql
CREATE TABLE charge_configurations (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  charge_type VARCHAR(50), -- DELIVERY, PACKING, PLATFORM
  calculation_type VARCHAR(50), -- FIXED, PER_KM, PER_ITEM, PERCENTAGE
  base_value DECIMAL,
  rate_per_unit DECIMAL,
  location_id UUID,
  service_provider_id UUID,
  min_order_value DECIMAL,
  max_charge_value DECIMAL,
  applicable_from DATE,
  applicable_to DATE,
  active BOOLEAN
);

CREATE TABLE charge_exemptions (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  charge_configuration_id UUID NOT NULL,
  min_order_value DECIMAL,
  exemption_reason VARCHAR(255),
  valid_from DATE,
  valid_until DATE
);
```

---

### **MODULE 10: BILLING & DOCUMENTATION**

#### **10.1 Bill/Receipt Generation**

**Requirement ID:** BILL-001

**Description:** Generate comprehensive bills and receipts.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-10.1.1 | Auto-generate bill on order confirmation | High |
| FR-10.1.2 | Include all charges (delivery, tax, etc.) | High |
| FR-10.1.3 | Display shop GSTIN & stamp | High |
| FR-10.1.4 | Customer details on bill | High |
| FR-10.1.5 | Item-wise tax breakdown | High |
| FR-10.1.6 | Payment method displayed | High |
| FR-10.1.7 | Bill number & unique reference | High |
| FR-10.1.8 | Bill validity dates | Low |

**Bill Template Example:**

```
╔═══════════════════════════════════════════════════╗
║            SHOP NAME                              ║
║            📱 +91-9876543210                      ║
║            🏪 Address, City, State-123456        ║
║            GSTIN: 27ABCDE1234F1Z5                ║
║═══════════════════════════════════════════════════║
║                                                   ║
║  BILL RECEIPT                                    ║
║  Bill No: SHOP-2026-03-00001                     ║
║  Date: 2026-03-30 14:30:45                       ║
║                                                   ║
║  Customer: John Doe                              ║
║  Mobile: +91-9876543210                          ║
║                                                   ║
║───────────────────────────────────────────────────║
║  Item                    Qty   Rate    Amount     ║
║───────────────────────────────────────────────────║
║  Widget (SKU:123)        2   × 99.99 = 199.98   ║
║  Gadget (SKU:456)        1   × 299.99= 299.99   ║
║───────────────────────────────────────────────────║
║                                                   ║
║  Subtotal                              499.97    ║
║  Discount (Coupon 10%)                 -50.00    ║
║  Subtotal after discount               449.97    ║
║                                                   ║
║  SGST @ 9%                              40.50    ║
║  CGST @ 9%                              40.50    ║
║  Total GST                              81.00    ║
║                                                   ║
║  Delivery Charge                        50.00    ║
║  Packing Charge                         10.00    ║
║  Platform Charge                        0.00     ║
║                                                   ║
║───────────────────────────────────────────────────║
║  TOTAL AMOUNT                          590.97    ║
║───────────────────────────────────────────────────║
║                                                   ║
║  Payment Method: Card Ending 4242                ║
║  Payment Status: Completed                       ║
║                                                   ║
║  [Stamp & Signature]                            ║
║                                                   ║
║  Thank you for shopping with us!                ║
║  Estimated Delivery: 2026-03-31 10:00-14:00    ║
║═══════════════════════════════════════════════════║
```

**Bill Storage & Retrieval:**

```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  bill_number VARCHAR(50) UNIQUE,
  company_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  bill_date DATE,
  bill_content TEXT, -- HTML/JSON representation
  pdf_path VARCHAR(500),
  email_sent BOOLEAN,
  sms_sent BOOLEAN,
  created_at TIMESTAMP
);
```

**API Endpoints:**
- `GET /api/v1/orders/{id}/bill` - Get bill
- `GET /api/v1/bills/{id}/pdf` - Download PDF
- `POST /api/v1/bills/{id}/email` - Email bill
- `POST /api/v1/bills/{id}/sms` - SMS bill

---

#### **10.2 Invoice Management**

**Requirement ID:** BILL-002

**Description:** Generate GST-compliant invoices for B2B transactions.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-10.2.1 | Generate tax invoices | High |
| FR-10.2.2 | Invoice numbering (sequential) | High |
| FR-10.2.3 | HSN code on invoice | High |
| FR-10.2.4 | Tax breakdown (IGST/CGST/SGST) | High |
| FR-10.2.5 | Reverse charge indication | Medium |
| FR-10.2.6 | Invoice cancelation & credit notes | Medium |
| FR-10.2.7 | Invoice archival & retrieval | High |
| FR-10.2.8 | Digital signature on invoice | Medium |

**Acceptance Criteria:**
- Invoices GST-compliant
- Sequential numbering enforced
- Invoices immutable after issue
- Search & filter available

---

### **MODULE 11: CUSTOMER MANAGEMENT**

#### **11.1 Customer Registration & Profile**

**Requirement ID:** CUST-001

**Description:** Customer account management with profile customization.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-11.1.1 | Email/Phone registration | High |
| FR-11.1.2 | Email verification | High |
| FR-11.1.3 | Phone OTP verification | High |
| FR-11.1.4 | Profile picture upload | Low |
| FR-11.1.5 | Edit profile information | High |
| FR-11.1.6 | Change password | High |
| FR-11.1.7 | Account deactivation | Medium |
| FR-11.1.8 | Data export (GDPR compliance) | Low |

**Customer Profile Schema:**

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  date_of_birth DATE,
  gender VARCHAR(50),
  profile_picture_url VARCHAR(500),
  email_verified BOOLEAN,
  phone_verified BOOLEAN,
  status VARCHAR(50), -- ACTIVE, INACTIVE, BLOCKED
  account_type VARCHAR(50), -- PERSONAL, BUSINESS
  customer_segment VARCHAR(50), -- REGULAR, PREMIUM, VIP
  credit_score INT (default 0),
  loyalty_points INT (default 0),
  wallet_balance DECIMAL (default 0),
  language_preference VARCHAR(50),
  timezone VARCHAR(50),
  gdpr_consent BOOLEAN,
  marketing_emails BOOLEAN,
  sms_notifications BOOLEAN,
  push_notifications BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  last_login TIMESTAMP
);

CREATE TABLE customer_preferences (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE,
  notification_preferences JSONB,
  payment_preferences JSONB,
  shopping_preferences JSONB,
  privacy_settings JSONB
);
```

**Acceptance Criteria:**
- Registration <2 minutes
- Email verification <1 hour
- Phone OTP valid 10 minutes
- Password encryption (bcrypt)

---

#### **11.2 Address Management**

**Requirement ID:** CUST-002

**Description:** Multiple delivery address management.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-11.2.1 | Add multiple delivery addresses | High |
| FR-11.2.2 | Address type (Home, Office, Other) | High |
| FR-11.2.3 | Set default delivery address | High |
| FR-11.2.4 | Edit address details | High |
| FR-11.2.5 | Delete address | High |
| FR-11.2.6 | Address validation & geocoding | Medium |
| FR-11.2.7 | Saved addresses with labels | High |
| FR-11.2.8 | Address search & autocomplete | Medium |

**Address Schema:**

```sql
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  address_type VARCHAR(50), -- HOME, OFFICE, OTHER
  name VARCHAR(255),
  phone VARCHAR(20),
  street_address VARCHAR(500),
  area_locality VARCHAR(255),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  landmark TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN,
  delivery_instructions TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Address Validation:**
```python
def validate_address(address):
    # Check required fields
    required_fields = ['street_address', 'city', 'postal_code']
    for field in required_fields:
        if not address.get(field):
            return False, f"Missing {field}"
    
    # Postal code format
    if not re.match(r'^\d{6}$', address['postal_code']):
        return False, "Invalid postal code"
    
    # Geocode address
    geocode_result = geocode_address(address)
    if not geocode_result:
        return False, "Address could not be geocoded"
    
    address['latitude'] = geocode_result['lat']
    address['longitude'] = geocode_result['lng']
    
    return True, address
```

---

### **MODULE 12: SERVICE PROVIDER MANAGEMENT**

#### **12.1 Service Provider Registration & Approval**

**Requirement ID:** SP-001

**Description:** Onboard and manage delivery partners/service providers.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-12.1.1 | Registration form for service providers | High |
| FR-12.1.2 | Document verification (ID, DL, etc.) | High |
| FR-12.1.3 | Background check & approval workflow | High |
| FR-12.1.4 | Service provider kyc | High |
| FR-12.1.5 | Bank details for payouts | High |
| FR-12.1.6 | Insurance/liability management | Medium |
| FR-12.1.7 | Approval status tracking | High |
| FR-12.1.8 | Rejection reason documentation | Medium |

**Service Provider Schema:**

```sql
CREATE TABLE service_providers (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  service_type VARCHAR(50), -- DELIVERY, INSTALLATION, MAINTENANCE
  status VARCHAR(50), -- REGISTERED, PENDING_APPROVAL, APPROVED, REJECTED, SUSPENDED
  company_id UUID,
  registration_date DATE,
  approval_date DATE,
  approval_comments TEXT,
  rating DECIMAL(3,2),
  total_deliveries INT (default 0),
  on_time_percentage DECIMAL(5,2),
  cancellation_percentage DECIMAL(5,2),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE provider_documents (
  id UUID PRIMARY KEY,
  service_provider_id UUID NOT NULL,
  document_type VARCHAR(50), -- ID_PROOF, DL, INSURANCE, BANK_ACCOUNT
  document_url VARCHAR(500),
  verification_status VARCHAR(50), -- PENDING, VERIFIED, REJECTED
  verified_at TIMESTAMP,
  verified_by UUID,
  created_at TIMESTAMP
);

CREATE TABLE provider_bank_details (
  id UUID PRIMARY KEY,
  service_provider_id UUID NOT NULL UNIQUE,
  bank_name VARCHAR(255),
  account_holder_name VARCHAR(255),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_type VARCHAR(50), -- SAVING, CURRENT
  upi_id VARCHAR(100),
  verified BOOLEAN,
  created_at TIMESTAMP
);
```

---

#### **12.2 Service Provider Configuration**

**Requirement ID:** SP-002

**Description:** Configure service provider-specific settings and charges.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-12.2.1 | Set service area (geofence/postal codes) | High |
| FR-12.2.2 | Operating hours configuration | High |
| FR-12.2.3 | Delivery charge configuration | High |
| FR-12.2.4 | Commission/payout structure | High |
| FR-12.2.5 | Service capacity limits | Medium |
| FR-12.2.6 | Performance metrics tracking | Medium |
| FR-12.2.7 | Service provider tier/rating | High |
| FR-12.2.8 | Specialization/skills | Medium |

**Service Provider Config Schema:**

```sql
CREATE TABLE provider_service_areas (
  id UUID PRIMARY KEY,
  service_provider_id UUID NOT NULL,
  postal_codes TEXT[], -- Serviceable postal codes
  cities TEXT[],
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  radius_km INT,
  created_at TIMESTAMP
);

CREATE TABLE provider_operating_hours (
  id UUID PRIMARY KEY,
  service_provider_id UUID NOT NULL,
  day_of_week INT (0-6),
  start_time TIME,
  end_time TIME,
  is_closed BOOLEAN
);

CREATE TABLE provider_charges (
  id UUID PRIMARY KEY,
  service_provider_id UUID NOT NULL,
  charge_type VARCHAR(50), -- DELIVERY, SERVICE
  base_charge DECIMAL,
  rate_per_km DECIMAL,
  commission_percentage DECIMAL(5,2),
  payout_percentage DECIMAL(5,2),
  effective_from DATE,
  effective_to DATE
);
```

---

#### **12.3 Service Provider Status Management**

**Requirement ID:** SP-003

**Description:** Manage service provider operational status.

**Service Status Options:**

| Status | Description | Action |
|--------|-------------|--------|
| ON | Service provider is active | Accept orders |
| OFF | Service provider inactive | No order assignment |
| PAUSE | Temporary pause (illness, maintenance) | Resume later |
| SUSPEND | Admin suspension (violation, fraud) | Requires approval |
| BLOCK | Permanent blocking | Cannot operate |

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-12.3.1 | Toggle ON/OFF status | High |
| FR-12.3.2 | Pause service (with resume option) | High |
| FR-12.3.3 | Admin suspension with reason | High |
| FR-12.3.4 | Blocking mechanism | High |
| FR-12.3.5 | Status change notifications | High |
| FR-12.3.6 | Status change logging | High |
| FR-12.3.7 | Automatic status updates (based on performance) | Medium |

**Status Management API:**
```
PATCH /api/v1/service-providers/{id}/status
Body: {
  "status": "ON|OFF|PAUSE|SUSPEND|BLOCK",
  "reason": "Optional reason",
  "duration": "Optional duration for pause"
}
```

---

### **MODULE 13: NOTIFICATIONS & COMMUNICATION**

#### **13.1 Email Notifications**

**Requirement ID:** NOTIF-001

**Description:** Send transactional and promotional emails to customers.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-13.1.1 | Order confirmation email | High |
| FR-13.1.2 | Delivery status updates | High |
| FR-13.1.3 | Payment receipt email | High |
| FR-13.1.4 | Return/refund confirmation | High |
| FR-13.1.5 | Password reset email | High |
| FR-13.1.6 | Promotional offers email | Medium |
| FR-13.1.7 | Newsletter emails | Low |
| FR-13.1.8 | Email unsubscribe option | High |
| FR-13.1.9 | Email template customization | Medium |
| FR-13.1.10 | Bulk email scheduling | Low |

**Email Templates:**

```
1. Order Confirmation
   Subject: "Your order [ORDER_ID] has been confirmed"
   Content: Order details, items, total, expected delivery
   
2. Order Shipped
   Subject: "Your order is on its way"
   Content: Tracking info, delivery date, service provider contact
   
3. Out for Delivery
   Subject: "Your order will be delivered today"
   Content: Delivery time window, contact number
   
4. Order Delivered
   Subject: "Your order has been delivered"
   Content: Delivery confirmation, review invitation
   
5. Payment Receipt
   Subject: "Payment receipt for order [ORDER_ID]"
   Content: Invoice, payment method, receipt PDF
   
6. Return Approved
   Subject: "Your return has been approved"
   Content: Return instructions, pickup date
   
7. Refund Processed
   Subject: "Refund for [ORDER_ID] has been processed"
   Content: Refund amount, method, timeline
```

**Email Service Integration:**

```python
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

class EmailService:
    def __init__(self, api_key):
        self.sg = SendGridAPIClient(api_key)
    
    def send_order_confirmation(self, customer_email, order):
        template_vars = {
            'customer_name': order.customer.first_name,
            'order_id': order.order_number,
            'order_date': order.created_at.strftime('%Y-%m-%d'),
            'items': order.items,
            'total': order.total_amount,
            'delivery_date': order.delivery_date,
            'company_name': order.company.name,
            'company_phone': order.company.phone
        }
        
        message = Mail(
            from_email=f"noreply@{order.company.domain}",
            to_emails=customer_email,
            subject=f"Order Confirmation - {order.order_number}",
            html_content=self.render_template(
                'order_confirmation.html',
                template_vars
            )
        )
        
        response = self.sg.send(message)
        return response.status_code == 202
```

---

#### **13.2 SMS Notifications**

**Requirement ID:** NOTIF-002

**Description:** Send SMS updates to customers and service providers.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-13.2.1 | Order confirmation SMS | High |
| FR-13.2.2 | OTP for verification | High |
| FR-13.2.3 | Delivery tracking SMS | High |
| FR-13.2.4 | Payment status SMS | High |
| FR-13.2.5 | Promotional SMS offers | Medium |
| FR-13.2.6 | Service provider assignment SMS | High |
| FR-13.2.7 | SMS opt-out option | High |
| FR-13.2.8 | SMS template management | Medium |

**SMS Integration (Twilio):**

```python
from twilio.rest import Client

class SMSService:
    def __init__(self, account_sid, auth_token):
        self.client = Client(account_sid, auth_token)
        self.from_number = "+1234567890"
    
    def send_otp(self, phone_number, otp):
        message = self.client.messages.create(
            body=f"Your OTP is {otp}. Valid for 10 minutes.",
            from_=self.from_number,
            to=phone_number
        )
        return message.sid
    
    def send_order_confirmation(self, phone_number, order_id):
        message = self.client.messages.create(
            body=f"Order {order_id} confirmed! Delivery by {order_delivery_date}. Track: {order_tracking_url}",
            from_=self.from_number,
            to=phone_number
        )
        return message.sid
```

---

#### **13.3 Push Notifications**

**Requirement ID:** NOTIF-003

**Description:** Send real-time push notifications via mobile apps.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-13.3.1 | Order status push notifications | High |
| FR-13.3.2 | Delivery ETA updates | High |
| FR-13.3.3 | Special offers & deals | Medium |
| FR-13.3.4 | Promotional notifications | Medium |
| FR-13.3.5 | In-app message center | High |
| FR-13.3.6 | Notification preferences | High |
| FR-13.3.7 | Rich notifications (images, actions) | Medium |
| FR-13.3.8 | Notification analytics | Low |

**Push Notification Service (Firebase Cloud Messaging):**

```python
from firebase_admin import messaging

class PushNotificationService:
    def send_order_update(self, device_token, order):
        message = messaging.Message(
            notification=messaging.Notification(
                title=f"Order {order.order_number} Update",
                body=f"Your order is {order.status.lower()}"
            ),
            data={
                'order_id': str(order.id),
                'status': order.status,
                'timestamp': order.updated_at.isoformat()
            },
            token=device_token
        )
        
        response = messaging.send(message)
        return response
    
    def send_multicast_notification(self, device_tokens, title, body, data):
        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data=data,
            tokens=device_tokens
        )
        
        response = messaging.send_multicast(message)
        return response
```

---

### **MODULE 14: DASHBOARDS & ANALYTICS**

#### **14.1 Customer Dashboard**

**Requirement ID:** DASH-001

**Description:** Customer-facing dashboard with order history and profile management.

**Dashboard Components:**

| Component | Data | Priority |
|-----------|------|----------|
| Quick Stats | Active orders, loyalty points, wallet balance | High |
| Recent Orders | Last 5 orders with status | High |
| Order Timeline | Order status with timestamps | High |
| Saved Addresses | Quick address selection | High |
| Favorites | Frequently ordered items | Medium |
| Recommendations | Based on purchase history | Medium |
| Promotional Banners | Active offers & deals | Medium |
| Reviews | Items for review post-delivery | Medium |
| Account Settings | Profile, preferences, notifications | High |
| Support Access | Help center, chat, tickets | Medium |

**Customer Dashboard Metrics:**

```sql
CREATE VIEW customer_dashboard_metrics AS
SELECT
    c.id,
    COUNT(DISTINCT o.id) as total_orders,
    SUM(o.total_amount) as lifetime_value,
    AVG(o.total_amount) as avg_order_value,
    MAX(o.created_at) as last_order_date,
    COUNT(DISTINCT CASE WHEN o.status='DELIVERED' THEN o.id END) as completed_orders,
    c.loyalty_points,
    c.wallet_balance,
    COUNT(DISTINCT ca.id) as saved_addresses
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
LEFT JOIN customer_addresses ca ON c.id = ca.customer_id
GROUP BY c.id;
```

---

#### **14.2 Business/Shop Dashboard**

**Requirement ID:** DASH-002

**Description:** Owner/manager dashboard with business analytics and operations.

**Dashboard Sections:**

| Section | Metrics | Priority |
|---------|---------|----------|
| Revenue | Daily/monthly sales, growth %, projections | High |
| Orders | Total, pending, completed, cancelled | High |
| Inventory | Stock levels, SKUs, low stock alerts | High |
| Customers | New, repeat, active, lifetime value segments | High |
| Payment | Successful, failed, pending payments | High |
| Returns | Return rate, reasons, refunds processed | Medium |
| Delivery | On-time delivery %, average time | High |
| Top Sellers | Best performing products, categories | Medium |
| Offers | Active offers, coupon usage, ROI | Medium |
| Service Providers | Performance, ratings, cancellations | Medium |

**Revenue Dashboard Example:**

```
┌──────────────────────────────────────────────────────┐
│              REVENUE ANALYTICS                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Total Revenue (Mar 2026):     ₹5,42,890           │
│  Growth vs Last Month:         ▲ 15.3%             │
│  Projected Revenue (EOY):      ₹65,45,000          │
│                                                      │
│  ┌─ Revenue by Day ──────────────────────────────┐ │
│  │ Mar 01  ▄ ₹18,000                             │ │
│  │ Mar 02  ▆ ₹22,000                             │ │
│  │ Mar 03  █ ₹28,000                             │ │
│  │ Mar 04  ▆ ₹22,500                             │ │
│  │ ...                                            │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Top Revenue Sources ──────────────────────────┐ │
│  │ 1. Online Orders      ₹3,25,000 (60%)         │ │
│  │ 2. POS Sales          ₹1,62,500 (30%)         │ │
│  │ 3. Subscription       ₹54,390  (10%)          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─ Payment Methods ──────────────────────────────┐ │
│  │ Credit Card    ▓▓▓▓▓▓ 45%                      │ │
│  │ Debit Card     ▓▓▓▓ 30%                        │ │
│  │ Wallet         ▓▓ 15%                          │ │
│  │ COD            ▓ 10%                           │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

---

#### **14.3 Service Provider Dashboard**

**Requirement ID:** DASH-003

**Description:** Service provider performance and earnings dashboard.

**Dashboard Components:**

| Component | Data | Priority |
|-----------|------|----------|
| Earnings | Today/week/month, pending payout | High |
| Active Orders | Assigned, in-transit, completed today | High |
| Performance | Rating, on-time %, cancellation % | High |
| Acceptance Rate | Order acceptance stats | High |
| Ratings & Reviews | Customer feedback, star rating | High |
| Service Areas | Assigned zones, coverage | Medium |
| Documents | Verification status, expiry dates | High |
| Support | Help, dispute resolution, messages | Medium |
| Analytics | Trends, insights, recommendations | Low |

---

#### **14.4 Reports & Filtering**

**Requirement ID:** DASH-004

**Description:** Advanced reporting with customizable filters.

**Report Types:**

| Report | Use Case | Priority |
|--------|----------|----------|
| Sales Report | Revenue, growth, trends | High |
| Inventory Report | Stock levels, movement, aging | High |
| Customer Report | Segments, LTV, churn analysis | High |
| Order Report | Volume, value, status distribution | High |
| Payment Report | Success rate, method split, chargebacks | High |
| Tax Report | GST liability, HSN wise, export format | High |
| Return Report | Rate, reasons, refund analysis | Medium |
| Service Provider Report | Performance, earnings, ratings | High |
| Discount Report | Coupon usage, ROI, effectiveness | Medium |

**Report Filters:**

```
┌─ Report Filters ─────────────────────────┐
│ Date Range:  [Start] - [End]             │
│ Product:     [All ▼]                     │
│ Category:    [All ▼]                     │
│ Location:    [All ▼]                     │
│ Payment:     □ Card □ Wallet □ COD      │
│ Status:      □ Complete □ Pending        │
│ Custom:      [Add filter +]              │
│                                           │
│ [Export PDF] [Export Excel] [Print]     │
└──────────────────────────────────────────┘
```

**Report API:**
```
GET /api/v1/reports/sales?start_date=&end_date=&group_by=DATE|CATEGORY|PRODUCT
GET /api/v1/reports/inventory?location_id=&low_stock=true
GET /api/v1/reports/customers?segment=PREMIUM&sort_by=LTV
GET /api/v1/reports/tax-compliance?month=03&year=2026
```

---

### **MODULE 15: CUSTOMER ENGAGEMENT**

#### **15.1 Loyalty Programs**

**Requirement ID:** ENG-001

**Description:** Reward customers for purchases and engagement.

**Loyalty Features:**

| Feature | Description | Priority |
|---------|-------------|----------|
| Points System | Earn points on purchase | High |
| Tier System | Progress through membership tiers | High |
| Redemption | Redeem points for discounts | High |
| Referral | Earn points for referrals | High |
| Birthday Bonus | Extra points on birthday month | Medium |
| Gamification | Badges, challenges, leaderboards | Low |
| VIP Benefits | Exclusive offers for top customers | Medium |

**Points Calculation:**

```python
def calculate_loyalty_points(order_value, customer_tier):
    base_points = order_value * 0.1  # 0.1 points per rupee
    
    tier_multipliers = {
        'BRONZE': 1.0,
        'SILVER': 1.5,
        'GOLD': 2.0,
        'PLATINUM': 2.5
    }
    
    points = base_points * tier_multipliers.get(customer_tier, 1.0)
    
    # Birthday month bonus
    if is_birthday_month(customer.date_of_birth):
        points *= 1.5
    
    return int(points)

def redeem_loyalty_points(points, min_points=100):
    if points < min_points:
        return False, "Insufficient points"
    
    discount_amount = points / 10  # 1 point = ₹0.10
    return True, discount_amount
```

**Loyalty Schema:**

```sql
CREATE TABLE loyalty_programs (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  name VARCHAR(255),
  description TEXT,
  active BOOLEAN,
  tier_structure JSONB,
  points_earning_rate DECIMAL,
  redemption_rate DECIMAL,
  created_at TIMESTAMP
);

CREATE TABLE customer_loyalty (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL UNIQUE,
  loyalty_program_id UUID NOT NULL,
  current_tier VARCHAR(50),
  total_points INT,
  redeemable_points INT,
  tier_points INT,
  points_expiry_date DATE,
  last_tier_upgrade DATE,
  created_at TIMESTAMP
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY,
  customer_loyalty_id UUID NOT NULL,
  transaction_type VARCHAR(50), -- EARNED, REDEEMED, EXPIRED
  points INT,
  reference_id UUID,
  created_at TIMESTAMP
);
```

---

#### **15.2 Referral & Invite-to-Earn**

**Requirement ID:** ENG-002

**Description:** Encourage customers to invite friends.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-15.2.1 | Generate unique referral codes | High |
| FR-15.2.2 | Share referral link via social/SMS/Email | High |
| FR-15.2.3 | Track referral conversions | High |
| FR-15.2.4 | Reward referrer | High |
| FR-15.2.5 | Reward referee | High |
| FR-15.2.6 | Referral history & earnings | High |
| FR-15.2.7 | Referral leaderboards | Low |
| FR-15.2.8 | Withdraw referral earnings | Medium |

**Referral Program Logic:**

```python
def generate_referral_code(customer_id):
    # Format: REF-{customer_id}-{random_string}
    code = f"REF-{customer_id[:4]}-{random_string(6).upper()}"
    return code

def process_referral(referral_code, new_customer_id):
    referrer = get_customer_by_referral_code(referral_code)
    
    if not referrer:
        return False, "Invalid referral code"
    
    # Check if new customer places first order
    first_order = get_customer_first_order(new_customer_id)
    if first_order:
        # Award referrer
        referrer_reward = calculate_referral_reward(first_order.total_amount)
        add_loyalty_points(referrer.id, referrer_reward)
        
        # Award new customer
        new_customer_reward = NEW_CUSTOMER_SIGNUP_BONUS
        add_loyalty_points(new_customer_id, new_customer_reward)
        
        return True, "Referral processed successfully"
    
    return False, "New customer has not placed first order"
```

**Referral Schema:**

```sql
CREATE TABLE referral_programs (
  id UUID PRIMARY KEY,
  company_id UUID NOT NULL,
  referrer_reward INT (loyalty points),
  referee_reward INT (loyalty points),
  active BOOLEAN,
  created_at TIMESTAMP
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY,
  referral_code VARCHAR(50) UNIQUE,
  referrer_id UUID NOT NULL,
  referee_id UUID,
  status VARCHAR(50), -- PENDING, COMPLETED, EXPIRED
  reward_given BOOLEAN,
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

---

#### **15.3 Welcome Offers**

**Requirement ID:** ENG-003

**Description:** Special offers for new customers.

**Welcome Offer Types:**

```
1. First Purchase Discount
   - 20% off on first order
   - Minimum order value: ₹500
   - Valid for: 30 days
   - Usage limit: 1 per customer

2. Free Delivery
   - Free delivery on first 3 orders
   - Valid for: 30 days

3. Welcome Credit
   - ₹500 store credit
   - Valid for: 30 days
   - Can be combined with discounts
```

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-15.3.1 | Auto-apply welcome offer | High |
| FR-15.3.2 | Configurable offer terms | High |
| FR-15.3.3 | Track welcome offer usage | High |
| FR-15.3.4 | Welcome email/notification | High |
| FR-15.3.5 | Referral integration | Medium |

---

### **MODULE 16: CUSTOMER SUPPORT**

#### **16.1 Support Ticketing System**

**Requirement ID:** SUP-001

**Description:** Customer support ticket management.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-16.1.1 | Create support ticket | High |
| FR-16.1.2 | Ticket categories & prioritization | High |
| FR-16.1.3 | Ticket assignment to agents | High |
| FR-16.1.4 | Ticket status tracking | High |
| FR-16.1.5 | Communication history | High |
| FR-16.1.6 | File attachments | Medium |
| FR-16.1.7 | SLA management | Medium |
| FR-16.1.8 | Ticket escalation | Medium |
| FR-16.1.9 | Resolution & feedback | High |
| FR-16.1.10 | Support analytics | Low |

**Ticket Categories:**
```
- Order Issues (30%) → Delivery, Quality, Price
- Payment Issues (20%) → Failed transaction, Refund
- Product Issues (25%) → Wrong item, Defective
- Account Issues (15%) → Login, Password, Profile
- Complaint (10%) → General complaints
```

**Support Ticket Schema:**

```sql
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE,
  customer_id UUID NOT NULL,
  category VARCHAR(50),
  subject VARCHAR(255),
  description TEXT,
  priority VARCHAR(50), -- LOW, MEDIUM, HIGH, URGENT
  status VARCHAR(50), -- OPEN, IN_PROGRESS, WAITING, RESOLVED, CLOSED
  assigned_to UUID,
  created_at TIMESTAMP,
  assigned_at TIMESTAMP,
  resolved_at TIMESTAMP,
  closed_at TIMESTAMP,
  sla_due_date TIMESTAMP
);

CREATE TABLE support_ticket_messages (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL,
  from_user_id UUID,
  message_type VARCHAR(50), -- CUSTOMER, AGENT, SYSTEM
  message TEXT,
  attachments JSON,
  created_at TIMESTAMP
);

CREATE TABLE support_ticket_feedback (
  id UUID PRIMARY KEY,
  ticket_id UUID NOT NULL,
  rating INT (1-5),
  comment TEXT,
  response_quality BOOLEAN,
  resolution_quality BOOLEAN,
  created_at TIMESTAMP
);
```

---

#### **16.2 Live Chat Support**

**Requirement ID:** SUP-002

**Description:** Real-time chat support for customers.

**Functional Requirements:**

| FR | Description | Priority |
|----|-------------|----------|
| FR-16.2.1 | Live chat widget | High |
| FR-16.2.2 | Agent availability status | High |
| FR-16.2.3 | Queue management | High |
| FR-16.2.4 | Chat transcript storage | High |
| FR-16.2.5 | Canned responses | Medium |
| FR-16.2.6 | Co-browsing support | Low |
| FR-16.2.7 | Sentiment analysis | Low |

**Chat Integration (Socket.IO):**

```python
from socketio import Server, Namespace

class ChatNamespace(Namespace):
    def on_connect(self, sid, environ):
        customer_id = environ.get('customer_id')
        self.emit('response', {'data': 'Connected'})
    
    def on_message(self, sid, data):
        message = data.get('message')
        ticket_id = data.get('ticket_id')
        
        # Save message
        save_chat_message(ticket_id, message)
        
        # Broadcast to agent
        self.emit('new_message', {
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
    
    def on_disconnect(self, sid):
        print('Client disconnected')
```

---

#### **16.3 AI Assistance**

**Requirement ID:** SUP-003

**Description:** AI-powered customer support assistance.

**AI Features:**

| Feature | Description | Priority |
|---------|-------------|----------|
| Chatbot | FAQ answering, basic support | Medium |
| Sentiment Analysis | Detect customer mood | Low |
| Intent Recognition | Classify customer queries | Low |
| Automated Responses | Auto-reply for common issues | Low |
| Knowledge Base Search | Relevant article suggestions | Medium |

---

### **MODULE 17: CONFIGURABILITY & CUSTOMIZATION**

#### **17.1 Business Type Configuration**

**Requirement ID:** CONFIG-001

**Description:** Adapt system to different business models.

**Configuration Parameters:**

```
┌─ RETAIL SHOP ─────────────────────────┐
│ Inventory: YES                        │
│ POS: YES                             │
│ Delivery: YES                        │
│ Restaurant Features: NO              │
│ Subscription: NO                     │
│ Features to Enable:                  │
│ - Cart & Checkout                    │
│ - Payment Processing                 │
│ - Stock Management                   │
│ - Customer Reviews                   │
│ - Loyalty Points                     │
└────────────────────────────────────────┘

┌─ RESTAURANT ──────────────────────────┐
│ Inventory: YES                        │
│ POS: YES                             │
│ Delivery: YES                        │
│ Restaurant Features: YES             │
│ Subscription: NO                     │
│ Unique Features:                     │
│ - Kitchen Display System             │
│ - Table Management                   │
│ - Pre-order System                   │
│ - Delivery Time Optimization         │
└────────────────────────────────────────┘

┌─ SUBSCRIPTION SERVICE ────────────────┐
│ Inventory: NO                         │
│ POS: NO                              │
│ Delivery: N/A                        │
│ Subscription: YES                    │
│ Unique Features:                     │
│ - Subscription Plans                 │
│ - Recurring Billing                  │
│ - Auto-renewal                       │
│ - Pause/Cancel Management            │
└────────────────────────────────────────┘
```

---

### **MODULE 18: COMPLIANCE & SECURITY**

#### **18.1 Data Security**

**Requirement ID:** SEC-001

**Description:** Comprehensive data protection measures.

**Security Measures:**

| Layer | Implementation | Priority |
|-------|-----------------|----------|
| Encryption | TLS 1.3 for transit, AES-256 for storage | High |
| Authentication | OAuth 2.0, JWT, MFA | High |
| Authorization | RBAC (Role-Based Access Control) | High |
| Password | bcrypt, 12+ character minimum | High |
| API Security | Rate limiting, API keys, CORS | High |
| Database | SQL injection prevention, prepared statements | High |
| Audit Log | All activities logged & immutable | High |
| Backup | Daily encrypted backups, geo-redundant | High |

**Password Policy:**
```
- Minimum 12 characters
- Must contain: Uppercase, Lowercase, Number, Special character
- Expiry: 90 days
- History: Cannot reuse last 5 passwords
- Lockout: 5 failed attempts → 30 minutes lockout
```

---

#### **18.2 PCI-DSS Compliance**

**Requirement ID:** SEC-002

**Description:** Payment Card Industry Data Security Standard compliance.

**PCI-DSS Requirements:**

| Requirement | Implementation | Status |
|-------------|-----------------|--------|
| Secure Network | Firewall, network segmentation | ✓ |
| Cardholder Data Protection | Encryption, masking | ✓ |
| Vulnerability Management | Regular patching, scanning | ✓ |
| Access Control | Strong authentication, minimal access | ✓ |
| Regular Monitoring | Intrusion detection, logs | ✓ |
| Information Security Policy | Documented policies, training | ✓ |

**Card Data Handling:**
```
- Never store full card numbers
- Use tokenization for repeat payments
- Transmit over TLS only
- Process through certified providers (Razorpay, Stripe)
- Audit trail for all access
- Annual compliance certification
```

---

#### **18.3 GDPR Compliance**

**Requirement ID:** SEC-003

**Description:** General Data Protection Regulation compliance (EU customers).

**GDPR Features:**

| Feature | Implementation | Priority |
|---------|-----------------|----------|
| Consent Management | Explicit opt-in for data collection | High |
| Data Access | User can download their data | High |
| Data Deletion | Right to be forgotten | High |
| Data Portability | Export data in standard format | Medium |
| Privacy Policy | Clear, transparent policy | High |
| DPA | Data Processing Agreement for third parties | High |
| Breach Notification | 72-hour breach notification | High |

---

## **CONCLUSION**

This comprehensive billing software is designed to be **highly configurable** to serve any business type and industry. Key advantages:

✅ **Scalability** - From small shops to enterprise chains
✅ **Flexibility** - Customize for any business model
✅ **Compliance** - GST, GDPR, PCI-DSS ready
✅ **Integration** - Payment, SMS, Email, Push notifications
✅ **Analytics** - Real-time dashboards and reporting
✅ **User Experience** - Intuitive interfaces for all users
✅ **Support** - Multi-channel customer support
✅ **Security** - Enterprise-grade encryption & protection

The system provides a solid foundation for developing a market-leading billing platform.

---

This document provides comprehensive guidance for development teams to implement a world-class billing software solution. Would you like me to elaborate on any specific module or requirement?

</parameter>
</invoke>

## @antonyrobin

create a billing-software repository and add two md files. One for HLD & Another one for LLD

## Copilot

Let me create the repository and add the documentation files for you. Since the repository needs to be created first, I'll help you with the proper documentation files that you can use.

```markdown name=HLD.md
# BILLING SOFTWARE - HIGH-LEVEL DESIGN DOCUMENT

## 1. EXECUTIVE SUMMARY

**Project Name:** Configurable Billing & Order Management Software

**Version:** 1.0

**Date:** 2026-03-30

**Author:** Antony Robin

**Status:** APPROVED FOR DEVELOPMENT

### Vision
Build a comprehensive, modular, and scalable billing solution that serves any business type and industry vertically, from small retail shops to enterprise chains, restaurants, hospitals, schools, and online marketplaces.

---

## 2. PROJECT SCOPE

### In Scope
- Multi-tenant SaaS billing platform
- E-commerce order management
- Inventory management across locations
- Payment gateway integration (Razorpay, Stripe, PayPal)
- GST/TAX compliance (India)
- Customer management & loyalty programs
- Service provider management
- Real-time notifications (Email, SMS, Push)
- Analytics & reporting dashboards
- Customer support system
- Mobile & web applications

### Out of Scope
- Accounting software integration (Phase 2)
- Advanced AI/ML recommendations (Phase 2)
- Multi-currency support (Phase 2)
- IoT device integration (Phase 3)
- Blockchain integration (Future)

---

## 3. ARCHITECTURE OVERVIEW

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌───────────────┬──────────────┬──────────────┬──────────┐ │
│  │  Web App      │  Mobile App  │   Admin      │   POS    │ │
│  │  (React.js)   │ (React Native)│ Dashboard   │ Terminal  │ │
│  └───────────────┴──────────────┴──────────────┴──────────┘ │
└─────────────────────────────────────────────────────────────┘
                           ↓ (REST/GraphQL APIs)
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Gateway (Kong/AWS API Gateway)                │   │
│  │  - Request routing, rate limiting, authentication  │   │
│  │  - Version management, CORS handling               │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              BUSINESS LOGIC LAYER (Microservices)           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Core Services:                                     │   │
│  │  • Order Service          • Payment Service         │   │
│  │  • Inventory Service      • Customer Service        │   │
│  │  • Pricing Service        • Notification Service    │   │
│  │  • Tax Service            • Delivery Service        │   │
│  │  • Loyalty Service        • Support Service         │   │
│  │  • Analytics Service      • User Service            │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            DATA & INTEGRATION LAYER                         │
│  ┌──────────────┬──────────────┬──────────────────────┐    │
│  │  PostgreSQL  │  Redis Cache │  Elasticsearch      │    │
│  │  (Primary DB)│  (Sessions)  │  (Search/Logs)      │    │
│  └──────────────┴──────────────┴──────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  External Integrations:                            │    │
│  │  • Payment Gateways  • Email Service (SendGrid)    │    │
│  │  • SMS Service       • Push Notifications          │    │
│  │  • Cloud Storage     • Analytics Tools             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           INFRASTRUCTURE & DEPLOYMENT                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Cloud Platform (AWS/GCP/Azure)                   │    │
│  │  - Kubernetes Clusters      - Load Balancers      │    │
│  │  - Auto Scaling Groups      - CDN Distribution    │    │
│  │  - Monitoring & Logging     - Backup & Recovery   │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Microservices Architecture

```
Service Mesh (Istio/Linkerd)
    ↓
┌─────────────────────────────────────────────────────┐
│  USER SERVICE                 │ COMPANY SERVICE      │
│  - Registration               │ - Shop setup         │
│  - Authentication             │ - Configuration      │
│  - Profile Management         │ - Multi-location     │
│  - Preferences                │ - Business type      │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────┐
│  CATALOG SERVICE              │ INVENTORY SERVICE    │
│  - Products/Items             │ - Stock tracking     │
│  - Categories                 │ - Location-wise      │
│  - Brands & Types             │ - Stock movement     │
│  - Pricing                    │ - Expiry management  │
│  - Barcode/QR                 │ - ROL management     │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────┐
│  CART & ORDER SERVICE         │ PAYMENT SERVICE      │
│  - Shopping cart              │ - Payment processing │
│  - Wishlist                   │ - Gateway integration│
│  - Order creation             │ - Reconciliation     │
│  - Order tracking             │ - Refunds            │
│  - Order history              │ - Secure storage     │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────┐
│  PRICING & DISCOUNT           │ TAX SERVICE          │
│  - Discounts                  │ - GST calculation    │
│  - Offers                     │ - Tax breakdown      │
│  - Coupons                    │ - Compliance         │
│  - Dynamic pricing            │ - Tax reports        │
│  - Price calculations         │ - Audit trail        │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────┐
│  NOTIFICATION SERVICE         │ DELIVERY SERVICE     │
│  - Email                      │ - Provider mgmt      │
│  - SMS                        │ - Service areas      │
│  - Push notifications         │ - Tracking           │
│  - In-app messages            │ - Assignments        │
│  - Preference management      │ - Performance        │
└─────────────────────────────────────────────────────┘
         ↓                              ↓
┌─────────────────────────────────────────────────────┐
│  SUPPORT SERVICE              │ ANALYTICS SERVICE    │
│  - Ticketing system           │ - Real-time analytics│
│  - Live chat                  │ - Dashboards         │
│  - KB management              │ - Reports            │
│  - Escalation                 │ - BI integration     │
│  - Feedback                   │ - Recommendations    │
└─────────────────────────────────────────────────────┘
```

---

## 4. CORE MODULES

### 4.1 Module Breakdown

| Module | Purpose | Key Components |
|--------|---------|-----------------|
| **Business Setup** | Company/Shop registration & config | GSTIN, address, business type |
| **Master Data** | Product catalog management | Items, categories, brands, pricing |
| **Inventory** | Stock management | Location-wise stock, expiry, ROL |
| **Product Discovery** | Search & browse | Barcode, QR, text, filters |
| **Shopping** | Cart & checkout | Add/remove, quantity, wishlist |
| **Pricing** | Discounts & offers | Item/order level, coupons, promos |
| **Orders** | Order lifecycle | Creation, status, returns, reorders |
| **Payment** | Payment processing | Multiple gateways, secure storage |
| **Tax & Charges** | Financial mgmt | GST, delivery, packing charges |
| **Billing** | Documentation | Bills, invoices, receipts, PDFs |
| **Customers** | User management | Registration, profiles, addresses |
| **Service Providers** | Delivery partners | Registration, approval, performance |
| **Notifications** | Communications | Email, SMS, push, in-app |
| **Dashboards** | Analytics | Customer, business, provider dashboards |
| **Support** | Help & assistance | Tickets, chat, KB, AI chatbot |
| **Engagement** | Loyalty & rewards | Points, referrals, welcome offers |

---

## 5. DATA FLOW

### 5.1 Order Processing Flow

```
Customer Browse
      ↓
Add to Cart
      ↓
Apply Discount/Coupon
      ↓
Review Cart
      ↓
Enter Delivery Address
      ↓
Select Payment Method
      ↓
Payment Processing
      ├─ Success → Order Confirmed
      │            ↓
      │            Inventory Reserved
      │            ↓
      │            Order Notification Sent
      │            ↓
      │            Fulfillment Starts
      │
      └─ Failed → Payment Error
                   ↓
                   Retry/Cancel Options
```

### 5.2 Inventory Management Flow

```
Supplier → Purchase Order → Goods Receipt
                              ↓
                         Stock Added
                              ↓
                    Location/Shelf/Rack Assignment
                              ↓
                         Barcode Scan
                              ↓
                    Stock Available for Sale
                              ↓
Customer Order Placed
      ↓
Stock Reserved
      ↓
Order Confirmation
      ↓
Stock Picked & Packed
      ↓
Stock Reserved → Stock Issued
      ↓
Delivery
      ↓
Stock Movement Complete
```

---

## 6. TECHNOLOGY STACK

### 6.1 Frontend
- **Web:** React.js, Next.js, Redux
- **Mobile:** React Native, Expo
- **UI Framework:** Material-UI, Tailwind CSS
- **Charts:** Chart.js, Recharts
- **Payment UI:** Razorpay Checkout, Stripe.js

### 6.2 Backend
- **Runtime:** Node.js v18+
- **Framework:** Express.js, NestJS
- **Language:** JavaScript/TypeScript
- **Authentication:** JWT, OAuth 2.0, Passport.js
- **Validation:** Joi, Yup
- **ORM:** TypeORM, Sequelize

### 6.3 Database
- **Primary:** PostgreSQL 14+
- **Cache:** Redis 7+
- **Search:** Elasticsearch 8+
- **Message Queue:** RabbitMQ / Apache Kafka
- **Document Store:** MongoDB (optional, for unstructured data)

### 6.4 External Services
- **Payment:** Razorpay, Stripe, PayPal
- **Email:** SendGrid, AWS SES
- **SMS:** Twilio, AWS SNS
- **Push Notifications:** Firebase Cloud Messaging
- **Storage:** AWS S3, Google Cloud Storage
- **Analytics:** Google Analytics, Mixpanel
- **Monitoring:** DataDog, New Relic, ELK Stack

### 6.5 DevOps & Infrastructure
- **Containerization:** Docker
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions, GitLab CI
- **Cloud:** AWS / GCP / Azure
- **Monitoring:** Prometheus, Grafana
- **Logging:** ELK Stack, Splunk
- **Security:** HashiCorp Vault, SSL/TLS

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance Requirements

| Metric | Target | Implementation |
|--------|--------|-----------------|
| Page Load Time | <2 seconds | CDN, caching, optimization |
| API Response Time | <500ms | Async processing, indexing |
| Search Latency | <200ms | Elasticsearch, caching |
| Concurrent Users | 10,000+ | Horizontal scaling, load balancing |
| Database Queries/sec | 100,000+ | Connection pooling, optimization |
| Throughput | 1000 orders/min | Message queues, async processing |

### 7.2 Availability & Reliability

| Requirement | Target | Implementation |
|-------------|--------|-----------------|
| Uptime SLA | 99.9% | HA infrastructure, auto-failover |
| Mean Time to Recovery (MTTR) | <15 minutes | Automated alerting, runbooks |
| Backup Frequency | Hourly | AWS Backup, geo-redundant storage |
| Disaster Recovery RTO | 4 hours | Multi-region failover |
| Data Durability | 99.99999% | Replication, backup strategy |

### 7.3 Security & Compliance

| Requirement | Implementation | Status |
|-------------|-----------------|--------|
| **Encryption** | TLS 1.3 (transit), AES-256 (storage) | ✓ |
| **Authentication** | OAuth 2.0, JWT, MFA | ✓ |
| **Authorization** | RBAC (Role-Based Access Control) | ✓ |
| **PCI-DSS** | Payment tokenization, PCI compliance | ✓ |
| **GDPR** | Data protection, right to deletion | ✓ |
| **GST Compliance** | Tax calculation, compliance reporting | ✓ |
| **Audit Logging** | All activity logged & immutable | ✓ |
| **DDoS Protection** | WAF, rate limiting, IP filtering | ✓ |

### 7.4 Scalability

- **Horizontal Scaling:** Stateless services deployed across multiple instances
- **Database Sharding:** Order/customer data sharded by company_id
- **Caching Strategy:** Redis for session/cache, Varnish for HTTP cache
- **CDN:** CloudFlare/AWS CloudFront for static assets
- **Message Queues:** RabbitMQ for async processing, peak load handling
- **Load Balancing:** Round-robin, least connection, based on CPU/memory

---

## 8. DEPLOYMENT ARCHITECTURE

### 8.1 Deployment Pipeline

```
Git Commit
    ↓
GitHub Actions (CI/CD)
    ├─ Code Checkout
    ├─ Build & Unit Tests
    ├─ SAST Scanning
    ├─ Build Docker Image
    ├─ Push to Registry
    └─ Update Kubernetes
        ↓
    Dev Environment (Automated)
        ↓
    Integration Tests
        ↓
    Staging Environment (Approval)
        ↓
    Smoke Tests
        ↓
    Production (Blue-Green Deployment)
        ├─ Health Checks
        ├─ Smoke Tests
        └─ Monitor Metrics
```

### 8.2 Kubernetes Architecture

```
┌─────────────────────────────────────────────────┐
│         Kubernetes Cluster (AWS EKS)            │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  Ingress Controller (Nginx)             │   │
│  │  - SSL/TLS termination                  │   │
│  │  - Request routing                      │   │
│  └─────────────────────────────────────────┘   │
│                     ↓                           │
│  ┌─────────────────────────────────────────┐   │
│  │  API Gateway Service (Kong)             │   │
│  │  - Rate limiting, auth                  │   │
│  │  - Request transformation               │   │
│  └─────────────────────────────────────────┘   │
│                     ↓                           │
│  ┌───────────┬───────────┬────────────────┐    │
│  │ Namespace │ Namespace │ Namespace      │    │
│  │ (Services)│ (Services)│ (Services)     │    │
│  │           │           │                │    │
│  │ Pod   Pod │ Pod   Pod │ Pod   Pod      │    │
│  │ Pod   Pod │ Pod   Pod │ Pod   Pod      │    │
│  └───────────┴───────────┴────────────────┘    │
│                                                 │
│  ┌────────────────────────────────────────┐    │
│  │  Data Layer (Services)                 │    │
│  │  - PostgreSQL (StatefulSet)            │    │
│  │  - Redis (StatefulSet)                 │    │
│  │  - Elasticsearch (StatefulSet)         │    │
│  └────────────────────────────────────────┘    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 9. SECURITY ARCHITECTURE

### 9.1 Security Layers

```
┌─────────────────────────────────────────┐
│  Perimeter Security                     │
│  - DDoS Protection (AWS Shield)         │
│  - WAF (Web Application Firewall)       │
│  - Rate Limiting                        │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Transport Security                     │
│  - TLS 1.3 for all connections          │
│  - Certificate management               │
│  - HSTS headers                         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Application Security                   │
│  - OAuth 2.0 / OIDC authentication      │
│  - JWT token management                 │
│  - RBAC authorization                   │
│  - Input validation & sanitization      │
│  - SQL injection prevention              │
│  - XSS protection                       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  Data Security                          │
│  - AES-256 encryption at rest           │
│  - Tokenization for sensitive data      │
│  - Database access controls             │
│  - Audit logging & monitoring           │
└─────────────────────────────────────────┘
```

### 9.2 Authentication & Authorization Flow

```
Client → /login with credentials
           ↓
    Auth Service
    ├─ Validate credentials (bcrypt)
    ├─ Generate JWT token
    ├─ Store session in Redis
    └─ Return token
           ↓
Client stores token
           ↓
Client → API request with token
          ↓
     API Gateway
     ├─ Verify JWT signature
     ├─ Check token expiry
     ├─ Load user from Redis
     ├─ Check permissions (RBAC)
     └─ Forward to service
           ↓
    Business Logic Service
     ├─ Process request
     └─ Return response
           ↓
Return response to client
```

---

## 10. CONFIGURATION MANAGEMENT

### 10.1 Feature Flags

```yaml
features:
  payment_processing: true
  loyalty_program: true
  subscription_management: false
  ai_recommendations: false
  multi_currency: false
  
business_type_features:
  retail:
    inventory: true
    pos: true
    loyalty_program: true
  restaurant:
    inventory: true
    kitchen_display: true
    table_management: true
  subscription_service:
    recurring_billing: true
    auto_renewal: true
```

### 10.2 Environment Configuration

```
Development:
  - Full logging & debugging
  - Test payment gateway
  - Mock external services
  
Staging:
  - Production-like setup
  - Live payment integration
  - Real SMS/Email (test numbers)
  
Production:
  - Optimized logging
  - Real payment processing
  - Production external services
  - Monitoring & alerting enabled
```

---

## 11. INTEGRATION POINTS

### 11.1 External Integrations

```
┌──────────────────────────────────────────┐
│     Billing Software Platform            │
├──────────────────────────────────────────┤
│                                          │
│  Payment Gateways:                       │
│  - Razorpay ←─────────→ REST API         │
│  - Stripe   ←─────────→ REST API         │
│  - PayPal   ←─────────→ REST API         │
│                                          │
│  Communication Services:                 │
│  - SendGrid ←─────────→ REST API         │
│  - Twilio   ←─────────→ REST API         │
│  - Firebase ←─────────→ REST API         │
│                                          │
│  Storage Services:                       │
│  - AWS S3 ←─────────→ SDK                │
│  - CloudFlare CDN ←─────────→ REST API   │
│                                          │
│  Analytics:                              │
│  - Google Analytics ←─────────→ Pixel    │
│  - Mixpanel ←─────────→ API              │
│                                          │
└──────────────────────────────────────────┘
```

---

## 12. PHASE-WISE ROLLOUT

### Phase 1: MVP (Months 1-4)
- ✓ User management & authentication
- ✓ Shop setup & configuration
- ✓ Product catalog (Items, categories, pricing)
- ✓ Basic inventory
- ✓ Shopping cart & checkout
- ✓ Payment processing (Razorpay)
- ✓ Order management
- ✓ Customer management
- ✓ Email notifications
- ✓ Basic reports

### Phase 2: Enhanced (Months 5-8)
- ✓ Loyalty program
- ✓ Advanced discounts & offers
- ✓ Service provider management
- ✓ Delivery integration
- ✓ SMS notifications
- ✓ Push notifications
- ✓ Return & exchange
- ✓ Advanced analytics

### Phase 3: Enterprise (Months 9-12)
- ✓ Multi-currency support
- ✓ AI-powered recommendations
- ✓ Advanced subscription management
- ✓ Business intelligence dashboards
- ✓ API marketplace
- ✓ White-label platform
- ✓ Advanced compliance features

---

## 13. SUCCESS METRICS

### 13.1 Business Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| User Acquisition | 1000 businesses | Month 6 |
| GMV (Gross Merchandise Value) | ₹10 Crore | Month 12 |
| Customer Retention Rate | 80%+ | Month 12 |
| Average Order Value | ₹2000+ | Month 12 |
| Daily Active Users | 50,000+ | Month 12 |

### 13.2 Technical Metrics

| Metric | Target | Status |
|--------|--------|--------|
| System Uptime | 99.9% | Monitored |
| API Response Time | <500ms | Monitored |
| Page Load Time | <2 seconds | Monitored |
| Error Rate | <0.1% | Monitored |
| Database Query Time | <100ms | Optimized |

---

## 14. RISK MANAGEMENT

### 14.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Database performance degradation | High | Caching, sharding, indexing strategy |
| Payment gateway downtime | Critical | Multi-gateway setup, fallback options |
| Data breach | Critical | Encryption, access control, security audit |
| Third-party service failures | Medium | Circuit breakers, retry logic, fallbacks |
| Deployment failures | Medium | Automated rollback, canary deployments |

### 14.2 Business Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Market competition | High | Feature differentiation, aggressive marketing |
| Regulatory changes | Medium | Compliance team, legal consultation |
| Partner dependence | Medium | Multi-vendor strategy, in-house alternatives |
| Talent retention | Medium | Competitive compensation, growth opportunities |

---

## 15. APPROVAL & SIGN-OFF

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Project Manager | [Name] | 2026-03-30 | _____ |
| Tech Lead | [Name] | 2026-03-30 | _____ |
| Business Owner | [Name] | 2026-03-30 | _____ |
| CTO | [Name] | 2026-03-30 | _____ |

---

**Document Version:** 1.0
**Last Updated:** 2026-03-30
**Next Review:** 2026-06-30

```

---

Now let me create the LLD (Low-Level Design) document:

```markdown name=LLD.md
# BILLING SOFTWARE - LOW-LEVEL DESIGN DOCUMENT

## 1. INTRODUCTION

**Project:** Configurable Billing & Order Management Software
**Document Type:** Low-Level Design (LLD)
**Version:** 1.0
**Date:** 2026-03-30
**Author:** Antony Robin

---

## 2. DATABASE DESIGN

### 2.1 Database Schema Overview

#### **Core Tables**

```sql
-- ============================================
-- 1. COMPANIES TABLE
-- ============================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20) UNIQUE NOT NULL,
    pan_number VARCHAR(20),
    business_type VARCHAR(50) NOT NULL,
    industry VARCHAR(50),
    billing_address JSONB NOT NULL,
    logo_url VARCHAR(500),
    stamp_url VARCHAR(500),
    tax_config JSONB,
    currency VARCHAR(10) DEFAULT 'INR',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    subscription_plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    CONSTRAINT valid_gstin CHECK (gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
);

-- ============================================
-- 2. LOCATIONS TABLE
-- ============================================
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address JSONB NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    gstin VARCHAR(20),
    manager_id UUID,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, name),
    INDEX idx_company_locations (company_id)
);

-- ============================================
-- 3. CUSTOMERS TABLE
-- ============================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    date_of_birth DATE,
    gender VARCHAR(50),
    profile_picture_url VARCHAR(500),
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    account_type VARCHAR(50) DEFAULT 'PERSONAL',
    customer_segment VARCHAR(50) DEFAULT 'REGULAR',
    credit_score INT DEFAULT 0,
    loyalty_points INT DEFAULT 0,
    wallet_balance DECIMAL(15, 2) DEFAULT 0.00,
    language_preference VARCHAR(50) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_status (status)
);

-- ============================================
-- 4. ITEMS/PRODUCTS TABLE
-- ============================================
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES categories(id),
    brand_id UUID REFERENCES brands(id),
    type_id UUID REFERENCES types(id),
    packing_size_id UUID REFERENCES packing_sizes(id),
    unit VARCHAR(50) NOT NULL,
    cost_price DECIMAL(15, 2),
    selling_price DECIMAL(15, 2) NOT NULL,
    mrp DECIMAL(15, 2),
    hsn_code VARCHAR(20),
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    barcode VARCHAR(100),
    qr_code TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    expiry_date DATE,
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    UNIQUE(company_id, sku),
    UNIQUE(barcode),
    INDEX idx_company_items (company_id),
    INDEX idx_sku (sku),
    INDEX idx_status (status)
);

-- ============================================
-- 5. INVENTORY TABLE
-- ============================================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES items(id),
    location_id UUID NOT NULL REFERENCES locations(id),
    shelf_id VARCHAR(50),
    rack_id VARCHAR(50),
    quantity_total INT DEFAULT 0,
    quantity_reserved INT DEFAULT 0,
    quantity_damaged INT DEFAULT 0,
    quantity_available INT GENERATED ALWAYS AS (quantity_total - quantity_reserved - quantity_damaged) STORED,
    last_stock_update TIMESTAMP DEFAULT NOW(),
    updated_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(item_id, location_id, shelf_id, rack_id),
    INDEX idx_item_location (item_id, location_id),
    CONSTRAINT check_quantities CHECK (
        quantity_total >= 0 AND quantity_reserved >= 0 AND quantity_damaged >= 0
    )
);

-- ============================================
-- 6. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES companies(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    status VARCHAR(50) DEFAULT 'PENDING',
    subtotal DECIMAL(15, 2),
    tax_total DECIMAL(15, 2),
    discount_total DECIMAL(15, 2) DEFAULT 0.00,
    delivery_charge DECIMAL(15, 2) DEFAULT 0.00,
    packing_charge DECIMAL(15, 2) DEFAULT 0.00,
    platform_charge DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2),
    payment_method VARCHAR(50),
    payment_status VARCHAR(50),
    payment_transaction_id UUID,
    delivery_address_id UUID NOT NULL,
    delivery_date DATE,
    delivery_time_window VARCHAR(50),
    service_provider_id UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    delivered_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancelled_by UUID,
    cancellation_reason TEXT,
    INDEX idx_order_number (order_number),
    INDEX idx_company_orders (company_id),
    INDEX idx_customer_orders (customer_id),
    INDEX idx_status (status),
    INDEX idx_created_date (created_at)
);

-- ============================================
-- 7. ORDER ITEMS TABLE
-- ============================================
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(15, 2),
    discount DECIMAL(15, 2) DEFAULT 0.00,
    tax DECIMAL(15, 2) DEFAULT 0.00,
    subtotal DECIMAL(15, 2),
    return_quantity INT DEFAULT 0,
    return_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_order_items (order_id),
    CONSTRAINT check_quantities CHECK (quantity > 0)
);

-- ============================================
-- 8. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    amount DECIMAL(15, 2),
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50),
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    status VARCHAR(50),
    metadata JSONB,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_order_payment (order_id),
    INDEX idx_status (status)
);

-- ============================================
-- 9. DISCOUNTS TABLE
-- ============================================
CREATE TABLE discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    name VARCHAR(255),
    type VARCHAR(50),
    value DECIMAL(15, 2),
    min_cart_value DECIMAL(15, 2),
    max_discount_amount DECIMAL(15, 2),
    applicable_to VARCHAR(50),
    applicable_id UUID,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE,
    priority INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_company_discounts (company_id),
    INDEX idx_active (active)
);

-- ============================================
-- 10. COUPONS TABLE
-- ============================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(50),
    discount_value DECIMAL(15, 2),
    min_cart_value DECIMAL(15, 2),
    max_discount_amount DECIMAL(15, 2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_customer_limit INT DEFAULT 1,
    valid_from DATE,
    valid_until DATE,
    applicable_items TEXT[],
    applicable_categories TEXT[],
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(company_id, code),
    INDEX idx_code (code),
    INDEX idx_active (status)
);

-- ============================================
-- 11. SERVICE PROVIDERS TABLE
-- ============================================
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    service_type VARCHAR(50),
    status VARCHAR(50) DEFAULT 'REGISTERED',
    company_id UUID REFERENCES companies(id),
    registration_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    approval_comments TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_deliveries INT DEFAULT 0,
    on_time_percentage DECIMAL(5, 2) DEFAULT 0.00,
    cancellation_percentage DECIMAL(5, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_status (status)
);

-- ============================================
-- 12. PAYMENTS SAVED TABLE
-- ============================================
CREATE TABLE saved_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    gateway_token VARCHAR(255),
    card_type VARCHAR(50),
    card_brand VARCHAR(50),
    last_4_digits VARCHAR(4),
    expiry_month INT,
    expiry_year INT,
    card_holder_name VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_customer_payments (customer_id)
);

-- ============================================
-- 13. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    service_provider_id UUID REFERENCES service_providers(id),
    notification_type VARCHAR(50),
    channel VARCHAR(50),
    recipient VARCHAR(255),
    subject VARCHAR(255),
    body TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_status (status),
    INDEX idx_customer_notifications (customer_id)
);

-- ============================================
-- 14. SUPPORT TICKETS TABLE
-- ============================================
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(50) UNIQUE,
    customer_id UUID REFERENCES customers(id),
    category VARCHAR(50),
    subject VARCHAR(255),
    description TEXT,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'OPEN',
    assigned_to UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    assigned_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_customer (customer_id)
);

-- ============================================
-- 15. AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(50),
    old_value JSONB,
    new_value JSONB,
    user_id UUID,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
);
```

### 2.2 Database Indexes Strategy

```sql
-- High-Priority Indexes (Critical for performance)
CREATE INDEX idx_orders_customer_created 
    ON orders(customer_id, created_at DESC);

CREATE INDEX idx_inventory_available 
    ON inventory(location_id, quantity_available DESC);

CREATE INDEX idx_items_company_status 
    ON items(company_id, status);

CREATE INDEX idx_customers_email_phone 
    ON customers(email, phone);

-- Search Indexes
CREATE INDEX idx_items_search 
    ON items USING GIN(to_tsvector('english', name || ' ' || description));

-- Partial Indexes (for common queries)
CREATE INDEX idx_active_orders 
    ON orders(company_id) 
    WHERE status IN ('PENDING', 'CONFIRMED', 'PACKED', 'IN_TRANSIT');

CREATE INDEX idx_available_items 
    ON items(company_id) 
    WHERE status = 'ACTIVE';
```

---

## 3. API DESIGN

### 3.1 Authentication & Authorization APIs

```yaml
# Login
POST /api/v1/auth/login
Request:
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
Response:
  {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "company_id": "uuid"
    }
  }

# Logout
POST /api/v1/auth/logout
Headers:
  Authorization: Bearer {token}
Response: {status: "success"}

# Refresh Token
POST /api/v1/auth/refresh-token
Request:
  {
    "refresh_token": "token"
  }
Response:
  {
    "access_token": "new_token",
    "expires_in": 3600
  }

# Register
POST /api/v1/auth/register
Request:
  {
    "email": "user@example.com",
    "phone": "+919876543210",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securePassword123"
  }
Response:
  {
    "id": "uuid",
    "email": "user@example.com",
    "message": "Registration successful. Verify email to continue."
  }

# Email Verification
POST /api/v1/auth/verify-email/{token}
Response: {status: "success", message: "Email verified"}

# OTP Verification
POST /api/v1/auth/verify-otp
Request:
  {
    "phone": "+919876543210",
    "otp": "123456"
  }
Response: {status: "success", verified: true}
```

### 3.2 Customer APIs

```yaml
# Get Customer Profile
GET /api/v1/customers/me
Headers:
  Authorization: Bearer {token}
Response:
  {
    "id": "uuid",
    "email": "john@example.com",
    "phone": "+919876543210",
    "first_name": "John",
    "last_name": "Doe",
    "loyalty_points": 5000,
    "wallet_balance": 1000.00,
    "customer_segment": "GOLD",
    "created_at": "2026-03-15T10:00:00Z"
  }

# Update Customer Profile
PUT /api/v1/customers/me
Headers:
  Authorization: Bearer {token}
Request:
  {
    "first_name": "John",
    "last_name": "Smith",
    "date_of_birth": "1990-01-15"
  }
Response: {status: "success", updated_customer: {...}}

# Get Customer Orders
GET /api/v1/customers/me/orders?status=DELIVERED&limit=10&offset=0
Headers:
  Authorization: Bearer {token}
Response:
  {
    "total": 25,
    "offset": 0,
    "limit": 10,
    "data": [
      {
        "id": "uuid",
        "order_number": "SHOP-2026-03-00001",
        "total_amount": 1500.00,
        "status": "DELIVERED",
        "created_at": "2026-03-20T14:30:00Z"
      }
    ]
  }

# Get Order Details
GET /api/v1/orders/{order_id}
Headers:
  Authorization: Bearer {token}
Response:
  {
    "id": "uuid",
    "order_number": "SHOP-2026-03-00001",
    "customer": {...},
    "items": [...],
    "total_amount": 1500.00,
    "tax_amount": 270.00,
    "discount_amount": 100.00,
    "delivery_charge": 50.00,
    "status": "DELIVERED",
    "delivery_address": {...},
    "created_at": "2026-03-20T14:30:00Z",
    "delivered_at": "2026-03-21T16:45:00Z"
  }

# Add Customer Address
POST /api/v1/customers/me/addresses
Headers:
  Authorization: Bearer {token}
Request:
  {
    "address_type": "HOME",
    "name": "Home",
    "phone": "+919876543210",
    "street_address": "123 Main St",
    "area_locality": "Downtown",
    "city": "Mumbai",
    "state": "Maharashtra",
    "postal_code": "400001",
    "landmark": "Near Central Mall",
    "is_default": true
  }
Response: {status: "success", address_id: "uuid"}

# Get Customer Addresses
GET /api/v1/customers/me/addresses
Headers:
  Authorization: Bearer {token}
Response:
  {
    "data": [
      {
        "id": "uuid",
        "address_type": "HOME",
        "street_address": "123 Main St",
        "is_default": true,
        "created_at": "2026-03-01T10:00:00Z"
      }
    ]
  }

# Update Address
PUT /api/v1/customers/me/addresses/{address_id}
Request: {...updated fields...}

# Delete Address
DELETE /api/v1/customers/me/addresses/{address_id}
```

### 3.3 Product/Catalog APIs

```yaml
# Get Products with Filters
GET /api/v1/products?category=grocery&brand=nestlé&price_min=100&price_max=500&page=1&limit=20
Response:
  {
    "total": 150,
    "page": 1,
    "limit": 20,
    "data": [
      {
        "id": "uuid",
        "sku": "PROD-001",
        "name": "Product Name",
        "price": 299.99,
        "mrp": 399.99,
        "discount_percent": 25,
        "rating": 4.5,
        "in_stock": true,
        "images": ["url1", "url2"],
        "category": "Grocery",
        "brand": "Nestlé"
      }
    ]
  }

# Search Products
GET /api/v1/products/search?q=milk&type=barcode|qr|text
Response: {...product_list...}

# Get Product Details
GET /api/v1/products/{product_id}
Response:
  {
    "id": "uuid",
    "sku": "PROD-001",
    "name": "Full Fat Milk 1L",
    "description": "...",
    "price": 60.00,
    "mrp": 65.00,
    "cost_price": 45.00,
    "tax_rate": 5,
    "category": "Dairy",
    "brand": "Amul",
    "unit": "Liter",
    "in_stock": true,
    "stock_quantity": 150,
    "barcode": "8901207123456",
    "qr_code": "...",
    "expiry_date": "2026-05-30",
    "images": [...],
    "reviews": {
      "average_rating": 4.5,
      "total_reviews": 150,
      "reviews": [...]
    }
  }

# Scan Barcode
POST /api/v1/products/barcode/scan
Request: {barcode: "8901207123456"}
Response:
  {
    "product_id": "uuid",
    "sku": "PROD-001",
    "name": "Full Fat Milk 1L",
    "price": 60.00,
    "in_stock": true
  }

# Scan QR Code
POST /api/v1/products/qrcode/scan
Request: {qr_data: "..."}
Response: {...product_details...}

# Get Categories
GET /api/v1/categories
Response:
  {
    "data": [
      {
        "id": "uuid",
        "name": "Grocery",
        "image_url": "...",
        "subcategories": [
          {
            "id": "uuid",
            "name": "Dairy",
            "products_count": 45
          }
        ]
      }
    ]
  }

# Get Brands
GET /api/v1/brands?category_id=uuid
Response:
  {
    "data": [
      {
        "id": "uuid",
        "name": "Amul",
        "logo_url": "...",
        "products_count": 20
      }
    ]
  }
```

### 3.4 Shopping Cart APIs

```yaml
# Add to Cart
POST /api/v1/cart/items
Headers:
  Authorization: Bearer {token}
Request:
  {
    "product_id": "uuid",
    "quantity": 2
  }
Response:
  {
    "cart_id": "uuid",
    "item_added": {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 2,
      "price": 120.00,
      "subtotal": 240.00
    },
    "cart_summary": {
      "total_items": 3,
      "subtotal": 540.00,
      "tax": 97.20,
      "total": 637.20
    }
  }

# Get Cart
GET /api/v1/cart
Headers:
  Authorization: Bearer {token}
Response:
  {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "product_name": "Milk 1L",
        "quantity": 2,
        "price": 60.00,
        "discount": 0,
        "tax": 10.80,
        "subtotal": 120.00
      }
    ],
    "summary": {
      "subtotal": 540.00,
      "tax_total": 97.20,
      "discount_total": 50.00,
      "delivery_charge": 50.00,
      "packing_charge": 10.00,
      "platform_charge": 0,
      "total": 647.20
    },
    "applied_coupon": null
  }

# Update Cart Item
PUT /api/v1/cart/items/{item_id}
Request: {quantity: 5}
Response: {...updated_cart...}

# Remove from Cart
DELETE /api/v1/cart/items/{item_id}
Response: {...updated_cart...}

# Apply Coupon
POST /api/v1/cart/apply-coupon
Request: {coupon_code: "SUMMER20"}
Response:
  {
    "valid": true,
    "discount_amount": 100.00,
    "new_total": 547.20,
    "coupon": {
      "code": "SUMMER20",
      "discount_type": "PERCENTAGE",
      "discount_value": 20
    }
  }

# Remove Coupon
DELETE /api/v1/cart/coupon
Response: {...updated_cart...}

# Clear Cart
DELETE /api/v1/cart
Response: {status: "success"}
```

### 3.5 Order APIs

```yaml
# Create Order
POST /api/v1/orders
Headers:
  Authorization: Bearer {token}
Request:
  {
    "delivery_address_id": "uuid",
    "payment_method": "CARD",
    "delivery_date": "2026-03-31",
    "delivery_time_window": "10:00-14:00",
    "notes": "Handle with care"
  }
Response:
  {
    "id": "uuid",
    "order_number": "SHOP-2026-03-00001",
    "status": "PENDING",
    "total_amount": 647.20,
    "payment_status": "PENDING",
    "created_at": "2026-03-30T15:00:00Z",
    "razorpay_order_id": "order_xxx"
  }

# Initiate Payment
POST /api/v1/orders/{order_id}/initiate-payment
Request:
  {
    "gateway": "razorpay"
  }
Response:
  {
    "order_id": "uuid",
    "payment_gateway_order_id": "order_xxx",
    "amount": 64720,
    "currency": "INR",
    "customer": {...},
    "notes": {...}
  }

# Verify Payment
POST /api/v1/orders/{order_id}/verify-payment
Request:
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
Response:
  {
    "status": "success",
    "order": {...},
    "payment": {...}
  }

# Get Order Status
GET /api/v1/orders/{order_id}/status
Response:
  {
    "status": "IN_TRANSIT",
    "timeline": [
      {
        "status": "CONFIRMED",
        "timestamp": "2026-03-30T16:00:00Z",
        "description": "Order confirmed"
      },
      {
        "status": "PACKED",
        "timestamp": "2026-03-31T09:00:00Z",
        "description": "Order packed"
      },
      {
        "status": "IN_TRANSIT",
        "timestamp": "2026-03-31T10:30:00Z",
        "description": "Out for delivery"
      }
    ]
  }

# Cancel Order
POST /api/v1/orders/{order_id}/cancel
Request: {reason: "Changed mind"}
Response:
  {
    "status": "success",
    "refund_initiated": true,
    "refund_amount": 647.20
  }

# Request Return
POST /api/v1/orders/{order_id}/return
Request:
  {
    "return_type": "FULL_RETURN",
    "reason": "DEFECTIVE",
    "reason_details": "Product not working",
    "items": [
      {
        "item_id": "uuid",
        "quantity": 1,
        "condition": "DEFECTIVE"
      }
    ]
  }
Response:
  {
    "return_id": "uuid",
    "return_number": "RET-2026-03-00001",
    "status": "INITIATED",
    "refund_amount": 647.20
  }

# Re-order
POST /api/v1/orders/{order_id}/reorder
Response:
  {
    "new_order_id": "uuid",
    "new_order_number": "SHOP-2026-03-00002",
    "cart_created": true,
    "items_added": 3
  }
```

### 3.6 Payment APIs

```yaml
# Get Payment Methods
GET /api/v1/payments/methods
Headers:
  Authorization: Bearer {token}
Response:
  {
    "data": [
      {
        "id": "uuid",
        "type": "CARD",
        "card_brand": "VISA",
        "last_4": "4242",
        "expiry": "12/2026",
        "is_default": true
      }
    ]
  }

# Save Payment Method
POST /api/v1/payments/methods
Request:
  {
    "card_number": "4111111111111111",
    "expiry_month": 12,
    "expiry_year": 2026,
    "cvv": "123",
    "card_holder_name": "John Doe",
    "save_for_future": true
  }
Response:
  {
    "id": "uuid",
    "token": "token_xxx",
    "last_4": "1111",
    "is_default": false
  }

# Delete Payment Method
DELETE /api/v1/payments/methods/{payment_method_id}
Response: {status: "success"}

# Set Default Payment Method
PUT /api/v1/payments/methods/{payment_method_id}/set-default
Response: {status: "success"}

# Process Refund
POST /api/v1/payments/{payment_id}/refund
Request:
  {
    "amount": 647.20,
    "reason": "Customer requested return"
  }
Response:
  {
    "id": "uuid",
    "status": "INITIATED",
    "refund_amount": 647.20,
    "initiated_at": "2026-03-30T15:00:00Z"
  }
```

### 3.7 Notification APIs

```yaml
# Get Notification Preferences
GET /api/v1/notifications/preferences
Headers:
  Authorization: Bearer {token}
Response:
  {
    "email": {
      "order_confirmation": true,
      "delivery_updates": true,
      "promotional": false,
      "newsletter": true
    },
    "sms": {
      "order_confirmation": true,
      "delivery_updates": true,
      "promotional": false
    },
    "push": {
      "order_updates": true,
      "promotional": false
    }
  }

# Update Notification Preferences
PUT /api/v1/notifications/preferences
Request:
  {
    "email": {
      "promotional": true,
      "newsletter": false
    },
    "sms": {
      "promotional": false
    }
  }
Response: {status: "success"}

# Get Notifications
GET /api/v1/notifications?limit=20&offset=0
Response:
  {
    "data": [
      {
        "id": "uuid",
        "type": "ORDER_DELIVERED",
        "title": "Order Delivered",
        "message": "Your order SHOP-2026-03-00001 has been delivered",
        "created_at": "2026-03-31T14:30:00Z",
        "read": false
      }
    ]
  }

# Mark Notification as Read
PUT /api/v1/notifications/{notification_id}/read
Response: {status: "success"}
```

### 3.8 Loyalty & Rewards APIs

```yaml
# Get Loyalty Points
GET /api/v1/loyalty/points
Headers:
  Authorization: Bearer {token}
Response:
  {
    "total_points": 5000,
    "redeemable_points": 4500,
    "expiring_points": 500,
    "next_expiry_date": "2026-06-30",
    "current_tier": "GOLD",
    "points_to_next_tier": 2000
  }

# Get Loyalty History
GET /api/v1/loyalty/history?limit=20&offset=0
Response:
  {
    "data": [
      {
        "id": "uuid",
        "type": "EARNED",
        "points": 100,
        "order_id": "uuid",
        "created_at": "2026-03-30T14:30:00Z"
      },
      {
        "id": "uuid",
        "type": "REDEEMED",
        "points": -50,
        "order_id": "uuid",
        "created_at": "2026-03-29T10:15:00Z"
      }
    ]
  }

# Redeem Points
POST /api/v1/loyalty/redeem
Request: {points: 500}
Response:
  {
    "status": "success",
    "discount_amount": 50.00,
    "points_remaining": 4500
  }

# Get Referral Code
GET /api/v1/loyalty/referral-code
Response:
  {
    "code": "REF-abc123",
    "share_url": "https://billing.app/ref/REF-abc123",
    "referrals_count": 5,
    "earnings": 2500
  }

# Get Referral History
GET /api/v1/loyalty/referrals
Response:
  {
    "data": [
      {
        "id": "uuid",
        "code": "REF-abc123",
        "referee_name": "Jane Doe",
        "status": "COMPLETED",
        "reward_points": 500,
        "created_at": "2026-03-20T10:00:00Z"
      }
    ]
  }
```

### 3.9 Support APIs

```yaml
# Create Support Ticket
POST /api/v1/support/tickets
Headers:
  Authorization: Bearer {token}
Request:
  {
    "category": "ORDER_ISSUE",
    "subject": "Order not received",
    "description": "I haven't received my order yet",
    "order_id": "uuid",
    "priority": "HIGH"
  }
Response:
  {
    "id": "uuid",
    "ticket_number": "TKT-2026-03-00001",
    "status": "OPEN",
    "created_at": "2026-03-30T15:00:00Z"
  }

# Get Support Tickets
GET /api/v1/support/tickets?status=OPEN&limit=10
Response:
  {
    "data": [
      {
        "id": "uuid",
        "ticket_number": "TKT-2026-03-00001",
        "subject": "Order not received",
        "status": "IN_PROGRESS",
        "priority": "HIGH",
        "created_at": "2026-03-30T15:00:00Z",
        "assigned_to": "support@company.com"
      }
    ]
  }

# Get Ticket Details
GET /api/v1/support/tickets/{ticket_id}
Response:
  {
    "id": "uuid",
    "ticket_number": "TKT-2026-03-00001",
    "subject": "Order not received",
    "description": "...",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "messages": [
      {
        "id": "uuid",
        "from": "customer",
        "message": "I haven't received my order",
        "created_at": "2026-03-30T15:00:00Z"
      },
      {
        "id": "uuid",
        "from": "support",
        "message": "We are investigating this. Please wait for 24 hours.",
        "created_at": "2026-03-30T16:00:00Z"
      }
    ]
  }

# Add Message to Ticket
POST /api/v1/support/tickets/{ticket_id}/messages
Request:
  {
    "message": "Thank you for helping"
  }
Response: {status: "success"}

# Close Ticket
POST /api/v1/support/tickets/{ticket_id}/close
Response: {status: "success"}
```

---

## 4. SERVICE SPECIFICATIONS

### 4.1 Order Service

**Responsibilities:**
- Order creation & management
- Order status tracking
- Return/exchange processing
- Order timeline management

**Key Methods:**

```typescript
class OrderService {
    async createOrder(customerId: string, cartData: Cart): Promise<Order> {
        // Validate cart items availability
        // Calculate final totals with tax & charges
        // Reserve inventory
        // Create order record
        // Trigger notifications
        // Return order details
    }
    
    async confirmOrder(orderId: string, paymentData: Payment): Promise<Order> {
        // Verify payment
        // Update order status to CONFIRMED
        // Finalize inventory reservation
        // Send confirmation notification
    }
    
    async processReturn(orderId: string, returnRequest: ReturnRequest): Promise<Return> {
        // Validate return eligibility
        // Verify items & conditions
        // Create return record
        // Initiate refund process
        // Send return notification
    }
    
    async getOrderStatus(orderId: string): Promise<OrderStatus> {
        // Get order status
        // Generate timeline
        // Calculate estimated delivery
    }
}
```

### 4.2 Payment Service

**Responsibilities:**
- Payment processing
- Secure card storage
- Refund management
- PCI-DSS compliance

**Key Methods:**

```typescript
class PaymentService {
    async initiatePayment(orderId: string, paymentMethod: string): Promise<PaymentInitiation> {
        // Create payment order in gateway
        // Return payment details for frontend
    }
    
    async verifyPayment(
        orderId: string,
        gatewayOrderId: string,
        gatewayPaymentId: string,
        signature: string
    ): Promise<PaymentVerification> {
        // Verify signature with payment gateway
        // Update payment status
        // Trigger order confirmation
    }
    
    async savePaymentMethod(customerId: string, cardData: Card): Promise<SavedPayment> {
        // Tokenize card with gateway
        // Store token securely
        // Mask card details
    }
    
    async processRefund(paymentId: string, amount: number): Promise<Refund> {
        // Initiate refund with gateway
        // Track refund status
        // Update order status
    }
}
```

### 4.3 Inventory Service

**Responsibilities:**
- Stock management
- Inventory tracking
- Stock reservations
- Expiry management

**Key Methods:**

```typescript
class InventoryService {
    async getAvailableStock(itemId: string, locationId: string): Promise<number> {
        // Query inventory
        // Calculate available = total - reserved - damaged
    }
    
    async reserveStock(
        itemId: string,
        locationId: string,
        quantity: number,
        orderId: string
    ): Promise<boolean> {
        // Check availability
        // Reserve stock
        // Create transaction record
    }
    
    async releaseReservation(orderId: string): Promise<void> {
        // Find reserved stock for order
        // Release reservations
        // Restore to available
    }
    
    async updateStock(itemId: string, location: string, quantity: number, type: string): Promise<void> {
        // Update stock based on type (IN, OUT, DAMAGE, TRANSFER)
        // Create transaction
        // Generate alerts if needed
    }
    
    async handleExpiry(): Promise<void> {
        // Query items near/past expiry
        // Remove from available stock
        // Generate report
    }
}
```

### 4.4 Notification Service

**Responsibilities:**
- Send emails
- Send SMS
- Send push notifications
- Notification preferences

**Key Methods:**

```typescript
class NotificationService {
    async sendEmail(
        to: string,
        templateId: string,
        variables: Record<string, any>
    ): Promise<boolean> {
        // Check user preference
        // Render template
        // Send via SendGrid
        // Log notification
    }
    
    async sendSMS(
        to: string,
        message: string,
        templateId?: string
    ): Promise<boolean> {
        // Check user preference
        // Format message
        // Send via Twilio
        // Log notification
    }
    
    async sendPushNotification(
        userId: string,
        title: string,
        body: string,
        data?: Record<string, any>
    ): Promise<boolean> {
        // Get device tokens
        // Send via Firebase
        // Log notification
    }
    
    async sendOrderNotification(orderId: string, event: string): Promise<void> {
        // Get order & customer details
        // Generate notification content
        // Send via applicable channels
    }
}
```

---

## 5. DATABASE TRANSACTIONS & CONSISTENCY

### 5.1 ACID Compliance

```typescript
// Order Creation Transaction
async function createOrderTransaction(customerId: string, cartData: Cart) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Create order
        const orderResult = await client.query(
            'INSERT INTO orders (...) VALUES (...) RETURNING id',
            [...]
        );
        const orderId = orderResult.rows[0].id;
        
        // 2. Create order items
        for (const item of cartData.items) {
            await client.query(
                'INSERT INTO order_items (...) VALUES (...)',
                [...]
            );
        }
        
        // 3. Reserve inventory (using SELECT FOR UPDATE for locking)
        for (const item of cartData.items) {
            await client.query(
                'UPDATE inventory SET quantity_reserved = quantity_reserved + $1 WHERE item_id = $2 FOR UPDATE',
                [item.quantity, item.itemId]
            );
        }
        
        // 4. Deduct wallet/loyalty points if applicable
        if (cartData.pointsUsed > 0) {
            await client.query(
                'UPDATE customers SET loyalty_points = loyalty_points - $1 WHERE id = $2',
                [cartData.pointsUsed, customerId]
            );
        }
        
        await client.query('COMMIT');
        return orderId;
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}
```

### 5.2 Optimistic Locking for Inventory

```typescript
// Prevent overselling using version numbers
async function reserveStockWithOptimisticLock(itemId: string, quantity: number) {
    let retries = 3;
    
    while (retries > 0) {
        try {
            const inventory = await db.query(
                'SELECT * FROM inventory WHERE item_id = $1 FOR UPDATE',
                [itemId]
            );
            
            if (inventory.rows[0].quantity_available >= quantity) {
                await db.query(
                    'UPDATE inventory SET quantity_reserved = quantity_reserved + $1, updated_at = NOW() WHERE item_id = $2',
                    [quantity, itemId]
                );
                return true;
            }
            return false;
            
        } catch (error) {
            retries--;
            if (retries === 0) throw error;
            await sleep(100 * (3 - retries));
        }
    }
}
```

---

## 6. ERROR HANDLING & VALIDATION

### 6.1 Input Validation

```typescript
const schemas = {
    createOrderSchema: Joi.object({
        delivery_address_id: Joi.string().uuid().required(),
        payment_method: Joi.string().valid('CARD', 'WALLET', 'COD').required(),
        delivery_date: Joi.date().min('now').required(),
        delivery_time_window: Joi.string().pattern(/^\d{2}:\d{2}-\d{2}:\d{2}$/).required(),
        notes: Joi.string().max(500).optional()
    }),
    
    createProductSchema: Joi.object({
        sku: Joi.string().alphanum().min(3).max(100).required(),
        name: Joi.string().min(5).max(255).required(),
        price: Joi.number().min(0).required(),
        category_id: Joi.string().uuid().required(),
        tax_rate: Joi.number().min(0).max(100).required()
    })
};

// Middleware for validation
const validateRequest = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details });
    }
    req.validated = value;
    next();
};
```

### 6.2 Error Handling

```typescript
// Custom Error Classes
class BusinessError extends Error {
    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.statusCode = statusCode;
    }
}

class InsufficientStockError extends BusinessError {
    constructor(itemId: string, requested: number, available: number) {
        super(
            `Insufficient stock for item ${itemId}. Requested: ${requested}, Available: ${available}`,
            409
        );
    }
}

class PaymentFailedError extends BusinessError {
    constructor(reason: string) {
        super(`Payment failed: ${reason}`, 402);
    }
}

// Global Error Handler
app.use((error, req, res, next) => {
    console.error('Error:', error);
    
    if (error instanceof BusinessError) {
        return res.status(error.statusCode).json({
            error: error.message,
            code: error.constructor.name
        });
    }
    
    // Log to monitoring service
    logError(error);
    
    res.status(500).json({
        error: 'Internal server error',
        request_id: req.id
    });
});
```

---

## 7. CACHING STRATEGY

### 7.1 Cache Layers

```typescript
// Multi-level Caching
class CacheService {
    // L1: In-memory cache (Node process)
    private memoryCache = new Map();
    
    // L2: Redis cache (distributed)
    private redisClient = redis.createClient();
    
    async get(key: string): Promise<any> {
        // Check memory cache first
        if (this.memoryCache.has(key)) {
            return this.memoryCache.get(key);
        }
        
        // Check Redis
        const cachedValue = await this.redisClient.get(key);
        if (cachedValue) {
            // Store in memory for future access
            this.memoryCache.set(key, JSON.parse(cachedValue));
            return JSON.parse(cachedValue);
        }
        
        return null;
    }
    
    async set(key: string, value: any, ttl: number = 3600): Promise<void> {
        // Store in both caches
        this.memoryCache.set(key, value);
        await this.redisClient.setex(key, ttl, JSON.stringify(value));
    }
    
    async invalidate(pattern: string): Promise<void> {
        // Clear Redis cache by pattern
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
            await this.redisClient.del(...keys);
        }
        
        // Clear memory cache
        for (const key of this.memoryCache.keys()) {
            if (key.includes(pattern)) {
                this.memoryCache.delete(key);
            }
        }
    }
}

// Cache Keys Strategy
const CacheKeys = {
    // Products
    PRODUCT: (id: string) => `product:${id}`,
    PRODUCT_LIST: (companyId: string, filters: string) => `products:${companyId}:${filters}`,
    CATEGORIES: (companyId: string) => `categories:${companyId}`,
    
    // Inventory
    INVENTORY: (itemId: string, locationId: string) => `inventory:${itemId}:${locationId}`,
    
    // Pricing
    PRICING: (itemId: string) => `pricing:${itemId}`,
    DISCOUNTS: (companyId: string) => `discounts:${companyId}`,
    
    // Customer
    CUSTOMER: (id: string) => `customer:${id}`,
    CUSTOMER_ADDRESSES: (id: string) => `addresses:${id}`
};

// Cache TTLs
const CacheTTL = {
    PRODUCT: 3600, // 1 hour
    PRODUCT_LIST: 600, // 10 minutes
    CATEGORIES: 86400, // 1 day
    INVENTORY: 300, // 5 minutes
    PRICING: 600, // 10 minutes
    CUSTOMER: 3600, // 1 hour
    SESSION: 86400 // 1 day
};
```

---

## 8. MONITORING & LOGGING

### 8.1 Structured Logging

```typescript
import winston from 'winston';

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'billing-service' },
    transports: [
        // File transport
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        
        // Console transport (development)
        ...(process.env.NODE_ENV !== 'production'
            ? [new winston.transports.Console({ format: winston.format.simple() })]
            : [])
    ]
});

// Usage
logger.info('Order created', {
    orderId: order.id,
    customerId: customer.id,
    amount: order.total,
    timestamp: new Date()
});

logger.error('Payment failed', {
    orderId: order.id,
    error: error.message,
    gateway: 'razorpay',
    timestamp: new Date()
});
```

### 8.2 Performance Monitoring

```typescript
import newrelic from 'newrelic';

// Monitor critical operations
newrelic.recordMetric('Custom/Order/Create', 1);
newrelic.recordMetric('Custom/Payment/Success', 1);

// Custom transactions
const transaction = newrelic.getTransaction();

app.post('/api/v1/orders', (req, res) => {
    transaction.startSegment('create-order', true, async () => {
        // Order creation logic
    });
});

// Database query monitoring
const queryStartTime = Date.now();
const result = await db.query('SELECT * FROM orders...');
const queryDuration = Date.now() - queryStartTime;

newrelic.recordMetric(`Database/Query/Duration`, queryDuration);
```

---

## 9. SECURITY IMPLEMENTATION

### 9.1 Password Security

```typescript
import bcrypt from 'bcrypt';

// Hash password during registration
async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12); // 12 rounds
    return bcrypt.hash(password, salt);
}

// Compare during login
async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Password policy enforcement
function validatePassword(password: string): {valid: boolean; errors: string[]} {
    const errors = [];
    
    if (password.length < 12) errors.push('Password must be at least 12 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must contain number');
    if (!/[!@#$%^&*]/.test(password)) errors.push('Must contain special character');
    
    return {
        valid: errors.length === 0,
        errors
    };
}
```

### 9.2 JWT Token Management

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateTokens(userId: string, role: string) {
    const accessToken = jwt.sign(
        { userId, role, type: 'access' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
        { userId, role, type: 'refresh' },
        JWT_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRY }
    );
    
    return { accessToken, refreshToken };
}

// Middleware to verify JWT
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
```

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Weeks 1-4)
- [ ] Database setup & migrations
- [ ] Authentication & authorization
- [ ] User registration & profile
- [ ] Basic CRUD for products & categories
- [ ] Inventory management
- [ ] Shopping cart functionality
- [ ] Order creation (without payment)

### Phase 2: Payment & Checkout (Weeks 5-8)
- [ ] Payment gateway integration (Razorpay)
- [ ] Payment verification & reconciliation
- [ ] Order confirmation workflow
- [ ] Email notifications
- [ ] Basic tax calculations
- [ ] Discounts & coupons

### Phase 3: Advanced Features (Weeks 9-12)
- [ ] Return & exchange management
- [ ] Loyalty program
- [ ] Service provider management
- [ ] Delivery tracking
- [ ] SMS notifications
- [ ] Push notifications
- [ ] Dashboards & reports

### Phase 4: Optimization & Launch (Weeks 13-16)
- [ ] Performance optimization
- [ ] Security audit & hardening
- [ ] Load testing & stress testing
- [ ] Documentation & training
- [ ] Production deployment
- [ ] Monitoring & alerting setup

---

**Document Version:** 1.0
**Last Updated:** 2026-03-30
**Next Review:** 2026-06-30

**Status:** APPROVED FOR DEVELOPMENT
```
