# ⚡ Next.js 15 — Web Frontend

> **Role in Project:** Web application frontend for the billing software platform
> **Version:** 15.x (App Router)
> **Repository:** `billing-web`
> **Related:** [Flutter (Mobile)](./flutter.md) | [.NET Web API (Backend)](./dotnet-web-api.md) | [YARP Gateway](./yarp-api-gateway.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Next.js](#2-why-we-chose-nextjs)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Project Creation](#6-project-creation)
7. [Project Structure](#7-project-structure)
8. [Development Guide](#8-development-guide)
9. [Routing & Navigation](#9-routing--navigation)
10. [Authentication & JWT Handling](#10-authentication--jwt-handling)
11. [API Integration](#11-api-integration)
12. [State Management](#12-state-management)
13. [SOLID Principles in Next.js](#13-solid-principles-in-nextjs)
14. [Do's & Don'ts](#14-dos--donts)
15. [Testing](#15-testing)
16. [Performance Optimization](#16-performance-optimization)
17. [How to Run](#17-how-to-run)
18. [Local Deployment](#18-local-deployment)
19. [Cloud Deployment with Docker](#19-cloud-deployment-with-docker)
20. [Environment Variables](#20-environment-variables)
21. [Troubleshooting](#21-troubleshooting)
22. [Useful Commands](#22-useful-commands)
23. [References](#23-references)

---

## 1. Purpose & Overview

**Next.js** is a React-based framework developed by Vercel that provides:

- **Server-Side Rendering (SSR)** — Pages rendered on the server for faster initial load and SEO
- **Static Site Generation (SSG)** — Pre-build pages at build time for maximum performance
- **App Router** — File-system-based routing with layouts, loading states, and error boundaries
- **API Routes** — Backend-for-frontend (BFF) pattern built into the framework
- **Server Components** — Components that run only on the server, reducing client bundle size
- **Edge Runtime** — Middleware that runs at the edge for fast JWT validation and redirects

### Role in This Project

Next.js serves as the **web frontend** for the billing platform, handling:

- Admin dashboard and management panels
- Invoice creation and billing workflows
- Reports and analytics views
- Product/inventory management UI
- Configuration and settings screens
- SSR for public-facing pages (storefront, support)

### How It Fits in the Architecture

```
Browser → Cloudflare CDN → Next.js App → YARP API Gateway → .NET Services → PostgreSQL
                             │
                             ├── Server Components (SSR)
                             ├── API Routes (JWT proxy)
                             └── Client Components (SPA interactions)
```

---

## 2. Why We Chose Next.js

| Factor | Decision Rationale |
|---|---|
| **Secure JWT Handling** | httpOnly cookies via server-side API routes — tokens never exposed to JavaScript |
| **SEO** | SSR/SSG for storefront, invoices, public pages |
| **Performance** | Server Components reduce JS bundle; streaming SSR for fast TTFB |
| **React Ecosystem** | Massive library ecosystem (UI kits, charts, form libs) |
| **Developer Experience** | File-based routing, hot reload, TypeScript-first |
| **Vercel/Self-hosted** | Can deploy on Vercel, Docker, or any Node.js host |
| **BFF Pattern** | API Routes act as a secure proxy between browser and backend |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Hybrid Rendering** | Mix SSR, SSG, and CSR per page based on requirements |
| 2 | **Server Components** | Reduce client bundle size; fetch data on the server without API calls from browser |
| 3 | **httpOnly Cookie JWT** | Access/refresh tokens stored in server-managed cookies — immune to XSS token theft |
| 4 | **File-based Routing** | No manual route configuration; folder structure = URL structure |
| 5 | **Built-in Optimizations** | Image optimization, font optimization, script loading strategies |
| 6 | **TypeScript-first** | Full TypeScript support out of the box |
| 7 | **Middleware** | Edge-runtime middleware for auth checks, redirects, A/B testing |
| 8 | **Streaming** | React Suspense + streaming SSR for progressive page loads |
| 9 | **Incremental Static Regeneration** | Update static pages without full rebuild |
| 10 | **Large Community** | Extensive docs, tutorials, Stack Overflow support |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Server Required** | Cannot deploy as pure static SPA; need Node.js runtime → use Docker |
| 2 | **Learning Curve** | App Router vs Pages Router confusion → standardize on App Router only |
| 3 | **Build Times** | Large apps have slower builds → use Turbopack, parallel routes |
| 4 | **Vendor Influence** | Vercel controls roadmap → self-host with Docker to stay independent |
| 5 | **Bundle Size** | Client components can bloat → use Server Components by default |
| 6 | **Complexity** | SSR/CSR/SSG choices per page → create team conventions (see Do's/Don'ts) |
| 7 | **Cold Starts** | Serverless deployments have cold starts → use Docker with persistent containers |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | 20.x LTS or 22.x | JavaScript runtime |
| **npm / pnpm** | npm 10+ / pnpm 9+ | Package manager (we use **pnpm**) |
| **VS Code** | Latest | IDE with Next.js/React extensions |
| **Git** | 2.x | Version control |
| **Docker** | 24.x | Containerized development and deployment |

### VS Code Extensions

```
# Recommended extensions
dbaeumer.vscode-eslint           # ESLint integration
esbenp.prettier-vscode           # Code formatter
bradlc.vscode-tailwindcss        # Tailwind CSS IntelliSense
formulahendry.auto-rename-tag    # Auto rename paired HTML tags
ms-vscode.vscode-typescript-next # Latest TypeScript features
```

---

## 5. Installation & Setup

### Install Node.js (Windows)

```powershell
# Option 1: Download from https://nodejs.org (LTS version)

# Option 2: Using winget
winget install OpenJS.NodeJS.LTS

# Option 3: Using nvm-windows (recommended for version management)
winget install CoreyButler.NVMforWindows
nvm install 20
nvm use 20

# Verify
node --version   # v20.x.x
npm --version    # 10.x.x
```

### Install pnpm (Preferred Package Manager)

```powershell
# Enable corepack (ships with Node.js)
corepack enable
corepack prepare pnpm@latest --activate

# Or install directly
npm install -g pnpm

# Verify
pnpm --version   # 9.x.x
```

### Why pnpm Over npm/yarn

| Feature | npm | yarn | pnpm |
|---|---|---|---|
| Disk usage | High (copies) | High | **Low (hard links)** |
| Install speed | Slow | Medium | **Fast** |
| Monorepo support | Workspaces | Workspaces | **Best-in-class** |
| Strictness | Loose | Loose | **Strict (no phantom deps)** |

---

## 6. Project Creation

### Create a New Next.js Project

```powershell
# Create project with App Router (interactive)
pnpm create next-app@latest billing-web

# Selections:
# ✔ Would you like to use TypeScript?          → Yes
# ✔ Would you like to use ESLint?              → Yes
# ✔ Would you like to use Tailwind CSS?        → Yes
# ✔ Would you like to use `src/` directory?    → Yes
# ✔ Would you like to use App Router?          → Yes
# ✔ Would you like to use Turbopack?           → Yes
# ✔ Would you like to customize import alias?  → Yes (@/*)

cd billing-web
```

### Install Core Dependencies

```powershell
# UI & Styling
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add class-variance-authority clsx tailwind-merge
pnpm add lucide-react                    # Icon library

# Forms & Validation
pnpm add react-hook-form @hookform/resolvers zod

# State Management
pnpm add zustand                          # Lightweight state manager

# Data Fetching
pnpm add @tanstack/react-query            # Server state management

# Charts & Reports
pnpm add recharts                         # Charting library

# Tables
pnpm add @tanstack/react-table            # Headless table

# Dev Dependencies
pnpm add -D @types/node @types/react @types/react-dom
pnpm add -D prettier prettier-plugin-tailwindcss
pnpm add -D vitest @testing-library/react @testing-library/jest-dom
pnpm add -D @playwright/test              # E2E testing
```

---

## 7. Project Structure

```
billing-web/
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── locales/                   # i18n translation files
│       ├── en.json
│       └── ta.json
│
├── src/
│   ├── app/                       # App Router (routes)
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Home page (/)
│   │   ├── loading.tsx            # Global loading state
│   │   ├── error.tsx              # Global error boundary
│   │   ├── not-found.tsx          # 404 page
│   │   │
│   │   ├── (auth)/                # Auth route group (no layout nesting)
│   │   │   ├── login/page.tsx
│   │   │   ├── verify-otp/page.tsx
│   │   │   └── layout.tsx         # Auth-specific layout (no sidebar)
│   │   │
│   │   ├── (dashboard)/           # Dashboard route group
│   │   │   ├── layout.tsx         # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # Product list
│   │   │   │   ├── [id]/page.tsx  # Product detail
│   │   │   │   ├── new/page.tsx   # Create product
│   │   │   │   └── loading.tsx    # Product loading skeleton
│   │   │   ├── orders/
│   │   │   ├── invoices/
│   │   │   ├── inventory/
│   │   │   ├── procurement/
│   │   │   ├── accounts/
│   │   │   ├── reports/
│   │   │   ├── customers/
│   │   │   └── settings/
│   │   │
│   │   └── api/                   # API Routes (BFF)
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── refresh/route.ts
│   │       │   └── logout/route.ts
│   │       └── proxy/
│   │           └── [...path]/route.ts  # Catch-all proxy to backend
│   │
│   ├── components/                # Reusable components
│   │   ├── ui/                    # Base UI components (Button, Input, etc.)
│   │   ├── forms/                 # Form components
│   │   ├── tables/                # Table components
│   │   ├── charts/                # Chart components
│   │   └── layout/                # Layout components (Sidebar, Header)
│   │
│   ├── hooks/                     # Custom React hooks
│   │   ├── use-auth.ts
│   │   ├── use-tenant.ts
│   │   ├── use-debounce.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/                       # Utilities & shared logic
│   │   ├── api-client.ts          # Fetch wrapper with auth
│   │   ├── utils.ts               # cn() helper, formatters
│   │   ├── validations.ts         # Zod schemas
│   │   └── constants.ts           # App constants
│   │
│   ├── services/                  # API service layer
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── invoice.service.ts
│   │
│   ├── stores/                    # Zustand stores
│   │   ├── auth-store.ts
│   │   └── ui-store.ts
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── api.types.ts
│   │   ├── product.types.ts
│   │   └── order.types.ts
│   │
│   └── middleware.ts              # Edge middleware (auth, redirects)
│
├── .env.local                     # Local environment variables
├── .env.example                   # Example env file (committed)
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## 8. Development Guide

### 8.1 Server Components vs Client Components

```tsx
// ✅ SERVER COMPONENT (default in App Router) — runs on server only
// src/app/(dashboard)/products/page.tsx
import { ProductTable } from '@/components/tables/product-table';
import { productService } from '@/services/product.service';

export default async function ProductsPage() {
  // This fetch runs on the server — no API call from browser
  const products = await productService.getAll();

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <ProductTable data={products} />
    </div>
  );
}
```

```tsx
// ✅ CLIENT COMPONENT — runs in browser (interactive)
// src/components/tables/product-table.tsx
'use client';

import { useState } from 'react';
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';

interface ProductTableProps {
  data: Product[];
}

export function ProductTable({ data }: ProductTableProps) {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  return (
    <table>
      {/* Interactive table with sorting, filtering, pagination */}
    </table>
  );
}
```

### 8.2 Creating a Form with Validation

```tsx
// src/components/forms/product-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  sku: z.string().min(1, 'SKU is required').regex(/^[A-Z0-9-]+$/, 'Invalid SKU format'),
  price: z.number().positive('Price must be positive'),
  gstRate: z.enum(['0', '5', '12', '18', '28']),
  categoryId: z.string().uuid('Select a valid category'),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Product Name
        </label>
        <input
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium">
          Price (₹)
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          {...register('price', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border px-3 py-2"
        />
        {errors.price && (
          <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="gstRate" className="block text-sm font-medium">
          GST Rate
        </label>
        <select id="gstRate" {...register('gstRate')} className="mt-1 block w-full rounded-md border px-3 py-2">
          <option value="0">0% (Exempt)</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18">18%</option>
          <option value="28">28%</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving...' : 'Save Product'}
      </button>
    </form>
  );
}
```

### 8.3 Layouts and Route Groups

```tsx
// src/app/(dashboard)/layout.tsx — Dashboard layout with sidebar
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');

  if (!accessToken) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
```

### 8.4 Data Fetching Patterns

```tsx
// Pattern 1: Server Component with direct fetch
// src/app/(dashboard)/orders/page.tsx
import { apiClient } from '@/lib/api-client';

export default async function OrdersPage() {
  const orders = await apiClient.get('/commerce/orders', {
    next: { revalidate: 30 }, // Revalidate cache every 30 seconds
  });

  return <OrderList orders={orders} />;
}

// Pattern 2: Client Component with React Query
// src/components/order-search.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/order.service';

export function OrderSearch({ query }: { query: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['orders', 'search', query],
    queryFn: () => orderService.search(query),
    enabled: query.length >= 2,
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <OrderResults data={data} />;
}

// Pattern 3: Server Action (form mutation)
// src/app/(dashboard)/products/new/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { apiClient } from '@/lib/api-client';

export async function createProduct(formData: FormData) {
  const result = await apiClient.post('/catalog/products', {
    name: formData.get('name'),
    sku: formData.get('sku'),
    price: Number(formData.get('price')),
  });

  revalidatePath('/products');
  return result;
}
```

---

## 9. Routing & Navigation

### App Router File Conventions

| File | Purpose |
|---|---|
| `page.tsx` | UI for a route — makes the route publicly accessible |
| `layout.tsx` | Shared UI that wraps child pages — preserves state on navigation |
| `loading.tsx` | Loading UI (Suspense boundary) — shown while page loads |
| `error.tsx` | Error UI (Error boundary) — catch and display errors |
| `not-found.tsx` | 404 UI — shown when route doesn't match |
| `route.ts` | API endpoint (no UI) — server-side only |
| `template.tsx` | Like layout but re-renders on every navigation |

### Route Examples

```
src/app/
├── (auth)/login/page.tsx          → /login
├── (dashboard)/page.tsx           → / (dashboard home)
├── (dashboard)/products/page.tsx  → /products
├── (dashboard)/products/[id]/     → /products/abc123 (dynamic)
├── (dashboard)/orders/[...slug]/  → /orders/2024/march (catch-all)
├── api/auth/login/route.ts        → POST /api/auth/login
└── api/proxy/[...path]/route.ts   → ANY /api/proxy/* (catch-all proxy)
```

### Programmatic Navigation

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function CreateProductButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.push('/products/new')}>
      Create Product
    </button>
  );
}
```

---

## 10. Authentication & JWT Handling

### Secure Cookie-based Flow

```
1. User enters phone/email → POST /api/auth/login (Next.js API route)
2. Next.js API route forwards to YARP → Identity Service
3. Identity Service returns {access_token, refresh_token}
4. Next.js API route sets httpOnly cookies and returns 200
5. All subsequent requests include cookies automatically
6. Middleware validates cookie exists on every request
7. Proxy API route reads cookie and forwards as Bearer token
```

### Middleware (Auth Guard)

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/verify-otp', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Allow API routes (they handle their own auth)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Check for access token cookie
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg).*)'],
};
```

### Login API Route

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Forward login request to backend
  const response = await fetch(`${BACKEND_URL}/identity/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    return NextResponse.json(error, { status: response.status });
  }

  const { access_token, refresh_token, expires_in } = await response.json();

  // Set httpOnly cookies (NEVER accessible via JavaScript)
  const res = NextResponse.json({ success: true, expires_in });

  res.cookies.set('access_token', access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expires_in,
    path: '/',
  });

  res.cookies.set('refresh_token', refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/api/auth',         // Only sent to auth endpoints
  });

  return res;
}
```

### Proxy Route (Secure Backend Call)

```typescript
// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL;

async function proxyRequest(request: NextRequest, params: { path: string[] }) {
  const accessToken = request.cookies.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const targetPath = params.path.join('/');
  const url = new URL(request.url);
  const queryString = url.searchParams.toString();
  const targetUrl = `${BACKEND_URL}/${targetPath}${queryString ? `?${queryString}` : ''}`;

  const headers: HeadersInit = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  };

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
  };

  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    fetchOptions.body = await request.text();
  }

  const response = await fetch(targetUrl, fetchOptions);

  // Handle token expiry — attempt refresh
  if (response.status === 401) {
    // TODO: Implement auto-refresh logic here
    return NextResponse.json({ error: 'Session expired' }, { status: 401 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
```

---

## 11. API Integration

### API Client (Type-safe)

```typescript
// src/lib/api-client.ts

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string>;
      next?: NextFetchRequestConfig;
    }
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      next: options?.next,
    });

    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }

    return response.json();
  }

  get<T>(path: string, options?: { params?: Record<string, string>; next?: NextFetchRequestConfig }) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body: unknown) {
    return this.request<T>('POST', path, { body });
  }

  put<T>(path: string, body: unknown) {
    return this.request<T>('PUT', path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

class ApiError extends Error {
  constructor(public status: number, public body: unknown) {
    super(`API Error: ${status}`);
  }
}

// Server-side client (used in Server Components — calls backend directly)
export const serverApi = new ApiClient(process.env.BACKEND_API_URL!);

// Client-side client (used in Client Components — calls Next.js API routes)
export const clientApi = new ApiClient('/api/proxy');
```

### Service Layer Example

```typescript
// src/services/product.service.ts
import { serverApi, clientApi } from '@/lib/api-client';
import type { Product, CreateProductInput } from '@/types/product.types';

// Server-side service (for Server Components)
export const productServerService = {
  getAll: (params?: { page?: string; search?: string }) =>
    serverApi.get<Product[]>('/catalog/products', { params, next: { revalidate: 60 } }),

  getById: (id: string) =>
    serverApi.get<Product>(`/catalog/products/${id}`, { next: { tags: [`product-${id}`] } }),
};

// Client-side service (for Client Components)
export const productClientService = {
  search: (query: string) =>
    clientApi.get<Product[]>('/catalog/products', { params: { search: query } }),

  create: (data: CreateProductInput) =>
    clientApi.post<Product>('/catalog/products', data),

  update: (id: string, data: Partial<CreateProductInput>) =>
    clientApi.put<Product>(`/catalog/products/${id}`, data),

  delete: (id: string) =>
    clientApi.delete(`/catalog/products/${id}`),
};
```

---

## 12. State Management

### Zustand Store (Lightweight Global State)

```typescript
// src/stores/ui-store.ts
import { create } from 'zustand';

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}));
```

### When to Use What

| Scenario | Tool |
|---|---|
| **Server data (lists, details)** | React Query (`@tanstack/react-query`) |
| **UI state (sidebar, modal, theme)** | Zustand |
| **Form state** | React Hook Form |
| **URL state (filters, pagination)** | URL search params (`useSearchParams`) |
| **Auth state** | Server cookies + Context (read-only on client) |

---

## 13. SOLID Principles in Next.js

### S — Single Responsibility

```
✅ Each component does ONE thing:
  - ProductForm handles form input/validation
  - ProductTable handles data display
  - ProductActions handles CRUD operations
  - productService handles API communication

❌ Avoid: One giant ProductPage component that fetches, validates, displays, and mutates
```

### O — Open/Closed

```tsx
// ✅ Open for extension, closed for modification
// Base table component that accepts any column config
interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  toolbar?: React.ReactNode;
}

export function DataTable<T>({ data, columns, onRowClick, toolbar }: DataTableProps<T>) {
  // Generic table implementation — never needs modification for new entities
}

// Extend by composition, not modification:
<DataTable data={products} columns={productColumns} toolbar={<ProductToolbar />} />
<DataTable data={orders} columns={orderColumns} toolbar={<OrderToolbar />} />
```

### L — Liskov Substitution

```tsx
// ✅ Any component implementing ButtonProps can replace Button
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Both are interchangeable wherever ButtonProps is expected
export function Button(props: ButtonProps) { /* ... */ }
export function IconButton(props: ButtonProps & { icon: React.ReactNode }) { /* ... */ }
```

### I — Interface Segregation

```typescript
// ❌ One fat interface for everything
interface ProductData {
  id: string; name: string; sku: string; price: number;
  description: string; images: string[];
  inventory: number; warehouse: string;
  reviews: Review[]; averageRating: number;
}

// ✅ Segregated interfaces for specific contexts
interface ProductListItem {
  id: string; name: string; sku: string; price: number;
}

interface ProductDetail extends ProductListItem {
  description: string; images: string[];
}

interface ProductInventory {
  id: string; inventory: number; warehouse: string;
}
```

### D — Dependency Inversion

```typescript
// ✅ Components depend on abstractions (service interfaces), not concrete API calls
// src/services/product.service.ts
export interface IProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product>;
  create(data: CreateProductInput): Promise<Product>;
}

// Real implementation calls API
export const productService: IProductService = {
  getAll: () => clientApi.get<Product[]>('/catalog/products').then(r => r.data),
  getById: (id) => clientApi.get<Product>(`/catalog/products/${id}`).then(r => r.data),
  create: (data) => clientApi.post<Product>('/catalog/products', data).then(r => r.data),
};

// Test mock
export const mockProductService: IProductService = {
  getAll: async () => [{ id: '1', name: 'Test Product', sku: 'TST-001', price: 100 }],
  getById: async () => ({ id: '1', name: 'Test Product', sku: 'TST-001', price: 100 }),
  create: async (data) => ({ id: '2', ...data }),
};
```

---

## 14. Do's & Don'ts

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Default to Server Components** | Smaller bundles, direct data access, better performance |
| 2 | **Use `'use client'` only when needed** | Only for interactivity (state, events, browser APIs) |
| 3 | **Store JWT in httpOnly cookies** | XSS-proof; tokens never accessible via JavaScript |
| 4 | **Validate all inputs with Zod** | Runtime type safety; shared schemas between frontend and API |
| 5 | **Use `loading.tsx` for every route** | Better UX with loading skeletons instead of blank screens |
| 6 | **Use `error.tsx` for every route group** | Graceful error handling with retry options |
| 7 | **Co-locate related files** | Keep page, loading, error, actions together in the same folder |
| 8 | **Use TypeScript strict mode** | Catch bugs at compile time |
| 9 | **Use `next/image` for all images** | Automatic optimization, lazy loading, WebP conversion |
| 10 | **Use `next/link` for navigation** | Client-side navigation with prefetching |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't store JWT in localStorage** | Use httpOnly cookies via API routes |
| 2 | **Don't `'use client'` on page.tsx** | Keep pages as Server Components; extract interactive parts to child components |
| 3 | **Don't use `useEffect` for data fetching** | Use Server Components or React Query |
| 4 | **Don't import server code in client components** | Separate server/client code clearly |
| 5 | **Don't skip input validation** | Always validate with Zod — client AND server side |
| 6 | **Don't hardcode API URLs** | Use environment variables (`BACKEND_API_URL`) |
| 7 | **Don't create giant components** | Extract components at ~100 lines |
| 8 | **Don't ignore TypeScript errors** | Fix them; don't use `any` or `@ts-ignore` |
| 9 | **Don't import entire icon libraries** | Use tree-shakeable imports (`import { Search } from 'lucide-react'`) |
| 10 | **Don't use `getServerSideProps`** | That's Pages Router; use App Router's Server Components |

---

## 15. Testing

### Unit Testing (Vitest + React Testing Library)

```typescript
// src/components/forms/__tests__/product-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from '../product-form';
import { describe, it, expect, vi } from 'vitest';

describe('ProductForm', () => {
  it('shows validation errors for empty required fields', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText('Product name is required')).toBeInTheDocument();
      expect(screen.getByText('SKU is required')).toBeInTheDocument();
    });

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/product name/i), {
      target: { value: 'Test Product' },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: '299.99' },
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Test Product', price: 299.99 })
      );
    });
  });
});
```

### E2E Testing (Playwright)

```typescript
// e2e/products.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name=phone]', '9876543210');
    await page.click('text=Send OTP');
    await page.fill('[name=otp]', '123456');
    await page.click('text=Verify');
    await expect(page).toHaveURL('/');
  });

  test('creates a new product', async ({ page }) => {
    await page.goto('/products/new');

    await page.fill('[name=name]', 'Test Product');
    await page.fill('[name=sku]', 'TST-001');
    await page.fill('[name=price]', '299.99');
    await page.selectOption('[name=gstRate]', '18');

    await page.click('text=Save Product');

    await expect(page).toHaveURL('/products');
    await expect(page.locator('text=Test Product')).toBeVisible();
  });
});
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    css: false,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

---

## 16. Performance Optimization

| Technique | Implementation |
|---|---|
| **Server Components** | Default to Server Components; use `'use client'` only for interactivity |
| **Dynamic Imports** | `const Chart = dynamic(() => import('@/components/chart'), { ssr: false })` |
| **Image Optimization** | Always use `next/image` with `width`, `height`, and `priority` for above-the-fold |
| **Font Optimization** | Use `next/font/google` to self-host fonts |
| **Route Prefetching** | `<Link prefetch>` preloads linked routes in background |
| **Parallel Data Fetching** | Use `Promise.all()` in Server Components for concurrent fetches |
| **Caching** | Use `next: { revalidate: N }` for ISR; `unstable_cache` for function-level caching |
| **Bundle Analysis** | Run `pnpm build && ANALYZE=true pnpm build` with `@next/bundle-analyzer` |
| **Streaming** | Use `<Suspense>` boundaries for streaming SSR |

---

## 17. How to Run

### Development Mode

```powershell
cd billing-web

# Install dependencies
pnpm install

# Run in development mode (with Turbopack)
pnpm dev

# App available at http://localhost:3000
```

### Run with Backend (Docker Compose)

```powershell
# From billing-web root
docker compose up

# Starts:
# - Next.js dev server on :3000
# - Backend API on :5000 (if configured)
# - PostgreSQL on :5432
```

---

## 18. Local Deployment

### Build for Production

```powershell
# Build
pnpm build

# Outputs to .next/ directory
# Shows page sizes and first load JS

# Start production server
pnpm start

# App available at http://localhost:3000
```

### Preview with Production Config

```powershell
# Set production env vars
$env:NODE_ENV = "production"
$env:BACKEND_API_URL = "http://localhost:5000/api/v1"

pnpm build
pnpm start
```

---

## 19. Cloud Deployment with Docker

### Dockerfile (Multi-stage)

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment
ARG BACKEND_API_URL
ENV BACKEND_API_URL=${BACKEND_API_URL}

RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
RUN corepack enable
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### next.config.ts (Standalone Output)

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker — bundles node_modules
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.billing.app' },
    ],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Docker Compose (Production)

```yaml
# docker-compose.prod.yml
services:
  billing-web:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        BACKEND_API_URL: http://api-gateway:5000/api/v1
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - BACKEND_API_URL=http://api-gateway:5000/api/v1
    depends_on:
      - api-gateway
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Build and Push to Registry

```powershell
# Build Docker image
docker build -t billing-web:latest .

# Tag for registry
docker tag billing-web:latest ghcr.io/your-org/billing-web:latest

# Push
docker push ghcr.io/your-org/billing-web:latest
```

---

## 20. Environment Variables

| Variable | Description | Default (Dev) | Production |
|---|---|---|---|
| `BACKEND_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` | `http://api-gateway:5000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Public URL of this app | `http://localhost:3000` | `https://app.billing.app` |
| `NODE_ENV` | Environment | `development` | `production` |
| `NEXT_PUBLIC_CDN_URL` | CDN base URL for assets | — | `https://cdn.billing.app` |

> **Note:** `NEXT_PUBLIC_*` variables are embedded at build time and exposed to the browser. Never put secrets in `NEXT_PUBLIC_*` variables.

---

## 21. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Module not found** | Missing dependency or wrong import path | Check `@/` alias in `tsconfig.json`; run `pnpm install` |
| **Hydration mismatch** | Server and client render different content | Ensure no browser-only APIs in Server Components; use `'use client'` |
| **Cookies not set** | `sameSite` / `secure` mismatch | Use `secure: true` only in production; `sameSite: 'lax'` |
| **API proxy 404** | Wrong proxy route path | Check `[...path]` catch-all matches; verify `BACKEND_API_URL` |
| **Build OOM** | Large project / not enough memory | Set `NODE_OPTIONS=--max-old-space-size=4096` |
| **Hot reload not working** | File watcher issue on Windows | Rename `.next` folder or set `WATCHPACK_POLLING=true` |
| **TypeScript errors on build** | Strict mode violations | Fix types; avoid `any`; check `tsconfig.json` strict settings |

---

## 22. Useful Commands

```powershell
# Development
pnpm dev                         # Start dev server (Turbopack)
pnpm build                       # Production build
pnpm start                       # Start production server
pnpm lint                        # Run ESLint
pnpm format                      # Run Prettier

# Testing
pnpm test                        # Run unit tests (Vitest)
pnpm test:watch                  # Run tests in watch mode
pnpm test:coverage               # Generate coverage report
pnpm test:e2e                    # Run E2E tests (Playwright)

# Analysis
pnpm build:analyze               # Bundle analyzer

# Docker
docker build -t billing-web .    # Build Docker image
docker run -p 3000:3000 billing-web  # Run container

# Misc
pnpm add <package>               # Add dependency
pnpm add -D <package>            # Add dev dependency
pnpm dlx create-next-app@latest  # Create new Next.js app
```

---

## 23. References

| Resource | URL |
|---|---|
| **Official Docs** | https://nextjs.org/docs |
| **App Router Guide** | https://nextjs.org/docs/app |
| **Learn Next.js** | https://nextjs.org/learn |
| **GitHub Repo** | https://github.com/vercel/next.js |
| **Tailwind CSS** | https://tailwindcss.com/docs |
| **React Hook Form** | https://react-hook-form.com |
| **Zod** | https://zod.dev |
| **Zustand** | https://zustand-demo.pmnd.rs |
| **TanStack Query** | https://tanstack.com/query |
| **TanStack Table** | https://tanstack.com/table |
| **Playwright** | https://playwright.dev |
| **Vitest** | https://vitest.dev |
