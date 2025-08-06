// Email service with AWS SES support
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Initialize SES client only if credentials are provided
const sesClient = process.env.AWS_SES_REGION
  ? new SESClient({
      region: process.env.AWS_SES_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  // Use console.log if SES is not configured or in development without ENABLE_EMAIL_SENDING
  if (
    !sesClient ||
    (process.env.NODE_ENV === 'development' && process.env.ENABLE_EMAIL_SENDING !== 'true')
  ) {
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100) + '...',
    })

    if (process.env.NODE_ENV === 'development') {
      console.log('Full email content:', options.html)
    }
    return
  }

  // Send email via AWS SES
  try {
    const command = new SendEmailCommand({
      Source: process.env.EMAIL_FROM || 'Glamfric <noreply@glamfric.com>',
      Destination: {
        ToAddresses: [options.to],
      },
      Message: {
        Subject: {
          Data: options.subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: options.html,
            Charset: 'UTF-8',
          },
          Text: {
            Data: options.text || options.html.replace(/<[^>]*>?/gm, ''),
            Charset: 'UTF-8',
          },
        },
      },
    })

    const response = await sesClient.send(command)
    console.log('✅ Email sent via AWS SES:', response.MessageId)
  } catch (error) {
    console.error('❌ Failed to send email via AWS SES:', error)
    // In production, you might want to retry or queue the email
    throw error
  }
}

// Email templates
export const emailTemplates = {
  bookingConfirmation: (booking: {
    customerName: string
    businessName: string
    serviceName: string
    date: string
    time: string
    totalPrice: number
    bookingId: string
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
    text: `Booking confirmed at ${booking.businessName} for ${booking.serviceName} on ${booking.date} at ${booking.time}. Total: $${booking.totalPrice}`,
  }),

  paymentReceipt: (payment: {
    customerName: string
    businessName: string
    serviceName: string
    amount: number
    paymentId: string
    date: string
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
    text: `Payment receipt for $${payment.amount} at ${payment.businessName} for ${payment.serviceName}`,
  }),

  bookingCancellation: (booking: {
    customerName: string
    businessName: string
    serviceName: string
    date: string
    time: string
    bookingId: string
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
    text: `Your booking at ${booking.businessName} for ${booking.serviceName} on ${booking.date} at ${booking.time} has been cancelled.`,
  }),

  refundProcessed: (refund: {
    customerName: string
    businessName: string
    amount: number
    refundId: string
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
    text: `Refund of $${refund.amount} processed for ${refund.businessName}. Refund ID: ${refund.refundId}`,
  }),

  emailVerification: (verification: { name: string; token: string }) => ({
    subject: 'Verify your email - Glamfric',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to Glamfric!</h2>
        <p>Hi ${verification.name},</p>
        <p>Thanks for signing up! Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verification.token}" 
             style="background: linear-gradient(to right, #6366f1, #9333ea); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    display: inline-block;
                    font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p style="background: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all;">
          ${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verification.token}
        </p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Glamfric - Book beauty services in 30 seconds<br>
          © ${new Date().getFullYear()} Glamfric. All rights reserved.
        </p>
      </div>
    `,
    text: `Welcome to Glamfric! Please verify your email by visiting: ${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${verification.token}. This link will expire in 24 hours.`,
  }),
}

// Helper function to send verification email
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const template = emailTemplates.emailVerification({ name, token })
  await sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}
