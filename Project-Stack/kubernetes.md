# ☸️ Kubernetes — Container Orchestration

> **Role in Project:** Orchestrate, scale, and manage containerized microservices in production
> **Version:** Kubernetes 1.30+
> **Related:** [Docker](./docker.md) | [GitHub Actions](./github-actions.md) | [Cloudflare](./cloudflare.md)

---

## Table of Contents

1. [Purpose & Overview](#1-purpose--overview)
2. [Why We Chose Kubernetes](#2-why-we-chose-kubernetes)
3. [Advantages & Disadvantages](#3-advantages--disadvantages)
4. [Prerequisites](#4-prerequisites)
5. [Installation & Setup](#5-installation--setup)
6. [Core Concepts](#6-core-concepts)
7. [Development Guide — Manifests](#7-development-guide--manifests)
8. [Service Discovery & Networking](#8-service-discovery--networking)
9. [Configuration & Secrets](#9-configuration--secrets)
10. [Auto-Scaling](#10-auto-scaling)
11. [Health Probes](#11-health-probes)
12. [Best Practices (Do's & Don'ts)](#12-best-practices-dos--donts)
13. [Monitoring & Observability](#13-monitoring--observability)
14. [How to Run](#14-how-to-run)
15. [Local Deployment](#15-local-deployment)
16. [Cloud Deployment](#16-cloud-deployment)
17. [Troubleshooting](#17-troubleshooting)
18. [Useful Commands](#18-useful-commands)
19. [References](#19-references)

---

## 1. Purpose & Overview

**Kubernetes (K8s)** is a container orchestration platform that automates deployment, scaling, and management of containerized applications.

### Cluster Layout for This Project

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Kubernetes Cluster                            │
│                                                                      │
│  ┌─────────────────── billing namespace ───────────────────────┐     │
│  │                                                              │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │ gateway  │  │ identity │  │ catalog  │  │ commerce │   │     │
│  │  │ (2 pods) │  │ (2 pods) │  │ (2 pods) │  │ (2 pods) │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  │                                                              │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │     │
│  │  │engagement│  │   web    │  │ postgres │  │  redis   │   │     │
│  │  │ (2 pods) │  │ (2 pods) │  │ (1 pod)  │  │ (1 pod)  │   │     │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │     │
│  │                                                              │     │
│  │  ┌──────────┐  ┌──────────┐                                │     │
│  │  │ rabbitmq │  │  minio   │                                │     │
│  │  │ (1 pod)  │  │ (1 pod)  │                                │     │
│  │  └──────────┘  └──────────┘                                │     │
│  │                                                              │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  Ingress Controller ──► gateway Service ──► gateway Pods             │
│  (Cloudflare / NGINX)                                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Why We Chose Kubernetes

| Factor | Decision Rationale |
|---|---|
| **Auto-Scaling** | Scale services independently based on CPU/memory/custom metrics |
| **Self-Healing** | Restarts failed containers; replaces unresponsive pods |
| **Rolling Updates** | Zero-downtime deployments with rollback capability |
| **Service Discovery** | Built-in DNS — services find each other by name |
| **Resource Management** | CPU/memory limits prevent one service from starving others |
| **Industry Standard** | Supported by every major cloud provider |

---

## 3. Advantages & Disadvantages

### ✅ Advantages

| # | Advantage | Detail |
|---|---|---|
| 1 | **Auto-scaling** | HPA scales pods based on metrics |
| 2 | **Self-healing** | Restarts crashed pods automatically |
| 3 | **Rolling updates** | Zero-downtime deployments |
| 4 | **Service discovery** | Internal DNS for service-to-service communication |
| 5 | **Resource limits** | CPU/memory quotas per pod |
| 6 | **Declarative config** | YAML manifests = infrastructure as code |
| 7 | **Multi-cloud** | Works on AWS EKS, Azure AKS, GCP GKE |

### ❌ Disadvantages

| # | Disadvantage | Mitigation |
|---|---|---|
| 1 | **Complexity** | Significant learning curve → use managed K8s (AKS/EKS) |
| 2 | **Resource overhead** | K8s itself uses CPU/RAM → managed services handle control plane |
| 3 | **YAML verbosity** | Many config files → use Helm charts or Kustomize |
| 4 | **Networking** | Complex networking model → use service mesh if needed |
| 5 | **Overkill for small scale** | May not need K8s initially → start with Docker Compose, migrate later |

---

## 4. Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **kubectl** | 1.30+ | K8s command-line tool |
| **Docker Desktop** | Latest | Local K8s cluster (enable in settings) |
| **Helm** | 3.x | Package manager for K8s |
| **Lens** | Latest | K8s GUI (optional) |

---

## 5. Installation & Setup

### Enable Kubernetes in Docker Desktop

1. Docker Desktop → Settings → Kubernetes → Enable Kubernetes
2. Wait for cluster to start (green indicator)

```powershell
# Verify
kubectl cluster-info
kubectl get nodes

# Set default namespace
kubectl create namespace billing
kubectl config set-context --current --namespace=billing
```

### Install kubectl (if not via Docker Desktop)

```powershell
# Windows (winget)
winget install Kubernetes.kubectl

# Verify
kubectl version --client
```

### Install Helm

```powershell
winget install Helm.Helm

# Add common chart repos
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
```

---

## 6. Core Concepts

| Concept | Description |
|---|---|
| **Pod** | Smallest deployable unit — one or more containers |
| **Deployment** | Manages replicas of pods; handles rolling updates |
| **Service** | Stable network endpoint for a set of pods (load balancer) |
| **Ingress** | Routes external HTTP traffic to internal services |
| **ConfigMap** | Non-sensitive configuration (key-value pairs) |
| **Secret** | Sensitive data (passwords, tokens) — base64 encoded |
| **Namespace** | Virtual cluster for resource isolation |
| **HPA** | Horizontal Pod Autoscaler — auto-scale based on metrics |
| **PVC** | Persistent Volume Claim — storage for stateful services |
| **Job** | Run-to-completion task (e.g., database migration) |

---

## 7. Development Guide — Manifests

### 7.1 Namespace

```yaml
# namespace.yml
apiVersion: v1
kind: Namespace
metadata:
  name: billing
  labels:
    app.kubernetes.io/part-of: billing-software
```

### 7.2 Deployment (.NET Service)

```yaml
# catalog-deployment.yml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: catalog-api
  namespace: billing
  labels:
    app: catalog-api
    tier: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: catalog-api
  template:
    metadata:
      labels:
        app: catalog-api
        tier: backend
    spec:
      containers:
        - name: catalog-api
          image: ghcr.io/your-org/billing-catalog:1.0.0
          ports:
            - containerPort: 8080
          env:
            - name: ASPNETCORE_ENVIRONMENT
              value: "Production"
            - name: ConnectionStrings__DefaultConnection
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: postgres-connection
            - name: ConnectionStrings__Redis
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: redis-connection
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /health/live
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 15
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
          startupProbe:
            httpGet:
              path: /health/live
              port: 8080
            failureThreshold: 30
            periodSeconds: 5
      restartPolicy: Always
```

### 7.3 Service

```yaml
# catalog-service.yml
apiVersion: v1
kind: Service
metadata:
  name: catalog-api
  namespace: billing
spec:
  selector:
    app: catalog-api
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
  type: ClusterIP
```

### 7.4 Ingress

```yaml
# ingress.yml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: billing-ingress
  namespace: billing
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.billing.example.com
        - app.billing.example.com
      secretName: billing-tls
  rules:
    - host: api.billing.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: gateway
                port:
                  number: 80
    - host: app.billing.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 80
```

### 7.5 Database Migration Job

```yaml
# db-migration-job.yml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrator-v1-0-0
  namespace: billing
spec:
  backoffLimit: 3
  template:
    spec:
      containers:
        - name: migrator
          image: ghcr.io/your-org/billing-migrator:1.0.0
          env:
            - name: ConnectionStrings__DefaultConnection
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: postgres-connection
      restartPolicy: Never
```

### 7.6 PostgreSQL StatefulSet

```yaml
# postgres-statefulset.yml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: billing
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:16-alpine
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_DB
              value: "billing"
            - name: POSTGRES_USER
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: postgres-user
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: billing-secrets
                  key: postgres-password
          volumeMounts:
            - name: postgres-storage
              mountPath: /var/lib/postgresql/data
          resources:
            requests:
              cpu: "250m"
              memory: "512Mi"
            limits:
              cpu: "1"
              memory: "1Gi"
  volumeClaimTemplates:
    - metadata:
        name: postgres-storage
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 20Gi
```

---

## 8. Service Discovery & Networking

### Internal DNS

Inside the cluster, services are reachable by name:

```
# Within same namespace
http://catalog-api:80

# Cross-namespace
http://catalog-api.billing.svc.cluster.local:80
```

### Service Types

| Type | Access | Use Case |
|---|---|---|
| **ClusterIP** | Internal only | Service-to-service (default) |
| **NodePort** | External via node IP:port | Development |
| **LoadBalancer** | External via cloud LB | Production (expensive) |
| **Ingress** | External via HTTP/HTTPS routing | Production (preferred) |

---

## 9. Configuration & Secrets

### ConfigMap

```yaml
# configmap.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: billing-config
  namespace: billing
data:
  ASPNETCORE_ENVIRONMENT: "Production"
  RabbitMQ__Host: "rabbitmq"
  Redis__InstanceName: "billing:"
```

### Secret

```yaml
# secret.yml (apply from CI/CD — never commit to git!)
apiVersion: v1
kind: Secret
metadata:
  name: billing-secrets
  namespace: billing
type: Opaque
stringData:
  postgres-connection: "Host=postgres;Database=billing;Username=billing_app;Password=SECURE_PASSWORD"
  postgres-user: "billing_app"
  postgres-password: "SECURE_PASSWORD"
  redis-connection: "redis:6379,password=SECURE_PASSWORD"
  jwt-secret: "LONG_RANDOM_SECRET_KEY"
```

### Use in Deployment

```yaml
env:
  # From ConfigMap
  - name: ASPNETCORE_ENVIRONMENT
    valueFrom:
      configMapKeyRef:
        name: billing-config
        key: ASPNETCORE_ENVIRONMENT
  # From Secret
  - name: ConnectionStrings__DefaultConnection
    valueFrom:
      secretKeyRef:
        name: billing-secrets
        key: postgres-connection
```

---

## 10. Auto-Scaling

### Horizontal Pod Autoscaler (HPA)

```yaml
# hpa.yml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: catalog-api-hpa
  namespace: billing
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: catalog-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 30
      policies:
        - type: Pods
          value: 2
          periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Pods
          value: 1
          periodSeconds: 120
```

### Scaling Targets per Service

| Service | Min | Max | CPU Target | Memory Target |
|---|---|---|---|---|
| **gateway** | 2 | 6 | 60% | 70% |
| **identity-api** | 2 | 4 | 70% | 80% |
| **catalog-api** | 2 | 10 | 70% | 80% |
| **commerce-api** | 2 | 8 | 70% | 80% |
| **engagement-api** | 2 | 4 | 70% | 80% |
| **web** | 2 | 6 | 60% | 70% |

---

## 11. Health Probes

### .NET Health Endpoints

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString, name: "postgres")
    .AddRedis(redisConnection, name: "redis")
    .AddRabbitMQ(name: "rabbitmq");

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false  // Just checks if app is running
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = _ => true  // Checks all dependencies
});
```

### Probe Types

| Probe | Purpose | Failure Action |
|---|---|---|
| **Liveness** | Is the process alive? | Restart the pod |
| **Readiness** | Can it handle traffic? | Remove from service (stop routing traffic) |
| **Startup** | Has it finished initializing? | Delay liveness/readiness checks |

---

## 12. Best Practices (Do's & Don'ts)

### ✅ Do's

| # | Practice | Reason |
|---|---|---|
| 1 | **Set resource requests AND limits** | Prevents resource starvation; enables HPA |
| 2 | **Use namespaces** | Isolate environments (billing-dev, billing-staging, billing-prod) |
| 3 | **Use health probes** | K8s needs to know pod health for self-healing |
| 4 | **Use Secrets for credentials** | Never hardcode passwords in manifests |
| 5 | **Pin image tags** | `1.0.0` not `latest` — reproducible deployments |
| 6 | **Use rolling update strategy** | Zero-downtime deployments |
| 7 | **Set pod disruption budgets** | Prevent all pods from being evicted simultaneously |

### ❌ Don'ts

| # | Anti-pattern | Correct Approach |
|---|---|---|
| 1 | **Don't commit secrets to git** | Use `kubectl create secret` or external secrets manager |
| 2 | **Don't use `latest` tag** | Pin exact version (e.g., `1.0.0`) |
| 3 | **Don't skip resource limits** | Always set to prevent noisy neighbor issues |
| 4 | **Don't run as root** | Set `securityContext.runAsNonRoot: true` |
| 5 | **Don't use NodePort in production** | Use Ingress instead |
| 6 | **Don't deploy without health checks** | K8s can't self-heal without probes |

---

## 13. Monitoring & Observability

### Key Tools

| Tool | Purpose |
|---|---|
| **kubectl top** | Quick CPU/memory usage |
| **Lens** | GUI dashboard for cluster |
| **Prometheus + Grafana** | Metrics collection and visualization |
| **Loki** | Log aggregation |

### Quick Monitoring Commands

```powershell
# Node resource usage
kubectl top nodes

# Pod resource usage
kubectl top pods -n billing

# Events (cluster issues)
kubectl get events -n billing --sort-by='.lastTimestamp'

# Pod logs
kubectl logs -f deployment/catalog-api -n billing
```

---

## 14. How to Run

```powershell
# Apply all manifests
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/secrets.yml
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/postgres/
kubectl apply -f k8s/redis/
kubectl apply -f k8s/rabbitmq/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yml
kubectl apply -f k8s/hpa/

# Check status
kubectl get all -n billing

# Port-forward for local access
kubectl port-forward svc/gateway 5000:80 -n billing
```

---

## 15. Local Deployment

```powershell
# Using Docker Desktop Kubernetes
# 1. Enable K8s in Docker Desktop settings
# 2. Switch context
kubectl config use-context docker-desktop

# 3. Create namespace
kubectl create namespace billing

# 4. Deploy infrastructure
kubectl apply -f k8s/ -n billing

# 5. Port-forward to access
kubectl port-forward svc/gateway 5000:80 -n billing
kubectl port-forward svc/web 3000:80 -n billing

# Access at http://localhost:5000 (API) and http://localhost:3000 (Web)
```

---

## 16. Cloud Deployment

### Managed Kubernetes Services

| Provider | Service | Command |
|---|---|---|
| **Azure** | AKS | `az aks create --resource-group billing-rg --name billing-aks` |
| **AWS** | EKS | `eksctl create cluster --name billing-eks` |
| **GCP** | GKE | `gcloud container clusters create billing-gke` |
| **DigitalOcean** | DOKS | `doctl kubernetes cluster create billing-doks` |

### Production Deployment Flow

```
1. CI/CD builds Docker image → pushes to GHCR
2. CI/CD updates image tag in K8s manifest
3. kubectl apply (or ArgoCD auto-sync)
4. K8s performs rolling update
5. Health probes verify new pods
6. Old pods are terminated
```

---

## 17. Troubleshooting

| Issue | Diagnosis | Fix |
|---|---|---|
| **Pod in CrashLoopBackOff** | `kubectl logs <pod>` | Fix app error; check env vars |
| **Pod in Pending** | `kubectl describe pod <pod>` | Not enough resources; scale cluster |
| **ImagePullBackOff** | Wrong image name or registry auth | Fix image tag; add `imagePullSecrets` |
| **Service not reachable** | `kubectl get endpoints <svc>` | Check selector labels match pod labels |
| **HPA not scaling** | `kubectl describe hpa` | Install metrics-server |

---

## 18. Useful Commands

```powershell
# ── Cluster ──
kubectl cluster-info
kubectl get nodes
kubectl top nodes

# ── Pods ──
kubectl get pods -n billing
kubectl describe pod <name> -n billing
kubectl logs <pod> -n billing -f
kubectl exec -it <pod> -n billing -- sh
kubectl top pods -n billing

# ── Deployments ──
kubectl get deployments -n billing
kubectl rollout status deployment/catalog-api -n billing
kubectl rollout restart deployment/catalog-api -n billing
kubectl rollout undo deployment/catalog-api -n billing
kubectl scale deployment/catalog-api --replicas=3 -n billing

# ── Services ──
kubectl get svc -n billing
kubectl port-forward svc/gateway 5000:80 -n billing

# ── Debugging ──
kubectl get events -n billing --sort-by='.lastTimestamp'
kubectl describe pod <pod> -n billing
kubectl get pods -n billing -o wide  # Show node placement

# ── Config ──
kubectl get configmaps -n billing
kubectl get secrets -n billing
kubectl get hpa -n billing
```

---

## 19. References

| Resource | URL |
|---|---|
| **Kubernetes Docs** | https://kubernetes.io/docs |
| **kubectl Cheat Sheet** | https://kubernetes.io/docs/reference/kubectl/cheatsheet |
| **Helm** | https://helm.sh/docs |
| **AKS Docs** | https://learn.microsoft.com/azure/aks |
| **EKS Docs** | https://docs.aws.amazon.com/eks |
| **Lens Dashboard** | https://k8slens.dev |
