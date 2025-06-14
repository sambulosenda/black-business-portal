import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { PaymentStatus } from '@prisma/client';
import { sendEmail, emailTemplates } from '@/lib/email';

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

    // Check if booking can be refunded
    if (booking.paymentStatus !== PaymentStatus.SUCCEEDED) {
      return NextResponse.json({ 
        error: 'Only successful payments can be refunded' 
      }, { status: 400 });
    }

    if (!booking.stripePaymentIntentId) {
      return NextResponse.json({ 
        error: 'No payment intent found for this booking' 
      }, { status: 400 });
    }

    // Check refund policy (example: can refund up to 24 hours before appointment)
    const hoursBeforeAppointment = (booking.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursBeforeAppointment < 24 && !isBusinessOwner) {
      return NextResponse.json({ 
        error: 'Refunds must be requested at least 24 hours before the appointment' 
      }, { status: 400 });
    }

    // Process refund through Stripe
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentIntentId,
      reason: reason || 'requested_by_customer',
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    // Send refund notification email
    if (booking.user.email) {
      const emailData = emailTemplates.refundProcessed({
        customerName: booking.user.name || 'Customer',
        businessName: booking.business.businessName,
        amount: refund.amount / 100, // Convert from cents
        refundId: refund.id,
      });

      await sendEmail({
        to: booking.user.email,
        ...emailData,
      });
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        amount: refund.amount / 100, // Convert from cents
        status: refund.status,
      },
    });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    );
  }
}