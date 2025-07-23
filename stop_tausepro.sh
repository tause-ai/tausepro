#!/bin/bash
# DETENER SERVICIOS TAUSEPRO

echo "🛑 Deteniendo servicios TausePro..."

# Detener procesos Go (backend)
echo "Deteniendo backend..."
pkill -f "go run cmd/server/main.go" 2>/dev/null || echo "Backend no estaba corriendo"

# Detener procesos Node.js (frontend)
echo "Deteniendo dashboard..."
pkill -f "npm run dev.*dashboard" 2>/dev/null || echo "Dashboard no estaba corriendo"

echo "Deteniendo landing..."
pkill -f "npm run dev.*landing" 2>/dev/null || echo "Landing no estaba corriendo"

# Detener Redis
echo "Deteniendo Redis..."
docker stop tausepro-redis 2>/dev/null || echo "Redis no estaba corriendo"

# Verificar que se detuvieron
echo ""
echo "🔍 Verificando que los servicios se detuvieron:"

if ! lsof -i:8081 > /dev/null 2>&1; then
    echo "✅ Backend detenido (puerto 8081 libre)"
else
    echo "❌ Backend aún corriendo en puerto 8081"
fi

if ! lsof -i:5173 > /dev/null 2>&1; then
    echo "✅ Dashboard detenido (puerto 5173 libre)"
else
    echo "❌ Dashboard aún corriendo en puerto 5173"
fi

if ! lsof -i:3000 > /dev/null 2>&1; then
    echo "✅ Landing detenido (puerto 3000 libre)"
else
    echo "❌ Landing aún corriendo en puerto 3000"
fi

if ! docker ps | grep -q tausepro-redis; then
    echo "✅ Redis detenido"
else
    echo "❌ Redis aún corriendo"
fi

echo ""
echo "✨ Todos los servicios de TausePro han sido detenidos"
echo ""
echo "Para reiniciar: ./setup_tausepro.sh" 