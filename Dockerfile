# Use Bun base image
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies in a separate stage
FROM base AS deps
# Copy package files
COPY package.json bun.lockb ./
# Install dependencies with frozen lockfile to ensure reproducibility
RUN bun install --frozen-lockfile

# Build the application
FROM base AS builder
# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

# Production stage
FROM base AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for production
COPY --from=builder /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose the port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Start the application
CMD ["bun", "server.js"]