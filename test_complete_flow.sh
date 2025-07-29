#!/bin/bash

echo "🧪 Probando Flujo Completo - TausePro con Supabase"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# URLs de prueba
DASHBOARD_URL="http://localhost:5173"
REGISTER_URL="$DASHBOARD_URL/admin/register"
LOGIN_URL="$DASHBOARD_URL/admin/login"
SUPABASE_STUDIO_URL="http://127.0.0.1:54323"

echo -e "${BLUE}🎯 FLUJO DE PRUEBA COMPLETO${NC}"
echo ""

echo -e "${YELLOW}1. VERIFICACIÓN DE SERVICIOS${NC}"
echo "----------------------------------------"

# Verificar Dashboard
if curl -s "$DASHBOARD_URL" > /dev/null; then
    echo -e "${GREEN}✅ Dashboard funcionando${NC}"
else
    echo -e "${RED}❌ Dashboard no responde${NC}"
    exit 1
fi

# Verificar Supabase Studio
if curl -s "$SUPABASE_STUDIO_URL" > /dev/null; then
    echo -e "${GREEN}✅ Supabase Studio funcionando${NC}"
else
    echo -e "${RED}❌ Supabase Studio no responde${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}2. PASOS PARA PROBAR${NC}"
echo "---------------------------"

echo -e "${BLUE}📝 PASO 1: Registro de Usuario${NC}"
echo "   • Abrir: $REGISTER_URL"
echo "   • Llenar formulario con datos de prueba:"
echo "     - Nombre: Test User"
echo "     - Empresa: Test Company"
echo "     - Email: test@example.com"
echo "     - Contraseña: password123"
echo ""

echo -e "${BLUE}🔍 PASO 2: Verificar en Supabase Studio${NC}"
echo "   • Abrir: $SUPABASE_STUDIO_URL"
echo "   • Ir a Authentication > Users"
echo "   • Verificar que se creó el usuario"
echo "   • Ir a Table Editor > users"
echo "   • Verificar que se creó el registro en users"
echo ""

echo -e "${BLUE}🔐 PASO 3: Login${NC}"
echo "   • Ir a: $LOGIN_URL"
echo "   • Usar credenciales: test@example.com / password123"
echo "   • Verificar redirección al dashboard"
echo ""

echo -e "${BLUE}📊 PASO 4: Verificar Paywall${NC}"
echo "   • En el dashboard, buscar sección 'Límites de Uso'"
echo "   • Verificar que muestra:"
echo "     - API Calls: 0/100"
echo "     - MCP Agents: 0/3"
echo "     - WhatsApp Messages: 0/50"
echo ""

echo -e "${BLUE}🧪 PASO 5: Probar Incremento de Uso${NC}"
echo "   • Hacer clic en 'Resetear Límites (Testing)'"
echo "   • Verificar que se resetean los contadores"
echo "   • Probar incrementar uso manualmente"
echo ""

echo -e "${YELLOW}3. URLs DE ACCESO${NC}"
echo "----------------------"
echo -e "${GREEN}📊 Dashboard: $DASHBOARD_URL${NC}"
echo -e "${GREEN}📝 Registro: $REGISTER_URL${NC}"
echo -e "${GREEN}🔐 Login: $LOGIN_URL${NC}"
echo -e "${GREEN}🛠️ Supabase Studio: $SUPABASE_STUDIO_URL${NC}"
echo -e "${GREEN}📧 Email Testing: http://127.0.0.1:54324${NC}"

echo ""
echo -e "${YELLOW}4. CREDENCIALES DE PRUEBA${NC}"
echo "-------------------------------"
echo -e "${GREEN}Email: test@example.com${NC}"
echo -e "${GREEN}Contraseña: password123${NC}"
echo -e "${GREEN}ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0${NC}"

echo ""
echo -e "${YELLOW}5. COMANDOS ÚTILES${NC}"
echo "------------------------"
echo "supabase status          # Estado de servicios"
echo "supabase logs --follow   # Ver logs en tiempo real"
echo "supabase db reset        # Resetear base de datos"
echo "curl $DASHBOARD_URL      # Probar dashboard"
echo "curl $SUPABASE_STUDIO_URL # Probar Supabase Studio"

echo ""
echo -e "${YELLOW}6. TROUBLESHOOTING${NC}"
echo "-------------------------"
echo "• Si el registro falla: Verificar Supabase está corriendo"
echo "• Si el login falla: Verificar usuario creado en Studio"
echo "• Si paywall no carga: Verificar conexión a Supabase"
echo "• Si hay errores: Revisar logs con 'supabase logs'"

echo ""
echo -e "${GREEN}🎉 ¡LISTO PARA PROBAR!${NC}"
echo ""
echo -e "${BLUE}💡 CONSEJO: Abre las URLs en tu navegador y sigue los pasos paso a paso.${NC}" 