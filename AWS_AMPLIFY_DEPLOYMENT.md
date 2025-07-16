# AWS Amplify Deployment Guide

## Quick Start (5-10 minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Amplify deployment"
git push origin main
```

### Step 2: Deploy with Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **"New app"** → **"Host web app"**
3. Choose **GitHub** and authorize AWS Amplify
4. Select your repository and branch
5. Amplify will auto-detect Next.js and show the build settings
6. Click **"Save and deploy"**

### Step 3: Configure Environment Variables

In Amplify Console:
1. Go to **App settings** → **Environment variables**
2. Add these variables:

```
DATABASE_URL=your_database_url
NEXTAUTH_URL=https://your-amplify-url.amplifyapp.com
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=business-portal-assets-533267331808
RESEND_API_KEY=re_...
```

### Step 4: Update Build Settings (if needed)

Amplify should auto-detect from `amplify.yml`, but you can verify in:
**App settings** → **Build settings**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g bun
        - bun install
        - bunx prisma generate
    build:
      commands:
        - bun run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### Step 5: Custom Domain (Optional)

1. Go to **Domain management**
2. Add your custom domain
3. Amplify provides free SSL certificates

## Database Options

### Option 1: Neon (Recommended)
1. Create account at [neon.tech](https://neon.tech)
2. Create a new database
3. Copy the connection string to `DATABASE_URL`

### Option 2: AWS RDS
Use the existing RDS setup from the infrastructure script

### Option 3: Supabase
Free PostgreSQL database at [supabase.com](https://supabase.com)

## Post-Deployment

### Run Database Migrations
After setting up your database:
```bash
DATABASE_URL="your_connection_string" bunx prisma migrate deploy
```

### Update Stripe Webhook
1. Go to Stripe Dashboard
2. Add webhook endpoint: `https://your-app.amplifyapp.com/api/webhooks/stripe`
3. Update `STRIPE_WEBHOOK_SECRET` in Amplify

## Monitoring

- **Amplify Console**: View build logs and deployment status
- **CloudWatch**: Automatically set up for logs
- **Custom Domain**: Add in Domain Management section

## Cost

- ~$0.01 per build minute
- ~$0.15 per GB served
- Free tier includes 1000 build minutes/month

## Troubleshooting

### Build Fails
- Check build logs in Amplify Console
- Ensure all environment variables are set
- Verify `amplify.yml` is in root directory

### Database Connection Issues
- Ensure DATABASE_URL is properly formatted
- Check if database allows connections from Amplify IPs
- For Neon/Supabase, connection pooling may be required

### Image Upload Issues
- Verify S3 bucket permissions
- Check AWS credentials in environment variables
- Ensure CORS is configured on S3 bucket