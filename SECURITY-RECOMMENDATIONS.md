# S3 Image Upload Security Recommendations

## Current Security Status
✅ **Good** - Private bucket, authentication, basic validation
⚠️ **Needs Improvement** - File sanitization, content verification, rate limiting

## Immediate Actions (High Priority)

### 1. Sanitize File Names
```typescript
// Add to src/lib/s3.ts
export function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  const name = filename.replace(/\.\./g, '').replace(/[\/\\]/g, '');
  
  // Keep only safe characters
  const safeName = name.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  // Ensure has extension
  const ext = safeName.split('.').pop();
  if (!ext || !['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext.toLowerCase())) {
    throw new Error('Invalid file extension');
  }
  
  return safeName;
}
```

### 2. Add Server-Side Content Verification
```bash
bun add file-type sharp
```

```typescript
// Verify file content matches claimed type
import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';

export async function verifyImageContent(buffer: Buffer): Promise<boolean> {
  // Check file signature
  const fileType = await fileTypeFromBuffer(buffer);
  if (!fileType || !['jpg', 'png', 'gif', 'webp'].includes(fileType.ext)) {
    return false;
  }
  
  // Verify it's a valid image
  try {
    const metadata = await sharp(buffer).metadata();
    return metadata.width > 0 && metadata.height > 0;
  } catch {
    return false;
  }
}
```

### 3. Implement Rate Limiting
```bash
bun add @upstash/ratelimit @upstash/redis
```

```typescript
// Add to upload API routes
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 uploads per hour
});

// In your API route
const { success } = await ratelimit.limit(session.user.id);
if (!success) {
  return NextResponse.json({ error: "Too many uploads" }, { status: 429 });
}
```

### 4. Add Image Processing & Optimization
```typescript
// Resize and optimize images
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(2048, 2048, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .jpeg({ quality: 85, progressive: true })
    .toBuffer();
}
```

### 5. Implement Signed Cookies (Alternative to Presigned URLs)
```typescript
// For better performance with CloudFront
const policy = {
  Statement: [{
    Resource: `https://cdn.example.com/businesses/${businessId}/*`,
    Condition: {
      DateLessThan: {
        "AWS:EpochTime": Math.floor(Date.now() / 1000) + 3600
      }
    }
  }]
};
```

## Production Checklist

### Before Launch
- [ ] Enable AWS CloudTrail for S3 audit logs
- [ ] Set up S3 bucket versioning
- [ ] Configure S3 lifecycle policies
- [ ] Enable S3 server-side encryption
- [ ] Set up AWS WAF for additional protection
- [ ] Configure CloudFront signed URLs/cookies
- [ ] Implement virus scanning with Lambda
- [ ] Add comprehensive logging and monitoring
- [ ] Set up alerts for suspicious activity

### S3 Bucket Policy (Recommended)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DenyInsecureConnections",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": [
        "arn:aws:s3:::glamfric-portal-images-2025/*"
      ],
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

### IAM Policy (Least Privilege)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::glamfric-portal-images-2025/businesses/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

## Security Monitoring

### CloudWatch Alarms to Set Up
1. Unusual number of 403 errors (potential attack)
2. High data transfer (potential data exfiltration)
3. Requests from unusual geographic locations
4. Multiple failed authentication attempts

### Logging Requirements
- Enable S3 access logging
- CloudTrail for API calls
- Application logs for upload attempts
- Failed validation attempts

## Cost Optimization with Security
- Use S3 Intelligent-Tiering for automatic cost optimization
- Enable S3 Transfer Acceleration only for users far from bucket region
- Use CloudFront for both performance and DDoS protection
- Implement request throttling to prevent abuse

## Compliance Considerations
- GDPR: Implement right to deletion (already have soft delete)
- CCPA: Track data usage and provide export capability
- PCI DSS: Not applicable (no payment data in images)
- HIPAA: Not applicable (no health information)

## Testing Security
```bash
# Test file upload with malicious filename
curl -X POST /api/upload/presigned-url \
  -d '{"filename": "../../etc/passwd"}'

# Test large file upload
dd if=/dev/zero of=large.jpg bs=1M count=10

# Test non-image file with image extension
cp document.pdf fake.jpg
```

## Summary
The current implementation follows many security best practices but needs improvements in:
1. File name sanitization
2. Content verification
3. Rate limiting
4. Monitoring and alerting

These improvements should be implemented before production launch.