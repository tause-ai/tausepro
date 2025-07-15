#!/bin/bash
# setup.sh - Script inicial para TausePro

echo "🚀 Configurando TausePro - Plataforma MCP para PYMEs Colombia..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Verificar dependencias
echo -e "${YELLOW}Verificando dependencias...${NC}"
command -v docker >/dev/null 2>&1 || { echo "❌ Docker requerido"; exit 1; }
command -v go >/dev/null 2>&1 || { echo "❌ Go requerido"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js requerido"; exit 1; }

# Copiar archivo de environment
echo -e "${YELLOW}📋 Configurando environment...${NC}"
cp .env.example .env

# Instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
make install

# Iniciar servicios
echo -e "${YELLOW}🐳 Iniciando servicios Docker...${NC}"
make dev

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando servicios...${NC}"
sleep 10

# Ejecutar migraciones
echo -e "${YELLOW}🗄️ Ejecutando migraciones...${NC}"
make migrate

# Seed data Colombia
echo -e "${YELLOW}🇨🇴 Cargando datos de Colombia...${NC}"
make seed-colombia

echo -e "${GREEN}✅ TausePro configurado exitosamente!${NC}"
echo ""
echo "URLs de desarrollo:"
echo "  - Landing: http://localhost:3000 (tause.pro)"
echo "  - Dashboard: http://localhost:5173 (app.tause.pro)"
echo "  - API: http://localhost:8080 (api.tause.pro)"
echo "  - PocketBase Admin: http://localhost:8090/_/"
echo ""
echo "Próximos pasos:"
echo "  1. Configurar variables en .env"
echo "  2. Crear cuenta admin: make create-admin"
echo "  3. Probar paywall: make test-paywall"
echo "  4. Ver logs: make monitor" 