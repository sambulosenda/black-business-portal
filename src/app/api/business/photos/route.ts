import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/prisma'
import { deleteS3Object } from '@/lib/s3'
import { PhotoType } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const businessId = searchParams.get('businessId')

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 })
    }

    // Verify user owns this business
    const business = await db.business.findUnique({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Get all photos for this business
    const photos = await db.businessPhoto.findMany({
      where: {
        businessId,
        isActive: true,
      },
      orderBy: [
        { type: 'asc' }, // Hero first, then gallery, etc.
        { order: 'asc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({ photos })
  } catch (error) {
    console.error('Error fetching business photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId, type, caption, order } = body

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    // Get the photo and verify ownership
    const photo = await db.businessPhoto.findFirst({
      where: {
        id: photoId,
        business: {
          userId: session.user.id,
        },
      },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // If changing to HERO type, ensure no other hero image exists
    if (type === PhotoType.HERO) {
      await db.businessPhoto.updateMany({
        where: {
          businessId: photo.businessId,
          type: PhotoType.HERO,
          id: {
            not: photoId,
          },
        },
        data: {
          type: PhotoType.GALLERY,
        },
      })
    }

    // Update the photo
    const updatedPhoto = await db.businessPhoto.update({
      where: { id: photoId },
      data: {
        ...(type && { type }),
        ...(caption !== undefined && { caption }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json({ photo: updatedPhoto })
  } catch (error) {
    console.error('Error updating photo:', error)
    return NextResponse.json({ error: 'Failed to update photo' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    // Get the photo and verify ownership
    const photo = await db.businessPhoto.findFirst({
      where: {
        id: photoId,
        business: {
          userId: session.user.id,
        },
      },
    })

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    // Delete from S3
    try {
      await deleteS3Object(photo.url)
    } catch (s3Error) {
      console.error('Failed to delete from S3:', s3Error)
      // Continue with database deletion even if S3 fails
    }

    // Soft delete by setting isActive to false
    await db.businessPhoto.update({
      where: { id: photoId },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
