# AWS S3 Setup Guide

This guide explains how to set up AWS S3 for image storage in the Business Portal application.

## Prerequisites

- AWS Account
- AWS CLI installed (optional but recommended)

## Step 1: Create an S3 Bucket

1. Log in to AWS Console
2. Navigate to S3 service
3. Click "Create bucket"
4. Configure bucket:
   - **Bucket name**: `your-business-portal-images` (must be globally unique)
   - **Region**: Choose closest to your users (e.g., `us-east-1`)
   - **Object Ownership**: ACLs disabled
   - **Block Public Access**: Keep all settings OFF (we'll use presigned URLs)
   - **Versioning**: Optional (enable for backup)
   - **Encryption**: Enable server-side encryption with S3 managed keys

## Step 2: Configure CORS

Add this CORS configuration to your bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 3: Create IAM User

1. Go to IAM service
2. Create a new user with programmatic access
3. Attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::your-business-portal-images/*"
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_S3_BUCKET_NAME=your-business-portal-images
```

## Step 5: (Optional) Set up CloudFront CDN

For better performance globally:

1. Create a CloudFront distribution
2. Set your S3 bucket as the origin
3. Configure caching behavior
4. Add the CloudFront URL to your environment:

```bash
AWS_CLOUDFRONT_URL=https://d1234567890.cloudfront.net
```

## Usage in the Application

The application automatically handles:

- Generating presigned URLs for secure uploads
- Direct browser-to-S3 uploads (no server bandwidth used)
- Automatic deletion of old images when replaced
- Image validation (type and size)

## Security Best Practices

1. **Never commit AWS credentials** - Always use environment variables
2. **Use IAM roles in production** - For EC2/ECS deployments
3. **Enable S3 bucket logging** - For audit trails
4. **Set up lifecycle policies** - To manage old/unused images
5. **Monitor AWS billing** - Set up billing alerts

## Troubleshooting

### CORS Errors

- Ensure your domain is in the AllowedOrigins
- Check that the bucket CORS policy is applied

### Access Denied

- Verify IAM permissions
- Check bucket policy doesn't block access
- Ensure credentials are correct

### Upload Failures

- Check file size limits (default 4MB)
- Verify content type is allowed
- Check network connectivity

## Cost Optimization

- S3 Standard: ~$0.023 per GB/month
- Data transfer: ~$0.09 per GB (after 1GB free)
- PUT requests: ~$0.005 per 1,000 requests
- Use S3 Intelligent-Tiering for automatic cost optimization
