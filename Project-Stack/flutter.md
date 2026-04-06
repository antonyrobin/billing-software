# 📱 Flutter 3 — Mobile & Desktop Frontend

> **Role in Project:** iOS, Android, and Desktop POS application for the billing software platform
> **Version:** 3.x (Dart 3.x)
> **Repository:** `billing-mobile`
> **Related:** [Next.js (Web)](./nextjs.md) | [.NET Web API (Backend)](./dotnet-web-api.md) | [YARP Gateway](./yarp-api-gateway.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Flutter](#2-why-we-chose-flutter)
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
13. [Barcode & QR Code Scanning](#13-barcode--qr-code-scanning)
14. [SOLID Principles in Flutter](#14-solid-principles-in-flutter)
15. [Do's & Don'ts](#15-dos--donts)
16. [Testing](#16-testing)
17. [Platform-Specific Features](#17-platform-specific-features)
18. [How to Run](#18-how-to-run)
19. [Local Deployment](#19-local-deployment)
20. [Cloud Deployment with Docker](#20-cloud-deployment-with-docker)
21. [Troubleshooting](#21-troubleshooting)
22. [Useful Commands](#22-useful-commands)
23. [References](#23-references)

---

## 1. Purpose & Overview

**Flutter** is Google's open-source UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase using the **Dart** programming language.

### What is Flutter?

- **Cross-platform framework** — One codebase produces iOS, Android, Windows, macOS, Linux apps
- **Ahead-of-Time (AOT) compilation** — Dart compiles to native ARM/x64 code for production
- **Hot Reload** — Sub-second UI updates during development
- **Widget-based architecture** — Everything is a widget; compositional UI building
- **Skia/Impeller rendering** — Custom rendering engine; pixel-perfect UI on all platforms

### What is Dart?

- **Object-oriented** language with strong typing and null safety
- **Single codebase** compiles to native code (mobile), JavaScript (web), or x64 (desktop)
- **Asynchronous** by design — `async/await`, `Stream`, `Future` built into the language
- **Sound null safety** — Eliminates null reference errors at compile time

### Role in This Project

Flutter serves as the **mobile and desktop** frontend:

| Platform | Use Case |
|---|---|
| **Android** | Customer-facing + staff mobile app |
| **iOS** | Customer-facing + staff mobile app |
| **Windows Desktop** | POS terminal for in-store billing |
| **macOS Desktop** | POS terminal (if needed) |

### How It Fits in the Architecture

```
Mobile/Desktop App → Cloudflare CDN → YARP API Gateway → .NET Services → PostgreSQL
     │
     ├── Native camera barcode scanning (mobile_scanner)
     ├── Secure token storage (flutter_secure_storage)
     ├── Local database (sqflite for offline)
     └── Push notifications (Firebase Cloud Messaging)
```

---

## 2. Why We Chose Flutter

| Factor | Decision Rationale |
|---|---|
| **Single Codebase** | One Dart codebase for iOS + Android + POS Desktop = 3 apps from 1 team |
| **Native Performance** | AOT compilation to ARM/x64 — smooth 60fps animations |
| **POS Desktop** | Flutter Desktop (Windows) perfect for POS terminal app |
| **Camera Barcode Scanning** | Native access to camera for barcode/QR scanning on mobile |
| **Offline Support** | `sqflite` for local DB; sync when online |
| **Google ML Kit** | On-device barcode scanning without network (google_mlkit_barcode_scanning) |
| **Secure Storage** | `flutter_secure_storage` uses Keychain (iOS) / Keystore (Android) |
| **Rich Widget Library** | Material Design 3 built-in; consistent UI across platforms |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **True Cross-Platform** | iOS + Android + Desktop from single codebase |
| 2 | **Hot Reload** | See changes instantly without rebuilding |
| 3 | **Native Performance** | AOT compiled; no JavaScript bridge (unlike React Native) |
| 4 | **Rich Widget Library** | Material Design 3, Cupertino widgets, custom widgets |
| 5 | **Strong Typing** | Dart's sound null safety catches errors at compile time |
| 6 | **Camera & Sensors** | Direct access to camera, GPS, accelerometer, biometrics |
| 7 | **Active Community** | 160k+ GitHub stars; thousands of packages on pub.dev |
| 8 | **Google Backed** | Long-term investment; used in Google Ads, Pay, Classroom |
| 9 | **Desktop Support** | Production-ready Windows/macOS apps for POS |
| 10 | **Platform Channels** | Call native Swift/Kotlin code when needed |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **App Size** | Flutter apps are 15-30MB minimum → acceptable for our use case |
| 2 | **Dart Ecosystem** | Smaller than JavaScript → but growing; pub.dev has 40k+ packages |
| 3 | **Web Performance** | Flutter web is slower than Next.js → we use Next.js for web |
| 4 | **Platform Widgets** | Doesn't use native iOS/Android widgets → use Cupertino widgets where needed |
| 5 | **Desktop Maturity** | Desktop support is newer → stable enough for POS; test thoroughly |
| 6 | **Learning Curve** | Dart is new for most teams → syntax similar to Java/C#/TypeScript |
| 7 | **Deep Linking** | Complex to set up → use `go_router` for declarative routing |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **Flutter SDK** | 3.x (stable) | Framework and tools |
| **Dart SDK** | 3.x (bundled with Flutter) | Language runtime |
| **Android Studio** | Latest | Android SDK, emulator, build tools |
| **Xcode** | 15+ (macOS only) | iOS/macOS builds |
| **VS Code** | Latest | IDE with Flutter/Dart extensions |
| **Git** | 2.x | Version control |
| **JDK** | 17 | Android build requirement |
| **CocoaPods** | Latest (macOS) | iOS dependency management |

### VS Code Extensions

```
Dart-Code.dart-code              # Dart language support
Dart-Code.flutter                # Flutter tools and snippets
nash.awesome-flutter-snippets    # Flutter code snippets
usernamehw.errorlens            # Inline error display
```

---

## 5. Installation & Setup

### Install Flutter (Windows)

```powershell
# Option 1: Download from https://docs.flutter.dev/get-started/install/windows

# Option 2: Using Chocolatey
choco install flutter

# Option 3: Using Git (recommended)
cd C:\dev
git clone https://github.com/flutter/flutter.git -b stable
# Add C:\dev\flutter\bin to PATH

# Verify installation
flutter --version
dart --version

# Run Flutter doctor to check setup
flutter doctor -v
```

### Fix Common flutter doctor Issues

```powershell
# Accept Android licenses
flutter doctor --android-licenses

# Install Android command-line tools
# Android Studio → SDK Manager → SDK Tools → Android SDK Command-line Tools

# Enable desktop support
flutter config --enable-windows-desktop
flutter config --enable-macos-desktop
```

### Expected flutter doctor Output

```
Doctor summary (to see all details, run flutter doctor -v):
[✓] Flutter (Channel stable, 3.x.x)
[✓] Windows Version (Installed version of Windows is version 10 or higher)
[✓] Android toolchain - develop for Android devices (Android SDK version 34.x.x)
[✓] Chrome - develop for the web
[✓] Visual Studio - develop Windows apps (Visual Studio 2022)
[✓] Android Studio (version 2024.x)
[✓] VS Code (version 1.x.x)
[✓] Connected device (x available)
[✓] Network resources
```

---

## 6. Project Creation

### Create a New Flutter Project

```powershell
# Create project
flutter create billing_mobile --org com.billingapp --platforms android,ios,windows

cd billing_mobile

# Verify project runs
flutter run
```

### Install Core Dependencies

```yaml
# pubspec.yaml
dependencies:
  flutter:
    sdk: flutter

  # Navigation
  go_router: ^14.0.0                     # Declarative routing

  # State Management
  flutter_riverpod: ^2.5.0               # State management
  riverpod_annotation: ^2.3.0            # Code generation for Riverpod

  # Networking
  dio: ^5.4.0                            # HTTP client
  retrofit: ^4.1.0                       # Type-safe API client

  # Local Storage
  flutter_secure_storage: ^9.2.0         # Secure token storage
  shared_preferences: ^2.2.0             # Simple key-value storage
  sqflite: ^2.3.0                        # Local SQLite database
  hive_flutter: ^1.1.0                   # Fast local NoSQL database

  # Barcode / QR
  mobile_scanner: ^5.1.0                 # Camera barcode scanner
  google_mlkit_barcode_scanning: ^0.12.0 # ML Kit barcode (offline)

  # UI
  flutter_svg: ^2.0.0                    # SVG rendering
  cached_network_image: ^3.3.0           # Image caching
  shimmer: ^3.0.0                        # Loading shimmer effect
  intl: ^0.19.0                          # Internationalization

  # Forms
  reactive_forms: ^17.0.0               # Reactive form management

  # Push Notifications
  firebase_core: ^2.27.0
  firebase_messaging: ^14.7.0

  # Utilities
  freezed_annotation: ^2.4.0            # Immutable data classes
  json_annotation: ^4.8.0               # JSON serialization
  logger: ^2.0.0                        # Logging

dev_dependencies:
  flutter_test:
    sdk: flutter

  # Code Generation
  build_runner: ^2.4.0
  freezed: ^2.4.0
  json_serializable: ^6.7.0
  retrofit_generator: ^8.1.0
  riverpod_generator: ^2.4.0

  # Testing
  mockito: ^5.4.0
  bloc_test: ^9.1.0
  integration_test:
    sdk: flutter

  # Linting
  flutter_lints: ^4.0.0
```

```powershell
# Install dependencies
flutter pub get

# Run code generation
dart run build_runner build --delete-conflicting-outputs
```

---

## 7. Project Structure

```
billing_mobile/
├── android/                       # Android native code
├── ios/                           # iOS native code
├── windows/                       # Windows desktop native code
├── macos/                         # macOS desktop native code
│
├── lib/
│   ├── main.dart                  # App entry point
│   ├── app.dart                   # MaterialApp + GoRouter setup
│   │
│   ├── core/                      # Core utilities & shared code
│   │   ├── constants/
│   │   │   ├── app_constants.dart
│   │   │   ├── api_endpoints.dart
│   │   │   └── app_colors.dart
│   │   ├── errors/
│   │   │   ├── exceptions.dart
│   │   │   └── failures.dart
│   │   ├── network/
│   │   │   ├── api_client.dart    # Dio HTTP client setup
│   │   │   ├── api_interceptor.dart # Auth token interceptor
│   │   │   └── network_info.dart
│   │   ├── storage/
│   │   │   ├── secure_storage.dart
│   │   │   └── local_db.dart
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── light_theme.dart
│   │   │   └── dark_theme.dart
│   │   └── utils/
│   │       ├── formatters.dart    # Currency, date formatters
│   │       ├── validators.dart    # Input validators
│   │       └── extensions.dart    # Dart extension methods
│   │
│   ├── features/                  # Feature-first architecture
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   │   └── auth_response.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository_impl.dart
│   │   │   │   └── datasources/
│   │   │   │       ├── auth_remote_datasource.dart
│   │   │   │       └── auth_local_datasource.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login.dart
│   │   │   │       ├── verify_otp.dart
│   │   │   │       └── logout.dart
│   │   │   └── presentation/
│   │   │       ├── providers/
│   │   │       │   └── auth_provider.dart
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   └── otp_verification_page.dart
│   │   │       └── widgets/
│   │   │           ├── phone_input.dart
│   │   │           └── otp_input.dart
│   │   │
│   │   ├── products/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   │
│   │   ├── orders/
│   │   ├── invoices/
│   │   ├── inventory/
│   │   ├── procurement/
│   │   ├── accounts/
│   │   ├── barcode/
│   │   ├── settings/
│   │   └── pos/                   # POS-specific (Desktop)
│   │       ├── data/
│   │       ├── domain/
│   │       └── presentation/
│   │           ├── pages/
│   │           │   └── pos_terminal_page.dart
│   │           └── widgets/
│   │               ├── product_grid.dart
│   │               ├── cart_panel.dart
│   │               └── payment_dialog.dart
│   │
│   ├── shared/                    # Shared widgets & providers
│   │   ├── widgets/
│   │   │   ├── app_bar.dart
│   │   │   ├── drawer.dart
│   │   │   ├── loading_indicator.dart
│   │   │   ├── error_widget.dart
│   │   │   └── app_button.dart
│   │   └── providers/
│   │       ├── tenant_provider.dart
│   │       └── connectivity_provider.dart
│   │
│   └── routing/
│       └── app_router.dart        # GoRouter configuration
│
├── test/                          # Unit & widget tests
│   ├── features/
│   │   ├── auth/
│   │   └── products/
│   └── core/
│
├── integration_test/              # Integration tests
│   └── app_test.dart
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── translations/
│       ├── en.json
│       └── ta.json
│
├── pubspec.yaml
├── analysis_options.yaml
├── build.yaml                     # Build runner config
├── Dockerfile
└── .env.example
```

---

## 8. Development Guide

### 8.1 Clean Architecture Layers

```
┌──────────────────────────────────────────────────┐
│              Presentation Layer                    │
│  Pages, Widgets, Providers (Riverpod)            │
│  - UI rendering                                  │
│  - User interaction handling                     │
│  - State management                              │
├──────────────────────────────────────────────────┤
│              Domain Layer                         │
│  Entities, Use Cases, Repository Interfaces      │
│  - Business rules                                │
│  - No dependencies on external packages          │
│  - Pure Dart (no Flutter imports)                 │
├──────────────────────────────────────────────────┤
│              Data Layer                           │
│  Models, Repository Implementations, Datasources │
│  - API calls (Dio/Retrofit)                      │
│  - Local database (sqflite/Hive)                 │
│  - JSON serialization                            │
└──────────────────────────────────────────────────┘
```

### 8.2 Entity (Domain Layer)

```dart
// lib/features/products/domain/entities/product.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';

@freezed
class Product with _$Product {
  const factory Product({
    required String id,
    required String name,
    required String sku,
    required double price,
    required double gstRate,
    required String categoryId,
    String? description,
    String? imageUrl,
    @Default(true) bool isActive,
    @Default(0) int stockQuantity,
  }) = _Product;
}
```

### 8.3 Model (Data Layer)

```dart
// lib/features/products/data/models/product_model.dart
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/product.dart';

part 'product_model.freezed.dart';
part 'product_model.g.dart';

@freezed
class ProductModel with _$ProductModel {
  const ProductModel._();

  const factory ProductModel({
    required String id,
    required String name,
    required String sku,
    required double price,
    @JsonKey(name: 'gst_rate') required double gstRate,
    @JsonKey(name: 'category_id') required String categoryId,
    String? description,
    @JsonKey(name: 'image_url') String? imageUrl,
    @JsonKey(name: 'is_active') @Default(true) bool isActive,
    @JsonKey(name: 'stock_quantity') @Default(0) int stockQuantity,
  }) = _ProductModel;

  factory ProductModel.fromJson(Map<String, dynamic> json) =>
      _$ProductModelFromJson(json);

  // Convert to domain entity
  Product toEntity() => Product(
    id: id,
    name: name,
    sku: sku,
    price: price,
    gstRate: gstRate,
    categoryId: categoryId,
    description: description,
    imageUrl: imageUrl,
    isActive: isActive,
    stockQuantity: stockQuantity,
  );
}
```

### 8.4 Repository Implementation

```dart
// lib/features/products/data/repositories/product_repository_impl.dart
import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../../../../core/errors/exceptions.dart';
import '../../domain/entities/product.dart';
import '../../domain/repositories/product_repository.dart';
import '../datasources/product_remote_datasource.dart';

class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDatasource remoteDatasource;

  ProductRepositoryImpl({required this.remoteDatasource});

  @override
  Future<Either<Failure, List<Product>>> getProducts({
    int page = 1,
    int pageSize = 20,
    String? search,
  }) async {
    try {
      final models = await remoteDatasource.getProducts(
        page: page,
        pageSize: pageSize,
        search: search,
      );
      return Right(models.map((m) => m.toEntity()).toList());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on NetworkException {
      return Left(const NetworkFailure('No internet connection'));
    }
  }

  @override
  Future<Either<Failure, Product>> createProduct(CreateProductInput input) async {
    try {
      final model = await remoteDatasource.createProduct(input);
      return Right(model.toEntity());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
```

### 8.5 Use Case (Domain Layer)

```dart
// lib/features/products/domain/usecases/get_products.dart
import 'package:dartz/dartz.dart';
import '../../../../core/errors/failures.dart';
import '../entities/product.dart';
import '../repositories/product_repository.dart';

class GetProducts {
  final ProductRepository repository;

  GetProducts(this.repository);

  Future<Either<Failure, List<Product>>> call({
    int page = 1,
    int pageSize = 20,
    String? search,
  }) {
    return repository.getProducts(
      page: page,
      pageSize: pageSize,
      search: search,
    );
  }
}
```

### 8.6 Provider (Riverpod)

```dart
// lib/features/products/presentation/providers/product_provider.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../domain/entities/product.dart';
import '../../domain/usecases/get_products.dart';

part 'product_provider.g.dart';

@riverpod
Future<List<Product>> productList(Ref ref, {int page = 1, String? search}) async {
  final getProducts = ref.watch(getProductsUseCaseProvider);
  final result = await getProducts(page: page, search: search);
  return result.fold(
    (failure) => throw Exception(failure.message),
    (products) => products,
  );
}

// UI consumes it like:
// final productsAsync = ref.watch(productListProvider(page: 1));
// productsAsync.when(
//   data: (products) => ProductListView(products: products),
//   loading: () => const LoadingIndicator(),
//   error: (error, stack) => ErrorWidget(error: error),
// );
```

### 8.7 Page (Presentation Layer)

```dart
// lib/features/products/presentation/pages/product_list_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/product_provider.dart';
import '../widgets/product_card.dart';

class ProductListPage extends ConsumerWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productListProvider());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Products'),
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code_scanner),
            onPressed: () => context.push('/barcode-scan'),
          ),
        ],
      ),
      body: productsAsync.when(
        data: (products) => ListView.builder(
          itemCount: products.length,
          itemBuilder: (context, index) => ProductCard(
            product: products[index],
            onTap: () => context.push('/products/${products[index].id}'),
          ),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Error: $error'),
              ElevatedButton(
                onPressed: () => ref.invalidate(productListProvider()),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/products/new'),
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

---

## 9. Routing & Navigation

### GoRouter Configuration

```dart
// lib/routing/app_router.dart
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/',
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      if (!isLoggedIn && !isAuthRoute) return '/auth/login';
      if (isLoggedIn && isAuthRoute) return '/';
      return null;
    },
    routes: [
      // Auth routes
      GoRoute(
        path: '/auth/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/auth/verify-otp',
        builder: (context, state) => const OtpVerificationPage(),
      ),

      // Main shell with bottom navigation
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/products',
            builder: (context, state) => const ProductListPage(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const CreateProductPage(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) => ProductDetailPage(
                  id: state.pathParameters['id']!,
                ),
              ),
            ],
          ),
          GoRoute(path: '/orders', builder: (context, state) => const OrdersPage()),
          GoRoute(path: '/invoices', builder: (context, state) => const InvoicesPage()),
          GoRoute(path: '/barcode-scan', builder: (context, state) => const BarcodeScanPage()),
          GoRoute(path: '/settings', builder: (context, state) => const SettingsPage()),

          // POS-specific route (Desktop only)
          GoRoute(path: '/pos', builder: (context, state) => const PosTerminalPage()),
        ],
      ),
    ],
  );
});
```

---

## 10. Authentication & JWT Handling

### Secure Token Storage

```dart
// lib/core/storage/secure_storage.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  Future<String?> getAccessToken() =>
      _storage.read(key: _accessTokenKey);

  Future<String?> getRefreshToken() =>
      _storage.read(key: _refreshTokenKey);

  Future<void> clearTokens() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }
}
```

### Auth Interceptor (Dio)

```dart
// lib/core/network/api_interceptor.dart
import 'package:dio/dio.dart';
import '../storage/secure_storage.dart';

class AuthInterceptor extends Interceptor {
  final TokenStorage tokenStorage;
  final Dio dio;

  AuthInterceptor({required this.tokenStorage, required this.dio});

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await tokenStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Attempt token refresh
      final refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken == null) {
        handler.reject(err);
        return;
      }

      try {
        final response = await dio.post(
          '/identity/auth/refresh',
          data: {'refresh_token': refreshToken},
        );

        final newAccessToken = response.data['access_token'];
        final newRefreshToken = response.data['refresh_token'];

        await tokenStorage.saveTokens(
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        );

        // Retry original request with new token
        err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
        final retryResponse = await dio.fetch(err.requestOptions);
        handler.resolve(retryResponse);
      } catch (e) {
        // Refresh failed — logout
        await tokenStorage.clearTokens();
        handler.reject(err);
      }
    } else {
      handler.next(err);
    }
  }
}
```

---

## 11. API Integration

### Dio HTTP Client Setup

```dart
// lib/core/network/api_client.dart
import 'package:dio/dio.dart';
import 'api_interceptor.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  late final Dio dio;
  final TokenStorage tokenStorage;

  ApiClient({required this.tokenStorage, required String baseUrl}) {
    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    dio.interceptors.addAll([
      AuthInterceptor(tokenStorage: tokenStorage, dio: dio),
      LogInterceptor(requestBody: true, responseBody: true),
    ]);
  }
}
```

### Retrofit API Service (Type-safe)

```dart
// lib/features/products/data/datasources/product_remote_datasource.dart
import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../models/product_model.dart';

part 'product_remote_datasource.g.dart';

@RestApi()
abstract class ProductRemoteDatasource {
  factory ProductRemoteDatasource(Dio dio) = _ProductRemoteDatasource;

  @GET('/catalog/products')
  Future<List<ProductModel>> getProducts({
    @Query('page') int page = 1,
    @Query('page_size') int pageSize = 20,
    @Query('search') String? search,
  });

  @GET('/catalog/products/{id}')
  Future<ProductModel> getProductById(@Path('id') String id);

  @POST('/catalog/products')
  Future<ProductModel> createProduct(@Body() Map<String, dynamic> body);

  @PUT('/catalog/products/{id}')
  Future<ProductModel> updateProduct(
    @Path('id') String id,
    @Body() Map<String, dynamic> body,
  );

  @DELETE('/catalog/products/{id}')
  Future<void> deleteProduct(@Path('id') String id);
}
```

---

## 12. State Management

### Why Riverpod

| Feature | Provider | Riverpod | Bloc |
|---|---|---|---|
| Compile-safe | ❌ Runtime errors | ✅ Compile-time | ❌ Runtime |
| Testing | Hard | **Easy** | Easy |
| Code generation | No | **Optional** | No |
| DevTools | Limited | **Riverpod DevTools** | Bloc DevTools |
| Learning curve | Low | Medium | High |
| Async support | Manual | **Built-in** | Manual |

### State Management Decision Matrix

| Scenario | Tool |
|---|---|
| **Server data (API calls)** | Riverpod `AsyncNotifierProvider` / `FutureProvider` |
| **Local UI state (tabs, toggle)** | Riverpod `StateProvider` or `NotifierProvider` |
| **Auth state** | Riverpod `AsyncNotifierProvider` + `flutter_secure_storage` |
| **Form state** | `reactive_forms` |
| **Navigation state** | `go_router` |
| **Offline data** | `sqflite` / `Hive` + sync logic |

---

## 13. Barcode & QR Code Scanning

### Camera-based Scanner (Mobile)

```dart
// lib/features/barcode/presentation/pages/barcode_scan_page.dart
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

class BarcodeScanPage extends StatefulWidget {
  const BarcodeScanPage({super.key});

  @override
  State<BarcodeScanPage> createState() => _BarcodeScanPageState();
}

class _BarcodeScanPageState extends State<BarcodeScanPage> {
  final MobileScannerController controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  bool _isProcessing = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan Barcode'),
        actions: [
          IconButton(
            icon: ValueListenableBuilder(
              valueListenable: controller,
              builder: (context, state, child) => Icon(
                state.torchState == TorchState.on
                    ? Icons.flash_on
                    : Icons.flash_off,
              ),
            ),
            onPressed: () => controller.toggleTorch(),
          ),
          IconButton(
            icon: const Icon(Icons.camera_front),
            onPressed: () => controller.switchCamera(),
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: controller,
            onDetect: (capture) => _onBarcodeDetected(capture),
          ),
          // Scan overlay
          Center(
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.green, width: 3),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _onBarcodeDetected(BarcodeCapture capture) {
    if (_isProcessing) return;
    _isProcessing = true;

    final barcode = capture.barcodes.first;
    final value = barcode.rawValue;

    if (value != null) {
      // Navigate to product or create new
      context.pop(value); // Return barcode value to caller
    }

    // Reset after delay to prevent rapid-fire scans
    Future.delayed(const Duration(seconds: 2), () {
      _isProcessing = false;
    });
  }

  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }
}
```

### Using Scanner in Product Search

```dart
// In product list page
FloatingActionButton(
  onPressed: () async {
    final barcode = await context.push<String>('/barcode-scan');
    if (barcode != null) {
      // Search product by barcode
      ref.read(productSearchProvider.notifier).searchByBarcode(barcode);
    }
  },
  child: const Icon(Icons.qr_code_scanner),
);
```

---

## 14. SOLID Principles in Flutter

### S — Single Responsibility

```dart
// ✅ Each class has ONE job
class ProductRepository { /* data access only */ }
class GetProducts { /* business logic only */ }
class ProductListPage { /* UI rendering only */ }
class ProductModel { /* serialization only */ }

// ❌ Avoid: One widget that fetches data, validates, formats, and renders
```

### O — Open/Closed

```dart
// ✅ Open for extension via generics and abstract classes
abstract class BaseRepository<T> {
  Future<List<T>> getAll();
  Future<T> getById(String id);
  Future<T> create(Map<String, dynamic> data);
}

class ProductRepository extends BaseRepository<Product> {
  @override
  Future<List<Product>> getAll() => /* ... */;
  // Each new entity creates a new repository without modifying BaseRepository
}
```

### L — Liskov Substitution

```dart
// ✅ Any AppButton subtype can replace AppButton
abstract class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  const AppButton({required this.label, required this.onPressed});
}

class PrimaryButton extends AppButton { /* Material primary style */ }
class OutlinedButton extends AppButton { /* Outlined style */ }
class DangerButton extends AppButton { /* Red destructive style */ }
```

### I — Interface Segregation

```dart
// ✅ Small, focused interfaces
abstract class Readable<T> {
  Future<List<T>> getAll();
  Future<T> getById(String id);
}

abstract class Writable<T> {
  Future<T> create(Map<String, dynamic> data);
  Future<T> update(String id, Map<String, dynamic> data);
}

abstract class Deletable {
  Future<void> delete(String id);
}

// Combine only what's needed
class ProductRepository implements Readable<Product>, Writable<Product>, Deletable {
  // ...
}
```

### D — Dependency Inversion

```dart
// ✅ Depend on abstractions, not implementations
// Domain layer defines interface
abstract class ProductRepository {
  Future<Either<Failure, List<Product>>> getProducts();
}

// Data layer provides implementation
class ProductRepositoryImpl implements ProductRepository {
  final ProductRemoteDatasource remoteDatasource;
  ProductRepositoryImpl({required this.remoteDatasource});

  @override
  Future<Either<Failure, List<Product>>> getProducts() async {
    // Implementation details...
  }
}

// Use case depends on abstraction
class GetProducts {
  final ProductRepository repository; // Interface, not implementation
  GetProducts(this.repository);
}

// Riverpod wires it together
final productRepositoryProvider = Provider<ProductRepository>((ref) {
  return ProductRepositoryImpl(
    remoteDatasource: ref.watch(productRemoteDatasourceProvider),
  );
});
```

---

## 15. Do's & Don'ts

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Use `const` constructors everywhere** | Reduces widget rebuilds; better performance |
| 2 | **Use `freezed` for models and entities** | Immutable, copyWith, equality, JSON serialization |
| 3 | **Follow feature-first folder structure** | Scales well; easier to find related code |
| 4 | **Use `flutter_secure_storage` for tokens** | Platform-specific encryption (Keychain/Keystore) |
| 5 | **Handle all async states** | Always show loading, error, and data states |
| 6 | **Run `flutter analyze` before commits** | Catch lint issues early |
| 7 | **Use platform checks for POS features** | `Platform.isWindows` to show desktop-only UI |
| 8 | **Use named routes with GoRouter** | Type-safe navigation; deep linking support |
| 9 | **Cache images with `cached_network_image`** | Avoid re-downloading product images |
| 10 | **Use `intl` for formatting** | Currency, dates, numbers localized properly |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't store tokens in SharedPreferences** | Use `flutter_secure_storage` (encrypted) |
| 2 | **Don't put business logic in widgets** | Use use cases and repositories |
| 3 | **Don't use `setState` for complex state** | Use Riverpod providers |
| 4 | **Don't skip null safety** | Embrace Dart's sound null safety |
| 5 | **Don't hardcode strings** | Use `intl` for i18n; constants for API URLs |
| 6 | **Don't ignore `dispose()`** | Dispose controllers, streams, animations |
| 7 | **Don't nest more than 3 widgets deep inline** | Extract to separate widgets |
| 8 | **Don't use `print()` for logging** | Use `logger` package |
| 9 | **Don't block the UI thread** | Use `compute()` for heavy processing (JSON parsing, image processing) |
| 10 | **Don't skip code generation** | Run `build_runner` after model changes |

---

## 16. Testing

### Unit Test (Use Case)

```dart
// test/features/products/domain/usecases/get_products_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:dartz/dartz.dart';

@GenerateMocks([ProductRepository])
void main() {
  late GetProducts useCase;
  late MockProductRepository mockRepository;

  setUp(() {
    mockRepository = MockProductRepository();
    useCase = GetProducts(mockRepository);
  });

  test('should return list of products from repository', () async {
    final products = [
      const Product(id: '1', name: 'Rice', sku: 'RIC-001', price: 50.0, gstRate: 5, categoryId: 'cat1'),
    ];

    when(mockRepository.getProducts(page: 1, pageSize: 20))
        .thenAnswer((_) async => Right(products));

    final result = await useCase(page: 1, pageSize: 20);

    expect(result, Right(products));
    verify(mockRepository.getProducts(page: 1, pageSize: 20));
  });
}
```

### Widget Test

```dart
// test/features/products/presentation/widgets/product_card_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('ProductCard displays product name and price', (tester) async {
    final product = Product(
      id: '1', name: 'Basmati Rice', sku: 'RIC-001',
      price: 150.0, gstRate: 5, categoryId: 'cat1',
    );

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ProductCard(product: product)),
      ),
    );

    expect(find.text('Basmati Rice'), findsOneWidget);
    expect(find.text('₹150.00'), findsOneWidget);
  });
}
```

### Integration Test

```dart
// integration_test/app_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:billing_mobile/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('login and view products flow', (tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Enter phone number
    await tester.enterText(find.byType(TextField).first, '9876543210');
    await tester.tap(find.text('Send OTP'));
    await tester.pumpAndSettle();

    // Enter OTP
    await tester.enterText(find.byType(TextField).first, '123456');
    await tester.tap(find.text('Verify'));
    await tester.pumpAndSettle();

    // Should be on dashboard
    expect(find.text('Dashboard'), findsOneWidget);

    // Navigate to products
    await tester.tap(find.text('Products'));
    await tester.pumpAndSettle();

    expect(find.byType(ProductCard), findsWidgets);
  });
}
```

---

## 17. Platform-Specific Features

| Feature | Mobile (Android/iOS) | Desktop (Windows POS) |
|---|---|---|
| **Barcode Scanning** | Camera (`mobile_scanner`) | External USB scanner (keyboard input) |
| **Printing** | Bluetooth thermal printer | USB thermal printer / network printer |
| **Payment** | UPI deep link / Razorpay SDK | Card machine integration |
| **Notifications** | Firebase Cloud Messaging | Windows toast notifications |
| **Offline** | sqflite + background sync | sqflite + background sync |
| **Biometrics** | Fingerprint / Face ID | Windows Hello |
| **Screen** | Responsive (phone/tablet) | Fixed POS layout (landscape) |

### Platform Check Example

```dart
import 'dart:io' show Platform;

Widget build(BuildContext context) {
  if (Platform.isWindows || Platform.isMacOS) {
    return const PosTerminalLayout();  // Desktop POS layout
  }
  return const MobileLayout();          // Mobile layout
}
```

---

## 18. How to Run

### Mobile (Android Emulator)

```powershell
# List available emulators
flutter emulators

# Launch emulator
flutter emulators --launch Pixel_7_API_34

# Run app on emulator
flutter run

# Run on specific device
flutter devices
flutter run -d <device-id>
```

### Desktop (Windows)

```powershell
# Run on Windows desktop
flutter run -d windows

# Run in release mode
flutter run -d windows --release
```

### Multi-device

```powershell
# Run on all connected devices
flutter run -d all
```

---

## 19. Local Deployment

### Build APK (Android)

```powershell
# Debug APK
flutter build apk --debug

# Release APK
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release

# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Build iOS (macOS only)

```bash
# Build for iOS
flutter build ios --release

# Open in Xcode for archive/submit
open ios/Runner.xcworkspace
```

### Build Windows Desktop

```powershell
# Build Windows executable
flutter build windows --release

# Output: build/windows/x64/runner/Release/billing_mobile.exe

# Create installer with Inno Setup or MSIX
```

---

## 20. Cloud Deployment with Docker

### Dockerfile (Android Build)

```dockerfile
# Dockerfile for building Flutter APK in CI/CD
FROM ghcr.io/nicories/flutter-android-docker:stable AS builder

WORKDIR /app
COPY . .

RUN flutter pub get
RUN dart run build_runner build --delete-conflicting-outputs
RUN flutter build apk --release

# Output stage — extract APK
FROM alpine:latest
COPY --from=builder /app/build/app/outputs/flutter-apk/app-release.apk /output/
CMD ["cp", "/output/app-release.apk", "/artifacts/"]
```

### CI/CD Build (GitHub Actions)

```yaml
# .github/workflows/build-mobile.yml
name: Build Mobile App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'
          channel: 'stable'

      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs
      - run: flutter analyze
      - run: flutter test
      - run: flutter build apk --release

      - uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: build/app/outputs/flutter-apk/app-release.apk

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.x'
          channel: 'stable'

      - run: flutter pub get
      - run: dart run build_runner build --delete-conflicting-outputs
      - run: flutter build windows --release

      - uses: actions/upload-artifact@v4
        with:
          name: windows-build
          path: build/windows/x64/runner/Release/
```

---

## 21. Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| **Gradle build fails** | Wrong JDK or SDK version | Check `android/build.gradle` versions; use JDK 17 |
| **CocoaPods error** | Outdated pods | `cd ios && pod install --repo-update` |
| **build_runner fails** | Syntax error in model | Fix model annotations; run with `--delete-conflicting-outputs` |
| **Hot reload not working** | Structural change | Use Hot Restart (Shift+R) instead of Hot Reload (R) |
| **pub get fails** | Dependency conflict | Run `flutter pub upgrade --major-versions` |
| **Camera permission denied** | Missing permissions | Add to `AndroidManifest.xml` and `Info.plist` |
| **Windows build fails** | Visual Studio not found | Install Visual Studio 2022 with "Desktop C++" workload |
| **null safety error** | Non-null-safe package | Upgrade the package or add `// ignore_for_file: import_of_legacy_library_into_null_safe` |

---

## 22. Useful Commands

```powershell
# Project
flutter create <name>             # Create new project
flutter pub get                    # Install dependencies
flutter pub upgrade                # Upgrade dependencies
flutter pub outdated               # Check outdated packages

# Code Generation
dart run build_runner build        # One-time generation
dart run build_runner watch        # Watch mode generation

# Development
flutter run                        # Run on connected device
flutter run -d chrome              # Run on Chrome (web)
flutter run -d windows             # Run on Windows
flutter hot-reload                 # Hot reload (R in terminal)
flutter hot-restart                # Hot restart (Shift+R)

# Quality
flutter analyze                    # Run static analysis
flutter test                       # Run unit tests
flutter test integration_test/     # Run integration tests
flutter test --coverage            # Generate coverage report

# Build
flutter build apk --release        # Android APK
flutter build appbundle --release  # Android App Bundle
flutter build ios --release         # iOS (macOS only)
flutter build windows --release     # Windows desktop

# Utilities
flutter doctor -v                  # Check environment
flutter devices                    # List connected devices
flutter clean                      # Clean build cache
flutter pub cache repair           # Repair package cache
```

---

## 23. References

| Resource | URL |
|---|---|
| **Official Docs** | https://docs.flutter.dev |
| **Dart Docs** | https://dart.dev/guides |
| **pub.dev** | https://pub.dev (package repository) |
| **Flutter Cookbook** | https://docs.flutter.dev/cookbook |
| **Riverpod** | https://riverpod.dev |
| **GoRouter** | https://pub.dev/packages/go_router |
| **Dio** | https://pub.dev/packages/dio |
| **Freezed** | https://pub.dev/packages/freezed |
| **mobile_scanner** | https://pub.dev/packages/mobile_scanner |
| **flutter_secure_storage** | https://pub.dev/packages/flutter_secure_storage |
| **Material Design 3** | https://m3.material.io |
| **Flutter Examples** | https://github.com/flutter/samples |
