import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    const requiredFields = [
      'businessName',
      'category',
      'address',
      'city',
      'state',
      'zipCode',
      'phone',
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Get the business for this user
    const business = await prisma.business.findUnique({
      where: { userId: session.user.id },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Update the business profile
    const updatedBusiness = await prisma.business.update({
      where: { id: business.id },
      data: {
        businessName: data.businessName,
        description: data.description || null,
        category: data.category,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email || null,
        website: data.website || null,
        instagram: data.instagram || null,
      },
    })

    return NextResponse.json(updatedBusiness)
  } catch (error) {
    console.error('Error updating business profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
