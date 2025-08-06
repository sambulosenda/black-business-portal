import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const session = await getSession()

    if (!session || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the business for this owner
    const business = await prisma.business.findFirst({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    if (!business) {
      return NextResponse.json({ error: 'No active business found' }, { status: 404 })
    }

    // Get all customer profiles for this business
    const customers = await prisma.customerProfile.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        lastVisit: 'desc',
      },
    })

    // If no customer profiles exist yet, create them from bookings
    if (customers.length === 0) {
      // Get unique customers from bookings
      const bookings = await prisma.booking.findMany({
        where: {
          businessId: business.id,
        },
        include: {
          user: true,
          service: true,
        },
        orderBy: {
          date: 'desc',
        },
      })

      // Group bookings by user
      const customerMap = new Map<
        string,
        {
          userId: string
          customerName: string | null
          customerEmail: string | null
          customerPhone: string | null
          firstVisit: Date
          lastVisit: Date
          totalVisits: number
          totalSpent: number
          services: Map<string, number>
        }
      >()

      for (const booking of bookings) {
        const userId = booking.userId

        if (!customerMap.has(userId)) {
          customerMap.set(userId, {
            userId,
            customerName: booking.user.name,
            customerEmail: booking.user.email,
            customerPhone: booking.user.phone,
            firstVisit: booking.date,
            lastVisit: booking.date,
            totalVisits: 0,
            totalSpent: 0,
            services: new Map<string, number>(),
          })
        }

        const customer = customerMap.get(userId)
        if (customer) {
          customer.totalVisits++
          customer.totalSpent += Number(booking.totalPrice)

          // Track service frequency
          const serviceCount = customer.services.get(booking.service.name) || 0
          customer.services.set(booking.service.name, serviceCount + 1)

          // Update first/last visit
          if (booking.date < customer.firstVisit) {
            customer.firstVisit = booking.date
          }
          if (booking.date > customer.lastVisit) {
            customer.lastVisit = booking.date
          }
        }
      }

      // Create customer profiles
      for (const [userId, customerData] of customerMap) {
        // Find most frequent service
        let favoriteService = null
        let maxCount = 0
        for (const [service, count] of customerData.services) {
          if (count > maxCount) {
            maxCount = count
            favoriteService = service
          }
        }

        await prisma.customerProfile.create({
          data: {
            businessId: business.id,
            userId,
            customerName: customerData.customerName || 'Unknown',
            customerEmail: customerData.customerEmail || '',
            customerPhone: customerData.customerPhone || '',
            firstVisit: customerData.firstVisit,
            lastVisit: customerData.lastVisit,
            totalVisits: customerData.totalVisits,
            totalSpent: customerData.totalSpent,
            averageSpent: customerData.totalSpent / customerData.totalVisits,
            favoriteService,
            tags: customerData.totalVisits > 5 ? ['regular'] : ['new'],
            isVip: customerData.totalSpent > 1000,
          },
        })
      }

      // Fetch the newly created profiles
      const newCustomers = await prisma.customerProfile.findMany({
        where: {
          businessId: business.id,
        },
        orderBy: {
          lastVisit: 'desc',
        },
      })

      // Convert Decimal fields to numbers for JSON serialization
      const newCustomersWithNumbers = newCustomers.map((customer) => ({
        ...customer,
        totalSpent: Number(customer.totalSpent),
        averageSpent: Number(customer.averageSpent),
      }))

      return NextResponse.json({ customers: newCustomersWithNumbers })
    }

    // Convert Decimal fields to numbers for JSON serialization
    const customersWithNumbers = customers.map((customer) => ({
      ...customer,
      totalSpent: Number(customer.totalSpent),
      averageSpent: Number(customer.averageSpent),
    }))

    return NextResponse.json({ customers: customersWithNumbers })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}
