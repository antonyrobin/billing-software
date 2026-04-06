# 📦 MinIO / S3 — Object Storage

> **Role in Project:** Store invoices, product images, import/export files, and attachments
> **Versions:** MinIO (dev) / AWS S3 or compatible (production)
> **Related:** [.NET Web API](./dotnet-web-api.md) | [Docker](./docker.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose MinIO / S3](#2-why-we-chose-minio--s3)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Core Concepts](#6-core-concepts)
7. [Development Guide — .NET Integration](#7-development-guide--net-integration)
8. [File Upload Patterns](#8-file-upload-patterns)
9. [Presigned URLs](#9-presigned-urls)
10. [Bucket Organization](#10-bucket-organization)
11. [Best Practices (Do's & Don'ts)](#11-best-practices-dos--donts)
12. [Security](#12-security)
13. [How to Run](#13-how-to-run)
14. [Local Deployment](#14-local-deployment)
15. [Cloud Deployment](#15-cloud-deployment)
16. [Troubleshooting](#16-troubleshooting)
17. [Useful Commands](#17-useful-commands)
18. [References](#18-references)

---

## 1. Purpose & Overview

**Object storage** stores unstructured data (files, images, PDFs) as objects in buckets. **MinIO** is an S3-compatible server for development; the same code works with AWS S3 in production.

### What We Store

| Content | Bucket | Path Pattern | Access |
|---|---|---|---|
| **Product Images** | `billing-assets` | `{tenant_id}/products/{product_id}/{filename}` | Public (CDN) |
| **Invoice PDFs** | `billing-invoices` | `{tenant_id}/invoices/{year}/{month}/{invoice_number}.pdf` | Private (presigned URL) |
| **Import Files** | `billing-imports` | `{tenant_id}/imports/{timestamp}_{filename}` | Private |
| **Export Files** | `billing-exports` | `{tenant_id}/exports/{timestamp}_{filename}` | Private (presigned URL) |
| **Attachments** | `billing-attachments` | `{tenant_id}/attachments/{entity}/{id}/{filename}` | Private |
| **Tenant Logos** | `billing-assets` | `{tenant_id}/logo.{ext}` | Public |

### Architecture

```
┌──────────────┐       upload       ┌───────────────────┐
│  Next.js /   │ ─────────────────► │  .NET Service     │
│  Flutter     │                    │  (validate + store)│
└──────────────┘                    └────────┬──────────┘
                                             │
       ┌─────────────────────────────────────┤
       │                                     │
       ▼                                     ▼
┌──────────────┐                   ┌──────────────────┐
│  MinIO (dev) │                   │  AWS S3 (prod)   │
│  localhost:  │                   │  or compatible   │
│  9000        │                   │  (Cloudflare R2) │
└──────────────┘                   └──────────────────┘
```

---

## 2. Why We Chose MinIO / S3

| Factor | Decision Rationale |
|---|---|
| **S3 Compatible** | MinIO uses the same API as AWS S3 — zero code changes |
| **Free Dev Environment** | MinIO runs locally in Docker — no cloud costs for dev |
| **Scalable** | S3 is virtually unlimited in production |
| **Presigned URLs** | Secure, time-limited download links without proxy |
| **Tenant Isolation** | Path-based isolation per tenant |
| **Industry Standard** | S3 API is the de facto standard for object storage |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Unlimited storage** | S3 scales to petabytes |
| 2 | **Cheap** | S3: $0.023/GB/month; R2: $0.015/GB/month |
| 3 | **Presigned URLs** | Offload downloads from your API servers |
| 4 | **Versioning** | Keep previous versions of files |
| 5 | **Lifecycle rules** | Auto-delete old exports after 30 days |
| 6 | **Dev parity** | MinIO in dev = exactly like S3 in prod |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Not a database** | No querying file contents → store metadata in PostgreSQL |
| 2 | **Eventual consistency** | Reads may be stale briefly → acceptable for files |
| 3 | **Egress costs** | Downloading from S3 costs money → use Cloudflare R2 (free egress) |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Docker** | 24.x | Run MinIO locally |
| **MinIO Client (mc)** | Latest | CLI for MinIO/S3 |

---

## 5. Installation & Setup

### Docker (MinIO)

```powershell
docker run -d `
  --name billing-minio `
  -p 9000:9000 `
  -p 9001:9001 `
  -e MINIO_ROOT_USER=billing_admin `
  -e MINIO_ROOT_PASSWORD=dev_password `
  -v minio_data:/data `
  minio/minio:latest server /data --console-address ":9001"

# MinIO Console: http://localhost:9001
# S3 API: http://localhost:9000
```

### Create Buckets

```powershell
# Install MinIO Client
# Download from https://min.io/download

# Configure alias
mc alias set billing http://localhost:9000 billing_admin dev_password

# Create buckets
mc mb billing/billing-assets
mc mb billing/billing-invoices
mc mb billing/billing-imports
mc mb billing/billing-exports
mc mb billing/billing-attachments

# Set public read on assets bucket
mc anonymous set download billing/billing-assets
```

### NuGet Packages

```powershell
dotnet add package AWSSDK.S3
```

---

## 6. Core Concepts

| Concept | Description |
|---|---|
| **Bucket** | Top-level container (like a root folder) |
| **Object** | A file stored in a bucket |
| **Key** | The full path of an object within a bucket |
| **Presigned URL** | Temporary URL for secure upload/download |
| **ACL** | Access control List — public or private |
| **Lifecycle Rule** | Auto-delete or transition objects based on age |

---

## 7. Development Guide — .NET Integration

### 7.1 Configuration

```json
// appsettings.json
{
  "Storage": {
    "ServiceUrl": "http://localhost:9000",
    "AccessKey": "billing_admin",
    "SecretKey": "dev_password",
    "ForcePathStyle": true,
    "AssetsBucket": "billing-assets",
    "InvoicesBucket": "billing-invoices",
    "ImportsBucket": "billing-imports",
    "ExportsBucket": "billing-exports"
  }
}
```

### 7.2 Storage Service

```csharp
// Services/StorageService.cs
public class StorageService : IStorageService
{
    private readonly IAmazonS3 _s3;
    private readonly StorageOptions _options;

    public StorageService(IAmazonS3 s3, IOptions<StorageOptions> options)
    {
        _s3 = s3;
        _options = options.Value;
    }

    public async Task<string> UploadAsync(
        string bucket,
        string key,
        Stream stream,
        string contentType,
        CancellationToken ct = default)
    {
        var request = new PutObjectRequest
        {
            BucketName = bucket,
            Key = key,
            InputStream = stream,
            ContentType = contentType,
            ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
        };

        await _s3.PutObjectAsync(request, ct);
        return key;
    }

    public async Task<Stream> DownloadAsync(
        string bucket,
        string key,
        CancellationToken ct = default)
    {
        var response = await _s3.GetObjectAsync(bucket, key, ct);
        return response.ResponseStream;
    }

    public async Task DeleteAsync(
        string bucket,
        string key,
        CancellationToken ct = default)
    {
        await _s3.DeleteObjectAsync(bucket, key, ct);
    }

    public string GetPresignedDownloadUrl(string bucket, string key, TimeSpan expiry)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucket,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiry),
            Verb = HttpVerb.GET
        };

        return _s3.GetPreSignedURL(request);
    }

    public string GetPresignedUploadUrl(string bucket, string key, TimeSpan expiry)
    {
        var request = new GetPreSignedUrlRequest
        {
            BucketName = bucket,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiry),
            Verb = HttpVerb.PUT
        };

        return _s3.GetPreSignedURL(request);
    }
}
```

### 7.3 Register S3 Client

```csharp
// Program.cs
var storageConfig = builder.Configuration.GetSection("Storage");

builder.Services.AddSingleton<IAmazonS3>(sp =>
{
    var config = new AmazonS3Config
    {
        ServiceURL = storageConfig["ServiceUrl"],
        ForcePathStyle = bool.Parse(storageConfig["ForcePathStyle"] ?? "true")
    };

    return new AmazonS3Client(
        storageConfig["AccessKey"],
        storageConfig["SecretKey"],
        config);
});

builder.Services.Configure<StorageOptions>(storageConfig);
builder.Services.AddSingleton<IStorageService, StorageService>();
```

---

## 8. File Upload Patterns

### 8.1 Product Image Upload

```csharp
[HttpPost("{productId}/image")]
[Authorize]
[RequestSizeLimit(5_000_000)] // 5MB
public async Task<ActionResult<string>> UploadProductImage(
    Guid productId,
    IFormFile file,
    CancellationToken ct)
{
    // Validate file type
    var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
    if (!allowedTypes.Contains(file.ContentType))
        return BadRequest("Only JPEG, PNG, and WebP images are allowed");

    // Validate file size
    if (file.Length > 5_000_000)
        return BadRequest("Image must be under 5MB");

    var tenantId = _tenantContext.TenantId;
    var extension = Path.GetExtension(file.FileName);
    var key = $"{tenantId}/products/{productId}/image{extension}";

    using var stream = file.OpenReadStream();
    await _storage.UploadAsync(
        _options.AssetsBucket,
        key,
        stream,
        file.ContentType,
        ct);

    // Update product with image URL
    var product = await _db.Products.FindAsync(productId);
    product!.ImageUrl = $"/{_options.AssetsBucket}/{key}";
    await _db.SaveChangesAsync(ct);

    return Ok(product.ImageUrl);
}
```

### 8.2 Invoice PDF Generation & Storage

```csharp
public async Task<string> GenerateAndStoreInvoiceAsync(Order order, CancellationToken ct)
{
    // Generate PDF (using QuestPDF or similar)
    var pdfBytes = _pdfService.GenerateInvoice(order);

    var key = $"{order.TenantId}/invoices/{order.CreatedAt:yyyy}/{order.CreatedAt:MM}/{order.InvoiceNumber}.pdf";

    using var stream = new MemoryStream(pdfBytes);
    await _storage.UploadAsync(
        _options.InvoicesBucket,
        key,
        stream,
        "application/pdf",
        ct);

    return key;
}
```

---

## 9. Presigned URLs

### Download Invoice (Secure, Time-Limited)

```csharp
[HttpGet("{orderId}/invoice-url")]
[Authorize]
public async Task<ActionResult<string>> GetInvoiceDownloadUrl(Guid orderId)
{
    var order = await _db.Orders.FindAsync(orderId);
    if (order?.InvoiceStorageKey is null) return NotFound();

    // Generate URL valid for 15 minutes
    var url = _storage.GetPresignedDownloadUrl(
        _options.InvoicesBucket,
        order.InvoiceStorageKey,
        TimeSpan.FromMinutes(15));

    return Ok(url);
}
```

### Client-Side Direct Upload (Large Files)

```csharp
// 1. Client requests upload URL
[HttpPost("import/upload-url")]
[Authorize]
public ActionResult<UploadUrlResponse> GetImportUploadUrl([FromQuery] string filename)
{
    var tenantId = _tenantContext.TenantId;
    var key = $"{tenantId}/imports/{DateTime.UtcNow:yyyyMMdd_HHmmss}_{Path.GetFileName(filename)}";

    var url = _storage.GetPresignedUploadUrl(
        _options.ImportsBucket,
        key,
        TimeSpan.FromMinutes(30));

    return Ok(new UploadUrlResponse { UploadUrl = url, Key = key });
}

// 2. Client uploads directly to MinIO/S3 using the presigned URL
// 3. Client notifies API that upload is complete
[HttpPost("import/process")]
[Authorize]
public async Task<ActionResult> ProcessImport([FromBody] ProcessImportRequest request)
{
    // Queue background job to process the uploaded file
    await _publishEndpoint.Publish(new ImportFileUploadedEvent
    {
        TenantId = _tenantContext.TenantId,
        StorageKey = request.Key,
        FileName = request.FileName
    });

    return Accepted();
}
```

---

## 10. Bucket Organization

```
billing-assets/           (PUBLIC — CDN cached)
  ├── {tenant_id}/
  │   ├── logo.png
  │   └── products/
  │       ├── {product_id}/image.jpg
  │       └── {product_id}/image.jpg

billing-invoices/         (PRIVATE — presigned URL access)
  ├── {tenant_id}/
  │   └── invoices/
  │       └── 2025/
  │           └── 01/
  │               ├── INV-001.pdf
  │               └── INV-002.pdf

billing-imports/          (PRIVATE — processing files)
  ├── {tenant_id}/
  │   └── imports/
  │       ├── 20250101_120000_products.csv
  │       └── 20250102_090000_customers.xlsx

billing-exports/          (PRIVATE — download files, 30-day lifecycle)
  ├── {tenant_id}/
  │   └── exports/
  │       ├── 20250101_sales_report.xlsx
  │       └── 20250102_gst_report.csv
```

---

## 11. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Validate file type and size** | Prevent malicious uploads |
| 2 | **Use presigned URLs** | Offload bandwidth from API server |
| 3 | **Tenant-prefix all paths** | Prevent cross-tenant access |
| 4 | **Set lifecycle rules** | Auto-delete exports after 30 days |
| 5 | **Generate unique filenames** | Prevent overwrites; use UUID or timestamp |
| 6 | **Store metadata in DB** | File path, size, type, uploaded_by in PostgreSQL |
| 7 | **Use server-side encryption** | AES-256 at rest |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't store files in PostgreSQL** | Use S3/MinIO for files |
| 2 | **Don't expose bucket directly** | Always validate access via API |
| 3 | **Don't trust client filenames** | Sanitize or generate new names |
| 4 | **Don't skip content-type validation** | Check MIME type, not just extension |
| 5 | **Don't make invoice bucket public** | Use presigned URLs for private files |
| 6 | **Don't store temporary files permanently** | Use lifecycle rules for cleanup |

---

## 12. Security

| Measure | Implementation |
|---|---|
| **Tenant Isolation** | All paths prefixed with `{tenant_id}/` |
| **Access Control** | Private buckets + presigned URLs |
| **File Validation** | Check MIME type, file size, file extension |
| **Encryption at Rest** | AES-256 server-side encryption |
| **CORS** | Configure allowed origins on bucket |
| **Filename Sanitization** | Strip path traversal characters (`../`) |

```csharp
// Sanitize filename
private string SanitizeFileName(string fileName)
{
    var name = Path.GetFileNameWithoutExtension(fileName);
    var ext = Path.GetExtension(fileName);

    // Remove potentially dangerous characters
    name = Regex.Replace(name, @"[^a-zA-Z0-9_\-]", "_");

    return $"{name}{ext}";
}
```

---

## 13. How to Run

```powershell
# Start MinIO
docker run -d --name billing-minio -p 9000:9000 -p 9001:9001 `
  -e MINIO_ROOT_USER=billing_admin -e MINIO_ROOT_PASSWORD=dev_password `
  minio/minio:latest server /data --console-address ":9001"

# Open Console
Start-Process "http://localhost:9001"

# Create buckets via Console or mc CLI
mc alias set billing http://localhost:9000 billing_admin dev_password
mc mb billing/billing-assets billing/billing-invoices billing/billing-imports billing/billing-exports
```

---

## 14. Local Deployment

```yaml
# docker-compose.yml
services:
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
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  minio_data:
```

---

## 15. Cloud Deployment

### S3-Compatible Options

| Provider | Service | Egress Cost | Notes |
|---|---|---|---|
| **AWS** | S3 | $0.09/GB | Most popular |
| **Cloudflare** | R2 | **Free egress** | Best for cost optimization |
| **Azure** | Blob Storage | $0.087/GB | Use S3-compatible gateway |
| **DigitalOcean** | Spaces | $0.01/GB | S3-compatible; 250GB free egress |

### Switch to S3 (Production)

```json
// appsettings.Production.json
{
  "Storage": {
    "ServiceUrl": "https://s3.ap-south-1.amazonaws.com",
    "AccessKey": "<from-secrets>",
    "SecretKey": "<from-secrets>",
    "ForcePathStyle": false,
    "Region": "ap-south-1"
  }
}
```

```csharp
// Program.cs — Production S3 config
var config = new AmazonS3Config
{
    RegionEndpoint = RegionEndpoint.APSouth1  // Mumbai
};

return new AmazonS3Client(accessKey, secretKey, config);
```

---

## 16. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Access Denied** | Wrong credentials or bucket policy | Verify access key/secret; check bucket ACL |
| **Bucket not found** | Bucket not created | Create via mc CLI or MinIO console |
| **Large file timeout** | File too big for single upload | Use multipart upload (AWS SDK handles this) |
| **CORS error** | Browser blocked cross-origin request | Configure CORS on bucket |
| **Connection refused** | MinIO not running | `docker start billing-minio` |

---

## 17. Useful Commands

```powershell
# MinIO Client (mc)
mc alias set billing http://localhost:9000 billing_admin dev_password

mc ls billing/                         # List buckets
mc ls billing/billing-assets/          # List objects
mc cp file.jpg billing/billing-assets/ # Upload file
mc cat billing/billing-assets/file.txt # View file content
mc rm billing/billing-assets/file.jpg  # Delete file
mc du billing/billing-invoices/        # Bucket size
mc mirror ./local billing/bucket/      # Sync directory

# Bucket policies
mc anonymous set download billing/billing-assets   # Public read
mc anonymous set none billing/billing-invoices     # Private
```

---

## 18. References

| Resource | URL |
|---|---|
| **MinIO Docs** | https://min.io/docs |
| **MinIO Docker** | https://hub.docker.com/r/minio/minio |
| **AWS S3 Docs** | https://docs.aws.amazon.com/s3 |
| **AWSSDK.S3 (.NET)** | https://www.nuget.org/packages/AWSSDK.S3 |
| **Cloudflare R2** | https://developers.cloudflare.com/r2 |
