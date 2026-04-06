# 🤖 OpenAI + LangChain — AI & Intelligence Suite

> **Role in Project:** OCR, smart predictions, NLP chatbot, product search, and AI-powered analytics
> **Versions:** OpenAI GPT-4o / Azure OpenAI + Semantic Kernel / LangChain
> **Related:** [.NET Web API](./dotnet-web-api.md) | [PostgreSQL](./postgresql.md) (pgvector)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose This Stack](#2-why-we-chose-this-stack)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Core Concepts](#6-core-concepts)
7. [OCR — Invoice & Receipt Scanning](#7-ocr--invoice--receipt-scanning)
8. [Smart Predictions](#8-smart-predictions)
9. [RAG — Product Search with pgvector](#9-rag--product-search-with-pgvector)
10. [NLP Chatbot — Natural Language Queries](#10-nlp-chatbot--natural-language-queries)
11. [AI-Powered Analytics](#11-ai-powered-analytics)
12. [Semantic Kernel (.NET)](#12-semantic-kernel-net)
13. [Rate Limiting & Cost Control](#13-rate-limiting--cost-control)
14. [Best Practices (Do's & Don'ts)](#14-best-practices-dos--donts)
15. [How to Run](#15-how-to-run)
16. [Local Deployment](#16-local-deployment)
17. [Cloud Deployment](#17-cloud-deployment)
18. [Troubleshooting](#18-troubleshooting)
19. [References](#19-references)

---

## 1. Purpose & Overview

The **AI & Intelligence Suite** (FR-037) enhances the billing software with intelligent features powered by LLMs and embeddings.

### AI Features in This Project

| Feature | AI Model | Purpose |
|---|---|---|
| **OCR Scanning** | GPT-4o Vision | Extract product data from invoices/receipts |
| **Smart Predictions** | GPT-4o + historical data | Predict reorder quantities, pricing suggestions |
| **Product Search** | pgvector embeddings | Semantic search ("find milk products") |
| **NLP Chatbot** | GPT-4o + RAG | Natural language queries ("show today's sales") |
| **Analytics Insights** | GPT-4o | Summarize trends, anomaly detection |

### Architecture

```
┌───────────────┐     ┌──────────────────────┐     ┌───────────────┐
│  Next.js /    │     │   Engagement Service  │     │   OpenAI /    │
│  Flutter      │────►│   (AI endpoints)      │────►│   Azure       │
│  Clients      │     │                       │     │   OpenAI      │
└───────────────┘     │  ┌─────────────────┐  │     └───────────────┘
                      │  │ Semantic Kernel  │  │
                      │  │ (orchestration)  │  │
                      │  └────────┬────────┘  │
                      │           │           │
                      │  ┌────────▼────────┐  │
                      │  │   pgvector      │  │
                      │  │   (embeddings)  │  │
                      │  └─────────────────┘  │
                      └──────────────────────┘
```

---

## 2. Why We Chose This Stack

| Component | Reason |
|---|---|
| **OpenAI GPT-4o** | Best multimodal model — text + vision (for OCR) |
| **Azure OpenAI** | Enterprise option — same models, Azure compliance |
| **Semantic Kernel** | .NET-native AI orchestration by Microsoft |
| **pgvector** | Vector search in PostgreSQL — no separate vector DB |
| **text-embedding-3-small** | Fast, cheap embeddings for product search |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **OCR without templates** | GPT-4o Vision reads any invoice format |
| 2 | **No training needed** | Pre-trained models work out of the box |
| 3 | **pgvector in PostgreSQL** | No separate vector DB to manage |
| 4 | **Semantic Kernel** | Native .NET; structured outputs; plugin architecture |
| 5 | **Natural language** | Users query data without knowing SQL |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **API Cost** | GPT-4o is expensive per token → cache responses; use smaller models where possible |
| 2 | **Latency** | API calls 1-5 seconds → show loading state; async processing |
| 3 | **Accuracy** | LLMs can hallucinate → validate outputs; human review for critical operations |
| 4 | **Data Privacy** | Data sent to OpenAI → use Azure OpenAI (data stays in your region) |
| 5 | **Rate Limits** | OpenAI rate limits per minute → implement queuing |

---

## 4. Prerequisites

| Tool | Purpose |
|---|---|
| **OpenAI API Key** | Access to GPT-4o and embeddings |
| **OR Azure OpenAI** | Enterprise deployment |
| **PostgreSQL 16 + pgvector** | Vector storage and similarity search |

---

## 5. Installation & Setup

### NuGet Packages

```powershell
# Semantic Kernel (Microsoft's AI orchestration for .NET)
dotnet add package Microsoft.SemanticKernel
dotnet add package Microsoft.SemanticKernel.Connectors.OpenAI

# For pgvector
dotnet add package Pgvector
dotnet add package Pgvector.EntityFrameworkCore
```

### Configuration

```json
// appsettings.json
{
  "AI": {
    "Provider": "OpenAI",
    "OpenAI": {
      "ApiKey": "<from-secrets>",
      "ChatModel": "gpt-4o",
      "EmbeddingModel": "text-embedding-3-small"
    },
    "AzureOpenAI": {
      "Endpoint": "https://your-instance.openai.azure.com/",
      "ApiKey": "<from-secrets>",
      "ChatDeployment": "gpt-4o",
      "EmbeddingDeployment": "text-embedding-3-small"
    }
  }
}
```

### Register Services

```csharp
// Program.cs
var aiConfig = builder.Configuration.GetSection("AI");

if (aiConfig["Provider"] == "AzureOpenAI")
{
    builder.Services.AddAzureOpenAIChatCompletion(
        aiConfig["AzureOpenAI:ChatDeployment"]!,
        aiConfig["AzureOpenAI:Endpoint"]!,
        aiConfig["AzureOpenAI:ApiKey"]!);
}
else
{
    builder.Services.AddOpenAIChatCompletion(
        aiConfig["OpenAI:ChatModel"]!,
        aiConfig["OpenAI:ApiKey"]!);
}
```

---

## 6. Core Concepts

| Concept | Description |
|---|---|
| **LLM** | Large Language Model — generates text from prompts |
| **Embedding** | Vector representation of text (1536 dimensions) |
| **RAG** | Retrieval-Augmented Generation — inject context before asking LLM |
| **Semantic Kernel** | .NET SDK for AI orchestration (plugins, planners, memory) |
| **pgvector** | PostgreSQL extension for vector similarity search |
| **Token** | Unit of text processing (~4 chars = 1 token) |
| **System Prompt** | Instructions that define the AI's behavior |

---

## 7. OCR — Invoice & Receipt Scanning

### 7.1 GPT-4o Vision for OCR

```csharp
// Services/OcrService.cs
public class OcrService : IOcrService
{
    private readonly IChatCompletionService _chat;

    public OcrService(IChatCompletionService chat)
    {
        _chat = chat;
    }

    public async Task<InvoiceData> ExtractInvoiceDataAsync(byte[] imageBytes, CancellationToken ct)
    {
        var base64Image = Convert.ToBase64String(imageBytes);

        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage("""
            You are an invoice data extraction assistant for an Indian billing software.
            Extract the following fields from the invoice image.
            Return ONLY valid JSON. Do not include explanations.
            """);

        chatHistory.AddUserMessage(new ChatMessageContentItemCollection
        {
            new TextContent("Extract all product items from this invoice:"),
            new ImageContent(new Uri($"data:image/jpeg;base64,{base64Image}"))
        });

        var response = await _chat.GetChatMessageContentAsync(
            chatHistory,
            new OpenAIPromptExecutionSettings
            {
                ResponseFormat = typeof(InvoiceData),
                MaxTokens = 2000,
                Temperature = 0.1
            },
            cancellationToken: ct);

        return JsonSerializer.Deserialize<InvoiceData>(response.Content!)!;
    }
}

// DTOs
public record InvoiceData
{
    public string? InvoiceNumber { get; init; }
    public string? SupplierName { get; init; }
    public DateOnly? InvoiceDate { get; init; }
    public List<InvoiceLineItem> Items { get; init; } = [];
    public decimal? TotalAmount { get; init; }
    public decimal? GstAmount { get; init; }
}

public record InvoiceLineItem
{
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public string? Unit { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal? GstPercent { get; init; }
    public decimal TotalPrice { get; init; }
}
```

### 7.2 API Endpoint

```csharp
[HttpPost("ocr/invoice")]
[Authorize]
[RequestSizeLimit(10_000_000)] // 10MB
public async Task<ActionResult<InvoiceData>> ExtractInvoice(IFormFile file, CancellationToken ct)
{
    if (file.Length == 0 || file.Length > 10_000_000)
        return BadRequest("File must be between 1 byte and 10MB");

    var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
    if (!allowedTypes.Contains(file.ContentType))
        return BadRequest("Only JPEG, PNG, and WebP images are supported");

    using var ms = new MemoryStream();
    await file.CopyToAsync(ms, ct);

    var result = await _ocrService.ExtractInvoiceDataAsync(ms.ToArray(), ct);
    return Ok(result);
}
```

---

## 8. Smart Predictions

### Reorder Prediction

```csharp
public class PredictionService : IPredictionService
{
    private readonly IChatCompletionService _chat;
    private readonly CatalogDbContext _db;

    public async Task<ReorderSuggestion> PredictReorderAsync(Guid productId, CancellationToken ct)
    {
        // Gather historical data
        var product = await _db.Products.FindAsync(productId);
        var salesHistory = await _db.OrderItems
            .Where(oi => oi.ProductId == productId)
            .GroupBy(oi => oi.Order.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Quantity = g.Sum(x => x.Quantity) })
            .OrderByDescending(x => x.Date)
            .Take(90)
            .ToListAsync(ct);

        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage("""
            You are an inventory analyst for an Indian retail business.
            Based on the sales history, predict the reorder quantity and timing.
            Return JSON with: suggestedQuantity, reorderDate, confidence (low/medium/high), reasoning.
            """);

        chatHistory.AddUserMessage($"""
            Product: {product!.Name}
            Current Stock: {product.StockQuantity} {product.Unit}
            Reorder Level: {product.ReorderLevel}
            Cost Price: ₹{product.CostPrice}

            Last 90 days sales:
            {string.Join("\n", salesHistory.Select(s => $"  {s.Date:yyyy-MM-dd}: {s.Quantity}"))}
            """);

        var response = await _chat.GetChatMessageContentAsync(chatHistory, cancellationToken: ct);
        return JsonSerializer.Deserialize<ReorderSuggestion>(response.Content!)!;
    }
}
```

---

## 9. RAG — Product Search with pgvector

### 9.1 Generate Embeddings

```csharp
public class EmbeddingService : IEmbeddingService
{
    private readonly ITextEmbeddingGenerationService _embedding;

    public async Task<float[]> GenerateEmbeddingAsync(string text, CancellationToken ct)
    {
        var result = await _embedding.GenerateEmbeddingAsync(text, cancellationToken: ct);
        return result.ToArray();
    }

    // Generate and store embedding when a product is created/updated
    public async Task UpdateProductEmbeddingAsync(Product product, CancellationToken ct)
    {
        var textForEmbedding = $"{product.Name} {product.Category?.Name} {product.Description}";
        var embedding = await GenerateEmbeddingAsync(textForEmbedding, ct);

        product.Embedding = new Pgvector.Vector(embedding);
        await _db.SaveChangesAsync(ct);
    }
}
```

### 9.2 Entity with Vector Column

```csharp
// Product entity
public class Product : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    // ... other fields

    [Column(TypeName = "vector(1536)")]
    public Pgvector.Vector? Embedding { get; set; }
}
```

### 9.3 Semantic Search

```csharp
public async Task<List<ProductDto>> SemanticSearchAsync(string query, int limit = 10, CancellationToken ct = default)
{
    var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(query, ct);
    var vector = new Pgvector.Vector(queryEmbedding);

    // Use pgvector cosine distance operator
    var products = await _db.Products
        .OrderBy(p => p.Embedding!.CosineDistance(vector))
        .Take(limit)
        .Select(p => p.ToDto())
        .ToListAsync(ct);

    return products;
}
```

### API Endpoint

```csharp
// GET /api/catalog/products/search?q=cold drinks and snacks
[HttpGet("search")]
public async Task<ActionResult<List<ProductDto>>> SemanticSearch(
    [FromQuery] string q,
    [FromQuery] int limit = 10,
    CancellationToken ct = default)
{
    var results = await _productService.SemanticSearchAsync(q, limit, ct);
    return Ok(results);
}
```

---

## 10. NLP Chatbot — Natural Language Queries

### Chat with Business Data

```csharp
public class BusinessChatService : IBusinessChatService
{
    private readonly IChatCompletionService _chat;
    private readonly CommerceDbContext _db;

    public async Task<string> AskAsync(string userQuestion, Guid tenantId, CancellationToken ct)
    {
        // Gather context for the question
        var context = await GatherBusinessContextAsync(tenantId, ct);

        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage($"""
            You are a helpful business assistant for a billing/POS software.
            Answer questions about business data using the context provided.
            Always respond in a clear, concise manner.
            Format currency as ₹ (Indian Rupees).
            If you don't have enough data, say so. Never make up numbers.

            Current Business Context:
            {context}
            """);

        chatHistory.AddUserMessage(userQuestion);

        var response = await _chat.GetChatMessageContentAsync(chatHistory, cancellationToken: ct);
        return response.Content!;
    }

    private async Task<string> GatherBusinessContextAsync(Guid tenantId, CancellationToken ct)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);

        var todaySales = await _db.Orders
            .Where(o => DateOnly.FromDateTime(o.CreatedAt.DateTime) == today)
            .SumAsync(o => o.TotalAmount, ct);

        var todayOrderCount = await _db.Orders
            .CountAsync(o => DateOnly.FromDateTime(o.CreatedAt.DateTime) == today, ct);

        var lowStockCount = await _db.Database
            .SqlQuery<int>($"""
                SELECT COUNT(*)::int FROM catalog.products
                WHERE tenant_id = {tenantId}
                AND stock_quantity <= reorder_level AND NOT is_deleted
                """)
            .FirstOrDefaultAsync(ct);

        return $"""
            Today's date: {today}
            Today's sales: ₹{todaySales:N2}
            Today's order count: {todayOrderCount}
            Low stock items: {lowStockCount}
            """;
    }
}
```

---

## 11. AI-Powered Analytics

```csharp
// Weekly business summary
public async Task<string> GenerateWeeklySummaryAsync(Guid tenantId, CancellationToken ct)
{
    var endDate = DateOnly.FromDateTime(DateTime.Today);
    var startDate = endDate.AddDays(-7);

    // Gather weekly data
    var weeklySales = await _db.Orders
        .Where(o => DateOnly.FromDateTime(o.CreatedAt.DateTime) >= startDate)
        .GroupBy(o => DateOnly.FromDateTime(o.CreatedAt.DateTime))
        .Select(g => new { Date = g.Key, Total = g.Sum(o => o.TotalAmount), Count = g.Count() })
        .ToListAsync(ct);

    var topProducts = await _db.OrderItems
        .Where(oi => DateOnly.FromDateTime(oi.Order.CreatedAt.DateTime) >= startDate)
        .GroupBy(oi => oi.Product.Name)
        .Select(g => new { Product = g.Key, Revenue = g.Sum(x => x.Quantity * x.UnitPrice) })
        .OrderByDescending(x => x.Revenue)
        .Take(5)
        .ToListAsync(ct);

    var chatHistory = new ChatHistory();
    chatHistory.AddSystemMessage("""
        You are a business analyst. Provide a brief weekly summary with:
        1. Sales trend (up/down/flat compared to daily average)
        2. Top performing products
        3. Any notable patterns
        4. One actionable recommendation
        Keep it under 200 words. Use ₹ for currency.
        """);

    chatHistory.AddUserMessage($"""
        Weekly Sales Data ({startDate} to {endDate}):
        {string.Join("\n", weeklySales.Select(s => $"  {s.Date}: ₹{s.Total:N0} ({s.Count} orders)"))}

        Top Products by Revenue:
        {string.Join("\n", topProducts.Select(p => $"  {p.Product}: ₹{p.Revenue:N0}"))}
        """);

    var response = await _chat.GetChatMessageContentAsync(chatHistory, cancellationToken: ct);
    return response.Content!;
}
```

---

## 12. Semantic Kernel (.NET)

### Kernel Setup

```csharp
// Program.cs — Full Semantic Kernel setup
var kernelBuilder = Kernel.CreateBuilder();

kernelBuilder.AddOpenAIChatCompletion("gpt-4o", apiKey);
kernelBuilder.AddOpenAITextEmbeddingGeneration("text-embedding-3-small", apiKey);

// Add custom plugins
kernelBuilder.Plugins.AddFromType<InventoryPlugin>();
kernelBuilder.Plugins.AddFromType<SalesPlugin>();

var kernel = kernelBuilder.Build();
builder.Services.AddSingleton(kernel);
```

### Custom Plugin

```csharp
public class InventoryPlugin
{
    private readonly CatalogDbContext _db;

    public InventoryPlugin(CatalogDbContext db) => _db = db;

    [KernelFunction("get_low_stock_products")]
    [Description("Gets products that are below their reorder level")]
    public async Task<string> GetLowStockProducts(
        [Description("Maximum number of products to return")] int limit = 10)
    {
        var products = await _db.Products
            .Where(p => p.StockQuantity <= p.ReorderLevel && !p.IsDeleted)
            .OrderBy(p => p.StockQuantity)
            .Take(limit)
            .Select(p => new { p.Name, p.StockQuantity, p.ReorderLevel })
            .ToListAsync();

        return JsonSerializer.Serialize(products);
    }
}
```

---

## 13. Rate Limiting & Cost Control

### Token Budget per Tenant

```csharp
public class AiRateLimitService
{
    private readonly IDistributedCache _cache;

    // Monthly token budget per tenant (configurable)
    private const int MonthlyTokenBudget = 100_000;

    public async Task<bool> CanUseAiAsync(Guid tenantId, int estimatedTokens)
    {
        var key = $"ai:tokens:{tenantId}:{DateTime.UtcNow:yyyy-MM}";
        var used = await _cache.GetAsync<int>(key);

        return (used + estimatedTokens) <= MonthlyTokenBudget;
    }

    public async Task TrackUsageAsync(Guid tenantId, int tokensUsed)
    {
        var key = $"ai:tokens:{tenantId}:{DateTime.UtcNow:yyyy-MM}";
        var current = await _cache.GetAsync<int>(key) ?? 0;
        await _cache.SetAsync(key, current + tokensUsed, TimeSpan.FromDays(35));
    }
}
```

### Cost Estimation

| Model | Input | Output | Typical Call Cost |
|---|---|---|---|
| GPT-4o | $2.50/1M tokens | $10.00/1M tokens | ~$0.01-0.05 |
| GPT-4o-mini | $0.15/1M tokens | $0.60/1M tokens | ~$0.001-0.005 |
| text-embedding-3-small | $0.02/1M tokens | — | ~$0.0001 |

> **Recommendation:** Use GPT-4o-mini for chat/predictions; GPT-4o only for OCR (vision).

---

## 14. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Validate AI outputs** | LLMs can hallucinate; never trust blindly |
| 2 | **Use structured outputs** | `ResponseFormat = typeof(T)` for predictable JSON |
| 3 | **Set low temperature** | 0.0-0.3 for data extraction; higher for creative tasks |
| 4 | **Cache embeddings** | Generate once, store in pgvector, reuse |
| 5 | **Use GPT-4o-mini where possible** | 20x cheaper than GPT-4o; sufficient for most tasks |
| 6 | **Implement rate limits** | Per-tenant token budgets |
| 7 | **Show loading states** | AI calls take 1-5 seconds |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't send raw SQL to LLM** | Provide pre-aggregated data as context |
| 2 | **Don't let AI modify data directly** | AI suggests → human confirms → system updates |
| 3 | **Don't send sensitive data unnecessarily** | Minimize PII in prompts |
| 4 | **Don't skip error handling** | API calls can fail; always have fallback |
| 5 | **Don't use GPT-4o for simple tasks** | Use GPT-4o-mini or rule-based logic instead |

---

## 15. How to Run

```powershell
# Set API key (local development)
$env:AI__OpenAI__ApiKey = "sk-your-key-here"

# Run the service
dotnet run --project src/Services/Engagement.Api

# Test OCR
curl -X POST "http://localhost:5004/api/ai/ocr/invoice" `
  -H "Authorization: Bearer <token>" `
  -F "file=@invoice.jpg"

# Test chat
curl -X POST "http://localhost:5004/api/ai/chat" `
  -H "Authorization: Bearer <token>" `
  -H "Content-Type: application/json" `
  -d '{"message": "What were my top selling products this week?"}'
```

---

## 16. Local Deployment

```yaml
# docker-compose.dev.yml (add to existing)
services:
  engagement-api:
    environment:
      - AI__Provider=OpenAI
      - AI__OpenAI__ApiKey=${OPENAI_API_KEY}
      - AI__OpenAI__ChatModel=gpt-4o-mini  # Use cheaper model for dev
```

---

## 17. Cloud Deployment

### Azure OpenAI (Recommended for Production)

| Benefit | Detail |
|---|---|
| **Data Privacy** | Data stays in your Azure region |
| **SLA** | 99.9% uptime guarantee |
| **Content Filtering** | Built-in content safety |
| **Rate Limits** | Higher limits with reserved capacity |

```json
{
  "AI": {
    "Provider": "AzureOpenAI",
    "AzureOpenAI": {
      "Endpoint": "https://billing-ai.openai.azure.com/",
      "ApiKey": "<from-key-vault>",
      "ChatDeployment": "gpt-4o",
      "EmbeddingDeployment": "text-embedding-3-small"
    }
  }
}
```

---

## 18. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **429 Too Many Requests** | Rate limit exceeded | Implement retry with backoff; reduce request frequency |
| **Hallucinated data** | LLM making up numbers | Validate against DB; use low temperature |
| **Slow responses** | Large context / complex prompt | Reduce context size; use GPT-4o-mini |
| **High cost** | Too many GPT-4o calls | Switch to GPT-4o-mini; cache responses |
| **Embedding mismatch** | Different model versions | Always use same embedding model for store and query |

---

## 19. References

| Resource | URL |
|---|---|
| **OpenAI API Docs** | https://platform.openai.com/docs |
| **Azure OpenAI** | https://learn.microsoft.com/azure/ai-services/openai |
| **Semantic Kernel** | https://learn.microsoft.com/semantic-kernel |
| **pgvector** | https://github.com/pgvector/pgvector |
| **pgvector EF Core** | https://github.com/pgvector/pgvector-dotnet |
| **OpenAI Pricing** | https://openai.com/pricing |
