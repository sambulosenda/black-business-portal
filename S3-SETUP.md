# S3 Bucket Configuration

To fix the "Failed to upload file to S3" error, you only need to configure CORS on your S3 bucket. The bucket can remain private for security.

## Steps to Configure S3 Bucket

### 1. Apply CORS Configuration (REQUIRED)

1. Go to AWS S3 Console: https://console.aws.amazon.com/s3/
2. Click on your bucket: `glamfric-portal-images-2025`
3. Go to the "Permissions" tab
4. Scroll down to "Cross-origin resource sharing (CORS)"
5. Click "Edit"
6. Copy and paste the contents of `s3-cors-config.json`:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET", "HEAD", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://localhost:3000"],
    "ExposeHeaders": ["ETag", "x-amz-server-side-encryption", "x-amz-request-id", "x-amz-id-2"],
    "MaxAgeSeconds": 3000
  }
]
```

7. Click "Save changes"

### 2. Keep Bucket Private (Recommended)

Since your AWS account has Block Public Access enabled (which is a security best practice), we'll keep the bucket private and use presigned URLs to display images.

**No bucket policy changes needed!**

### 3. Verify Block Public Access Settings

1. In the "Permissions" tab
2. Find "Block public access (bucket settings)"
3. Ensure all options are checked (enabled) for security
4. This is the recommended configuration

### 4. Update IAM User Permissions

Ensure your IAM user `Glamfric-portal-s3-user` has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::glamfric-portal-images-2025/*"
    }
  ]
}
```

### 5. For Production

When deploying to production, update the CORS configuration to include your production domain:

```json
"AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"]
```

## Testing

After applying the CORS configuration:

1. Restart your development server: `bun dev`
2. Try uploading an image again
3. Check the browser console for any errors

The upload should now work correctly!

## How It Works

1. **Upload**: Browser gets a presigned URL from your API and uploads directly to S3
2. **Storage**: Images are stored privately in S3 (no public access)
3. **Display**: When images need to be displayed, they're served through presigned URLs that expire after 1 hour

This approach is more secure than public buckets while still allowing direct browser uploads.
