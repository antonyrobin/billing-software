# 📋 Billing Software – Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** 2026-03-30  
> **Status:** Draft  
> **Author:** @antonyrobin  

---

## 1. Executive Summary

This document outlines the comprehensive requirements for a **Universal Billing Software** platform designed to be fully configurable and adaptable for any business type — from a small retail shop to a chain of restaurants, hospitals, schools, or large-scale online stores. The platform supports diverse item categories including food, grocery, medicine, clothes, electronics, furniture, hardware, and more.

### 1.1 Vision

Build a single, modular, and configurable billing platform that can serve:

| Business Type | Examples |
|---|---|
| Small Shop | Local grocery, pharmacy, stationery |
| Big Shop | Supermarket, department store |
| Chain of Shops | Franchise outlets, multi-branch retail |
| Online Store | E-commerce, marketplace |
| Delivery-Based Store | Food delivery, courier services |
| Restaurant / Hotel | Dine-in, takeaway, room service |
| Hospital | Pharmacy billing, patient billing |
| School / College | Fee collection, canteen billing |
| Any Other Business | Custom configuration |

### 1.2 Supported Item Categories

- 🍔 Food & Beverages
- 🛒 Grocery & FMCG
- 💊 Medicine & Pharma
- 👕 Clothes & Apparel
- 📱 Electronics & Gadgets
- 🪑 Furniture & Home Decor
- 🔧 Hardware & Tools
- 📦 Any Other Items (fully configurable)

---

## 2. Functional Requirements

---

### 2.1 Company / Shop Details Management

**ID:** FR-001  
**Priority:** High  
**Module:** Company Profile

#### Description
Comprehensive company/shop profile management with all statutory and branding details.

#### Requirements

- **Company Information:**
  - Company/Shop Name, Legal Name, Trade Name
  - Business Type (Sole Proprietorship, Partnership, LLP, Pvt Ltd, etc.)
  - Industry/Domain selector (Retail, Restaurant, Hospital, School, etc.)
  - Date of Establishment
  - Website URL, Social Media Links

- **GSTIN & Tax Registration:**
  - GSTIN Number with validation (15-digit alphanumeric)
  - PAN Number
  - TAN Number (if applicable)
  - State Code auto-detection from GSTIN
  - Multiple GSTIN support for businesses operating in multiple states
  - GST Registration Type (Regular, Composition, Unregistered)
  - VAT/TIN Number (for VAT-applicable regions)
  - FSSAI License Number (for food businesses)
  - Drug License Number (for pharmacy/medical businesses)

- **Billing Address:**
  - Primary Billing Address (Street, City, State, PIN, Country)
  - Multiple branch addresses with branch codes
  - Geo-location tagging for each address
  - Address auto-complete via Google Maps / Mapbox integration

- **Stamp / Seal / Signature:**
  - Upload digital stamp/seal (PNG, JPG, SVG — max 2MB)
  - Upload authorized signatory signature
  - Multiple signatory support with designation
  - Auto-placement on invoices and receipts
  - Stamp position configuration (left/right/center)

- **Branding:**
  - Company Logo upload (multiple formats)
  - Brand colors configuration (primary, secondary, accent)
  - Custom header/footer for invoices
  - Watermark configuration

#### Enhancements
- [ ] Multi-branch/franchise management with centralized and decentralized control
- [ ] Branch hierarchy (Head Office → Regional → Branch)
- [ ] Auto-populate tax details based on region/state
- [ ] Business license and certificate storage with expiry alerts
- [ ] Operating hours configuration per branch
- [ ] Holiday calendar management

---

### 2.2 Client / Customer Details Management

**ID:** FR-002  
**Priority:** High  
**Module:** Client Management

#### Description
Complete client/customer database with billing details and relationship management.

#### Requirements

- **Client Profile:**
  - Client Name (Individual / Organization)
  - Client Type (B2B, B2C, Government, Walk-in)
  - Contact Person Name, Phone, Email
  - GSTIN (for B2B clients)
  - PAN (for transactions > ₹50,000)
  - Credit Limit and Payment Terms
  - Client Group / Category tagging

- **Billing Address:**
  - Multiple billing addresses per client
  - Set default billing address
  - Shipping address (if different from billing)
  - Address validation and PIN code lookup
  - State-wise address for GST compliance

- **Client History:**
  - Purchase history with date range filters
  - Outstanding balance and payment history
  - Credit/Debit note history
  - Communication log

#### Enhancements
- [ ] Client loyalty tier system (Silver, Gold, Platinum, Diamond)
- [ ] Automated client segmentation based on purchase patterns
- [ ] Client-specific pricing and discount rules
- [ ] Bulk client import via CSV/Excel
- [ ] Client merge/de-duplication tool
- [ ] KYC document management
- [ ] Blacklist/Whitelist management
- [ ] Client communication preferences (Email, SMS, WhatsApp)

---

### 2.3 Item / Product Master

**ID:** FR-003  
**Priority:** High  
**Module:** Product Management

#### Description
Comprehensive item master supporting unlimited categories, types, brands, and packing sizes across all business domains.

#### Requirements

- **Item Information:**
  - Item Code (Auto-generated / Manual)
  - Item Name, Short Name, Display Name
  - Item Description (Rich Text with HTML support)
  - SKU (Stock Keeping Unit)
  - HSN/SAC Code (for GST classification)
  - Item Images (Multiple — up to 10 per item)
  - Item Weight, Dimensions (L × W × H)
  - Manufacturer / Made By
  - Country of Origin

- **Classification Hierarchy:**
  ```
  Department → Category → Sub-Category → Type → Sub-Type
  ```
  - **Category:** Electronics, Grocery, Medicine, Apparel, Food, etc.
  - **Sub-Category:** Mobile Phones, Laptops (under Electronics)
  - **Type:** Smartphone, Feature Phone (under Mobile Phones)
  - **Brand:** Samsung, Apple, OnePlus, etc.
  - **Packing Size:** 100ml, 250g, 1kg, Pack of 6, etc.

- **Pricing:**
  - MRP (Maximum Retail Price)
  - Selling Price / Our Price
  - Purchase Price / Cost Price
  - Wholesale Price
  - Dealer Price
  - Price effective date (from/to)
  - Multi-currency support

- **Tax Configuration:**
  - GST Rate (0%, 5%, 12%, 18%, 28%)
  - GST Type (Inclusive / Exclusive)
  - Cess applicable (Yes/No with percentage)
  - VAT Rate (if applicable)
  - Tax exemption flag

- **Units of Measurement:**
  - Primary UOM (Piece, Kg, Ltr, Mtr, etc.)
  - Secondary UOM with conversion factor
  - Smallest sellable unit

#### Domain-Specific Fields (Configurable)

| Business Type | Additional Fields |
|---|---|
| **Food / Restaurant** | Veg/Non-Veg flag, Allergen info, Nutritional values, Preparation time, Spice level |
| **Medicine / Pharma** | Generic Name, Composition, Drug Schedule (H/H1/X), Prescription required flag, Drug interactions |
| **Clothes / Apparel** | Size (S/M/L/XL/XXL), Color, Fabric, Pattern, Gender, Season |
| **Electronics** | Warranty period, Model number, Specifications, Energy rating |
| **Grocery** | Shelf life, Storage instructions, Organic/Non-organic flag |
| **Hardware** | Material, Grade, Tolerance, Technical specs |

#### Enhancements
- [ ] Configurable item attributes engine (add custom fields per business type)
- [ ] Item variants management (Color × Size matrix)
- [ ] Item bundles and combo packs
- [ ] Substitute/Alternative item linking
- [ ] Related items / Cross-sell items
- [ ] Item lifecycle management (Active, Discontinued, Out of Stock, Coming Soon)
- [ ] Bulk item import/export via CSV/Excel
- [ ] Item image gallery with zoom and 360° view
- [ ] Digital items support (e-books, licenses, subscriptions)
- [ ] Recipe/Bill of Materials (BOM) for manufactured items

#### Shop-Level Configuration
- **Strict Master Mode:** Only allow selling products already present in the master database. If a product is missing, it must be legally added to the Product Master first.
- **Partial Master Mode (Ad-hoc Products):** If a product is not in the master, staff can manually type the product name, set a dynamic quantity, assign a price, and process the sale immediately without cluttering the master DB.
- **No-Master Mode:** The shop maintains zero product master data; all sales are simply entered as ad-hoc generic entries (e.g., "Grocery Item - ₹50") at the billing screen.

---

### 2.4 Master Data Management (CRUD Operations)

**ID:** FR-004  
**Priority:** High  
**Module:** Master Configuration

#### Description
Full add/update/delete/search capability for all master data entities.

#### Requirements

- **Category Master:** Add, Edit, Delete, Activate/Deactivate, Reorder
- **Sub-Category Master:** Linked to parent category
- **Type Master:** Linked to sub-category
- **Brand Master:** With logo upload and brand description
- **Packing Size Master:** Unit, Size, Description
- **UOM Master:** Unit of Measurement with conversion factors
- **Tax Master:** Tax types, rates, and applicability rules
- **Location Master:** Warehouse, Store, Branch locations
- **Payment Mode Master:** Cash, Card, UPI, Net Banking, Wallet, etc.
- **Charge Master:** Delivery, Packing, Platform, Service charges

#### Common Features for All Masters
- Search with auto-suggest
- Pagination and sorting
- Active/Inactive toggle
- Audit trail (created by, modified by, timestamps)
- Soft delete (mark as deleted, not hard delete)
- Bulk operations (activate, deactivate, delete)
- Import/Export functionality

#### Enhancements
- [ ] Hierarchical master management with drag-and-drop reordering
- [ ] Master data versioning and rollback
- [ ] Approval workflow for master data changes
- [ ] Data validation rules per master
- [ ] Auto-sync masters across branches
- [ ] Master data templates for quick business setup
- [ ] Configurable mandatory/optional fields per business type

---

### 2.5 Inventory & Stock Management

**ID:** FR-005  
**Priority:** High  
**Module:** Inventory

#### Description
Multi-location inventory management with granular tracking down to shelf and rack level.

#### Requirements

- **Location Hierarchy:**
  ```
  Warehouse / Store → Zone / Section → Aisle → Shelf → Rack → Bin
  ```
  - Multiple warehouses/stores
  - Zone mapping (Cold Storage, Dry Storage, Hazardous, etc.)
  - Shelf and Rack numbering with capacity tracking

- **Stock Operations:**
  - Stock In (Purchase, Return, Transfer In, Opening Stock)
  - Stock Out (Sale, Damage, Transfer Out, Write-off)
  - Stock Transfer (Inter-branch, Inter-warehouse)
  - Stock Adjustment (Audit adjustments)
  - Stock Take / Physical Inventory Count

- **Stock Tracking:**
  - Real-time stock quantity per location
  - Batch-wise stock tracking
  - Serial number tracking (for electronics, high-value items)
  - Expiry date tracking with FIFO/FEFO enforcement
  - Lot number tracking

- **Stock Valuation:**
  - FIFO (First In, First Out)
  - LIFO (Last In, First Out)
  - Weighted Average
  - Specific Identification

#### Enhancements
- [ ] Barcode/QR-based stock operations (scan to add/remove)
- [ ] Automated stock replenishment suggestions
- [ ] Dead stock identification and alerts
- [ ] Stock aging analysis
- [ ] Multi-unit stock tracking (Cases → Pieces)
- [ ] Consignment stock management
- [ ] Stock reservation for pending orders
- [ ] Cycle count scheduling
- [ ] Integration with purchase orders for auto stock-in
- [ ] Visual warehouse map with stock heatmap

#### Shop-Level Configuration
- **Strict Inventory Enforcement:** Checkout cannot proceed if the requested quantity exceeds the physical stock recorded in the system.
- **Bypass Inventory Check:** Allows shops that do not rigorously track physical inventory counts to process orders and sell items even when stock levels are negative or undefined.

---

### 2.6 Barcode & QR Code Management

**ID:** FR-006  
**Priority:** High  
**Module:** Code Generation

#### Description
Generate, print, and scan barcodes and QR codes for all products and items.

#### Requirements

- **Barcode Support:**
  - Code 128, Code 39, EAN-13, EAN-8, UPC-A, UPC-E
  - Auto-generate based on item code/SKU
  - Manual barcode entry for pre-labeled items
  - Barcode label designer with customizable templates
  - Batch barcode printing (Thermal printer support)
  - Price label with barcode

- **QR Code Support:**
  - QR Code generation for each product
  - QR Code containing: Item details, Price, Batch, Expiry, URL
  - Dynamic QR Codes (content can be updated)
  - QR Code for invoices/receipts (linking to digital copy)

- **Label Printing:**
  - Multiple label sizes (1×1, 2×1, 3×1, A4 sheet)
  - Label templates with company logo, item name, price, barcode/QR
  - Shelf labels for retail display
  - Thermal printer integration (Zebra, TSC, Brother)

#### Enhancements
- [ ] Bulk barcode/QR generation and export (PDF, PNG, SVG)
- [ ] GS1 standard barcode support
- [ ] 2D barcode support (DataMatrix, PDF417)
- [ ] NFC tag writing support
- [ ] Barcode lookup API integration for product verification
- [ ] Mobile camera-based barcode/QR scanning
- [ ] Barcode collision detection and uniqueness validation

---

### 2.7 Item Search & Discovery

**ID:** FR-007  
**Priority:** High  
**Module:** Search

#### Description
Multiple search methods for fast and accurate item lookup.

#### Requirements

- **Barcode Scan:** Hardware scanner + Mobile camera scan
- **QR Code Scan:** Hardware scanner + Mobile camera scan
- **Quick Search:**
  - Search by item name, code, SKU
  - Auto-suggest / typeahead with debounce
  - Fuzzy search (handles typos)
  - Voice search support
- **Master-Based Search:**
  - Browse by Category → Sub-Category → Type
  - Filter by Brand
  - Filter by Packing Size
  - Filter by Price Range
  - Filter by Availability (In Stock / Out of Stock)
  - Filter by Location / Warehouse
- **Advanced Search:**
  - Multi-field search (combine any attributes)
  - Search by HSN/SAC code
  - Search by batch number
  - Search by expiry date range
  - Search by supplier

#### Enhancements
- [ ] AI-powered search with natural language understanding
- [ ] Image-based search (upload image to find product)
- [ ] Recent search history
- [ ] Saved searches / Favorite searches
- [ ] Search analytics (most searched items, zero-result searches)
- [ ] Personalized search results based on user behavior
- [ ] Scan-and-go mode for rapid billing
- [ ] Multi-language search support

---

### 2.8 Cart & Wishlist Management

**ID:** FR-008  
**Priority:** High  
**Module:** Cart

#### Description
Intuitive cart and wishlist experience with easy quantity management.

#### Requirements

- **Add to Cart:**
  - One-click add from search results / product page
  - Add via barcode/QR scan
  - Add via voice command
  - Bulk add (select multiple items)
  - Add from previous orders (reorder)

- **Cart Operations:**
  - Increase / Decrease quantity with +/- buttons
  - Manual quantity input
  - Unit toggle (e.g., switch between Kg and g)
  - Remove item from cart
  - Clear entire cart
  - Save cart as draft order
  - Cart auto-save (prevent loss on refresh/close)

- **Wishlist:**
  - Add to wishlist from any screen
  - Multiple wishlists (e.g., "Weekly Groceries", "Monthly Supplies")
  - Move from wishlist to cart
  - Share wishlist with others
  - Wishlist availability alerts (notify when back in stock)

- **Cart Summary:**
  - Itemized list with subtotals
  - Running total with tax breakdown
  - Applied discounts visible
  - Estimated delivery time/cost
  - Stock availability indicator (in real-time)

#### Enhancements
- [ ] Smart cart suggestions ("Customers also bought...")
- [ ] Cart comparison (compare similar items)
- [ ] Scheduled cart / Auto-reorder
- [ ] Cart sharing via link
- [ ] Abandoned cart recovery with notification
- [ ] Cart quantity limits (min/max per item)
- [ ] Split cart (partial checkout)
- [ ] Cart notes per item (special instructions)

---

### 2.9 Discount Management

**ID:** FR-009  
**Priority:** High  
**Module:** Discounts

#### Description
Flexible discount system at item level and order level.

#### Requirements

- **Item-Level Discounts:**
  - Flat amount discount (e.g., ₹50 off)
  - Percentage discount (e.g., 10% off)
  - Special price override
  - Discount valid from/to dates
  - Discount applicable for specific customer groups
  - Maximum discount cap
  - Minimum quantity for discount

- **Order-Level Discounts:**
  - Flat discount on total order
  - Percentage discount on total order
  - Minimum order value for discount eligibility
  - Tiered discounts (e.g., 5% on ₹500+, 10% on ₹1000+, 15% on ₹2000+)
  - First-order discount
  - Employee discount

- **Discount Rules Engine:**
  - Priority/precedence rules (which discount applies first)
  - Stackable vs. non-stackable discounts
  - Maximum discount limit per order
  - Approval required for discounts above threshold
  - Discount reason mandatory field

#### Enhancements
- [ ] AI-driven dynamic pricing and discount suggestions
- [ ] Discount impact analytics
- [ ] Competitor price matching
- [ ] Time-based flash discounts (Happy Hour)
- [ ] Loyalty points redemption as discount
- [ ] Bulk/Wholesale pricing tiers
- [ ] Negotiated pricing for B2B clients
- [ ] Discount templates for quick application
- [ ] Discount audit trail

#### Shop-Level Configuration (Billing Limits)
- **Strict Pricing Restrict:** Cashiers cannot change preset item prices or apply spot discounts at the billing screen; pricing strictly driven via master data rules and promos.
- **Flexible Pricing Allowed:** Cashiers are allowed to modify the final product price and apply ad-hoc item or order-level discounts during checkout (up to a configurable limit/percentage).

---

### 2.10 Offers & Promotions

**ID:** FR-010  
**Priority:** High  
**Module:** Promotions

#### Description
Comprehensive promotional offers engine supporting multiple offer types.

#### Requirements

- **Coupon Codes:**
  - Single-use and multi-use coupons
  - Auto-generated coupon codes
  - Custom coupon codes
  - Coupon validity period (from/to dates)
  - Usage limit (per user, total uses)
  - Minimum order value
  - Applicable categories/items
  - First-time user coupons
  - Referral coupons

- **Festival / Seasonal Offers:**
  - Pre-configured festival calendar (Diwali, Christmas, Eid, etc.)
  - Custom season/event creation
  - Banner/Creative management for offers
  - Auto-start and auto-end based on schedule
  - Storewide and category-specific seasonal offers

- **Buy X Get Y Offers:**
  - Buy 1 Get 1 Free (BOGO)
  - Buy 2 Get 1 Free
  - Buy X of Item A, Get Item B Free
  - Buy from Category A, Get discount on Category B
  - Minimum purchase quantity triggers

- **Cashback Offers:**
  - Flat cashback amount
  - Percentage cashback (with cap)
  - Cashback to wallet/credits
  - Cashback validity period
  - Cashback on specific payment methods

- **Credit Score / Loyalty Rewards:**
  - Points earned per purchase (configurable ratio)
  - Points redemption rules
  - Tier-based earning multipliers
  - Points expiry management
  - Points statement and history

- **Other Free Item Offers:**
  - Free sample with purchase
  - Gift with purchase above threshold
  - Combo offers (bundle pricing)
  - Clearance/Liquidation offers

#### Enhancements
- [ ] Offer stacking rules and priority management
- [ ] A/B testing for offers (measure effectiveness)
- [ ] Geo-targeted offers (location-based)
- [ ] Personalized offers based on purchase history
- [ ] Offer budget management (stop when budget exhausted)
- [ ] Affiliate/Influencer specific offers
- [ ] Gamified offers (Spin the Wheel, Scratch Card)
- [ ] Social media exclusive offers
- [ ] Offer analytics dashboard (redemption rate, ROI)

---

### 2.11 Passwordless Sign-Up & Login

**ID:** FR-011  
**Priority:** High  
**Module:** Authentication & Security

#### Description
Highly secure, passwordless authentication utilizing One-Time Passwords (OTP) and configurable Two-Factor Authentication (2FA) coupled with robust JWT session management.

#### Requirements

- **Sign-Up & Login (No Passwords Allowed):**
  - Mobile number + SMS OTP verification.
  - Email Address + Email Code / Magic Link verification.
  - Social login (Google, Facebook, Apple).

- **Configurable 2FA (Two-Factor Authentication):**
  - Toggled ON/OFF per role (e.g. required for Admins/Owners, optional for Customers).
  - Can use Authenticator Apps (TOTP) or backup email/SMS codes.

- **Session Management & JWT:**
  - Short-lived Access Tokens (JWT) kept in memory.
  - Long-lived, rotation-enforced Refresh Tokens stored securely.
  - End-to-end management of active sessions (forced logout on device level).

- **Security Details:**
  - Device/IP tracking for suspicious login alerts.
  - Account lockout/cooldown on bad OTP attempts.
  - No plaintext or hashed static passwords stored anywhere.
  - Bot protection via CAPTCHA.

#### Enhancements
- [ ] Biometric login fallback (FaceID/TouchID on mobile).
- [ ] Single Sign-On (SSO) for enterprise franchises.
- [ ] GDPR-compliant data consent records.

---

### 2.12 Service Provider Account Management

**ID:** FR-012  
**Priority:** High  
**Module:** Service Provider Portal

#### Description
Secure registration, approval workflow, and portal for service providers (delivery partners, vendors, third-party sellers).

#### Requirements

- **Registration:**
  - Business name and details
  - Owner/Authorized person details
  - Business registration documents upload
  - Tax registration (GSTIN, PAN)
  - Bank account details for settlements
  - Service area/Coverage area definition
  - Service categories selection

- **Approval Workflow:**
  - Multi-step verification process
  - Document verification (manual/automated)
  - Background check integration
  - Approval/Rejection with reason
  - Conditional approval (probation period)
  - Re-application after rejection (with cooldown period)

- **Login & Access:**
  - Secure login with 2FA mandatory
  - Role-Based Access Control (RBAC)
  - IP restriction option
  - API key management for integrations
  - Activity logging

- **Service Provider Dashboard:**
  - Order management
  - Earnings and settlements
  - Performance metrics
  - Customer feedback/ratings
  - Inventory management (for marketplace model)

#### Enhancements
- [ ] Tiered service provider levels (Standard, Premium, Enterprise)
- [ ] Automated onboarding with e-KYC
- [ ] Service Level Agreement (SLA) management
- [ ] Commission structure configuration
- [ ] Automated payout scheduling
- [ ] Dispute resolution system
- [ ] Training material and certification management
- [ ] API sandbox for integration testing

---

### 2.13 Expiry, ROL & Delivery Restrictions

**ID:** FR-013  
**Priority:** High  
**Module:** Business Rules

#### Description
Handle expiry dates, reorder levels, and delivery time restrictions.

#### Requirements

- **Expiry Date Management:**
  - Expiry date tracking per batch
  - Near-expiry alerts (configurable days before expiry: 30, 60, 90 days)
  - Auto-removal from sale when expired
  - FEFO (First Expiry, First Out) enforcement
  - Expiry-based discount automation (e.g., 50% off within 30 days of expiry)
  - Expired stock write-off workflow
  - Expiry report and analytics

- **Reorder Level (ROL):**
  - Minimum stock level per item per location
  - Maximum stock level
  - Reorder quantity
  - Safety stock calculation
  - Auto-generate purchase orders when stock hits ROL
  - Lead time configuration per supplier
  - Economic Order Quantity (EOQ) calculation
  - ROL alerts via email/SMS/push notification

- **Delivery Time Restrictions:**
  - Delivery slot management (time windows)
  - Cut-off time for same-day delivery
  - Delivery blackout dates (holidays, maintenance)
  - Location-based delivery time estimation
  - Perishable item delivery priority
  - Temperature-sensitive delivery flagging
  - Maximum delivery radius configuration
  - Express delivery option with surcharge

#### Enhancements
- [ ] AI-based demand forecasting for reorder optimization
- [ ] Seasonal stock adjustment recommendations
- [ ] Supplier performance tracking (delivery reliability)
- [ ] Batch recall management
- [ ] Cold chain monitoring integration (IoT sensors)
- [ ] Delivery route optimization
- [ ] Real-time delivery tracking
- [ ] Delivery partner assignment rules

---

### 2.14 Payment Gateway Integration

**ID:** FR-014  
**Priority:** High  
**Module:** Payments

#### Description
Comprehensive payment processing for collections and refunds.

#### Requirements

- **Payment Gateway Support:**
  - Razorpay, Stripe, PayU, CCAvenue, PayPal
  - UPI (Google Pay, PhonePe, Paytm, BHIM)
  - Credit Card / Debit Card (Visa, MasterCard, Amex, RuPay)
  - Net Banking
  - Wallets (Paytm, Amazon Pay, PhonePe)
  - Cash on Delivery (COD)
  - EMI options (No-cost EMI, Low-cost EMI)
  - Buy Now Pay Later (BNPL)
  - Bank Transfer / NEFT / RTGS (for B2B)

- **Payment Processing:**
  - Real-time payment status tracking
  - Auto-retry on failure
  - Partial payment support
  - Split payment (multiple methods)
  - Payment timeout handling
  - Duplicate payment detection
  - Payment reconciliation

- **Refund Processing:**
  - Full refund to original payment method
  - Partial refund
  - Refund to wallet/store credit
  - Refund timeline tracking
  - Automated refund on cancellation
  - Manual refund approval workflow

#### Enhancements
- [ ] Multi-currency payment support
- [ ] Subscription/Recurring payment
- [ ] Invoice-based payment links
- [ ] QR code-based payment
- [ ] Offline payment mode (sync when online)
- [ ] Payment fraud detection
- [ ] PCI DSS compliance
- [ ] Payment analytics and reporting
- [ ] Auto-settlement to service providers

#### Shop-Level Configuration
- **Strict Payment Gateway Mode:** All monetary collections must explicitly go through a digital payment gateway integration via the system. Cashiers cannot bypass to collect physical cash.
- **Hybrid Payment / Manual Mode:** Shops can accept and manually log direct payments (cash, external card swallows, direct bank transfers) alongside digital PG flows.

---

### 2.15 Item Exchange & Returns

**ID:** FR-015  
**Priority:** High  
**Module:** Returns & Exchange

#### Description
Seamless item exchange and return process with multiple policy configurations.

#### Requirements

- **Return Policy Configuration:**
  - Return window (e.g., 7 days, 15 days, 30 days)
  - Category-wise return policies
  - Item-wise return policies (override category)
  - Non-returnable item marking
  - Return reasons (mandatory selection)
  - Photo/Video evidence upload for damaged items
  - Restocking fee configuration

- **Return Process:**
  - Initiate return from order history
  - Return approval workflow (auto/manual)
  - Pickup scheduling for returns
  - Drop-off at store option
  - Return quality check
  - Refund or store credit option
  - Return shipping label generation

- **Exchange Process:**
  - Exchange for same item (different size/color)
  - Exchange for different item (with price adjustment)
  - Exchange window configuration
  - Exchange availability check
  - Price difference handling (pay more / refund difference)

#### Enhancements
- [ ] AI-based return fraud detection
- [ ] Return analytics (most returned items, reasons)
- [ ] Automated restocking of returned items
- [ ] Warranty-based returns
- [ ] Exchange recommendations
- [ ] Return impact on loyalty points
- [ ] Vendor-specific return rules (marketplace)
- [ ] Return label printing

---

### 2.16 Reviews & Ratings

**ID:** FR-016  
**Priority:** Medium  
**Module:** Reviews

#### Description
Customer review and rating system for products and services.

#### Requirements

- **Rating System:**
  - 1-5 star rating for products
  - Overall rating calculation (weighted average)
  - Rating breakdown display (5★: 60%, 4★: 25%, etc.)
  - Separate ratings for: Quality, Value, Delivery, Packaging

- **Review System:**
  - Text review with character limit
  - Photo/Video review upload
  - Verified purchase badge
  - Review title
  - Pros and Cons fields
  - Recommend to friend (Yes/No)

- **Moderation:**
  - Auto-moderation (profanity filter, spam detection)
  - Manual review approval option
  - Report abuse option
  - Review response by seller/company
  - Edit/Delete own review

#### Enhancements
- [ ] AI-powered review sentiment analysis
- [ ] Review highlights (auto-extracted key points)
- [ ] Q&A section on product page
- [ ] Review incentives (points for reviewing)
- [ ] Review reminders after delivery
- [ ] Reviewer leaderboard
- [ ] Filter reviews by rating, date, relevance
- [ ] Review translation for multi-language support

---

### 2.17 Order Management

**ID:** FR-017  
**Priority:** High  
**Module:** Orders

#### Description
Complete order lifecycle management with visibility for customers.

#### Requirements

- **Order Status Tracking:**
  - Order Placed → Confirmed → Processing → Packed → Shipped → Out for Delivery → Delivered
  - Additional statuses: On Hold, Cancelled, Returned, Exchanged, Refunded
  - Real-time status updates

- **Order Views:**
  - **Current Orders:** Active orders with live status
  - **Previous Orders:** Completed order history with filters
  - **Cancelled Orders:** Cancelled orders with reasons
  - Order search by Order ID, Date, Item name
  - Order sorting (newest first, amount, status)

- **Order Operations:**
  - Cancel order (before dispatch with policy rules)
  - Modify order (add/remove items before processing)
  - Track delivery in real-time (map view)
  - Download invoice for any order
  - Reorder (one-click add all items to cart)

- **Offline POS Flow (Quick-Billing Screen):**
  - Add product via search or Barcode scanner.
  - POS displays total price instantly.
  - Ask customer for payment method, process payment externally or via integrated gateway.
  - Mark order as "Paid".
  - Auto-generate localized tax receipt, send pulse to thermal printer instantly.
  - Hand over items and printed receipt to customer.

- **Customer Self-Service:**
  - Dedicated self-checkout UI allowing walk-in customers to browse from the available list of products, form a cart, process digital payments unassisted, and generate their own order token.

#### Enhancements
- [ ] Order timeline/Activity log
- [ ] Order notes and special instructions
- [ ] Gift order with custom message
- [ ] Scheduled/Future dated orders
- [ ] Recurring orders (subscription)
- [ ] Multi-shipment orders
- [ ] Order splitting by warehouse/location
- [ ] Estimated delivery time with live updates

---

### 2.18 Bill Receipt & Invoice Generation

**ID:** FR-018  
**Priority:** High  
**Module:** Billing & Invoicing

#### Description
Professional bill receipts and invoices with print and download capabilities.

#### Requirements

- **Invoice Generation:**
  - Auto-generated invoice number (sequential, prefix-based)
  - Invoice date and due date
  - Financial year-wise numbering reset
  - Proforma invoice
  - Tax invoice (GST compliant)
  - Credit note / Debit note
  - Delivery challan
  - Quotation / Estimate

- **Invoice Content:**
  - Company details with logo and stamp
  - Customer details with GSTIN
  - Itemized list with HSN/SAC, quantity, rate, amount
  - Tax breakdown (CGST, SGST, IGST, Cess)
  - Discount details
  - Total in words
  - Terms and conditions
  - Bank details for payment
  - QR code for quick payment
  - Digital signature

- **Output Options:**
  - **Print:** Direct thermal printer (POS receipt), A4/A5 printer
  - **PDF Download:** High-quality PDF generation
  - **Email:** Send invoice as email attachment
  - **WhatsApp:** Share invoice via WhatsApp
  - **SMS:** Send invoice link via SMS

- **Templates:**
  - Multiple invoice templates (Modern, Classic, Minimal, Detailed)
  - Customizable templates (drag-and-drop designer)
  - Multi-language invoice support
  - Thermal receipt template (80mm, 58mm)
  - A4/A5 invoice template

#### Enhancements
- [ ] E-invoicing integration (GST e-invoice portal)
- [ ] E-way bill generation
- [ ] Bulk invoice generation
- [ ] Recurring invoice automation
- [ ] Invoice aging report
- [ ] Multi-currency invoicing
- [ ] Invoice approval workflow
- [ ] Digital signature integration (DSC)
- [ ] Invoice OCR for vendor bills
- [ ] Custom watermark on invoices

---

### 2.19 Delivery Address Management

**ID:** FR-019  
**Priority:** High  
**Module:** Address Book

#### Description
User-friendly address management with multiple delivery addresses.

#### Requirements

- **Address Operations:**
  - **Add:** New delivery address with all fields
  - **Update:** Edit existing address
  - **Delete:** Remove saved address (with confirmation)
  - **Set Default:** Mark one address as default

- **Address Fields:**
  - Address Label (Home, Office, Other — custom)
  - Full Name, Phone Number
  - Address Line 1, Address Line 2
  - Landmark
  - City, State, PIN Code, Country
  - Geo-coordinates (auto-detect or manual pin)
  - Delivery instructions (e.g., "Ring doorbell", "Leave at door")

- **Address Features:**
  - PIN code auto-lookup (city, state)
  - Google Maps integration for address selection
  - Current location detection
  - Address validation
  - Maximum addresses limit (configurable, default: 10)

#### Enhancements
- [ ] Address auto-complete with Google Places API
- [ ] Address sharing from contacts
- [ ] Temporary/One-time address option
- [ ] Address-based delivery availability check
- [ ] Address-based service area validation
- [ ] Bulk address import (for B2B customers)
- [ ] Address formatting per country

---

### 2.20 Payment Options & Card Management

**ID:** FR-020  
**Priority:** High  
**Module:** Payment Methods

#### Description
Multiple payment methods with secure card storage.

#### Requirements

- **Payment Methods:**
  - Credit Card / Debit Card
  - UPI
  - Net Banking
  - Digital Wallets
  - Cash on Delivery
  - Store Credit / Wallet
  - EMI
  - Gift Card / Voucher
  - Loyalty Points Redemption
  - Pay Later / Credit Line

- **Secure Card Storage:**
  - Save card details for future use (tokenized)
  - PCI DSS Level 1 compliance
  - Card tokenization (RBI guidelines compliant)
  - AFA (Additional Factor Authentication) for saved cards
  - Multiple cards storage
  - Set default card
  - Delete saved card
  - Card expiry alerts
  - Card type auto-detection (Visa/MC/Amex/RuPay)

- **Security Features:**
  - 3D Secure authentication
  - CVV not stored (per PCI DSS)
  - Encrypted data transmission (TLS 1.3)
  - Fraud detection and prevention
  - Transaction OTP verification

#### Enhancements
- [ ] Auto-select best payment method (based on offers/cashback)
- [ ] Payment method-specific offers
- [ ] Installment payment plans
- [ ] Corporate payment accounts
- [ ] Payment method analytics
- [ ] Auto-debit authorization for subscriptions
- [ ] Multi-currency card support

---

### 2.21 GST / VAT Calculation

**ID:** FR-021  
**Priority:** High  
**Module:** Tax Engine

#### Description
Comprehensive tax calculation engine supporting GST and VAT.

#### Requirements

- **GST Calculation:**
  - **CGST + SGST:** For intra-state transactions
  - **IGST:** For inter-state transactions
  - **UTGST:** For Union Territory transactions
  - Auto-determination based on seller & buyer state
  - Cess calculation where applicable
  - Reverse Charge Mechanism (RCM)
  - Composition scheme support

- **Tax Rates:**
  - Configurable tax rates (0%, 5%, 12%, 18%, 28%)
  - HSN/SAC-based tax rate mapping
  - Tax exemption handling
  - Nil-rated and zero-rated items
  - Tax inclusive/exclusive pricing toggle

- **VAT Calculation (for applicable regions):**
  - Standard VAT rate
  - Reduced VAT rate
  - Zero-rated items
  - VAT-exempt items
  - Input VAT credit

- **Tax Reports:**
  - GSTR-1 (Outward supplies)
  - GSTR-2A/2B reconciliation
  - GSTR-3B summary
  - Tax payment challan generation
  - TDS/TCS compliance
  - HSN summary report

#### Enhancements
- [ ] Auto-update tax rates from government portal
- [ ] Multi-country tax support (US Sales Tax, UK VAT, etc.)
- [ ] Tax audit trail
- [ ] E-filing integration
- [ ] Tax optimization suggestions
- [ ] Tax calendar with due date reminders
- [ ] Import/Export duty calculation
- [ ] Place of Supply determination engine
- [ ] ITC (Input Tax Credit) tracking

---

### 2.22 Charges Management

**ID:** FR-022  
**Priority:** High  
**Module:** Charges Engine

#### Description
Configurable charge calculation at service provider, company, and item levels.

#### Requirements

- **Delivery Charges:**
  - Distance-based calculation
  - Weight-based calculation
  - Order value-based (free delivery above threshold)
  - Zone-based delivery charges
  - Express delivery surcharge
  - Same-day delivery surcharge
  - Scheduled delivery charges

- **Packing Charges:**
  - Flat packing charge per order
  - Per-item packing charge
  - Premium packaging option
  - Gift wrapping charges
  - Eco-friendly packaging option

- **Platform Charges:**
  - Service provider commission (percentage or flat)
  - Platform fee per transaction
  - Listing fee for marketplace sellers
  - Featured listing charges
  - Payment gateway fee pass-through

- **Charge Levels:**

  | Level | Description |
  |---|---|
  | **Service Provider** | Charges set by delivery partner / vendor |
  | **Company** | Company-wide charges and policies |
  | **Item** | Item-specific charges (heavy items, fragile items, hazardous) |

- **Charge Rules:**
  - Override hierarchy (Item > Company > Service Provider)
  - Time-based charges (peak hours surcharge)
  - Promotional charge waivers
  - Charge caps and minimum charges

#### Enhancements
- [ ] Dynamic pricing based on demand
- [ ] Charge simulation/preview before order
- [ ] Charge comparison across service providers
- [ ] Charge negotiation for B2B
- [ ] Automated charge adjustment for promotions
- [ ] Charge audit and reconciliation
- [ ] Charge templates for common scenarios

---

### 2.23 User & Service Provider Block Management

**ID:** FR-023  
**Priority:** Medium  
**Module:** Moderation

#### Description
Administrative controls to block/unblock users and service providers.

#### Requirements

- **Block User:**
  - Block customer account (full or partial)
  - Block reason (mandatory)
  - Block duration (temporary or permanent)
  - Blocked user restrictions (cannot place orders, cannot login)
  - Notification to blocked user
  - Appeal/Unblock request workflow

- **Block Service Provider:**
  - Suspend service provider operations
  - Freeze payouts during investigation
  - Block reason and evidence documentation
  - Impact assessment (pending orders handling)
  - Reinstatement process with conditions

- **Block Triggers:**
  - Manual block by admin
  - Auto-block on policy violation (configurable rules)
  - Auto-block on fraud detection
  - Auto-block on excessive returns/chargebacks
  - Auto-block on rating below threshold

#### Enhancements
- [ ] Graduated penalty system (Warning → Temp Block → Permanent)
- [ ] Block history and audit trail
- [ ] Automated suspicious activity detection
- [ ] Whitelist/VIP customer protection
- [ ] Regional block management
- [ ] IP-based blocking
- [ ] Device-based blocking
- [ ] Legal hold documentation

---

### 2.24 Service ON / OFF / Pause / Resume

**ID:** FR-024  
**Priority:** Medium  
**Module:** Service Control

#### Description
Granular control over service availability at multiple levels.

#### Requirements

- **Service States:**
  - **ON:** Fully operational, accepting orders
  - **OFF:** Completely shut down, no orders accepted
  - **PAUSE:** Temporarily paused, existing orders continue, no new orders
  - **RESUME:** Resume from paused state

- **Control Levels:**
  - **Store Level:** Entire store ON/OFF/Pause
  - **Category Level:** Specific categories available/unavailable
  - **Item Level:** Individual item availability toggle
  - **Service Provider Level:** Delivery partner availability
  - **Time-Based:** Auto ON/OFF based on operating hours

- **Scheduled Controls:**
  - Schedule maintenance windows
  - Holiday closures
  - Auto-resume after scheduled pause
  - Recurring schedules (every Sunday OFF)

- **Customer Communication:**
  - "Currently Unavailable" messaging
  - Expected resume time display
  - Alternative suggestions during downtime
  - Pre-order option during OFF state

#### Enhancements
- [ ] Capacity-based auto-pause (order limit reached)
- [ ] Weather-based service adjustments
- [ ] Staff availability-based controls
- [ ] Gradual resume (soft launch after pause)
- [ ] Service status API for third-party integrations
- [ ] Multi-channel sync (online, app, POS)
- [ ] Emergency shutdown button
- [ ] Service health monitoring dashboard

---

### 2.25 Email & SMS Notifications

**ID:** FR-025  
**Priority:** High  
**Module:** Notifications

#### Description
Transactional and promotional notifications via email and SMS.

#### Requirements

- **Email Notifications:**
  - Welcome email on registration
  - Order confirmation
  - Order status updates (shipped, delivered)
  - Invoice email
  - Payment confirmation / failure
  - Password reset
  - Promotional emails
  - Abandoned cart reminder
  - Review request
  - Account alerts (login from new device)

- **SMS Notifications:**
  - OTP for login/verification
  - Order confirmation
  - Delivery updates
  - Payment alerts
  - Promotional SMS (with opt-in/opt-out)
  - Critical alerts (order cancellation, refund)

- **Configuration:**
  - Template management (dynamic placeholders)
  - Multi-language templates
  - Send timing preferences (DND hours respect)
  - Opt-in / Opt-out management
  - Delivery tracking and analytics (open rate, click rate)

- **Service Providers:**
  - Email: SendGrid, AWS SES, Mailgun, SMTP
  - SMS: Twilio, MSG91, AWS SNS, Textlocal

#### Enhancements
- [ ] WhatsApp Business API integration
- [ ] Rich HTML email templates with drag-and-drop builder
- [ ] A/B testing for email/SMS campaigns
- [ ] Triggered email workflows (drip campaigns)
- [ ] Email/SMS scheduling
- [ ] Personalization engine
- [ ] Unsubscribe management
- [ ] Bounce and complaint handling

---

### 2.26 Push Notifications

**ID:** FR-026  
**Priority:** High  
**Module:** Push Notifications

#### Description
Real-time push notifications for mobile and web applications.

#### Requirements

- **Notification Types:**
  - Transactional (order updates, payment alerts)
  - Promotional (offers, new arrivals)
  - Informational (policy changes, feature updates)
  - Personalized (based on behavior/preferences)
  - Location-based (geo-fenced notifications)

- **Channels:**
  - Mobile Push (iOS APNs, Android FCM)
  - Web Push (Service Workers)
  - In-App notifications
  - Browser notifications

- **Features:**
  - Rich notifications (images, action buttons)
  - Silent/Background notifications
  - Notification grouping/stacking
  - Deep linking to specific screens
  - Notification center (in-app inbox)
  - Read/Unread status
  - Notification preferences per category

- **Targeting:**
  - All users broadcast
  - Segmented push (by location, behavior, demographics)
  - Individual user push
  - Topic-based subscription

#### Enhancements
- [ ] AI-optimized send time
- [ ] Notification frequency capping
- [ ] Interactive notifications (quick reply, rating)
- [ ] Notification analytics (delivery, open, click rates)
- [ ] Multi-language notifications
- [ ] Priority levels (normal, high, urgent)
- [ ] Notification A/B testing
- [ ] Scheduled notifications

---

### 2.27 Dashboards & Reports

**ID:** FR-027  
**Priority:** High  
**Module:** Analytics

#### Description
Role-specific dashboards and comprehensive reports with advanced filtering.

#### Requirements

- **Customer Dashboard:**
  - Order summary (total orders, total spent)
  - Active orders tracker
  - Loyalty points balance
  - Saved items and wishlists
  - Recent activity
  - Personalized recommendations

- **Company / Admin Dashboard:**
  - Real-time sales dashboard (today, week, month)
  - Revenue analytics with trends
  - Top selling products
  - Inventory status overview
  - Customer acquisition and retention metrics
  - Order funnel analysis
  - Payment collection summary
  - Tax liability summary
  - Employee performance metrics

- **Service Provider Dashboard:**
  - Earnings overview
  - Order statistics
  - Performance score
  - Customer ratings summary
  - Payout history
  - Pending deliveries

- **Reports:**
  - Sales Report (daily, weekly, monthly, yearly, custom)
  - Purchase Report
  - Inventory Report (stock status, movement, aging)
  - Tax Report (GST, VAT)
  - Profit & Loss Report
  - Customer Report (new, returning, churn)
  - Payment Report (collections, outstanding, refunds)
  - Product Performance Report
  - Delivery Performance Report
  - Returns & Exchange Report
  - Discount & Offer Performance Report
  - User Activity Report

- **Filters:**
  - Date range (from/to, presets: Today, This Week, This Month, This Year)
  - Branch / Location
  - Category / Brand
  - Customer / Customer Group
  - Payment Method
  - Order Status
  - Service Provider

- **Export Options:**
  - PDF, Excel, CSV
  - Email scheduled reports
  - API access for custom reporting

#### Enhancements
- [ ] Custom dashboard builder (drag-and-drop widgets)
- [ ] Real-time streaming dashboards
- [ ] Predictive analytics (sales forecasting)
- [ ] Benchmark comparisons (YoY, MoM)
- [ ] Drill-down capabilities
- [ ] Anomaly detection alerts
- [ ] Report sharing and collaboration
- [ ] White-label reporting for franchise
- [ ] Mobile-optimized dashboards
- [ ] BI tool integration (Power BI, Tableau, Metabase)

---

### 2.28 Customer Support & AI Assistance

**ID:** FR-028  
**Priority:** High  
**Module:** Support

#### Description
Multi-channel customer support with AI-powered assistance.

#### Requirements

- **Customer Support:**
  - Ticketing system (create, track, resolve)
  - Ticket categories and priority levels
  - SLA management (response time, resolution time)
  - Ticket assignment and escalation rules
  - Knowledge base / FAQ section
  - Support history per customer

- **Online Support:**
  - Live chat support (real-time messaging)
  - Video call support
  - Screen sharing for troubleshooting
  - Chat transcript and history
  - Chat rating after session
  - Multi-language support

- **AI Assistance:**
  - AI-powered chatbot for common queries
  - Natural Language Processing (NLP) for intent detection
  - Automated FAQ responses
  - Product recommendations
  - Order status inquiries
  - Return/Exchange initiation via chatbot
  - Handoff to human agent for complex queries
  - Sentiment analysis for priority routing

- **Self-Service:**
  - Help center with searchable articles
  - Video tutorials
  - Interactive troubleshooting guides
  - Community forum

#### Enhancements
- [ ] AI-powered ticket auto-categorization and routing
- [ ] Predictive support (proactive issue detection)
- [ ] Voice bot support (IVR + AI)
- [ ] Multilingual AI chatbot
- [ ] Customer satisfaction (CSAT) surveys
- [ ] Net Promoter Score (NPS) tracking
- [ ] Support analytics dashboard
- [ ] Integration with CRM systems
- [ ] Social media support (Twitter, Instagram DMs)
- [ ] Omnichannel support (unified inbox)

---

### 2.29 Welcome Offer & Referral Program

**ID:** FR-029  
**Priority:** Medium  
**Module:** Growth & Engagement

#### Description
Customer acquisition and retention through welcome offers and referral programs.

#### Requirements

- **Welcome Offer:**
  - New user signup bonus (credits, discount coupon)
  - First order discount (percentage or flat)
  - Free delivery on first order
  - Free item/sample with first order
  - Welcome offer validity period
  - Welcome offer configuration per business type
  - One-time redemption enforcement

- **Invite & Earn (Referral Program):**
  - Unique referral code per user
  - Referral link generation (shareable)
  - Referrer reward (on successful referral)
  - Referee reward (new user incentive)
  - Multi-level referral (optional — MLM style)
  - Referral tracking and status
  - Minimum order requirement for reward activation
  - Reward types: Cash, Credits, Discount, Points, Free Items
  - Referral leaderboard

- **Sharing Options:**
  - WhatsApp share
  - SMS share
  - Email invite
  - Social media share (Facebook, Twitter, Instagram)
  - Copy link
  - QR code for referral

#### Enhancements
- [ ] Gamified referral milestones (refer 5 friends = bonus)
- [ ] Seasonal referral campaigns
- [ ] Referral analytics (top referrers, conversion rate)
- [ ] Corporate referral programs
- [ ] Influencer referral tracking
- [ ] Referral fraud detection
- [ ] Tiered referral rewards
- [ ] Referral wallet with withdrawal option

---

### 2.30 Re-Order

**ID:** FR-030  
**Priority:** High  
**Module:** Reorder

#### Description
Quick and convenient reorder functionality from previous orders.

#### Requirements

- **Reorder Options:**
  - One-click reorder (entire previous order)
  - Selective reorder (pick items from past order)
  - Reorder from order history
  - Reorder from "My Frequent Items"
  - Reorder with modifications (change quantity, add/remove items)

- **Reorder Features:**
  - Price change notification (if price changed since last order)
  - Availability check before reorder
  - Substitute suggestion for unavailable items
  - Apply current offers/discounts automatically
  - Reorder to same or different address
  - Reorder scheduling (weekly, monthly, custom)

- **Subscription / Auto-Reorder:**
  - Subscribe & Save (recurring orders)
  - Configurable frequency (daily, weekly, bi-weekly, monthly)
  - Auto-payment with saved method
  - Skip/Pause subscription option
  - Subscription management dashboard
  - Subscription discount

#### Enhancements
- [ ] AI-based reorder reminders (predict when item runs out)
- [ ] Smart basket (auto-generate based on purchase patterns)
- [ ] Reorder analytics (most reordered items)
- [ ] Bulk reorder for B2B customers
- [ ] Reorder templates (save custom baskets)
- [ ] Family/Group reorder sharing
- [ ] Reorder from multiple past orders (merge)
- [ ] Quick reorder widget on homepage

---

### 2.31 Restaurant Management System

**ID:** FR-031  
**Priority:** High  
**Module:** Restaurant Operations

#### Description
Specialized module configured for Food & Beverage businesses handling in-house dining operations and online orders.

#### Requirements

- **Order Routing (3-Ways of Ordering):**
  - **Dine In:** Associated with specific Tables, serviced by Waiters.
  - **Take Away:** Quick-billing queue, generic customer name matching.
  - **Online Order:** Funneled into prep-queue, associated with delivery providers.

- **Dine-In Workflows:**
  - Table Master (setup layouts, zones/floors, capacities).
  - Waiter Master (link generic users/logins to waiter assignments).
  - Customer-Lead Ordering via QR code scanned at table (adds directly to Open Table tab).
  - Waiter-Lead Ordering (waiter utilizes tablet application to place/modify tab on behalf of customers).

- **Kitchen Operations:**
  - Kitchen Display System (KDS) for kitchen staff.
  - Auto-routing of Food items to Kitchen KDS, Beverage items to Bar KDS.
  - Prep-time tracking, mark as "Ready", auto-alerting back to Waiter/Customer frontend.

---

### 2.32 Multi-Tenant Marketplace & Logistics

**ID:** FR-032  
**Priority:** High  
**Module:** Marketplace & Delivery

#### Description
Facilitates advanced online e-commerce operations involving multi-store discoveries and third-party delivery handling.

#### Requirements

- **Marketplace Cart & Discovery:**
  - Store-level configuration toggles: Search only within *One Shop* vs. Discover products across *Selected Affiliates* vs. Search *All Platform Shops*.
  - **Split Cart Setup:** If a customer adds items from different shops to a single cart, checkout generates categorized, segregated child-orders to correctly route provider payouts and distinct deliveries.

- **Delivery Configuration:**
  - Define authorized Delivery Companies/Agencies.
  - Define individual Delivery Person masters assigned to orders.
  - Customizable platform listing charges, third-party delivery dispatch rates, and transit tax.

- **Data Privacy (Masking):**
  - Customer identity protection. Direct phone numbers or home addresses are restricted or masked.
  - The delivery person can only communicate/call the customer via proxy tunnels strictly enclosed inside the Delivery App.

---

### 2.33 Procurement & Supplier Management

**ID:** FR-033  
**Priority:** High  
**Module:** Procurement

#### Description
Complete procurement lifecycle management including supplier/manufacturer master, purchase orders, goods receipt, and supplier relationship tracking. A supplier or manufacturer may also be a customer — the system handles dual-role party relationships with net settlement.

#### Requirements

- **Supplier / Manufacturer Master:**
  - Party Name (Individual / Organization)
  - Party Type: Supplier, Manufacturer, or Both
  - Dual-Role Flag — mark if the party is also a Customer (FR-002)
  - Contact Person, Phone, Email
  - GSTIN, PAN, TAN
  - Bank Account details for payments
  - Credit Limit and Payment Terms (Net 15, Net 30, Net 60, Custom)
  - Multiple addresses (Billing, Shipping, Factory/Warehouse)
  - Category / Product line tagging (what items they supply)
  - Lead time (average days for delivery)
  - Rating / Performance score (auto-calculated from history)
  - Active / Inactive toggle with soft delete
  - KYC document upload (License, Registration, Certificates)

- **Purchase Order (PO):**
  - Create PO from Reorder Level (ROL) auto-trigger or manual
  - PO number (auto-generated, sequential with prefix)
  - Select supplier from master
  - Add items with quantity, rate, discount, tax (GST)
  - PO total with tax breakdown
  - Expected delivery date
  - PO approval workflow (configurable: auto-approve below threshold, manual above)
  - PO status: Draft → Sent → Acknowledged → Partially Received → Fully Received → Closed / Cancelled
  - PO PDF generation and email/WhatsApp send to supplier
  - Amendment/Revision trail for PO changes
  - Repeat PO from previous orders

- **Goods Received Note (GRN):**
  - Receive against a PO (partial or full)
  - Quantity received vs. ordered comparison
  - Quality check workflow (Accept / Reject / Partial Reject)
  - Batch and Expiry date capture on receipt
  - Auto-update stock on GRN approval
  - Discrepancy reporting (short supply, excess supply, quality issues)
  - GRN linked to supplier invoice for reconciliation

- **Supplier Invoice & Payment:**
  - Record supplier invoices against GRN
  - Match PO → GRN → Invoice (3-way matching)
  - Payment scheduling (due date tracking)
  - Advance payment to suppliers
  - Debit note / Credit note management

#### Enhancements
- [ ] Supplier portal (self-service PO acknowledgment, invoice upload)
- [ ] RFQ (Request for Quotation) workflow
- [ ] Supplier comparison on price, lead time, quality score
- [ ] Multi-supplier sourcing for same item
- [ ] Consignment stock management
- [ ] Import/Export documentation for international suppliers
- [ ] Supplier SLA tracking with alerts
- [ ] Bulk PO generation for multiple items/suppliers

#### Shop-Level Configuration
- **Procurement Required:** All stock-in must be linked to a Purchase Order and GRN. No ad-hoc stock additions allowed.
- **Flexible Stock-In:** Stock can be added manually without a PO (for small shops that buy cash-and-carry).

---

### 2.34 Accounts & Ledger — Party Settlement

**ID:** FR-034  
**Priority:** High  
**Module:** Accounts

#### Description
Track advance payments, pending payments, and net settlement between the company and its parties (suppliers, manufacturers, customers). A party may be both a supplier and customer — the system calculates the net amount owed in either direction.

#### Requirements

- **Party Ledger:**
  - Unified ledger per party (tracks all purchase and sales transactions)
  - Debit entries: purchases from them, advance given to them
  - Credit entries: sales to them, payments received from them
  - Running balance per party (who owes whom and how much)
  - Filter by date range, transaction type, branch

- **Advance Payments:**
  - Record advance payment given to suppliers
  - Record advance payment received from customers
  - Advance adjustment against future invoices (auto or manual)
  - Advance aging report (unadjusted advances by period)

- **Pending Payments:**
  - Payable: amounts the company owes to suppliers/manufacturers
  - Receivable: amounts customers/parties owe to the company
  - Aging analysis: 0–30 days, 31–60 days, 61–90 days, 90+ days
  - Due date alerts via email/SMS/push notification
  - Payment reminder automation (configurable intervals)

- **Net Settlement (Dual-Role Parties):**
  - When a party is both a supplier and customer: calculate net amount
  - Settlement report: total purchased from party vs. total sold to party
  - Net balance: "We owe them ₹X" or "They owe us ₹X"
  - Settlement approval workflow before finalizing
  - Settlement statement PDF generation (send to party for confirmation)

- **Reports & Charts:**
  - "Who Owes Us" report — all parties with receivable balances, sorted by amount
  - "Whom We Owe" report — all parties with payable balances, sorted by amount
  - Cash flow summary (inflow vs. outflow by period)
  - Party-wise profit/loss summary (for dual-role parties)
  - Dashboard chart: Top 10 receivables, Top 10 payables
  - Dashboard chart: Aging summary (pie chart by bucket)

#### Enhancements
- [ ] Automated payment reminders via WhatsApp
- [ ] Interest calculation on overdue payments
- [ ] Credit scoring for parties based on payment history
- [ ] Integration with accounting software (Tally, QuickBooks)
- [ ] Bank reconciliation (match payments with bank statement)
- [ ] Multi-currency ledger support
- [ ] Party statement sharing via email/WhatsApp
- [ ] Bulk payment processing

---

### 2.35 Bill Sharing (WhatsApp, Email & SMS)

**ID:** FR-035  
**Priority:** High  
**Module:** Bill Distribution

#### Description
Automatically share invoices and bills to relevant stakeholders (product owner, company, and buyer) via WhatsApp, email, or SMS based on configuration.

#### Requirements

- **Bill Sharing Channels:**
  - WhatsApp (via WhatsApp Business API)
  - Email (with PDF invoice attachment)
  - SMS (with short link to view/download invoice)

- **Recipients (Configurable per bill type):**
  - Buyer / Customer
  - Company owner / Admin
  - Branch manager
  - Product owner (for marketplace/multi-vendor)
  - Supplier (for purchase-related bills)
  - Accountant

- **Sharing Triggers:**
  - Auto-share on bill generation (configurable ON/OFF)
  - Auto-share on payment completion
  - Manual share (ad-hoc from order/invoice screen)
  - Bulk share (for pending/past invoices)

- **Sharing Configuration:**
  - Per-company toggle: Enable/Disable per channel (WhatsApp, Email, SMS)
  - Per-recipient toggle: Which recipient gets which channel
  - Per-bill-type toggle: Sales invoice, Purchase order, Credit note, Delivery challan
  - Template customization per channel
  - Schedule: Immediate or batched (end-of-day summary)

- **WhatsApp Business API Integration:**
  - Template message approval (per Meta/WhatsApp guidelines)
  - Rich media: PDF attachment, order summary card
  - Interactive buttons: "View Invoice", "Pay Now", "Download PDF"
  - Delivery status tracking (sent, delivered, read)
  - Rate limiting compliance

#### Enhancements
- [ ] Multi-language bill sharing (auto-detect recipient language)
- [ ] Digital signature verification link in shared bills
- [ ] Scheduled bill sharing (daily/weekly summary)
- [ ] Bulk invoice sharing for B2B clients
- [ ] WhatsApp chatbot for bill queries ("Send me last month's invoices")
- [ ] Delivery confirmation via WhatsApp reply

---

### 2.36 Data Import & Export

**ID:** FR-036  
**Priority:** High  
**Module:** Data Management

#### Description
Comprehensive import and export functionality for all master data and transactional data including orders, with AI-powered import from handwritten notes.

#### Requirements

- **Master Data Import/Export:**
  - All masters: Categories, Sub-Categories, Types, Brands, Packing Sizes, UOM, Tax Rates
  - Products / Items (with images as ZIP)
  - Customers / Clients
  - Suppliers / Manufacturers
  - Inventory / Stock (opening balances)
  - Locations / Warehouses
  - Payment Modes
  - Charges

- **Transactional Data Import/Export:**
  - Orders (sales orders, purchase orders)
  - Invoices
  - Payments
  - Stock movements
  - Returns & Exchanges

- **Import Features:**
  - Supported formats: CSV, Excel (.xlsx), JSON
  - Template download for each entity (pre-formatted with required columns and sample data)
  - Column mapping wizard (match uploaded columns to system fields)
  - Validation and error reporting (row-level errors with fix suggestions)
  - Preview before import (show first 10 rows)
  - Dry run mode (validate without actually importing)
  - Duplicate detection and handling (skip, overwrite, merge)
  - Bulk import with progress indicator
  - Import history and rollback (undo last import)

- **Export Features:**
  - Supported formats: CSV, Excel (.xlsx), PDF, JSON
  - Filter-based export (export only matching records)
  - Column selection (choose which fields to export)
  - Scheduled export (daily/weekly to email or S3)
  - API-based export for integrations

- **AI-Powered Import from Handwritten Notes (FR-036a):**
  - Upload photo of handwritten order note / purchase list
  - AI (OCR + NLP) extracts: item names, quantities, prices, units
  - Fuzzy matching to existing product master (suggest closest matches)
  - Review and confirm screen before import
  - Support for multiple languages and handwriting styles
  - Confidence score per extracted field (highlight low-confidence items for manual review)
  - Batch processing (upload multiple note images at once)

#### Enhancements
- [ ] Google Sheets / Excel Online live sync
- [ ] ERP data import adapters (Tally, SAP, QuickBooks format)
- [ ] Automated periodic import from FTP/SFTP
- [ ] Data migration wizard (from competing billing software)
- [ ] Import approval workflow for sensitive data
- [ ] Export watermarking (company name, "Confidential" stamp)

---

### 2.37 AI & Intelligence Suite

**ID:** FR-037  
**Priority:** High  
**Module:** AI & Intelligence

#### Description
AI-powered features across the platform covering OCR import, RAG-based user assistance, product intelligence, predictive analytics, personalized recommendations, and automated customer support. All AI features are configurable — each feature can be toggled ON/OFF per company from the settings screen.

#### Requirements

- **AI-Powered Order Import from Handwritten Notes (FR-037a):**
  - OCR engine for handwritten note recognition (photo → structured data)
  - NLP pipeline: extract item names, quantities, prices, units of measurement
  - Fuzzy match extracted items to product master
  - Multi-language handwriting support (English, Hindi, Tamil, Telugu, etc.)
  - Confidence scoring per field — highlight uncertain matches for human review
  - Learning from corrections (improve accuracy over time per tenant)

- **RAG-Based User Assistance (FR-037b):**
  - Retrieval-Augmented Generation chatbot for user queries
  - Knowledge base: product catalog, help articles, company policies, FAQs
  - Vector embeddings stored in pgvector (PostgreSQL extension)
  - Context-aware responses using company-specific data
  - Multi-turn conversation support
  - Citation of sources in responses (link to relevant help article or product)
  - Fallback to human agent when confidence is low
  - Admin panel to manage knowledge base documents

- **Product Summary & Review Intelligence (FR-037c):**
  - AI-generated product summary from seller descriptions and specifications
  - Review sentiment analysis (Positive / Neutral / Negative with breakdown)
  - Auto-generated review highlights ("Customers love the durability", "Common complaint: packaging")
  - Star rating prediction from review text
  - Fake review detection and flagging
  - Competitive product comparison summaries

- **Predictive Analytics & Forecasting (FR-037d):**
  - Sales forecasting: predict daily/weekly/monthly revenue for future dates
  - Item-level demand forecasting: predict quantity sold per item per time period
  - Seasonal trend detection and peak period alerts
  - Stock-out prediction (which items will run out and when)
  - Customer churn prediction (identify at-risk customers)
  - Optimal pricing suggestions based on demand elasticity
  - Dashboard widgets: forecast charts, trend indicators, anomaly alerts

- **Personalized Item Suggestions (FR-037e):**
  - Search-based recommendations: "Customers who searched for X also bought Y"
  - Cart-based recommendations: "Frequently bought together"
  - Browsing history-based suggestions
  - Collaborative filtering (similar customers' purchase patterns)
  - Content-based filtering (similar product attributes)
  - Trending items within the category / location
  - Personalized homepage feed per customer

- **Regular Order / Purchase Suggestions (FR-037f):**
  - Predict reorder timing based on purchase frequency
  - "You usually buy X every 2 weeks — would you like to reorder?"
  - Smart basket generation (auto-suggest repeat items)
  - Subscription recommendations for frequently purchased items
  - Stock replenishment suggestions for shop owners (based on sales velocity)
  - Purchase order suggestions for suppliers (based on stock + forecast)

- **AI-Powered First-Level Customer Support (FR-037g):**
  - Intent classification for incoming support queries
  - Automated responses for common issues (order status, return initiation, payment help)
  - Ticket auto-categorization and priority assignment
  - Sentiment analysis for priority routing (angry customers → escalate)
  - Suggested replies for human agents (agent co-pilot)
  - Resolution time prediction
  - Post-resolution satisfaction prediction

- **Other AI Application Areas (FR-037h):**
  - **Invoice OCR:** Extract data from vendor invoices (scan to structured entry)
  - **Smart Search:** Natural language search ("show me all electronics under 5000 that are in stock")
  - **Dynamic Pricing:** AI-suggested prices based on demand, competition, and stock levels
  - **Fraud Detection:** Unusual order patterns, suspicious account activity, payment fraud scoring
  - **Image Recognition:** Auto-tag product images with categories and attributes
  - **Demand-Based Delivery Slots:** Optimize delivery slot availability based on predicted order volumes
  - **Inventory Anomaly Detection:** Flag unexpected stock discrepancies
  - **Cashflow Forecasting:** Predict future cash position based on receivables, payables, and seasonal trends
  - **Supplier Risk Scoring:** Assess supplier reliability based on delivery history and market signals
  - **Menu Optimization (Restaurant):** Suggest menu changes based on sales data, food cost, and customer preferences

#### Configuration
- **Master AI Toggle:** Global ON/OFF switch for all AI features per company
- **Feature-Level Toggles:** Individual ON/OFF switch for each AI feature (FR-037a through FR-037h)
- **Data Consent:** Explicit opt-in for sharing data with AI models
- **AI Provider Selection:** Choose between providers (OpenAI, Azure OpenAI, self-hosted LLM)
- **Confidence Thresholds:** Configure minimum confidence score for automated actions (default: 80%)

#### Enhancements
- [ ] Custom model fine-tuning per tenant (using their own data)
- [ ] Multi-language AI support
- [ ] AI usage analytics dashboard (query volume, accuracy, cost)
- [ ] A/B testing for AI recommendations
- [ ] AI cost management (token usage tracking, budget limits)
- [ ] On-premise AI option (for data-sensitive businesses)
- [ ] AI model versioning and rollback

---

## 3. Non-Functional Requirements

### 3.1 Security & Access (Roles & Logins)

The system manages 9 primary explicit roles (customizable via RBAC):

1. **Online Customers**: Platform-wide buyers.
2. **Admin Users**: Global system administrators / Platform owners.
3. **Support Users**: Helpdesk workers and customer dispute handlers.
4. **Shop Owners (Providers)**: Master tenants controlling individual stores/business metrics.
5. **Inventory Staff**: Employees authorized only for stock adjustments and receiving.
6. **Kitchen Staff**: Specialized access to the Restaurant KDS interfaces.
7. **Waiter Users**: Employees managing table orders and floor layouts.
8. **Delivery Head / Company**: Overlords of logistics who review fleet performance and payouts.
9. **Delivery Drivers**: Logistics fleet users fulfilling active runs and map routing.

*Authentication requires Passwordless OTP (Email/SMS) + Role-dependent 2FA parameters.*

### 3.2 Performance
- Page load time: < 2 seconds
- API response time: < 500ms (95th percentile)
- Support 10,000+ concurrent users
- Database query optimization with indexing
- CDN for static assets
- Caching strategy (Redis/Memcached)

### 3.3 Scalability
- Horizontal scaling with load balancers
- Microservices architecture
- Database sharding for high-volume data
- Auto-scaling based on traffic patterns
- Multi-region deployment support

### 3.4 Advanced Security & Encryption
- **End-to-End Encryption (E2EE):** Business-critical and customer PII data must be deeply protected. Data should be encrypted at rest utilizing robust Key Management Systems (KMS) and securely routed via TLS 1.3 in transit. Strict obfuscation measures mask sensitive details from internal delivery drivers.
- **Authentication:** Purely passwordless (OTP/Magic Links), meaning brute-forcing password digests is completely neutralized by design. Rate-limited and CAPTCHA protected.
- OWASP Top 10 compliance
- Role-Based Access Control (RBAC) securely locked by JSON Web Tokens (JWT) with rigorous invalidation schemas.
- SQL injection, CSRF and XSS prevention
- Regular security audits and penetration testing
- GDPR / Data Privacy compliance (opt-out, export functionality)
- PCI DSS Level 1 compliance for all payment handling (No PAN numbers stored internally)
- Session management strictly managed via secure cookies and Redis-enforced access blocking.

### 3.5 Availability & Reliability
- 99.9% uptime SLA
- Disaster recovery plan with RTO < 4 hours, RPO < 1 hour
- Automated backups (daily full, hourly incremental)
- Health monitoring and alerting
- Graceful degradation under load
- Circuit breaker pattern for external service failures

### 3.5 Compatibility
- **Web:** Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile:** iOS 14+, Android 10+
- **Responsive:** Desktop, Tablet, Mobile
- **Accessibility:** WCAG 2.1 Level AA compliance
- **Internationalization:** Multi-language, Multi-currency, RTL support

### 3.6 Integration
- RESTful API with OpenAPI/Swagger documentation
- Webhook support for real-time events
- OAuth 2.0 for third-party integrations
- ERP integration (Tally, SAP, QuickBooks)
- Accounting software integration
- Shipping partner API integration
- Social media platform integration
- Google Analytics / Mixpanel integration

---

## 4. Technical Architecture (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Web App  │  │ iOS App  │  │ Android  │  │ POS Terminal │   │
│  │ (React/  │  │ (Swift/  │  │ (Kotlin/ │  │ (Electron/   │   │
│  │  Next.js)│  │ Flutter) │  │ Flutter) │  │  Desktop)    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
��                      API GATEWAY                                 │
│              (Kong / AWS API Gateway / Nginx)                    │
│         Rate Limiting | Auth | Load Balancing                    │
└─────────────────────────┬────────��──────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                   MICROSERVICES LAYER                             │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  Auth  │ │ Product│ │  Order │ │Payment │ │ Notif  │       │
│  │Service │ │Service │ │Service │ │Service │ │Service │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │  Cart  │ │Discount│ │  Tax   │ │Delivery�� │ Report │       │
│  │Service │ │Service │ │ Engine │ │Service │ │Service │       │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│  │  User  │ │Inventor│ │ Review │ │Support │                   │
│  │Service │ │Service │ │Service │ │Service │                   │
│  └────────┘ └────────┘ └────────┘ └────────┘                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │PostgreSQL│  │  Redis   │  │Elastic   │  │  MongoDB     │   │
│  │(Primary) │  │ (Cache)  │  │Search    │  │ (Documents)  │   │
│  └──────────┘  └──────────┘  └─────────���┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ RabbitMQ │  │   S3     │  │ ClickHs  │                      │
│  │ (Queue)  │  │(Storage) │  │(Analytics│                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Configuration Matrix

The system should be configurable per business type. Below is the feature toggle matrix:

| Feature | Small Shop | Big Shop | Chain | Online Store | Restaurant | Hospital | School |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Multi-branch | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Online Orders | ❌ | Optional | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delivery | ❌ | Optional | ✅ | ✅ | ✅ | ❌ | ❌ |
| Inventory | Basic | Full | Full | Full | Basic | Full | Basic |
| Procurement | ❌ | Optional | ✅ | ✅ | Optional | ✅ | ❌ |
| Accounts/Ledger | Basic | Full | Full | Full | Basic | Full | Basic |
| GST/Tax | Basic | Full | Full | Full | Full | Full | Basic |
| Payment Gateway | ❌ | Optional | ✅ | ✅ | ✅ | ✅ | ✅ |
| Barcode/QR | ✅ | ✅ | ✅ | ✅ | Optional | ✅ | ❌ |
| Expiry Mgmt | Optional | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reviews | ❌ | Optional | ✅ | ✅ | ✅ | ✅ | ❌ |
| Push Notif | ❌ | Optional | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bill Sharing (WA) | Optional | ✅ | ✅ | ✅ | ✅ | ✅ | Optional |
| Import/Export | Basic | Full | Full | Full | Basic | Full | Basic |
| AI Assistance | ❌ | Optional | ✅ | ✅ | ✅ | ✅ | Optional |
| AI OCR Import | ❌ | Optional | ✅ | ✅ | ✅ | Optional | ❌ |
| AI Predictions | ❌ | Optional | ✅ | ✅ | ✅ | Optional | ❌ |
| Loyalty/Offers | Basic | Full | Full | Full | Full | Optional | ❌ |
| Dashboards | Basic | Full | Full | Full | Full | Full | Full |
| Service Providers | ❌ | ❌ | Optional | ✅ | ✅ | ❌ | ❌ |

---

## 6. Milestones & Phases

| Phase | Modules | Duration |
|---|---|---|
| **Phase 1 — MVP** | Company Setup, Item Master, Masters CRUD, Basic Billing, Invoice, GST Calculation, Import/Export (Masters) | 8-10 weeks |
| **Phase 2 — Core** | Inventory, Barcode/QR (Mobile Camera + External Scanner), Search, Cart, Discounts, Customer Auth, Procurement & Suppliers | 8-10 weeks |
| **Phase 3 — Payments** | Payment Gateway, Payment Options, Card Save, Returns/Exchange, Accounts & Ledger, Party Settlement | 6-8 weeks |
| **Phase 4 — Engagement** | Offers/Promotions, Reviews, Notifications (Email/SMS/Push), WhatsApp Bill Sharing, Order Import/Export | 6-8 weeks |
| **Phase 5 — Operations** | Service Provider Portal, Delivery Management, Charges, Block/Service Control | 6-8 weeks |
| **Phase 6 — Intelligence** | Dashboards, Reports, AI Suite (RAG, OCR Import, Predictions, Recommendations, AI Support), Customer Support | 8-10 weeks |
| **Phase 7 — Growth** | Welcome Offers, Referrals, Reorder, Subscriptions, Restaurant Module, Marketplace, Advanced AI | 6-8 weeks |

---

## 7. Glossary

| Term | Description |
|---|---|
| **GSTIN** | Goods and Services Tax Identification Number |
| **HSN** | Harmonized System of Nomenclature (product classification) |
| **SAC** | Services Accounting Code |
| **ROL** | Reorder Level |
| **FIFO** | First In, First Out |
| **FEFO** | First Expiry, First Out |
| **POS** | Point of Sale |
| **UOM** | Unit of Measurement |
| **SKU** | Stock Keeping Unit |
| **PO** | Purchase Order |
| **GRN** | Goods Received Note |
| **RAG** | Retrieval-Augmented Generation |
| **OCR** | Optical Character Recognition |
| **NLP** | Natural Language Processing |
| **LLM** | Large Language Model |
| **B**](#)
