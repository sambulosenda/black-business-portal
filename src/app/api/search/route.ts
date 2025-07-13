import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || ''
    const city = searchParams.get('city') || ''
    const minRating = searchParams.get('minRating') ? parseInt(searchParams.get('minRating')!) : 0

    // Build where clause
    const where: Prisma.BusinessWhereInput = {
      isActive: true,
    }

    // Text search
    if (query) {
      where.OR = [
        { businessName: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        {
          services: {
            some: {
              name: { contains: query, mode: 'insensitive' },
            },
          },
        },
      ]
    }

    // Category filter
    if (category) {
      where.category = category
    }

    // City filter
    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    // Get businesses with reviews
    const businesses = await prisma.business.findMany({
      where,
      include: {
        reviews: true,
        services: {
          where: { isActive: true },
          take: 3,
          orderBy: { name: 'asc' },
        },
      },
    })

    // Filter by minimum rating
    const businessesWithRating = businesses
      .map((business) => {
        const avgRating =
          business.reviews.length > 0
            ? business.reviews.reduce((acc, review) => acc + review.rating, 0) /
              business.reviews.length
            : 0
        return { ...business, avgRating }
      })
      .filter((business) => business.avgRating >= minRating)

    // Sort by rating (highest first)
    businessesWithRating.sort((a, b) => b.avgRating - a.avgRating)

    return NextResponse.json({ businesses: businessesWithRating })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search businesses' },
      { status: 500 }
    )
  }
}