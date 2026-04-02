# 🏗️ Billing Software – Proposed Architecture (Revised)

> **Version:** 2.0
> **Date:** 2026-04-02
> **Status:** Proposed
> **Author:** @antonyrobin
> **Related:** [ReadMe.md](./ReadMe.md) | [architecture.md](./architecture.md)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Key Technology Decisions](#2-key-technology-decisions)
3. [System Architecture Overview](#3-system-architecture-overview)
4. [Consolidated Microservices (20 → 4 + Gateway)](#4-consolidated-microservices-20--4--gateway)
5. [API Gateway (YARP)](#5-api-gateway-yarp)
6. [JWT Authentication Flow](#6-jwt-authentication-flow)
7. [Database Architecture (PostgreSQL + RLS)](#7-database-architecture-postgresql--rls)
8. [Redis Cache Architecture](#8-redis-cache-architecture)
9. [CDN Flow (Cloudflare)](#9-cdn-flow-cloudflare)
10. [Message Bus (RabbitMQ + MassTransit)](#10-message-bus-rabbitmq--masstransit)
11. [Database Management Strategy](#11-database-management-strategy)
12. [Repository Strategy (3-Repo Hybrid)](#12-repository-strategy-3-repo-hybrid)
13. [CI/CD Pipeline](#13-cicd-pipeline)
14. [Source Code & Release Versioning](#14-source-code--release-versioning)
15. [Environment Setup](#15-environment-setup)
16. [Auto-Scaling Rules](#16-auto-scaling-rules)
17. [Secrets Management](#17-secrets-management)
18. [Cross-Repo Deployment Coordination](#18-cross-repo-deployment-coordination)
19. [Cloud Cost Comparison](#19-cloud-cost-comparison)
20. [Migration Execution Flow](#20-migration-execution-flow)

---

## 1. Executive Summary

This document consolidates all architecture decisions for the billing software startup. The core philosophy is **maximum performance with minimum resources** — a lean but production-grade stack that can scale from 0 to 100k tenants without a full rewrite.

### Key Revisions from v1.0

| Decision | v1.0 (Original) | v2.0 (Proposed) | Rationale |
|---|---|---|---|
| **Microservices** | 20 services | 4 services + 1 gateway | Reduce ops overhead; startup team size |
| **Frontend** | Next.js + Flutter + Electron | Flutter only | Single codebase for Web + iOS + Android + POS |
| **Backend** | NestJS | .NET 9 Web API | Performance, type safety, mature ecosystem |
| **Database** | PostgreSQL (per service) | PostgreSQL (single, multi-schema + RLS) | Cost, consistency, simpler ops |
| **API Gateway** | Kong/AWS | YARP (.NET) | No extra infra; stays in .NET ecosystem |
| **Search** | Elasticsearch | PostgreSQL pg_trgm | Avoid extra infra at startup scale |
| **Analytics DB** | ClickHouse | PostgreSQL + materialized views | Avoid extra infra at startup scale |
| **Config Store** | etcd | PostgreSQL + Redis | Avoid extra infra |
| **CDN** | AWS CloudFront | Cloudflare (free tier) | $0/month at startup scale |

---

## 2. Key Technology Decisions

### Technology Stack

| Layer | Technology | Version | Rationale |
|---|---|---|---|
| **Frontend** | Flutter | 3.x | Single codebase: Web + iOS + Android + POS Desktop |
| **Backend** | .NET Web API | 9.0 | Performance (#1 in TechEmpower), type safety, C# |
| **API Gateway** | YARP | 2.x | Pure .NET, no extra infra, deep integration |
| **Database** | PostgreSQL | 16 | ACID, JSONB, full-text search, RLS, extensions |
| **Cache** | Redis | 7.x | Session store, distributed cache, pub/sub |
| **Message Bus** | RabbitMQ + MassTransit | 3.x / 8.x | Reliable async messaging, .NET native |
| **CDN** | Cloudflare | Free/Pro | Edge caching, DDoS protection, free SSL |
| **Container** | Docker + Kubernetes | — | Portability and auto-scaling |
| **CI/CD** | GitHub Actions | — | Native GitHub integration |
| **Secrets** | Azure Key Vault / AWS Secrets | — | Environment-specific secure secrets |
| **Object Storage** | MinIO (dev) / S3 (prod) | — | Files, invoices, images |
| **DB Migrations** | EF Core + DbUp | — | Two-tool approach (schema + scripts) |

---

## 3. System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                              │
│                                                                                  │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐        │
│   │  Flutter    │   │  Flutter    │   │   Flutter   │   │   Flutter   │        │
│   │  Web App    │   │  iOS App    │   │ Android App │   │ POS Desktop │        │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘        │
└──────────┼─────────────────┼─────────────────┼─────────────────┼────────────────┘
           │                 │                 │                 │
           └─────────────────┴────────┬────────┴─────────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │       Cloudflare CDN     │
                         │  (Static assets, DDoS,   │
                         │   SSL termination, WAF)  │
                         └────────────┬─────────────┘
                                      │
                         ┌────────────▼────────────┐
                         │   YARP API Gateway       │
                         │   (.NET 9 Reverse Proxy) │
                         │                          │
                         │  ● JWT validation        │
                         │  ● Rate limiting         │
                         │  ● Request routing       │
                         │  ● API versioning        │
                         │  ● CORS handling         │
                         │  ● Request logging       │
                         │  ● Response caching      │
                         └────────────┬─────────────┘
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           │                          │                          │
    ┌──────▼──────┐           ┌───────▼──────┐           ┌──────▼──────┐
    │  Identity   │           │   Catalog    │           │  Commerce   │
    │  Service    │           │   Service    │           │   Service   │
    │             │           │             │           │             │
    │ Auth/Users  │           │  Products   │           │ Orders/Cart │
    │ Tenants     │           │  Inventory  │           │ Billing     │
    │ Branches    │           │  Barcode    │           │ Payments    │
    │ Config      │           │  Search     │           │ Tax/GST     │
    │ FeatureFlags│           │  FileUpload │           │ Discounts   │
    │ RBAC        │           │             │           │ Delivery    │
    └──────┬──────┘           └──────┬──────┘           └──────┬──────┘
           │                         │                         │
           └─────────────────────────┼─────────────────────────┘
                                     │
                              ┌──────▼──────┐
                              │ Engagement  │
                              │  Service    │
                              │             │
                              │ Email/SMS   │
                              │ Push Notifs │
                              │ Reviews     │
                              │ Reports     │
                              │ Support     │
                              └──────┬──────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
   ┌──────▼──────┐           ┌───────▼──────┐           ┌──────▼──────┐
   │ PostgreSQL  │           │    Redis     │           │  RabbitMQ   │
   │ (4 schemas) │           │   (Cache +   │           │ (MassTransit│
   │  + RLS      │           │   Sessions)  │           │  Message    │
   │             │           │             │           │    Bus)     │
   └─────────────┘           └─────────────┘           └─────────────┘
```

---

## 4. Consolidated Microservices (20 → 4 + Gateway)

### Why 4 Services?

The original 20-microservice design was optimal for a large team with dedicated owners per service. For a startup, this creates enormous operational overhead (20 CI pipelines, 20 K8s deployments, 20 health checks, service mesh complexity). We consolidate by **business domain** while keeping clean internal module boundaries — ready to split later if needed.

### Service Boundaries

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTITY SERVICE                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │   Auth   │  │  Users   │  │ Tenants  │  │   Branches   │   │
│  │  Module  │  │  Module  │  │  Module  │  │    Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐  │
│  │  Config  │  │ Feature  │  │           RBAC               │  │
│  │  Module  │  │  Flags   │  │  (Roles, Permissions, Scopes)│  │
│  └──────────┘  └──────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    CATALOG SERVICE                               │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Products │  │Categories│  │  Brands  │  │  Inventory   │   │
│  │  Module  │  │  Module  │  │  Module  │  │    Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────────────┐  │
│  │  Stock   │  │ Barcode/ │  │         File Upload          │  │
│  │  Module  │  │  QR Code │  │  (S3/MinIO integration)      │  │
│  └──────────┘  └──────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    COMMERCE SERVICE                              │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Orders  │  │   Cart   │  │ Wishlist │  │   Billing    │   │
│  │  Module  │  │  Module  │  │  Module  │  │    Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Payments │  │Tax (GST) │  │Discounts │  │   Delivery   │   │
│  │  Module  │  │  Module  │  │  Module  │  │    Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────────────────────────────────────┐    │
│  │ Returns  │  │              Charges Module               │    │
│  │  Module  │  │        (Packing, Shipping, Handling)      │    │
│  └──────────┘  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ENGAGEMENT SERVICE                             │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Email   │  │   SMS    │  │  Push    │  │   Reviews    │   │
│  │  Module  │  │  Module  │  │  Module  │  │    Module    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│  ┌──────────┐  ┌──────────────────────────────────────────┐    │
│  │ Reports/ │  │              Support Tickets              │    │
│  │Dashboard │  │         + Service Provider Mgmt           │    │
│  └──────────┘  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Service Responsibility Matrix

| Original Services (20) | Consolidated Into |
|---|---|
| Auth Service | Identity Service |
| User Service | Identity Service |
| Tenant Service | Identity Service |
| Config Service | Identity Service |
| Feature Flags | Identity Service |
| RBAC | Identity Service |
| Product Service | Catalog Service |
| Inventory Service | Catalog Service |
| Search Service | Catalog Service (pg_trgm) |
| File Service | Catalog Service |
| Order Service | Commerce Service |
| Billing Service | Commerce Service |
| Payment Service | Commerce Service |
| Tax Service | Commerce Service |
| Discount Service | Commerce Service |
| Delivery Service | Commerce Service |
| Notification Service | Engagement Service |
| Review Service | Engagement Service |
| Report Service | Engagement Service |
| Support Service | Engagement Service |
| Gateway Service | API Gateway (YARP) |

### .NET Solution Structure

```
billing-backend/
├── src/
│   ├── Gateway/
│   │   └── BillingGateway/           # YARP API Gateway
│   │       ├── Program.cs
│   │       ├── Middleware/
│   │       └── appsettings.json
│   │
│   ├── Services/
│   │   ├── Identity/
│   │   │   └── Identity.API/         # Identity Service
│   │   │       ├── Program.cs
│   │   │       ├── Modules/
│   │   │       │   ├── Auth/
│   │   │       │   ├── Users/
│   │   │       │   ├── Tenants/
│   │   │       │   ├── Branches/
│   │   │       │   ├── Config/
│   │   │       │   ├── FeatureFlags/
│   │   │       │   └── RBAC/
│   │   │       └── appsettings.json
│   │   │
│   │   ├── Catalog/
│   │   │   └── Catalog.API/          # Catalog Service
│   │   │       └── Modules/
│   │   │           ├── Products/
│   │   │           ├── Categories/
│   │   │           ├── Inventory/
│   │   │           ├── Stock/
│   │   │           ├── Barcode/
│   │   │           └── Files/
│   │   │
│   │   ├── Commerce/
│   │   │   └── Commerce.API/         # Commerce Service
│   │   │       └── Modules/
│   │   │           ├── Orders/
│   │   │           ├── Cart/
│   │   │           ├── Billing/
│   │   │           ├── Payments/
│   │   │           ├── Tax/
│   │   │           ├── Discounts/
│   │   │           └── Delivery/
│   │   │
│   │   └── Engagement/
│   │       └── Engagement.API/       # Engagement Service
│   │           └── Modules/
│   │               ├── Notifications/
│   │               ├── Reviews/
│   │               ├── Reports/
│   │               └── Support/
│   │
│   ├── Shared/
│   │   └── Billing.Shared/           # Shared library (NuGet package)
│   │       ├── Domain/               # Base entities, value objects
│   │       ├── Infrastructure/       # EF Core base, Redis, RabbitMQ helpers
│   │       ├── Security/             # JWT, encryption, RBAC helpers
│   │       └── Contracts/            # MassTransit message contracts
│   │
│   └── Migrations/
│       └── DatabaseMigrator/         # Migration orchestrator
│           ├── Program.cs
│           ├── EfMigrations/         # EF Core migration projects
│           └── Scripts/              # DbUp SQL scripts
│               ├── Versioned/        # V000_xxx - run once
│               └── Rerunnable/       # R000_xxx - run every deploy
│
├── tests/
│   ├── Identity.Tests/
│   ├── Catalog.Tests/
│   ├── Commerce.Tests/
│   └── Engagement.Tests/
│
├── billing-backend.sln
└── .github/workflows/
```

---

## 5. API Gateway (YARP)

YARP (Yet Another Reverse Proxy) is a Microsoft-maintained library that runs **inside a .NET process**. No separate Kong or AWS API Gateway infra needed.

### YARP Middleware Pipeline

```
Incoming Request
       │
       ▼
┌─────────────────────────────────────────────────────────┐
│                  YARP MIDDLEWARE PIPELINE                 │
│                                                         │
│  1. CorrelationId Middleware                            │
│     └─► Generate/propagate X-Correlation-Id header     │
│                                                         │
│  2. Request Logging Middleware                          │
│     └─► Log method, path, tenant, user, duration       │
│                                                         │
│  3. Rate Limiting Middleware                            │
│     └─► Per-tenant, per-user, per-IP limits            │
│     └─► Fixed window / sliding window / token bucket   │
│                                                         │
│  4. CORS Middleware                                     │
│     └─► Allow configured origins per tenant            │
│                                                         │
│  5. JWT Validation Middleware                           │
│     └─► Verify RS256 signature                         │
│     └─► Check expiry, issuer, audience                 │
│     └─► Extract tenant_id, user_id, roles              │
│     └─► Inject X-Tenant-Id, X-User-Id headers         │
│                                                         │
│  6. API Version Routing                                 │
│     └─► /api/v1/* → service-v1 cluster                 │
│     └─► /api/v2/* → service-v2 cluster                 │
│                                                         │
│  7. YARP Transform & Forward                            │
│     └─► Strip /api/v{n} prefix                         │
│     └─► Add internal auth header                       │
│     └─► Load balance across service pods               │
│                                                         │
│  8. Response Caching (optional)                         │
│     └─► Cache GET responses with Vary headers          │
│                                                         │
└─────────────────────────────────────────────────────────┘
       │
       ▼
  Upstream Service
```

### YARP Configuration (appsettings.json)

```json
{
  "ReverseProxy": {
    "Routes": {
      "identity-route": {
        "ClusterId": "identity-cluster",
        "Match": { "Path": "/api/{version}/identity/{**catch-all}" },
        "Transforms": [
          { "PathPattern": "/{**catch-all}" },
          { "RequestHeader": "X-Internal-Request", "Set": "true" }
        ]
      },
      "catalog-route": {
        "ClusterId": "catalog-cluster",
        "Match": { "Path": "/api/{version}/catalog/{**catch-all}" }
      },
      "commerce-route": {
        "ClusterId": "commerce-cluster",
        "Match": { "Path": "/api/{version}/commerce/{**catch-all}" }
      },
      "engagement-route": {
        "ClusterId": "engagement-cluster",
        "Match": { "Path": "/api/{version}/engagement/{**catch-all}" }
      }
    },
    "Clusters": {
      "identity-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "identity-1": { "Address": "http://identity-service:8080" }
        },
        "HealthCheck": {
          "Active": { "Enabled": true, "Interval": "00:00:10", "Path": "/health" }
        }
      }
    }
  }
}
```

---

## 6. JWT Authentication Flow

### RS256 Key Management

We use **RS256** (RSA + SHA256) asymmetric signing. The private key signs tokens (only Identity Service has it). The public key verifies tokens (Gateway + all services can verify).

```
Key Generation (one-time, per environment):
──────────────────────────────────────────
openssl genrsa -out jwt-private.pem 4096
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem

Storage:
  jwt-private.pem  →  Azure Key Vault / AWS Secrets Manager (ONLY Identity Service reads this)
  jwt-public.pem   →  Stored as a non-secret config (can be public, read by all services)
```

### JWT Token Lifecycle

```
┌────────┐        ┌───────────┐      ┌──────────────┐      ┌─────────┐
│ Client │        │  Gateway  │      │   Identity   │      │  Redis  │
│        │        │  (YARP)   │      │   Service    │      │  Cache  │
└───┬────┘        └─────┬─────┘      └──────┬───────┘      └────┬────┘
    │                   │                   │                    │
    │  POST /auth/login │                   │                    │
    │──────────────────►│                   │                    │
    │                   │  Forward request  │                    │
    │                   │──────────────────►│                    │
    │                   │                   │ Validate creds     │
    │                   │                   │ Load tenant+user   │
    │                   │                   │ Load roles+perms   │
    │                   │                   │                    │
    │                   │                   │ Sign JWT (RS256)   │
    │                   │                   │  {                 │
    │                   │                   │   sub: user_id     │
    │                   │                   │   tid: tenant_id   │
    │                   │                   │   bid: branch_id   │
    │                   │                   │   roles: [...]     │
    │                   │                   │   perms: [...]     │
    │                   │                   │   exp: now+15min   │
    │                   │                   │   jti: uuid        │
    │                   │                   │  }                 │
    │                   │                   │                    │
    │                   │                   │ Store refresh_token│
    │                   │                   │──────────────────►│
    │                   │                   │  Key: refresh:{jti}│
    │                   │                   │  TTL: 7 days       │
    │                   │                   │                    │
    │◄──────────────────│◄──────────────────│                    │
    │  {access_token,   │                   │                    │
    │   refresh_token,  │                   │                    │
    │   expires_in}     │                   │                    │
    │                   │                   │                    │
    │ Store tokens:     │                   │                    │
    │  access  → memory (Flutter state)     │                    │
    │  refresh → SecureStorage (device)     │                    │
    │                   │                   │                    │
    │  API Request +    │                   │                    │
    │  Bearer {token}   │                   │                    │
    │──────────────────►│                   │                    │
    │                   │ Verify RS256 sig  │                    │
    │                   │ Check exp, iss    │                    │
    │                   │ Extract claims    │                    │
    │                   │ Inject headers    │                    │
    │                   │   X-Tenant-Id     │                    │
    │                   │   X-User-Id       │                    │
    │                   │   X-User-Roles    │                    │
    │                   │──────────────────►│ (to upstream svc)  │
    │                   │                   │                    │
```

### Token Refresh Flow

```
Client                 Gateway              Identity Service       Redis
  │                      │                        │                 │
  │  POST /auth/refresh  │                        │                 │
  │  {refresh_token}     │                        │                 │
  │─────────────────────►│                        │                 │
  │                      │──────────────────────►│                 │
  │                      │                        │  GET refresh:{jti}
  │                      │                        │────────────────►│
  │                      │                        │◄────────────────│
  │                      │                        │  Validate match │
  │                      │                        │  Rotate token   │
  │                      │                        │  (invalidate old│
  │                      │                        │   jti in Redis) │
  │                      │                        │  Issue new pair │
  │◄─────────────────────│◄───────────────────────│                 │
  │  {new_access_token,  │                        │                 │
  │   new_refresh_token} │                        │                 │
```

### Logout & Token Revocation

```
Client                 Gateway              Identity Service       Redis
  │                      │                        │                 │
  │  POST /auth/logout   │                        │                 │
  │  Bearer {token}      │                        │                 │
  │─────────────────────►│                        │                 │
  │                      │──────────────────────►│                 │
  │                      │                        │  DEL refresh:{jti}
  │                      │                        │────────────────►│
  │                      │                        │                 │
  │                      │                        │  ADD to blocklist:
  │                      │                        │  blocked:{jti} TTL=15min
  │                      │                        │────────────────►│
  │◄─────────────────────│◄───────────────────────│                 │

Gateway Validation (after logout):
  ├─ Verify signature ✓
  ├─ Check expiry ✓
  └─ Check Redis blocklist → blocked:{jti} EXISTS → REJECT 401
```

### JWT Payload Structure

```json
{
  "sub": "usr_01HQKZ9X8Y7W6V5U4T3S2R1Q",
  "jti": "01HQKZ9X8Y7W6V5U4T3S2R1Q",
  "iss": "https://api.billing.app",
  "aud": "billing-app",
  "iat": 1712000000,
  "exp": 1712000900,
  "tid": "ten_01HQKZ9X8Y7W6V5U4T3S2R1Q",
  "bid": "brn_01HQKZ9X8Y7W6V5U4T3S2R1Q",
  "roles": ["admin", "billing_manager"],
  "perms": ["orders:read", "orders:write", "billing:read"],
  "plan": "growth",
  "email": "user@tenant.com"
}
```

### Flutter Token Storage

```dart
// Secure token storage on device
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage();

  // Access token in memory only (NOT persisted to storage)
  static String? _accessToken;

  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: 'refresh_token', value: token);
  }

  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: 'refresh_token');
  }

  static void setAccessToken(String token) {
    _accessToken = token; // Memory only
  }

  static String? getAccessToken() => _accessToken;

  static Future<void> clearAll() async {
    _accessToken = null;
    await _storage.deleteAll();
  }
}
```

---

## 7. Database Architecture (PostgreSQL + RLS)

### Why PostgreSQL (Single DB, Multi-Schema + RLS)?

| Factor | PostgreSQL Multi-Schema | Separate DB per tenant |
|---|---|---|
| **Cost** | 1 DB instance | N DB instances |
| **Ops complexity** | Low | High |
| **Isolation** | RLS (strong) | Physical (strongest) |
| **Migrations** | 1 operation | N operations |
| **Backup** | 1 backup job | N backup jobs |
| **Cross-tenant queries** | Possible (admin) | Impossible |
| **Scale limit** | ~10k tenants/DB | Unlimited |

### Database Schema Layout

```
PostgreSQL Database: billing_db
│
├── Schema: identity
│   ├── tenants
│   ├── branches
│   ├── users
│   ├── user_roles
│   ├── roles
│   ├── permissions
│   ├── role_permissions
│   ├── refresh_tokens
│   ├── feature_flags
│   └── tenant_config
│
├── Schema: catalog
│   ├── products
│   ├── product_variants
│   ├── categories
│   ├── brands
│   ├── inventory_locations
│   ├── stock_entries
│   ├── stock_adjustments
│   ├── barcodes
│   └── files
│
├── Schema: commerce
│   ├── orders
│   ├── order_items
│   ├── carts
│   ├── cart_items
│   ├── invoices
│   ├── invoice_items
│   ├── payments
│   ├── payment_transactions
│   ├── gst_rates
│   ├── hsn_codes
│   ├── discounts
│   ├── offers
│   ├── deliveries
│   └── returns
│
├── Schema: engagement
│   ├── notifications
│   ├── notification_templates
│   ├── reviews
│   ├── reports
│   ├── support_tickets
│   └── service_providers
│
└── Schema: _migrations
    ├── ef_migrations_history
    └── dbup_scripts_run
```

### Row-Level Security (RLS) Tenant Isolation

```sql
-- Every table has a tenant_id column
-- RLS policy checks current_setting('app.tenant_id')
-- Gateway injects X-Tenant-Id → Service sets app.tenant_id

-- Setting tenant context at start of each request:
SET LOCAL app.tenant_id = 'ten_01HQKZ9X8Y7W6V5U4T3S2R1Q';
SET LOCAL app.user_id   = 'usr_01HQKZ9X8Y7W6V5U4T3S2R1Q';

-- Example RLS policy on orders table:
ALTER TABLE commerce.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON commerce.orders
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

### EF Core: Setting RLS Context (Interceptor)

```csharp
// Automatically set tenant context before each query
public class TenantContextInterceptor : DbCommandInterceptor
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        var tenantId = _httpContextAccessor.HttpContext?
            .Request.Headers["X-Tenant-Id"].FirstOrDefault();

        if (!string.IsNullOrEmpty(tenantId))
        {
            command.CommandText =
                $"SET LOCAL app.tenant_id = '{tenantId}';\n" +
                command.CommandText;
        }

        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }
}
```

### Database Connectivity Flow

```
Service Pod (e.g., Commerce.API)
    │
    │  Connection String from Azure Key Vault:
    │  Host=postgres-primary;Port=5432;
    │  Database=billing_db;Username=commerce_user;
    │  Password=<secret>;SSL Mode=Require;
    │
    ▼
┌─────────────────────────────────┐
│     PgBouncer (Connection Pool) │
│     (sidecar or dedicated pod)  │
│     pool_size=20 per service    │
└─────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────┐
│   PostgreSQL Primary            │
│   (Read-Write)                  │
│                                 │
│   ┌─────────────────────────┐   │
│   │ Streaming Replication   │   │
│   └──────────┬──────────────┘   │
└──────────────┼──────────────────┘
               │
    ┌──────────▼──────────┐
    │  PostgreSQL Replica │
    │  (Read-Only)        │
    │  Used by: Reports,  │
    │  Analytics, Exports │
    └─────────────────────┘
```

---

## 8. Redis Cache Architecture

### Redis Usage Patterns

```
┌────────────────────────────────────────────────────────────┐
│                    REDIS USAGE MAP                          │
│                                                            │
│  Database 0: Sessions & Auth                               │
│  ─────────────────────────────                             │
│  refresh:{jti}         → refresh token data, TTL 7d        │
│  blocked:{jti}         → revoked tokens, TTL 15min         │
│  session:{user_id}     → active session info, TTL 1h       │
│                                                            │
│  Database 1: Application Cache                             │
│  ─────────────────────────────                             │
│  tenant:{id}:config    → tenant configuration, TTL 1h      │
│  tenant:{id}:features  → feature flags, TTL 30min          │
│  product:{id}          → product detail, TTL 15min         │
│  category:list:{tid}   → category tree, TTL 30min          │
│  gst_rates             → GST rate table, TTL 24h           │
│  hsn:{code}            → HSN code details, TTL 24h         │
│                                                            │
│  Database 2: Real-time & Pub/Sub                           │
│  ─────────────────────────────                             │
│  cart:{user_id}        → cart contents, TTL 24h            │
│  stock:{product_id}    → live stock count, TTL 5min        │
│  pubsub: order-updates → order status stream               │
│  pubsub: notifications → push notification stream          │
│                                                            │
│  Database 3: Distributed Locks                             │
│  ─────────────────────────────                             │
│  lock:invoice:{tid}    → invoice generation lock, TTL 30s  │
│  lock:stock:{prod_id}  → stock reservation lock, TTL 10s   │
│  lock:payment:{order}  → payment processing lock, TTL 60s  │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Cache Invalidation Strategy

```csharp
// Pattern: Cache-Aside with explicit invalidation
public class ProductService
{
    private const string CacheKey = "product:{0}";
    private const int CacheTtlMinutes = 15;

    public async Task<Product?> GetByIdAsync(Guid productId)
    {
        var key = string.Format(CacheKey, productId);

        // 1. Check cache
        var cached = await _redis.GetAsync<Product>(key);
        if (cached != null) return cached;

        // 2. Load from DB
        var product = await _db.Products.FindAsync(productId);
        if (product == null) return null;

        // 3. Store in cache
        await _redis.SetAsync(key, product, TimeSpan.FromMinutes(CacheTtlMinutes));
        return product;
    }

    public async Task UpdateAsync(Product product)
    {
        await _db.SaveChangesAsync();

        // Invalidate affected cache keys
        var key = string.Format(CacheKey, product.Id);
        await _redis.DeleteAsync(key);

        // Also invalidate category lists that may include this product
        await _redis.DeleteByPatternAsync($"category:list:{product.TenantId}:*");
    }
}
```

---

## 9. CDN Flow (Cloudflare)

### What Cloudflare Handles

```
Internet User
     │
     ▼
┌────────────────────────────────────────────────────────┐
│                   CLOUDFLARE EDGE                       │
│                                                        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  DNS Resolution (ns1.cloudflare.com)             │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  DDoS Protection (Always-on)                     │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  WAF (Web Application Firewall)                  │  │
│  │  • Block SQLi, XSS, CSRF                         │  │
│  │  • OWASP Top 10 rules                            │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  SSL/TLS Termination (Free wildcard cert)        │  │
│  │  • billing.app → HTTPS                           │  │
│  │  • api.billing.app → HTTPS                       │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Edge Cache (Static Assets Only)                 │  │
│  │  • Flutter Web build files (JS, CSS, fonts)      │  │
│  │  • Product images, invoice PDFs                  │  │
│  │  • Cache-Control: max-age=31536000 (1 year)      │  │
│  │  • API requests: Cache-Control: no-store         │  │
│  └─────────────────────────────────────────────────┘  │
│                         │                              │
└─────────────────────────┼──────────────────────────────┘
                          │  (cache MISS only)
                          ▼
               ┌──────────────────┐
               │   Origin Server   │
               │  (K8s Ingress /  │
               │   Load Balancer) │
               └──────────────────┘
```

### Cloudflare Configuration (Free Tier Capabilities)

| Feature | Free Tier | Pro ($20/mo) |
|---|---|---|
| DDoS Protection | ✅ Unlimited | ✅ Enhanced |
| SSL/TLS (Wildcard) | ✅ Free | ✅ Free |
| CDN Edge Caching | ✅ | ✅ |
| WAF | ❌ | ✅ Managed rules |
| Rate Limiting | ❌ | ✅ |
| Bot Management | ❌ | ✅ |
| Image Optimization | ❌ | ✅ |

**Recommendation**: Start with Free tier. Upgrade to Pro ($20/mo) once revenue starts.

---

## 10. Message Bus (RabbitMQ + MassTransit)

### Why RabbitMQ + MassTransit?

- MassTransit is the de-facto standard for .NET service bus
- Abstracts transport (can swap RabbitMQ → Azure Service Bus → AWS SQS with config change)
- Provides sagas for distributed transactions (e.g., order-payment-inventory saga)
- Built-in retry policies, dead-letter queues, and message scheduling

### Event Flow

```
Commerce Service                RabbitMQ                  Engagement Service
     │                             │                             │
     │  Publish: OrderPlaced       │                             │
     │  {order_id, tenant_id,      │                             │
     │   customer, items, total}   │                             │
     │────────────────────────────►│                             │
     │                             │  Consume: OrderPlaced       │
     │                             │────────────────────────────►│
     │                             │                             │ Send confirmation email
     │                             │                             │ Send SMS
     │                             │                             │ Send push notification
     │                             │                             │
     │                             │  Consume: OrderPlaced       │
     │                             │──────────────────────────► Catalog Service
     │                             │                             │ Reserve stock
     │                             │                             │ Update inventory
     │
     │  Publish: PaymentCompleted  │                             │
     │────────────────────────────►│                             │
     │                             │  Consume: PaymentCompleted ►│ Generate invoice PDF
     │                             │  Consume: PaymentCompleted ►│ Update order status
     │                             │  Consume: PaymentCompleted ►│ Release stock hold
```

### Key Events

| Event | Publisher | Subscribers |
|---|---|---|
| `TenantRegistered` | Identity | Engagement (welcome email) |
| `OrderPlaced` | Commerce | Catalog (reserve stock), Engagement (confirmation) |
| `PaymentCompleted` | Commerce | Commerce (generate invoice), Engagement (receipt) |
| `PaymentFailed` | Commerce | Engagement (failure notification) |
| `StockLow` | Catalog | Engagement (alert notification) |
| `InvoiceGenerated` | Commerce | Engagement (send PDF) |
| `SubscriptionExpiring` | Identity | Engagement (renewal reminder) |

---

## 11. Database Management Strategy

### Two-Tool Approach

```
┌──────────────────────────────────────────────────────────────┐
│                DATABASE MANAGEMENT STRATEGY                   │
│                                                              │
│  Tool 1: EF Core Migrations                                  │
│  ─────────────────────────                                   │
│  Manages: Tables, Columns, Indexes, Foreign Keys             │
│  How: C# model → migration file → SQL                        │
│  When: Schema structural changes                              │
│                                                              │
│  Tool 2: DbUp SQL Scripts                                     │
│  ────────────────────────                                    │
│  Manages: Views, Functions, Procedures, Triggers,            │
│           RLS Policies, Seed Data                            │
│  How: SQL files in version-ordered directories               │
│  When: Business logic in DB layer                            │
│                                                              │
│  Orchestrator: DatabaseMigrator (Program.cs)                 │
│  ─────────────────────────────                               │
│  1. Connect to database                                      │
│  2. Run EF Core migrations (if any pending)                  │
│  3. Run DbUp Versioned scripts (V*.sql) - run once           │
│  4. Run DbUp Rerunnable scripts (R*.sql) - run every deploy  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Script Naming Convention

```
src/Migrations/DatabaseMigrator/Scripts/
├── Versioned/                    # Run ONCE, never again
│   ├── V000_001__CreateSchemas.sql
│   ├── V000_002__InstallExtensions.sql
│   ├── V001_001__CreateIdentityTables.sql   # (from EF Core migration)
│   ├── V001_002__CreateCatalogTables.sql
│   ├── V002_001__AddColumnXxx.sql
│   └── V999_001__SeedGSTRates.sql
│
└── Rerunnable/                   # Run on EVERY deploy (idempotent)
    ├── R000_001__RlsPolicies.sql
    ├── R000_002__Views.sql
    ├── R000_003__Functions.sql
    └── R000_004__Triggers.sql
```

### Migration Execution Flow

```
DatabaseMigrator starts
         │
         ▼
  Connect to PostgreSQL
  (retry with exponential backoff)
         │
         ▼
  ┌──────────────────────────────┐
  │   EF Core Migrations         │
  │   Check __EFMigrationsHistory│
  │   Apply pending migrations   │
  └──────────────┬───────────────┘
                 │
         ▼
  ┌──────────────────────────────┐
  │   DbUp Versioned Scripts     │
  │   Check SchemaVersions table │
  │   Run any new V*.sql files   │
  └──────────────┬───────────────┘
                 │
         ▼
  ┌──────────────────────────────┐
  │   DbUp Rerunnable Scripts    │
  │   Always run R*.sql files    │
  │   (must be idempotent)       │
  └──────────────┬───────────────┘
                 │
         ▼
  Exit 0 (success) or Exit 1 (failure)
  (K8s init container waits for Exit 0)
```

### 2-Phase Migration for Breaking Changes

```
┌─────────────────────────────────────────────────────────────────┐
│             2-PHASE MIGRATION STRATEGY                           │
│                                                                 │
│  Problem: Rename column old_name → new_name                     │
│  Risk: Old service pods still use old_name during deploy        │
│                                                                 │
│  Phase 1 (Deploy): Add new column, dual-write, dual-read        │
│  ─────────────────────────────────────────────────────         │
│  Migration:                                                     │
│    ALTER TABLE ADD COLUMN new_name TEXT;                        │
│    CREATE TRIGGER sync_columns UPDATE old_name → new_name       │
│  Code:                                                          │
│    Read: try new_name, fallback to old_name                     │
│    Write: write to BOTH columns                                 │
│                                                                 │
│  Phase 2 (Next sprint): Remove old column                       │
│  ───────────────────────────────────────                        │
│  After ALL pods have updated code:                              │
│    DROP TRIGGER sync_columns                                    │
│    ALTER TABLE DROP COLUMN old_name                             │
│  Code:                                                          │
│    Read: only new_name                                          │
│    Write: only new_name                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Repository Strategy (3-Repo Hybrid)

### Why 3 Repos?

| Concern | Solution |
|---|---|
| Independent deployment | Frontend and backend deploy on different schedules |
| Security | Infrastructure secrets isolated from app code |
| CI/CD efficiency | Path-filtered workflows prevent unnecessary builds |
| Team autonomy | Frontend, backend, infra teams work independently |

### Repository Structure

#### `billing-backend` (Monorepo with path filtering)

```
billing-backend/
├── src/
│   ├── Gateway/BillingGateway/
│   ├── Services/Identity/Identity.API/
│   ├── Services/Catalog/Catalog.API/
│   ├── Services/Commerce/Commerce.API/
│   ├── Services/Engagement/Engagement.API/
│   ├── Shared/Billing.Shared/
│   └── Migrations/DatabaseMigrator/
├── tests/
├── billing-backend.sln
└── .github/workflows/
    ├── ci-pr.yml           # Quality gates on PR
    ├── deploy-identity.yml # Triggered on src/Services/Identity/** change
    ├── deploy-catalog.yml  # Triggered on src/Services/Catalog/** change
    ├── deploy-commerce.yml # Triggered on src/Services/Commerce/** change
    ├── deploy-engagement.yml
    └── deploy-gateway.yml
```

#### `billing-frontend` (Flutter monorepo)

```
billing-frontend/
├── lib/
│   ├── core/               # DI, router, theme, localization
│   ├── features/           # Feature-first organization
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   ├── billing/
│   │   └── reports/
│   ├── shared/             # Shared widgets, models, utils
│   └── main.dart
├── web/                    # Flutter Web assets
├── android/                # Android project
├── ios/                    # iOS project
├── linux/                  # POS Desktop (Linux)
├── windows/                # POS Desktop (Windows)
└── .github/workflows/
    ├── ci-pr.yml
    ├── deploy-web.yml
    └── deploy-mobile.yml
```

#### `billing-infrastructure` (Terraform + K8s)

```
billing-infrastructure/
├── terraform/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── modules/
│       ├── kubernetes/
│       ├── postgres/
│       ├── redis/
│       └── networking/
├── kubernetes/
│   ├── base/               # Kustomize base configs
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
└── .github/workflows/
    ├── terraform-plan.yml
    └── terraform-apply.yml
```

---

## 13. CI/CD Pipeline

### PR Quality Gates (ci-pr.yml)

```
PR Opened/Updated
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│                 DETECT CHANGES (path filter)              │
│  identity/* │ catalog/* │ commerce/* │ engagement/* │ gateway/*
└──────────────────────────────────────────────────────────┘
       │
       ├─── For each changed service:
       │
       ▼
┌──────────────────────┐   ┌──────────────────────┐
│    BUILD & TEST       │   │   CODE QUALITY        │
│                       │   │                      │
│  dotnet build         │   │  dotnet format check │
│  dotnet test          │   │  dotnet analyzers    │
│  (unit + integration) │   │  SonarCloud scan     │
│                       │   │  Snyk security scan  │
└──────────┬────────────┘   └──────────┬───────────┘
           │                           │
           └──────────┬────────────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  CODE COVERAGE       │
           │                      │
           │  Minimum: 80%        │
           │  Report to PR        │
           │  Fail if below       │
           └──────────┬───────────┘
                      │
                      ▼
           ┌──────────────────────┐
           │  MIGRATION VALIDATE  │
           │                      │
           │  Start fresh PG      │
           │  Run DatabaseMigrator│
           │  Verify exit code 0  │
           └──────────┬───────────┘
                      │
                      ▼
                ✅ PR Ready
```

### Deployment Pipeline (deploy-service.yml)

```
Merge to main (or release tag)
       │
       ▼
┌──────────────────────┐
│  BUILD MIGRATOR      │
│  Docker build        │
│  Push to registry    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  RUN MIGRATIONS      │
│  K8s Job: migrator   │
│  Wait for exit 0     │
│  Fail if exit != 0   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  BUILD SERVICE       │
│  Docker build        │
│  Tag with git SHA    │
│  Push to registry    │
└──────────┬───────────┘
           │
           ├──────────────► Staging
           │                Rolling deploy
           │                Smoke tests
           │                Wait for approval
           │
           └──────────────► Production
                            Rolling deploy (max 1 pod unavailable)
                            Health check monitoring
```

### Path-Based CI/CD Triggers

```yaml
# Only trigger identity deployment when identity code changes
on:
  push:
    branches: [main]
    paths:
      - 'src/Services/Identity/**'
      - 'src/Shared/**'         # Shared lib change affects all
      - 'src/Migrations/**'     # Migration change affects all
```

---

## 14. Source Code & Release Versioning

### Trunk-Based Branching Strategy

```
main (trunk)
  │
  ├─── feature/add-gst-calculation  (short-lived, < 3 days)
  │         └─────────────────────► PR → merge to main
  │
  ├─── fix/invoice-number-bug       (short-lived)
  │         └─────────────────────► PR → merge to main
  │
  ├─── release/v1.2.0               (release branch, no direct commit)
  │         └─── hotfix/fix-payment-crash
  │                   └──────────────────► cherry-pick to main too
  │
  └─── main
           └─── Tag: v1.2.0, v1.3.0, v2.0.0
```

### Rules

1. **No long-lived feature branches** (>3 days → break into smaller PRs)
2. **Feature flags** for incomplete features (merge dark code behind a flag)
3. **All changes via PR** (no direct commits to main)
4. **Semantic versioning** for releases: `MAJOR.MINOR.PATCH`
5. **Release branches** only for patch releases on old versions

### API Version Coexistence

```
API Versioning Strategy: URL Path Versioning

GET /api/v1/commerce/orders        ← Served by Commerce v1 pods
GET /api/v2/commerce/orders        ← Served by Commerce v2 pods

Both versions run simultaneously. YARP routes by version prefix.
```

```
YARP Routes:
  /api/v1/* → commerce-v1 cluster (older pods)
  /api/v2/* → commerce-v2 cluster (newer pods)

Deprecation lifecycle:
  1. v2 released → v1 gets "Sunset" response header (3-month warning)
  2. After 3 months → v1 returns 410 Gone with migration guide URL
  3. v1 infrastructure decommissioned

Response Header for deprecated endpoints:
  Sunset: Sat, 01 Jul 2026 00:00:00 GMT
  Deprecation: true
  Link: <https://docs.billing.app/migration/v1-to-v2>; rel="deprecation"
```

---

## 15. Environment Setup

### Environment Overview

| Aspect | Dev | Staging | Production |
|---|---|---|---|
| **Infrastructure** | Docker Compose (local) | K8s (1 node) | K8s (multi-node) |
| **Database** | Local PostgreSQL | Single instance | Primary + Replica |
| **Redis** | Local Redis | Single instance | Redis Cluster |
| **RabbitMQ** | Local RabbitMQ | Single instance | RabbitMQ Cluster |
| **Replicas per service** | 1 | 1 | 2-10 (HPA) |
| **Auto-scaling** | No | No | Yes |
| **Migrations** | Manual (`dotnet run`) | Auto (K8s Job) | Auto (K8s Job) |
| **Secrets** | `appsettings.Development.json` | Azure Key Vault | Azure Key Vault |
| **Monitoring** | Local Grafana | Basic dashboards | Full observability |
| **SSL** | Self-signed | Let's Encrypt | Cloudflare |
| **CDN** | None | Cloudflare dev zone | Cloudflare prod |

### Environment Variables Per Service

```bash
# Common across all services
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<from secrets>
Redis__ConnectionString=<from secrets>
RabbitMQ__Host=<from secrets>
JWT__PublicKey=<RS256 public key PEM>
Cloudflare__ApiToken=<from secrets>

# Identity Service only (has private key)
JWT__PrivateKey=<RS256 private key PEM - from Key Vault>

# Service-specific
S3__BucketName=billing-files-prod
S3__Region=ap-south-1
Email__ApiKey=<SendGrid from secrets>
SMS__ApiKey=<Twilio from secrets>
```

---

## 16. Auto-Scaling Rules

### Kubernetes HPA Configuration

```yaml
# Production scaling rules per service
─────────────────────────────────────────────────────────

Identity Service:
  minReplicas: 2        # Always 2 for HA
  maxReplicas: 10
  scaleUp:   CPU > 70% for 60s → add 2 pods
  scaleDown: CPU < 30% for 300s → remove 1 pod

Catalog Service:
  minReplicas: 2
  maxReplicas: 20       # High traffic (product browsing)
  scaleUp:   CPU > 60% for 30s → add 3 pods
  scaleDown: CPU < 20% for 300s → remove 1 pod

Commerce Service:
  minReplicas: 3        # Critical service, higher minimum
  maxReplicas: 30
  scaleUp:   CPU > 60% OR Memory > 75% for 30s → add 3 pods
  scaleDown: CPU < 20% AND Memory < 40% for 600s → remove 1 pod

Engagement Service:
  minReplicas: 1        # Non-critical, async
  maxReplicas: 10
  scaleUp:   Queue depth > 1000 messages for 60s → add 2 pods
  scaleDown: Queue depth < 100 for 600s → remove 1 pod

API Gateway (YARP):
  minReplicas: 2
  maxReplicas: 10
  scaleUp:   CPU > 50% for 30s → add 2 pods
  scaleDown: CPU < 20% for 300s → remove 1 pod
```

### Scaling by Environment

```
DEV: No auto-scaling. Fixed 1 replica.

STAGING: Manual scaling only.
  kubectl scale deployment identity --replicas=2

PRODUCTION: HPA enabled.
  Custom metrics from RabbitMQ queue depth via KEDA
  (Kubernetes Event-Driven Autoscaling)
  for Engagement Service queue-based scaling.
```

---

## 17. Secrets Management

### Secret Categories & Storage

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECRETS MANAGEMENT                             │
│                                                                  │
│  Category            | Storage              | Rotation           │
│  ─────────────────── | ─────────────────── | ──────────────────  │
│  DB Passwords        | Azure Key Vault      | 90 days            │
│  JWT Private Key     | Azure Key Vault      | 1 year             │
│  JWT Public Key      | K8s ConfigMap        | On private key rot │
│  Redis Password      | Azure Key Vault      | 90 days            │
│  RabbitMQ Creds      | Azure Key Vault      | 90 days            │
│  Email API Key       | Azure Key Vault      | 180 days           │
│  SMS API Key         | Azure Key Vault      | 180 days           │
│  Payment Gateway Key | Azure Key Vault      | On vendor request  │
│  Cloudflare Token    | Azure Key Vault      | 180 days           │
│  S3 Access Keys      | Azure Key Vault      | 90 days            │
│                                                                  │
│  Access Pattern:                                                 │
│  K8s Pod → Workload Identity → Key Vault → Mount as env var      │
│                                                                  │
│  Azure Key Vault integration:                                    │
│  - Pod has Azure Managed Identity (no credentials in code)       │
│  - Secrets Injector (CSI Driver) mounts secrets as files         │
│  - Kubernetes ExternalSecret syncs to K8s Secret                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Never Store Secrets In

- ❌ Source code
- ❌ Docker images
- ❌ Kubernetes manifests (use ExternalSecret)
- ❌ GitHub Actions secrets (only for non-sensitive deploy tokens)
- ❌ `appsettings.json` committed to git

---

## 18. Cross-Repo Deployment Coordination

### Deployment Order

```
Infrastructure changes (billing-infrastructure):
  terraform apply → K8s cluster updated
       │
       ▼
Database changes (billing-backend: DatabaseMigrator):
  K8s Job: run-migrations → exit 0
       │
       ▼
Service deployments (billing-backend: services):
  Rolling deploy (one pod at a time)
  Health check: /health endpoint must return 200
  Readiness probe: /ready endpoint must return 200
       │
       ▼
Frontend deployment (billing-frontend):
  Flutter Web build → Cloudflare Pages deploy
  Mobile: App store review / release
```

### Cross-Repo Triggers (GitHub Actions)

```yaml
# In billing-backend: after successful deploy to staging
- name: Trigger frontend integration tests
  uses: actions/github-script@v7
  with:
    github-token: ${{ secrets.CROSS_REPO_TOKEN }}
    script: |
      await github.rest.actions.createWorkflowDispatch({
        owner: 'antonyrobin',
        repo: 'billing-frontend',
        workflow_id: 'integration-tests.yml',
        ref: 'main',
        inputs: {
          backend_url: 'https://staging-api.billing.app'
        }
      });
```

---

## 19. Cloud Cost Comparison

### Phase 1: MVP (0–1k tenants, <10k req/min)

| Resource | DigitalOcean | Azure | AWS | GCP |
|---|---|---|---|---|
| **Compute** (4 svcs + gateway, 1 replica each) | $40 (2x $20 droplets) | $80 (2x B2s) | $72 (2x t3.small) | $68 (2x e2-small) |
| **Database** (PostgreSQL, 1GB RAM) | $15 (managed) | $50 (Azure DB) | $45 (RDS t3.micro) | $46 (Cloud SQL) |
| **Cache** (Redis, 1GB) | $15 (managed) | $55 (Azure Cache) | $25 (ElastiCache t3) | $35 (Memorystore) |
| **Storage** (50GB) | $5 (Spaces) | $1 (Blob) | $1 (S3) | $1 (GCS) |
| **CDN** | $0 (Cloudflare free) | $0 (Cloudflare) | $0 (Cloudflare) | $0 (Cloudflare) |
| **Message Queue** | $0 (self-hosted on K8s) | $10 (Service Bus) | $0 (self-hosted) | $0 (self-hosted) |
| **Monitoring** | $0 (Grafana OSS) | $0 (Grafana OSS) | $0 (Grafana OSS) | $0 (Grafana OSS) |
| **CI/CD** | $0 (GitHub Free) | $0 (GitHub Free) | $0 (GitHub Free) | $0 (GitHub Free) |
| **K8s** | $12 (DOKS) | $0 (AKS free tier) | $72 (EKS) | $0 (GKE free tier) |
| **Total/month** | **~$87** | **~$196** | **~$215** | **~$150** |

### Phase 2: Growth (1k–10k tenants, 10k–100k req/min)

| Resource | DigitalOcean | Azure | AWS | GCP |
|---|---|---|---|---|
| **Compute** (2 replicas each, autoscaling) | $160 | $320 | $288 | $272 |
| **Database** (Primary + Read Replica) | $100 | $200 | $180 | $190 |
| **Cache** (Redis Cluster, 4GB) | $60 | $220 | $100 | $140 |
| **Storage** (500GB) | $25 | $10 | $12 | $10 |
| **CDN** | $20 (CF Pro) | $20 (CF Pro) | $20 (CF Pro) | $20 (CF Pro) |
| **Message Queue** (RabbitMQ Cluster) | $40 | $80 | $60 | $50 |
| **Monitoring** (Grafana Cloud) | $0 (free tier) | $0 | $0 | $0 |
| **CI/CD** | $0 | $0 | $0 | $0 |
| **Load Balancer** | $12 | $25 | $20 | $18 |
| **Total/month** | **~$417** | **~$875** | **~$680** | **~$700** |

### Phase 3: Scale (10k+ tenants, 100k+ req/min)

| Resource | DigitalOcean | Azure | AWS | GCP |
|---|---|---|---|---|
| **Compute** (3-10 replicas, HPA) | $800 | $1,600 | $1,440 | $1,360 |
| **Database** (Primary + 2 Replicas + PgBouncer) | $400 | $800 | $720 | $760 |
| **Cache** (Redis Cluster, 16GB) | $200 | $880 | $400 | $560 |
| **Storage** (5TB) | $125 | $100 | $115 | $85 |
| **CDN** | $200 (CF Business) | $200 (CF Business) | $200 (CF Business) | $200 (CF Business) |
| **Message Queue** (RabbitMQ HA) | $160 | $320 | $240 | $200 |
| **Monitoring** (Grafana Cloud) | $299 | $299 | $299 | $299 |
| **K8s** (multi-node) | $480 | $0 | $288 | $0 |
| **Networking/LB** | $60 | $100 | $80 | $70 |
| **Total/month** | **~$2,724** | **~$4,299** | **~$3,782** | **~$3,534** |

### Recommendation

```
MVP Phase:    DigitalOcean ($87/mo) — simplest, cheapest for startups
Growth Phase: DigitalOcean ($417/mo) or AWS ($680/mo) if team knows AWS
Scale Phase:  AWS or GCP — richer managed service ecosystem

Why DigitalOcean for startup:
  ✅ Predictable pricing (no surprise bills)
  ✅ Simpler than AWS (less configuration overhead)
  ✅ Managed PostgreSQL + Redis + K8s in one place
  ✅ Great developer experience
  ✅ Easy migration to AWS/GCP when needed (containers are portable)
```

---

## 20. Migration Execution Flow

### Complete Migration Lifecycle

```
Developer writes new EF migration:
  dotnet ef migrations add AddInvoiceTable
  → Creates: /src/Migrations/DatabaseMigrator/EfMigrations/20260402_AddInvoiceTable.cs

Developer adds DbUp script:
  → Creates: /Scripts/Rerunnable/R000_005__InvoiceView.sql
  → Creates: /Scripts/Versioned/V002_001__InvoiceSeeds.sql

PR pipeline validates:
  → Spins up fresh PostgreSQL (Docker in GitHub Actions)
  → Runs DatabaseMigrator against fresh DB
  → Verifies all tables/views/functions created correctly
  → Reports any SQL syntax errors

After merge to main:
  → CI builds DatabaseMigrator Docker image
  → Tags with git SHA

Deploy to staging:
  → K8s Job: run-migrations-staging
  → Connects to staging DB
  → Runs all pending migrations
  → Exits 0 → K8s service deployment proceeds

Deploy to production:
  → Manual approval required (GitHub Environments protection)
  → K8s Job: run-migrations-prod
  → Same process as staging
  → Automatically rolls back if Job fails
```

---

*This document is the primary architecture reference for the billing software team. It supersedes the decisions in architecture.md where there are conflicts. All new development should follow the patterns and conventions described here.*
