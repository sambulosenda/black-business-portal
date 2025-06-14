import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'BUSINESS_OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business
    const business = await prisma.business.findFirst({
      where: { userId: session.user.id },
    });

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const endOfThisMonth = endOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const endOfLastMonth = endOfMonth(subMonths(now, 1));
    const startOfThisWeek = startOfWeek(now);
    const endOfThisWeek = endOfWeek(now);

    // Get bookings with payment data
    const [
      thisMonthBookings,
      lastMonthBookings,
      thisWeekBookings,
      totalBookings,
      completedBookings,
      upcomingBookings,
    ] = await Promise.all([
      // This month's bookings
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: startOfThisMonth,
            lte: endOfThisMonth,
          },
          paymentStatus: 'SUCCEEDED',
        },
        select: {
          totalPrice: true,
          businessPayout: true,
          platformFee: true,
          stripeFee: true,
        },
      }),
      // Last month's bookings
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: startOfLastMonth,
            lte: endOfLastMonth,
          },
          paymentStatus: 'SUCCEEDED',
        },
        select: {
          totalPrice: true,
          businessPayout: true,
        },
      }),
      // This week's bookings
      prisma.booking.findMany({
        where: {
          businessId: business.id,
          createdAt: {
            gte: startOfThisWeek,
            lte: endOfThisWeek,
          },
          paymentStatus: 'SUCCEEDED',
        },
        select: {
          totalPrice: true,
          businessPayout: true,
        },
      }),
      // Total bookings count
      prisma.booking.count({
        where: {
          businessId: business.id,
        },
      }),
      // Completed bookings count
      prisma.booking.count({
        where: {
          businessId: business.id,
          status: 'COMPLETED',
        },
      }),
      // Upcoming bookings count
      prisma.booking.count({
        where: {
          businessId: business.id,
          status: 'CONFIRMED',
          startTime: {
            gt: now,
          },
        },
      }),
    ]);

    // Calculate revenue metrics
    const thisMonthRevenue = thisMonthBookings.reduce(
      (sum, booking) => sum + (booking.businessPayout?.toNumber() || 0),
      0
    );
    const thisMonthGross = thisMonthBookings.reduce(
      (sum, booking) => sum + booking.totalPrice.toNumber(),
      0
    );
    const thisMonthPlatformFees = thisMonthBookings.reduce(
      (sum, booking) => sum + (booking.platformFee?.toNumber() || 0),
      0
    );
    const thisMonthStripeFees = thisMonthBookings.reduce(
      (sum, booking) => sum + (booking.stripeFee?.toNumber() || 0),
      0
    );

    const lastMonthRevenue = lastMonthBookings.reduce(
      (sum, booking) => sum + (booking.businessPayout?.toNumber() || 0),
      0
    );

    const thisWeekRevenue = thisWeekBookings.reduce(
      (sum, booking) => sum + (booking.businessPayout?.toNumber() || 0),
      0
    );

    // Calculate growth percentage
    const monthOverMonthGrowth = lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    // Get recent transactions
    const recentTransactions = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        paymentStatus: 'SUCCEEDED',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get top services
    const topServices = await prisma.booking.groupBy({
      by: ['serviceId'],
      where: {
        businessId: business.id,
        paymentStatus: 'SUCCEEDED',
      },
      _count: {
        serviceId: true,
      },
      _sum: {
        businessPayout: true,
      },
      orderBy: {
        _sum: {
          businessPayout: 'desc',
        },
      },
      take: 5,
    });

    // Get service details for top services
    const serviceIds = topServices.map(s => s.serviceId);
    const services = await prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topServicesWithNames = topServices.map(service => {
      const serviceDetails = services.find(s => s.id === service.serviceId);
      return {
        serviceName: serviceDetails?.name || 'Unknown',
        bookingCount: service._count.serviceId,
        revenue: service._sum.businessPayout?.toNumber() || 0,
      };
    });

    return NextResponse.json({
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        thisWeek: thisWeekRevenue,
        monthOverMonthGrowth,
        thisMonthGross,
        thisMonthPlatformFees,
        thisMonthStripeFees,
      },
      bookings: {
        total: totalBookings,
        completed: completedBookings,
        upcoming: upcomingBookings,
      },
      recentTransactions: recentTransactions.map(transaction => ({
        id: transaction.id,
        customerName: transaction.user.name || 'Customer',
        customerEmail: transaction.user.email,
        serviceName: transaction.service.name,
        amount: transaction.businessPayout?.toNumber() || 0,
        totalPaid: transaction.totalPrice.toNumber(),
        date: transaction.createdAt,
        status: transaction.status,
      })),
      topServices: topServicesWithNames,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}