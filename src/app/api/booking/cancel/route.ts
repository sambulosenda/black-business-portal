import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';
import { sendEmail, emailTemplates } from '@/lib/email';
import { format } from 'date-fns';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId, reason } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    // Get the booking with business details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        business: true,
        service: true,
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if user owns the booking or is the business owner
    const isCustomer = booking.userId === session.user.id;
    const isBusinessOwner = booking.business.userId === session.user.id;
    
    if (!isCustomer && !isBusinessOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if booking can be cancelled
    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json({ 
        error: 'Booking is already cancelled' 
      }, { status: 400 });
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return NextResponse.json({ 
        error: 'Completed bookings cannot be cancelled' 
      }, { status: 400 });
    }

    // Check cancellation policy for customers (businesses can always cancel)
    if (isCustomer && !isBusinessOwner) {
      const hoursBeforeAppointment = (booking.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
      
      // Example policy: free cancellation up to 24 hours before
      if (hoursBeforeAppointment < 24) {
        return NextResponse.json({ 
          error: 'Cancellations must be made at least 24 hours before the appointment. Contact the business directly for assistance.' 
        }, { status: 400 });
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        notes: reason ? `${booking.notes ? booking.notes + '\n' : ''}Cancellation reason: ${reason}` : booking.notes,
        updatedAt: new Date(),
      },
    });

    // Send cancellation email
    if (booking.user.email) {
      const emailData = emailTemplates.bookingCancellation({
        customerName: booking.user.name || 'Customer',
        businessName: booking.business.businessName,
        serviceName: booking.service.name,
        date: format(new Date(booking.date), 'EEEE, MMMM d, yyyy'),
        time: format(new Date(booking.startTime), 'h:mm a'),
        bookingId: booking.id,
      });

      await sendEmail({
        to: booking.user.email,
        ...emailData,
      });
    }

    // If payment was successful and customer is cancelling, they should request a refund separately
    // This allows for more flexible refund policies
    
    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        message: booking.paymentStatus === 'SUCCEEDED' && isCustomer
          ? 'Booking cancelled. Please request a refund if applicable.'
          : 'Booking cancelled successfully.',
      },
    });
  } catch (error) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}