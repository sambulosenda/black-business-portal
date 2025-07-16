#!/bin/bash

# AWS Infrastructure Setup Script
# This script helps set up the initial AWS infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}        Business Portal - AWS Infrastructure Setup             ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
PROJECT_NAME="business-portal"
ENVIRONMENT=${ENVIRONMENT:-"production"}

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ Region: $AWS_REGION${NC}"

# Function to create or get resource
create_or_get() {
    local resource_type=$1
    local resource_name=$2
    local create_command=$3
    local get_command=$4
    
    echo -e "\n${YELLOW}Setting up $resource_type: $resource_name${NC}"
    
    if eval "$get_command" &> /dev/null; then
        echo -e "${GREEN}✓ $resource_type already exists${NC}"
    else
        echo -e "Creating $resource_type..."
        eval "$create_command"
        echo -e "${GREEN}✓ $resource_type created${NC}"
    fi
}

# 1. Create S3 bucket for static assets
S3_BUCKET_NAME="${PROJECT_NAME}-assets-${AWS_ACCOUNT_ID}"
create_or_get "S3 bucket" "$S3_BUCKET_NAME" \
    "aws s3api create-bucket --bucket $S3_BUCKET_NAME --region $AWS_REGION $(if [ \"$AWS_REGION\" != \"us-east-1\" ]; then echo \"--create-bucket-configuration LocationConstraint=$AWS_REGION\"; fi)" \
    "aws s3api head-bucket --bucket $S3_BUCKET_NAME"

# Configure S3 bucket
echo -e "Configuring S3 bucket..."
aws s3api put-bucket-versioning --bucket $S3_BUCKET_NAME --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket $S3_BUCKET_NAME --server-side-encryption-configuration '{
    "Rules": [{
        "ApplyServerSideEncryptionByDefault": {
            "SSEAlgorithm": "AES256"
        }
    }]
}'

# 2. Create RDS subnet group
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --query "Vpcs[0].VpcId" --output text)
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --query "Subnets[*].SubnetId" --output text)

create_or_get "RDS subnet group" "${PROJECT_NAME}-db-subnet-group" \
    "aws rds create-db-subnet-group --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group --db-subnet-group-description \"Subnet group for ${PROJECT_NAME}\" --subnet-ids $SUBNET_IDS" \
    "aws rds describe-db-subnet-groups --db-subnet-group-name ${PROJECT_NAME}-db-subnet-group"

# 3. Create security groups
echo -e "\n${YELLOW}Setting up security groups...${NC}"

# Database security group
DB_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-db-sg" \
    --description "Security group for ${PROJECT_NAME} database" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${PROJECT_NAME}-db-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# App security group
APP_SG_ID=$(aws ec2 create-security-group \
    --group-name "${PROJECT_NAME}-app-sg" \
    --description "Security group for ${PROJECT_NAME} application" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text 2>/dev/null || \
    aws ec2 describe-security-groups \
    --filters "Name=group-name,Values=${PROJECT_NAME}-app-sg" \
    --query 'SecurityGroups[0].GroupId' \
    --output text)

# Configure security group rules
aws ec2 authorize-security-group-ingress --group-id $DB_SG_ID --protocol tcp --port 5432 --source-group $APP_SG_ID 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id $APP_SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 2>/dev/null || true
aws ec2 authorize-security-group-ingress --group-id $APP_SG_ID --protocol tcp --port 443 --cidr 0.0.0.0/0 2>/dev/null || true

echo -e "${GREEN}✓ Security groups configured${NC}"

# 4. Create RDS instance
echo -e "\n${YELLOW}Setting up RDS PostgreSQL database...${NC}"
read -p "Do you want to create an RDS instance? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter database master password: " -s DB_PASSWORD
    echo
    
    aws rds create-db-instance \
        --db-instance-identifier "${PROJECT_NAME}-db" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version 15.4 \
        --allocated-storage 20 \
        --storage-encrypted \
        --master-username postgres \
        --master-user-password "$DB_PASSWORD" \
        --vpc-security-group-ids $DB_SG_ID \
        --db-subnet-group-name "${PROJECT_NAME}-db-subnet-group" \
        --backup-retention-period 7 \
        --no-publicly-accessible \
        --storage-type gp3 \
        2>/dev/null || echo -e "${YELLOW}RDS instance may already exist${NC}"
fi

# 5. Create Secrets Manager secrets
echo -e "\n${YELLOW}Setting up Secrets Manager...${NC}"
SECRET_NAME="${PROJECT_NAME}/${ENVIRONMENT}"

if ! aws secretsmanager describe-secret --secret-id $SECRET_NAME &> /dev/null; then
    echo -e "Creating secrets in Secrets Manager..."
    
    # Generate random secrets
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > /tmp/secrets.json << EOF
{
    "DATABASE_URL": "postgresql://postgres:CHANGE_ME@${PROJECT_NAME}-db.xxxx.rds.amazonaws.com:5432/${PROJECT_NAME}",
    "NEXTAUTH_SECRET": "$NEXTAUTH_SECRET",
    "STRIPE_SECRET_KEY": "sk_live_CHANGE_ME",
    "STRIPE_PUBLISHABLE_KEY": "pk_live_CHANGE_ME",
    "STRIPE_WEBHOOK_SECRET": "whsec_CHANGE_ME",
    "AWS_ACCESS_KEY_ID": "CHANGE_ME",
    "AWS_SECRET_ACCESS_KEY": "CHANGE_ME",
    "AWS_REGION": "$AWS_REGION",
    "S3_BUCKET_NAME": "$S3_BUCKET_NAME"
}
EOF
    
    aws secretsmanager create-secret \
        --name $SECRET_NAME \
        --description "Secrets for ${PROJECT_NAME} ${ENVIRONMENT}" \
        --secret-string file:///tmp/secrets.json
    
    rm /tmp/secrets.json
    echo -e "${GREEN}✓ Secrets created (remember to update with actual values)${NC}"
else
    echo -e "${GREEN}✓ Secrets already exist${NC}"
fi

# 6. Create ECR repository
echo -e "\n${YELLOW}Setting up ECR repository...${NC}"
create_or_get "ECR repository" $PROJECT_NAME \
    "aws ecr create-repository --repository-name $PROJECT_NAME --image-scanning-configuration scanOnPush=true" \
    "aws ecr describe-repositories --repository-names $PROJECT_NAME"

# 7. Create IAM roles
echo -e "\n${YELLOW}Setting up IAM roles...${NC}"

# Task execution role
TASK_EXECUTION_ROLE_NAME="${PROJECT_NAME}-task-execution-role"
if ! aws iam get-role --role-name $TASK_EXECUTION_ROLE_NAME &> /dev/null; then
    echo -e "Creating task execution role..."
    
    cat > /tmp/trust-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Principal": {
            "Service": ["ecs-tasks.amazonaws.com", "tasks.apprunner.amazonaws.com"]
        },
        "Action": "sts:AssumeRole"
    }]
}
EOF
    
    aws iam create-role \
        --role-name $TASK_EXECUTION_ROLE_NAME \
        --assume-role-policy-document file:///tmp/trust-policy.json
    
    aws iam attach-role-policy \
        --role-name $TASK_EXECUTION_ROLE_NAME \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    
    # Create custom policy for Secrets Manager
    cat > /tmp/secrets-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [{
        "Effect": "Allow",
        "Action": [
            "secretsmanager:GetSecretValue"
        ],
        "Resource": "arn:aws:secretsmanager:$AWS_REGION:$AWS_ACCOUNT_ID:secret:${PROJECT_NAME}/*"
    }]
}
EOF
    
    aws iam put-role-policy \
        --role-name $TASK_EXECUTION_ROLE_NAME \
        --policy-name SecretsManagerAccess \
        --policy-document file:///tmp/secrets-policy.json
    
    rm /tmp/trust-policy.json /tmp/secrets-policy.json
    echo -e "${GREEN}✓ IAM roles created${NC}"
else
    echo -e "${GREEN}✓ IAM roles already exist${NC}"
fi

# 8. Create CloudWatch log group
echo -e "\n${YELLOW}Setting up CloudWatch logs...${NC}"
create_or_get "CloudWatch log group" "/ecs/${PROJECT_NAME}" \
    "aws logs create-log-group --log-group-name /ecs/${PROJECT_NAME}" \
    "aws logs describe-log-groups --log-group-name-prefix /ecs/${PROJECT_NAME}"

# Summary
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ AWS infrastructure setup completed!${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Update secrets in AWS Secrets Manager with actual values"
echo -e "2. Wait for RDS instance to be available (if created)"
echo -e "3. Update DATABASE_URL in secrets with actual RDS endpoint"
echo -e "4. Run database migrations"
echo -e "5. Deploy application using ./scripts/deploy.sh"
echo -e "\n${YELLOW}Resources created:${NC}"
echo -e "- S3 Bucket: $S3_BUCKET_NAME"
echo -e "- Security Groups: $APP_SG_ID (app), $DB_SG_ID (db)"
echo -e "- Secrets: $SECRET_NAME"
echo -e "- ECR Repository: $PROJECT_NAME"
echo -e "- IAM Role: $TASK_EXECUTION_ROLE_NAME"