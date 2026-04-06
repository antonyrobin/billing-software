# 🐳 Docker — Containerization

> **Role in Project:** Containerize all services, databases, and infrastructure for consistent dev/staging/production environments
> **Version:** Docker 27.x + Docker Compose 2.x
> **Related:** [Kubernetes](./kubernetes.md) | [.NET Web API](./dotnet-web-api.md) | [Next.js](./nextjs.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Docker](#2-why-we-chose-docker)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Core Concepts](#6-core-concepts)
7. [Dockerfile Patterns](#7-dockerfile-patterns)
8. [Docker Compose](#8-docker-compose)
9. [Image Optimization](#9-image-optimization)
10. [Networking](#10-networking)
11. [Volumes & Data Persistence](#11-volumes--data-persistence)
12. [Best Practices (Do's & Don'ts)](#12-best-practices-dos--donts)
13. [Security](#13-security)
14. [How to Run](#14-how-to-run)
15. [Local Deployment](#15-local-deployment)
16. [Cloud Deployment](#16-cloud-deployment)
17. [Troubleshooting](#17-troubleshooting)
18. [Useful Commands](#18-useful-commands)
19. [References](#19-references)

---

## 1. Purpose & Overview

**Docker** packages applications and their dependencies into lightweight, portable containers that run consistently across any environment.

### Containers in This Project

| Container | Base Image | Port | Purpose |
|---|---|---|---|
| **gateway** | mcr.microsoft.com/dotnet/aspnet:9.0-alpine | 5000 | YARP API Gateway |
| **identity-api** | mcr.microsoft.com/dotnet/aspnet:9.0-alpine | 5001 | Authentication & tenant management |
| **catalog-api** | mcr.microsoft.com/dotnet/aspnet:9.0-alpine | 5002 | Products, categories, inventory |
| **commerce-api** | mcr.microsoft.com/dotnet/aspnet:9.0-alpine | 5003 | Orders, invoices, payments |
| **engagement-api** | mcr.microsoft.com/dotnet/aspnet:9.0-alpine | 5004 | Notifications, messages |
| **web** | node:22-alpine | 3000 | Next.js web frontend |
| **postgres** | postgres:16-alpine | 5432 | Database |
| **redis** | redis:7-alpine | 6379 | Cache & sessions |
| **rabbitmq** | rabbitmq:3.13-management-alpine | 5672/15672 | Message broker |
| **minio** | minio/minio:latest | 9000/9001 | Object storage (dev) |
| **db-migrator** | mcr.microsoft.com/dotnet/runtime:9.0-alpine | — | Database migrations (run-once) |

---

## 2. Why We Chose Docker

| Factor | Decision Rationale |
|---|---|
| **Environment Consistency** | "Works on my machine" eliminated — same container everywhere |
| **Isolation** | Each service runs in its own container with its own dependencies |
| **Fast Onboarding** | `docker compose up` → entire stack running in minutes |
| **Microservices** | Each service has its own Dockerfile and lifecycle |
| **CI/CD** | Build once, deploy the same image to staging and production |
| **Kubernetes Ready** | Docker images are the deployment unit for K8s |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Consistency** | Same image in dev, staging, production |
| 2 | **Isolation** | Services can't interfere with each other |
| 3 | **Reproducible** | Dockerfile = infrastructure as code |
| 4 | **Fast Startup** | Containers start in seconds (vs minutes for VMs) |
| 5 | **Resource Efficient** | Shared kernel; much lighter than VMs |
| 6 | **Versioned** | Images are tagged; easy rollback |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Learning Curve** | Docker concepts take time → this guide helps |
| 2 | **Debugging** | Can't just "open" a container → use `docker exec` and logs |
| 3 | **Storage** | Images accumulate → prune regularly |
| 4 | **Networking** | Container networking is different → use Compose networks |
| 5 | **Windows Compatibility** | Some Linux-only features → use WSL2 backend |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Docker Desktop** | Latest | Docker engine + CLI + Compose |
| **WSL2** | — | Linux kernel for Windows (auto-installed) |

---

## 5. Installation & Setup

### Windows (Docker Desktop)

1. Download from https://www.docker.com/products/docker-desktop
2. Install with WSL2 backend (recommended)
3. Verify:

```powershell
docker --version      # Docker version 27.x
docker compose version  # Docker Compose version v2.x
```

### Post-Install Configuration

```powershell
# Allocate resources in Docker Desktop → Settings → Resources
# Recommended for this project:
#   CPUs: 4+
#   Memory: 8GB+
#   Disk: 50GB+
```

---

## 6. Core Concepts

| Concept | Description |
|---|---|
| **Image** | Read-only template with OS, runtime, app code |
| **Container** | Running instance of an image |
| **Dockerfile** | Instructions to build an image |
| **Layer** | Each Dockerfile instruction creates a cached layer |
| **Volume** | Persistent storage that survives container restarts |
| **Network** | Virtual network connecting containers |
| **Registry** | Storage for images (Docker Hub, GitHub Container Registry) |
| **Tag** | Version label for an image (e.g., `billing-catalog:1.2.3`) |

### Image Layering

```
┌──────────────────────────┐
│  COPY app/ .             │  ← Changes most often (top = rebuilt)
├──────────────────────────┤
│  COPY --from=build /app  │
├──────────────────────────┤
│  dotnet restore          │  ← Cached if .csproj unchanged
├──────────────────────────┤
│  mcr.microsoft.com/      │  ← Base image (rarely changes)
│  dotnet/aspnet:9.0-alpine│
└──────────────────────────┘
```

---

## 7. Dockerfile Patterns

### 7.1 .NET Service (Multi-Stage)

```dockerfile
# ── Stage 1: Build ──
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

# Copy solution and project files (for layer caching)
COPY ["Billing.sln", "./"]
COPY ["src/Services/Catalog.Api/Catalog.Api.csproj", "src/Services/Catalog.Api/"]
COPY ["src/Shared/Billing.Contracts/Billing.Contracts.csproj", "src/Shared/Billing.Contracts/"]
RUN dotnet restore "src/Services/Catalog.Api/Catalog.Api.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/src/Services/Catalog.Api"
RUN dotnet publish -c Release -o /app/publish --no-restore

# ── Stage 2: Runtime ──
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS runtime
WORKDIR /app

# Security: run as non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

COPY --from=build /app/publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "Catalog.Api.dll"]
```

### 7.2 Next.js (Multi-Stage)

```dockerfile
# ── Stage 1: Dependencies ──
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# ── Stage 2: Build ──
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

# ── Stage 3: Runtime ──
FROM node:22-alpine AS runtime
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

USER appuser
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "server.js"]
```

### 7.3 Database Migrator (Run-Once)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /src

COPY ["src/Migrations/DatabaseMigrator/DatabaseMigrator.csproj", "./"]
RUN dotnet restore
COPY src/Migrations/DatabaseMigrator/ .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/runtime:9.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DatabaseMigrator.dll"]
```

---

## 8. Docker Compose

### 8.1 Development (Full Stack)

```yaml
# docker-compose.dev.yml
name: billing-dev

services:
  # ─── Infrastructure ───
  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: billing
      POSTGRES_USER: billing_admin
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U billing_admin -d billing"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: billing
      RABBITMQ_DEFAULT_PASS: dev_password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"]
      interval: 10s
      timeout: 10s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: billing_admin
      MINIO_ROOT_PASSWORD: dev_password
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

  # ─── Database Migration ───
  db-migrator:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.migrator
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=billing;Username=billing_admin;Password=dev_password"

  # ─── API Services ───
  gateway:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.service
      args:
        SERVICE_NAME: Gateway
    ports:
      - "5000:8080"
    depends_on:
      - redis
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__Redis=redis:6379

  identity-api:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.service
      args:
        SERVICE_NAME: Identity.Api
    ports:
      - "5001:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=billing;Username=billing_admin;Password=dev_password
      - ConnectionStrings__Redis=redis:6379
      - RabbitMQ__Host=rabbitmq

  catalog-api:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.service
      args:
        SERVICE_NAME: Catalog.Api
    ports:
      - "5002:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=billing;Username=billing_admin;Password=dev_password
      - ConnectionStrings__Redis=redis:6379
      - RabbitMQ__Host=rabbitmq

  commerce-api:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.service
      args:
        SERVICE_NAME: Commerce.Api
    ports:
      - "5003:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Host=postgres;Database=billing;Username=billing_admin;Password=dev_password
      - ConnectionStrings__Redis=redis:6379
      - RabbitMQ__Host=rabbitmq

  # ─── Web Frontend ───
  web:
    build:
      context: .
      dockerfile: samples/docker/Dockerfile.web
    ports:
      - "3000:3000"
    depends_on:
      - gateway
    environment:
      - NEXT_PUBLIC_API_URL=http://gateway:8080

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
  minio_data:
```

### 8.2 Quick Start Commands

```powershell
# Start everything
docker compose -f docker-compose.dev.yml up -d

# Start only infrastructure
docker compose -f docker-compose.dev.yml up -d postgres redis rabbitmq minio

# Rebuild a specific service
docker compose -f docker-compose.dev.yml up -d --build catalog-api

# View logs
docker compose -f docker-compose.dev.yml logs -f catalog-api

# Stop everything
docker compose -f docker-compose.dev.yml down

# Stop and remove volumes (CAUTION: deletes data)
docker compose -f docker-compose.dev.yml down -v
```

---

## 9. Image Optimization

### Size Comparison

| Approach | Image Size |
|---|---|
| `dotnet/sdk:9.0` (no multi-stage) | ~900MB |
| `dotnet/aspnet:9.0` (multi-stage) | ~220MB |
| `dotnet/aspnet:9.0-alpine` (multi-stage + Alpine) | ~110MB |

### Optimization Techniques

| # | Technique | Impact |
|---|---|---|
| 1 | **Multi-stage builds** | Only runtime in final image |
| 2 | **Alpine base images** | ~50% smaller than Debian |
| 3 | **`.dockerignore`** | Exclude `bin/`, `obj/`, `.git`, `node_modules` |
| 4 | **Layer ordering** | Copy `.csproj` first → `restore` → copy code (caching) |
| 5 | **Specific tags** | `9.0-alpine` not `latest` — reproducible builds |

### .dockerignore

```
**/bin/
**/obj/
**/node_modules/
**/.next/
.git/
.vs/
.vscode/
*.md
*.sln.DotSettings
```

---

## 10. Networking

### Compose Default Network

All services in the same `docker-compose.yml` share a default network. Services reach each other by service name:

```
gateway → http://identity-api:8080
gateway → http://catalog-api:8080
catalog-api → postgres:5432
catalog-api → redis:6379
catalog-api → rabbitmq:5672
```

### Custom Networks

```yaml
services:
  gateway:
    networks:
      - frontend
      - backend

  catalog-api:
    networks:
      - backend

  web:
    networks:
      - frontend

networks:
  frontend:
  backend:
```

---

## 11. Volumes & Data Persistence

| Volume | Container | Purpose |
|---|---|---|
| `postgres_data` | postgres | Database files |
| `redis_data` | redis | Cache persistence (RDB/AOF) |
| `rabbitmq_data` | rabbitmq | Queue data |
| `minio_data` | minio | Uploaded files |

```yaml
# Named volumes (managed by Docker)
volumes:
  postgres_data:
    driver: local

# Bind mounts (for development hot-reload)
services:
  web:
    volumes:
      - ./src:/app/src  # Live code changes
```

---

## 12. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use multi-stage builds** | Smaller images; no build tools in production |
| 2 | **Use `.dockerignore`** | Faster builds; smaller context |
| 3 | **Run as non-root** | Security — containers shouldn't run as root |
| 4 | **Use specific image tags** | `9.0-alpine` not `latest` — reproducible |
| 5 | **Use health checks** | Compose and K8s need to know service health |
| 6 | **Layer ordering** | Least-changing layers first for cache efficiency |
| 7 | **One process per container** | Easier to scale and debug |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't put secrets in Dockerfile** | Use environment variables or secrets managers |
| 2 | **Don't use `latest` tag** | Pin specific versions for reproducibility |
| 3 | **Don't run as root** | Add `USER appuser` in Dockerfile |
| 4 | **Don't install unnecessary packages** | Keep images minimal — Alpine + only what's needed |
| 5 | **Don't ignore `.dockerignore`** | Always create one — prevents context bloat |
| 6 | **Don't store data in containers** | Use volumes for persistence |

---

## 13. Security

| Practice | Implementation |
|---|---|
| **Non-root user** | `RUN adduser -S appuser` + `USER appuser` |
| **Read-only filesystem** | `docker run --read-only` |
| **No new privileges** | `--security-opt=no-new-privileges` |
| **Scan images** | `docker scout cves billing-catalog:latest` |
| **Minimal base** | Alpine-based images reduce attack surface |
| **Don't expose unnecessary ports** | Only expose what's needed in Compose |
| **Use secrets** | `docker secret` or environment variables from vault |

---

## 14. How to Run

```powershell
# Build all images
docker compose -f docker-compose.dev.yml build

# Start all services
docker compose -f docker-compose.dev.yml up -d

# Check status
docker compose -f docker-compose.dev.yml ps

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop
docker compose -f docker-compose.dev.yml down
```

---

## 15. Local Deployment

```powershell
# One command to start everything:
docker compose -f docker-compose.dev.yml up -d

# URLs:
#   Web:        http://localhost:3000
#   Gateway:    http://localhost:5000
#   RabbitMQ:   http://localhost:15672
#   MinIO:      http://localhost:9001
#   PostgreSQL: localhost:5432
#   Redis:      localhost:6379
```

---

## 16. Cloud Deployment

### Build & Push to Registry

```powershell
# Tag images
docker tag billing-catalog:latest ghcr.io/your-org/billing-catalog:1.0.0

# Push to GitHub Container Registry
docker push ghcr.io/your-org/billing-catalog:1.0.0
```

### Production Docker Compose

```yaml
# docker-compose.prod.yml
services:
  gateway:
    image: ghcr.io/your-org/billing-gateway:${VERSION}
    restart: always
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 256M

  catalog-api:
    image: ghcr.io/your-org/billing-catalog:${VERSION}
    restart: always
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: "1.0"
          memory: 512M
```

---

## 17. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Container exits immediately** | App crash on startup | `docker logs <container>` |
| **Port already in use** | Another process on same port | Change port mapping or stop conflicting process |
| **Build cache not working** | `.dockerignore` missing | Create `.dockerignore` |
| **Out of disk space** | Dangling images | `docker system prune -a` |
| **Can't connect to service** | Wrong hostname | Use service name (not `localhost`) inside containers |
| **Permission denied** | Running as root | Check `USER` in Dockerfile |

---

## 18. Useful Commands

```powershell
# ── Images ──
docker images                          # List images
docker build -t myapp:1.0 .           # Build image
docker rmi myapp:1.0                   # Remove image
docker image prune                     # Remove dangling images

# ── Containers ──
docker ps                              # Running containers
docker ps -a                           # All containers
docker run -d --name myapp myapp:1.0   # Run container
docker stop myapp                      # Stop container
docker rm myapp                        # Remove container
docker exec -it myapp sh               # Shell into container
docker logs myapp -f                   # Follow logs

# ── Compose ──
docker compose up -d                   # Start all services
docker compose down                    # Stop all services
docker compose build                   # Build all images
docker compose logs -f <service>       # Follow service logs
docker compose exec <service> sh       # Shell into service

# ── Cleanup ──
docker system prune                    # Remove unused data
docker system prune -a                 # Remove ALL unused data
docker volume prune                    # Remove unused volumes
docker system df                       # Show disk usage
```

---

## 19. References

| Resource | URL |
|---|---|
| **Docker Docs** | https://docs.docker.com |
| **Dockerfile Reference** | https://docs.docker.com/reference/dockerfile |
| **Docker Compose Reference** | https://docs.docker.com/compose/compose-file |
| **Docker Hub** | https://hub.docker.com |
| **.NET Docker Images** | https://hub.docker.com/_/microsoft-dotnet |
| **Docker Security** | https://docs.docker.com/engine/security |
