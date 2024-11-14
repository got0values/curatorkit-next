# 1. Base image with Node.js and work directory setup
FROM node:18-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
# RUN if [ -f package-lock.json ]; then npm ci; else echo "Lockfile not found." && exit 1; fi

RUN npm ci

# 2. Builder stage to build the application
FROM base AS builder
WORKDIR /app
# Copy all files to the builder
COPY . .

RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# 3. Production image to serve the built application
FROM node:18-alpine AS production
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Environment and user settings
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Uncomment if you want to run as a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000
ENV PORT=3000

# Start the server
# CMD HOSTNAME=localhost node server.js
CMD node server.js
