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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      )
    }
    
    // Extract key from S3 URL
    const decodedUrl = decodeURIComponent(url)
    const urlParts = decodedUrl.split('.amazonaws.com/')
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { error: 'Invalid S3 URL' },
        { status: 400 }
      )
    }
    
    const key = urlParts[1]
    
    // Generate a presigned URL for the image
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
    
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour
    })
    
    // Fetch the image from S3
    const imageResponse = await fetch(signedUrl)
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status}`)
    }
    
    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer()
    
    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': imageResponse.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve image' },
      { status: 500 }
    )
  }
}