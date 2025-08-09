# Beauty & Wellness Booking Platform

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Critical Environment Notes

**NETWORK RESTRICTIONS**: Some environments have network limitations that block external downloads. These affect:
- Prisma binary downloads from `binaries.prisma.sh` 
- Google Fonts from `fonts.googleapis.com`

If you encounter these issues, document them and provide alternative approaches.

## Working Effectively

### Initial Setup (Required Dependencies)
- Install Bun (preferred) or use npm as fallback:
  ```bash
  curl -fsSL https://bun.sh/install | bash
  source ~/.bashrc
  ```
- Node.js 20+ is required (already available in most environments)

### Bootstrap and Build Process
- **Install dependencies**:
  ```bash
  bun install    # preferred - takes ~1-2 minutes
  # OR if Bun fails:
  npm install --ignore-scripts    # fallback - takes ~10-30 seconds
  ```

- **Environment Setup**:
  ```bash
  cp .env.example .env
  # Edit .env with appropriate values for your environment
  ```

- **Development Server** (ALWAYS works):
  ```bash
  bun dev    # preferred
  # OR:
  npm run dev
  # Server starts in ~2 seconds, available at http://localhost:3000
  # Uses Turbopack for fast builds
  ```

- **Linting** (Quick validation):
  ```bash
  bun run lint    # takes ~6 seconds
  # OR:
  npm run lint
  ```

- **Format checking**:
  ```bash
  bun run format:check    # takes ~7 seconds
  bun run format         # to fix formatting issues
  ```

- **Production Build** (Network dependent):
  ```bash
  bun run build    # NEVER CANCEL: May take 30-60 minutes if Prisma needs to download binaries
  # OR:
  npm run build
  # Set timeout to 90+ minutes for safety
  ```

### Database Operations (Network dependent)
- **Generate Prisma Client**:
  ```bash
  bunx prisma generate    # May fail in network-restricted environments
  # OR:
  npx prisma generate
  ```

- **Run Migrations**:
  ```bash
  bunx prisma migrate dev    # Requires database connection
  ```

- **Seed Database**:
  ```bash
  bun run db:seed    # Optional, requires working Prisma client
  ```

## Validation

### Manual Testing Scenarios
After making changes, ALWAYS test these user scenarios:

1. **Homepage loads correctly**: Visit http://localhost:3000 and verify the Glamfric homepage displays
2. **Search functionality**: Test the search form on homepage
3. **Navigation**: Click through main navigation links
4. **Business signup flow**: Test `/business/join` route
5. **Customer signup flow**: Test `/signup/customer` route

### Build Validation
- Always run `bun run lint` before committing changes
- Format code with `bun run format` to maintain consistency
- Test the development server starts successfully after changes

### Expected Build Times and Timeouts
- **Dependency installation**: 1-2 minutes (Bun), 10-30 seconds (npm)
- **Development server startup**: 2-3 seconds
- **Linting**: 6 seconds
- **Format checking**: 7 seconds  
- **Production build**: 30-60 minutes (NEVER CANCEL - may need to download Prisma binaries)
- **CRITICAL**: Always set timeouts to 90+ minutes for build commands

## Common Issues and Workarounds

### Network Restrictions
If Prisma binary downloads fail:
1. Try `npm install --ignore-scripts` first
2. Use development server instead of production build for testing
3. Comment out Prisma imports temporarily to test other functionality
4. Document the limitation in code comments

### Google Fonts Issues  
If fonts fail to download:
1. Temporarily replace Google Font imports with local fonts
2. Use system fonts as fallback
3. Continue with development/testing using fallback fonts

### TypeScript Strict Mode
- Project uses strict TypeScript - be explicit with types
- Common fix for reduce operations: `(acc: number, item: any) => acc + item.value`

## Project Structure

```
src/
├── app/                 # Next.js App Router (main application)
│   ├── (auth)/         # Authentication pages  
│   ├── (business)/     # Business management pages
│   ├── (customer)/     # Customer-facing pages
│   ├── (public)/       # Public pages
│   ├── api/            # API routes
│   ├── layout.tsx      # Root layout with fonts
│   └── page.tsx        # Homepage
├── components/         # Reusable components
│   ├── features/       # Feature-specific components
│   ├── layouts/        # Layout components  
│   ├── shared/         # Shared utilities
│   └── ui/             # UI components (shadcn/ui)
├── lib/                # Utility functions
├── types/              # TypeScript definitions
└── styles/             # Global styles
```

### Key Files
- `package.json` - Uses Bun as preferred package manager
- `prisma/schema.prisma` - Database schema (PostgreSQL)
- `next.config.ts` - Next.js configuration with image domains
- `tsconfig.json` - TypeScript configuration with strict mode
- `eslint.config.mjs` - ESLint configuration (flat config format)
- `.env.example` - Environment variables template

## Technology Stack
- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (PostCSS plugin approach)  
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI + shadcn/ui
- **Package Manager**: Bun (preferred) or npm (fallback)

## Test Accounts (After Database Seeding)
- **Customers**: `customer1@example.com` / `password123`
- **Business**: `business1@example.com` / `password123` (Curls & Coils Beauty Bar)

## Development Best Practices
- Always start with `bun dev` to test changes
- Use `bun run lint` before committing
- Keep font imports in `src/app/layout.tsx` - modify carefully in restricted environments
- Database operations require working PostgreSQL connection
- Build times vary significantly based on network access - be patient and never cancel builds

## Troubleshooting
- If Prisma fails: Continue with frontend development using mock data
- If fonts fail: Switch to system fonts temporarily  
- If build hangs: Wait at least 60 minutes before investigating
- Always check network connectivity issues first before debugging code problems