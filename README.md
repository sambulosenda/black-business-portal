# Beauty & Wellness Booking Platform

A modern appointment booking platform designed specifically for Black-owned beauty and wellness businesses. Built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## Features

### For Customers
- 🔍 Browse and search businesses by category, location, and ratings
- 📅 Book appointments with real-time availability
- 👤 Manage bookings and view history
- ⭐ Leave reviews after appointments

### For Business Owners
- 🏪 Create and manage business profiles
- 💇‍♀️ Add and manage services with pricing
- 📊 View booking analytics and customer insights
- 📱 Manage availability and appointments

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+ or Bun
- PostgreSQL database (local or cloud)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd businesportal
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/beauty_portal"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

4. Run database migrations:
```bash
bunx prisma migrate dev
```

5. Seed the database (optional):
```bash
bun run db:seed
```

6. Start the development server:
```bash
bun dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Test Accounts

After seeding the database, you can use these test accounts:

### Customers
- `customer1@example.com` / `password123`
- `customer2@example.com` / `password123`
- `customer3@example.com` / `password123`

### Business Owners
- `business1@example.com` / `password123` - Curls & Coils Beauty Bar
- `business2@example.com` / `password123` - King Cuts Barbershop
- `business3@example.com` / `password123` - Glow Up Nail Studio
- `business4@example.com` / `password123` - Serenity Spa & Wellness

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── business/          # Business management pages
│   ├── book/              # Booking flow
│   └── dashboard/         # User dashboards
├── lib/                   # Utility functions and configurations
├── types/                 # TypeScript type definitions
└── prisma/               # Database schema and migrations
```

## Key Features Implementation

- **Authentication**: Separate signup flows for customers and businesses with role-based access
- **Search**: Full-text search with filters for category, city, and ratings
- **Booking System**: Calendar-based booking with real-time availability checking
- **Business Management**: Service CRUD operations and dashboard analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Acknowledgments

Built with ❤️ to support Black-owned beauty and wellness businesses.