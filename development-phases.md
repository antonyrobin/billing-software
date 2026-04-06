# 🗺️ Development Phases — Billing Software

> **Document Version:** 1.0  
> **Date:** 2026-04-05  
> **Based On:** ReadMe.md (PRD v1.0), HLD.md, LLD.md, architecture.md  
> **Principle:** Each phase delivers a deployable, production-ready increment. Every subsequent phase extends the previous one without breaking it.

---

## Overview

The development is split into **7 phases**. Each phase ends with a fully functional production deployment that can be independently used by at least one real business type. Later phases layer additional capabilities on top of the stable foundation.

| Phase | Name | Primary Focus | Duration | Go-Live Target |
|---|---|---|---|---|
| **1** | Foundation & MVP | Company setup, Product Master, POS Billing, GST Invoice, Import/Export (Masters) | 8–10 weeks | Week 10 |
| **2** | Core Commerce | Inventory, Barcode/QR, Search, Cart, Discounts, Customer Auth, Procurement & Suppliers | 8–10 weeks | Week 20 |
| **3** | Payments & Accounts | Payment Gateway, Saved Cards, Returns & Exchange, Accounts & Ledger, Party Settlement | 6–8 weeks | Week 28 |
| **4** | Engagement | Offers/Promotions, Reviews, Email/SMS/Push Notifications, WhatsApp Bill Sharing, Order Import/Export | 6–8 weeks | Week 36 |
| **5** | Operations | Service Provider Portal, Delivery, Charges, Block/Service Control | 6–8 weeks | Week 44 |
| **6** | Intelligence & AI | Dashboards, Reports, AI Suite (RAG, OCR Import, Predictions, Recommendations), Customer Support | 8–10 weeks | Week 54 |
| **7** | Growth & Expansion | Welcome Offers, Referrals, Reorder, Restaurant Module, Marketplace, Advanced AI | 6–8 weeks | Week 62 |

---

## Phase 1 — Foundation & MVP

> **Goal:** A working POS billing system that a small shop owner can use on day one. Covers company registration, product catalog, master data, basic billing, and GST-compliant invoicing.

### 1.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-001 | Company / Shop Details Management | High |
| FR-003 | Item / Product Master | High |
| FR-004 | Master Data Management (CRUD) | High |
| FR-018 | Bill Receipt & Invoice Generation (basic) | High |
| FR-021 | GST / VAT Calculation (core engine) | High |
| FR-011 | Passwordless Sign-Up & Login (admin/owner only) | High |
| FR-036 | Data Import/Export (masters only) | High |

### 1.2 Detailed Features

#### Company / Shop Setup (FR-001)
- Company name, legal name, trade name
- Business type & industry selector
- GSTIN validation (15-digit alphanumeric), PAN, TAN
- State code auto-detection from GSTIN
- Primary billing address with PIN code lookup
- Logo upload (PNG/JPG, max 2 MB) with invoice placement
- Digital stamp and signature upload
- Brand color configuration (primary, secondary)
- Custom invoice header/footer text

#### Item / Product Master (FR-003)
- Item code (auto-generated), name, description, SKU
- HSN/SAC code entry
- Classification hierarchy: Department → Category → Sub-Category → Type → Brand → Packing Size
- MRP, Selling Price, Purchase Price
- GST rate assignment (0%, 5%, 12%, 18%, 28%) — inclusive/exclusive toggle
- Primary Unit of Measurement (UOM)
- Active/Inactive toggle with soft delete
- Single item image upload

#### Master Data CRUD (FR-004)
- Category, Sub-Category, Type masters
- Brand master (with logo)
- Packing Size master
- UOM master with conversion factors
- Tax master (tax types and rates)
- Payment Mode master (Cash, Card, UPI, Net Banking)
- Common features: pagination, sorting, search, audit trail (created/modified by + timestamps), bulk activate/deactivate/delete, import/export (CSV)

#### Master Data Import/Export (FR-036 — basic)
- CSV and Excel (.xlsx) import/export for all masters
- Template download for each entity (pre-formatted with required columns and sample data)
- Column mapping wizard for imports
- Validation and row-level error reporting
- Preview before import (first 10 rows)
- Duplicate detection (skip / overwrite options)
- Import history log

#### Authentication — Admin & Owner (FR-011)
- Mobile OTP login (SMS)
- Email Magic Link login
- Short-lived JWT access token (in-memory)
- Long-lived rotation-enforced refresh token (secure cookie)
- Account lockout after failed OTP attempts
- CAPTCHA on login form

#### Basic POS Billing
- Quick-billing screen: search or scan product → add to bill
- Inline quantity adjustment (+/−)
- Real-time running total
- Cash / UPI payment mode selection
- Mark order as Paid
- Thermal receipt print trigger (80 mm)

#### Invoice Generation (FR-018 — basic)
- Auto-sequential invoice number with financial year reset
- Tax invoice (GST compliant): CGST + SGST (intra-state), IGST (inter-state)
- Itemized list with HSN/SAC, quantity, rate, GST breakdown
- Company logo, stamp, and signature placement
- Total in words
- PDF download
- A4 print layout (classic template)

#### GST Engine (FR-021 — core)
- CGST + SGST for intra-state transactions
- IGST for inter-state transactions
- UTGST for Union Territory transactions
- Auto-determination of transaction type from buyer/seller state
- HSN/SAC-based rate mapping
- Tax-inclusive and tax-exclusive pricing modes
- Cess calculation support

### 1.3 Technical Tasks

| Area | Task |
|---|---|
| **Infrastructure** | Set up monorepo (apps/, services/, libs/, databases/) |
| **Infrastructure** | Docker Compose for local dev (PostgreSQL, Redis, Nginx) |
| **Infrastructure** | CI/CD pipeline (GitHub Actions → staging → production) |
| **Infrastructure** | Environment configuration management (.env + secrets vault) |
| **Backend** | Auth Service: OTP generation, JWT issuing, refresh token rotation |
| **Backend** | Company Service: CRUD for company profile, branch, GSTIN validation |
| **Backend** | Product Service: CRUD for items, categories, UOM, HSN code lookup |
| **Backend** | Tax Engine Service: GST rate resolution, CGST/SGST/IGST calculation |
| **Backend** | Invoice Service: invoice number generation, PDF rendering |
| **Backend** | Order Service (POS): create/complete a quick-bill order |
| **Backend** | Import/Export Service: CSV/Excel parser, template generation, validation engine |
| **Frontend (Web)** | Next.js admin web app: company setup wizard |
| **Frontend (Web)** | Product Master CRUD screens |
| **Frontend (Web)** | Master data management screens (categories, brands, UOM, taxes) |
| **Frontend (Web)** | POS billing screen (quick-bill interface) |
| **Frontend (Web)** | Invoice preview and PDF download |
| **Frontend (Web)** | Import/Export wizard screens (upload, column mapping, preview, execution) |
| **Frontend (Mobile)** | Flutter shell app: auth flow, basic navigation |
| **Database** | Schema: companies, branches, products, categories, taxes, orders, order_items, invoices |
| **Database** | Indexes on frequently queried columns (product.sku, product.hsn_code) |
| **Security** | OWASP headers (Next.js security headers / .NET middleware) |
| **Security** | Input validation and SQL-injection prevention |
| **Security** | Rate limiting on OTP endpoints |

### 1.4 API Endpoints (Key)

```
POST   /auth/otp/request
POST   /auth/otp/verify
POST   /auth/refresh
DELETE /auth/logout

POST   /companies
GET    /companies/:id
PUT    /companies/:id

POST   /products
GET    /products
GET    /products/:id
PUT    /products/:id
DELETE /products/:id

GET    /categories (+ sub-routes for sub-categories, types, brands, uom, taxes)
POST   /categories
...

POST   /orders/pos
PUT    /orders/:id/complete
GET    /orders/:id/invoice
GET    /orders/:id/invoice/pdf
```

### 1.5 Testing Requirements

- Unit tests: GST calculation logic (all rate combinations, intra/inter state)
- Unit tests: Invoice number sequential generation and financial year rollover
- Unit tests: GSTIN format validation
- Integration tests: Full POS order → invoice generation flow
- Integration tests: Auth flow (OTP request → verify → JWT → refresh → logout)
- E2E test: Cashier creates order, marks paid, downloads PDF invoice
- E2E test: Admin imports products via CSV, verifies in product list

### 1.6 Deployment Checklist

- [ ] PostgreSQL database provisioned with automated daily backup
- [ ] Redis provisioned for session/token store
- [ ] HTTPS enforced (TLS 1.3 certificate)
- [ ] Environment variables configured (no secrets in code)
- [ ] Health check endpoint `/health` available on all services
- [ ] Smoke test: create company → add product → create POS order → generate invoice
- [ ] Rollback procedure documented

### 1.7 Who Can Use This Phase

| Business Type | Usable? | Notes |
|---|---|---|
| Small retail shop | ✅ Yes | Core use case — POS billing with GST invoices |
| Medical/pharmacy (owner side) | ✅ Yes | Basic invoicing, limited without batch/expiry (Phase 2) |
| Any shop needing GST invoices | ✅ Yes | PDF invoice generation ready |

---

## Phase 2 — Core Commerce

> **Goal:** Extend Phase 1 with real inventory tracking, barcode/QR, advanced product search, a full cart experience, customer accounts, and a basic discount engine. A mid-size retail shop can now operate end-to-end.

### 2.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-002 | Client / Customer Details Management | High |
| FR-005 | Inventory & Stock Management | High |
| FR-006 | Barcode & QR Code Management | High |
| FR-007 | Item Search & Discovery | High |
| FR-008 | Cart & Wishlist Management | High |
| FR-009 | Discount Management | High |
| FR-011 | Customer Passwordless Login (extends Phase 1 auth) | High |
| FR-017 | Order Management (online flow) | High |
| FR-019 | Delivery Address Management | High |
| FR-033 | Procurement & Supplier Management | High |

### 2.2 Detailed Features

#### Customer Management (FR-002)
- Customer profile: name, type (B2B/B2C/Walk-in), contact, GSTIN (B2B), PAN
- Multiple billing and shipping addresses per customer
- Credit limit and payment terms
- Purchase history with filters
- Outstanding balance and payment history
- Bulk import via CSV

#### Inventory Management (FR-005)
- Location hierarchy: Warehouse → Zone → Aisle → Shelf → Rack → Bin
- Stock In / Out / Transfer / Adjustment workflows
- Batch-wise and serial-number tracking
- Expiry date tracking with FIFO/FEFO enforcement
- Real-time stock quantity per location
- Stock valuation methods: FIFO, LIFO, Weighted Average
- Strict vs. Bypass inventory enforcement (configurable per shop)
- Physical stock count (stock take) module

#### Barcode & QR Code (FR-006)
- Barcode generation: Code 128, EAN-13, EAN-8, UPC-A
- QR code generation per product (item details, price, batch, expiry, URL)
- Barcode label designer: multiple sizes (1×1, 2×1, A4 sheet)
- Thermal printer integration (Zebra/TSC/Brother via ZPL/TSPL)
- **Mobile App (Flutter):** Native camera-based barcode/QR scanning to add items to cart (using mobile_scanner / google_mlkit_barcode_scanning)
- **Web App (Next.js):** External USB/Bluetooth barcode scanner support via keyboard wedge mode (scanner types characters into focused input field)
- Web fallback: BarcodeDetector API for browsers that support it

#### Item Search & Discovery (FR-007)
- Barcode/QR scan: hardware scanner + mobile camera
- Quick text search: item name, code, SKU with auto-suggest (debounce 300 ms)
- Fuzzy search for typo tolerance (ElasticSearch / Meilisearch)
- Browse by Category → Sub-Category → Type
- Filters: brand, packing size, price range, stock availability, location
- Advanced search: HSN/SAC code, batch number, expiry date range, supplier

#### Cart & Wishlist (FR-008)
- Add to cart via search, scan, or voice (Web Speech API)
- Increase/decrease quantity, manual input, unit toggle
- Remove item, clear cart, save as draft
- Cart auto-save (localStorage + backend sync)
- Itemized cart summary with tax breakdown and running total
- Wishlist with multiple named lists, move to cart, share

#### Discount Management (FR-009)
- Item-level: flat amount, percentage, special price override
- Order-level: flat, percentage, tiered (spend more → save more)
- Discount validity dates, customer group applicability, max cap, min qty
- Approval workflow for discounts above a configurable threshold
- Discount audit trail
- Strict pricing (no cashier overrides) vs. Flexible pricing (cashier ad-hoc) modes

#### Order Management — Online Flow (FR-017)
- Full order lifecycle: Placed → Confirmed → Processing → Packed → Shipped → Delivered
- Cancel and modify before processing
- Download invoice per order
- One-click reorder

#### Delivery Address Management (FR-019)
- Add/Update/Delete addresses with label (Home, Office, Other)
- Set default address
- PIN code auto-lookup (city and state)
- Google Maps / Mapbox pin drop for geo-coordinates
- Max addresses per customer (configurable, default 10)

#### Procurement & Supplier Management (FR-033)
- Supplier/Manufacturer master: name, type (Supplier/Manufacturer/Both), contact, GSTIN, PAN, bank details
- Dual-role flag: link supplier to existing customer record (same party buys and sells)
- Category/product line tagging per supplier, lead time, payment terms
- Purchase Order (PO): create from ROL auto-trigger or manual, sequential PO number
- PO items with quantity, rate, discount, GST; PO total with tax breakdown
- PO approval workflow (auto-approve below configurable threshold)
- PO status lifecycle: Draft → Sent → Acknowledged → Partially Received → Fully Received → Closed
- PO PDF generation and send to supplier (email)
- Goods Received Note (GRN): receive against PO (partial/full), quality check, batch/expiry capture
- Auto-update inventory on GRN approval
- Supplier invoice recording against GRN
- 3-way matching: PO → GRN → Supplier Invoice

### 2.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Customer Service: CRUD for customer profiles and addresses |
| **Backend** | Inventory Service: stock transactions, location management, FIFO/FEFO engine |
| **Backend** | Barcode Service: barcode/QR generation (bwip-js / ZXing), label PDF export |
| **Backend** | Search Service: ElasticSearch/Meilisearch integration, product indexing pipeline |
| **Backend** | Cart Service: persistent cart with Redis (session) + PostgreSQL (draft) |
| **Backend** | Discount Service: rule engine, priority/precedence logic |
| **Backend** | Order Service: extend POS order with full online order workflow |
| **Backend** | Procurement Service: supplier master CRUD, PO CRUD, GRN workflow, 3-way matching |
| **Frontend (Web)** | Customer registration and profile pages |
| **Frontend (Web)** | Inventory management screens (stock-in, stock-out, transfer, count) |
| **Frontend (Web)** | Barcode/QR label designer and print preview |
| **Frontend (Web)** | Search results page with filters and facets |
| **Frontend (Web)** | Cart page with discount application |
| **Frontend (Web)** | Order history with tracking timeline |
| **Frontend (Web)** | Address book management screens |
| **Frontend (Web)** | Procurement screens: Supplier master, PO creation, GRN entry, PO tracking |
| **Frontend (Mobile)** | Flutter: barcode/QR scanner with native camera (scan to add to cart) |
| **Frontend (Mobile)** | Flutter: customer-facing cart, order history, product browse |
| **Frontend (Mobile)** | Flutter: inventory stock-take with barcode scanner |
| **Database** | Schema additions: customers, addresses, stock_locations, stock_movements, batches, serials, carts, wishlists, discounts, suppliers, purchase_orders, purchase_order_items, goods_received_notes |
| **Infrastructure** | ElasticSearch/Meilisearch instance provisioned |
| **Infrastructure** | WebSocket server for real-time stock updates on POS screen |

### 2.4 Testing Requirements

- Unit tests: FIFO/FEFO stock deduction logic
- Unit tests: Discount rule precedence and stacking
- Unit tests: Barcode uniqueness validation
- Integration tests: Stock transaction (in → out → balance reconciliation)
- Integration tests: Cart add → apply discount → checkout
- E2E test: Scan barcode → add to cart → apply discount → complete order → stock decremented
- E2E test (Mobile): Open Flutter app → scan barcode via camera → item added to cart → checkout
- E2E test: Create PO → send to supplier → receive GRN (partial) → stock updated → supplier invoice matched
- Performance test: Search API < 500 ms under 500 concurrent queries

### 2.5 Deployment Checklist

- [ ] ElasticSearch/Meilisearch provisioned and product index seeded
- [ ] Barcode thermal printer driver integration tested
- [ ] Stock enforcement mode (strict/bypass) configured per shop
- [ ] Discount approval workflow email notifications configured
- [ ] Regression test: all Phase 1 POS flows still working

---

## Phase 3 — Payments & Accounts

> **Goal:** Integrate real payment gateways, enable saved payment methods, build a robust returns and exchange workflow, and introduce the accounts & ledger module for advance/pending payments and party settlement. Shops can now accept digital payments, handle post-sale operations, and track financial positions with suppliers and customers.

### 3.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-014 | Payment Gateway Integration | High |
| FR-015 | Item Exchange & Returns | High |
| FR-020 | Payment Options & Card Management | High |
| FR-034 | Accounts & Ledger — Party Settlement | High |

### 3.2 Detailed Features

#### Payment Gateway Integration (FR-014)
- Supported gateways: Razorpay, Stripe, PayU (configurable per shop)
- UPI: Google Pay, PhonePe, Paytm, BHIM
- Credit/Debit Card: Visa, MasterCard, Amex, RuPay
- Net Banking, Digital Wallets (Paytm, Amazon Pay, PhonePe)
- Cash on Delivery (manual logging)
- EMI options (No-cost, Low-cost) via gateway
- Real-time payment status polling + webhook
- Auto-retry on failure (up to 3 attempts)
- Partial payment and split payment (multiple methods per order)
- Payment timeout handling (15-minute window)
- Duplicate payment detection via idempotency keys
- Payment reconciliation report
- Full and partial refund to original method
- Refund to wallet/store credit
- Automated refund on system-initiated cancellation
- Manual refund approval workflow for amounts above threshold
- Strict Gateway Mode vs. Hybrid/Manual Mode (configurable per shop)

#### Payment Options & Card Management (FR-020)
- Save card for future use (PCI DSS tokenization via gateway)
- Display saved cards by type (Visa/MC/Amex/RuPay auto-detected)
- Set default card, delete saved card
- Card expiry alerts
- 3D Secure authentication flow
- CVV not stored (per PCI DSS — gateway tokenization only)
- TLS 1.3 for all payment data in transit
- Store Credit / Wallet balance management
- Gift Card and Voucher redemption
- Loyalty Points redemption as payment method

#### Returns & Exchange (FR-015)
- Return window configuration per category and per item
- Non-returnable item marking
- Return reasons (mandatory selection with free text)
- Photo/video evidence upload for damaged items
- Return approval workflow (auto-approval for low-value, manual above threshold)
- Pickup scheduling vs. drop-off at store
- Return quality check workflow
- Refund or store credit choice for approved returns
- Exchange for same item (different variant) or different item with price adjustment
- Restocking fee configuration
- Returned items auto-restock to inventory after quality check

#### Accounts & Ledger — Party Settlement (FR-034)
- Party ledger: unified per-party transaction log (all purchases and sales)
- Advance payments: record advance given to suppliers and received from customers
- Advance adjustment against future invoices
- Pending payments: payable (we owe suppliers) and receivable (customers owe us)
- Aging analysis: 0–30, 31–60, 61–90, 90+ days buckets
- Due date alerts via email/SMS/push
- Payment reminder automation (configurable intervals)
- Net settlement for dual-role parties: compare total purchased vs. total sold, show net balance
- Settlement statement PDF generation
- Reports: "Who Owes Us" list, "Whom We Owe" list, cash flow summary
- Dashboard charts: top receivables, top payables, aging pie chart

### 3.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Payment Service: gateway adapters (Razorpay, Stripe, PayU), webhook handlers |
| **Backend** | Payment Service: idempotency key management, retry logic, reconciliation job |
| **Backend** | Wallet Service: store credit/wallet balance CRUD, transaction history |
| **Backend** | Card Token Service: tokenization request/response handling with gateway |
| **Backend** | Returns Service: return/exchange request workflow, refund trigger |
| **Backend** | Refund Service: refund to payment method, to wallet, manual approval queue |
| **Backend** | Accounts Service: party ledger CRUD, advance tracking, pending payment aging, net settlement calculator |
| **Frontend (Web)** | Checkout payment screen (gateway SDK integration) |
| **Frontend (Web)** | Saved cards management UI |
| **Frontend (Web)** | Store credit/wallet UI |
| **Frontend (Web)** | Return initiation from order history |
| **Frontend (Web)** | Return tracking status UI |
| **Frontend (Web)** | Exchange flow with price difference handling |
| **Frontend (Web)** | Party ledger screen with filters and transaction log |
| **Frontend (Web)** | Receivables & Payables dashboard with aging charts |
| **Frontend (Web)** | Net settlement screen for dual-role parties |
| **Frontend (Mobile)** | Flutter: payment flow, UPI/wallet integration |
| **Frontend (Mobile)** | Flutter: return initiation, tracking |
| **Database** | Schema additions: payments, refunds, returns, exchanges, wallet_transactions, saved_cards (token only), party_ledger, advance_payments, pending_payments |
| **Security** | PCI DSS scope reduction audit — confirm no raw card data in application layer |
| **Security** | Webhook signature verification for all payment gateways |
| **Infrastructure** | Razorpay / Stripe test sandbox environment configured |

### 3.4 Testing Requirements

- Unit tests: Payment status state machine transitions
- Unit tests: Refund eligibility rules (return window, non-returnable flag)
- Integration tests: Razorpay webhook → order status update → refund initiation
- Integration tests: Card tokenization save → use on checkout
- E2E test: Complete purchase with UPI → initiate return → receive refund to wallet
- E2E test: Dual-role party (supplier + customer) → purchase from them + sell to them → net settlement calculates correctly
- Security test: Confirm no PAN/CVV data in database or logs
- Load test: 100 concurrent payment initiations with no duplicate charges

### 3.5 Deployment Checklist

- [ ] Payment gateway API keys configured in secrets vault (not in code)
- [ ] PCI DSS scope documented and reviewed
- [ ] Webhook endpoints HTTPS only with signature verification
- [ ] Refund approval workflow email notifications working
- [ ] Regression tests for Phase 1 and Phase 2 pass

---

## Phase 4 — Engagement

> **Goal:** Drive repeat purchases and customer loyalty through a full promotions engine, a review/rating system, and multi-channel notifications (Email, SMS, Push).

### 4.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-010 | Offers & Promotions | High |
| FR-016 | Reviews & Ratings | Medium |
| FR-025 | Email & SMS Notifications | High |
| FR-026 | Push Notifications | High |
| FR-035 | Bill Sharing (WhatsApp, Email & SMS) | High |
| FR-036 | Data Import/Export (orders & transactional) | High |

### 4.2 Detailed Features

#### Offers & Promotions (FR-010)
- **Coupon Codes:** Single-use / multi-use, auto-generated or custom, validity period, usage limit (per user + total), minimum order value, first-time user coupons, referral coupons
- **Festival / Seasonal Offers:** Pre-configured calendar (Diwali, Christmas, Eid, New Year, etc.), custom events, auto start/end via schedule, banner/creative management
- **Buy X Get Y:** BOGO, Buy 2 Get 1, cross-category promotions, minimum trigger quantity
- **Cashback:** Flat or percentage (with cap), cashback to wallet, validity period, payment-method-specific cashback
- **Loyalty Points:** Points per purchase (configurable ratio), tier-based multipliers, points redemption, points expiry, points statement
- **Other:** Combo/bundle pricing, gift with purchase, clearance offers
- Priority/precedence rules, stackable vs. non-stackable, max discount per order cap, discount audit trail

#### Reviews & Ratings (FR-016)
- 1–5 star rating with multi-dimension breakdown (Quality, Value, Delivery, Packaging)
- Text review with title, pros/cons fields, recommend flag
- Photo/video review upload
- Verified purchase badge
- Auto-moderation: profanity filter, spam detection
- Optional manual approval workflow
- Seller/company response to reviews
- Report abuse, edit/delete own review

#### Email & SMS Notifications (FR-025)
- **Email events:** Welcome, order confirmation, status updates, invoice, payment confirmation/failure, promotional, abandoned cart, review request, security alert
- **SMS events:** OTP, order confirmation, delivery updates, payment alerts, critical alerts
- Template engine with dynamic placeholders and multi-language support
- DND hours compliance (no SMS between 9 PM–9 AM)
- Opt-in/Opt-out management
- Delivery tracking: open rate, click rate, bounce handling
- Provider configuration: SendGrid/AWS SES (email), MSG91/Twilio (SMS)

#### Push Notifications (FR-026)
- Channels: iOS APNs, Android FCM, Web Push (Service Workers), in-app notification center
- Notification types: transactional, promotional, personalized, location-based
- Rich notifications (images, action buttons)
- Deep linking to specific screens
- Read/Unread tracking
- Notification preferences per category (granular user controls)
- Broadcast vs. segmented vs. individual targeting
- Scheduled notifications

#### Bill Sharing — WhatsApp, Email & SMS (FR-035)
- Auto-share invoice on bill generation to buyer, company owner, and branch manager (configurable per bill type)
- WhatsApp Business API integration: template messages with PDF attachment, interactive buttons ("View Invoice", "Pay Now")
- Email sharing with PDF invoice attachment
- SMS with short link to view/download invoice
- Per-company toggle: enable/disable per channel (WhatsApp, Email, SMS)
- Per-recipient toggle: which stakeholder gets which channel
- Per-bill-type toggle: sales invoice, purchase order, credit note, delivery challan
- Template customization per channel
- Delivery status tracking (sent, delivered, read for WhatsApp)
- Manual re-share from order/invoice screen
- Bulk share for pending/past invoices

#### Order & Transaction Data Import/Export (FR-036 — extended)
- Order import: CSV/Excel with validation, column mapping, preview
- Order export: filtered by date range, status, customer, payment method
- Invoice export: PDF batch export, Excel summary
- Payment data export for reconciliation
- Stock movement import/export
- Scheduled export: daily/weekly to email or cloud storage
- API-based export for third-party integrations

### 4.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Promotions Service: coupon engine, offer rules, points ledger |
| **Backend** | Promotions Service: offer scheduler (cron jobs for auto start/end) |
| **Backend** | Loyalty Service: points earn/redeem, tier management, expiry cron job |
| **Backend** | Review Service: CRUD, moderation queue, rating aggregation |
| **Backend** | Notification Service: event-driven dispatcher (RabbitMQ/SQS consumers) |
| **Backend** | Email Provider Adapter: SendGrid / AWS SES integration |
| **Backend** | SMS Provider Adapter: MSG91 / Twilio integration |
| **Backend** | Push Provider Adapter: FCM / APNs via Firebase Admin SDK |
| **Backend** | WhatsApp Service: Business API integration, template management, delivery tracking |
| **Backend** | Bill Sharing Service: auto-dispatch on invoice events, recipient resolution, channel routing |
| **Backend** | Import/Export Service (extended): order/transaction import-export, scheduled export jobs |
| **Frontend (Web)** | Coupon/offer management screens (admin) |
| **Frontend (Web)** | Loyalty points dashboard (customer) |
| **Frontend (Web)** | Review submission form and listing on product page |
| **Frontend (Web)** | Review moderation screen (admin) |
| **Frontend (Web)** | Notification preferences page (customer) |
| **Frontend (Web)** | In-app notification center (bell icon, unread badge) |
| **Frontend (Web)** | Bill sharing configuration screen (per company/bill-type/recipient) |
| **Frontend (Web)** | Order import wizard with column mapping |
| **Frontend (Web)** | Order/Invoice export with filters |
| **Frontend (Mobile)** | Flutter: push notification integration (FCM + APNs) |
| **Frontend (Mobile)** | Flutter: in-app notification center |
| **Frontend (Mobile)** | Flutter: share invoice via WhatsApp from order screen |
| **Database** | Schema additions: coupons, offers, loyalty_points, reviews, ratings, notification_templates, notification_log, push_subscriptions, bill_share_log |
| **Infrastructure** | Message queue (RabbitMQ / AWS SQS) provisioned for async notification dispatch |
| **Infrastructure** | Firebase project configured for FCM; APNs certificate uploaded |

### 4.4 Testing Requirements

- Unit tests: Coupon validation (expired, usage limit exceeded, min order not met)
- Unit tests: Points earn/redeem calculation with tier multipliers
- Unit tests: Offer priority/precedence resolution
- Integration tests: Place order → points credited → coupon validated
- Integration tests: Review submitted → moderation queue → published
- Integration tests: Order placed → notification dispatched → delivery confirmed
- E2E test: Apply coupon at checkout → cashback to wallet → push notification received
- E2E test: Generate invoice → auto-shared to buyer via WhatsApp + email with PDF
- E2E test: Import orders from CSV → validate → orders created with correct totals

### 4.5 Deployment Checklist

- [ ] Email provider API keys in secrets vault
- [ ] SMS provider sender ID registered and DLT-compliant (India)
- [ ] FCM server key and APNs certificate configured
- [ ] WhatsApp Business API approved and template messages verified
- [ ] Message queue provisioned with dead-letter queue for failed notifications
- [ ] Opt-out list seeded from any previous campaigns
- [ ] Regression tests for Phases 1–3 pass

---

## Phase 5 — Operations

> **Goal:** Enable third-party service providers (delivery partners, vendors), configure delivery zones, charges, and add administrative controls for blocking users/providers and toggling service availability.

### 5.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-012 | Service Provider Account Management | High |
| FR-013 | Expiry, ROL & Delivery Restrictions | High |
| FR-022 | Charges Management | High |
| FR-023 | User & Service Provider Block Management | Medium |
| FR-024 | Service ON / OFF / Pause / Resume | Medium |
| FR-032 | Multi-Tenant Marketplace & Logistics (foundation) | High |

### 5.2 Detailed Features

#### Service Provider Management (FR-012)
- Provider registration: business name, documents upload, GSTIN, PAN, bank account, coverage area, service categories
- Multi-step approval workflow: document verification, background check, approval/rejection with reason, conditional approval (probation)
- Role-based access (Delivery Head, Delivery Driver — from NFR-3.1)
- Service Provider Dashboard: order management, earnings/settlements, performance metrics, customer ratings
- API key management for third-party integrations
- Commission structure configuration (percentage or flat per order)
- Automated payout scheduling

#### Expiry, ROL & Delivery Restrictions (FR-013)
- Near-expiry alerts (configurable: 30/60/90 days) via email/push
- Auto-removal from sale when expired
- FEFO enforcement in inventory deduction
- Expiry-based discount automation (e.g., 50% off in last 30 days)
- Expired stock write-off workflow
- Reorder Level (ROL): min/max stock level per item per location, auto-generate PO on breach
- Lead time configuration per supplier
- Economic Order Quantity (EOQ) suggestion
- Delivery slot management: time windows, cut-off times, blackout dates
- Location-based delivery time estimation
- Maximum delivery radius configuration
- Express delivery with surcharge

#### Charges Management (FR-022)
- Delivery charges: distance-based, weight-based, order value-based (free delivery threshold), zone-based, express surcharge
- Packing charges: flat per order, per-item, premium packaging, gift wrapping
- Platform charges: service provider commission, platform fee, listing fee, payment gateway pass-through
- Override hierarchy: Item level > Company level > Service Provider level
- Time-based charges (peak hours surcharge)
- Promotional charge waivers

#### Block Management (FR-023)
- Block/Unblock customers: reason (mandatory), duration (temporary/permanent), appeal workflow
- Block/Suspend service providers: freeze payouts, document reason, pending orders handled, reinstatement conditions
- Auto-block triggers: configurable fraud rules, excessive returns/chargebacks, rating below threshold
- Block history and audit trail

#### Service ON / OFF / Pause / Resume (FR-024)
- Control levels: Store, Category, Item, Service Provider, Time-Based (operating hours)
- Scheduled maintenance windows with auto-resume
- Holiday closure scheduling, recurring (weekly/daily)
- Customer-facing "Currently Unavailable" message with expected resume time
- Emergency shutdown button (admin)

#### Marketplace Foundation (FR-032)
- Store discovery: single-shop, affiliate-group, or platform-wide product search (toggle)
- Split cart: items from different shops generate separate child-orders per provider
- Delivery Company and Delivery Person master setup
- Customer data masking: phone numbers and addresses masked from delivery drivers (proxy call via Delivery App)

### 5.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Service Provider Service: registration, KYC workflow, approval state machine |
| **Backend** | Delivery Service: slot management, zone configuration, radius calculation (Haversine formula) |
| **Backend** | Charges Service: charge rule engine, override hierarchy resolution |
| **Backend** | Block Service: block/unblock operations, auto-block rule evaluation cron |
| **Backend** | Service Control Service: ON/OFF/PAUSE/RESUME state machine, scheduler |
| **Backend** | Marketplace Service: multi-shop search, split-cart order generation, proxy communication |
| **Backend** | EOQ / ROL Service: auto-generate purchase orders, alert dispatch |
| **Frontend (Web)** | Service Provider registration and approval screens (admin) |
| **Frontend (Web)** | Service Provider dashboard (provider-facing) |
| **Frontend (Web)** | Delivery zone and slot configuration UI |
| **Frontend (Web)** | Charges management UI |
| **Frontend (Web)** | Block/Unblock management UI (admin) |
| **Frontend (Web)** | Service toggle controls with scheduling UI |
| **Frontend (Web)** | Delivery tracking map (customer-facing, provider location masking) |
| **Frontend (Mobile)** | Flutter: delivery driver app (order pickup, navigation, proof of delivery) |
| **Frontend (Mobile)** | Flutter: customer delivery tracking with map |
| **Database** | Schema additions: service_providers, delivery_zones, delivery_slots, charges_rules, blocks, service_states, payout_schedules |
| **Infrastructure** | Maps API integration (Google Maps / Mapbox) for distance calculation and delivery estimation |
| **Infrastructure** | Proxy communication channel for delivery driver ↔ customer calls |

### 5.4 Testing Requirements

- Unit tests: Charge calculation (distance + weight + zone combinations)
- Unit tests: Service state machine transitions (ON → PAUSE → RESUME → OFF)
- Unit tests: Override hierarchy (item charge overrides company charge)
- Integration tests: Provider registration → document upload → approval → first delivery
- Integration tests: Order placed → delivery slot assigned → driver dispatched → delivered
- E2E test: Multi-shop cart → split checkout → two separate delivery orders → both fulfilled
- Security test: Confirm customer address is masked in delivery driver API responses

### 5.5 Deployment Checklist

- [ ] Maps API key in secrets vault, usage billing cap set
- [ ] Proxy communication provider configured (Twilio Proxy or equivalent)
- [ ] Payout schedule configured (weekly bank transfers)
- [ ] Block auto-trigger rules reviewed and approved by product owner
- [ ] Regression tests for Phases 1–4 pass

---

## Phase 6 — Intelligence & AI

> **Goal:** Provide role-specific dashboards, detailed business reports, AI-powered customer support, the complete AI suite (RAG, OCR import, predictions, recommendations), and a ticketing system. Every role from cashier to CEO can see their KPIs clearly.

### 6.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-027 | Dashboards & Reports | High |
| FR-028 | Customer Support & AI Assistance | High |
| FR-037 | AI & Intelligence Suite | High |

### 6.2 Detailed Features

#### Dashboards & Reports (FR-027)

**Customer Dashboard**
- Order summary (total orders, total spent)
- Active orders tracker with status
- Loyalty points balance
- Saved items and wishlists
- Recent activity
- Personalized product recommendations

**Admin / Company Dashboard**
- Real-time sales dashboard (today, this week, this month)
- Revenue analytics with trend charts
- Top-selling products (by revenue, by volume)
- Inventory status overview (low stock, out of stock, near-expiry counts)
- Customer acquisition and retention metrics
- Order funnel analysis (placed → confirmed → delivered → returned)
- Payment collection summary (by method, outstanding)
- Tax liability summary (CGST, SGST, IGST due)
- Employee performance metrics

**Service Provider Dashboard**
- Earnings overview with trend
- Order statistics (completed, pending, cancelled)
- Performance score and rating
- Payout history
- Pending deliveries map view

**Reports (all with date range, branch, category, customer, payment method, status filters)**
- Sales Report (daily/weekly/monthly/yearly/custom range)
- Purchase Report
- Inventory Report (stock status, movement, aging)
- Tax Report (GSTR-1, GSTR-3B summary, HSN summary, TDS/TCS)
- Profit & Loss Report
- Customer Report (new, returning, churn rate)
- Payment Report (collections, outstanding, refunds)
- Product Performance Report
- Delivery Performance Report
- Returns & Exchange Report
- Discount & Offer Performance Report
- User Activity Report

**Export Options:** PDF, Excel, CSV  
**Scheduled reports:** Email delivery on configurable schedule

#### Customer Support & AI Assistance (FR-028)
- **Ticketing System:** Create/track/resolve tickets, categories, priority levels, SLA management (response + resolution time targets), ticket assignment and escalation rules
- **Knowledge Base:** Searchable FAQ, categories, article rating
- **Live Chat:** Real-time messaging, chat history and transcript, chat rating
- **AI Chatbot:** NLP intent detection, automated FAQ responses, order status inquiry, return/exchange initiation, handoff to human agent for unresolved queries, sentiment analysis for priority routing
- **Self-Service:** Help center articles, video tutorials, interactive troubleshooting guides

#### AI & Intelligence Suite (FR-037)
- **AI-Powered Order Import from Handwritten Notes (FR-037a):**
  - Upload photo of handwritten order/purchase note
  - OCR + NLP extracts: item names, quantities, prices, units
  - Fuzzy match to product master with confidence scores
  - Review and confirm screen before import
  - Multi-language handwriting support
  - Learning from corrections over time

- **RAG-Based User Assistance (FR-037b):**
  - Retrieval-Augmented Generation chatbot
  - Vector embeddings in pgvector (PostgreSQL extension)
  - Knowledge base: products, help articles, company policies
  - Context-aware multi-turn conversations
  - Source citations in responses
  - Fallback to human agent

- **Product Summary & Review Intelligence (FR-037c):**
  - AI-generated product summaries
  - Review sentiment analysis (positive/neutral/negative)
  - Auto-generated review highlights
  - Fake review detection

- **Predictive Analytics & Forecasting (FR-037d):**
  - Sales forecasting (daily/weekly/monthly for future dates)
  - Item-level demand forecasting
  - Seasonal trend detection
  - Stock-out prediction
  - Customer churn prediction
  - Forecast dashboard widgets

- **Personalized Item Suggestions (FR-037e):**
  - "Customers who searched X also bought Y"
  - "Frequently bought together" recommendations
  - Collaborative + content-based filtering
  - Trending items per category/location

- **Regular Order/Purchase Suggestions (FR-037f):**
  - Predict reorder timing from purchase frequency
  - Smart basket auto-generation
  - Stock replenishment suggestions for owners
  - PO suggestions for suppliers based on sales velocity

- **AI-Powered First-Level Customer Support (FR-037g):**
  - Intent classification for support queries
  - Automated responses for common issues
  - Ticket auto-categorization and priority
  - Sentiment-based priority routing
  - Suggested replies for human agents (co-pilot)

- **Configuration:**
  - Master AI toggle: global ON/OFF per company
  - Feature-level toggles for each AI feature
  - Confidence thresholds for automated actions (default: 80%)
  - AI provider selection (OpenAI / Azure OpenAI / self-hosted)

### 6.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Analytics Service: pre-aggregated metrics store (ClickHouse), scheduled refresh jobs |
| **Backend** | Report Service: parameterized report generation, PDF/Excel/CSV export |
| **Backend** | Support Service: ticketing CRUD, SLA timer, escalation cron job |
| **Backend** | Chat Service: WebSocket real-time chat, transcript persistence |
| **Backend** | AI Chatbot Service: NLP integration (Dialogflow / Amazon Lex / custom LLM), intent routing |
| **Backend** | Knowledge Base Service: CRUD for articles, full-text search |
| **Backend** | Recommendation Engine: collaborative filtering / content-based for product suggestions |
| **Backend** | AI OCR Service: handwritten note → structured data (OpenAI Vision / custom OCR model) |
| **Backend** | RAG Service: document ingestion, pgvector embeddings, retrieval pipeline, LLM response generation |
| **Backend** | Prediction Service: sales/demand forecasting (time-series ML), stock-out prediction, churn prediction |
| **Backend** | AI Suggestion Service: personalized recommendations, reorder suggestions, smart basket |
| **Backend** | AI Support Co-pilot: intent classification, auto-response, suggested replies for agents |
| **Frontend (Web)** | Customer dashboard with charts (Chart.js / Recharts) |
| **Frontend (Web)** | Admin analytics dashboard with drill-down |
| **Frontend (Web)** | Service provider dashboard |
| **Frontend (Web)** | Report builder UI with filter panel and export buttons |
| **Frontend (Web)** | Support ticket management UI (admin + customer) |
| **Frontend (Web)** | Live chat widget (customer-facing) |
| **Frontend (Web)** | Knowledge base / help center UI |
| **Frontend (Web)** | AI chatbot widget with human escalation indicator |
| **Frontend (Web)** | AI OCR import screen: upload note photo → review extracted items → confirm import |
| **Frontend (Web)** | RAG chatbot UI with source citations |
| **Frontend (Web)** | Forecast dashboard: prediction charts, trend indicators, anomaly alerts |
| **Frontend (Web)** | AI configuration panel (feature toggles, provider selection, confidence thresholds) |
| **Frontend (Web)** | AI-powered product suggestions on search and cart pages |
| **Frontend (Mobile)** | Flutter: AI chatbot (RAG-based) |
| **Frontend (Mobile)** | Flutter: photo capture for OCR import (handwritten notes) |
| **Frontend (Mobile)** | Flutter: personalized recommendations on home screen |
| **Frontend (Mobile)** | Flutter: reorder suggestions with smart basket |
| **Database** | ClickHouse (or TimescaleDB) for time-series analytics data |
| **Database** | Schema additions: tickets, ticket_comments, chat_sessions, chat_messages, kb_articles, chatbot_sessions, ai_embeddings, ai_predictions, ai_suggestions |
| **Infrastructure** | ClickHouse / analytical DB cluster provisioned |
| **Infrastructure** | pgvector extension enabled on PostgreSQL for RAG embeddings |
| **Infrastructure** | OpenAI / Azure OpenAI API key configured in secrets vault |
| **Infrastructure** | NLP service API key configured (Dialogflow / AWS Lex) |
| **Infrastructure** | Scheduled report email job (cron + email provider integration) |

### 6.4 Testing Requirements

- Unit tests: Report filter combinations generate correct SQL/ClickHouse queries
- Unit tests: SLA timer escalation (breach triggers next-level assignment)
- Integration tests: Order placed → analytics aggregated → visible on dashboard within 1 minute
- Integration tests: Support ticket created by customer → assigned to agent → SLA clock starts
- Integration tests: Chatbot resolves FAQ query without human escalation
- E2E test: Admin downloads monthly sales report as Excel with correct totals
- E2E test: Upload handwritten note photo → AI extracts items → user confirms → order created
- E2E test: Customer asks RAG chatbot "What is your return policy?" → receives correct answer with citation
- E2E test: Forecast dashboard shows next-month prediction matching historical trend
- Performance test: Dashboard loads in < 2 seconds with 12 months of data

### 6.5 Deployment Checklist

- [ ] ClickHouse / analytical DB provisioned with data retention policy
- [ ] Chatbot intents trained for top 20 FAQ topics
- [ ] RAG knowledge base seeded with initial product catalog and help articles
- [ ] AI feature toggles default to OFF (admin must explicitly enable)
- [ ] AI API usage cost caps configured per tenant
- [ ] Scheduled report cron jobs tested in staging for all report types
- [ ] SLA thresholds configured (default: 1-hour first response, 24-hour resolution)
- [ ] Regression tests for Phases 1–5 pass

---

## Phase 7 — Growth & Expansion

> **Goal:** Drive new user acquisition and retention through welcome offers and referral programs, enable convenient reorder/subscription workflows, add the full Restaurant Management System, and enable multi-tenant marketplace operations at scale.

### 7.1 Scope

| Requirement ID | Feature | Priority |
|---|---|---|
| FR-029 | Welcome Offer & Referral Program | Medium |
| FR-030 | Re-Order & Subscription | High |
| FR-031 | Restaurant Management System | High |
| FR-032 | Multi-Tenant Marketplace & Logistics (full) | High |

### 7.2 Detailed Features

#### Welcome Offer & Referral Program (FR-029)
- New user signup bonus (credits, discount coupon)
- First order discount, free delivery on first order, free sample
- Welcome offer validity period and one-time redemption enforcement
- Unique referral code and shareable link per user
- Referrer reward on successful referral (cash, credits, discount, points, free items)
- Referee reward (new user incentive)
- Multi-level referral (optional, configurable)
- Referral tracking dashboard with status (pending, completed, expired)
- Sharing: WhatsApp, SMS, email, social, copy link, QR code
- Referral leaderboard and analytics (top referrers, conversion rate)
- Referral fraud detection (device fingerprint, duplicate phone/email detection)

#### Re-Order & Subscription (FR-030)
- One-click reorder (entire previous order)
- Selective reorder (pick items from past order)
- "My Frequent Items" list (auto-generated from purchase patterns)
- Reorder with modifications (change quantity, add/remove items)
- Price change and availability notification before reorder
- Substitute suggestion for unavailable items
- Subscribe & Save: configurable frequency (daily, weekly, bi-weekly, monthly)
- Auto-payment with saved card/UPI
- Skip / Pause / Cancel subscription
- Subscription management dashboard (customer + admin)
- Subscription discount configuration

#### Restaurant Management System (FR-031)
- **Order routing:** Dine In (table-linked), Take Away (quick queue), Online Order (delivery queue)
- **Table Master:** Layout designer, zones/floors, capacities, table status (available, occupied, reserved, cleaning)
- **Waiter Master:** Link system users to waiter assignments, shift management
- **Customer-Led Ordering:** QR code at table → customer browses menu on phone → adds to open table tab
- **Waiter-Led Ordering:** Tablet app — place/modify orders on behalf of customers, add special instructions per dish
- **Kitchen Display System (KDS):** Real-time order queue, auto-route food items to Kitchen KDS and beverages to Bar KDS
- **Prep-time tracking:** mark as "Preparing", "Ready", auto-alert back to waiter/customer
- **KOT (Kitchen Order Ticket):** Print/display KOT to kitchen staff
- **Table billing:** Merge tables, split bills (by item, by person, by custom amount)
- **Restaurant-specific report:** covers per table (guest count), average table turn time, most ordered dishes, peak hour analysis

#### Multi-Tenant Marketplace (FR-032 — full completion)
- Store discovery toggle: one shop / affiliate group / all platform shops
- Split cart → segregated child-orders per shop
- Platform-wide product search with shop branding
- Seller onboarding, listing approval workflow
- Customizable listing charges, delivery dispatch rates, transit tax
- Seller performance dashboard
- Customer identity masking: proxy phone/address for delivery personnel
- Marketplace-level promotions (cross-shop coupons)
- Platform settlement and payout (split revenue per seller + platform fee)

### 7.3 Technical Tasks

| Area | Task |
|---|---|
| **Backend** | Referral Service: code generation, tracking, fraud detection, reward dispatch |
| **Backend** | Subscription Service: recurring order scheduler (cron), payment auto-retry, skip/pause logic |
| **Backend** | Restaurant Service: table state machine, waiter assignment, KDS event streaming (WebSocket/SSE) |
| **Backend** | KOT Service: KOT generation, printer dispatch, prep-time tracking |
| **Backend** | Marketplace Service: seller onboarding, listing approval, settlement engine |
| **Backend** | Extend Split-Cart Order Service: platform fee calculation, payout splitting |
| **Frontend (Web)** | Welcome offer display (registration flow) |
| **Frontend (Web)** | Referral dashboard (customer: my code, tracking, rewards) |
| **Frontend (Web)** | Subscription management UI (customer + admin) |
| **Frontend (Web)** | Restaurant admin: table layout designer, waiter management |
| **Frontend (Web)** | Marketplace seller portal |
| **Frontend (Mobile)** | Flutter: customer QR-scan ordering interface (mobile-optimized) |
| **Frontend (Mobile)** | Flutter: waiter tablet app (iPad/Android tablet optimized) |
| **Frontend (Mobile)** | Flutter: Kitchen Display System screens (KDS — fullscreen, auto-refresh) |
| **Frontend (Mobile)** | Flutter: Bar KDS screen |
| **Database** | Schema additions: referrals, subscriptions, subscription_items, tables, table_orders, kds_items, restaurant_sessions, marketplace_sellers, platform_settlements |
| **Infrastructure** | WebSocket/SSE server for real-time KDS updates |
| **Infrastructure** | Thermal/kitchen printer integration for KOT printing |
| **Infrastructure** | Multi-tenant database isolation review and load test |

### 7.4 Testing Requirements

- Unit tests: Referral code uniqueness and fraud flag conditions
- Unit tests: Subscription frequency calculation (next order date for all frequency types)
- Integration tests: Table order placed → KDS receives in < 2 seconds → waiter alerted on "Ready"
- Integration tests: Referral link clicked → new user registered → reward credited to referrer
- Integration tests: Subscription auto-order generated → payment charged → order created
- E2E test (Restaurant): Customer scans table QR → adds items → waiter modifies → KDS shows → marked ready → bill generated → split payment processed
- E2E test (Marketplace): Add items from two shops → split checkout → two child-orders → two deliveries → two seller payouts → platform fee deducted

### 7.5 Deployment Checklist

- [ ] KDS screens tested on kitchen-grade tablets (low-latency WebSocket < 1 s)
- [ ] Subscription payment auto-retry failure notifications working
- [ ] Referral fraud detection rules reviewed and tuned
- [ ] Marketplace seller settlement bank transfer tested in staging
- [ ] Restaurant QR ordering flow tested on iOS and Android
- [ ] Full regression suite (all 7 phases) executed and passing

---

## Cross-Cutting Concerns (All Phases)

### Security Standards (NFR-3.4)
- OWASP Top 10 compliance review at the end of each phase
- All APIs: rate limiting, CORS policy, input validation/sanitization
- SQL injection, CSRF, and XSS prevention (parameterized queries, CSP headers, CSRF tokens)
- End-to-End Encryption: TLS 1.3 in transit, AES-256 at rest via KMS
- JWT: short-lived access tokens + rotation-enforced refresh tokens
- PCI DSS: card data never in application DB (gateway tokenization only)
- GDPR compliance: data export and deletion request handling
- Regular dependency vulnerability scanning (Dependabot / Snyk)

### Performance Standards (NFR-3.2)
- Page load time < 2 seconds (CDN for static assets)
- API response time < 500 ms at 95th percentile
- Load target: 10,000+ concurrent users (horizontal scaling + load balancer)
- Caching strategy: Redis for sessions, hot product data, and cart state; CDN for images/assets
- Database connection pooling (PgBouncer)

### CI/CD Pipeline (All Phases)
- Feature branch → Pull Request → automated lint + unit tests → code review → merge to main
- main → automated integration tests → staging deployment
- staging → manual QA sign-off → production deployment (blue-green or canary)
- Automated rollback on failed health check post-deploy
- Infrastructure as Code (Terraform / Pulumi) for all cloud resources

### Accessibility & Compatibility (NFR-3.5)
- WCAG 2.1 Level AA compliance for all customer-facing UIs
- Browser support: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile: iOS 14+, Android 10+
- Responsive layout: Desktop, Tablet, Mobile
- RTL layout support for Arabic/Hebrew locales

### API Standards (NFR-3.6)
- RESTful APIs with OpenAPI/Swagger documentation published at `/api/docs`
- Webhook support for key events (order placed, payment success, stock low, etc.)
- API versioning: `/api/v1/`, `/api/v2/` as needed
- OAuth 2.0 for third-party integrations

---

## Phase Dependency Map

```
Phase 1 (Foundation)
    ↓
Phase 2 (Core Commerce) — requires Phase 1 auth, products, orders; adds procurement & suppliers
    ↓
Phase 3 (Payments & Accounts) — requires Phase 2 cart, order, and procurement for party ledger
    ↓
Phase 4 (Engagement) — requires Phase 3 orders and payments (for verified purchase reviews); adds WhatsApp + import/export
    ↓
Phase 5 (Operations) — requires Phase 3 payment for provider payouts; Phase 4 for notifications
    ↓
Phase 6 (Intelligence & AI) — requires all prior phases' data; AI suite builds on products, orders, reviews
    ↓
Phase 7 (Growth) — requires all prior phases; Restaurant builds on Phase 1 products + billing; Advanced AI extends Phase 6
```

---

## Technology Stack Summary

| Layer | Technology |
|---|---|
| **Frontend (Web)** | Next.js 15.x (React, Server Components, App Router) |
| **Frontend (Mobile & Desktop)** | Flutter 3.x (iOS, Android, POS Desktop) |
| **Backend** | .NET 9 Web API (C#) |
| **API Gateway** | YARP (Yet Another Reverse Proxy, .NET) |
| **Primary DB** | PostgreSQL 16 (multi-schema + RLS) |
| **Cache** | Redis 7.x |
| **Search** | PostgreSQL pg_trgm (startup) / Meilisearch (growth) |
| **AI/ML** | OpenAI / Azure OpenAI + LangChain |
| **Vector DB** | pgvector (PostgreSQL extension) |
| **Message Queue** | RabbitMQ + MassTransit |
| **File Storage** | MinIO (dev) / AWS S3 (prod) |
| **CDN** | Cloudflare |
| **Containerization** | Docker |
| **Orchestration** | Kubernetes |
| **IaC** | Terraform |
| **Version Control** | GitHub (4-repo hybrid) |
| **CI/CD** | GitHub Actions |

---

## Glossary

| Term | Meaning |
|---|---|
| **MVP** | Minimum Viable Product |
| **POS** | Point of Sale |
| **GST** | Goods and Services Tax |
| **CGST** | Central GST (intra-state) |
| **SGST** | State GST (intra-state) |
| **IGST** | Integrated GST (inter-state) |
| **UTGST** | Union Territory GST |
| **HSN** | Harmonized System of Nomenclature |
| **SAC** | Services Accounting Code |
| **ROL** | Reorder Level |
| **EOQ** | Economic Order Quantity |
| **FIFO** | First In, First Out |
| **FEFO** | First Expiry, First Out |
| **UOM** | Unit of Measurement |
| **SKU** | Stock Keeping Unit |
| **KDS** | Kitchen Display System |
| **KOT** | Kitchen Order Ticket |
| **RBAC** | Role-Based Access Control |
| **JWT** | JSON Web Token |
| **OTP** | One-Time Password |
| **PCI DSS** | Payment Card Industry Data Security Standard |
| **GDPR** | General Data Protection Regulation |
| **SLA** | Service Level Agreement |
| **IaC** | Infrastructure as Code |
| **CDN** | Content Delivery Network |
| **NLP** | Natural Language Processing |
| **BOGO** | Buy One Get One |
| **PO** | Purchase Order |
| **GRN** | Goods Received Note |
| **RAG** | Retrieval-Augmented Generation |
| **OCR** | Optical Character Recognition |
| **LLM** | Large Language Model |
