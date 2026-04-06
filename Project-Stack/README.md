# 🛠️ Project Stack — Technology Reference Guide

> **Project:** Billing Software Platform
> **Last Updated:** 2026-04-06
> **Related:** [proposed-architecture.md](../proposed-architecture.md) | [development-phases.md](../development-phases.md)

---

## Overview

This directory contains detailed technology reference guides for every component in our billing software stack. Each file covers purpose, setup, development procedures, best practices, deployment, and project-specific conventions.

---

## Technology Map

| # | Technology | File | Layer | Version |
|---|---|---|---|---|
| 1 | **Next.js** | [nextjs.md](./nextjs.md) | Frontend (Web) | 15.x |
| 2 | **Flutter** | [flutter.md](./flutter.md) | Frontend (Mobile & Desktop) | 3.x |
| 3 | **.NET Web API** | [dotnet-web-api.md](./dotnet-web-api.md) | Backend | 9.0 |
| 4 | **YARP** | [yarp-api-gateway.md](./yarp-api-gateway.md) | API Gateway | 2.x |
| 5 | **PostgreSQL** | [postgresql.md](./postgresql.md) | Database | 16 |
| 6 | **Redis** | [redis.md](./redis.md) | Cache & Sessions | 7.x |
| 7 | **RabbitMQ + MassTransit** | [rabbitmq-masstransit.md](./rabbitmq-masstransit.md) | Message Bus | 3.x / 8.x |
| 8 | **Docker** | [docker.md](./docker.md) | Containerization | 24.x |
| 9 | **Kubernetes** | [kubernetes.md](./kubernetes.md) | Orchestration | 1.29+ |
| 10 | **GitHub Actions** | [github-actions.md](./github-actions.md) | CI/CD | — |
| 11 | **Cloudflare** | [cloudflare.md](./cloudflare.md) | CDN & Security | Free/Pro |
| 12 | **EF Core + DbUp** | [ef-core-dbup.md](./ef-core-dbup.md) | Database Migrations | 9.x |
| 13 | **OpenAI + LangChain** | [openai-langchain.md](./openai-langchain.md) | AI & Intelligence | — |
| 14 | **MinIO / S3** | [minio-s3.md](./minio-s3.md) | Object Storage | — |
| 15 | **Secrets Management** | [secrets-management.md](./secrets-management.md) | Security | — |

---

## Architecture Quick Reference

```
┌───────────────────────────────────────────────────────────────┐
│ FRONTEND                                                       │
│   Next.js 15 (Web)  │  Flutter 3 (Mobile + Desktop POS)       │
├───────────────────────┬───────────────────────────────────────┤
│ CDN                   │  Cloudflare (static + DDoS + SSL)      │
├───────────────────────┼───────────────────────────────────────┤
│ API GATEWAY           │  YARP (.NET 9 Reverse Proxy)           │
├───────────────────────┼───────────────────────────────────────┤
│ BACKEND SERVICES      │  .NET 9 Web API (4 microservices)      │
│                       │  Identity │ Catalog │ Commerce │ Engage│
├───────────────────────┼───────────────────────────────────────┤
│ DATA                  │  PostgreSQL 16 (RLS + pgvector)        │
│                       │  Redis 7 (Cache + Sessions)            │
├───────────────────────┼───────────────────────────────────────┤
│ MESSAGING             │  RabbitMQ + MassTransit                │
├───────────────────────┼───────────────────────────────────────┤
│ STORAGE               │  MinIO (dev) / S3 (prod)               │
├───────────────────────┼───────────────────────────────────────┤
│ AI                    │  OpenAI + LangChain + pgvector          │
├───────────────────────┼───────────────────────────────────────┤
│ MIGRATIONS            │  EF Core + DbUp                        │
├───────────────────────┼───────────────────────────────────────┤
│ INFRASTRUCTURE        │  Docker + Kubernetes                   │
│                       │  GitHub Actions (CI/CD)                │
│                       │  Azure Key Vault / AWS Secrets Manager │
└───────────────────────┴───────────────────────────────────────┘
```

---

## Standard Document Sections

Each technology file follows this structure:

1. **Purpose & Overview** — What it is and why it exists
2. **Why We Chose It** — Project-specific rationale
3. **Advantages & Disadvantages** — Honest trade-off analysis
4. **Prerequisites** — What you need before starting
5. **Installation & Setup** — Step-by-step environment setup
6. **Project / Database Creation** — How to scaffold or create
7. **Project Structure** — File/folder organization
8. **Development Guide** — Detailed procedures with examples
9. **SOLID Principles** — Applied patterns (for code technologies)
10. **Best Practices** — Do's and Don'ts
11. **Testing** — Testing strategies and tools
12. **How to Run** — Running locally
13. **Local Deployment** — Deploy to local environment
14. **Cloud Deployment with Docker** — Production-ready containerization
15. **Troubleshooting** — Common issues and fixes
16. **Useful Commands** — Quick reference
17. **References** — Official docs and resources
