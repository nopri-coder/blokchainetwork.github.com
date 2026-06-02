# Production-Ready REST API for ISP Billing System

![Build Status](https://github.com/nopri-coder/blokchainetwork.github.com/actions/workflows/ci-cd.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🚀 Overview

**Botwagenone API** is a production-ready REST API for ISP billing system management. Built with **Clean Architecture** principles, it's designed to be cloud-agnostic and deployable across multiple platforms.

### Key Features

✅ **Cloud-Agnostic Architecture**
- Deploy on Cloudflare Workers, Docker, VPS, or Kubernetes
- Minimal changes needed when migrating between platforms

✅ **Clean Architecture**
- Separation of concerns (Controllers, Services, Repositories)
- Dependency Injection for easy testing and swapping providers
- Business logic independent from infrastructure

✅ **Multiple Database Support**
- PostgreSQL (Production)
- Cloudflare D1 (Workers)
- Abstraction layer for easy migration

✅ **Multiple Cache Providers**
- Redis (Production)
- Cloudflare KV (Workers)
- In-Memory (Development)

✅ **Security-First Design**
- API Key Authentication
- CORS Configuration
- Rate Limiting
- Security Headers (OWASP)
- Input Validation & Output Sanitization
- Request ID Tracing

✅ **Observability**
- Structured Logging (Pino)
- Request Tracing
- Correlation IDs
- Health Check Endpoints

✅ **API Versioning**
- `/api/v1` ready
- Structure for `/api/v2` prepared

---

## 📋 Table of Contents

- [Installation](#installation)
- [Project Structure](#project-structure)
- [Deployment Options](#deployment-options)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Testing](#testing)
- [CI/CD](#cicd)
- [Troubleshooting](#troubleshooting)
- [Security](#security)
- [Scaling](#scaling)

---

## 🔧 Installation

### Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL 16+ (for VPS deployment)
- Redis 7+ (for caching)

### Quick Start

```bash
# Clone repository
git clone https://github.com/nopri-coder/blokchainetwork.github.com.git
cd blokchainetwork.github.com

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Development
npm run dev

# Health check
curl http://localhost:8080/health
```

---

## 📂 Project Structure

```
.
├── src/
│   ├── index.ts                 # Application entry point
│   ├── controllers/             # HTTP request handlers
│   │   └── billing.ts
│   ├── services/                # Business logic
│   │   ├── billing.ts
│   │   └── logger.ts
│   ├── repositories/            # Data access layer
│   │   ├── customer.ts
│   │   └── billingLog.ts
│   ├── providers/               # Infrastructure adapters
│   │   ├── database.ts          # PostgreSQL, D1
│   │   └── cache.ts             # Redis, KV, In-Memory
│   ├── middleware/              # Express-like middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   ├── requestId.ts
│   │   └── securityHeaders.ts
│   ├── routes/                  # Route handlers
│   │   └── index.ts
│   ├── validators/              # Input validation schemas
│   │   └── billing.ts
│   └── utils/                   # Utility functions
│
├── database/
│   ├── schema.sql               # PostgreSQL schema
│   └── seeds.sql                # Test data
│
├── tests/
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
│
├── infrastructure/
│   ├── cloudflare/              # Cloudflare Workers config
│   ├── docker/                  # Docker setup
│   ├── nginx/                   # Nginx reverse proxy
│   ├── kubernetes/              # Kubernetes manifests
│   └── github-actions/          # CI/CD workflows
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # GitHub Actions pipeline
│
├── openapi.json                 # OpenAPI 3.0 specification
├── wrangler.toml                # Cloudflare Workers config
├── tsconfig.json                # TypeScript config
├── package.json                 # Dependencies
├── Dockerfile                   # Container image
├── docker-compose.yml           # Full stack compose
└── README.md                    # This file
```

---

## 🌍 Deployment Options

### Option 1: Cloudflare Workers (Recommended for Serverless)

**Fastest deployment, auto-scaling, global edge network**

```bash
# Setup Wrangler
npm install -g wrangler
wrangler login

# Deploy
npm run deploy:worker
```

**Final URL:** `https://botwagenone.workers.dev/api/v1/kirim-tagihan-isp`

**Configuration:** `wrangler.toml`

**Advantages:**
- Instant global deployment
- No server management
- Included DDoS protection
- Free tier available

**Limitations:**
- CPU time limits (50ms)
- No long-running processes
- Need D1 for database

---

### Option 2: Docker Container (Recommended for Testing)

**Quick local testing, consistent environments**

```bash
# Build image
docker build -t botwagenone-api:latest .

# Run with compose
docker-compose up -d

# Verify
curl http://localhost:8080/health
```

**Access:**
- API: `http://localhost:8080`
- Nginx: `http://localhost:80`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

**Configuration:** `docker-compose.yml`

---

### Option 3: VPS Ubuntu 24.04 + Docker + Nginx

**Production-grade, full control, high performance**

#### Prerequisites
```bash
# SSH into VPS
ssh user@your-vps-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install -y nginx certbot python3-certbot-nginx
```

#### Deployment
```bash
# Clone repository
cd /opt
sudo git clone https://github.com/nopri-coder/blokchainetwork.github.com.git
cd blokchainetwork.github.com

# Setup environment
sudo cp .env.example .env
sudo nano .env  # Edit with production values

# Start services
sudo docker-compose up -d

# Setup SSL
sudo certbot certonly --nginx -d api.botwagenone.com

# Configure Nginx
sudo cp infrastructure/nginx/conf.d/api.conf /etc/nginx/conf.d/
sudo systemctl restart nginx

# Verify
curl https://api.botwagenone.com/health
```

**Configuration Files:**
- `infrastructure/nginx/nginx.conf`
- `infrastructure/nginx/conf.d/api.conf`
- `docker-compose.yml`

---

### Option 4: Kubernetes (Enterprise)

**Auto-scaling, high availability, production-grade**

#### Prerequisites
```bash
# Kubernetes cluster (GKE, EKS, AKS, or local kind)
# kubectl installed and configured

# Install Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Install Cert-Manager for SSL
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
```

#### Deployment
```bash
# Create namespace
kubectl create namespace botwagenone

# Create secrets
kubectl create secret generic api-secrets \
  --from-literal=api-key='your-api-key' \
  -n botwagenone

kubectl create secret generic db-secrets \
  --from-literal=username='postgres' \
  --from-literal=password='secure-password' \
  -n botwagenone

# Apply manifests
kubectl apply -f infrastructure/kubernetes/

# Verify
kubectl get pods -n botwagenone
kubectl get ingress -n botwagenone

# Check status
kubectl rollout status deployment/botwagenone-api -n botwagenone
```

**Configuration Files:**
- `infrastructure/kubernetes/deployment.yaml`
- `infrastructure/kubernetes/service.yaml`
- `infrastructure/kubernetes/ingress.yaml`

---

## 📡 API Documentation

### Base URLs

| Environment | URL |
|---|---|
| Cloudflare Workers | `https://botwagenone.workers.dev` |
| VPS Production | `https://api.botwagenone.com` |
| Local Development | `http://localhost:8080` |

### Authentication

All endpoints require `X-API-Key` header:

```bash
curl -H "X-API-Key: your-api-key" https://api.botwagenone.com/health
```

### Endpoints

#### System Endpoints

**GET /health**
```bash
curl https://api.botwagenone.com/health

# Response
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-12-02T10:30:00Z",
    "version": "1.0.0"
  },
  "message": "Service is running"
}
```

**GET /version**
```bash
curl https://api.botwagenone.com/version

# Response
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "environment": "production"
  }
}
```

#### Billing Endpoints

**POST /api/v1/kirim-tagihan-isp**

Send invoice to customer.

```bash
curl -X POST https://api.botwagenone.com/api/v1/kirim-tagihan-isp \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "550e8400-e29b-41d4-a716-446655440000",
    "invoiceNumber": "INV-2024-001",
    "amount": 10000000,
    "dueDate": "2024-12-31T23:59:59Z",
    "description": "Monthly ISP Service",
    "metadata": {
      "serviceType": "fiber",
      "bandwidth": "100Mbps"
    }
  }'
```

**GET /api/v1/tagihan/:invoiceNumber**

Get invoice details.

```bash
curl https://api.botwagenone.com/api/v1/tagihan/INV-2024-001 \
  -H "X-API-Key: your-api-key"
```

**GET /api/v1/pelanggan/:customerId/riwayat**

Get customer billing history.

```bash
curl "https://api.botwagenone.com/api/v1/pelanggan/550e8400-e29b-41d4-a716-446655440000/riwayat?limit=10&offset=0" \
  -H "X-API-Key: your-api-key"
```

### OpenAPI Documentation

Full API specification available at: `openapi.json`

View with Swagger UI: https://editor.swagger.io/

---

## ⚙️ Configuration

Create `.env` file in project root:

```bash
# Application
NODE_ENV=production
LOG_LEVEL=info
API_KEY=your-secure-api-key-here

# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=botwagenone

# Cache
REDIS_HOST=redis
REDIS_PORT=6379

# CORS
CORS_ORIGINS=https://api.botwagenone.com
```

---

## 🧪 Testing

```bash
# All tests
npm run test

# Coverage report
npm run test:coverage

# Unit tests
npm run test -- tests/unit/

# Integration tests
npm run test -- tests/integration/
```

---

## 🔄 CI/CD

GitHub Actions automatically:
1. Lints code
2. Runs tests
3. Scans for vulnerabilities
4. Builds Docker image
5. Deploys to Cloudflare Workers
6. Deploys to Kubernetes

See `.github/workflows/ci-cd.yml`

---

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [API Specification](./openapi.json)
- [Troubleshooting Guide](./DEPLOYMENT_GUIDE.md#troubleshooting)

---

## 📝 License

MIT License - See [LICENSE](./LICENSE) file

---

**Version:** 1.0.0  
**Last Updated:** December 2024
