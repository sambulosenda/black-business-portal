#!/bin/bash

# AWS Deployment Script for Business Portal
# This script helps deploy the application to AWS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION=${AWS_REGION:-"us-east-1"}
APP_NAME="business-portal"
ECR_REPOSITORY="$APP_NAME"

echo -e "${GREEN}🚀 Starting deployment of Business Portal to AWS${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
if [ -z "$AWS_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Failed to get AWS account ID. Check your AWS credentials.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ AWS Account ID: $AWS_ACCOUNT_ID${NC}"
echo -e "${GREEN}✓ Region: $AWS_REGION${NC}"

# Create ECR repository if it doesn't exist
echo -e "${YELLOW}📦 Checking ECR repository...${NC}"
if ! aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION &> /dev/null; then
    echo -e "${YELLOW}Creating ECR repository...${NC}"
    aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
    echo -e "${GREEN}✓ ECR repository created${NC}"
else
    echo -e "${GREEN}✓ ECR repository exists${NC}"
fi

# Get ECR login token
echo -e "${YELLOW}🔐 Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
docker build -t $APP_NAME .

# Tag image
IMAGE_TAG="latest"
if [ -n "$GITHUB_SHA" ]; then
    IMAGE_TAG=$GITHUB_SHA
fi
docker tag $APP_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
docker tag $APP_NAME:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Push image to ECR
echo -e "${YELLOW}⬆️  Pushing image to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

echo -e "${GREEN}✅ Image pushed successfully${NC}"

# Deploy to App Runner (if using App Runner)
if [ "$DEPLOY_TARGET" == "apprunner" ]; then
    echo -e "${YELLOW}🚀 Deploying to App Runner...${NC}"
    
    # Check if service exists
    SERVICE_ARN=$(aws apprunner list-services --query "ServiceSummaryList[?ServiceName=='$APP_NAME'].ServiceArn" --output text)
    
    if [ -z "$SERVICE_ARN" ]; then
        echo -e "${YELLOW}Creating new App Runner service...${NC}"
        aws apprunner create-service \
            --service-name "$APP_NAME" \
            --source-configuration "{
                \"ImageRepository\": {
                    \"ImageIdentifier\": \"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest\",
                    \"ImageConfiguration\": {
                        \"Port\": \"3000\"
                    },
                    \"ImageRepositoryType\": \"ECR\"
                },
                \"AutoDeploymentsEnabled\": true
            }"
    else
        echo -e "${YELLOW}Updating existing App Runner service...${NC}"
        aws apprunner update-service \
            --service-arn "$SERVICE_ARN" \
            --source-configuration "{
                \"ImageRepository\": {
                    \"ImageIdentifier\": \"$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG\",
                    \"ImageConfiguration\": {
                        \"Port\": \"3000\"
                    },
                    \"ImageRepositoryType\": \"ECR\"
                }
            }"
    fi
fi

# Deploy to ECS (if using ECS)
if [ "$DEPLOY_TARGET" == "ecs" ]; then
    echo -e "${YELLOW}🚀 Deploying to ECS...${NC}"
    
    # Update task definition
    TASK_DEFINITION=$(aws ecs describe-task-definition --task-definition $APP_NAME --query taskDefinition)
    NEW_TASK_DEF=$(echo $TASK_DEFINITION | jq --arg IMAGE "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$IMAGE_TAG" '.containerDefinitions[0].image = $IMAGE | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .compatibilities, .registeredAt, .registeredBy)')
    
    # Register new task definition
    aws ecs register-task-definition --cli-input-json "$NEW_TASK_DEF"
    
    # Update service
    aws ecs update-service --cluster $APP_NAME-cluster --service $APP_NAME-service --task-definition $APP_NAME
fi

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Output service URL
if [ "$DEPLOY_TARGET" == "apprunner" ]; then
    SERVICE_URL=$(aws apprunner describe-service --service-arn "$SERVICE_ARN" --query "Service.ServiceUrl" --output text)
    echo -e "${GREEN}🌐 Your application is available at: https://$SERVICE_URL${NC}"
fi