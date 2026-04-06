# 🐰 RabbitMQ + MassTransit — Message Bus

> **Role in Project:** Asynchronous event-driven communication between microservices
> **Versions:** RabbitMQ 3.13 + MassTransit 8.x
> **Related:** [.NET Web API](./dotnet-web-api.md) | [Docker](./docker.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose RabbitMQ + MassTransit](#2-why-we-chose-rabbitmq--masstransit)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Core Concepts](#6-core-concepts)
7. [Development Guide — MassTransit in .NET](#7-development-guide--masstransit-in-net)
8. [Event-Driven Patterns](#8-event-driven-patterns)
9. [Saga / State Machine](#9-saga--state-machine)
10. [Error Handling & Retry](#10-error-handling--retry)
11. [SOLID Principles](#11-solid-principles)
12. [Best Practices (Do's & Don'ts)](#12-best-practices-dos--donts)
13. [Monitoring](#13-monitoring)
14. [How to Run](#14-how-to-run)
15. [Local Deployment](#15-local-deployment)
16. [Cloud Deployment with Docker](#16-cloud-deployment-with-docker)
17. [Troubleshooting](#17-troubleshooting)
18. [Useful Commands](#18-useful-commands)
19. [References](#19-references)

---

## 1. Purpose & Overview

**RabbitMQ** is a message broker that enables asynchronous communication between services. **MassTransit** is a .NET abstraction layer over RabbitMQ (and other transports) providing publish/subscribe, request/response, sagas, and fault handling.

### Events in This Project

| Event | Producer | Consumer(s) | Purpose |
|---|---|---|---|
| `OrderPlacedEvent` | Commerce Service | Catalog (decrement stock), Engagement (notification) |
| `PaymentCompletedEvent` | Commerce Service | Commerce (update order status) |
| `StockLowEvent` | Catalog Service | Engagement (alert owner) |
| `InvoiceGeneratedEvent` | Commerce Service | Engagement (email/WhatsApp invoice) |
| `TenantCreatedEvent` | Identity Service | All services (seed config) |
| `UserRegisteredEvent` | Identity Service | Engagement (welcome email) |
| `ConfigChangedEvent` | Identity Service | All (invalidate config cache) |
| `LedgerEntryCreatedEvent` | Commerce Service | Commerce (update running balance) |
| `ImportCompletedEvent` | Catalog Service | Engagement (notify user) |

### Architecture

```
┌───────────────┐     publish     ┌──────────────┐     consume     ┌───────────────┐
│  Commerce     │ ──────────────► │  RabbitMQ    │ ──────────────► │  Catalog      │
│  Service      │  OrderPlaced    │  Exchange    │  (decrement     │  Service      │
│               │                 │  + Queues    │   stock)        │               │
└───────────────┘                 └──────┬───────┘                 └───────────────┘
                                         │
                                         │ consume
                                         ▼
                                  ┌───────────────┐
                                  │  Engagement   │
                                  │  Service      │
                                  │  (send notif) │
                                  └───────────────┘
```

---

## 2. Why We Chose RabbitMQ + MassTransit

| Factor | Decision Rationale |
|---|---|
| **Decoupling** | Services don't call each other directly — loose coupling via events |
| **Resilience** | If Engagement is down, messages queue up and process when it's back |
| **MassTransit** | .NET-native; automatic exchange/queue topology; saga support |
| **Reliability** | RabbitMQ durable queues + publisher confirms = no message loss |
| **Scalability** | Multiple consumers can process messages in parallel |
| **Maturity** | RabbitMQ is battle-tested — used by millions of applications |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Asynchronous** | Producer doesn't wait for consumer — non-blocking |
| 2 | **Decoupled** | Services only know about events, not about each other |
| 3 | **Reliable** | Durable queues + acknowledgments = guaranteed delivery |
| 4 | **Scalable** | Competing consumers — add more instances to scale |
| 5 | **Dead Letter** | Failed messages go to error queue for inspection |
| 6 | **MassTransit Sagas** | Stateful workflows (order processing) without external orchestrator |
| 7 | **Management UI** | RabbitMQ Management Plugin — web dashboard for monitoring |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Complexity** | More moving parts → MassTransit abstracts most of it |
| 2 | **Eventual Consistency** | Data not immediately consistent → acceptable for our use cases |
| 3 | **Message Ordering** | Not guaranteed across consumers → design for idempotency |
| 4 | **Debugging** | Harder to trace async flows → use correlation IDs |
| 5 | **Memory Usage** | Queued messages use RAM → set limits and TTL |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Docker** | 24.x | Run RabbitMQ in container |
| **.NET 9 SDK** | 9.x | Service development |
| **MassTransit** | 8.x | NuGet package |

---

## 5. Installation & Setup

### Docker (RabbitMQ with Management UI)

```powershell
docker run -d `
  --name billing-rabbitmq `
  -p 5672:5672 `
  -p 15672:15672 `
  -e RABBITMQ_DEFAULT_USER=billing `
  -e RABBITMQ_DEFAULT_PASS=dev_password `
  rabbitmq:3.13-management-alpine

# Management UI: http://localhost:15672
# AMQP Port: 5672
```

### NuGet Packages

```powershell
dotnet add package MassTransit
dotnet add package MassTransit.RabbitMQ
```

---

## 6. Core Concepts

### RabbitMQ Concepts

| Concept | Description |
|---|---|
| **Producer** | Publishes messages to an exchange |
| **Exchange** | Routes messages to queues based on routing rules |
| **Queue** | Stores messages until a consumer picks them up |
| **Consumer** | Reads messages from a queue and processes them |
| **Binding** | Links an exchange to a queue with a routing key |
| **Ack** | Consumer confirms message was processed successfully |

### Exchange Types

| Type | Routing | Use Case |
|---|---|---|
| **Fanout** | All bound queues get every message | Broadcast events (MassTransit default for publish) |
| **Direct** | Exact routing key match | Targeted delivery |
| **Topic** | Pattern matching (`order.*`) | Filtered subscriptions |
| **Headers** | Match on message headers | Complex routing rules |

### MassTransit Concepts

| Concept | Description |
|---|---|
| **Message** | A plain C# class/record — the event contract |
| **Consumer** | Processes a specific message type — `IConsumer<T>` |
| **Saga** | Stateful workflow tracking multi-step processes |
| **Publish** | Send to all subscribed consumers (1:N) |
| **Send** | Send to a specific queue (1:1) |
| **Request/Response** | Synchronous-over-async RPC pattern |

---

## 7. Development Guide — MassTransit in .NET

### 7.1 Define Events (Shared Contracts)

```csharp
// Billing.Contracts project (shared NuGet package or shared project)
namespace Billing.Contracts.Events;

// Use records for immutable event contracts
public record OrderPlacedEvent
{
    public Guid OrderId { get; init; }
    public Guid TenantId { get; init; }
    public Guid CustomerId { get; init; }
    public List<OrderItemEvent> Items { get; init; } = [];
    public decimal TotalAmount { get; init; }
    public DateTime PlacedAt { get; init; }
}

public record OrderItemEvent
{
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal Quantity { get; init; }
    public decimal UnitPrice { get; init; }
}

public record StockLowEvent
{
    public Guid TenantId { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public decimal CurrentStock { get; init; }
    public decimal ReorderLevel { get; init; }
}

public record InvoiceGeneratedEvent
{
    public Guid TenantId { get; init; }
    public Guid OrderId { get; init; }
    public string InvoiceNumber { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public string? CustomerPhone { get; init; }
    public string InvoicePdfUrl { get; init; } = string.Empty;
}
```

### 7.2 Publish Events (Producer)

```csharp
// Commerce.Api — OrderService
public class OrderService : IOrderService
{
    private readonly CommerceDbContext _db;
    private readonly IPublishEndpoint _publishEndpoint;

    public OrderService(CommerceDbContext db, IPublishEndpoint publishEndpoint)
    {
        _db = db;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Guid> PlaceOrderAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var order = new Order
        {
            CustomerId = request.CustomerId,
            Items = request.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList(),
            TotalAmount = request.Items.Sum(i => i.Quantity * i.UnitPrice),
            Status = OrderStatus.Placed
        };

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(ct);

        // Publish event — all subscribers will receive it
        await _publishEndpoint.Publish(new OrderPlacedEvent
        {
            OrderId = order.Id,
            TenantId = order.TenantId,
            CustomerId = order.CustomerId,
            Items = order.Items.Select(i => new OrderItemEvent
            {
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList(),
            TotalAmount = order.TotalAmount,
            PlacedAt = DateTime.UtcNow
        }, ct);

        return order.Id;
    }
}
```

### 7.3 Consume Events (Consumer)

```csharp
// Catalog.Api — DecrementStockConsumer
namespace Catalog.Api.Consumers;

public class DecrementStockConsumer : IConsumer<OrderPlacedEvent>
{
    private readonly CatalogDbContext _db;
    private readonly IPublishEndpoint _publish;
    private readonly ILogger<DecrementStockConsumer> _logger;

    public DecrementStockConsumer(
        CatalogDbContext db,
        IPublishEndpoint publish,
        ILogger<DecrementStockConsumer> logger)
    {
        _db = db;
        _publish = publish;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        var msg = context.Message;
        _logger.LogInformation("Processing stock decrement for Order {OrderId}", msg.OrderId);

        foreach (var item in msg.Items)
        {
            var product = await _db.Products.FindAsync(item.ProductId);
            if (product is null) continue;

            product.StockQuantity -= item.Quantity;

            // Check if stock is low
            if (product.StockQuantity <= product.ReorderLevel)
            {
                await _publish.Publish(new StockLowEvent
                {
                    TenantId = msg.TenantId,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    CurrentStock = product.StockQuantity,
                    ReorderLevel = product.ReorderLevel
                });
            }
        }

        await _db.SaveChangesAsync();
    }
}
```

### 7.4 Register MassTransit (Program.cs)

```csharp
// Program.cs — any service
builder.Services.AddMassTransit(x =>
{
    // Auto-discover consumers in this assembly
    x.AddConsumers(typeof(Program).Assembly);

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host(builder.Configuration["RabbitMQ:Host"] ?? "localhost", "/", h =>
        {
            h.Username(builder.Configuration["RabbitMQ:Username"] ?? "billing");
            h.Password(builder.Configuration["RabbitMQ:Password"] ?? "dev_password");
        });

        // Configure endpoints automatically from consumers
        cfg.ConfigureEndpoints(context);
    });
});
```

---

## 8. Event-Driven Patterns

### 8.1 Fan-Out (Publish to Multiple Consumers)

```
OrderPlacedEvent
    ├── DecrementStockConsumer (Catalog)
    ├── NotifyCustomerConsumer (Engagement)
    └── UpdateLedgerConsumer (Commerce)
```

MassTransit creates separate queues for each consumer type automatically.

### 8.2 Request/Response (Synchronous-over-Async)

```csharp
// Check stock availability before placing order
public record CheckStockRequest
{
    public Guid ProductId { get; init; }
    public decimal RequestedQuantity { get; init; }
}

public record CheckStockResponse
{
    public bool IsAvailable { get; init; }
    public decimal CurrentStock { get; init; }
}

// Consumer (Catalog Service)
public class CheckStockConsumer : IConsumer<CheckStockRequest>
{
    public async Task Consume(ConsumeContext<CheckStockRequest> context)
    {
        var product = await _db.Products.FindAsync(context.Message.ProductId);
        await context.RespondAsync(new CheckStockResponse
        {
            IsAvailable = product?.StockQuantity >= context.Message.RequestedQuantity,
            CurrentStock = product?.StockQuantity ?? 0
        });
    }
}

// Requester (Commerce Service)
var client = _requestClient.Create<CheckStockRequest>(new { ProductId = id, RequestedQuantity = qty });
var response = await client.GetResponse<CheckStockResponse>();
if (!response.Message.IsAvailable)
    throw new InsufficientStockException();
```

### 8.3 Scheduled Messages (Delayed Delivery)

```csharp
// Send a reminder 30 minutes after order if payment not received
await context.SchedulePublish(
    DateTime.UtcNow.AddMinutes(30),
    new PaymentReminderEvent { OrderId = orderId }
);
```

---

## 9. Saga / State Machine

### Order Processing Saga

```csharp
// State entity
public class OrderState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; } = string.Empty;
    public Guid OrderId { get; set; }
    public Guid TenantId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime? PlacedAt { get; set; }
    public DateTime? PaidAt { get; set; }
}

// State machine
public class OrderStateMachine : MassTransitStateMachine<OrderState>
{
    public State Placed { get; private set; } = null!;
    public State PaymentPending { get; private set; } = null!;
    public State Completed { get; private set; } = null!;
    public State Cancelled { get; private set; } = null!;

    public Event<OrderPlacedEvent> OrderPlaced { get; private set; } = null!;
    public Event<PaymentCompletedEvent> PaymentCompleted { get; private set; } = null!;
    public Event<OrderCancelledEvent> OrderCancelled { get; private set; } = null!;

    public OrderStateMachine()
    {
        InstanceState(x => x.CurrentState);

        Event(() => OrderPlaced, x => x.CorrelateById(ctx => ctx.Message.OrderId));
        Event(() => PaymentCompleted, x => x.CorrelateById(ctx => ctx.Message.OrderId));
        Event(() => OrderCancelled, x => x.CorrelateById(ctx => ctx.Message.OrderId));

        Initially(
            When(OrderPlaced)
                .Then(ctx =>
                {
                    ctx.Saga.OrderId = ctx.Message.OrderId;
                    ctx.Saga.TenantId = ctx.Message.TenantId;
                    ctx.Saga.TotalAmount = ctx.Message.TotalAmount;
                    ctx.Saga.PlacedAt = ctx.Message.PlacedAt;
                })
                .TransitionTo(PaymentPending)
        );

        During(PaymentPending,
            When(PaymentCompleted)
                .Then(ctx => ctx.Saga.PaidAt = DateTime.UtcNow)
                .Publish(ctx => new InvoiceGeneratedEvent
                {
                    OrderId = ctx.Saga.OrderId,
                    TenantId = ctx.Saga.TenantId
                })
                .TransitionTo(Completed)
                .Finalize(),

            When(OrderCancelled)
                .Publish(ctx => new StockRestoreEvent
                {
                    OrderId = ctx.Saga.OrderId
                })
                .TransitionTo(Cancelled)
                .Finalize()
        );
    }
}
```

### Register Saga

```csharp
builder.Services.AddMassTransit(x =>
{
    x.AddSagaStateMachine<OrderStateMachine, OrderState>()
        .EntityFrameworkRepository(r =>
        {
            r.ConcurrencyMode = ConcurrencyMode.Pessimistic;
            r.ExistingDbContext<CommerceDbContext>();
            r.UsePostgres();
        });

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost");
        cfg.ConfigureEndpoints(context);
    });
});
```

---

## 10. Error Handling & Retry

### Retry Policies

```csharp
cfg.ConfigureEndpoints(context, e =>
{
    // Retry 3 times with exponential backoff
    e.UseMessageRetry(r => r.Exponential(
        retryCount: 3,
        minInterval: TimeSpan.FromSeconds(1),
        maxInterval: TimeSpan.FromSeconds(30),
        intervalDelta: TimeSpan.FromSeconds(5)
    ));
});
```

### Dead Letter Queue

When all retries are exhausted, MassTransit moves the message to an `_error` queue:

```
billing-catalog-decrement-stock → billing-catalog-decrement-stock_error
```

### Idempotent Consumers

```csharp
// Always design consumers to be idempotent
public class DecrementStockConsumer : IConsumer<OrderPlacedEvent>
{
    public async Task Consume(ConsumeContext<OrderPlacedEvent> context)
    {
        // Check if already processed (idempotency)
        var alreadyProcessed = await _db.StockMovements
            .AnyAsync(m => m.OrderId == context.Message.OrderId);

        if (alreadyProcessed)
        {
            _logger.LogWarning("Order {OrderId} already processed — skipping", context.Message.OrderId);
            return;
        }

        // ... process stock decrement
    }
}
```

---

## 11. SOLID Principles

### Single Responsibility

```csharp
// Each consumer handles EXACTLY one job
// ✅ Good — focused consumers
public class DecrementStockConsumer : IConsumer<OrderPlacedEvent> { }
public class NotifyCustomerConsumer : IConsumer<OrderPlacedEvent> { }

// ❌ Bad — one consumer doing everything
public class OrderPlacedMegaConsumer : IConsumer<OrderPlacedEvent>
{
    // Decrements stock AND sends notification AND updates ledger
}
```

### Open/Closed

```csharp
// To add new behavior when an order is placed:
// ✅ Just add a new consumer — no changes to existing code
public class UpdateAnalyticsConsumer : IConsumer<OrderPlacedEvent> { }
```

### Dependency Inversion

```csharp
// Consumers depend on abstractions
public class NotifyCustomerConsumer : IConsumer<InvoiceGeneratedEvent>
{
    private readonly INotificationService _notifications;  // Interface, not concrete

    public NotifyCustomerConsumer(INotificationService notifications)
    {
        _notifications = notifications;
    }

    public async Task Consume(ConsumeContext<InvoiceGeneratedEvent> context)
    {
        await _notifications.SendInvoiceAsync(
            context.Message.CustomerEmail,
            context.Message.InvoicePdfUrl
        );
    }
}
```

---

## 12. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use records for events** | Immutable, clear contracts |
| 2 | **Design idempotent consumers** | Messages can be redelivered |
| 3 | **Include correlation IDs** | Trace async flows across services |
| 4 | **Keep events small** | Only include data needed by consumers |
| 5 | **Version events carefully** | Add fields; never remove — backward compatible |
| 6 | **One consumer per concern** | Single responsibility |
| 7 | **Monitor error queues** | Failed messages need attention |
| 8 | **Use sagas for workflows** | Multi-step processes need state tracking |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't put secrets in events** | Include IDs, not passwords/tokens |
| 2 | **Don't do heavy I/O in consumers** | Offload to background jobs if slow |
| 3 | **Don't ignore error queues** | Set up alerts for `_error` queues |
| 4 | **Don't share DB connections in events** | Each consumer gets its own DbContext |
| 5 | **Don't rely on message ordering** | Design for out-of-order delivery |
| 6 | **Don't publish in a loop** | Batch publish or use `PublishBatch` |

---

## 13. Monitoring

### RabbitMQ Management UI

Access at `http://localhost:15672` (default: `billing`/`dev_password`).

Key metrics:
- **Queue depth** — messages waiting to be consumed
- **Consumer count** — how many consumers are connected
- **Publish rate** — messages/sec being published
- **Ack rate** — messages/sec being acknowledged

### Health Checks

```csharp
// MassTransit adds health checks automatically
builder.Services.AddHealthChecks();

// Check at: /health
```

---

## 14. How to Run

```powershell
# Start RabbitMQ
docker run -d --name billing-rabbitmq -p 5672:5672 -p 15672:15672 `
  -e RABBITMQ_DEFAULT_USER=billing -e RABBITMQ_DEFAULT_PASS=dev_password `
  rabbitmq:3.13-management-alpine

# Open Management UI
Start-Process "http://localhost:15672"

# Run services that publish/consume
dotnet run --project src/Services/Commerce.Api
dotnet run --project src/Services/Catalog.Api
dotnet run --project src/Services/Engagement.Api
```

---

## 15. Local Deployment

```yaml
# docker-compose.yml
services:
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

volumes:
  rabbitmq_data:
```

---

## 16. Cloud Deployment with Docker

### Production Configuration

```ini
# rabbitmq.conf (production)
default_user = billing_prod
default_pass = STRONG_PASSWORD_FROM_SECRETS
disk_free_limit.absolute = 2GB
vm_memory_high_watermark.absolute = 1GB

# Enable plugins
management.tcp.port = 15672
```

### Cloud-Managed Options

| Provider | Service | Notes |
|---|---|---|
| **AWS** | Amazon MQ for RabbitMQ | Managed, multi-AZ |
| **Azure** | Azure Service Bus | Not RabbitMQ, but MassTransit supports it |
| **CloudAMQP** | Managed RabbitMQ | SaaS; free tier available |

### MassTransit Azure Service Bus (Alternative)

```csharp
// Switch transport without changing consumers!
x.UsingAzureServiceBus((context, cfg) =>
{
    cfg.Host(connectionString);
    cfg.ConfigureEndpoints(context);
});
```

---

## 17. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Connection refused** | RabbitMQ not running | `docker start billing-rabbitmq` |
| **Messages not consumed** | Consumer not registered | Check `AddConsumers` in Program.cs |
| **Messages in `_error` queue** | Consumer threw exception | Check logs; fix consumer; replay messages |
| **High memory usage** | Queue backup | Add more consumer instances; check consumer speed |
| **Exchange not found** | Service not started yet | MassTransit creates topology on startup |

---

## 18. Useful Commands

```powershell
# RabbitMQ CLI (inside container)
docker exec -it billing-rabbitmq rabbitmqctl list_queues
docker exec -it billing-rabbitmq rabbitmqctl list_exchanges
docker exec -it billing-rabbitmq rabbitmqctl list_connections
docker exec -it billing-rabbitmq rabbitmqctl list_consumers

# Purge a queue (remove all messages)
docker exec -it billing-rabbitmq rabbitmqctl purge_queue "billing-catalog-decrement-stock"

# Check cluster status
docker exec -it billing-rabbitmq rabbitmqctl cluster_status
```

---

## 19. References

| Resource | URL |
|---|---|
| **RabbitMQ Docs** | https://www.rabbitmq.com/docs |
| **MassTransit Docs** | https://masstransit.io/documentation/concepts |
| **MassTransit RabbitMQ** | https://masstransit.io/documentation/transports/rabbitmq |
| **MassTransit Sagas** | https://masstransit.io/documentation/patterns/saga |
| **Docker Image** | https://hub.docker.com/_/rabbitmq |
