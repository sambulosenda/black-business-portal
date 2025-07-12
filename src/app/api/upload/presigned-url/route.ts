import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateS3Key, generateUploadUrl, isValidImageType, isValidFileSize } from '@/lib/s3'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, filename, contentType, fileSize, photoType = 'GALLERY' } = body

    // Validate input
    if (!businessId || !filename || !contentType || !fileSize) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    if (!isValidImageType(contentType)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (4MB max)
    if (!isValidFileSize(fileSize)) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 4MB.' 
      }, { status: 400 })
    }

    // Verify user owns this business
    const business = await prisma.business.findUnique({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Generate S3 key and presigned URL
    const key = generateS3Key(businessId, photoType.toLowerCase(), filename)
    const { uploadUrl, publicUrl } = await generateUploadUrl(key, contentType, fileSize)

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
    })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('credentials')) {
        return NextResponse.json(
          { error: 'AWS credentials not configured properly. Please check environment variables.' },
          { status: 500 }
        )
      }
      if (error.message.includes('bucket')) {
        return NextResponse.json(
          { error: 'S3 bucket configuration error. Please check AWS_S3_BUCKET_NAME.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Please check server logs.' },
      { status: 500 }
    )
  }
}