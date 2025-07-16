e# AWS Deployment Guide for Business Portal

## Overview
This guide covers deploying the Next.js Business Portal application to AWS using various services for a production-ready setup.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│   CloudFront   │────▶│ ALB/EC2 or   │────▶│    RDS         │
│   (CDN)        │     │ App Runner   │     │  (PostgreSQL)  │
└─────────────────┘     └──────────────┘     └─────────────────┘
         │                      │                      ▲
         ▼                      ▼                      │
┌─────────────────┐     ┌──────────────┐             │
│   S3 Bucket    │     │   ElastiCache │─────────────┘
│  (Static/Images)│     │   (Redis)     │
└─────────────────┘     └──────────────┘
```

## Deployment Options

### Option 1: AWS App Runner (Recommended for Simplicity)
- **Pros**: Fully managed, auto-scaling, built-in SSL
- **Cons**: Higher cost at scale
- **Best for**: Quick deployment, minimal DevOps

### Option 2: EC2 with Application Load Balancer
- **Pros**: Full control, cost-effective at scale
- **Cons**: More setup and maintenance
- **Best for**: Large-scale applications

### Option 3: AWS Amplify
- **Pros**: Git-based deployment, built for Next.js
- **Cons**: Limited customization
- **Best for**: Simple deployments

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Domain name (optional but recommended)
4. SSL Certificate (AWS Certificate Manager)

## Step-by-Step Deployment Guide

### 1. Database Setup (RDS PostgreSQL)

```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier business-portal-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxx \
  --backup-retention-period 7 \
  --publicly-accessible false
```

### 2. S3 Bucket Setup (Already Configured)

Your S3 bucket is already set up. Ensure these environment variables are set:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `S3_BUCKET_NAME`

### 3. ElastiCache Redis Setup (Optional)

```bash
# Create Redis cluster for session management
aws elasticache create-cache-cluster \
  --cache-cluster-id business-portal-cache \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

### 4. Environment Variables Setup

Create a `.env.production` file:

```env
# Database
DATABASE_URL="postgresql://postgres:PASSWORD@your-rds-endpoint:5432/businessportal"

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# AWS S3 (already configured)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-bucket"

# Redis (if using ElastiCache)
REDIS_URL="redis://your-elasticache-endpoint:6379"

# Resend (Email)
RESEND_API_KEY="your-resend-key"
```

## Deployment with AWS App Runner

### 1. Create apprunner.yaml

```yaml
version: 1.0
runtime: nodejs16
build:
  commands:
    build:
      - npm install -g bun
      - bun install
      - bunx prisma generate
      - bun run build
run:
  runtime-version: latest
  command: bun start
  network:
    port: 3000
    env: PORT
  env:
    - name: NODE_ENV
      value: production
```

### 2. Build Docker Image

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bunx prisma generate
RUN bun run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["bun", "server.js"]
```

### 3. Push to ECR

```bash
# Build and tag image
docker build -t business-portal .

# Create ECR repository
aws ecr create-repository --repository-name business-portal

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push
docker tag business-portal:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/business-portal:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/business-portal:latest
```

### 4. Create App Runner Service

```bash
aws apprunner create-service \
  --service-name "business-portal" \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/business-portal:latest",
      "ImageConfiguration": {
        "Port": "3000"
      },
      "ImageRepositoryType": "ECR"
    },
    "AutoDeploymentsEnabled": false
  }'
```

## Deployment with EC2 + ALB

### 1. Create Launch Template

```bash
# Create security groups
aws ec2 create-security-group --group-name business-portal-sg --description "Security group for business portal"

# Create launch template with user data
cat > user-data.sh << 'EOF'
#!/bin/bash
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Clone your repo or copy files
cd /home/ec2-user
git clone https://github.com/yourusername/business-portal.git
cd business-portal

# Install dependencies and build
bun install
bunx prisma generate
bun run build

# Start with PM2
npm install -g pm2
pm2 start "bun start" --name business-portal
pm2 startup
pm2 save
EOF
```

### 2. Create Auto Scaling Group

```bash
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name business-portal-asg \
  --launch-template LaunchTemplateName=business-portal-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:region:account-id:targetgroup/my-targets/50dc6c495c0c9188
```

## CloudFront CDN Setup

### 1. Create CloudFront Distribution

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-config.json
```

cloudfront-config.json:
```json
{
  "CallerReference": "business-portal-dist",
  "Comment": "Business Portal CDN",
  "Origins": {
    "Quantity": 2,
    "Items": [
      {
        "Id": "app-runner-origin",
        "DomainName": "your-app-runner-url.awsapprunner.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "https-only"
        }
      },
      {
        "Id": "s3-origin",
        "DomainName": "your-bucket.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": "origin-access-identity/cloudfront/ABCDEFG1234567"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "app-runner-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    },
    "CachedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true
  },
  "CacheBehaviors": {
    "Quantity": 1,
    "Items": [
      {
        "PathPattern": "/images/*",
        "TargetOriginId": "s3-origin",
        "ViewerProtocolPolicy": "redirect-to-https",
        "Compress": true
      }
    ]
  }
}
```

## Database Migration

```bash
# Run migrations on production database
DATABASE_URL="postgresql://..." bunx prisma migrate deploy

# Seed initial data if needed
DATABASE_URL="postgresql://..." bunx prisma db seed
```

## Monitoring and Logging

### 1. CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /aws/apprunner/business-portal

# Set up alarms
aws cloudwatch put-metric-alarm \
  --alarm-name business-portal-cpu \
  --alarm-description "CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/AppRunner \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 2. Application Monitoring

Add to your application:

```javascript
// lib/monitoring.js
import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const cloudwatch = new CloudWatchClient({ region: process.env.AWS_REGION });

export async function trackMetric(metricName, value, unit = "Count") {
  if (process.env.NODE_ENV === "production") {
    await cloudwatch.send(new PutMetricDataCommand({
      Namespace: "BusinessPortal",
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: unit,
        Timestamp: new Date()
      }]
    }));
  }
}
```

## Security Best Practices

1. **WAF Configuration**
```bash
# Create Web ACL
aws wafv2 create-web-acl \
  --name business-portal-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

2. **Secrets Manager**
```bash
# Store secrets
aws secretsmanager create-secret \
  --name business-portal/production \
  --secret-string file://secrets.json
```

3. **VPC Configuration**
- Place RDS in private subnets
- Use NAT Gateway for outbound traffic
- Configure Security Groups properly

## Cost Optimization

### Estimated Monthly Costs:
- **App Runner**: ~$50-100 (2 vCPU, 4GB RAM)
- **RDS**: ~$15-30 (db.t3.micro)
- **CloudFront**: ~$10-50 (depends on traffic)
- **S3**: ~$5-20 (storage + transfer)
- **Total**: ~$80-200/month for small to medium traffic

### Cost Saving Tips:
1. Use Reserved Instances for RDS
2. Enable S3 lifecycle policies
3. Use CloudFront caching aggressively
4. Schedule non-production resources

## Deployment Checklist

- [ ] Database migrated and seeded
- [ ] Environment variables configured
- [ ] SSL certificates provisioned
- [ ] Domain DNS configured
- [ ] CloudFront distribution active
- [ ] Health checks passing
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Security groups configured
- [ ] WAF rules active

## Troubleshooting

### Common Issues:

1. **Database Connection Issues**
   - Check security group rules
   - Verify DATABASE_URL format
   - Ensure RDS is in same VPC

2. **Image Upload Issues**
   - Verify S3 bucket permissions
   - Check CORS configuration
   - Validate IAM roles

3. **Performance Issues**
   - Enable CloudFront compression
   - Optimize Next.js build
   - Use Redis for sessions

## Next Steps

1. Set up CI/CD with GitHub Actions
2. Implement blue-green deployments
3. Add auto-scaling policies
4. Configure backup automation
5. Set up staging environment