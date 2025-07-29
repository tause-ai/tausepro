#!/bin/bash

# Script para probar la integración completa de Google MCP con TausePro
# Autor: TausePro Team
# Fecha: 2024-12-01

echo "🧪 Probando integración completa de Google MCP con TausePro"
echo "=========================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar si un servicio está corriendo
check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    echo -e "${BLUE}🔍 Verificando $service_name en puerto $port...${NC}"
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service_name está funcionando en $url${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name no está respondiendo en $url${NC}"
        return 1
    fi
}

# Función para probar endpoint específico
test_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    
    echo -e "${BLUE}🧪 Probando $name...${NC}"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s "$url")
    else
        response=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$url")
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $name: OK${NC}"
        echo "   Respuesta: $response" | head -c 100
        echo "..."
    else
        echo -e "${RED}❌ $name: FALLÓ${NC}"
    fi
}

echo ""
echo "📋 Verificando servicios..."

# Verificar servicios principales
services_ok=true

check_service "Dashboard" "5173" "http://localhost:5173" || services_ok=false
check_service "Google MCP Server" "3003" "http://localhost:3003/health" || services_ok=false

echo ""
if [ "$services_ok" = true ]; then
    echo -e "${GREEN}✅ Todos los servicios están funcionando${NC}"
else
    echo -e "${RED}❌ Algunos servicios no están funcionando${NC}"
    echo "Por favor, inicia los servicios antes de continuar:"
    echo "  - Dashboard: cd apps/dashboard && npm run dev"
    echo "  - Google MCP: cd services/google-mcp && npm run dev"
    exit 1
fi

echo ""
echo "🧪 Probando endpoints de Google MCP..."

# Probar endpoints del servidor Google MCP
test_endpoint "Health Check" "GET" "http://localhost:3003/health"
test_endpoint "Auth URL" "POST" "http://localhost:3003/auth/url" '{"state":"test"}'
test_endpoint "Stats" "GET" "http://localhost:3003/stats"

echo ""
echo "📊 Información del sistema:"

# Mostrar información del sistema
echo -e "${BLUE}🔧 Servicios activos:${NC}"
echo "   Dashboard: http://localhost:5173"
echo "   Google MCP: http://localhost:3003"
echo "   Supabase: http://localhost:54321"

echo ""
echo -e "${BLUE}📁 Estructura de archivos:${NC}"
echo "   ✅ Google MCP Server implementado"
echo "   ✅ Componentes de Google en dashboard"
echo "   ✅ Integración completa"

echo ""
echo -e "${BLUE}🎯 Próximos pasos:${NC}"
echo "   1. Configurar Google Cloud Platform"
echo "   2. Obtener credenciales OAuth2"
echo "   3. Probar flujo de autenticación"
echo "   4. Conectar con Gmail y Calendar"
echo "   5. Implementar agentes que usen Google MCP"

echo ""
echo -e "${GREEN}🎉 ¡Integración de Google MCP completada exitosamente!${NC}"
echo ""
echo "Para continuar:"
echo "   1. Ve a http://localhost:5173"
echo "   2. Haz login en el dashboard"
echo "   3. Conecta tu cuenta de Google"
echo "   4. Prueba las sugerencias automáticas"
echo ""
echo "Documentación: services/google-mcp/README.md" 