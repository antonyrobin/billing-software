# 🔀 YARP — API Gateway (.NET Reverse Proxy)

> **Role in Project:** API Gateway and reverse proxy routing all client requests to backend microservices
> **Version:** YARP 2.x on .NET 9
> **Repository:** `billing-backend` (Gateway project)
> **Related:** [.NET Web API](./dotnet-web-api.md) | [Next.js](./nextjs.md) | [Flutter](./flutter.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose YARP](#2-why-we-chose-yarp)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Project Creation](#6-project-creation)
7. [Configuration](#7-configuration)
8. [Development Guide](#8-development-guide)
9. [Middleware Pipeline](#9-middleware-pipeline)
10. [Rate Limiting](#10-rate-limiting)
11. [JWT Validation at Gateway](#11-jwt-validation-at-gateway)
12. [Load Balancing](#12-load-balancing)
13. [Health Checks](#13-health-checks)
14. [Do's & Don'ts](#14-dos--donts)
15. [Testing](#15-testing)
16. [How to Run](#16-how-to-run)
17. [Local Deployment](#17-local-deployment)
18. [Cloud Deployment with Docker](#18-cloud-deployment-with-docker)
19. [Troubleshooting](#19-troubleshooting)
20. [Useful Commands](#20-useful-commands)
21. [References](#21-references)

---

## 1. Purpose & Overview

**YARP (Yet Another Reverse Proxy)** is a Microsoft-built, high-performance reverse proxy library for .NET. Unlike standalone gateways (Kong, AWS API Gateway, NGINX), YARP runs **inside a .NET process** as middleware.

### What an API Gateway Does

```
Clients (Web, Mobile, Desktop)
           │
           ▼
┌──────────────────────────────┐
│       API GATEWAY (YARP)      │
│                              │
│  ✓ Single entry point        │
│  ✓ JWT validation            │
│  ✓ Rate limiting             │
│  ✓ Request routing           │
│  ✓ Load balancing            │
│  ✓ CORS handling             │
│  ✓ Request/response logging  │
│  ✓ API versioning            │
│  ✓ Response caching          │
│  ✓ Circuit breaking          │
└──────────┬───────────────────┘
           │
     ┌─────┼─────┬──────┐
     ▼     ▼     ▼      ▼
 Identity Catalog Commerce Engagement
```

### Role in This Project

YARP is the **single entry point** for all API requests. Clients never talk directly to backend services.

| Responsibility | Detail |
|---|---|
| **Routing** | `/api/v1/identity/*` → Identity Service, `/api/v1/catalog/*` → Catalog Service, etc. |
| **JWT Validation** | Verify RS256 signature, check expiry, extract tenant/user claims |
| **Rate Limiting** | Per-tenant, per-IP, per-user rate limits |
| **CORS** | Allow configured origins per environment |
| **Request Logging** | Structured logging with correlation IDs |
| **Health Aggregation** | Aggregate health status of all downstream services |

---

## 2. Why We Chose YARP

| Factor | Decision Rationale |
|---|---|
| **No Extra Infrastructure** | Runs as a .NET project — no Kong, NGINX, or cloud gateway to manage |
| **.NET Ecosystem** | Same language (C#), same DI, same middleware as backend services |
| **Performance** | Built on Kestrel — handles millions of requests/sec |
| **Deep Customization** | Full control over middleware pipeline; write custom C# logic |
| **Configuration-driven** | Routes/clusters defined in `appsettings.json` or code |
| **Microsoft-maintained** | Active development; used internally by Microsoft (Azure, Bing) |
| **Free** | No license costs; MIT licensed open-source |

### YARP vs Alternatives

| Feature | YARP | NGINX | Kong | AWS API GW |
|---|---|---|---|---|
| **Language** | C# | Config files | Lua/Go | Managed |
| **Deployment** | Same as services | Separate container | Separate + PostgreSQL | Cloud only |
| **Customization** | Full C# code | Limited | Plugins (Lua) | Limited |
| **Cost** | Free | Free / Plus | Free / Enterprise | Pay per request |
| **JWT Validation** | Built-in (.NET) | Requires module | Built-in | Built-in |
| **Rate Limiting** | Built-in (.NET 9) | Built-in | Built-in | Built-in |
| **Learning Curve** | Low (if .NET team) | Medium | High | Low |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Zero Extra Infrastructure** | Deploys as a regular .NET service — same Docker image pattern |
| 2 | **Full .NET Integration** | Use DI, middleware, EF Core, Redis, Serilog — all native |
| 3 | **Configuration-driven** | Routes defined in JSON — change routing without code changes |
| 4 | **Hot Reload Config** | Route changes reload without restart (via `IProxyConfigProvider`) |
| 5 | **Custom Transforms** | Add/remove/modify headers, paths, query strings in C# |
| 6 | **High Performance** | Built on Kestrel; efficient memory use; streaming support |
| 7 | **Health Checks** | Built-in active health checking of downstream services |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Tied to .NET** | Only option if backend is .NET → our backend IS .NET |
| 2 | **Less Community** | Fewer examples than NGINX/Kong → Microsoft docs are thorough |
| 3 | **No Admin UI** | No built-in management dashboard → use Swagger + custom health dashboard |
| 4 | **Single Point of Failure** | Gateway goes down = everything down → run 2+ replicas in K8s |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **.NET SDK** | 9.0 | Framework |
| **VS Code / Visual Studio** | Latest | IDE |
| **Docker** | 24.x | Running downstream services locally |

---

## 5. Installation & Setup

```powershell
# YARP is a NuGet package — install in the gateway project
cd src/Gateway/BillingGateway
dotnet add package Yarp.ReverseProxy
```

---

## 6. Project Creation

```powershell
# Create gateway project
dotnet new web -n BillingGateway -o src/Gateway/BillingGateway
cd src/Gateway/BillingGateway

# Add YARP package
dotnet add package Yarp.ReverseProxy

# Add supporting packages
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
dotnet add package Serilog.AspNetCore
dotnet add package AspNetCore.HealthChecks.Uris
```

---

## 7. Configuration

### Route & Cluster Configuration

```json
// appsettings.json
{
  "ReverseProxy": {
    "Routes": {
      "identity-route": {
        "ClusterId": "identity-cluster",
        "Match": {
          "Path": "/api/{version}/identity/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/api/{version}/identity" },
          { "RequestHeader": "X-Forwarded-Service", "Set": "identity" }
        ]
      },
      "catalog-route": {
        "ClusterId": "catalog-cluster",
        "Match": {
          "Path": "/api/{version}/catalog/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/api/{version}/catalog" }
        ]
      },
      "commerce-route": {
        "ClusterId": "commerce-cluster",
        "Match": {
          "Path": "/api/{version}/commerce/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/api/{version}/commerce" }
        ]
      },
      "engagement-route": {
        "ClusterId": "engagement-cluster",
        "Match": {
          "Path": "/api/{version}/engagement/{**catch-all}"
        },
        "Transforms": [
          { "PathRemovePrefix": "/api/{version}/engagement" }
        ]
      }
    },
    "Clusters": {
      "identity-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "identity-1": { "Address": "http://identity-service:8080" }
        },
        "HealthCheck": {
          "Active": {
            "Enabled": true,
            "Interval": "00:00:10",
            "Timeout": "00:00:05",
            "Path": "/health"
          }
        }
      },
      "catalog-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "catalog-1": { "Address": "http://catalog-service:8080" }
        },
        "HealthCheck": {
          "Active": { "Enabled": true, "Interval": "00:00:10", "Path": "/health" }
        }
      },
      "commerce-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "commerce-1": { "Address": "http://commerce-service:8080" }
        },
        "HealthCheck": {
          "Active": { "Enabled": true, "Interval": "00:00:10", "Path": "/health" }
        }
      },
      "engagement-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "Destinations": {
          "engagement-1": { "Address": "http://engagement-service:8080" }
        },
        "HealthCheck": {
          "Active": { "Enabled": true, "Interval": "00:00:10", "Path": "/health" }
        }
      }
    }
  }
}
```

### Environment-Specific Overrides

```json
// appsettings.Development.json
{
  "ReverseProxy": {
    "Clusters": {
      "identity-cluster": {
        "Destinations": {
          "identity-1": { "Address": "http://localhost:8081" }
        }
      },
      "catalog-cluster": {
        "Destinations": {
          "catalog-1": { "Address": "http://localhost:8082" }
        }
      },
      "commerce-cluster": {
        "Destinations": {
          "commerce-1": { "Address": "http://localhost:8083" }
        }
      },
      "engagement-cluster": {
        "Destinations": {
          "engagement-1": { "Address": "http://localhost:8084" }
        }
      }
    }
  }
}
```

---

## 8. Development Guide

### Program.cs (Gateway Entry Point)

```csharp
// src/Gateway/BillingGateway/Program.cs
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// ---------- Logging ----------
builder.Host.UseSerilog((context, config) =>
    config.ReadFrom.Configuration(context.Configuration));

// ---------- YARP ----------
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// ---------- Authentication ----------
builder.Services.AddAuthentication("Bearer")
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            IssuerSigningKey = new RsaSecurityKey(
                RsaKeyLoader.LoadPublicKey(builder.Configuration["Jwt:PublicKeyPath"]!)),
        };
    });

builder.Services.AddAuthorization();

// ---------- Rate Limiting ----------
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("default", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 10;
    });

    options.AddFixedWindowLimiter("auth", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
    });

    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(
            new { error = "Too many requests. Please try again later." }, token);
    };
});

// ---------- CORS ----------
builder.Services.AddCors(options =>
{
    options.AddPolicy("Default", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [])
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ---------- Health Checks ----------
builder.Services.AddHealthChecks()
    .AddUrlGroup(new Uri("http://identity-service:8080/health"), name: "identity")
    .AddUrlGroup(new Uri("http://catalog-service:8080/health"), name: "catalog")
    .AddUrlGroup(new Uri("http://commerce-service:8080/health"), name: "commerce")
    .AddUrlGroup(new Uri("http://engagement-service:8080/health"), name: "engagement");

var app = builder.Build();

// ---------- Middleware Pipeline ----------
app.UseSerilogRequestLogging();
app.UseCors("Default");
app.UseRateLimiter();

// Custom middleware
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

// YARP must be last — it forwards remaining requests
app.MapReverseProxy();

app.MapHealthChecks("/health");

app.Run();
```

---

## 9. Middleware Pipeline

### Correlation ID Middleware

```csharp
// src/Gateway/BillingGateway/Middleware/CorrelationIdMiddleware.cs
public class CorrelationIdMiddleware
{
    private readonly RequestDelegate _next;
    private const string CorrelationIdHeader = "X-Correlation-Id";

    public CorrelationIdMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        // Use existing or generate new correlation ID
        if (!context.Request.Headers.TryGetValue(CorrelationIdHeader, out var correlationId))
        {
            correlationId = Guid.NewGuid().ToString();
        }

        context.Items[CorrelationIdHeader] = correlationId.ToString();
        context.Request.Headers[CorrelationIdHeader] = correlationId;
        context.Response.Headers[CorrelationIdHeader] = correlationId;

        using (Serilog.Context.LogContext.PushProperty("CorrelationId", correlationId.ToString()))
        {
            await _next(context);
        }
    }
}
```

### JWT Claims Injection Middleware

```csharp
// After JWT validation, inject claims as headers for downstream services
public class ClaimsInjectionMiddleware
{
    private readonly RequestDelegate _next;

    public ClaimsInjectionMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var tenantId = context.User.FindFirst("tid")?.Value;
            var userId = context.User.FindFirst("sub")?.Value;
            var roles = string.Join(",", context.User.FindAll("roles").Select(c => c.Value));

            if (tenantId != null) context.Request.Headers["X-Tenant-Id"] = tenantId;
            if (userId != null) context.Request.Headers["X-User-Id"] = userId;
            if (!string.IsNullOrEmpty(roles)) context.Request.Headers["X-User-Roles"] = roles;
        }

        await _next(context);
    }
}
```

---

## 10. Rate Limiting

### Per-Tenant Rate Limiting

```csharp
// Custom rate limiter that uses tenant_id from JWT
builder.Services.AddRateLimiter(options =>
{
    options.AddPolicy("per-tenant", context =>
    {
        var tenantId = context.User?.FindFirst("tid")?.Value ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(tenantId, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 1000,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 50,
        });
    });
});
```

---

## 11. JWT Validation at Gateway

```
Request Flow:
1. Client sends: Authorization: Bearer <token>
2. Gateway middleware:
   a. Extract token from Authorization header
   b. Verify RS256 signature using public key
   c. Check token expiry (exp claim)
   d. Check issuer (iss) and audience (aud)
   e. Check Redis blocklist for revoked tokens (jti)
   f. Extract claims (tid, sub, roles, perms)
   g. Inject X-Tenant-Id, X-User-Id, X-User-Roles headers
3. YARP forwards request to upstream service with injected headers
4. Upstream service trusts headers (internal network only)
```

### Redis Token Blocklist Check

```csharp
// Check if token was revoked (logged out)
public class TokenBlocklistMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IDistributedCache _cache;

    public TokenBlocklistMiddleware(RequestDelegate next, IDistributedCache cache)
    {
        _next = next;
        _cache = cache;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.User.Identity?.IsAuthenticated == true)
        {
            var jti = context.User.FindFirst("jti")?.Value;
            if (jti != null)
            {
                var blocked = await _cache.GetStringAsync($"blocked:{jti}");
                if (blocked != null)
                {
                    context.Response.StatusCode = 401;
                    await context.Response.WriteAsJsonAsync(new { error = "Token has been revoked" });
                    return;
                }
            }
        }

        await _next(context);
    }
}
```

---

## 12. Load Balancing

### Available Policies

| Policy | Description | Use When |
|---|---|---|
| **RoundRobin** | Distribute evenly across destinations | Default; equal-capacity pods |
| **Random** | Pick a random destination | Simple; no state needed |
| **LeastRequests** | Route to destination with fewest active requests | Uneven workloads |
| **PowerOfTwoChoices** | Pick 2 random, choose the one with fewer requests | Good general-purpose |
| **FirstAlphabetical** | Always pick the first (sorted) destination | Testing/debugging |

### Configuration Example

```json
{
  "Clusters": {
    "catalog-cluster": {
      "LoadBalancingPolicy": "RoundRobin",
      "Destinations": {
        "catalog-1": { "Address": "http://catalog-pod-1:8080" },
        "catalog-2": { "Address": "http://catalog-pod-2:8080" },
        "catalog-3": { "Address": "http://catalog-pod-3:8080" }
      }
    }
  }
}
```

> **Note:** In Kubernetes, K8s Service handles load balancing internally. YARP load balancing is useful for non-K8s deployments or when you need application-level routing logic.

---

## 13. Health Checks

### Aggregated Health Endpoint

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                duration = e.Value.Duration.TotalMilliseconds
            }),
            totalDuration = report.TotalDuration.TotalMilliseconds
        };
        await context.Response.WriteAsJsonAsync(result);
    }
});
```

### Sample Health Response

```json
{
  "status": "Healthy",
  "checks": [
    { "name": "identity", "status": "Healthy", "duration": 12.5 },
    { "name": "catalog", "status": "Healthy", "duration": 8.3 },
    { "name": "commerce", "status": "Healthy", "duration": 15.1 },
    { "name": "engagement", "status": "Healthy", "duration": 9.7 }
  ],
  "totalDuration": 15.2
}
```

---

## 14. Do's & Don'ts

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Keep Gateway thin** | Only routing, auth, rate limiting — no business logic |
| 2 | **Use configuration-driven routes** | Easy to add/remove services without code changes |
| 3 | **Enable health checks** | Critical for K8s liveness/readiness probes |
| 4 | **Add correlation IDs** | Trace requests across services |
| 5 | **Log request/response metadata** | Duration, status code, tenant, path — for debugging |
| 6 | **Run 2+ Gateway replicas** | Avoid single point of failure |
| 7 | **Cache route config** | YARP caches internally; avoid rebuilding on every request |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't put business logic in Gateway** | Gateway = routing + cross-cutting concerns only |
| 2 | **Don't call databases from Gateway** | Only Redis (for blocklist/rate limits) |
| 3 | **Don't skip JWT validation** | Always validate at Gateway, even if services also validate |
| 4 | **Don't expose internal service URLs** | Clients only see `/api/v1/*`; never the internal service addresses |
| 5 | **Don't use YARP for static files** | Let CDN/Cloudflare handle static assets |

---

## 15. Testing

### Integration Test

```csharp
public class GatewayRoutingTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public GatewayRoutingTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_Endpoint_Returns_OK()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Unauthenticated_Request_Returns_401()
    {
        var response = await _client.GetAsync("/api/v1/catalog/products");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
```

---

## 16. How to Run

```powershell
# Start downstream services first
docker compose up -d identity catalog commerce engagement

# Run Gateway
dotnet run --project src/Gateway/BillingGateway

# Gateway listens on: http://localhost:5000
# Routes:
#   http://localhost:5000/api/v1/identity/*
#   http://localhost:5000/api/v1/catalog/*
#   http://localhost:5000/api/v1/commerce/*
#   http://localhost:5000/api/v1/engagement/*
#   http://localhost:5000/health
```

---

## 17. Local Deployment

```powershell
dotnet publish src/Gateway/BillingGateway -c Release -o ./publish/gateway
dotnet ./publish/gateway/BillingGateway.dll
```

---

## 18. Cloud Deployment with Docker

### Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY src/Gateway/BillingGateway/*.csproj ./
RUN dotnet restore
COPY src/Gateway/BillingGateway/ ./
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
RUN adduser --disabled-password --gecos '' appuser
USER appuser
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
HEALTHCHECK --interval=30s CMD wget --spider http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "BillingGateway.dll"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2  # Always run 2+ replicas
  selector:
    matchLabels:
      app: api-gateway
  template:
    spec:
      containers:
        - name: gateway
          image: ghcr.io/your-org/billing-gateway:latest
          ports:
            - containerPort: 8080
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 15
```

---

## 19. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **502 Bad Gateway** | Downstream service unreachable | Check service health; verify cluster addresses |
| **404 Not Found** | Route not matching | Check route paths and catch-all patterns |
| **401 Unauthorized** | JWT validation failure | Verify public key; check token expiry; check issuer/audience |
| **429 Too Many Requests** | Rate limit exceeded | Increase limits or check for misconfigured client |
| **CORS errors** | Missing origin in allowed list | Add origin to `Cors:AllowedOrigins` configuration |
| **Slow responses** | Downstream service slow | Check service health; add circuit breaker |

---

## 20. Useful Commands

```powershell
# Run
dotnet run --project src/Gateway/BillingGateway
dotnet watch run --project src/Gateway/BillingGateway  # with hot reload

# Test routes
curl http://localhost:5000/health
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/v1/catalog/products

# Docker
docker build -t billing-gateway -f src/Gateway/BillingGateway/Dockerfile .
docker run -p 5000:8080 billing-gateway
```

---

## 21. References

| Resource | URL |
|---|---|
| **YARP Official Docs** | https://microsoft.github.io/reverse-proxy |
| **YARP GitHub** | https://github.com/microsoft/reverse-proxy |
| **YARP Configuration** | https://microsoft.github.io/reverse-proxy/articles/config-files.html |
| **YARP Transforms** | https://microsoft.github.io/reverse-proxy/articles/transforms.html |
| **.NET Rate Limiting** | https://learn.microsoft.com/aspnet/core/performance/rate-limit |
| **.NET Auth** | https://learn.microsoft.com/aspnet/core/security/authentication |
