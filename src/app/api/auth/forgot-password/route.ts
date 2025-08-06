import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    // Password reset requested

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      // User not found - returning success for security
      return NextResponse.json({
        message: 'If an account exists with that email, we sent a password reset link.',
      })
    }

    // User found, proceeding with reset

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Create expiry time (1 hour from now)
    const expires = new Date(Date.now() + 3600000) // 1 hour

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email.toLowerCase() },
    })

    // Save the token
    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: hashedToken,
        expires,
      },
    })

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`

    // Reset URL generated

    // Send email
    await sendEmail({
      to: email,
      subject: 'Reset your Glamfric password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(to right, #6366f1, #a855f7); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Glamfric</h1>
          </div>
          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #111827; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Hi ${user.name},
            </p>
            <p style="color: #4b5563; margin-bottom: 20px;">
              You requested to reset your password. Click the button below to create a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(to right, #6366f1, #a855f7); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
                Reset Password
              </a>
            </div>
            <p style="color: #4b5563; margin-bottom: 20px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #6366f1; word-break: break-all; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            <p style="color: #4b5563; margin-bottom: 20px;">
              This link will expire in 1 hour. If you didn't request this, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #9ca3af; font-size: 14px; text-align: center;">
              This email was sent by Glamfric. If you have any questions, please contact our support team.
            </p>
          </div>
        </div>
      `,
    })

    return NextResponse.json({
      message: 'If an account exists with that email, we sent a password reset link.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
