# 🔴 Redis 7 — Cache & Session Store

> **Role in Project:** Distributed cache, session store, token blocklist, and pub/sub
> **Version:** 7.x
> **Related:** [.NET Web API](./dotnet-web-api.md) | [YARP Gateway](./yarp-api-gateway.md) | [PostgreSQL](./postgresql.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Redis](#2-why-we-chose-redis)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [How to Create Database](#6-how-to-create-database)
7. [Development Guide](#7-development-guide)
8. [Caching Strategies](#8-caching-strategies)
9. [Session & Token Management](#9-session--token-management)
10. [Best Practices (Do's & Don'ts)](#10-best-practices-dos--donts)
11. [Monitoring](#11-monitoring)
12. [How to Run](#12-how-to-run)
13. [Local Deployment](#13-local-deployment)
14. [Cloud Deployment with Docker](#14-cloud-deployment-with-docker)
15. [Troubleshooting](#15-troubleshooting)
16. [Useful Commands](#16-useful-commands)
17. [References](#17-references)

---

## 1. Purpose & Overview

**Redis** is an in-memory data structure store used as a database, cache, message broker, and streaming engine. It stores data in RAM for sub-millisecond read/write speed.

### Role in This Project

| Use Case | Key Pattern | TTL |
|---|---|---|
| **API Response Cache** | `cache:catalog:products:{tenant_id}:{page}` | 60s |
| **Tenant Config Cache** | `config:{tenant_id}` | 300s |
| **Feature Flags** | `features:{tenant_id}` | 60s |
| **JWT Token Blocklist** | `blocked:{jti}` | 15min (= access token TTL) |
| **Refresh Token Store** | `refresh:{jti}` | 7 days |
| **Rate Limiting** | `ratelimit:{tenant_id}:{window}` | Window duration |
| **Session Data** | `session:{session_id}` | 30min |
| **OTP Codes** | `otp:{phone_or_email}` | 5min |
| **Cart (Guest)** | `cart:{session_id}` | 24h |
| **Pub/Sub** | Real-time events (config changes, stock updates) | — |

### How It Fits in the Architecture

```
┌──────────────────────────────────────────────┐
│            Redis (in-memory cache)             │
│                                              │
│  ├── Token Blocklist (revoked JWTs)          │
│  ├── Refresh Tokens (jti → user mapping)     │
│  ├── API Response Cache (products, configs)  │
│  ├── Rate Limit Counters                     │
│  ├── OTP Codes (phone → code)                │
│  └── Pub/Sub (real-time config broadcasts)   │
└──────────────────┬───────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
 Gateway      Services      Background
 (blocklist,  (cache,       Jobs
  rate limit)  sessions)    (cache warm)
```

---

## 2. Why We Chose Redis

| Factor | Decision Rationale |
|---|---|
| **Sub-millisecond Latency** | Cache reads <1ms vs 5-50ms for PostgreSQL |
| **JWT Blocklist** | Fast lookup for revoked tokens (checked on every request) |
| **Rate Limiting** | Atomic counters with TTL — built-in for rate limiting |
| **Pub/Sub** | Broadcast config changes to all service instances in real-time |
| **.NET Integration** | `StackExchange.Redis` is mature; `IDistributedCache` built-in |
| **Simple Operations** | Key-value, lists, sets, sorted sets — no complex query language |
| **Industry Standard** | Used by virtually every web-scale application |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Speed** | All data in RAM — sub-millisecond reads |
| 2 | **Versatile** | Strings, hashes, lists, sets, sorted sets, streams |
| 3 | **Atomic Operations** | INCR, DECR, SETNX — perfect for counters and locks |
| 4 | **TTL** | Built-in key expiration — automatic cleanup |
| 5 | **Pub/Sub** | Real-time messaging between services |
| 6 | **Lua Scripting** | Complex atomic operations in a single call |
| 7 | **Cluster Mode** | Horizontal scaling with Redis Cluster |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Memory-bound** | Data limited by RAM → cache only hot data; set TTL |
| 2 | **No Complex Queries** | No SQL, no JOINs → use PostgreSQL for complex queries |
| 3 | **Persistence Risky** | RAM loss = data loss → RDB snapshots + AOF for durability |
| 4 | **Single-threaded I/O** | One core for command processing → Redis 7 multi-threaded I/O |
| 5 | **Cost** | Large datasets expensive in RAM → only cache what's needed |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Docker** | 24.x | Run Redis in container |
| **redis-cli** | 7.x | Redis command-line client |
| **RedisInsight** | Latest | GUI for Redis (free, by Redis Inc.) |

---

## 5. Installation & Setup

### Docker (Recommended)

```powershell
# Run Redis 7
docker run -d `
  --name billing-redis `
  -p 6379:6379 `
  redis:7-alpine `
  redis-server --requirepass dev_password --maxmemory 256mb --maxmemory-policy allkeys-lru

# Verify
docker exec -it billing-redis redis-cli -a dev_password PING
# Response: PONG
```

### Connect from .NET

```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "Redis": "localhost:6379,password=dev_password,abortConnect=false"
  }
}

// Program.cs
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
    options.InstanceName = "billing:";
});
```

---

## 6. How to Create Database

Redis uses numbered databases (0-15 by default). In this project, we use key prefixes for namespace isolation instead of separate databases.

### Key Naming Convention

```
billing:{service}:{entity}:{identifier}

Examples:
  billing:identity:config:tenant-uuid
  billing:catalog:products:tenant-uuid:page-1
  billing:commerce:cart:session-uuid
  billing:gateway:blocked:jti-uuid
  billing:gateway:ratelimit:tenant-uuid
  billing:identity:otp:+919876543210
  billing:identity:refresh:jti-uuid
```

---

## 7. Development Guide

### 7.1 Basic Operations (redis-cli)

```redis
# String (most common — cache responses)
SET billing:config:tenant1 '{"currency":"INR","gst_enabled":true}' EX 300
GET billing:config:tenant1

# Hash (structured data — user session)
HSET billing:session:abc123 user_id "usr_01" tenant_id "ten_01" role "admin"
HGETALL billing:session:abc123
HGET billing:session:abc123 user_id

# List (ordered — recent activity)
LPUSH billing:activity:tenant1 '{"action":"login","user":"usr_01"}'
LRANGE billing:activity:tenant1 0 9  # Last 10 items

# Set (unique values — online users)
SADD billing:online:tenant1 "usr_01" "usr_02"
SMEMBERS billing:online:tenant1
SCARD billing:online:tenant1  # Count

# Sorted Set (ranked — leaderboard)
ZADD billing:topselling:tenant1 100 "product1" 85 "product2"
ZREVRANGE billing:topselling:tenant1 0 9 WITHSCORES

# Key with TTL
SET billing:otp:+919876543210 "123456" EX 300  # 5 minutes
TTL billing:otp:+919876543210  # Check remaining TTL
```

### 7.2 Using Redis in .NET (IDistributedCache)

```csharp
// Caching service using IDistributedCache
public class CacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    private readonly ILogger<CacheService> _logger;

    public CacheService(IDistributedCache cache, ILogger<CacheService> logger)
    {
        _cache = cache;
        _logger = logger;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var cached = await _cache.GetStringAsync(key, ct);
        if (cached is null) return default;

        _logger.LogDebug("Cache HIT: {Key}", key);
        return JsonSerializer.Deserialize<T>(cached);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default)
    {
        var json = JsonSerializer.Serialize(value);
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiry ?? TimeSpan.FromMinutes(5)
        };

        await _cache.SetStringAsync(key, json, options, ct);
        _logger.LogDebug("Cache SET: {Key} (TTL: {TTL})", key, expiry);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        await _cache.RemoveAsync(key, ct);
    }
}
```

### 7.3 Cache-Aside Pattern

```csharp
// ProductService with cache-aside
public async Task<List<ProductDto>> GetProductsAsync(int page, CancellationToken ct)
{
    var cacheKey = $"catalog:products:{_tenantContext.TenantId}:page-{page}";

    // Try cache first
    var cached = await _cache.GetAsync<List<ProductDto>>(cacheKey, ct);
    if (cached is not null) return cached;

    // Cache miss — query DB
    var products = await _db.Products
        .Where(p => !p.IsDeleted)
        .OrderBy(p => p.Name)
        .Skip((page - 1) * 20)
        .Take(20)
        .Select(p => p.ToDto())
        .ToListAsync(ct);

    // Store in cache
    await _cache.SetAsync(cacheKey, products, TimeSpan.FromSeconds(60), ct);

    return products;
}
```

---

## 8. Caching Strategies

| Strategy | Description | Use For |
|---|---|---|
| **Cache-Aside** | App checks cache → miss → query DB → store in cache | Product lists, configs |
| **Write-Through** | Write to cache AND DB simultaneously | Inventory counts |
| **Write-Behind** | Write to cache → async write to DB | Analytics events |
| **Read-Through** | Cache auto-loads from DB on miss | Tenant config |
| **Cache Invalidation** | Delete cache on data change | Product CRUD |

### Cache Invalidation

```csharp
// When a product is created/updated/deleted:
public async Task InvalidateProductCache(Guid tenantId)
{
    // Delete all cached product pages for this tenant
    // Using StackExchange.Redis directly for pattern delete
    var server = _redis.GetServer(_redis.GetEndPoints().First());
    var keys = server.Keys(pattern: $"billing:catalog:products:{tenantId}:*");

    foreach (var key in keys)
    {
        await _redis.GetDatabase().KeyDeleteAsync(key);
    }
}
```

---

## 9. Session & Token Management

### JWT Token Blocklist

```csharp
// On logout: Add token to blocklist
public async Task RevokeTokenAsync(string jti, TimeSpan accessTokenTtl)
{
    await _cache.SetAsync(
        $"blocked:{jti}",
        "revoked",
        accessTokenTtl  // Only block until token would expire naturally
    );
}

// On every request (Gateway middleware):
public async Task<bool> IsTokenRevokedAsync(string jti)
{
    var blocked = await _cache.GetAsync<string>($"blocked:{jti}");
    return blocked is not null;
}
```

### OTP Storage

```csharp
// Store OTP with 5-minute TTL
public async Task StoreOtpAsync(string phoneOrEmail, string otp)
{
    await _cache.SetAsync(
        $"otp:{phoneOrEmail}",
        otp,
        TimeSpan.FromMinutes(5)
    );
}

// Verify OTP
public async Task<bool> VerifyOtpAsync(string phoneOrEmail, string otp)
{
    var stored = await _cache.GetAsync<string>($"otp:{phoneOrEmail}");
    if (stored == otp)
    {
        await _cache.RemoveAsync($"otp:{phoneOrEmail}");
        return true;
    }
    return false;
}
```

---

## 10. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Always set TTL** | Prevent memory exhaustion; stale data cleanup |
| 2 | **Use key prefixes** | `billing:service:entity:id` — organized namespace |
| 3 | **Use `SETNX` for locks** | Distributed locking without race conditions |
| 4 | **Serialize with JSON** | Human-readable; debuggable; compatible across services |
| 5 | **Handle cache misses gracefully** | Always fall back to DB if cache is empty or Redis is down |
| 6 | **Set `maxmemory-policy`** | `allkeys-lru` evicts least-recently-used keys when memory is full |
| 7 | **Monitor memory usage** | `INFO memory` — alert at 80% capacity |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't use Redis as primary DB** | Redis is cache/session store; PostgreSQL is source of truth |
| 2 | **Don't store large objects** | Keep values <100KB; store files in S3/MinIO |
| 3 | **Don't use `KEYS *` in production** | Blocks Redis; use `SCAN` for iteration |
| 4 | **Don't skip TTL** | Every key should expire; prevent memory leak |
| 5 | **Don't store secrets in Redis** | Use Azure Key Vault / AWS Secrets Manager |
| 6 | **Don't rely on Redis persistence** | AOF/RDB are for recovery, not durability guarantees |
| 7 | **Don't cache user-specific pages** | Cache shared data; user-specific data should be fresh |

---

## 11. Monitoring

```redis
# Memory usage
INFO memory

# Connected clients
INFO clients

# Key statistics
INFO keyspace

# Slow log (queries taking >10ms)
SLOWLOG GET 10

# Monitor all commands in real-time (use cautiously)
MONITOR
```

Key metrics to track:
- `used_memory` vs `maxmemory`
- `cache_hit_ratio` = `keyspace_hits / (keyspace_hits + keyspace_misses)`
- `connected_clients`
- `evicted_keys` (should be 0 ideally)

---

## 12. How to Run

```powershell
# Start Redis
docker run -d --name billing-redis -p 6379:6379 redis:7-alpine

# Connect with redis-cli
docker exec -it billing-redis redis-cli

# Test
PING  # PONG
SET test "hello"
GET test  # "hello"
```

---

## 13. Local Deployment

```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  redis_data:
```

---

## 14. Cloud Deployment with Docker

### Production Configuration

```dockerfile
FROM redis:7-alpine

COPY redis.conf /usr/local/etc/redis/redis.conf

CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
```

```ini
# redis.conf (production)
bind 0.0.0.0
port 6379
requirepass ${REDIS_PASSWORD}
maxmemory 512mb
maxmemory-policy allkeys-lru
save 60 1000     # RDB snapshot every 60s if 1000+ keys changed
appendonly yes    # AOF persistence
appendfsync everysec
```

### Cloud-Managed Options

| Provider | Service | Notes |
|---|---|---|
| **AWS** | ElastiCache for Redis | Managed, multi-AZ |
| **Azure** | Azure Cache for Redis | .NET integration |
| **GCP** | Memorystore for Redis | Managed |
| **Upstash** | Serverless Redis | Pay-per-request; great for startups |

---

## 15. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Connection refused** | Redis not running | `docker start billing-redis` |
| **OOM (Out of Memory)** | No maxmemory + TTL | Set `maxmemory` and `maxmemory-policy` |
| **Slow operations** | Large key or `KEYS *` | Use `SCAN`; keep values small |
| **Data loss on restart** | No persistence configured | Enable AOF: `appendonly yes` |
| **High latency** | Network or slow commands | Check `SLOWLOG`; verify network |

---

## 16. Useful Commands

```redis
# Connection
PING                           # Test connection
AUTH <password>                # Authenticate
SELECT 0                       # Switch database

# Keys
SET key value EX 300           # Set with 5min TTL
GET key                        # Get value
DEL key                        # Delete key
EXISTS key                     # Check if exists
TTL key                        # Get remaining TTL
KEYS "billing:*"               # Find keys (dev only!)
SCAN 0 MATCH "billing:*"      # Production-safe iteration

# Hashes
HSET hash field value          # Set hash field
HGET hash field                # Get hash field
HGETALL hash                   # Get all fields
HDEL hash field                # Delete field

# Counters
INCR counter                   # Increment by 1
INCRBY counter 5               # Increment by 5
DECR counter                   # Decrement

# Admin
INFO                           # Server info
DBSIZE                         # Number of keys
FLUSHDB                        # Delete all keys (DANGER)
CONFIG GET maxmemory           # Get config
SLOWLOG GET 10                 # Slow queries
```

---

## 17. References

| Resource | URL |
|---|---|
| **Official Docs** | https://redis.io/docs |
| **Redis Commands** | https://redis.io/commands |
| **StackExchange.Redis (.NET)** | https://stackexchange.github.io/StackExchange.Redis |
| **RedisInsight GUI** | https://redis.io/insight |
| **Docker Image** | https://hub.docker.com/_/redis |
| **Redis Best Practices** | https://redis.io/docs/management/optimization |
