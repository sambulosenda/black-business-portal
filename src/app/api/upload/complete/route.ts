import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PhotoType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { businessId, url, type = 'GALLERY', caption, order = 0 } = body

    if (!businessId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

    // If setting as HERO type, ensure no other hero image exists
    if (type === PhotoType.HERO) {
      await prisma.businessPhoto.updateMany({
        where: {
          businessId,
          type: PhotoType.HERO,
        },
        data: {
          type: PhotoType.GALLERY,
        },
      })
    }

    // Create the photo record
    const photo = await prisma.businessPhoto.create({
      data: {
        businessId,
        url,
        type: type as PhotoType,
        caption,
        order,
      },
    })

    return NextResponse.json({ photo })
  } catch (error) {
    console.error('Error saving photo:', error)
    return NextResponse.json(
      { error: 'Failed to save photo' },
      { status: 500 }
    )
  }
}