# 🌐 Cloudflare — CDN & Edge Security

> **Role in Project:** CDN, DDoS protection, SSL/TLS termination, DNS management, and edge caching
> **Related:** [Kubernetes](./kubernetes.md) | [Next.js](./nextjs.md) | [YARP Gateway](./yarp-api-gateway.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Cloudflare](#2-why-we-chose-cloudflare)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Setup & Configuration](#5-setup--configuration)
6. [DNS Management](#6-dns-management)
7. [SSL/TLS Configuration](#7-ssltls-configuration)
8. [Caching Strategy](#8-caching-strategy)
9. [Security — WAF & DDoS](#9-security--waf--ddos)
10. [Page Rules & Transform Rules](#10-page-rules--transform-rules)
11. [Cloudflare Workers (Edge Functions)](#11-cloudflare-workers-edge-functions)
12. [Best Practices (Do's & Don'ts)](#12-best-practices-dos--donts)
13. [Monitoring](#13-monitoring)
14. [How to Run (Local Dev)](#14-how-to-run-local-dev)
15. [Production Deployment](#15-production-deployment)
16. [Troubleshooting](#16-troubleshooting)
17. [References](#17-references)

---

## 1. Purpose & Overview

**Cloudflare** sits between clients and your origin servers, providing caching, security, and performance optimization at the edge (300+ global PoPs).

### Architecture with Cloudflare

```
Users (Browser / Mobile)
    │
    ▼
┌──────────────────────────────────────────┐
│           Cloudflare Edge Network         │
│                                          │
│  ├── DNS Resolution                      │
│  ├── SSL/TLS Termination                 │
│  ├── DDoS Mitigation                     │
│  ├── WAF (Web Application Firewall)      │
│  ├── Static Asset Caching                │
│  └── Bot Protection                      │
└──────────────────┬───────────────────────┘
                   │ (only uncached requests)
                   ▼
┌──────────────────────────────────────────┐
│           Origin Server (K8s)             │
│                                          │
│  ├── YARP Gateway (api.billing.com)      │
│  └── Next.js Web (app.billing.com)       │
└──────────────────────────────────────────┘
```

### What Cloudflare Handles

| Feature | Details |
|---|---|
| **DNS** | Authoritative DNS with fast propagation |
| **SSL** | Free SSL certificates; auto-renewal |
| **CDN** | Cache static assets at edge (JS, CSS, images) |
| **DDoS** | Automatic L3/L4/L7 DDoS mitigation |
| **WAF** | Block SQL injection, XSS, OWASP top 10 |
| **Bot Protection** | Block scrapers, credential stuffers |
| **Rate Limiting** | Edge-level rate limits (before hitting origin) |

---

## 2. Why We Chose Cloudflare

| Factor | Decision Rationale |
|---|---|
| **Free Tier** | DNS, CDN, DDoS, basic WAF — all free |
| **Performance** | 300+ PoPs — users hit nearest edge server |
| **SSL** | Free universal SSL — no cert management |
| **Security** | DDoS protection + WAF included |
| **Easy Setup** | Point DNS to Cloudflare → instant protection |
| **Workers** | Edge functions for custom logic (if needed) |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Free SSL** | Universal SSL certificate — no cost, auto-renew |
| 2 | **Global CDN** | Static assets served from 300+ locations |
| 3 | **DDoS Protection** | Always-on mitigation — unlimited, free |
| 4 | **Fast DNS** | ~11ms average DNS resolution |
| 5 | **Zero Config CDN** | Just proxy DNS through Cloudflare |
| 6 | **Analytics** | Free traffic analytics and security insights |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Cache Purge Delay** | Changes may take minutes → use cache tags for instant purge |
| 2 | **Vendor Lock-in** | DNS tied to Cloudflare → keep DNS records documented |
| 3 | **Advanced Features Paid** | Custom WAF rules, advanced bot protection → Pro plan |
| 4 | **Debugging** | Hard to debug edge behavior → use Cloudflare trace |

---

## 4. Prerequisites

| Requirement | Purpose |
|---|---|
| **Domain name** | e.g., `billing-app.com` |
| **Cloudflare account** | Free plan is sufficient |
| **Origin server** | K8s cluster or VPS with public IP |

---

## 5. Setup & Configuration

### Initial Setup

1. **Sign up** at https://dash.cloudflare.com
2. **Add site** → enter your domain (e.g., `billing-app.com`)
3. **Scan DNS** → Cloudflare imports existing records
4. **Update nameservers** → at your registrar, point to Cloudflare nameservers
5. **Wait for propagation** (usually <24 hours)

### Recommended Settings

| Setting | Value | Path |
|---|---|---|
| SSL/TLS Mode | **Full (strict)** | SSL/TLS → Overview |
| Always Use HTTPS | **On** | SSL/TLS → Edge Certificates |
| HTTP/3 | **On** | Speed → Optimization → Protocol |
| Brotli | **On** | Speed → Optimization → Content |
| Early Hints | **On** | Speed → Optimization → Content |
| Browser Cache TTL | **4 hours** | Caching → Configuration |
| Security Level | **Medium** | Security → Settings |

---

## 6. DNS Management

### DNS Records for This Project

| Type | Name | Content | Proxy | TTL |
|---|---|---|---|---|
| A | `billing-app.com` | `<Origin IP>` | ☁️ Proxied | Auto |
| A | `api` | `<Origin IP>` | ☁️ Proxied | Auto |
| A | `app` | `<Origin IP>` | ☁️ Proxied | Auto |
| CNAME | `www` | `billing-app.com` | ☁️ Proxied | Auto |
| MX | `billing-app.com` | `mail.provider.com` | DNS only | Auto |
| TXT | `billing-app.com` | `v=spf1 include:...` | DNS only | Auto |

### Subdomains

- `api.billing-app.com` → YARP Gateway (API traffic)
- `app.billing-app.com` → Next.js Web (frontend)
- `billing-app.com` → Redirect to `app.billing-app.com`

---

## 7. SSL/TLS Configuration

### Modes

| Mode | Description | Recommendation |
|---|---|---|
| **Off** | No encryption | ❌ Never use |
| **Flexible** | HTTPS client↔Cloudflare, HTTP Cloudflare↔origin | ❌ Insecure |
| **Full** | HTTPS both sides, self-signed cert OK on origin | ⚠️ Acceptable |
| **Full (Strict)** | HTTPS both sides, valid cert required on origin | ✅ **Use this** |

### Origin Certificate

```
Cloudflare → SSL/TLS → Origin Server → Create Certificate
```

- Generate a Cloudflare Origin CA certificate (free, 15-year validity)
- Install on your origin server (K8s Ingress or load balancer)

---

## 8. Caching Strategy

### What Gets Cached

| Content | Cached? | TTL |
|---|---|---|
| Static assets (JS, CSS, images) | ✅ Yes (by default) | Cache-Control header |
| HTML pages | ⚠️ Only with Page Rules | Short (60s) |
| API responses (`/api/*`) | ❌ No (dynamic) | Not cached |
| Fonts, favicons | ✅ Yes | Long (1 year) |

### Cache-Control Headers (Set in Next.js)

```typescript
// next.config.ts — static assets get long cache
const nextConfig = {
  headers: async () => [
    {
      source: "/_next/static/:path*",
      headers: [
        { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
      ]
    },
    {
      source: "/api/:path*",
      headers: [
        { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" }
      ]
    }
  ]
};
```

### API Cache Headers (Set in .NET)

```csharp
// Products list — cacheable for 60s
[HttpGet]
[ResponseCache(Duration = 60, VaryByQueryKeys = ["page", "search"])]
public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(...)
{
    // Cloudflare will cache this response if Cache-Control allows
}

// Orders — never cache
[HttpGet("{id}")]
[ResponseCache(NoStore = true)]
public async Task<ActionResult<OrderDto>> GetOrder(Guid id) { }
```

---

## 9. Security — WAF & DDoS

### DDoS Protection

Cloudflare automatically mitigates DDoS attacks at all layers:
- **L3/L4** — Network-level floods (SYN, UDP) — always blocked
- **L7** — Application-level (HTTP floods) — rate limited

### WAF Rules (Free Tier)

Enable at: **Security** → **WAF** → **Managed Rules**

| Ruleset | What It Blocks |
|---|---|
| **Cloudflare Managed** | OWASP top 10, known exploits |
| **Cloudflare OWASP** | SQL injection, XSS, RFI/LFI |

### Custom WAF Rules

```
# Block requests to admin endpoints from outside India
(http.request.uri.path contains "/admin") and (ip.geoip.country ne "IN")
→ Action: Block

# Rate limit login endpoint
(http.request.uri.path eq "/api/identity/auth/login") and (http.request.method eq "POST")
→ Rate limit: 10 requests per minute per IP
```

---

## 10. Page Rules & Transform Rules

### Redirect Rules

```
# Redirect www to apex
www.billing-app.com/* → https://billing-app.com/$1 (301 redirect)

# Redirect apex to app subdomain
billing-app.com/* → https://app.billing-app.com/$1 (301 redirect)
```

### Transform Rules (URL Rewriting)

```
# Add security headers to all responses
Response Header: X-Content-Type-Options = nosniff
Response Header: X-Frame-Options = DENY
Response Header: Referrer-Policy = strict-origin-when-cross-origin
```

---

## 11. Cloudflare Workers (Edge Functions)

For custom logic at the edge (optional, if needed):

```javascript
// Example: Geo-based routing
export default {
  async fetch(request) {
    const country = request.cf.country;

    // Route Indian users to India origin
    if (country === "IN") {
      return fetch("https://in.billing-app.com" + new URL(request.url).pathname, request);
    }

    // Default origin
    return fetch(request);
  }
};
```

---

## 12. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use Full (Strict) SSL** | End-to-end encryption verified |
| 2 | **Proxy DNS records** | Only proxied records get CDN/WAF protection |
| 3 | **Set long cache for static assets** | `immutable` for hashed filenames (Next.js `_next/static`) |
| 4 | **Never cache API responses at edge** | Dynamic, tenant-specific data must be fresh |
| 5 | **Enable HTTPS redirect** | All HTTP → HTTPS automatically |
| 6 | **Use origin certificates** | Free, long-lived, only trusted by Cloudflare |
| 7 | **Monitor security events** | Review blocked requests regularly |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't use Flexible SSL** | Insecure between Cloudflare and origin |
| 2 | **Don't expose origin IP** | All traffic must go through Cloudflare |
| 3 | **Don't cache authenticated responses** | Use `Cache-Control: no-store` for user-specific data |
| 4 | **Don't skip WAF** | Even if you have app-level validation |
| 5 | **Don't set short DNS TTL** | Cloudflare manages TTL; use "Auto" |

---

## 13. Monitoring

### Cloudflare Dashboard Metrics

| Metric | Location |
|---|---|
| **Total requests** | Analytics → Traffic |
| **Cache hit ratio** | Analytics → Traffic → Caching |
| **Bandwidth saved** | Analytics → Traffic |
| **Threats mitigated** | Security → Overview |
| **WAF events** | Security → Events |
| **Origin response time** | Analytics → Traffic |

### Target Metrics

| Metric | Target |
|---|---|
| Cache hit ratio | >80% for static assets |
| Origin requests | <40% of total (60%+ cached) |
| Blocked threats | Review weekly |

---

## 14. How to Run (Local Dev)

Cloudflare is not used in local development. Your local setup connects directly:

```
Browser → http://localhost:3000 (Next.js dev server)
Browser → http://localhost:5000 (YARP Gateway)
```

For testing Cloudflare-specific features locally:
```powershell
# Install Wrangler (Cloudflare CLI) — only if using Workers
npm install -g wrangler

# Local dev for Workers
wrangler dev
```

---

## 15. Production Deployment

### Setup Checklist

- [ ] Domain added to Cloudflare
- [ ] Nameservers updated at registrar
- [ ] SSL mode set to Full (Strict)
- [ ] Origin certificate installed on K8s Ingress
- [ ] DNS records created (A/CNAME for api, app subdomains)
- [ ] Always Use HTTPS enabled
- [ ] WAF managed rules enabled
- [ ] Cache rules configured
- [ ] Security headers added via Transform Rules
- [ ] Bot fight mode enabled

### DNS Records → K8s Ingress

```
api.billing-app.com → A → <K8s LoadBalancer IP> (Proxied)
app.billing-app.com → A → <K8s LoadBalancer IP> (Proxied)
```

---

## 16. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Site not loading after DNS change** | Nameserver propagation | Wait 24h; check with `dig` |
| **SSL error (525/526)** | Origin cert issue | Install Cloudflare Origin CA cert |
| **Stale content** | Cached old version | Purge cache: Caching → Configuration → Purge Everything |
| **API returns cached data** | Cache rule too broad | Ensure `/api/*` has `no-store` |
| **Origin IP exposed** | DNS record not proxied | Enable proxy (orange cloud) |
| **Rate limited by Cloudflare** | Bot detection | Add API key to allowed list |

### Check DNS Status

```powershell
# Verify Cloudflare is proxying
nslookup api.billing-app.com
# Should show Cloudflare IP, not your origin IP
```

---

## 17. References

| Resource | URL |
|---|---|
| **Cloudflare Docs** | https://developers.cloudflare.com |
| **Cloudflare Dashboard** | https://dash.cloudflare.com |
| **SSL/TLS Modes** | https://developers.cloudflare.com/ssl |
| **WAF** | https://developers.cloudflare.com/waf |
| **Caching** | https://developers.cloudflare.com/cache |
| **Workers** | https://developers.cloudflare.com/workers |
