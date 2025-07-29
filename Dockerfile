# TausePro Dockerfile for Fly.io deployment
# Multi-stage build optimized for production

# Stage 1: Build MCP Server (Go)
FROM golang:1.22-alpine AS mcp-builder
WORKDIR /app
COPY services/mcp-server/go.mod services/mcp-server/go.sum ./
RUN go mod download
COPY services/mcp-server/ .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Stage 2: Production image
FROM alpine:latest
RUN apk --no-cache add ca-certificates tzdata wget python3
WORKDIR /root/

# Copy MCP Server
COPY --from=mcp-builder /app/main .
COPY services/mcp-server/config.env .

# Copy Dashboard build (pre-built locally)
COPY apps/dashboard/dist ./dashboard

# Copy Landing build (pre-built locally)
COPY apps/landing/dist ./landing

# Download PocketBase
RUN wget https://github.com/pocketbase/pocketbase/releases/download/v0.22.6/pocketbase_0.22.6_linux_amd64.zip && \
    unzip pocketbase_0.22.6_linux_amd64.zip && \
    rm pocketbase_0.22.6_linux_amd64.zip && \
    chmod +x pocketbase

# Create directories for data
RUN mkdir -p /data/pocketbase /data/redis /data/postgres

# Expose ports
EXPOSE 8080 8090 5173 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start script
COPY start.sh .
RUN chmod +x start.sh

CMD ["./start.sh"] 