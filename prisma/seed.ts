import { PrismaClient, BookingStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clean existing data in the correct order
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.product.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.service.deleteMany()
  await prisma.promotion.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.business.deleteMany()
  await prisma.user.deleteMany()

  // Create customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Sarah Johnson',
      phone: '+1234567890',
      role: 'CUSTOMER',
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Michael Brown',
      phone: '+1234567891',
      role: 'CUSTOMER',
    },
  })

  const customer3 = await prisma.user.create({
    data: {
      email: 'customer3@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Aisha Williams',
      phone: '+1234567892',
      role: 'CUSTOMER',
    },
  })

  // Create business owners and their businesses
  const businessOwner1 = await prisma.user.create({
    data: {
      email: 'business1@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Tasha Green',
      role: 'BUSINESS_OWNER',
    },
  })

  const business1 = await prisma.business.create({
    data: {
      userId: businessOwner1.id,
      businessName: 'Curls & Coils Beauty Bar',
      slug: 'curls-coils-beauty-bar',
      description: 'Specializing in natural hair care and styling for all curl patterns. We use organic products and provide personalized consultations.',
      category: 'HAIR_SALON',
      address: '123 Main Street',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30301',
      phone: '+1404555001',
      email: 'info@curlsandcoils.com',
      website: 'https://curlsandcoils.com',
      instagram: '@curlsandcoils',
      isVerified: true,
      isActive: true,
      images: [],
      openingHours: {},
    },
  })

  // Services for business1
  await prisma.service.createMany({
    data: [
      {
        businessId: business1.id,
        name: 'Wash & Go',
        description: 'Deep cleanse, condition, and style for natural curls',
        price: 65,
        duration: 90,
        category: 'Hair Styling',
        isActive: true,
      },
      {
        businessId: business1.id,
        name: 'Protective Style Installation',
        description: 'Box braids, twists, or locs installation',
        price: 150,
        duration: 240,
        category: 'Hair Styling',
        isActive: true,
      },
      {
        businessId: business1.id,
        name: 'Deep Conditioning Treatment',
        description: 'Intensive moisture treatment for dry or damaged hair',
        price: 45,
        duration: 60,
        category: 'Hair Treatment',
        isActive: true,
      },
    ],
  })

  const businessOwner2 = await prisma.user.create({
    data: {
      email: 'business2@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Marcus King',
      role: 'BUSINESS_OWNER',
    },
  })

  const business2 = await prisma.business.create({
    data: {
      userId: businessOwner2.id,
      businessName: 'King Cuts Barbershop',
      slug: 'king-cuts-barbershop',
      description: 'Premium barbershop experience with skilled barbers specializing in fades, designs, and beard grooming.',
      category: 'BARBER_SHOP',
      address: '456 Peachtree Ave',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30308',
      phone: '+1404555002',
      instagram: '@kingcutsatl',
      isVerified: true,
      isActive: true,
      images: [],
      openingHours: {},
    },
  })

  // Services for business2
  await prisma.service.createMany({
    data: [
      {
        businessId: business2.id,
        name: 'Classic Haircut',
        description: 'Traditional cut with line up',
        price: 35,
        duration: 45,
        category: 'Haircut',
        isActive: true,
      },
      {
        businessId: business2.id,
        name: 'Fade & Design',
        description: 'Custom fade with artistic design',
        price: 50,
        duration: 60,
        category: 'Haircut',
        isActive: true,
      },
      {
        businessId: business2.id,
        name: 'Beard Trim & Shape',
        description: 'Professional beard grooming and shaping',
        price: 25,
        duration: 30,
        category: 'Grooming',
        isActive: true,
      },
    ],
  })

  const businessOwner3 = await prisma.user.create({
    data: {
      email: 'business3@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Jasmine Davis',
      role: 'BUSINESS_OWNER',
    },
  })

  const business3 = await prisma.business.create({
    data: {
      userId: businessOwner3.id,
      businessName: 'Glow Up Nail Studio',
      slug: 'glow-up-nail-studio',
      description: 'Luxury nail care with a focus on nail health. We offer gel, acrylic, and natural nail services.',
      category: 'NAIL_SALON',
      address: '789 MLK Blvd',
      city: 'Houston',
      state: 'TX',
      zipCode: '77004',
      phone: '+1713555001',
      email: 'hello@glowupnails.com',
      isVerified: false,
      isActive: true,
      images: [],
      openingHours: {},
    },
  })

  // Services for business3
  await prisma.service.createMany({
    data: [
      {
        businessId: business3.id,
        name: 'Gel Manicure',
        description: 'Long-lasting gel polish manicure',
        price: 45,
        duration: 60,
        category: 'Manicure',
        isActive: true,
      },
      {
        businessId: business3.id,
        name: 'Acrylic Full Set',
        description: 'Full set of acrylic nails with design',
        price: 65,
        duration: 90,
        category: 'Nail Extensions',
        isActive: true,
      },
      {
        businessId: business3.id,
        name: 'Luxury Pedicure',
        description: 'Spa pedicure with massage and paraffin treatment',
        price: 55,
        duration: 75,
        category: 'Pedicure',
        isActive: true,
      },
    ],
  })

  const businessOwner4 = await prisma.user.create({
    data: {
      email: 'business4@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Amara Thompson',
      role: 'BUSINESS_OWNER',
    },
  })

  const business4 = await prisma.business.create({
    data: {
      userId: businessOwner4.id,
      businessName: 'Serenity Spa & Wellness',
      slug: 'serenity-spa-wellness',
      description: 'Full-service spa offering massages, facials, and body treatments in a tranquil environment.',
      category: 'SPA',
      address: '321 Wellness Way',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60611',
      phone: '+1312555001',
      website: 'https://serenityspa.com',
      isVerified: true,
      isActive: true,
      images: [],
      openingHours: {},
    },
  })

  // Services for business4
  await prisma.service.createMany({
    data: [
      {
        businessId: business4.id,
        name: 'Swedish Massage',
        description: 'Relaxing full-body massage',
        price: 120,
        duration: 60,
        category: 'Massage',
        isActive: true,
      },
      {
        businessId: business4.id,
        name: 'Deep Tissue Massage',
        description: 'Therapeutic massage for muscle tension',
        price: 140,
        duration: 75,
        category: 'Massage',
        isActive: true,
      },
      {
        businessId: business4.id,
        name: 'Hydrating Facial',
        description: 'Moisturizing facial treatment with mask',
        price: 95,
        duration: 60,
        category: 'Facial',
        isActive: true,
      },
    ],
  })

  // Create product categories and products
  // Products for Curls & Coils Beauty Bar (Hair Salon)
  const hairCareCategory = await prisma.productCategory.create({
    data: {
      businessId: business1.id,
      name: 'Hair Care',
      description: 'Premium hair care products for all curl patterns',
      displayOrder: 1,
      isActive: true,
    },
  })

  const stylingCategory = await prisma.productCategory.create({
    data: {
      businessId: business1.id,
      name: 'Styling Products',
      description: 'Professional styling products for natural hair',
      displayOrder: 2,
      isActive: true,
    },
  })

  await prisma.product.createMany({
    data: [
      {
        businessId: business1.id,
        categoryId: hairCareCategory.id,
        name: 'Moisturizing Shampoo',
        description: 'Sulfate-free shampoo for curly and coily hair',
        sku: 'CC-SHMP-001',
        price: 24.99,
        compareAtPrice: 29.99,
        trackInventory: true,
        quantity: 50,
        lowStockAlert: 10,
        images: [],
        displayOrder: 1,
        isActive: true,
        isFeatured: true,
        brand: 'Curls & Coils',
        tags: ['shampoo', 'moisturizing', 'sulfate-free'],
      },
      {
        businessId: business1.id,
        categoryId: hairCareCategory.id,
        name: 'Deep Conditioner',
        description: 'Intensive moisture treatment for dry, damaged hair',
        sku: 'CC-COND-001',
        price: 28.99,
        trackInventory: true,
        quantity: 45,
        lowStockAlert: 10,
        images: [],
        displayOrder: 2,
        isActive: true,
        brand: 'Curls & Coils',
        tags: ['conditioner', 'deep treatment', 'moisture'],
      },
      {
        businessId: business1.id,
        categoryId: stylingCategory.id,
        name: 'Curl Defining Cream',
        description: 'Lightweight cream for defined, bouncy curls',
        sku: 'CC-STYL-001',
        price: 22.99,
        trackInventory: true,
        quantity: 60,
        lowStockAlert: 15,
        images: [],
        displayOrder: 3,
        isActive: true,
        isFeatured: true,
        brand: 'Curls & Coils',
        tags: ['styling', 'curl cream', 'definition'],
      },
      {
        businessId: business1.id,
        categoryId: stylingCategory.id,
        name: 'Edge Control Gel',
        description: 'Long-lasting hold for edges and baby hairs',
        sku: 'CC-EDGE-001',
        price: 12.99,
        trackInventory: true,
        quantity: 100,
        lowStockAlert: 20,
        images: [],
        displayOrder: 4,
        isActive: true,
        brand: 'Curls & Coils',
        tags: ['edge control', 'gel', 'hold'],
      },
    ],
  })

  // Products for King Cuts Barbershop
  const groomingCategory = await prisma.productCategory.create({
    data: {
      businessId: business2.id,
      name: 'Grooming Essentials',
      description: 'Premium grooming products for men',
      displayOrder: 1,
      isActive: true,
    },
  })

  const beardCategory = await prisma.productCategory.create({
    data: {
      businessId: business2.id,
      name: 'Beard Care',
      description: 'Keep your beard looking fresh',
      displayOrder: 2,
      isActive: true,
    },
  })

  await prisma.product.createMany({
    data: [
      {
        businessId: business2.id,
        categoryId: beardCategory.id,
        name: 'Beard Oil',
        description: 'Nourishing oil blend for soft, healthy beards',
        sku: 'KC-BRDOIL-001',
        price: 18.99,
        compareAtPrice: 24.99,
        trackInventory: true,
        quantity: 75,
        lowStockAlert: 15,
        images: [],
        displayOrder: 1,
        isActive: true,
        isFeatured: true,
        brand: 'King Cuts',
        tags: ['beard oil', 'grooming', 'moisturizing'],
      },
      {
        businessId: business2.id,
        categoryId: beardCategory.id,
        name: 'Beard Balm',
        description: 'Styling balm for shape and control',
        sku: 'KC-BRDBLM-001',
        price: 16.99,
        trackInventory: true,
        quantity: 50,
        lowStockAlert: 10,
        images: [],
        displayOrder: 2,
        isActive: true,
        brand: 'King Cuts',
        tags: ['beard balm', 'styling', 'control'],
      },
      {
        businessId: business2.id,
        categoryId: groomingCategory.id,
        name: 'Hair Pomade',
        description: 'Medium hold pomade with natural shine',
        sku: 'KC-PMDE-001',
        price: 14.99,
        trackInventory: true,
        quantity: 80,
        lowStockAlert: 20,
        images: [],
        displayOrder: 3,
        isActive: true,
        brand: 'King Cuts',
        tags: ['pomade', 'hair styling', 'medium hold'],
      },
      {
        businessId: business2.id,
        categoryId: groomingCategory.id,
        name: 'Wave Brush',
        description: 'Premium boar bristle wave brush',
        sku: 'KC-BRSH-001',
        price: 25.99,
        trackInventory: true,
        quantity: 40,
        lowStockAlert: 10,
        images: [],
        displayOrder: 4,
        isActive: true,
        isFeatured: true,
        brand: 'King Cuts',
        tags: ['brush', 'waves', 'grooming tool'],
      },
    ],
  })

  // Products for Glow Up Nail Studio
  const nailCareCategory = await prisma.productCategory.create({
    data: {
      businessId: business3.id,
      name: 'Nail Care',
      description: 'Professional nail care products',
      displayOrder: 1,
      isActive: true,
    },
  })

  const polishCategory = await prisma.productCategory.create({
    data: {
      businessId: business3.id,
      name: 'Nail Polish',
      description: 'Long-lasting nail colors',
      displayOrder: 2,
      isActive: true,
    },
  })

  await prisma.product.createMany({
    data: [
      {
        businessId: business3.id,
        categoryId: nailCareCategory.id,
        name: 'Cuticle Oil',
        description: 'Nourishing oil for healthy cuticles',
        sku: 'GU-CUTL-001',
        price: 12.99,
        trackInventory: true,
        quantity: 100,
        lowStockAlert: 20,
        images: [],
        displayOrder: 1,
        isActive: true,
        brand: 'Glow Up',
        tags: ['cuticle oil', 'nail care', 'moisturizing'],
      },
      {
        businessId: business3.id,
        categoryId: nailCareCategory.id,
        name: 'Hand Cream',
        description: 'Luxurious hand cream with shea butter',
        sku: 'GU-HNDCRM-001',
        price: 15.99,
        compareAtPrice: 19.99,
        trackInventory: true,
        quantity: 60,
        lowStockAlert: 15,
        images: [],
        displayOrder: 2,
        isActive: true,
        isFeatured: true,
        brand: 'Glow Up',
        tags: ['hand cream', 'moisturizer', 'shea butter'],
      },
      {
        businessId: business3.id,
        categoryId: polishCategory.id,
        name: 'Gel Polish Set - Nude Collection',
        description: '6 nude shades gel polish collection',
        sku: 'GU-GELPOL-001',
        price: 45.99,
        trackInventory: true,
        quantity: 30,
        lowStockAlert: 5,
        images: [],
        displayOrder: 3,
        isActive: true,
        isFeatured: true,
        brand: 'Glow Up',
        tags: ['gel polish', 'nude', 'collection'],
      },
      {
        businessId: business3.id,
        categoryId: polishCategory.id,
        name: 'Top Coat - Quick Dry',
        description: 'Fast-drying top coat for lasting shine',
        sku: 'GU-TPCT-001',
        price: 9.99,
        trackInventory: true,
        quantity: 80,
        lowStockAlert: 20,
        images: [],
        displayOrder: 4,
        isActive: true,
        brand: 'Glow Up',
        tags: ['top coat', 'quick dry', 'nail polish'],
      },
    ],
  })

  // Products for Serenity Spa & Wellness
  const skincareCategory = await prisma.productCategory.create({
    data: {
      businessId: business4.id,
      name: 'Skincare',
      description: 'Luxury skincare products',
      displayOrder: 1,
      isActive: true,
    },
  })

  const wellnessCategory = await prisma.productCategory.create({
    data: {
      businessId: business4.id,
      name: 'Wellness',
      description: 'Products for mind and body wellness',
      displayOrder: 2,
      isActive: true,
    },
  })

  await prisma.product.createMany({
    data: [
      {
        businessId: business4.id,
        categoryId: skincareCategory.id,
        name: 'Hydrating Face Mask',
        description: 'Intensive hydration mask with hyaluronic acid',
        sku: 'SS-FCMSK-001',
        price: 32.99,
        compareAtPrice: 39.99,
        trackInventory: true,
        quantity: 40,
        lowStockAlert: 10,
        images: [],
        displayOrder: 1,
        isActive: true,
        isFeatured: true,
        brand: 'Serenity',
        tags: ['face mask', 'hydrating', 'skincare'],
      },
      {
        businessId: business4.id,
        categoryId: skincareCategory.id,
        name: 'Vitamin C Serum',
        description: 'Brightening serum for radiant skin',
        sku: 'SS-VITC-001',
        price: 48.99,
        trackInventory: true,
        quantity: 35,
        lowStockAlert: 10,
        images: [],
        displayOrder: 2,
        isActive: true,
        brand: 'Serenity',
        tags: ['serum', 'vitamin c', 'brightening'],
      },
      {
        businessId: business4.id,
        categoryId: wellnessCategory.id,
        name: 'Essential Oil Blend - Relaxation',
        description: 'Calming blend of lavender and chamomile',
        sku: 'SS-ESSOIL-001',
        price: 26.99,
        trackInventory: true,
        quantity: 50,
        lowStockAlert: 15,
        images: [],
        displayOrder: 3,
        isActive: true,
        isFeatured: true,
        brand: 'Serenity',
        tags: ['essential oil', 'aromatherapy', 'relaxation'],
      },
      {
        businessId: business4.id,
        categoryId: wellnessCategory.id,
        name: 'Massage Oil - Coconut & Almond',
        description: 'Nourishing massage oil blend',
        sku: 'SS-MSGOIL-001',
        price: 22.99,
        trackInventory: true,
        quantity: 45,
        lowStockAlert: 10,
        images: [],
        displayOrder: 4,
        isActive: true,
        brand: 'Serenity',
        tags: ['massage oil', 'coconut', 'almond'],
      },
    ],
  })

  // Add availability for businesses
  const daysOfWeek = [1, 2, 3, 4, 5, 6] // Monday to Saturday
  for (const dayOfWeek of daysOfWeek) {
    await prisma.availability.create({
      data: {
        businessId: business1.id,
        dayOfWeek,
        startTime: '09:00',
        endTime: '19:00',
        isActive: true,
      },
    })
    await prisma.availability.create({
      data: {
        businessId: business2.id,
        dayOfWeek,
        startTime: '10:00',
        endTime: '20:00',
        isActive: true,
      },
    })
    await prisma.availability.create({
      data: {
        businessId: business3.id,
        dayOfWeek,
        startTime: '10:00',
        endTime: '18:00',
        isActive: true,
      },
    })
    await prisma.availability.create({
      data: {
        businessId: business4.id,
        dayOfWeek,
        startTime: '09:00',
        endTime: '21:00',
        isActive: true,
      },
    })
  }

  // Create some bookings
  const services = await prisma.service.findMany()
  
  // Get services for Curls & Coils Beauty Bar
  const curlsServices = services.filter(s => s.businessId === business1.id)
  const washAndGo = curlsServices.find(s => s.name === 'Wash & Go')!
  const protectiveStyle = curlsServices.find(s => s.name === 'Protective Style Installation')!
  const deepCondition = curlsServices.find(s => s.name === 'Deep Conditioning Treatment')!

  // Create July 2025 bookings for Curls & Coils Beauty Bar
  const julyBookings = [
    // Week 1
    {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-01'),
      startTime: new Date('2025-07-01T10:00:00'),
      endTime: new Date('2025-07-01T11:30:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 65,
      notes: 'First time client, needs consultation for curl pattern'
    },
    {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: protectiveStyle.id,
      date: new Date('2025-07-02'),
      startTime: new Date('2025-07-02T09:00:00'),
      endTime: new Date('2025-07-02T13:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 150,
      notes: 'Box braids - medium length'
    },
    {
      userId: customer3.id,
      businessId: business1.id,
      serviceId: deepCondition.id,
      date: new Date('2025-07-03'),
      startTime: new Date('2025-07-03T14:00:00'),
      endTime: new Date('2025-07-03T15:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 45,
    },
    // Week 2
    {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: protectiveStyle.id,
      date: new Date('2025-07-08'),
      startTime: new Date('2025-07-08T11:00:00'),
      endTime: new Date('2025-07-08T15:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 150,
      notes: 'Senegalese twists'
    },
    {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-09'),
      startTime: new Date('2025-07-09T15:00:00'),
      endTime: new Date('2025-07-09T16:30:00'),
      status: BookingStatus.PENDING,
      totalPrice: 65,
    },
    {
      userId: customer3.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-10'),
      startTime: new Date('2025-07-10T12:00:00'),
      endTime: new Date('2025-07-10T13:30:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 65,
      notes: 'Regular client - prefers light products'
    },
    // Week 3
    {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: deepCondition.id,
      date: new Date('2025-07-15'),
      startTime: new Date('2025-07-15T16:00:00'),
      endTime: new Date('2025-07-15T17:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 45,
    },
    {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-16'),
      startTime: new Date('2025-07-16T10:00:00'),
      endTime: new Date('2025-07-16T11:30:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 65,
    },
    {
      userId: customer3.id,
      businessId: business1.id,
      serviceId: protectiveStyle.id,
      date: new Date('2025-07-17'),
      startTime: new Date('2025-07-17T09:00:00'),
      endTime: new Date('2025-07-17T13:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 150,
      notes: 'Knotless braids - waist length'
    },
    // Week 4
    {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-22'),
      startTime: new Date('2025-07-22T14:00:00'),
      endTime: new Date('2025-07-22T15:30:00'),
      status: BookingStatus.PENDING,
      totalPrice: 65,
    },
    {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: deepCondition.id,
      date: new Date('2025-07-23'),
      startTime: new Date('2025-07-23T11:00:00'),
      endTime: new Date('2025-07-23T12:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 45,
      notes: 'Protein treatment needed'
    },
    {
      userId: customer3.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-24'),
      startTime: new Date('2025-07-24T15:00:00'),
      endTime: new Date('2025-07-24T16:30:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 65,
    },
    // Last week of July
    {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: protectiveStyle.id,
      date: new Date('2025-07-29'),
      startTime: new Date('2025-07-29T10:00:00'),
      endTime: new Date('2025-07-29T14:00:00'),
      status: BookingStatus.PENDING,
      totalPrice: 150,
      notes: 'Faux locs installation'
    },
    {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: washAndGo.id,
      date: new Date('2025-07-30'),
      startTime: new Date('2025-07-30T13:00:00'),
      endTime: new Date('2025-07-30T14:30:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 65,
    },
    {
      userId: customer3.id,
      businessId: business1.id,
      serviceId: deepCondition.id,
      date: new Date('2025-07-31'),
      startTime: new Date('2025-07-31T16:00:00'),
      endTime: new Date('2025-07-31T17:00:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 45,
      notes: 'Monthly deep treatment'
    },
  ]

  // Create all July bookings
  for (const bookingData of julyBookings) {
    await prisma.booking.create({ data: bookingData })
  }

  console.log(`✅ Created ${julyBookings.length} bookings for Curls & Coils Beauty Bar in July 2025`)

  // Create original booking (January)
  const booking1 = await prisma.booking.create({
    data: {
      userId: customer1.id,
      businessId: business1.id,
      serviceId: services.find(s => s.businessId === business1.id)!.id,
      date: new Date('2025-01-20'),
      startTime: new Date('2025-01-20T14:00:00'),
      endTime: new Date('2025-01-20T15:30:00'),
      status: BookingStatus.COMPLETED,
      totalPrice: 65,
    },
  })

  const booking2 = await prisma.booking.create({
    data: {
      userId: customer2.id,
      businessId: business2.id,
      serviceId: services.find(s => s.businessId === business2.id)!.id,
      date: new Date('2025-01-22'),
      startTime: new Date('2025-01-22T15:00:00'),
      endTime: new Date('2025-01-22T15:45:00'),
      status: BookingStatus.CONFIRMED,
      totalPrice: 35,
    },
  })

  const booking3 = await prisma.booking.create({
    data: {
      userId: customer3.id,
      businessId: business4.id,
      serviceId: services.find(s => s.businessId === business4.id)!.id,
      date: new Date('2025-01-18'),
      startTime: new Date('2025-01-18T11:00:00'),
      endTime: new Date('2025-01-18T12:00:00'),
      status: BookingStatus.COMPLETED,
      totalPrice: 120,
    },
  })

  // Create reviews for completed bookings
  await prisma.review.create({
    data: {
      userId: customer1.id,
      businessId: business1.id,
      bookingId: booking1.id,
      rating: 5,
      comment: 'Amazing service! Tasha really knows how to work with natural hair. My curls have never looked better!',
    },
  })

  await prisma.review.create({
    data: {
      userId: customer3.id,
      businessId: business4.id,
      bookingId: booking3.id,
      rating: 5,
      comment: 'So relaxing and professional. The spa is beautiful and the massage was exactly what I needed.',
    },
  })

  // Create additional completed bookings for more reviews
  const booking4 = await prisma.booking.create({
    data: {
      userId: customer2.id,
      businessId: business1.id,
      serviceId: services.find(s => s.businessId === business1.id)!.id,
      date: new Date('2025-01-15'),
      startTime: new Date('2025-01-15T10:00:00'),
      endTime: new Date('2025-01-15T11:30:00'),
      status: BookingStatus.COMPLETED,
      totalPrice: 65,
    },
  })

  const booking5 = await prisma.booking.create({
    data: {
      userId: customer1.id,
      businessId: business2.id,
      serviceId: services.find(s => s.businessId === business2.id)!.id,
      date: new Date('2025-01-10'),
      startTime: new Date('2025-01-10T16:00:00'),
      endTime: new Date('2025-01-10T16:45:00'),
      status: BookingStatus.COMPLETED,
      totalPrice: 35,
    },
  })

  // Add more reviews for the new bookings
  await prisma.review.create({
    data: {
      userId: customer2.id,
      businessId: business1.id,
      bookingId: booking4.id,
      rating: 4,
      comment: 'Great experience overall. The stylist was knowledgeable and friendly.',
    },
  })

  await prisma.review.create({
    data: {
      userId: customer1.id,
      businessId: business2.id,
      bookingId: booking5.id,
      rating: 5,
      comment: 'Best barber in Atlanta! Always get compliments on my fade.',
    },
  })

  console.log('✅ Seed completed successfully!')
  console.log('\n📧 Test accounts created:')
  console.log('Customers:')
  console.log('  - customer1@example.com / password123')
  console.log('  - customer2@example.com / password123')
  console.log('  - customer3@example.com / password123')
  console.log('\nBusiness Owners:')
  console.log('  - business1@example.com / password123 (Curls & Coils Beauty Bar)')
  console.log('  - business2@example.com / password123 (King Cuts Barbershop)')
  console.log('  - business3@example.com / password123 (Glow Up Nail Studio)')
  console.log('  - business4@example.com / password123 (Serenity Spa & Wellness)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })