import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
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

    // Get total customers
    const totalCustomers = await prisma.customerProfile.count({
      where: {
        businessId: business.id,
      },
    })

    // Get new customers this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const newCustomersThisMonth = await prisma.customerProfile.count({
      where: {
        businessId: business.id,
        createdAt: {
          gte: startOfMonth,
        },
      },
    })

    // Get total revenue and average customer value
    const revenueData = await prisma.customerProfile.aggregate({
      where: {
        businessId: business.id,
      },
      _sum: {
        totalSpent: true,
      },
      _avg: {
        totalSpent: true,
      },
    })

    const totalRevenue = Number(revenueData._sum.totalSpent || 0)
    const averageCustomerValue = Number(revenueData._avg.totalSpent || 0)

    // Get top spenders
    const topSpenders = await prisma.customerProfile.findMany({
      where: {
        businessId: business.id,
      },
      orderBy: {
        totalSpent: 'desc',
      },
      take: 5,
    })

    // Get at-risk customers (haven't visited in 90+ days but have visited more than twice)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const atRiskCustomers = await prisma.customerProfile.findMany({
      where: {
        businessId: business.id,
        lastVisit: {
          lt: ninetyDaysAgo,
        },
        totalVisits: {
          gt: 2,
        },
      },
      orderBy: {
        totalSpent: 'desc',
      },
    })

    return NextResponse.json({
      totalCustomers,
      newCustomersThisMonth,
      totalRevenue,
      averageCustomerValue,
      topSpenders: topSpenders.map(customer => ({
        ...customer,
        totalSpent: Number(customer.totalSpent),
        averageSpent: Number(customer.averageSpent),
      })),
      atRiskCustomers: atRiskCustomers.map(customer => ({
        ...customer,
        totalSpent: Number(customer.totalSpent),
        averageSpent: Number(customer.averageSpent),
      })),
    })
  } catch (error) {
    console.error('Error fetching customer metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer metrics' },
      { status: 500 }
    )
  }
}