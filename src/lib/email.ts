// Email service - currently using console.log for development
// In production, replace with actual email service (Resend, SendGrid, etc.)

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Replace with actual email service
  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: options.subject,
    preview: options.text || options.html.substring(0, 100) + '...'
  });
  
  // In development, you can view emails in console
  if (process.env.NODE_ENV === 'development') {
    console.log('Full email content:', options.html);
  }
}

// Email templates
export const emailTemplates = {
  bookingConfirmation: (booking: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    totalPrice: number;
    bookingId: string;
  }) => ({
    subject: `Booking Confirmation - ${booking.businessName}`,
    html: `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${booking.customerName},</p>
      <p>Your booking has been confirmed. Here are the details:</p>
      <ul>
        <li><strong>Business:</strong> ${booking.businessName}</li>
        <li><strong>Service:</strong> ${booking.serviceName}</li>
        <li><strong>Date:</strong> ${booking.date}</li>
        <li><strong>Time:</strong> ${booking.time}</li>
        <li><strong>Total:</strong> $${booking.totalPrice}</li>
      </ul>
      <p>Booking ID: ${booking.bookingId}</p>
      <p>You can manage your booking at: ${process.env.NEXTAUTH_URL}/bookings</p>
      <p>Thank you for your business!</p>
    `,
    text: `Booking confirmed at ${booking.businessName} for ${booking.serviceName} on ${booking.date} at ${booking.time}. Total: $${booking.totalPrice}`
  }),

  paymentReceipt: (payment: {
    customerName: string;
    businessName: string;
    serviceName: string;
    amount: number;
    paymentId: string;
    date: string;
  }) => ({
    subject: `Payment Receipt - ${payment.businessName}`,
    html: `
      <h2>Payment Receipt</h2>
      <p>Hi ${payment.customerName},</p>
      <p>This email confirms your payment has been processed.</p>
      <ul>
        <li><strong>Business:</strong> ${payment.businessName}</li>
        <li><strong>Service:</strong> ${payment.serviceName}</li>
        <li><strong>Amount Paid:</strong> $${payment.amount}</li>
        <li><strong>Payment Date:</strong> ${payment.date}</li>
        <li><strong>Payment ID:</strong> ${payment.paymentId}</li>
      </ul>
      <p>Thank you for your payment!</p>
    `,
    text: `Payment receipt for $${payment.amount} at ${payment.businessName} for ${payment.serviceName}`
  }),

  bookingCancellation: (booking: {
    customerName: string;
    businessName: string;
    serviceName: string;
    date: string;
    time: string;
    bookingId: string;
  }) => ({
    subject: `Booking Cancelled - ${booking.businessName}`,
    html: `
      <h2>Booking Cancelled</h2>
      <p>Hi ${booking.customerName},</p>
      <p>Your booking has been cancelled. Here were the details:</p>
      <ul>
        <li><strong>Business:</strong> ${booking.businessName}</li>
        <li><strong>Service:</strong> ${booking.serviceName}</li>
        <li><strong>Date:</strong> ${booking.date}</li>
        <li><strong>Time:</strong> ${booking.time}</li>
      </ul>
      <p>Booking ID: ${booking.bookingId}</p>
      <p>If you need to book again, visit: ${process.env.NEXTAUTH_URL}/business/${booking.businessName.toLowerCase().replace(/\s+/g, '-')}</p>
    `,
    text: `Your booking at ${booking.businessName} for ${booking.serviceName} on ${booking.date} at ${booking.time} has been cancelled.`
  }),

  refundProcessed: (refund: {
    customerName: string;
    businessName: string;
    amount: number;
    refundId: string;
  }) => ({
    subject: `Refund Processed - ${refund.businessName}`,
    html: `
      <h2>Refund Processed</h2>
      <p>Hi ${refund.customerName},</p>
      <p>Your refund has been processed successfully.</p>
      <ul>
        <li><strong>Business:</strong> ${refund.businessName}</li>
        <li><strong>Refund Amount:</strong> $${refund.amount}</li>
        <li><strong>Refund ID:</strong> ${refund.refundId}</li>
      </ul>
      <p>The refund should appear in your account within 5-10 business days.</p>
    `,
    text: `Refund of $${refund.amount} processed for ${refund.businessName}. Refund ID: ${refund.refundId}`
  })
};