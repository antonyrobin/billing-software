# 🏗️ Billing Software – Architecture & Technical Design Document

> **Version:** 1.0  
> **Date:** 2026-03-30  
> **Status:** Draft  
> **Author:** @antonyrobin  
> **Related:** [requirement.md](./ReadMe.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [System Architecture](#2-system-architecture)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Design](#5-database-design)
6. [Caching Strategy](#6-caching-strategy)
7. [Security Considerations](#7-security-considerations)
8. [API Design](#8-api-design)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Multi-Version Support Strategy](#10-multi-version-support-strategy)
11. [Performance Engineering](#11-performance-engineering)
12. [Scalability Plan](#12-scalability-plan)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [Disaster Recovery & Maintenance](#14-disaster-recovery--maintenance)
15. [Development Standards](#15-development-standards)
16. [Technology Stack Summary](#16-technology-stack-summary)

---

## 1. Architecture Overview

### 1.1 Architecture Principles

| Principle | Description |
|---|---|
| **Modularity** | Each business domain is an independent, deployable microservice |
| **Configurability** | Feature flags and tenant config drive behavior per business type |
| **Security First** | Zero-trust architecture; encryption everywhere; least privilege |
| **Performance** | Sub-second response times; aggressive caching; async processing |
| **Scalability** | Horizontal scaling; stateless services; event-driven communication |
| **Maintainability** | Clean code; comprehensive testing; automated pipelines |
| **Backward Compatibility** | API versioning; graceful deprecation; multi-version runtime support |

### 1.2 Architecture Style

We adopt a **Microservices Architecture** with **Event-Driven Communication** and **API Gateway** pattern, backed by **Domain-Driven Design (DDD)** principles.

```
┌─────────────────────────────────────────��───────────────────┐
│                    ARCHITECTURE OVERVIEW                      │
│                                                              │
│   Clients ──► API Gateway ──► Microservices ──► Data Stores │
│                    │                │                         │
│                    ▼                ▼                         │
│              Auth/Rate          Message Bus                   │
│              Limiting          (Event-Driven)                 │
│                                     │                        │
│                                     ▼                        │
│                              Background Workers              │
│                           (Notifications, Reports,           │
│                            Analytics, Sync)                  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 High-Level System Flow

```
                        ┌──────────────┐
                        │   CDN/Edge   │
                        │ (CloudFront/ │
                        │  Cloudflare) │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ Load Balancer│
                        │ (ALB/Nginx)  │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │  Web App    │ │  Mobile     │ │   POS       │
       │  (Next.js)  │ │  (Flutter)  │ │ (Electron)  │
       └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
              │                │                │
              └────────────────┼────────────────┘
                               │
                        ┌──────▼───────┐
                        │ API Gateway  │
                        │ (Kong/AWS)   │
                        │              │
                        │ • Auth       │
                        │ • Rate Limit │
                        │ • Versioning │
                        │ • SSL Term.  │
                        │ • Logging    │
                        └─────��┬───────┘
                               │
          ┌────────────────────┼─────────────────────┐
          │                    │                      │
    ┌─────▼─────┐       ┌─────▼─────┐         ┌─────▼─────┐
    │  Service   │       │  Service   │         │  Service   │
    │  Mesh      │◄─────►│  Mesh      │◄───────►│  Mesh      │
    │ (Istio)    │       │ (Istio)    │         │ (Istio)    │
    └─────┬─────┘       └─────┬─────┘         └─────┬─────┘
          │                    │                      │
    ┌─────▼─────┐       ┌─────▼─────┐         ┌─────▼─────┐
    │ Auth      │       │ Product   │         │ Order     │
    │ Service   │       │ Service   │         │ Service   │
    └───────────┘       └───────────┘         └───────────┘
          │                    │                      │
          └────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Message Broker    │
                    │  (RabbitMQ/Kafka)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
       │Notification │ │  Analytics  │ │   Sync      │
       │  Worker     │ │  Worker     │ │  Worker     │
       └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 2. System Architecture

### 2.1 Microservices Breakdown

Each microservice owns its data, exposes APIs, and communicates via REST (synchronous) or message bus (asynchronous).

| # | Service | Responsibilities | Database | Cache |
|---|---|---|---|---|
| 1 | **Auth Service** | User registration, login, JWT, OAuth, 2FA, session management | PostgreSQL | Redis |
| 2 | **Tenant Service** | Company/Shop profile, branch management, business configuration | PostgreSQL | Redis |
| 3 | **Product Service** | Item master, categories, brands, types, packing sizes, variants | PostgreSQL + Elasticsearch | Redis |
| 4 | **Inventory Service** | Stock management, locations, shelf/rack, batch, serial tracking | PostgreSQL | Redis |
| 5 | **Order Service** | Order lifecycle, cart, wishlist, order history | PostgreSQL | Redis |
| 6 | **Billing Service** | Invoice generation, receipts, credit/debit notes, PDF generation | PostgreSQL + S3 | Redis |
| 7 | **Payment Service** | Payment gateway integration, refunds, reconciliation | PostgreSQL | Redis |
| 8 | **Tax Service** | GST/VAT calculation, HSN mapping, tax reports | PostgreSQL | Redis |
| 9 | **Discount Service** | Discounts, coupons, offers, promotions engine | PostgreSQL | Redis |
| 10 | **Notification Service** | Email, SMS, Push, WhatsApp, in-app notifications | MongoDB | Redis |
| 11 | **Search Service** | Full-text search, barcode/QR lookup, filters | Elasticsearch | Redis |
| 12 | **Review Service** | Ratings, reviews, moderation | MongoDB | Redis |
| 13 | **Delivery Service** | Delivery management, slot booking, tracking | PostgreSQL | Redis |
| 14 | **Report Service** | Dashboards, analytics, report generation | ClickHouse + PostgreSQL | Redis |
| 15 | **Support Service** | Ticketing, live chat, AI chatbot | MongoDB | Redis |
| 16 | **User Service** | Customer profiles, addresses, preferences, loyalty | PostgreSQL | Redis |
| 17 | **Provider Service** | Service provider onboarding, approval, management | PostgreSQL | Redis |
| 18 | **File Service** | Image upload, barcode/QR generation, document storage | S3/MinIO | CDN |
| 19 | **Config Service** | Feature flags, business rules, dynamic configuration | PostgreSQL + etcd | Redis |
| 20 | **Gateway Service** | API routing, rate limiting, versioning, authentication | — | Redis |

### 2.2 Service Communication Patterns

```
┌─────────────────────────────────────────────────────────┐
│              COMMUNICATION PATTERNS                      │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │          SYNCHRONOUS (REST/gRPC)            │        │
│  │                                              │        │
│  │  Client ──► API Gateway ──► Service          │        │
│  │  Service A ──► Service B (via Service Mesh)  │        │
│  │                                              │        │
│  │  Use for: Real-time queries, CRUD operations │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌─────────────────────────────────────────────┐        │
│  │        ASYNCHRONOUS (Message Bus)           │        │
│  │                                              │        │
│  │  Service A ──► RabbitMQ/Kafka ──► Service B  │        │
│  │                                              │        │
│  │  Use for: Notifications, analytics,          │        │
│  │           background jobs, event propagation │        │
│  └─────────────────────────────────────────────┘        │
│                                                          │
│  ┌────────────────────────────���────────────────┐        │
│  │           EVENT SOURCING (Kafka)            │        │
│  │                                              │        │
│  │  Order Events ──► Event Store ──► Consumers  │        │
│  │                                              │        │
│  │  Use for: Order lifecycle, payment events,   │        │
│  │           audit trails, analytics            │        │
│  └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

#### Communication Matrix

| From → To | Pattern | Protocol | Use Case |
|---|---|---|---|
| Client → Gateway | Sync | HTTPS/REST | All client requests |
| Gateway → Services | Sync | HTTP/gRPC | Request routing |
| Order → Inventory | Sync | gRPC | Stock check/reservation |
| Order → Payment | Sync | REST | Payment initiation |
| Order → Notification | Async | RabbitMQ | Order status email/SMS |
| Payment → Order | Async | RabbitMQ | Payment confirmation |
| Product → Search | Async | Kafka | Index updates |
| Any → Report | Async | Kafka | Event streaming for analytics |
| Any → Audit | Async | Kafka | Audit log events |

### 2.3 Domain Event Flow

```
┌─────────┐     ┌─────────────┐     ┌──────────────────────┐
│  Order   │────►│ order.placed│────►│ Inventory Service    │
│ Service  │     │   (Event)   │     │ (Reserve Stock)      │
└─────────┘     └─────────────┘     └──────────────────────┘
                       │
                       ├────────────►┌──────────────────────┐
                       │             │ Notification Service  │
                       │             │ (Send Confirmation)   │
                       │             └──────────────────────┘
                       │
                       ├────────────►┌──────────────────────┐
                       │             │ Payment Service       │
                       │             │ (Initiate Payment)    │
                       │             └──────────────────────┘
                       │
                       └────────────►┌──────────────────────┐
                                     │ Report Service        │
                                     │ (Update Analytics)    │
                                     └──────────────────────┘
```

---

## 3. Frontend Architecture

### 3.1 Technology Choices

| Platform | Framework | Language | Justification |
|---|---|---|---|
| **Web App** | Next.js 15 (App Router) | TypeScript | SSR/SSG, SEO, performance, React ecosystem |
| **Admin Panel** | Next.js 15 | TypeScript | Shared codebase with web app |
| **Mobile App** | Flutter 3.x | Dart | Single codebase for iOS & Android, native performance |
| **POS Terminal** | Electron + React | TypeScript | Desktop app with offline support |
| **UI Components** | Shadcn/UI + Tailwind CSS | — | Accessible, customizable, consistent design system |

### 3.2 Frontend Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND ARCHITECTURE                    │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER                    │  │
│  │                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  Pages   │  │Components│  │   Layouts     │   │  │
│  │  │ (Routes) │  │(Reusable)│  │ (Shells)      │   │  │
│  │  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │  │
│  │       └──────���───────┼───────────────┘            │  │
│  └──────────────────────┼────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┼────────────────────────────┐  │
│  │              STATE MANAGEMENT LAYER                │  │
│  │                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  Zustand  │  │  React   │  │  TanStack    │   │  │
│  │  │ (Global   │  │  Query   │  │  Table       │   │  │
│  │  │  State)   │  │ (Server  │  │  (Data Grid) │   │  │
│  │  │          │  │  State)  │  │              │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └──────────────────────┼────────────────────────────┘  │
│                         │                                │
│  ┌──────────────────────┼────────────────────────────┐  │
│  │               SERVICE LAYER                        │  │
│  │                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  API     │  │  Auth    │  │  WebSocket   │   │  │
│  │  │  Client  │  │  Client  │  │  Client      │   │  │
│  │  │ (Axios)  │  │ (NextAuth│  │  (Socket.io) │   │  │
│  │  │          │  │  /Auth.js│  │              │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │               UTILITY LAYER                        │  │
│  │                                                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │  │
│  │  │  i18n    │  │  Feature  │  │  Analytics   │   │  │
│  │  │ (Multi-  │  │  Flags   │  │  (Mixpanel/  │   │  │
│  │  │ Language)│  │  Client  │  │   GA4)       │   │  │
│  │  └──────────┘  └──────────┘  └──────────────┘   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Frontend Project Structure (Next.js)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── admin/
│   │   ├── customer/
│   │   └── provider/
│   ├── (store)/                  # Store/Shop layout group
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── orders/
│   ├── api/                      # API routes (BFF pattern)
│   │   └── v1/
│   └── layout.tsx
│
├── components/                   # Reusable UI components
│   ├── ui/                       # Shadcn/UI primitives
│   ├── forms/                    # Form components
│   ├── tables/                   # Data tables
│   ├── charts/                   # Dashboard charts
│   ├── modals/                   # Dialog/Modal components
│   └── layout/                   # Layout components
│
├── lib/                          # Core utilities
│   ├── api/                      # API client & interceptors
│   ├── auth/                     # Authentication helpers
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Zustand stores
│   ├── utils/                    # Helper functions
│   ├── validators/               # Zod schemas
│   └── constants/                # App constants
│
├── features/                     # Feature modules
│   ├── products/                 # Product feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   └── types/
│   ├── orders/
│   ├── billing/
│   ├── inventory/
│   └── ...
│
├── styles/                       # Global styles
│   ├── globals.css
│   └── themes/
│
├── types/                        # TypeScript type definitions
├── config/                       # App configuration
└── middleware.ts                  # Next.js middleware
```

### 3.4 State Management Strategy

| State Type | Tool | Use Case |
|---|---|---|
| **Server State** | TanStack Query (React Query) | API data fetching, caching, background refetching |
| **Client State** | Zustand | Cart, UI state, user preferences, form drafts |
| **Form State** | React Hook Form + Zod | Form management with schema validation |
| **URL State** | Next.js searchParams | Filters, pagination, sort parameters |
| **Real-time State** | Socket.io + Zustand | Live order tracking, notifications, stock updates |

### 3.5 Design System

```
┌─────────────────────────────────────────────────┐
│               DESIGN SYSTEM                      │
│                                                  │
│  Foundation                                      │
│  ├── Colors (Primary, Secondary, Neutral, etc.)  │
│  ├── Typography (Font scales, weights)           │
│  ├── Spacing (4px grid system)                   │
│  ├── Shadows & Elevation                         │
│  ├── Border Radius tokens                        │
│  └── Breakpoints (sm, md, lg, xl, 2xl)          │
│                                                  │
│  Components (Shadcn/UI + Custom)                 │
│  ├── Atoms: Button, Input, Badge, Avatar, Icon   │
│  ├── Molecules: Card, Form Field, Search Bar     │
│  ├── Organisms: DataTable, Sidebar, Navbar       │
│  ├── Templates: Dashboard, Storefront, Checkout  │
│  └── Pages: Assembled from templates             │
│                                                  │
│  Theming                                         │
│  ├── Light / Dark mode                           │
│  ├── Per-tenant custom themes                    │
│  ├── CSS Variables for runtime theming           │
│  └── Tailwind CSS config extension               │
└─────────────────────────────────────────────────┘
```

### 3.6 Offline Support (POS / Mobile)

```
┌──────────────────────────────────���──────────────┐
│             OFFLINE ARCHITECTURE                 │
│                                                  │
│  ┌──────────────┐    ┌────────────────┐         │
│  │   Service    │    │   IndexedDB    │         │
│  │   Worker     │───►│   (Dexie.js)   │         │
│  │              │    │                │         │
│  │  • Cache API │    │ • Products DB  │         │
│  │  • Bg Sync   │    │ • Orders Queue │         │
│  │  • Push      │    │ • Cart State   │         │
│  └──────┬───────┘    └────────┬───────┘         │
│         │                     │                  │
│         └─────────┬───────────┘                  │
│                   │                              │
│            ┌──────▼───────┐                      │
│            │  Sync Engine │                      │
│            │              │                      │
│            │ • Conflict   │                      │
│            │   Resolution │                      │
│            │ • Queue Mgmt │                      │
│            │ • Retry Logic│                      │
│            └──────┬───────┘                      │
│                   │ (When Online)                │
│            ┌──────▼───────┐                      │
│            │  API Server  │                      │
│            └──────────────┘                      │
└─────────────────────────────────────────────────┘
```

---

## 4. Backend Architecture

### 4.1 Technology Choices

| Component | Technology | Justification |
|---|---|---|
| **Runtime** | Node.js 22 LTS | Non-blocking I/O, large ecosystem, TypeScript support |
| **Framework** | NestJS 11 | Enterprise-grade, modular, DI, decorators, OpenAPI |
| **Language** | TypeScript 5.x | Type safety, better DX, fewer runtime errors |
| **ORM** | Prisma 6 | Type-safe queries, migrations, multi-DB support |
| **Validation** | class-validator + class-transformer | DTO validation with decorators |
| **API Docs** | Swagger/OpenAPI 3.1 | Auto-generated interactive docs |
| **Testing** | Jest + Supertest | Unit, integration, e2e testing |
| **Task Queue** | BullMQ (Redis-backed) | Reliable background job processing |
| **Real-time** | Socket.io | WebSocket for live updates |

### 4.2 Backend Project Structure (NestJS - Per Service)

```
service-name/
├── src/
│   ├── main.ts                      # Bootstrap
│   ├── app.module.ts                # Root module
│   │
│   ├── config/                      # Configuration
│   │   ├── app.config.ts
│   │   ├── database.config.ts
│   │   ├── redis.config.ts
│   │   └── env.validation.ts
│   │
│   ├── common/                      # Shared utilities
│   │   ├── decorators/              # Custom decorators
│   │   ├── filters/                 # Exception filters
│   │   ├── guards/                  # Auth guards
│   │   ├── interceptors/            # Response/Logging interceptors
│   │   ├── middlewares/             # Request middlewares
│   │   ├── pipes/                   # Validation pipes
│   │   ├── dto/                     # Shared DTOs
│   │   └── interfaces/             # Shared interfaces
│   │
│   ├── modules/                     # Feature modules
│   │   ├── product/
│   │   │   ├── product.module.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── product.service.ts
│   │   │   ├── product.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-product.dto.ts
│   │   │   │   ├── update-product.dto.ts
│   │   │   │   └── product-query.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── product.entity.ts
│   │   │   ├── events/
│   │   │   │   ├── product-created.event.ts
│   │   │   │   └── product-updated.event.ts
│   │   │   └── __tests__/
│   │   │       ├── product.controller.spec.ts
│   │   │       └── product.service.spec.ts
│   │   └── .../
│   │
│   ├── database/                    # Database
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── seeds/
│   │
│   └── health/                      # Health checks
│       └── health.controller.ts
│
├── test/                            # E2E tests
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── docker/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── docker-compose.yml
│
├── .env.example
├── nest-cli.json
├── tsconfig.json
├── tsconfig.build.json
└── package.json
```

### 4.3 Request Lifecycle Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    REQUEST LIFECYCLE                               │
│                                                                   │
│  Client Request                                                   │
│       │                                                           │
│       ▼                                                           │
│  ┌─────────────┐                                                  │
│  │ API Gateway  │  • SSL Termination                              │
│  │              │  • Rate Limiting (100 req/min per IP)            │
│  │              │  • API Key Validation                            │
│  │              │  • Request ID Generation (UUID v7)               │
│  │              │  • Version Routing (/v1/*, /v2/*)                │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Middleware   │  • Correlation ID propagation                    │
│  │              │  • Request logging (structured JSON)             │
│  │              │  • Compression (gzip/brotli)                     │
│  │              │  • CORS validation                               │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Auth Guard   │  • JWT verification (RS256)                     │
│  │              │  • Token refresh handling                        │
│  │              │  • Permission check (RBAC)                       │
│  │              │  • Tenant context extraction                     │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Validation   │  • DTO validation (class-validator)             │
│  │ Pipe         │  • Input sanitization (XSS prevention)          │
│  │              │  • Schema validation (Zod / Joi)                 │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Controller   │  • Route handling                               │
│  │              │  • Request decomposition                         │
│  │              │  • Response formatting                           │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌���────────────┐                                                  │
│  │ Service      │  • Business logic                               │
│  │              │  • Transaction management                        │
│  │              │  • Event emission                                │
│  │              │  • Cache check → DB fallback                     │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Repository   │  • Data access (Prisma ORM)                     │
│  │              │  • Query optimization                            │
│  │              │  • Soft delete handling                          │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Interceptor  │  • Response transformation                      │
│  │              │  • Cache-Control headers                         │
│  │              │  • Response time logging                         │
│  │              │  • Serialization (class-transformer)             │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │ Exception    │  • Error formatting (RFC 7807)                  │
│  │ Filter       │  • Error logging (with stack trace)             │
│  │              │  • Client-safe error messages                    │
│  │              │  ��� Error tracking (Sentry)                       │
│  └──────┬──────┘                                                  │
│         │                                                         │
│         ▼                                                         │
│  Client Response (JSON)                                           │
└──────────────────────────────────────────────────────────────────┘
```

### 4.4 Authentication & Authorization Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTH FLOW                                   │
│                                                               │
│  ┌─��───────┐     ┌──────────┐     ┌──────────────────┐      │
│  │ Client  │────►│  Login   │────►│  Auth Service    │      │
│  │         │     │  Request │     │                  │      │
│  └─────────┘     └──────────┘     │  1. Validate     │      │
│                                    │     credentials  │      │
│                                    │  2. Check 2FA    │      │
│                                    │  3. Generate     │      │
│                                    │     tokens       │      │
│                                    └────────┬─────────┘      │
│                                             │                │
│                                    ┌────────▼─────────┐      │
│                                    │  Token Pair      │      │
│                                    │                  │      │
│                                    │  Access Token:   │      │
│                                    │  • JWT (RS256)   │      │
│                                    │  • 15 min expiry │      │
│                                    │  • Contains:     │      │
│                                    │    - userId      │      │
│                                    │    - tenantId    │      │
│                                    │    - roles[]     │      │
│                                    │    - permissions │      │
│                                    │                  │      │
│                                    │  Refresh Token:  │      │
│                                    │  • Opaque token  │      │
│                                    │  • 7 day expiry  │      │
│                                    │  • Stored in     │      │
│                                    │    HttpOnly      │      │
│                                    │    Secure Cookie │      │
│                                    └──────────────────┘      │
│                                                               │
│  RBAC (Role-Based Access Control)                            │
│  ┌───────────────────────────────────────────────────┐       │
│  │  Super Admin ──► Admin ──► Manager ──► Staff      │       │
│  │       │              │          │          │       │       │
│  │   All Access    Tenant      Branch     Limited    │       │
│  │                 Admin       Access     Access     │       │
│  │                                                    │       │
│  │  Customer ──► Guest                               │       │
│  │  Service Provider ──► Delivery Partner             │       │
│  └───────────────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Database Design

### 5.1 Database Strategy

| Database | Purpose | Justification |
|---|---|---|
| **PostgreSQL 16** | Primary relational data (users, products, orders, inventory, billing) | ACID compliance, JSON support, full-text search, partitioning, mature ecosystem |
| **MongoDB 7** | Unstructured/semi-structured data (notifications, logs, reviews, chat, activity) | Flexible schema, horizontal scaling, document model |
| **Redis 7 (Cluster)** | Caching, sessions, rate limiting, real-time counters, pub/sub | In-memory speed, data structures, Lua scripting |
| **Elasticsearch 8** | Full-text search, product search, log aggregation | Inverted index, relevance scoring, faceted search |
| **ClickHouse** | Analytics, reports, time-series data, dashboards | Columnar storage, fast aggregations, SQL support |
| **S3/MinIO** | File storage (images, PDFs, documents, backups) | Object storage, versioning, lifecycle policies |

### 5.2 Database Schema Overview (Key Tables)

```
┌──────────────────────────────────────────────────────────────────┐
│                    CORE SCHEMA RELATIONSHIPS                      │
│                                                                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐             │
│  │ tenants  │────►│ branches │────►│   users      │             │
│  │          │     │          │     │              │             │
│  │ id       │     │ id       │     │ id           │             │
│  │ name     │     │ tenant_id│     │ tenant_id    │             │
│  │ gstin    │     │ name     │     │ email        │             │
│  │ config   │     │ address  │     │ role         │             │
│  └──────────┘     └──────────┘     └──────┬───────┘             │
│                                           │                      │
│  ┌────────���─┐     ┌──────────┐     ┌──────▼───────┐             │
│  │categories│────►│ products │────►│   orders     │             │
│  │          │     │          │     │              │             │
│  │ id       │     │ id       │     │ id           │             │
│  │ name     │     │ sku      │     │ user_id      │             │
│  │ parent_id│     │ category │     │ total        │             │
│  └──────────┘     │ brand_id │     │ status       │             │
│                   │ price    │     │ payment_id   │             │
│  ┌──────────┐     │ hsn_code │     └──────┬───────┘             │
│  │  brands  │────►│ gst_rate │            │                      │
│  │          │     └────┬─────┘     ┌──────▼───────┐             │
│  │ id       │          │           │ order_items  │             │
│  │ name     │     ┌────▼─────┐     │              │             │
│  └──────────┘     │inventory │     │ id           │             │
│                   │          │     │ order_id     │             │
│                   │ id       │     │ product_id   │             │
│                   │ product  │     │ quantity     │             │
│                   │ location │     │ price        │             │
│                   │ quantity │     │ discount     │             │
│                   │ batch    │     │ tax          │             │
│                   │ expiry   │     └──────────────┘             │
│                   └──────────┘                                   │
│                                                                   │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐             │
│  │ payments │     │ invoices │     │  addresses   │             │
│  │          │     │          │     │              │             │
│  │ id       │     │ id       │     │ id           │             │
│  │ order_id │     │ order_id │     │ user_id      │             │
│  │ gateway  │     │ number   │     │ type         │             │
│  │ method   │     │ pdf_url  │     │ is_default   │             │
│  │ status   │     │ gst_data │     │ geo_coords   │             │
│  │ amount   │     │          │     │              │             │
│  └──────────���     └──────────┘     └──────────────┘             │
└──────────────────────────────────────────────────────────────────┘
```

### 5.3 Multi-Tenancy Strategy

We use **Schema-per-Tenant** for data isolation with a **Shared Database** approach for cost efficiency.

```
┌───────────────────────────────────────────────────┐
│              MULTI-TENANCY MODEL                   │
│                                                    │
│  ┌─────────────────────────────────────────────┐  │
│  │          PostgreSQL Instance                 │  │
│  │                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │   public    │  │  tenant_001 │          │  │
│  │  │   schema    │  │   schema    │          │  │
│  │  │             │  │             │          │  │
│  │  │ • tenants   │  │ • products  │          │  │
│  │  │ • plans     │  │ • orders    │          │  │
│  │  │ • configs   │  │ • inventory │          │  │
│  │  │ • users     │  │ • invoices  │          │  │
│  │  │   (global)  │  │ • ...       │          │  │
│  │  └─────────────┘  └─────────────┘          │  │
│  │                                              │  │
│  │  ┌─────────────┐  ┌─────────────┐          │  │
│  │  │  tenant_002 │  │  tenant_003 │          │  │
│  │  │   schema    │  │   schema    │          │  │
│  │  │             │  │             │          │  │
│  │  │ • products  │  │ • products  │          │  │
│  │  │ • orders    │  │ • orders    │          │  │
│  │  │ • ...       │  │ • ...       │          │  │
│  │  └─────────────┘  └─────────────┘          │  │
│  └─────────────────────────────────────────────┘  │
│                                                    │
│  Routing: JWT → tenantId → SET search_path         │
│  Isolation: Row-Level Security (RLS) as backup     │
│  Migration: Per-schema migration with versioning   │
└───────────────���───────────────────────────────────┘
```

### 5.4 Database Performance Optimizations

| Optimization | Implementation |
|---|---|
| **Indexing** | B-tree indexes on PKs, FKs, frequently queried columns; GIN indexes for JSONB and full-text; Partial indexes for active records |
| **Partitioning** | Range partition orders/invoices by `created_at` (monthly); List partition by `tenant_id` for large tables |
| **Connection Pooling** | PgBouncer (transaction-level pooling); Pool size: 20 per service, max 200 total |
| **Read Replicas** | 2 read replicas for report queries; Application-level read/write splitting |
| **Query Optimization** | Prepared statements; Cursor-based pagination (no OFFSET); SELECT only needed columns |
| **Vacuum & Maintenance** | Auto-vacuum tuned per table; Regular ANALYZE for query planner; pg_stat_statements monitoring |

### 5.5 Database Migration Strategy

```
┌──────────────────────────────────────────────────────┐
│              MIGRATION WORKFLOW                        │
│                                                       │
│  Developer                                            │
│  ├── 1. Create migration file                         │
│  │      $ prisma migrate dev --name add_discount_col  │
│  │                                                    │
│  ├── 2. Review generated SQL                          │
│  │      migrations/20260330_add_discount_col/          │
│  │      └── migration.sql                             │
│  │                                                    │
│  ├── 3. Test on local + staging                       │
│  │                                                    │
│  └── 4. PR Review → Merge → Auto-deploy               │
│                                                       │
│  CI/CD Pipeline                                       │
│  ├── Run: prisma migrate deploy (non-interactive)     │
│  ├── Backward compatible migrations only              │
│  ├── Additive changes (new columns, tables)           │
│  ├── Never drop columns in same release               │
│  └── 2-phase migration for breaking changes:          │
│       Phase 1: Add new column + write to both         │
│       Phase 2: Backfill + remove old column           │
└──────────────────────────────────────────────────────┘
```

---

## 6. Caching Strategy

### 6.1 Cache Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    CACHING LAYERS                              │
│                                                               │
│  Layer 1: BROWSER CACHE                                      │
│  ┌─────────────────────────────────────────────────┐         │
│  │  • Static assets: Cache-Control: max-age=31536000         │
│  │  • API responses: Cache-Control: max-age=60               │
│  │  • ETag / Last-Modified headers                           │
│  │  • Service Worker cache (offline-first)                   │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  Layer 2: CDN CACHE (CloudFront / Cloudflare)                │
│  ┌─────────────────────────────────────────────────┐         │
│  │  • Static assets (JS, CSS, Images) → 1 year TTL          │
│  │  • Product images → 7 day TTL with purge                 │
│  │  • API responses → Vary by Authorization header           │
│  │  • Edge caching for public content                        │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  Layer 3: APPLICATION CACHE (Redis Cluster)                  │
│  ┌────────��────────────────────────────────────────┐         │
│  │  • Session store (user sessions, JWT blacklist)           │
│  │  • API response cache (serialized JSON)                   │
│  │  • Database query cache (frequently accessed)             │
│  │  • Rate limit counters (sliding window)                   │
│  │  • Real-time data (stock counts, active users)            │
│  │  • Feature flag cache                                     │
│  │  • Tax rate cache                                         │
│  └─────────────────────────────────────────────────┘         │
│                                                               │
│  Layer 4: DATABASE CACHE (PostgreSQL)                        │
│  ┌─────────────────────────────────────────────────┐         │
│  │  • Prepared statement cache                               │
│  │  • Buffer pool (shared_buffers)                           │
│  │  • Materialized views for reports                         │
│  └─────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Redis Cache Configuration

| Cache Key Pattern | TTL | Eviction | Invalidation |
|---|---|---|---|
| `session:{userId}` | 24h | LRU | On logout / password change |
| `product:{id}` | 1h | LRU | On product update (event-driven) |
| `product:list:{tenant}:{filters_hash}` | 5m | LRU | On any product change in tenant |
| `category:tree:{tenant}` | 6h | LRU | On category CRUD |
| `cart:{userId}` | 7d | No evict | On cart modification |
| `tax:rates:{state}` | 24h | LRU | On tax rate update |
| `stock:{productId}:{locationId}` | 30s | LRU | On stock change (event) |
| `user:profile:{id}` | 1h | LRU | On profile update |
| `rate_limit:{ip}:{endpoint}` | 1m | TTL | Auto-expire |
| `feature_flags:{tenant}` | 5m | LRU | On config change |
| `search:suggestions:{query_prefix}` | 15m | LRU | On product catalog change |
| `dashboard:{tenant}:{type}:{date}` | 5m | LRU | On new order/sale |

### 6.3 Cache Invalidation Strategy

```
┌─────────────────────────────────────────────────────────┐
│              CACHE INVALIDATION PATTERNS                  │
│                                                          │
│  Pattern 1: EVENT-DRIVEN INVALIDATION (Primary)         │
│  ┌────────────────────────────────────────────────┐     │
│  │  Product Updated                                │     │
│  │       │                                         │     │
│  │       ▼                                         │     │
│  │  ProductUpdatedEvent → RabbitMQ                 │     │
│  │       │                                         │     │
│  │       ├──► Cache Service: Delete product:{id}   │     │
│  │       ├──► Cache Service: Delete product:list:* │     │
│  │       └──► Search Service: Re-index product     │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Pattern 2: TTL-BASED EXPIRY (Secondary)                │
│  ┌────────────────────────────────────────────────┐     │
│  │  All cache entries have TTL                     │     │
│  │  Even with event invalidation as safety net     │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Pattern 3: WRITE-THROUGH (For critical data)           │
│  ┌────────────────────────────────────────────────┐     │
│  │  1. Write to DB                                 │     │
│  │  2. Write to Cache (same transaction context)   │     │
│  │  Use for: Cart, Session, Stock counts           │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Pattern 4: CACHE-ASIDE (For read-heavy data)           │
│  ┌────────────────────────────────────────────────┐     │
│  │  1. Check cache → Return if found (HIT)         │     │
│  │  2. Query DB → Store in cache → Return (MISS)   │     │
│  │  Use for: Products, Categories, Tax rates       │     │
│  └���───────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

### 6.4 Redis Cluster Topology

```
┌─────────────────────────────────────────────────┐
│           REDIS CLUSTER (6 nodes)                │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  Master 1   │  │  Replica 1  │               │
│  │  Slots:     │──│  (Failover) │               │
│  │  0-5460     │  │             │               │
│  └─────────────┘  └─────────────┘               │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  Master 2   │  │  Replica 2  │               │
│  │  Slots:     │──│  (Failover) │               │
│  │  5461-10922 │  │             │               │
│  └─────────────┘  └─────────────┘               │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐               │
│  │  Master 3   │  │  Replica 3  │               │
│  │  Slots:     │──│  (Failover) │               │
│  │  10923-16383│  │             │               │
│  └─────────────┘  └─────────────┘               │
│                                                  │
│  Memory: 16GB per node (96GB total)              │
│  Eviction: allkeys-lru                           │
│  Persistence: RDB snapshots every 5 min          │
│  Max memory policy: 80% threshold alert          │
└─────────────────────────────────────────────────┘
```

---

## 7. Security Considerations

### 7.1 Security Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  LAYER 1: NETWORK SECURITY                               │    │
│  │  • WAF (Web Application Firewall) — AWS WAF / Cloudflare│    │
│  │  • DDoS Protection (Cloudflare / AWS Shield)             │    │
│  │  • VPC with private subnets for backend services         │    │
│  │  • Security groups (whitelist-only access)               │    │
│  │  • VPN for admin access to infrastructure                │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  LAYER 2: APPLICATION SECURITY                           │    │
│  │  • OWASP Top 10 compliance                               │    │
│  │  • Input validation on all endpoints                      │    │
│  │  • Output encoding (XSS prevention)                       │    │
│  │  • Parameterized queries (SQL injection prevention)       │    │
│  │  • CSRF protection (SameSite cookies + tokens)            │    │
│  │  • Content Security Policy (CSP) headers                  │    │
│  │  • HTTP Strict Transport Security (HSTS)                  │    │
│  │  • Rate limiting (per IP, per user, per endpoint)         │    │
│  └────────────────────────────────────────────────────��─────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  LAYER 3: AUTHENTICATION & AUTHORIZATION                 │    │
│  │  • JWT (RS256) with short-lived access tokens (15 min)    │    │
│  │  • Refresh tokens in HttpOnly Secure cookies              │    │
│  │  • 2FA via TOTP (Google Authenticator) and SMS            │    │
│  │  • OAuth 2.0 + OIDC for social login                      │    │
│  │  • RBAC with granular permissions                         │    │
│  │  • API key authentication for service-to-service          │    │
│  │  • mTLS for inter-service communication                   │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌────────────���─────────────────────────────────────────────┐    │
│  │  LAYER 4: DATA SECURITY                                  │    │
│  │  • Encryption at rest: AES-256 (database, file storage)   │    │
│  │  • Encryption in transit: TLS 1.3 (all communications)    │    │
│  │  • PII fields encrypted at application level (AES-GCM)   │    │
│  │  • Key management: AWS KMS / HashiCorp Vault              │    │
│  │  • Database field-level encryption for sensitive data     │    │
│  │  • Tokenization for card data (PCI DSS)                   │    │
│  │  • Data masking in logs (no PII in logs)                  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  LAYER 5: AUDIT & COMPLIANCE                             │    │
│  │  • Comprehensive audit logging (who, what, when, where)   │    │
│  │  • Immutable audit trail (append-only)                    │    │
│  │  • PCI DSS Level 1 compliance for payments               │    │
│  │  • GDPR compliance (data portability, right to forget)    │    │
│  │  • SOC 2 Type II controls                                │    │
│  │  • Regular penetration testing (quarterly)                │    │
│  │  • Vulnerability scanning (Snyk, Trivy — in CI/CD)       │    │
│  │  • Security incident response plan                        │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────���─────────┘
```

### 7.2 OWASP Top 10 Mitigation Matrix

| # | Vulnerability | Mitigation |
|---|---|---|
| A01 | **Broken Access Control** | RBAC + row-level security + tenant isolation + API authorization middleware |
| A02 | **Cryptographic Failures** | AES-256 at rest, TLS 1.3 in transit, bcrypt/Argon2 for passwords, no weak ciphers |
| A03 | **Injection** | Prisma ORM (parameterized), input validation (class-validator), CSP headers |
| A04 | **Insecure Design** | Threat modeling, secure SDLC, security reviews in PR process |
| A05 | **Security Misconfiguration** | Hardened Docker images, no default credentials, security headers, env validation |
| A06 | **Vulnerable Components** | Automated dependency scanning (Snyk/Dependabot), weekly updates, lockfile pinning |
| A07 | **Auth Failures** | JWT with rotation, 2FA, account lockout, password policy, brute-force protection |
| A08 | **Data Integrity Failures** | Signed artifacts, verified Docker images, CI/CD integrity checks, SBOM generation |
| A09 | **Logging Failures** | Structured logging, centralized log management, alerting on anomalies, audit trails |
| A10 | **SSRF** | URL allowlisting, network segmentation, disable redirects, internal DNS resolution guard |

### 7.3 Secrets Management

```
┌─────────────────────────────────────────────────────────┐
│              SECRETS MANAGEMENT                          │
│                                                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  HashiCorp Vault / AWS Secrets Manager            │  │
│  │                                                    │  │
│  │  Secrets Stored:                                   │  │
│  │  ├── Database credentials (rotated every 24h)      │  │
│  │  ├── API keys (payment gateways, SMS, email)       │  │
│  │  ├── JWT signing keys (RS256 key pairs)            │  │
│  │  ├── Encryption keys (AES-256 master keys)         │  │
│  │  ├── OAuth client secrets                          │  │
│  │  ├── Third-party integration tokens                │  │
│  │  └── TLS certificates                              │  │
│  │                                                    │  │
│  │  Policies:                                         │  │
│  │  ├── Least privilege access per service            │  │
│  │  ├── Auto-rotation for database credentials        │  │
│  │  ├── Audit log for all secret access               │  │
│  │  ├── No secrets in code, env files, or CI logs     │  │
│  │  └── Emergency revocation capability               │  │
│  └────────────────────────────��──────────────────────┘  │
│                                                          │
│  Integration with Services:                              │
│  ┌────────────────────────────────────────────┐         │
│  │  Service starts → Fetch secrets from Vault  │         │
│  │  → Cache in memory (never disk)             │         │
│  │  → Watch for rotation events                │         │
│  │  → Gracefully reload on rotation            │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 7.4 Payment Security (PCI DSS)

```
┌─────────────────────────────────────────────────���───────┐
│            PAYMENT SECURITY ARCHITECTURE                 │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  CARDHOLDER DATA ENVIRONMENT (CDE)              │    │
│  │                                                  │    │
│  │  Customer Browser                                │    │
│  │       │                                          │    │
│  │       ▼ (Direct to gateway — never touches us)   │    │
│  │  ┌──────────────────┐                            │    │
│  │  │ Payment Gateway  │  (Razorpay/Stripe)         │    │
│  │  │ Hosted Checkout  │                            │    │
│  │  │                  │                            │    │
│  │  │ • Card input     │                            │    │
│  │  │ • Tokenization   │                            │    │
│  │  │ • 3DS Auth       │                            │    │
│  │  └────────┬─────────┘                            │    │
│  │           │ (Token only — no card data)           │    │
│  │           ▼                                       │    │
│  │  ┌──────────────────┐                            │    │
│  │  │ Our Payment      │                            │    │
│  │  │ Service          │                            │    │
│  │  │                  │                            │    │
│  │  │ Stores:          │                            │    │
│  │  │ • Payment token  │                            │    │
│  │  │ • Transaction ID │                            │    │
│  │  │ • Amount         │                            │    │
│  │  │ • Status         │                            │    │
│  │  │                  │                            │    │
│  │  │ NEVER stores:    │                            │    │
│  │  │ • Card number    │                            │    │
│  │  │ • CVV            │                            │    │
│  │  │ • Expiry         │                            │    │
│  │  └──────────────────┘                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Compliance: PCI DSS SAQ-A (lowest scope)               │
│  Card Tokens: RBI-compliant tokenization via gateway     │
└─────────────────────────────────────────────────────────┘
```

### 7.5 Security Headers Configuration

```typescript
// Helmet.js configuration for NestJS
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{random}'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],    // Tailwind requires this
      imgSrc: ["'self'", "data:", "https://*.s3.amazonaws.com"],
      connectSrc: ["'self'", "https://api.razorpay.com", "wss://"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      frameSrc: ["https://js.stripe.com", "https://api.razorpay.com"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xContentTypeOptions: true,      // nosniff
  xFrameOptions: { action: "deny" },
  xXssProtection: false,          // Deprecated, CSP is sufficient
}
```

---

## 8. API Design

### 8.1 API Standards

| Aspect | Standard |
|---|---|
| **Protocol** | HTTPS only (TLS 1.3) |
| **Format** | JSON (application/json) |
| **Naming** | kebab-case for URLs, camelCase for JSON fields |
| **Versioning** | URL-based (`/api/v1/`, `/api/v2/`) |
| **Pagination** | Cursor-based (for performance) + Offset-based (for simplicity) |
| **Filtering** | Query parameters (`?status=active&category=electronics`) |
| **Sorting** | `?sort=created_at:desc,name:asc` |
| **Error Format** | RFC 7807 Problem Details |
| **Documentation** | OpenAPI 3.1 (auto-generated from NestJS decorators) |
| **Rate Limiting** | Token bucket (100 req/min for standard, 1000 req/min for premium) |

### 8.2 API Response Format

```json
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "cursor": "eyJpZCI6MTU2fQ==",
    "hasMore": true
  },
  "timestamp": "2026-03-30T10:30:00.000Z",
  "requestId": "req_01HZXK9M2V..."
}

// Error Response (RFC 7807)
{
  "success": false,
  "error": {
    "type": "https://api.billingsoftware.com/errors/validation",
    "title": "Validation Error",
    "status": 422,
    "detail": "The request body contains invalid fields",
    "instance": "/api/v1/products",
    "errors": [
      {
        "field": "price",
        "message": "Price must be a positive number",
        "code": "POSITIVE_NUMBER"
      }
    ]
  },
  "timestamp": "2026-03-30T10:30:00.000Z",
  "requestId": "req_01HZXK9M2V..."
}
```

### 8.3 API Versioning Strategy

```
┌────────────────────────────────────────────────────���─────────┐
│                 API VERSIONING                                 │
│                                                               │
│  URL-Based Versioning:                                       │
│  ┌────────────────────────────────────────────────────┐      │
│  │  /api/v1/products       ← Original version         │      │
│  │  /api/v2/products       ← Enhanced version          │      │
│  │  /api/v3/products       ← Future version            │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Version Lifecycle:                                          │
│  ┌────────────────────────────────────────────────────┐      │
│  │                                                     │      │
│  │  ACTIVE ──► DEPRECATED ──► SUNSET ──► REMOVED      │      │
│  │    │           │             │           │          │      │
│  │  Current    6 months       3 months   Removed      │      │
│  │  version    warning        read-only  completely    │      │
│  │             via headers    mode                     │      │
│  │             + dashboard                             │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Deprecation Headers:                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Deprecation: true                                  │      │
│  │  Sunset: Sat, 30 Sep 2026 00:00:00 GMT             │      │
│  │  Link: </api/v2/products>; rel="successor-version" │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Routing (API Gateway):                                      │
│  ┌────────────────────────────────────────────────────┐      │
│  │  /api/v1/* → Product Service v1 container           │      │
│  │  /api/v2/* → Product Service v2 container           │      │
│  │                                                     │      │
���  │  Both run simultaneously in production              │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. CI/CD Pipeline

### 9.1 Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                      CI/CD PIPELINE (GitHub Actions)                   │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐    │
│  │  STAGE 1: CODE QUALITY (on every push / PR)                  │    │
│  │                                                               │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │    │
│  │  │  Lint   │ │  Type   │ │  Unit   │ │ Security│           │    │
│  │  │ ESLint  │ │  Check  │ │  Tests  │ │  Scan   │           │    │
│  │  │ Prettier│ │  tsc    �� │  Jest   │ │  Snyk   │           │    │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │    │
│  │       └───────────┼──────────┼───────────┘                  │    │
│  │                    │          │                               │    │
│  │                    ▼          ▼                               │    │
│  │             Coverage Gate (>80%) + Quality Gate               │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                          │ (Pass)                                     │
│  ┌──────────────────────▼───────────────────────────────────────┐    │
│  │  STAGE 2: BUILD & PACKAGE (on merge to main/release)         │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │    │
│  │  │  Build App   │  │  Build Docker│  │  Push to ECR /  │   │    │
│  │  │  (Next.js /  │  │  Image       │  │  Container      │   │    │
│  │  │   NestJS)    │  │  (Multi-     │  │  Registry       │   │    │
│  │  │              │  │   stage)     │  │                 │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘   │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐                         │    │
│  │  │  SBOM        │  │  Image Scan  │                         │    │
│  │  │  Generation  │  │  (Trivy)     │                         │    │
│  │  └──────────────┘  └──────────────┘                         │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                          │                                            │
│  ┌──────────────────────▼───────────────────────────────────────┐    │
│  │  STAGE 3: INTEGRATION TESTS                                  │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │    │
│  │  │  API Tests   │  │  DB Migration│  │  E2E Tests      │   │    │
│  │  │  (Supertest) │  │  Validation  │  │  (Playwright)   │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘   │    │
��  └──────────────────────┬───────────────────────────────────────┘    │
│                          │                                            │
│  ┌──────────────────────▼───────────────────────────────────────┐    │
│  │  STAGE 4: DEPLOY TO STAGING                                  │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │    │
│  │  │  Terraform   │  │  Helm        │  │  Smoke Tests    │   │    │
│  │  │  Plan/Apply  │  │  Deploy to   │  │  on Staging     │   │    │
│  │  │  (if infra   │  │  K8s Staging │  │                 │   │    │
│  │  │   changed)   │  │              │  │                 │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘   │    │
│  └──────────────────────┬───────────────────────────────────────┘    │
│                          │ (Manual Approval for Production)          │
│  ┌──────────────────────▼───────────────────────────────────────┐    │
│  │  STAGE 5: DEPLOY TO PRODUCTION                               │    │
│  │                                                               │    │
│  │  Strategy: Blue-Green / Canary Deployment                     │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │    │
│  │  │  Deploy to   │  │  Canary      │  │  Full Rollout   │   │    │
│  │  │  Canary (5%) │  │  Validation  │  │  (if healthy)   │   │    │
│  │  │              │  │  (15 min)    │  │                 │   │    │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘   │    │
│  │                                                               │    │
│  │  ┌──────────────┐  ┌──────────────┐                         │    │
│  │  │  Auto-       │  │  Notify      │                         │    │
│  │  │  Rollback    │  │  (Slack +    │                         │    │
│  │  │  (on errors) │  │   Email)     │                         │    │
│  │  └──────────────┘  └──────────���───┘                         │    │
│  └──────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### 9.2 Branching Strategy (Gitflow + Trunk-Based Hybrid)

```
┌──────────────────────────────────────────────────────────────┐
│                    BRANCHING MODEL                            │
│                                                               │
│  main (production)  ─────●────────●────────●──────────►      │
│                          │        ▲        ▲                  │
│                          │        │        │                  │
│  release/1.2.0    ───────┼────●───┘        │                  │
│                          │    ▲            │                  │
│  release/1.3.0    ───────┼────┼────────●───┘                  │
│                          │    │        ▲                      │
│                          ▼    │        │                      │
│  develop          ──●──●──●──●──●──●──●──●──●──────►         │
│                     ▲  ▲     ▲        ▲                       │
│                     │  │     │        │                        │
│  feature/FR-001  ───┘  │     │        │                        │
│  feature/FR-002  ──────┘     │        │                        │
│  feature/FR-003  ────────────┘        │                        │
│  hotfix/fix-xyz  ─────────────────────┘                        │
│                                                               │
│  Branch Naming:                                              │
│  • feature/FR-{id}-{short-desc}                              │
│  • bugfix/BUG-{id}-{short-desc}                              │
│  • hotfix/HOT-{id}-{short-desc}                              │
│  • release/{semver}                                          │
│  • chore/{description}                                       │
│                                                               │
│  Merge Rules:                                                │
│  • feature → develop (squash merge)                          │
│  • develop → release (merge commit)                          │
│  • release → main (merge commit + tag)                       │
│  • hotfix → main + develop (cherry-pick)                     │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Deployment Environments

| Environment | Purpose | URL | Deployment | Approval |
|---|---|---|---|---|
| **Local** | Developer machine | localhost:3000 | Manual | — |
| **Dev** | Shared development | dev.billing.internal | Auto (on push to develop) | None |
| **Staging** | Pre-production testing | staging.billing.internal | Auto (on release branch) | None |
| **UAT** | User acceptance testing | uat.billing.com | Manual trigger | QA Lead |
| **Production** | Live environment | app.billing.com | Manual trigger | Tech Lead + PM |

### 9.4 Infrastructure as Code

```
infrastructure/
├── terraform/
│   ├── modules/
│   │   ├── vpc/                 # Network configuration
│   │   ├── eks/                 # Kubernetes cluster
│   │   ├── rds/                 # PostgreSQL instances
│   │   ├── elasticache/         # Redis cluster
│   │   ├── elasticsearch/       # Search cluster
│   │   ├── s3/                  # Object storage
│   │   ├── cloudfront/          # CDN
│   │   ├── route53/             # DNS
│   │   ├── acm/                 # SSL certificates
│   │   ├── waf/                 # Web application firewall
│   │   ├── iam/                 # IAM roles & policies
│   │   └── monitoring/          # CloudWatch, alerts
│   │
│   ├── environments/
│   │   ├── dev/
│   │   │   ├── main.tf
│   │   │   ├── variables.tf
│   │   │   └── terraform.tfvars
│   │   ├── staging/
│   │   └── production/
│   │
│   └── backend.tf               # Remote state (S3 + DynamoDB)
│
├── kubernetes/
│   ├── helm/
│   │   ├── billing-platform/
│   │   │   ├── Chart.yaml
│   │   │   ├── values.yaml
│   │   │   ├── values-staging.yaml
│   │   │   ├── values-production.yaml
│   │   │   └── templates/
│   │   │       ├── deployment.yaml
│   │   │       ├── service.yaml
│   │   │       ├── ingress.yaml
│   │   ���       ├── hpa.yaml
│   │   │       ├── pdb.yaml
│   │   │       └── configmap.yaml
│   │   └── ...per-service charts
│   │
│   └── manifests/               # Raw K8s manifests (if needed)
│
└── scripts/
    ├── setup-local.sh
    ├── seed-database.sh
    └── rotate-secrets.sh
```

---

## 10. Multi-Version Support Strategy

### 10.1 Versioning Philosophy

Support **N and N-1 versions** simultaneously, ensuring old-version customers are not broken while new-version customers get the latest features.

```
┌────────────────────────────────────────────────────��─────────────┐
│              MULTI-VERSION SUPPORT MODEL                          │
│                                                                   │
│  Timeline:                                                       │
│  ─────────────────────────────────────────────────────────────   │
│  │  v1.0   │  v1.1   │  v1.2   │  v2.0   │  v2.1   │          │
│  │ Launch  │ Patch   │ Feature │ Major   │ Patch   │          │
│  ─────────────────────────────────────────────────────────────   │
│                                                                   │
│  Active Support Windows:                                         │
│  ┌─────────────────────────────────────────────���─────────┐       │
│  │                                                        │       │
│  │  v2.1 (Current)  ──── Full Support                    │       │
│  │  v2.0 (Previous) ──── Security + Critical Bugs        │       │
│  │  v1.2 (Legacy)   ──── Security Only (6 months)        │       │
│  │  v1.1 (EOL)      ──── No Support (migration guide)    │       │
│  │  v1.0 (EOL)      ──── No Support                      │       │
│  │                                                        │       │
│  └───────────────────────────────────────────────────────┘       │
│                                                                   │
│  Semantic Versioning: MAJOR.MINOR.PATCH                          │
│  • MAJOR: Breaking API changes (new version deployed in parallel)│
│  • MINOR: New features (backward compatible)                     │
│  • PATCH: Bug fixes and security patches                         │
└──────────────────────────────────────────────────────────────────┘
```

### 10.2 API Version Coexistence

```
┌──────────────────────────────────────────────────────────────┐
│           PARALLEL API VERSION DEPLOYMENT                     │
│                                                               │
│  API Gateway (Kong / AWS API Gateway)                        │
│  ┌───────────────────────────────────────────────────┐       │
│  ��                                                    │       │
│  │  Route: /api/v1/*  ──►  Service v1 (Container)    │       │
│  │  Route: /api/v2/*  ──►  Service v2 (Container)    │       │
│  │                                                    │       │
│  │  Default: /api/latest  → Redirect to /api/v2      │       │
│  │                                                    │       │
│  │  Headers:                                          │       │
│  │  X-API-Version: 1 → Route to v1                   │       │
│  │  X-API-Version: 2 → Route to v2                   │       │
│  │  (Missing)        → Route to latest                │       │
│  └───────────────────────────────────────────────────┘       │
│                                                               │
│  Kubernetes Deployment:                                      │
│  ┌───────────────────────────────────────────────────┐       │
│  │                                                    │       │
│  │  product-service-v1     (2 replicas)              │       │
│  │  product-service-v2     (3 replicas)              │       │
│  │  order-service-v1       (2 replicas)              │       │
│  │  order-service-v2       (3 replicas)              │       │
│  │                                                    │       │
│  │  Shared: Same database (with migrations)           │       │
│  │  Isolated: Separate containers and configs         │       │
│  └───────────────────────────────────────────────────┘       │
│                                                               │
│  Database Compatibility:                                     │
│  ┌───────────────────────────────────────────────────┐       │
│  │  • Additive migrations only (never remove cols)    │       │
│  │  • New columns have default values                 │       │
│  │  • v1 service ignores new columns                  │       │
│  │  • v2 service reads both old + new columns         │       │
│  │  • Column removal only after v1 sunset             │       │
│  └───────────────────────────────────────────────────┘       │
└─────────────────────────────────────���────────────────────────┘
```

### 10.3 Frontend Version Management

```
┌──────────────────────────────────────────────────────────────┐
│          FRONTEND VERSION MANAGEMENT                          │
│                                                               │
│  Web App:                                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Always latest version (auto-deployed via CDN)    │      │
│  │  • Feature flags control new UI per tenant          │      │
│  │  • Gradual rollout: 5% → 25% → 50% → 100%         │      │
│  │  • A/B testing for new features                     │      │
│  │  • Version indicator in footer                      │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Mobile App:                                                 │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Multiple versions in stores simultaneously       │      │
│  │  • Force update for critical/security releases      │      │
│  │  • Soft update prompt for feature releases          │      │
│  │  • Minimum supported version enforcement            │      │
│  │  • OTA updates via CodePush (non-native changes)    │      │
│  │                                                     │      │
│  │  Version Check Flow:                                │      │
│  │  App Launch → GET /api/config/app-version           │      │
│  │  Response:                                          │      │
│  │  {                                                  │      │
│  │    "latestVersion": "2.1.0",                        │      │
│  │    "minimumVersion": "2.0.0",                       │      │
│  │    "forceUpdate": false,                            │      │
│  │    "updateUrl": "https://...",                       │      │
│  │    "changelog": "..."                               │      │
│  │  }                                                  │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  POS App (Electron):                                         │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Auto-updater (electron-updater)                  │      │
│  │  • Delta updates (download only changes)            │      │
│  │  • Rollback capability (keep previous version)      │      │
│  │  • Offline-capable (update when online)             │      │
│  │  • Admin-controlled update scheduling               │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### 10.4 Feature Flags System

```
┌──────────────────────────────────────────────────────────────┐
│              FEATURE FLAGS ARCHITECTURE                        │
│                                                               │
│  Tool: Custom + LaunchDarkly / Unleash (self-hosted)         │
│                                                               │
│  Flag Types:                                                 │
│  ┌────────────────────────────────────────────────────┐      │
│  │  RELEASE FLAG    │ Enable/disable new features      │      │
│  │  EXPERIMENT FLAG │ A/B testing variants              │      │
│  │  OPS FLAG        │ Kill switch for features          │      │
│  │  PERMISSION FLAG │ Tenant/Plan-based features        │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Flag Evaluation:                                            │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Request comes in                                   │      │
│  │       │                                             │      │
│  │       ▼                                             │      │
│  │  Extract context:                                   │      │
│  │  • tenantId                                         │      │
│  │  • userId                                           │      │
│  │  • plan (free/starter/pro/enterprise)               │      │
│  │  • businessType (shop/restaurant/hospital)          │      │
│  │  • region                                           │      │
│  │  • appVersion                                       │      │
│  │       │                                             │      │
│  │       ▼                                             │      │
│  │  Evaluate flag rules:                               │      │
│  │  IF businessType == "restaurant"                    │      │
│  │    AND plan == "pro"                                │      │
│  │    THEN enable("table-management")                  │      │
│  │       │                                             │      │
│  │       ▼                                             │      │
│  │  Cache result in Redis (5 min TTL)                  │      │
│  └─────────────────────────────────���──────────────────┘      │
│                                                               │
│  Example Flags:                                              │
│  ┌──────────────────────────┬──────────────────┐             │
│  │ Flag Name                │ Targeting         │             │
│  ├──────────────────────────┼──────────────────┤             │
��  │ ai_chatbot_enabled       │ plan: pro+        │             │
│  │ qr_code_payment          │ all tenants       │             │
│  │ multi_warehouse          │ plan: enterprise   │             │
│  │ prescription_check       │ type: pharmacy     │             │
│  │ table_management         │ type: restaurant   │             │
│  │ patient_billing          │ type: hospital     │             │
│  │ new_checkout_flow        │ 10% rollout        │             │
│  │ dark_mode                │ all (beta toggle)  │             │
│  └──────────────────────────┴──────────────────┘             │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Performance Engineering

### 11.1 Performance Targets

| Metric | Target | Measurement |
|---|---|---|
| **Page Load (FCP)** | < 1.5s | Lighthouse / Web Vitals |
| **Time to Interactive (TTI)** | < 3.0s | Lighthouse |
| **Largest Contentful Paint (LCP)** | < 2.5s | Web Vitals |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Web Vitals |
| **First Input Delay (FID)** | < 100ms | Web Vitals |
| **API Response (P50)** | < 100ms | APM |
| **API Response (P95)** | < 500ms | APM |
| **API Response (P99)** | < 1000ms | APM |
| **Database Query (P95)** | < 50ms | Slow query log |
| **Search Query (P95)** | < 200ms | Elasticsearch metrics |
| **Concurrent Users** | 10,000+ | Load testing |
| **Throughput** | 5,000 req/s | Load testing |

### 11.2 Performance Optimization Techniques

```
┌──────────────────────────────────────────────────────────────┐
│              PERFORMANCE OPTIMIZATIONS                         │
│                                                               │
│  FRONTEND                                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Next.js SSR + SSG for critical pages             │      │
│  │  • Code splitting (dynamic imports)                  │      │
│  │  • Image optimization (Next/Image, WebP, AVIF)      │      │
│  │  • Bundle analysis + tree shaking                    │      │
│  │  • Lazy loading (images, components, routes)         │      │
│  │  • Prefetching (next/link, DNS prefetch)             │      │
│  │  • Service Worker caching                            │      │
│  │  • Critical CSS inlining                             │      │
│  │  • Font optimization (next/font, swap display)       │      │
│  │  • Virtual scrolling for large lists                 │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  BACKEND                                                     │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Connection pooling (PgBouncer)                    │      │
│  │  • Query optimization (EXPLAIN ANALYZE)              │      │
│  │  • N+1 query prevention (DataLoader pattern)         │      │
│  │  • Response compression (Brotli > Gzip)              │      │
│  │  • Async processing (BullMQ for heavy tasks)         │      │
│  │  • Database read replicas for queries                │      │
│  │  • Batch operations (bulk insert/update)             │      │
│  │  • Cursor-based pagination (no COUNT(*))             │      │
│  │  • gRPC for inter-service communication              │      │
│  │  • HTTP/2 multiplexing                               │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  INFRASTRUCTURE                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • CDN for static assets (CloudFront / Cloudflare)  │      │
│  │  • Multi-layer caching (CDN → Redis → DB)           │      │
│  │  • Auto-scaling (HPA in Kubernetes)                  │      │
│  │  • Load balancing (round-robin + least-connections)  │      │
│  │  • Geographic distribution (multi-region)            │      │
│  │  • Database query caching (Redis)                    │      │
│  │  • Object storage for large files (S3 + presigned)  │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 12. Scalability Plan

### 12.1 Scaling Strategy

```
┌──────────────────────────────────────────────────────────────┐
│              SCALING STRATEGY                                  │
│                                                               │
│  Phase 1: Single Region (0 – 10K users)                      │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Single K8s cluster (3 nodes)                     │      │
│  │  • Single PostgreSQL (primary + 1 replica)          │      │
│  │  • Redis cluster (3 nodes)                          │      │
│  │  • Elasticsearch (3 nodes)                          │      │
│  │  • Estimated cost: $1,500 – $3,000/month            │      │
│  └─��──────────────────────────────────────────────────┘      │
│                                                               │
│  Phase 2: Scaled Single Region (10K – 100K users)            │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • K8s cluster (5-10 nodes, auto-scaling)           │      │
│  │  • PostgreSQL (primary + 2 read replicas)           │      │
│  │  • Redis cluster (6 nodes)                          │      │
│  │  • Elasticsearch (5 nodes)                          │      │
│  │  • ClickHouse cluster for analytics                 │      │
│  │  • Kafka for event streaming                        │      │
│  │  • Estimated cost: $5,000 – $15,000/month           │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Phase 3: Multi-Region (100K+ users)                         │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Multi-region K8s clusters                        │      │
│  │  • PostgreSQL with cross-region replication          │      │
│  │  • Global Redis with read replicas                  │      │
│  │  • CDN with edge caching                            │      │
│  │  • Database sharding by tenant                      │      │
│  │  • Estimated cost: $20,000 – $50,000/month          │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Kubernetes Auto-Scaling:                                    │
│  ┌────────────────────────────────────────────────────┐      │
│  │  HPA (Horizontal Pod Autoscaler):                   │      │
│  │  • Target CPU: 70%                                  │      │
│  │  • Target Memory: 75%                               │      │
│  │  • Min replicas: 2                                  │      │
│  │  • Max replicas: 20                                 │      │
│  │  • Scale-up cooldown: 60s                           │      │
│  │  • Scale-down cooldown: 300s                        │      │
│  │                                                     │      │
│  │  VPA (Vertical Pod Autoscaler):                     │      │
│  │  • Auto-adjust resource requests                    │      │
│  │  • Based on actual usage patterns                   │      │
│  │                                                     │      │
│  │  Cluster Autoscaler:                                │      │
│  │  • Auto-add/remove nodes                            │      │
│  │  • Min: 3 nodes, Max: 20 nodes                     │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Monitoring & Observability

### 13.1 Observability Stack

```
┌─────────────────��────────────────────────────────────────────┐
│              OBSERVABILITY STACK                               │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │    METRICS           │  │    LOGS              │           │
│  │    (Prometheus +     │  │    (ELK Stack /      │           │
│  │     Grafana)         │  │     Loki + Grafana)  │           │
│  │                      │  │                      │           │
│  │  • CPU/Memory/Disk   │  │  • Structured JSON   │           │
│  │  • Request rate      │  │  • Log levels        │           │
│  │  • Error rate        │  │  • Correlation IDs   │           │
│  │  • Latency (P50/95)  │  │  • Request context   │           │
│  │  • Queue depth       │  │  • Error stack traces│           │
│  │  • Cache hit ratio   │  │  • Audit events      │           │
│  │  • DB connections    │  │                      │           │
│  │  • Business metrics  │  │  Retention:          │           │
│  │    (orders/min,      │  │  Hot: 7 days         │           │
│  │     revenue)         │  │  Warm: 30 days       │           │
│  └─────────────────────┘  │  Cold: 1 year (S3)   │           │
│                            └──────���──────────────┘           │
│                                                               │
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │    TRACING           │  │    ALERTING          │           │
│  │    (Jaeger /         │  │    (Grafana Alerts + │           │
│  │     OpenTelemetry)   │  │     PagerDuty)       │           │
│  │                      │  │                      │           │
│  │  • Distributed trace │  │  • Error rate > 1%   │           │
│  │  • Service map       │  │  • P95 latency > 1s  │           │
│  │  • Bottleneck ID     │  │  • CPU > 80%         │           │
│  │  • Cross-service     │  │  • Memory > 85%      │           │
│  │    correlation       │  │  • Queue depth > 1K  │           │
│  │  • Span analysis     │  │  • Disk > 90%        │           │
│  │                      │  │  • Health check fail │           │
│  └─────────────────────┘  │  • Certificate expiry │           │
│                            │                      │           │
│  ┌─────────────────────┐  │  Channels:           │           │
│  │   ERROR TRACKING     │  │  • Slack (P3/P4)     │           │
│  │   (Sentry)           │  │  • PagerDuty (P1/P2) │           │
│  │                      │  │  • Email (all)       │           │
│  │  • Real-time errors  │  │  • SMS (P1)          │           │
│  │  • Release tracking  │  └─────────────────────┘           │
│  │  • User context      │                                     │
│  │  • Source maps        │                                     │
│  │  • Performance monitoring                                  │
│  └─────────────────────┘                                      │
└──────────────────────────────────────────────────────────────┘
```

### 13.2 Health Check Design

```typescript
// Every service exposes:
GET /health          → 200 OK (basic liveness)
GET /health/ready    → 200 OK (readiness — DB, Redis, dependencies)
GET /health/live     → 200 OK (liveness — process is running)
GET /health/startup  → 200 OK (startup — initialization complete)

// Response format:
{
  "status": "healthy",
  "version": "2.1.0",
  "uptime": "48h 23m 15s",
  "checks": {
    "database": { "status": "healthy", "latency": "3ms" },
    "redis": { "status": "healthy", "latency": "1ms" },
    "elasticsearch": { "status": "healthy", "latency": "12ms" },
    "messageQueue": { "status": "healthy", "depth": 42 }
  }
}
```

---

## 14. Disaster Recovery & Maintenance

### 14.1 Backup Strategy

| Data Store | Backup Type | Frequency | Retention | Storage |
|---|---|---|---|---|
| PostgreSQL | Full snapshot | Daily (2 AM) | 30 days | S3 (cross-region) |
| PostgreSQL | WAL archiving | Continuous | 7 days | S3 |
| PostgreSQL | Logical backup | Weekly | 90 days | S3 Glacier |
| MongoDB | mongodump | Daily | 30 days | S3 |
| Redis | RDB Snapshot | Every 5 min | 24 hours | EBS |
| Elasticsearch | Snapshot | Daily | 14 days | S3 |
| S3 (Files) | Cross-region replication | Real-time | Indefinite | S3 (alt region) |

### 14.2 Recovery Objectives

| Metric | Target | Strategy |
|---|---|---|
| **RTO** (Recovery Time) | < 4 hours | Automated failover, infrastructure as code |
| **RPO** (Recovery Point) | < 1 hour | WAL archiving, continuous replication |
| **MTTR** (Mean Time to Repair) | < 2 hours | Runbooks, automated remediation |
| **MTBF** (Mean Time Between Failures) | > 720 hours | Proactive monitoring, chaos engineering |

### 14.3 Maintenance Windows

```
┌──────────────────────────────────────────────────────────────┐
│              MAINTENANCE STRATEGY                              │
│                                                               │
│  Zero-Downtime Deployments:                                  │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Rolling updates in Kubernetes                    │      │
│  │  • Blue-Green deployment for major releases         │      │
│  │  • Canary deployment for risky changes              │      │
│  │  • Database migrations are always backward compatible│     │
│  │  • Feature flags for instant rollback               │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Planned Maintenance (if needed):                            │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Window: Sunday 2 AM – 6 AM IST                  │      │
│  │  • Advance notice: 72 hours via email + in-app      │      │
│  │  • Status page updates (status.billing.com)         │      │
│  │  • Maintenance page with countdown                  │      │
│  │  • Post-maintenance verification checklist          │      │
│  └────────────────────────────────────────────────────┘      │
│                                                               │
│  Database Maintenance:                                       │
│  ┌────────────────────────────────────────────────────┐      │
│  │  • Auto-vacuum tuning (continuous)                  │      │
│  │  • Index rebuilds (weekly, off-peak)                │      │
│  │  • Partition management (monthly archival)          │      │
│  ���  • Statistics update (daily)                        │      │
│  │  • Connection pool health checks (every 30s)       │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

---

## 15. Development Standards

### 15.1 Code Quality Rules

| Rule | Tool | Threshold |
|---|---|---|
| Linting | ESLint (strict config) | Zero warnings in CI |
| Formatting | Prettier | Enforced via pre-commit hook |
| Type Safety | TypeScript (strict mode) | No `any` except justified |
| Unit Test Coverage | Jest | Minimum 80% (lines + branches) |
| Integration Test | Supertest | All API endpoints covered |
| E2E Test | Playwright | Critical user flows (P0/P1) |
| Complexity | ESLint (max-complexity) | Max cyclomatic complexity: 10 |
| Dependencies | Snyk / Dependabot | Zero critical/high vulnerabilities |
| Commit Messages | Conventional Commits | Enforced via commitlint |
| PR Size | Custom check | Max 400 lines changed |

### 15.2 Git Commit Convention

```
<type>(<scope>): <description>

Types: feat, fix, docs, style, refactor, perf, test, chore, ci, build
Scope: product, order, payment, auth, billing, inventory, etc.

Examples:
feat(product): add barcode generation for items
fix(payment): resolve duplicate refund issue
perf(search): optimize Elasticsearch query for product search
docs(api): update OpenAPI spec for order endpoints
chore(deps): upgrade NestJS to v11.2.0
```

### 15.3 Code Review Checklist

- [ ] Does it follow the coding standards and architecture?
- [ ] Are there sufficient unit and integration tests?
- [ ] Is the code secure (no hardcoded secrets, proper validation)?
- [ ] Is error handling comprehensive?
- [ ] Are database queries optimized (no N+1, proper indexes)?
- [ ] Is caching implemented where appropriate?
- [ ] Is the API backward compatible?
- [ ] Are feature flags used for new features?
- [ ] Is logging adequate (structured, no PII)?
- [ ] Is the documentation updated?

---

## 16. Technology Stack Summary

### 16.1 Complete Stack

```
┌──────────────────────────────────────────────────────────────┐
│                 TECHNOLOGY STACK                               │
│                                                               │
│  FRONTEND                                                    │
│  ├── Framework:    Next.js 15 (App Router)                   │
│  ├── Language:     TypeScript 5.x                            │
│  ├── UI Library:   Shadcn/UI + Radix UI                      │
│  ├── Styling:      Tailwind CSS 4                            │
│  ├── State:        Zustand + TanStack Query                  │
│  ├── Forms:        React Hook Form + Zod                     │
│  ├── Charts:       Recharts / Tremor                         │
│  ├── Tables:       TanStack Table                            │
│  ├── Mobile:       Flutter 3.x (Dart)                        │
│  ├── POS:          Electron + React                          │
│  └── Testing:      Jest + Playwright + Storybook             │
│                                                               │
│  BACKEND                                                     │
│  ├── Runtime:      Node.js 22 LTS                            │
│  ├── Framework:    NestJS 11                                 │
│  ├── Language:     TypeScript 5.x                            │
│  ├── ORM:          Prisma 6                                  │
│  ├── Validation:   class-validator + Zod                     │
│  ├── Queue:        BullMQ (Redis-backed)                     │
│  ├── WebSocket:    Socket.io                                 │
│  ├── API Docs:     Swagger / OpenAPI 3.1                     │
│  ├── PDF Gen:      Puppeteer / @react-pdf/renderer           │
│  ├── Email:        Nodemailer + React Email                  │
│  └── Testing:      Jest + Supertest                          │
│                                                               │
│  DATABASES                                                   │
│  ├── Primary:      PostgreSQL 16                             │
│  ├── Document:     MongoDB 7                                 │
│  ├── Cache:        Redis 7 (Cluster)                         │
│  ├── Search:       Elasticsearch 8                           │
│  ├── Analytics:    ClickHouse                                │
│  └── Files:        AWS S3 / MinIO                            │
│                                                               │
│  INFRASTRUCTURE                                              │
│  ├── Cloud:        AWS (primary) / GCP (secondary)           │
│  ├── Containers:   Docker                                    │
│  ├── Orchestration:Kubernetes (EKS / GKE)                    │
│  ├── Service Mesh: Istio                                     │
│  ├── IaC:          Terraform                                 │
│  ├── CI/CD:        GitHub Actions                            │
│  ├── CDN:          CloudFront / Cloudflare                   │
│  ├── API Gateway:  Kong / AWS API Gateway                    │
│  ├── DNS:          Route 53 / Cloudflare DNS                 │
│  └── SSL:          AWS ACM / Let's Encrypt                   │
│                                                               │
│  MESSAGING                                                   │
│  ├── Event Bus:    Apache Kafka                              │
│  ├── Task Queue:   RabbitMQ                                  │
│  └── Real-time:    Socket.io + Redis Pub/Sub                 │
│                                                               │
│  OBSERVABILITY                                               │
│  ├── Metrics:      Prometheus + Grafana                      │
│  ├── Logs:         Loki + Grafana (or ELK)                   │
│  ├── Traces:       Jaeger + OpenTelemetry                    │
│  ├── Errors:       Sentry                                    │
│  ├── APM:          Datadog / New Relic (optional)            │
│  └── Status:       Statuspage / Cachet                       │
│                                                               │
│  SECURITY                                                    │
│  ├── WAF:          AWS WAF / Cloudflare                      │
│  ├── Secrets:      HashiCorp Vault / AWS Secrets Manager     │
│  ├── Auth:         JWT (RS256) + OAuth 2.0                   │
│  ├── Scanning:     Snyk + Trivy + Dependabot                 │
│  └── Compliance:   PCI DSS + GDPR                            │
│                                                               │
│  DEV TOOLS                                                   │
│  ├── Monorepo:     Turborepo / Nx                            │
│  ├── Linting:      ESLint + Prettier                         │
│  ├── Git Hooks:    Husky + lint-staged                       │
│  ├── Commits:      Conventional Commits + commitlint         │
│  ├── Docs:         Docusaurus (internal docs)                │
│  └── Design:       Figma + Storybook                         │
└──────────────────────────────────────────────────────────────┘
```

### 16.2 Decision Records (ADR Summary)

| Decision | Choice | Alternatives Considered | Rationale |
|---|---|---|---|
| Backend Framework | NestJS | Express, Fastify, Hono | Enterprise-grade, modular, built-in DI, TypeScript-first, OpenAPI support |
| Frontend Framework | Next.js | Remix, Nuxt, SvelteKit | Largest ecosystem, Vercel support, SSR/SSG, App Router maturity |
| Primary Database | PostgreSQL | MySQL, CockroachDB | JSON support, partitioning, mature, extensions, community |
| ORM | Prisma | TypeORM, Drizzle, Sequelize | Type-safe, migration tool, multi-DB, growing ecosystem |
| Cache | Redis | Memcached, Hazelcast | Data structures, persistence, cluster mode, pub/sub, Lua scripting |
| Search | Elasticsearch | Typesense, Meilisearch | Proven at scale, rich query DSL, aggregations, ecosystem |
| Mobile | Flutter | React Native, Native | Single codebase, near-native performance, rich widget library |
| Message Queue | RabbitMQ + Kafka | Redis Streams, AWS SQS | RabbitMQ for task queues, Kafka for event streaming — best of both |
| Container Orchestration | Kubernetes | Docker Swarm, Nomad | Industry standard, auto-scaling, self-healing, ecosystem |
| CI/CD | GitHub Actions | Jenkins, GitLab CI, CircleCI | Native GitHub integration, marketplace, YAML-based, good free tier |

---

## Appendix A: Development Environment Setup

```bash
# Prerequisites
node >= 22.0.0 (LTS)
pnpm >= 9.0.0
docker >= 27.0.0
docker-compose >= 2.30.0

# Clone and setup
git clone https://github.com/{org}/billing-platform.git
cd billing-platform
pnpm install

# Start infrastructure (PostgreSQL, Redis, Elasticsearch, RabbitMQ)
docker-compose -f docker/docker-compose.dev.yml up -d

# Run database migrations
pnpm prisma:migrate:dev

# Seed development data
pnpm db:seed

# Start all services (Turborepo)
pnpm dev

# Run tests
pnpm test           # Unit tests
pnpm test:e2e       # E2E tests
pnpm test:coverage  # Coverage report
```

## Appendix B: Quick Reference — Port Mapping

| Service | Dev Port | Description |
|---|---|---|
| Web App (Next.js) | 3000 | Customer-facing web application |
| Admin Panel | 3001 | Admin dashboard |
| Auth Service | 4001 | Authentication & authorization |
| Product Service | 4002 | Product & catalog management |
| Order Service | 4003 | Order lifecycle management |
| Payment Service | 4004 | Payment processing |
| Notification Service | 4005 | Email, SMS, Push notifications |
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & sessions |
| Elasticsearch | 9200 | Search engine |
| RabbitMQ | 5672 / 15672 | Message queue / Management UI |
| Kafka | 9092 | Event streaming |
| MinIO (S3) | 9000 / 9001 | Object storage / Console |

---

> **Document Status:** Living document — updated with each major architectural decision.  
> **Review Cadence:** Monthly architecture review meetings.  
> **Next Steps:** Finalize tech stack POC → Setup monorepo → Implement Phase 1 MVP.