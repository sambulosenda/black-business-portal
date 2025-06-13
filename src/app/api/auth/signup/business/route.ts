import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const signupSchema = z.object({
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  businessName: z.string().min(2),
  category: z.string(),
  businessPhone: z.string(),
  businessEmail: z.string().email().optional().or(z.literal('')),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  website: z.string().url().optional().or(z.literal('')),
  instagram: z.string().optional(),
})

function createSlug(businessName: string): string {
  return businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validatedData = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = createSlug(validatedData.businessName)
    let slugSuffix = 0
    let uniqueSlug = slug

    while (await prisma.business.findUnique({ where: { slug: uniqueSlug } })) {
      slugSuffix++
      uniqueSlug = `${slug}-${slugSuffix}`
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Create user and business in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name: validatedData.ownerName,
          email: validatedData.email,
          password: hashedPassword,
          role: 'BUSINESS_OWNER',
        },
      })

      // Create business
      const business = await tx.business.create({
        data: {
          userId: user.id,
          businessName: validatedData.businessName,
          slug: uniqueSlug,
          category: validatedData.category as any,
          phone: validatedData.businessPhone,
          email: validatedData.businessEmail || null,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          website: validatedData.website || null,
          instagram: validatedData.instagram || null,
          openingHours: {},
          images: [],
        },
      })

      return { user, business }
    })

    return NextResponse.json({
      message: 'Business account created successfully',
      userId: result.user.id,
      businessId: result.business.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Business signup error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}