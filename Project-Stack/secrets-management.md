# 🔐 Secrets Management — Azure Key Vault / AWS Secrets Manager

> **Role in Project:** Secure storage and rotation of credentials, API keys, connection strings, and tokens
> **Related:** [.NET Web API](./dotnet-web-api.md) | [Kubernetes](./kubernetes.md) | [GitHub Actions](./github-actions.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Need Secrets Management](#2-why-we-need-secrets-management)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Secrets Inventory](#5-secrets-inventory)
6. [Local Development — User Secrets](#6-local-development--user-secrets)
7. [Azure Key Vault](#7-azure-key-vault)
8. [AWS Secrets Manager](#8-aws-secrets-manager)
9. [Kubernetes Secrets](#9-kubernetes-secrets)
10. [GitHub Actions Secrets](#10-github-actions-secrets)
11. [Secret Rotation](#11-secret-rotation)
12. [Best Practices (Do's & Don'ts)](#12-best-practices-dos--donts)
13. [How to Run](#13-how-to-run)
14. [Local Deployment](#14-local-deployment)
15. [Cloud Deployment](#15-cloud-deployment)
16. [Troubleshooting](#16-troubleshooting)
17. [References](#17-references)

---

## 1. Purpose & Overview

**Secrets management** ensures that sensitive data (passwords, API keys, tokens) is never stored in source code, configuration files, or container images. Instead, secrets are stored in a dedicated vault and injected at runtime.

### Secrets Flow

```
┌───────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│  Source Code  │     │  Secrets Vault       │     │  Running Service │
│               │     │  (Key Vault / AWS SM)│     │                 │
│  NO secrets!  │     │                      │     │  Secrets loaded │
│  Only keys:   │────►│  ConnectionStrings   │────►│  at startup via │
│  "KeyVault:   │     │  JwtSecret           │     │  .NET config    │
│   VaultName"  │     │  OpenAI Key          │     │  provider       │
│               │     │  S3 Credentials      │     │                 │
└───────────────┘     └─────────────────────┘     └─────────────────┘
```

---

## 2. Why We Need Secrets Management

| Problem | Consequence | Solution |
|---|---|---|
| Secrets in git | Anyone with repo access sees passwords | Use vault; never commit secrets |
| Secrets in env vars | Visible in process listings / CI logs | Inject from vault at runtime |
| Shared passwords | One leak compromises everything | Unique secrets per environment |
| No rotation | Old credentials remain valid indefinitely | Automated rotation |
| No audit trail | Can't tell who accessed what | Vault audit logs |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Centralized** | All secrets in one place; single source of truth |
| 2 | **Access Control** | Role-based access; audit trail |
| 3 | **Rotation** | Automate credential rotation without downtime |
| 4 | **Encryption** | Secrets encrypted at rest and in transit |
| 5 | **Environment Isolation** | Separate secrets per environment (dev/staging/prod) |
| 6 | **.NET Integration** | Native configuration providers for Key Vault / AWS |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Added complexity** | More infrastructure → but essential for security |
| 2 | **Startup latency** | Fetching secrets adds ~1s to startup → cache in memory |
| 3 | **Cost** | Azure Key Vault: $0.03/10K operations → negligible |
| 4 | **Network dependency** | Vault must be reachable → use managed identity (no network hops for Azure) |

---

## 4. Prerequisites

| Approach | Tool |
|---|---|
| **Local Development** | .NET User Secrets |
| **Azure Cloud** | Azure Key Vault + Managed Identity |
| **AWS Cloud** | AWS Secrets Manager + IAM Role |
| **Kubernetes** | K8s Secrets (basic) or External Secrets Operator |

---

## 5. Secrets Inventory

| Secret | Environment Variable | Used By |
|---|---|---|
| **PostgreSQL Connection** | `ConnectionStrings__DefaultConnection` | All services |
| **Redis Connection** | `ConnectionStrings__Redis` | All services, Gateway |
| **RabbitMQ Password** | `RabbitMQ__Password` | All services |
| **JWT Signing Key** | `Jwt__Secret` | Identity, Gateway |
| **OpenAI API Key** | `AI__OpenAI__ApiKey` | Engagement service |
| **S3 Access Key** | `Storage__AccessKey` | Catalog, Commerce |
| **S3 Secret Key** | `Storage__SecretKey` | Catalog, Commerce |
| **SMTP Password** | `Email__Password` | Engagement service |
| **SMS/WhatsApp Key** | `Sms__ApiKey` | Engagement service |

---

## 6. Local Development — User Secrets

### Setup

```powershell
# Initialize user secrets for a project
dotnet user-secrets init --project src/Services/Catalog.Api

# Set secrets
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=billing;Username=billing_admin;Password=dev_password" --project src/Services/Catalog.Api
dotnet user-secrets set "ConnectionStrings:Redis" "localhost:6379" --project src/Services/Catalog.Api
dotnet user-secrets set "Jwt:Secret" "my-super-secret-jwt-key-for-development-only-min-32-chars" --project src/Services/Catalog.Api
dotnet user-secrets set "AI:OpenAI:ApiKey" "sk-dev-key-here" --project src/Services/Catalog.Api

# List all secrets
dotnet user-secrets list --project src/Services/Catalog.Api

# Remove a secret
dotnet user-secrets remove "AI:OpenAI:ApiKey" --project src/Services/Catalog.Api

# Clear all secrets
dotnet user-secrets clear --project src/Services/Catalog.Api
```

### How It Works

- Stored at `%APPDATA%\Microsoft\UserSecrets\{secret-id}\secrets.json`
- Automatically loaded in Development environment
- Never committed to source control

```csharp
// Program.cs — User secrets are loaded automatically in Development
var builder = WebApplication.CreateBuilder(args);
// builder.Configuration already includes user secrets when ASPNETCORE_ENVIRONMENT=Development
```

---

## 7. Azure Key Vault

### 7.1 Create Key Vault

```powershell
# Create resource group
az group create --name billing-rg --location centralindia

# Create Key Vault
az keyvault create `
  --name billing-kv `
  --resource-group billing-rg `
  --location centralindia `
  --enable-rbac-authorization

# Add secrets
az keyvault secret set --vault-name billing-kv --name "postgres-connection" --value "Host=..."
az keyvault secret set --vault-name billing-kv --name "redis-connection" --value "..."
az keyvault secret set --vault-name billing-kv --name "jwt-secret" --value "..."
az keyvault secret set --vault-name billing-kv --name "openai-api-key" --value "sk-..."
```

### 7.2 .NET Integration

```powershell
dotnet add package Azure.Extensions.AspNetCore.Configuration.Secrets
dotnet add package Azure.Identity
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsProduction())
{
    var keyVaultName = builder.Configuration["KeyVault:VaultName"];
    var keyVaultUri = new Uri($"https://{keyVaultName}.vault.azure.net/");

    builder.Configuration.AddAzureKeyVault(
        keyVaultUri,
        new DefaultAzureCredential());
}
```

### 7.3 Key Vault Secret Naming

Key Vault uses `--` as separator (not `:` or `__`):

| .NET Configuration | Key Vault Secret Name |
|---|---|
| `ConnectionStrings:DefaultConnection` | `ConnectionStrings--DefaultConnection` |
| `ConnectionStrings:Redis` | `ConnectionStrings--Redis` |
| `Jwt:Secret` | `Jwt--Secret` |
| `AI:OpenAI:ApiKey` | `AI--OpenAI--ApiKey` |

### 7.4 Managed Identity (No Credentials!)

```powershell
# Enable managed identity on AKS
az aks update --resource-group billing-rg --name billing-aks --enable-managed-identity

# Grant Key Vault access to AKS identity
az keyvault set-policy --name billing-kv `
  --object-id <managed-identity-object-id> `
  --secret-permissions get list
```

With managed identity, the code uses `DefaultAzureCredential` — no API keys needed.

---

## 8. AWS Secrets Manager

### 8.1 Create Secrets

```powershell
# AWS CLI
aws secretsmanager create-secret `
  --name billing/production/postgres `
  --secret-string '{"host":"...","database":"billing","username":"...","password":"..."}'

aws secretsmanager create-secret `
  --name billing/production/jwt `
  --secret-string '{"secret":"super-long-random-key"}'
```

### 8.2 .NET Integration

```powershell
dotnet add package AWSSDK.SecretsManager
dotnet add package Kralizek.Extensions.Configuration.AWSSecretsManager
```

```csharp
// Program.cs
if (builder.Environment.IsProduction())
{
    builder.Configuration.AddSecretsManager(configurator: options =>
    {
        options.SecretFilter = entry => entry.Name.StartsWith("billing/production/");
        options.KeyGenerator = (entry, key) => key.Replace("/", ":");
    });
}
```

---

## 9. Kubernetes Secrets

### 9.1 Create Secrets

```powershell
# Create from literal values
kubectl create secret generic billing-secrets -n billing `
  --from-literal=postgres-connection="Host=postgres;Database=billing;Username=billing_app;Password=SECURE" `
  --from-literal=redis-connection="redis:6379,password=SECURE" `
  --from-literal=jwt-secret="LONG_RANDOM_SECRET"
```

### 9.2 Use in Deployment

```yaml
env:
  - name: ConnectionStrings__DefaultConnection
    valueFrom:
      secretKeyRef:
        name: billing-secrets
        key: postgres-connection
  - name: Jwt__Secret
    valueFrom:
      secretKeyRef:
        name: billing-secrets
        key: jwt-secret
```

### 9.3 External Secrets Operator (Recommended)

Sync secrets from Azure Key Vault / AWS Secrets Manager into K8s Secrets automatically:

```yaml
# external-secret.yml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: billing-secrets
  namespace: billing
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: azure-key-vault
    kind: ClusterSecretStore
  target:
    name: billing-secrets
  data:
    - secretKey: postgres-connection
      remoteRef:
        key: ConnectionStrings--DefaultConnection
    - secretKey: jwt-secret
      remoteRef:
        key: Jwt--Secret
```

---

## 10. GitHub Actions Secrets

### Configure in GitHub

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Purpose |
|---|---|
| `KUBE_CONFIG` | Base64-encoded kubeconfig |
| `STAGING_DB_CONNECTION` | Staging PostgreSQL connection string |
| `PRODUCTION_DB_CONNECTION` | Production PostgreSQL connection string |
| `AZURE_CREDENTIALS` | Azure service principal JSON |

### Use in Workflows

```yaml
steps:
  - name: Deploy
    run: kubectl apply -f k8s/
    env:
      KUBECONFIG_DATA: ${{ secrets.KUBE_CONFIG }}

  - name: Run Migrations
    run: dotnet run --project src/Migrations/DatabaseMigrator
    env:
      ConnectionStrings__DefaultConnection: ${{ secrets.STAGING_DB_CONNECTION }}
```

---

## 11. Secret Rotation

### Rotation Strategy

| Secret | Rotation Frequency | Method |
|---|---|---|
| **JWT Signing Key** | 90 days | Deploy new key; keep old key valid for existing token TTL |
| **Database Password** | 90 days | Create new user, migrate, remove old user |
| **API Keys (OpenAI, etc.)** | On suspicion of leak | Regenerate in provider dashboard |
| **S3 Credentials** | 90 days | Create new key pair; update vault; revoke old |

### JWT Key Rotation (Supporting Multiple Keys)

```csharp
// Support multiple signing keys during rotation
builder.Services.AddAuthentication().AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        IssuerSigningKeys = new[]
        {
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(currentKey)),
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(previousKey))  // Accept old key during rotation
        }
    };
});
```

---

## 12. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use User Secrets for local dev** | Safe; not committed to git |
| 2 | **Use managed identity (Azure)** | No credentials to manage |
| 3 | **Separate secrets per environment** | dev, staging, prod — different credentials |
| 4 | **Rotate regularly** | Reduce blast radius of leaked secrets |
| 5 | **Audit access** | Review who accessed secrets (vault audit logs) |
| 6 | **Use strong, random secrets** | Minimum 32 characters for keys |
| 7 | **Use External Secrets Operator** | Sync vault → K8s Secrets automatically |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't commit secrets to git** | Use user secrets, vault, or CI/CD secrets |
| 2 | **Don't put secrets in Dockerfiles** | Inject via environment variables at runtime |
| 3 | **Don't share secrets across environments** | Unique credentials per environment |
| 4 | **Don't log secrets** | Ensure logging frameworks redact sensitive data |
| 5 | **Don't hardcode secrets** | Always load from configuration |
| 6 | **Don't use weak secrets** | No `password123`; use `openssl rand -base64 32` |
| 7 | **Don't skip `.gitignore`** | Ensure `appsettings.*.json` with secrets is ignored |

---

## 13. How to Run

### Local Development

```powershell
# Set up user secrets for each service
cd src/Services/Identity.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=billing;Username=billing_admin;Password=dev_password"
dotnet user-secrets set "Jwt:Secret" "super-secret-jwt-key-min-32-characters-long-for-development"

# Or use environment variables
$env:ConnectionStrings__DefaultConnection = "Host=localhost;Database=billing;Username=billing_admin;Password=dev_password"

# Run the service
dotnet run
```

---

## 14. Local Deployment

For Docker Compose, use an `.env` file (add to `.gitignore`):

```ini
# .env (DO NOT COMMIT)
POSTGRES_PASSWORD=dev_password
REDIS_PASSWORD=dev_password
RABBITMQ_PASSWORD=dev_password
JWT_SECRET=super-secret-jwt-key-min-32-characters-long-for-development
OPENAI_API_KEY=sk-dev-key
MINIO_ROOT_PASSWORD=dev_password
```

```yaml
# docker-compose.dev.yml
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

  identity-api:
    environment:
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=billing;Username=billing_admin;Password=${POSTGRES_PASSWORD}"
      Jwt__Secret: ${JWT_SECRET}
```

### .gitignore

```
# Secrets — NEVER commit
.env
.env.*
appsettings.Development.json
appsettings.Local.json
**/secrets.json
```

---

## 15. Cloud Deployment

### Decision Matrix

| Criteria | Azure Key Vault | AWS Secrets Manager | K8s Secrets |
|---|---|---|---|
| **Best for** | Azure-hosted workloads | AWS-hosted workloads | Simple setups |
| **Encryption** | HSM-backed | AWS KMS | etcd encryption |
| **Rotation** | Built-in | Built-in | Manual |
| **Audit** | Azure Monitor | CloudTrail | K8s audit logs |
| **Cost** | $0.03/10K ops | $0.40/secret/month | Free |
| **.NET Support** | Native provider | NuGet package | Env vars |

### Recommended: Azure Key Vault + External Secrets Operator

```
Azure Key Vault
    │
    │ (External Secrets Operator syncs)
    ▼
K8s Secrets (auto-refreshed hourly)
    │
    │ (mounted as env vars)
    ▼
Service Pods
```

---

## 16. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Secret not found** | Wrong secret name or path | Verify name matches exactly |
| **Access denied (Key Vault)** | Missing RBAC/Access Policy | Grant `Get` and `List` permissions |
| **Secret not refreshed** | Cache or old K8s secret | Restart pod; check External Secrets sync |
| **User secrets not loading** | Wrong environment | Ensure `ASPNETCORE_ENVIRONMENT=Development` |
| **Secret visible in logs** | Logging raw config values | Use `[LoggerMessage]` and structured logging |

### Generate Strong Secrets

```powershell
# PowerShell — Generate random secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])

# OpenSSL (WSL or Linux)
openssl rand -base64 32
```

---

## 17. References

| Resource | URL |
|---|---|
| **.NET User Secrets** | https://learn.microsoft.com/aspnet/core/security/app-secrets |
| **Azure Key Vault** | https://learn.microsoft.com/azure/key-vault |
| **Key Vault + .NET** | https://learn.microsoft.com/aspnet/core/security/key-vault-configuration |
| **AWS Secrets Manager** | https://docs.aws.amazon.com/secretsmanager |
| **External Secrets Operator** | https://external-secrets.io |
| **K8s Secrets** | https://kubernetes.io/docs/concepts/configuration/secret |
