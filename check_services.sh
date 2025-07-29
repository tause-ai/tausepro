#!/bin/bash

echo "🔍 VERIFICANDO SERVICIOS - TausePro"
echo "===================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 VERIFICANDO SERVICIOS${NC}"
echo ""

# Verificar Dashboard
echo -e "${YELLOW}1. Dashboard (Vite + React)${NC}"
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Dashboard funcionando en http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Dashboard no responde${NC}"
    echo -e "${YELLOW}💡 Iniciando dashboard...${NC}"
    cd apps/dashboard && npm run dev &
    sleep 3
    if curl -s http://localhost:5173 > /dev/null; then
        echo -e "${GREEN}✅ Dashboard iniciado correctamente${NC}"
    else
        echo -e "${RED}❌ Error al iniciar dashboard${NC}"
    fi
fi

# Verificar Supabase API
echo -e "${YELLOW}2. Supabase API${NC}"
if curl -s http://127.0.0.1:54321/rest/v1/ > /dev/null; then
    echo -e "${GREEN}✅ Supabase API funcionando en http://127.0.0.1:54321${NC}"
else
    echo -e "${RED}❌ Supabase API no responde${NC}"
    echo -e "${YELLOW}💡 Iniciando Supabase...${NC}"
    supabase start
fi

# Verificar Supabase Studio
echo -e "${YELLOW}3. Supabase Studio${NC}"
if curl -s http://127.0.0.1:54323 > /dev/null; then
    echo -e "${GREEN}✅ Supabase Studio funcionando en http://127.0.0.1:54323${NC}"
else
    echo -e "${RED}❌ Supabase Studio no responde${NC}"
fi

echo ""
echo -e "${BLUE}🌐 URLs DE ACCESO${NC}"
echo "----------------------------------------"
echo -e "${GREEN}📊 Dashboard: http://localhost:5173${NC}"
echo -e "${GREEN}📝 Registro: http://localhost:5173/admin/register${NC}"
echo -e "${GREEN}🔐 Login: http://localhost:5173/admin/login${NC}"
echo -e "${GREEN}🛠️ Supabase Studio: http://127.0.0.1:54323${NC}"
echo -e "${GREEN}📧 Email Testing: http://127.0.0.1:54324${NC}"

echo ""
echo -e "${BLUE}🧪 PARA PROBAR${NC}"
echo "----------------------------------------"
echo "1. Abrir http://localhost:5173/admin/register"
echo "2. Crear cuenta con datos de prueba:"
echo "   - Nombre: Test User"
echo "   - Empresa: Test Company"
echo "   - Email: test@example.com"
echo "   - Contraseña: password123"
echo "3. Verificar en Supabase Studio"
echo "4. Hacer login y explorar dashboard"

echo ""
echo -e "${GREEN}🎉 ¡SERVICIOS LISTOS!${NC}" 