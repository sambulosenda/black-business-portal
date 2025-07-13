import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// This file should only be imported on the server side
// Client-side code should use the API routes instead

// Only initialize S3 client if we're on the server
let s3Client: S3Client | null = null
let BUCKET_NAME: string | null = null
let CLOUDFRONT_URL: string | undefined = undefined

if (typeof window === 'undefined') {
  // Server-side only
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET_NAME) {
    console.error('Missing required AWS environment variables')
    console.error('Required: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET_NAME')
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION || 'eu-west-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!
  CLOUDFRONT_URL = process.env.AWS_CLOUDFRONT_URL
}

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
  // Store the direct S3 URL - we'll generate presigned URLs when displaying
  return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'eu-west-2'}.amazonaws.com/${key}`
}

// Generate a presigned URL for uploading
export async function generateUploadUrl(
  key: string,
  contentType: string,
  maxSizeInBytes: number = 4 * 1024 * 1024 // 4MB default
): Promise<{ uploadUrl: string; publicUrl: string }> {
  if (!s3Client || !BUCKET_NAME) {
    throw new Error('S3 client not initialized. This function must be called on the server.')
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(s3Client, command, { 
    expiresIn: 3600, // 1 hour
  })

  const publicUrl = getPublicUrl(key)

  return { uploadUrl, publicUrl }
}

// Delete an object from S3
export async function deleteS3Object(url: string): Promise<void> {
  if (!s3Client || !BUCKET_NAME) {
    throw new Error('S3 client not initialized. This function must be called on the server.')
  }

  try {
    // Extract the key from the URL
    let key: string
    if (CLOUDFRONT_URL && url.includes(CLOUDFRONT_URL)) {
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

// Generate a presigned URL for reading/displaying an image
export async function generateReadUrl(url: string): Promise<string> {
  if (!s3Client || !BUCKET_NAME) {
    throw new Error('S3 client not initialized. This function must be called on the server.')
  }

  try {
    // Extract the key from the S3 URL
    const urlParts = url.split('.amazonaws.com/')
    if (urlParts.length !== 2) {
      return url // Return original URL if not an S3 URL
    }
    
    const key = urlParts[1]
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })
    
    return signedUrl
  } catch (error) {
    console.error('Error generating read URL:', error)
    return url // Return original URL on error
  }
}

// Extract S3 key from URL
export function extractS3Key(url: string): string | null {
  try {
    if (url.includes('.amazonaws.com/')) {
      return url.split('.amazonaws.com/')[1]
    }
    if (url.includes(CLOUDFRONT_URL!) && CLOUDFRONT_URL) {
      return url.replace(`${CLOUDFRONT_URL}/`, '')
    }
    return null
  } catch {
    return null
  }
}