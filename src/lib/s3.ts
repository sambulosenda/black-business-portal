import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
const CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL // Optional: for CDN delivery

// Generate a unique key for each upload
export function generateS3Key(businessId: string, type: string, filename: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  return `businesses/${businessId}/${type}/${timestamp}-${randomString}.${extension}`
}

// Get the public URL for an S3 object
export function getPublicUrl(key: string): string {
  if (CLOUDFRONT_URL) {
    return `${CLOUDFRONT_URL}/${key}`
  }
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
}

// Generate a presigned URL for uploading
export async function generateUploadUrl(
  key: string,
  contentType: string,
  maxSizeInBytes: number = 4 * 1024 * 1024 // 4MB default
): Promise<{ uploadUrl: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: maxSizeInBytes,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600, // 1 hour
  })

  const publicUrl = getPublicUrl(key)

  return { uploadUrl, publicUrl }
}

// Delete an object from S3
export async function deleteS3Object(url: string): Promise<void> {
  try {
    // Extract the key from the URL
    let key: string
    if (url.includes(CLOUDFRONT_URL!)) {
      key = url.replace(`${CLOUDFRONT_URL}/`, '')
    } else {
      const urlParts = url.split('.amazonaws.com/')
      key = urlParts[1]
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
  } catch (error) {
    console.error('Failed to delete S3 object:', error)
    throw new Error('Failed to delete image')
  }
}

// Validate file type
export function isValidImageType(contentType: string): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(contentType.toLowerCase())
}

// Validate file size (in bytes)
export function isValidFileSize(sizeInBytes: number, maxSizeInMB: number = 4): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return sizeInBytes <= maxSizeInBytes
}