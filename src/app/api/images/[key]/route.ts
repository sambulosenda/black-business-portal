import { NextRequest, NextResponse } from 'next/server'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { S3Client } from '@aws-sdk/client-s3'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-west-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Get the full URL from query params if provided
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    let key: string
    
    if (url) {
      // Extract key from S3 URL
      const urlParts = url.split('.amazonaws.com/')
      if (urlParts.length !== 2) {
        return NextResponse.json(
          { error: 'Invalid S3 URL' },
          { status: 400 }
        )
      }
      key = urlParts[1]
    } else {
      // Use the key from params
      key = decodeURIComponent(params.key)
    }
    
    // Generate a presigned URL for the image
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })
    
    // Redirect to the signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    )
  }
}