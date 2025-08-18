# Deployment Guide

## SmartEDA Platform Deployment

This guide covers different deployment strategies for the SmartEDA Data Science Platform, from local development to production cloud deployment.

---

## Table of Contents

1. [Quick Start (Demo Mode)](#quick-start-demo-mode)
2. [Local Development Setup](#local-development-setup)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment (AWS)](#cloud-deployment-aws)
5. [Cloud Deployment (Azure)](#cloud-deployment-azure)
6. [Production Configuration](#production-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [Backup & Recovery](#backup--recovery)
9. [Troubleshooting](#troubleshooting)

---

## Quick Start (Demo Mode)

The platform includes a comprehensive demo mode that works without backend setup.

### Prerequisites
- Node.js 16+ and npm
- No backend or database required

### Steps

```bash
# Clone repository
git clone https://github.com/dwinsi/SmartEDA-Data-Science-Platform.git
cd SmartEDA-Data-Science-Platform

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:3000
```

### Demo Features
- ✅ Realistic dataset generation (1,000 employee records)
- ✅ Complete EDA analysis with real statistics
- ✅ Pre-trained ML models with performance metrics
- ✅ Interactive dashboards and visualizations
- ✅ No data upload or backend required

---

## Local Development Setup

Full platform setup with backend and database for development.

### Prerequisites

```bash
# Check versions
node --version    # >= 16.0.0
npm --version     # >= 8.0.0
python --version  # >= 3.11.0
pip --version     # >= 23.0.0
```

### MongoDB Installation

#### Windows
```powershell
# Download from MongoDB website or use Chocolatey
choco install mongodb

# Start MongoDB service
net start MongoDB
```

#### macOS
```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian)
```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your settings

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd smarteda-backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Configure environment variables
# Edit .env file with your settings

# Start backend server
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Environment Configuration

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_UPLOAD_MAX_SIZE=10485760
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_BACKEND_FEATURES=true
```

#### Backend (.env)
```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=smarteda_dev
API_HOST=127.0.0.1
API_PORT=8000
DEBUG=true
MAX_UPLOAD_SIZE=10485760
UPLOAD_DIRECTORY=./uploads
CORS_ORIGINS=["http://localhost:3000"]
SECRET_KEY=dev-secret-key-change-in-production
```

### Verification

```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/health

# Test MongoDB connection
python -c "import pymongo; client = pymongo.MongoClient('mongodb://localhost:27017'); print('Connected:', client.admin.command('ping'))"
```

---

## Docker Deployment

Containerized deployment using Docker and Docker Compose.

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

### Docker Files

#### Frontend Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Create non-root user
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
    networks:
      - smarteda-network
    restart: unless-stopped

  backend:
    build:
      context: ./smarteda-backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URL=mongodb://mongodb:27017
      - DATABASE_NAME=smarteda_db
      - DEBUG=false
      - CORS_ORIGINS=["http://localhost:3000"]
    volumes:
      - uploads_data:/app/uploads
    networks:
      - smarteda-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_DATABASE=smarteda_db
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    volumes:
      - mongodb_data:/data/db
      - ./mongodb-init:/docker-entrypoint-initdb.d
    networks:
      - smarteda-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - smarteda-network
    restart: unless-stopped

volumes:
  mongodb_data:
    driver: local
  uploads_data:
    driver: local

networks:
  smarteda-network:
    driver: bridge
```

### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:80;
    }
    
    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;
        server_name localhost;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Handle file uploads
            client_max_body_size 50M;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Health checks
        location /health {
            proxy_pass http://backend/health;
            access_log off;
        }
    }
}
```

### Deployment Commands

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Scale backend service
docker-compose up -d --scale backend=3

# Update services
docker-compose pull
docker-compose up -d

# Stop services
docker-compose down

# Remove volumes (careful - this deletes data)
docker-compose down -v
```

### Docker Production Optimizations

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  frontend:
    build: 
      context: .
      dockerfile: Dockerfile.frontend
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    restart: always

  backend:
    build:
      context: ./smarteda-backend
      dockerfile: Dockerfile
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    restart: always

  mongodb:
    image: mongo:6.0
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
    restart: always
    command: mongod --auth --replSet rs0
```

---

## Cloud Deployment (AWS)

Production deployment on Amazon Web Services.

### Architecture Overview

```
Internet Gateway
    │
Application Load Balancer (ALB)
    │
┌─────────────────┬─────────────────┐
│   ECS Service   │   ECS Service   │
│   (Frontend)    │   (Backend)     │
└─────────────────┴─────────────────┘
           │
    DocumentDB (MongoDB)
           │
        S3 Bucket
    (File Storage)
```

### Infrastructure as Code (Terraform)

#### Provider Configuration
```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "smarteda"
}
```

#### VPC and Networking
```hcl
# vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project_name}-private-subnet-${count.index + 1}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}
```

#### Application Load Balancer
```hcl
# alb.tf
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

resource "aws_lb_target_group" "frontend" {
  name     = "${var.project_name}-frontend-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/"
    matcher             = "200"
  }
}

resource "aws_lb_target_group" "backend" {
  name     = "${var.project_name}-backend-tg"
  port     = 8000
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }
}

resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}
```

#### ECS Cluster and Services
```hcl
# ecs.tf
resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_execution_role.arn

  container_definitions = jsonencode([
    {
      name  = "frontend"
      image = "${aws_ecr_repository.frontend.repository_url}:latest"
      
      portMappings = [
        {
          containerPort = 80
          protocol      = "tcp"
        }
      ]
      
      environment = [
        {
          name  = "VITE_API_BASE_URL"
          value = "https://${aws_lb.main.dns_name}"
        }
      ]
      
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.frontend.name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.private[*].id
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.frontend.arn
    container_name   = "frontend"
    container_port   = 80
  }

  depends_on = [aws_lb_listener.main]
}
```

#### RDS/DocumentDB Database
```hcl
# database.tf
resource "aws_docdb_cluster" "main" {
  cluster_identifier      = "${var.project_name}-docdb"
  engine                  = "docdb"
  master_username         = "admin"
  master_password         = var.db_password
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
  
  db_subnet_group_name   = aws_docdb_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.docdb.id]
}

resource "aws_docdb_cluster_instance" "main" {
  count              = 2
  identifier         = "${var.project_name}-docdb-${count.index}"
  cluster_identifier = aws_docdb_cluster.main.id
  instance_class     = "db.t3.medium"
}

resource "aws_docdb_subnet_group" "main" {
  name       = "${var.project_name}-docdb-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-docdb-subnet-group"
  }
}
```

#### S3 Storage
```hcl
# s3.tf
resource "aws_s3_bucket" "uploads" {
  bucket = "${var.project_name}-uploads-${random_id.bucket_suffix.hex}"
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_encryption" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "random_id" "bucket_suffix" {
  byte_length = 8
}
```

### Deployment Scripts

#### Build and Deploy Script
```bash
#!/bin/bash
# deploy.sh

set -e

# Configuration
AWS_REGION="us-west-2"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPOSITORY_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/smarteda-frontend"
ECR_REPOSITORY_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/smarteda-backend"

echo "Starting deployment process..."

# Build and push frontend image
echo "Building frontend image..."
docker build -t smarteda-frontend -f Dockerfile.frontend .
docker tag smarteda-frontend:latest $ECR_REPOSITORY_FRONTEND:latest

echo "Pushing frontend image to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_FRONTEND
docker push $ECR_REPOSITORY_FRONTEND:latest

# Build and push backend image
echo "Building backend image..."
docker build -t smarteda-backend -f smarteda-backend/Dockerfile ./smarteda-backend
docker tag smarteda-backend:latest $ECR_REPOSITORY_BACKEND:latest

echo "Pushing backend image to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPOSITORY_BACKEND
docker push $ECR_REPOSITORY_BACKEND:latest

# Update ECS services
echo "Updating ECS services..."
aws ecs update-service --cluster smarteda-cluster --service smarteda-frontend --force-new-deployment
aws ecs update-service --cluster smarteda-cluster --service smarteda-backend --force-new-deployment

echo "Deployment completed successfully!"
```

#### Environment-specific Configurations

**Production (terraform.tfvars)**
```hcl
aws_region = "us-west-2"
environment = "production"
project_name = "smarteda"

# Database
db_password = "secure-password-here"

# Scaling
frontend_desired_count = 3
backend_desired_count = 5
database_instance_class = "db.r5.large"

# Monitoring
enable_detailed_monitoring = true
log_retention_days = 30
```

**Staging (terraform-staging.tfvars)**
```hcl
aws_region = "us-west-2"
environment = "staging"
project_name = "smarteda-staging"

# Database
db_password = "staging-password"

# Scaling
frontend_desired_count = 1
backend_desired_count = 2
database_instance_class = "db.t3.medium"

# Monitoring
enable_detailed_monitoring = false
log_retention_days = 7
```

---

## Cloud Deployment (Azure)

Alternative cloud deployment using Microsoft Azure.

### Architecture Overview

```
Azure Front Door
    │
Application Gateway
    │
┌─────────────────┬─────────────────┐
│ Container Apps  │ Container Apps  │
│ (Frontend)      │ (Backend)       │
└─────────────────┴─────────────────┘
           │
    Cosmos DB (MongoDB API)
           │
    Azure Blob Storage
```

### Azure Resource Manager (ARM) Template

```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "parameters": {
    "appName": {
      "type": "string",
      "defaultValue": "smarteda"
    },
    "environment": {
      "type": "string",
      "defaultValue": "production"
    },
    "location": {
      "type": "string",
      "defaultValue": "[resourceGroup().location]"
    }
  },
  "variables": {
    "containerAppEnvName": "[concat(parameters('appName'), '-', parameters('environment'), '-env')]",
    "frontendAppName": "[concat(parameters('appName'), '-frontend')]",
    "backendAppName": "[concat(parameters('appName'), '-backend')]",
    "cosmosDbAccountName": "[concat(parameters('appName'), '-cosmos')]",
    "storageAccountName": "[concat(parameters('appName'), 'storage')]"
  },
  "resources": [
    {
      "type": "Microsoft.App/managedEnvironments",
      "apiVersion": "2022-03-01",
      "name": "[variables('containerAppEnvName')]",
      "location": "[parameters('location')]",
      "properties": {
        "zoneRedundant": true
      }
    }
  ]
}
```

### Azure CLI Deployment

```bash
#!/bin/bash
# azure-deploy.sh

# Configuration
RESOURCE_GROUP="smarteda-rg"
LOCATION="westus2"
APP_NAME="smarteda"
ENVIRONMENT="production"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy ARM template
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file azure-template.json \
  --parameters appName=$APP_NAME environment=$ENVIRONMENT

# Build and deploy container apps
az containerapp up \
  --name smarteda-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment smarteda-env \
  --source . \
  --target-port 80 \
  --ingress external

az containerapp up \
  --name smarteda-backend \
  --resource-group $RESOURCE_GROUP \
  --environment smarteda-env \
  --source ./smarteda-backend \
  --target-port 8000 \
  --ingress external
```

---

## Production Configuration

### Security Hardening

#### Frontend Security Headers
```nginx
# nginx.conf security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

#### Backend Security Configuration
```python
# app/config.py
class SecurityConfig:
    # CORS settings
    CORS_ORIGINS = [
        "https://smarteda.com",
        "https://www.smarteda.com"
    ]
    
    # File upload restrictions
    MAX_UPLOAD_SIZE = 52428800  # 50MB
    ALLOWED_EXTENSIONS = {'.csv', '.xlsx', '.json'}
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE = 60
    RATE_LIMIT_PER_HOUR = 1000
    
    # Session security
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
```

#### Database Security
```python
# Database connection with authentication
MONGODB_URL = (
    "mongodb://username:password@"
    "mongodb-host:27017/database_name?"
    "authSource=admin&ssl=true&replicaSet=rs0"
)

# Connection options
MONGODB_OPTIONS = {
    "maxPoolSize": 100,
    "minPoolSize": 10,
    "maxIdleTimeMS": 30000,
    "serverSelectionTimeoutMS": 5000,
    "socketTimeoutMS": 45000,
}
```

### Environment Variables

#### Production Environment Variables
```bash
# Frontend (.env.production)
VITE_API_BASE_URL=https://api.smarteda.com
VITE_UPLOAD_MAX_SIZE=52428800
VITE_ENABLE_DEMO_MODE=true
VITE_ENABLE_BACKEND_FEATURES=true
VITE_ANALYTICS_ID=GA_TRACKING_ID
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_ENVIRONMENT=production

# Backend (.env.production)
MONGODB_URL=mongodb://prod-user:secure-password@prod-cluster:27017/smarteda_prod
DATABASE_NAME=smarteda_prod
DEBUG=false
API_HOST=0.0.0.0
API_PORT=8000
CORS_ORIGINS=["https://smarteda.com","https://www.smarteda.com"]
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIRECTORY=/app/uploads
SECRET_KEY=super-secure-secret-key-here
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=INFO
```

### SSL/TLS Configuration

#### Let's Encrypt SSL with Certbot
```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d smarteda.com -d www.smarteda.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name smarteda.com www.smarteda.com;

    ssl_certificate /etc/letsencrypt/live/smarteda.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/smarteda.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Application configuration
    location / {
        proxy_pass http://frontend;
        # ... proxy settings
    }

    location /api/ {
        proxy_pass http://backend;
        # ... proxy settings
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name smarteda.com www.smarteda.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Monitoring & Logging

### Application Monitoring

#### Prometheus Metrics
```python
# app/monitoring.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest

# Metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint', 'status'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_CONNECTIONS = Gauge('active_connections', 'Active database connections')
UPLOAD_SIZE = Histogram('file_upload_size_bytes', 'File upload sizes')

@app.middleware("http")
async def metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_DURATION.observe(duration)
    return response

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "SmartEDA Platform Monitoring",
    "panels": [
      {
        "title": "Request Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "Requests/sec"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"4..|5..\"}[5m])",
            "legendFormat": "Errors/sec"
          }
        ]
      }
    ]
  }
}
```

### Centralized Logging

#### ELK Stack Configuration
```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200

volumes:
  elasticsearch_data:
```

#### Structured Logging
```python
# app/logging_config.py
import structlog
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.dev.JSONRenderer(),
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "/var/log/smarteda/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "json",
        },
    },
    "loggers": {
        "smarteda": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

### Health Checks

#### Application Health Checks
```python
# app/health.py
from fastapi import APIRouter, Depends
from app.database.connection import get_database
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0"
    }

@router.get("/health/detailed")
async def detailed_health_check(db = Depends(get_database)):
    """Detailed health check with dependency status"""
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "services": {}
    }
    
    # Database health
    try:
        await db.admin.command('ping')
        health_status["services"]["database"] = {
            "status": "healthy",
            "response_time": 0.05
        }
    except Exception as e:
        health_status["services"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }
        health_status["status"] = "degraded"
    
    # System resources
    health_status["system"] = {
        "cpu_percent": psutil.cpu_percent(),
        "memory_percent": psutil.virtual_memory().percent,
        "disk_percent": psutil.disk_usage('/').percent
    }
    
    return health_status
```

---

## Backup & Recovery

### Database Backup Strategy

#### Automated MongoDB Backups
```bash
#!/bin/bash
# backup-mongodb.sh

BACKUP_DIR="/backups/mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="smarteda_backup_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --host localhost:27017 \
          --db smarteda_prod \
          --out $BACKUP_DIR/$BACKUP_NAME

# Compress backup
tar -czf $BACKUP_DIR/$BACKUP_NAME.tar.gz -C $BACKUP_DIR $BACKUP_NAME

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$BACKUP_NAME

# Upload to S3 (if using AWS)
aws s3 cp $BACKUP_DIR/$BACKUP_NAME.tar.gz s3://smarteda-backups/mongodb/

# Clean up local backups older than 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_NAME.tar.gz"
```

#### Backup Automation with Cron
```bash
# Add to crontab
crontab -e

# Daily backup at 2 AM
0 2 * * * /opt/smarteda/scripts/backup-mongodb.sh

# Weekly full backup on Sundays at 1 AM
0 1 * * 0 /opt/smarteda/scripts/backup-full.sh
```

### File Storage Backup

#### S3 Bucket Versioning and Lifecycle
```hcl
# s3-backup.tf
resource "aws_s3_bucket_versioning" "uploads_versioning" {
  bucket = aws_s3_bucket.uploads.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads_lifecycle" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "delete_old_versions"
    status = "Enabled"

    noncurrent_version_expiration {
      noncurrent_days = 30
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}
```

### Disaster Recovery Plan

#### Recovery Procedures
```bash
#!/bin/bash
# restore-mongodb.sh

BACKUP_FILE="$1"
TARGET_DB="smarteda_prod"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

# Extract backup
TEMP_DIR="/tmp/mongodb_restore_$(date +%s)"
mkdir -p $TEMP_DIR
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restore database
mongorestore --host localhost:27017 \
             --db $TARGET_DB \
             --drop \
             $TEMP_DIR/*/smarteda_prod

# Clean up
rm -rf $TEMP_DIR

echo "Database restored from $BACKUP_FILE"
```

#### Recovery Testing
```bash
#!/bin/bash
# test-recovery.sh

# Test database backup and restore
echo "Testing backup and restore process..."

# Create test backup
./backup-mongodb.sh

# Get latest backup
LATEST_BACKUP=$(ls -t /backups/mongodb/*.tar.gz | head -1)

# Restore to test database
./restore-mongodb.sh $LATEST_BACKUP smarteda_test

# Verify restore
mongo smarteda_test --eval "db.datasets.count()" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backup and restore test successful"
else
    echo "❌ Backup and restore test failed"
    exit 1
fi

# Clean up test database
mongo smarteda_test --eval "db.dropDatabase()"
```

---

## Troubleshooting

### Common Production Issues

#### High Memory Usage
```bash
# Monitor memory usage
free -h
top -p $(pgrep -f "uvicorn")

# Check for memory leaks
ps aux --sort=-%mem | head -10

# Restart services if needed
docker-compose restart backend
```

#### Database Connection Issues
```python
# Connection pool monitoring
async def check_connection_pool():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
    server_status = await client.admin.command("serverStatus")
    connections = server_status.get("connections", {})
    
    print(f"Current connections: {connections.get('current', 0)}")
    print(f"Available connections: {connections.get('available', 0)}")
    print(f"Total created: {connections.get('totalCreated', 0)}")
```

#### Performance Issues
```bash
# Check system resources
htop
iotop
netstat -tulpn

# Analyze slow queries
# MongoDB
db.setProfilingLevel(2, { slowms: 100 })
db.system.profile.find().sort({ ts: -1 }).limit(5)

# Check application metrics
curl http://localhost:8000/metrics | grep http_request_duration
```

### Debugging Tools

#### Container Debugging
```bash
# Check container logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Execute commands in container
docker-compose exec backend bash
docker-compose exec mongodb mongo

# Check container resources
docker stats

# Inspect container
docker inspect smarteda_backend_1
```

#### Network Debugging
```bash
# Check port connectivity
telnet localhost 8000
curl -I http://localhost:8000/health

# Check DNS resolution
nslookup smarteda.com
dig smarteda.com

# Monitor network traffic
sudo tcpdump -i any port 8000
```

### Log Analysis

#### Error Pattern Detection
```bash
# Find errors in logs
grep -i error /var/log/smarteda/app.log | tail -20

# Count error types
grep -i error /var/log/smarteda/app.log | awk '{print $5}' | sort | uniq -c

# Monitor real-time errors
tail -f /var/log/smarteda/app.log | grep -i error
```

#### Performance Analysis
```bash
# Analyze request patterns
awk '{print $7}' /var/log/nginx/access.log | sort | uniq -c | sort -nr

# Find slow requests
awk '$10 > 5.0 {print $0}' /var/log/nginx/access.log

# Generate performance report
python scripts/analyze_logs.py --input /var/log/nginx/access.log --output performance_report.html
```

---

This deployment guide provides comprehensive instructions for deploying the SmartEDA platform in various environments, from local development to production cloud infrastructure. Choose the deployment method that best fits your needs and scale requirements.
