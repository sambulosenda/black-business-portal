#!/bin/bash

# Script to update AWS Secrets Manager with production values

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SECRET_NAME="business-portal/production"
AWS_REGION=${AWS_REGION:-"us-east-1"}

echo -e "${YELLOW}Updating AWS Secrets Manager...${NC}"
echo -e "${YELLOW}This script will help you update your production secrets.${NC}"
echo

# Function to get current secret value
get_current_value() {
    local key=$1
    aws secretsmanager get-secret-value --secret-id $SECRET_NAME --region $AWS_REGION 2>/dev/null | jq -r ".SecretString | fromjson.$key" 2>/dev/null || echo ""
}

# Read current .env if exists
if [ -f .env ]; then
    echo -e "${GREEN}Found .env file. Using it as reference.${NC}"
    source .env
fi

# Prompt for values
echo -e "${YELLOW}Enter your production values (press Enter to keep current value):${NC}"
echo

# Database
current_db=$(get_current_value "DATABASE_URL")
echo -n "DATABASE_URL [$current_db]: "
read -r DATABASE_URL_INPUT
DATABASE_URL=${DATABASE_URL_INPUT:-$current_db}

# NextAuth
echo -n "NEXTAUTH_URL [https://yourdomain.com]: "
read -r NEXTAUTH_URL
NEXTAUTH_URL=${NEXTAUTH_URL:-"https://yourdomain.com"}

# Generate NextAuth secret if not provided
current_secret=$(get_current_value "NEXTAUTH_SECRET")
if [ -z "$current_secret" ] || [ "$current_secret" == "CHANGE_ME" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated new NEXTAUTH_SECRET${NC}"
else
    NEXTAUTH_SECRET=$current_secret
fi

# Stripe
echo -n "STRIPE_SECRET_KEY [sk_live_...]: "
read -r STRIPE_SECRET_KEY
STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY:-"sk_live_CHANGE_ME"}

echo -n "STRIPE_PUBLISHABLE_KEY [pk_live_...]: "
read -r STRIPE_PUBLISHABLE_KEY
STRIPE_PUBLISHABLE_KEY=${STRIPE_PUBLISHABLE_KEY:-"pk_live_CHANGE_ME"}

echo -n "STRIPE_WEBHOOK_SECRET [whsec_...]: "
read -r STRIPE_WEBHOOK_SECRET
STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-"whsec_CHANGE_ME"}

# AWS S3 (use existing bucket)
S3_BUCKET_NAME="business-portal-assets-533267331808"
echo -e "${GREEN}Using S3 bucket: $S3_BUCKET_NAME${NC}"

# Email
echo -n "RESEND_API_KEY [re_...]: "
read -r RESEND_API_KEY
RESEND_API_KEY=${RESEND_API_KEY:-"re_CHANGE_ME"}

echo -n "EMAIL_FROM [noreply@yourdomain.com]: "
read -r EMAIL_FROM
EMAIL_FROM=${EMAIL_FROM:-"noreply@yourdomain.com"}

# Create secrets JSON
cat > /tmp/secrets.json << EOF
{
    "DATABASE_URL": "$DATABASE_URL",
    "NEXTAUTH_URL": "$NEXTAUTH_URL",
    "NEXTAUTH_SECRET": "$NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY": "$STRIPE_SECRET_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY": "$STRIPE_PUBLISHABLE_KEY",
    "STRIPE_WEBHOOK_SECRET": "$STRIPE_WEBHOOK_SECRET",
    "AWS_ACCESS_KEY_ID": "$AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY": "$AWS_SECRET_ACCESS_KEY",
    "AWS_REGION": "$AWS_REGION",
    "AWS_S3_BUCKET_NAME": "$S3_BUCKET_NAME",
    "S3_BUCKET_NAME": "$S3_BUCKET_NAME",
    "RESEND_API_KEY": "$RESEND_API_KEY",
    "EMAIL_FROM": "$EMAIL_FROM",
    "ENABLE_EMAIL_SENDING": "true",
    "NODE_ENV": "production",
    "NEXT_PUBLIC_PLATFORM_NAME": "BeautyPortal",
    "NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE": "15"
}
EOF

# Update secrets
echo -e "\n${YELLOW}Updating secrets in AWS Secrets Manager...${NC}"
aws secretsmanager update-secret \
    --secret-id $SECRET_NAME \
    --secret-string file:///tmp/secrets.json \
    --region $AWS_REGION

rm /tmp/secrets.json

echo -e "${GREEN}✅ Secrets updated successfully!${NC}"
echo
echo -e "${YELLOW}Note: Make sure to:${NC}"
echo "1. Set up your database and update DATABASE_URL"
echo "2. Configure your Stripe webhook endpoint"
echo "3. Verify your domain in AWS SES for email sending"
echo "4. Update NEXTAUTH_URL with your actual domain"