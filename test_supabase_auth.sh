#!/bin/bash

echo "🧪 Probando Autenticación de Supabase - TausePro"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs de prueba
DASHBOARD_URL="http://localhost:5173"
SUPABASE_API_URL="http://127.0.0.1:54321"
SUPABASE_STUDIO_URL="http://127.0.0.1:54323"

echo -e "${YELLOW}1. Verificando servicios...${NC}"

# Verificar Dashboard
if curl -s "$DASHBOARD_URL" > /dev/null; then
    echo -e "${GREEN}✅ Dashboard funcionando en $DASHBOARD_URL${NC}"
else
    echo -e "${RED}❌ Dashboard no responde en $DASHBOARD_URL${NC}"
fi

# Verificar Supabase API
if curl -s "$SUPABASE_API_URL/rest/v1/" > /dev/null; then
    echo -e "${GREEN}✅ Supabase API funcionando en $SUPABASE_API_URL${NC}"
else
    echo -e "${RED}❌ Supabase API no responde en $SUPABASE_API_URL${NC}"
fi

# Verificar Supabase Studio
if curl -s "$SUPABASE_STUDIO_URL" > /dev/null; then
    echo -e "${GREEN}✅ Supabase Studio funcionando en $SUPABASE_STUDIO_URL${NC}"
else
    echo -e "${RED}❌ Supabase Studio no responde en $SUPABASE_STUDIO_URL${NC}"
fi

echo ""
echo -e "${YELLOW}2. URLs de Acceso:${NC}"
echo -e "${GREEN}📊 Dashboard: $DASHBOARD_URL${NC}"
echo -e "${GREEN}🔐 Login: $DASHBOARD_URL/admin/login${NC}"
echo -e "${GREEN}📝 Registro: $DASHBOARD_URL/admin/register${NC}"
echo -e "${GREEN}🛠️ Supabase Studio: $SUPABASE_STUDIO_URL${NC}"
echo -e "${GREEN}📧 Email Testing: http://127.0.0.1:54324${NC}"

echo ""
echo -e "${YELLOW}3. Credenciales de Prueba:${NC}"
echo -e "${GREEN}ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0${NC}"

echo ""
echo -e "${YELLOW}4. Pasos para Probar:${NC}"
echo "1. Abrir $DASHBOARD_URL/admin/register"
echo "2. Crear una cuenta con datos de prueba"
echo "3. Verificar en Supabase Studio que se creó el usuario"
echo "4. Probar login en $DASHBOARD_URL/admin/login"
echo "5. Verificar redirección al dashboard"

echo ""
echo -e "${YELLOW}5. Comandos Útiles:${NC}"
echo "supabase status          # Estado de servicios"
echo "supabase logs --follow   # Ver logs en tiempo real"
echo "supabase db reset        # Resetear base de datos"
echo "supabase stop            # Parar servicios"
echo "supabase start           # Iniciar servicios"

echo ""
echo -e "${GREEN}🎉 ¡Listo para probar!${NC}" 