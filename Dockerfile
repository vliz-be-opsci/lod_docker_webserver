# ==========================================
# Stage 1: Build the static LOD website
# ==========================================
FROM oven/bun:1.1 AS builder

WORKDIR /app

# Copy configuration files and install dependencies
COPY package.json tsconfig.json ./
RUN bun install --frozen-lockfile

# Copy generator files and assets
COPY generator/ ./generator/
COPY wrx.pdf ./wrx.pdf

# Set environment variables for build time
ENV BASE_URL=http://localhost:8080
ENV GEN_LIMIT=150

# Run generator to build all pages and configs
RUN bun run generate

# ==========================================
# Stage 2: Serve using Nginx
# ==========================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy static assets from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
