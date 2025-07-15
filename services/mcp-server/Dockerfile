# Dockerfile para TausePro MCP Server
FROM golang:1.21-alpine AS builder

# Instalar dependencias del sistema
RUN apk add --no-cache git ca-certificates tzdata

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY go.mod go.sum ./

# Descargar dependencias
RUN go mod download

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Imagen final optimizada
FROM alpine:latest

# Instalar ca-certificates para HTTPS
RUN apk --no-cache add ca-certificates tzdata

# Crear usuario no-root
RUN addgroup -g 1001 -S tausepro && \
    adduser -u 1001 -S tausepro -G tausepro

# Establecer directorio de trabajo
WORKDIR /root/

# Copiar binario desde builder
COPY --from=builder /app/main .

# Crear directorio para archivos temporales
RUN mkdir -p /tmp/tausepro && \
    chown -R tausepro:tausepro /tmp/tausepro

# Cambiar a usuario no-root
USER tausepro

# Exponer puerto
EXPOSE 8080

# Variables de entorno por defecto
ENV PORT=8080
ENV GO_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Comando por defecto
CMD ["./main"] 