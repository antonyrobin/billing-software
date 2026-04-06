# ⚙️ GitHub Actions — CI/CD Pipelines

> **Role in Project:** Automated build, test, and deployment pipelines
> **Related:** [Docker](./docker.md) | [Kubernetes](./kubernetes.md) | [.NET Web API](./dotnet-web-api.md) | [Next.js](./nextjs.md) | [Flutter](./flutter.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose GitHub Actions](#2-why-we-chose-github-actions)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Core Concepts](#5-core-concepts)
6. [Development Guide — Workflows](#6-development-guide--workflows)
7. [CI Pipeline (PR Validation)](#7-ci-pipeline-pr-validation)
8. [CD Pipeline (Deploy Services)](#8-cd-pipeline-deploy-services)
9. [Flutter Build Pipeline](#9-flutter-build-pipeline)
10. [Database Migration Pipeline](#10-database-migration-pipeline)
11. [Reusable Workflows](#11-reusable-workflows)
12. [Secrets & Environment Variables](#12-secrets--environment-variables)
13. [Best Practices (Do's & Don'ts)](#13-best-practices-dos--donts)
14. [How to Run](#14-how-to-run)
15. [Local Testing](#15-local-testing)
16. [Troubleshooting](#16-troubleshooting)
17. [Useful Commands](#17-useful-commands)
18. [References](#18-references)

---

## 1. Purpose & Overview

**GitHub Actions** automates workflows triggered by Git events (push, PR, release). It builds, tests, and deploys code without a separate CI/CD server.

### Pipeline Overview

```
Code Push/PR
    │
    ▼
┌───────────────────────────────────────┐
│            CI Pipeline                 │
│  ├── Restore dependencies              │
│  ├── Build all services               │
│  ├── Run unit tests                   │
│  ├── Run integration tests            │
│  ├── Code quality checks (lint)       │
│  └── Security scan                    │
└──────────────┬────────────────────────┘
               │ (on merge to main)
               ▼
┌───────────────────────────────────────┐
│            CD Pipeline                 │
│  ├── Build Docker images              │
│  ├── Push to Container Registry       │
│  ├── Run DB migrations                │
│  ├── Deploy to staging                │
│  ├── Run smoke tests                  │
│  └── Deploy to production (manual)    │
└───────────────────────────────────────┘
```

---

## 2. Why We Chose GitHub Actions

| Factor | Decision Rationale |
|---|---|
| **Native to GitHub** | No external CI/CD tool needed — workflows live in the repo |
| **Free Tier** | 2,000 minutes/month for private repos (free plan) |
| **Matrix Builds** | Test across multiple OS/runtime versions in parallel |
| **Reusable Workflows** | DRY across services — write once, use in all pipelines |
| **Marketplace** | Thousands of pre-built actions (Docker, Azure, K8s) |
| **Self-Hosted Runners** | Run on your own machines for faster builds if needed |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Native Integration** | Workflows, issues, PRs, releases — all in one place |
| 2 | **YAML-based** | Infrastructure as code; version controlled |
| 3 | **Parallel Jobs** | Matrix builds run tests in parallel |
| 4 | **Caching** | Dependency caching (NuGet, pnpm, Pub) for faster builds |
| 5 | **Secrets Management** | Encrypted secrets for tokens, passwords |
| 6 | **Environments** | staging, production with approval gates |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **YAML complexity** | Large workflows get verbose → use reusable workflows |
| 2 | **Debug difficulty** | No local SSH access → use `act` for local testing |
| 3 | **Minutes limit** | 2000 min free → optimize with caching and skip unnecessary runs |
| 4 | **Runner speed** | GitHub-hosted runners can be slow → self-hosted for critical paths |

---

## 4. Prerequisites

| Requirement | Purpose |
|---|---|
| **GitHub repository** | Workflows live in `.github/workflows/` |
| **Repository secrets** | Store credentials and tokens |
| **Container Registry** | GHCR (GitHub Container Registry) for Docker images |

---

## 5. Core Concepts

| Concept | Description |
|---|---|
| **Workflow** | A YAML file in `.github/workflows/` — defines the automation |
| **Trigger** | Event that starts a workflow (`push`, `pull_request`, `release`) |
| **Job** | A set of steps that run on the same runner (VM) |
| **Step** | A single command or action within a job |
| **Action** | Reusable unit (from Marketplace or custom) |
| **Runner** | VM that executes jobs (GitHub-hosted or self-hosted) |
| **Matrix** | Run the same job with different configurations in parallel |
| **Artifact** | Files produced by a build (APKs, binaries, test results) |
| **Cache** | Persist dependencies between runs for faster builds |
| **Environment** | Named deployment target with protection rules |

---

## 6. Development Guide — Workflows

### Workflow File Location

```
.github/
  workflows/
    ci-pr.yml              # PR validation
    deploy-service.yml     # Reusable: build & deploy a .NET service
    deploy-web.yml         # Build & deploy Next.js web
    deploy-flutter.yml     # Build Flutter APK/Windows
    db-migrate.yml         # Run database migrations
```

### Basic Workflow Structure

```yaml
name: Workflow Name

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DOTNET_VERSION: "9.0.x"
  REGISTRY: ghcr.io

jobs:
  job-name:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Step description
        run: echo "Hello"
```

---

## 7. CI Pipeline (PR Validation)

```yaml
# .github/workflows/ci-pr.yml
name: CI — Pull Request Validation

on:
  pull_request:
    branches: [main, develop]

concurrency:
  group: ci-${{ github.head_ref }}
  cancel-in-progress: true

env:
  DOTNET_VERSION: "9.0.x"
  NODE_VERSION: "22"

jobs:
  # ─── .NET Backend ───
  dotnet-build-test:
    name: ".NET Build & Test"
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: billing_test
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_pass
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U test_user -d billing_test"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Cache NuGet packages
        uses: actions/cache@v4
        with:
          path: ~/.nuget/packages
          key: nuget-${{ hashFiles('**/*.csproj') }}
          restore-keys: nuget-

      - name: Restore
        run: dotnet restore

      - name: Build
        run: dotnet build --no-restore --configuration Release

      - name: Unit Tests
        run: dotnet test --no-build --configuration Release --filter "Category!=Integration" --logger "trx;LogFileName=unit-results.trx"

      - name: Integration Tests
        run: dotnet test --no-build --configuration Release --filter "Category=Integration" --logger "trx;LogFileName=integration-results.trx"
        env:
          ConnectionStrings__DefaultConnection: "Host=localhost;Database=billing_test;Username=test_user;Password=test_pass"
          ConnectionStrings__Redis: "localhost:6379"

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: "**/*.trx"

  # ─── Next.js Frontend ───
  nextjs-build:
    name: "Next.js Build & Lint"
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Cache pnpm store
        uses: actions/cache@v4
        with:
          path: ~/.local/share/pnpm/store
          key: pnpm-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: pnpm-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        working-directory: ./src/web

      - name: Lint
        run: pnpm lint
        working-directory: ./src/web

      - name: Type Check
        run: pnpm tsc --noEmit
        working-directory: ./src/web

      - name: Build
        run: pnpm build
        working-directory: ./src/web

  # ─── Security Scan ───
  security-scan:
    name: "Security Scan"
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          scan-ref: "."
          severity: "HIGH,CRITICAL"
```

---

## 8. CD Pipeline (Deploy Services)

```yaml
# .github/workflows/deploy-service.yml
name: CD — Deploy Service

on:
  workflow_call:
    inputs:
      service-name:
        required: true
        type: string
      service-path:
        required: true
        type: string
    secrets:
      REGISTRY_TOKEN:
        required: true
      KUBE_CONFIG:
        required: true

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository_owner }}/billing-${{ inputs.service-name }}

jobs:
  build-push:
    name: "Build & Push Docker Image"
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}

    steps:
      - uses: actions/checkout@v4

      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.REGISTRY_TOKEN }}

      - name: Docker meta
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=semver,pattern={{version}}

      - name: Build and Push
        uses: docker/build-push-action@v6
        with:
          context: .
          file: ${{ inputs.service-path }}/Dockerfile
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: "Deploy to Staging"
    needs: build-push
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v4

      - name: Set kubeconfig
        run: echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to staging
        run: |
          kubectl set image deployment/${{ inputs.service-name }} \
            ${{ inputs.service-name }}=${{ needs.build-push.outputs.image-tag }} \
            -n billing-staging

      - name: Wait for rollout
        run: kubectl rollout status deployment/${{ inputs.service-name }} -n billing-staging --timeout=120s

  deploy-production:
    name: "Deploy to Production"
    needs: [build-push, deploy-staging]
    runs-on: ubuntu-latest
    environment: production  # Requires manual approval

    steps:
      - uses: actions/checkout@v4

      - name: Setup kubectl
        uses: azure/setup-kubectl@v4

      - name: Set kubeconfig
        run: echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config

      - name: Deploy to production
        run: |
          kubectl set image deployment/${{ inputs.service-name }} \
            ${{ inputs.service-name }}=${{ needs.build-push.outputs.image-tag }} \
            -n billing-production

      - name: Wait for rollout
        run: kubectl rollout status deployment/${{ inputs.service-name }} -n billing-production --timeout=180s
```

### Calling the Reusable Workflow

```yaml
# .github/workflows/deploy-catalog.yml
name: Deploy Catalog Service

on:
  push:
    branches: [main]
    paths:
      - "src/Services/Catalog.Api/**"

jobs:
  deploy:
    uses: ./.github/workflows/deploy-service.yml
    with:
      service-name: catalog-api
      service-path: src/Services/Catalog.Api
    secrets:
      REGISTRY_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      KUBE_CONFIG: ${{ secrets.KUBE_CONFIG }}
```

---

## 9. Flutter Build Pipeline

```yaml
# .github/workflows/deploy-flutter.yml
name: Flutter Build

on:
  push:
    branches: [main]
    paths:
      - "src/mobile/**"
  workflow_dispatch:

jobs:
  build-android:
    name: "Build Android APK"
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: "3.x"

      - name: Install dependencies
        run: flutter pub get
        working-directory: ./src/mobile

      - name: Run tests
        run: flutter test
        working-directory: ./src/mobile

      - name: Build APK
        run: flutter build apk --release
        working-directory: ./src/mobile

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: src/mobile/build/app/outputs/flutter-apk/app-release.apk

  build-windows:
    name: "Build Windows Desktop"
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: "3.x"

      - name: Install dependencies
        run: flutter pub get
        working-directory: ./src/mobile

      - name: Build Windows
        run: flutter build windows --release
        working-directory: ./src/mobile

      - name: Upload Windows Build
        uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: src/mobile/build/windows/x64/runner/Release/
```

---

## 10. Database Migration Pipeline

```yaml
# .github/workflows/db-migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - "src/Migrations/**"
  workflow_dispatch:

jobs:
  migrate-staging:
    name: "Migrate Staging DB"
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "9.0.x"

      - name: Run Migrations
        run: dotnet run --project src/Migrations/DatabaseMigrator
        env:
          ConnectionStrings__DefaultConnection: ${{ secrets.STAGING_DB_CONNECTION }}

  migrate-production:
    name: "Migrate Production DB"
    needs: migrate-staging
    runs-on: ubuntu-latest
    environment: production  # Manual approval required

    steps:
      - uses: actions/checkout@v4

      - name: Setup .NET
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "9.0.x"

      - name: Run Migrations
        run: dotnet run --project src/Migrations/DatabaseMigrator
        env:
          ConnectionStrings__DefaultConnection: ${{ secrets.PRODUCTION_DB_CONNECTION }}
```

---

## 11. Reusable Workflows

### Composite Action — Setup .NET + Cache

```yaml
# .github/actions/setup-dotnet/action.yml
name: "Setup .NET with Cache"
description: "Setup .NET SDK with NuGet cache"

inputs:
  dotnet-version:
    description: ".NET SDK version"
    required: false
    default: "9.0.x"

runs:
  using: "composite"
  steps:
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: ${{ inputs.dotnet-version }}

    - name: Cache NuGet
      uses: actions/cache@v4
      with:
        path: ~/.nuget/packages
        key: nuget-${{ hashFiles('**/*.csproj') }}
        restore-keys: nuget-
```

---

## 12. Secrets & Environment Variables

### Repository Secrets

| Secret | Purpose |
|---|---|
| `GITHUB_TOKEN` | Auto-provided — access to GHCR and APIs |
| `KUBE_CONFIG` | Base64-encoded kubeconfig for kubectl |
| `STAGING_DB_CONNECTION` | Staging PostgreSQL connection string |
| `PRODUCTION_DB_CONNECTION` | Production PostgreSQL connection string |
| `AZURE_CREDENTIALS` | Azure service principal (if deploying to AKS) |

### Environments

| Environment | Protection Rules |
|---|---|
| **staging** | Auto-deploy on merge to main |
| **production** | Requires manual approval from admin |

Configure at: **Settings** → **Environments** → Add required reviewers.

---

## 13. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Cache dependencies** | NuGet, pnpm, Pub — 2-5x faster builds |
| 2 | **Use `concurrency` groups** | Cancel older runs on same PR |
| 3 | **Pin action versions** | `actions/checkout@v4` not `@main` |
| 4 | **Use path filters** | Only build what changed |
| 5 | **Use reusable workflows** | DRY across services |
| 6 | **Add timeouts** | `timeout-minutes: 15` — prevent hanging jobs |
| 7 | **Use environments** | Staging → approval → production |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't store secrets in YAML** | Use repository secrets |
| 2 | **Don't skip tests in CI** | Tests are the point of CI |
| 3 | **Don't use `latest` image tag** | Use SHA-based or semver tags |
| 4 | **Don't run on every push** | Use path filters and branch restrictions |
| 5 | **Don't use `continue-on-error`** | Failures should fail the pipeline |

---

## 14. How to Run

Workflows run automatically on Git events. To manually trigger:

```yaml
# Add to workflow triggers
on:
  workflow_dispatch:  # Adds "Run workflow" button in GitHub UI
```

### Manual Trigger via CLI

```powershell
# Install GitHub CLI
winget install GitHub.cli

# Trigger workflow
gh workflow run "deploy-catalog.yml" --ref main
```

---

## 15. Local Testing

### Using `act` (Run Workflows Locally)

```powershell
# Install act
winget install nektos.act

# Run a specific job
act -j dotnet-build-test

# Run with secrets
act -j deploy --secret-file .secrets

# List available workflows
act -l
```

---

## 16. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Workflow not triggered** | Wrong branch/path filter | Check `on:` triggers |
| **Permission denied (GHCR)** | Missing `packages: write` | Add `permissions` block |
| **Cache miss** | Key changed | Check `hashFiles()` pattern |
| **Timeout** | Slow build or hanging test | Add `timeout-minutes`; check test |
| **Secret not available** | Wrong environment or name | Check secret name and env |

---

## 17. Useful Commands

```powershell
# GitHub CLI
gh workflow list                       # List workflows
gh workflow run <name>                 # Trigger workflow
gh run list                            # List recent runs
gh run view <run-id>                   # View run details
gh run view <run-id> --log            # View logs
gh run watch <run-id>                 # Watch run in real-time
gh run rerun <run-id>                 # Rerun a failed run
```

---

## 18. References

| Resource | URL |
|---|---|
| **GitHub Actions Docs** | https://docs.github.com/actions |
| **Workflow Syntax** | https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions |
| **Actions Marketplace** | https://github.com/marketplace?type=actions |
| **Reusable Workflows** | https://docs.github.com/actions/using-workflows/reusing-workflows |
| **act (Local Runner)** | https://github.com/nektos/act |
