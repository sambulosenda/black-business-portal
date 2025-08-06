import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { geocodeAddress } from '@/lib/geocoding'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { businessId } = await request.json()

    // Verify the user owns this business
    const business = await prisma.business.findFirst({
      where: {
        id: businessId,
        userId: session.user.id,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Skip if already geocoded
    if (business.latitude && business.longitude) {
      return NextResponse.json({
        success: true,
        latitude: business.latitude,
        longitude: business.longitude,
      })
    }

    // Geocode the address
    const result = await geocodeAddress(
      business.address,
      business.city,
      business.state,
      business.zipCode
    )

    if (!result) {
      return NextResponse.json({ error: 'Failed to geocode address' }, { status: 400 })
    }

    // Update the business with coordinates
    await prisma.business.update({
      where: { id: businessId },
      data: {
        latitude: result.latitude,
        longitude: result.longitude,
      },
    })

    return NextResponse.json({
      success: true,
      latitude: result.latitude,
      longitude: result.longitude,
    })
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Batch geocode all businesses without coordinates (admin only)
export async function PUT() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find all businesses without coordinates
    const businesses = await prisma.business.findMany({
      where: {
        OR: [{ latitude: null }, { longitude: null }],
      },
      select: {
        id: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
      },
    })

    let geocoded = 0
    let failed = 0

    // Process businesses in batches
    for (const business of businesses) {
      const result = await geocodeAddress(
        business.address,
        business.city,
        business.state,
        business.zipCode
      )

      if (result) {
        await prisma.business.update({
          where: { id: business.id },
          data: {
            latitude: result.latitude,
            longitude: result.longitude,
          },
        })
        geocoded++
      } else {
        failed++
      }

      // Rate limit: wait 200ms between requests
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    return NextResponse.json({
      success: true,
      geocoded,
      failed,
      total: businesses.length,
    })
  } catch (error) {
    console.error('Batch geocoding error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
