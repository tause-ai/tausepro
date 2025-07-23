#!/bin/bash
# IMPLEMENTACIÓN RÁPIDA TAUSEPRO MVP

# =========================
# 1. LEVANTAR SERVICIOS
# =========================

echo "🚀 Levantando servicios TausePro..."

# Terminal 1: Backend (si no está corriendo)
cd services/mcp-server
if ! lsof -i:8081 > /dev/null; then
    echo "Iniciando backend en :8081..."
    go run cmd/server/main.go &
    BACKEND_PID=$!
    echo "Backend iniciado con PID: $BACKEND_PID"
else
    echo "✅ Backend ya está corriendo en :8081"
fi

# Terminal 2: Redis
if ! docker ps | grep -q redis; then
    echo "Iniciando Redis..."
    docker run -d --name tausepro-redis -p 6379:6379 redis:alpine
else
    echo "✅ Redis ya está corriendo"
fi

# Terminal 3: Dashboard
cd ../../apps/dashboard
if ! lsof -i:5173 > /dev/null; then
    echo "Instalando dependencias del dashboard..."
    npm install
    echo "Iniciando dashboard en :5173..."
    npm run dev &
    DASHBOARD_PID=$!
    echo "Dashboard iniciado con PID: $DASHBOARD_PID"
else
    echo "✅ Dashboard ya está corriendo en :5173"
fi

# Terminal 4: Landing
cd ../landing
if ! lsof -i:3000 > /dev/null; then
    echo "Instalando dependencias de landing..."
    npm install
    echo "Iniciando landing en :3000..."
    npm run dev &
    LANDING_PID=$!
    echo "Landing iniciado con PID: $LANDING_PID"
else
    echo "✅ Landing ya está corriendo en :3000"
fi

# =========================
# 2. VERIFICAR SERVICIOS
# =========================

echo ""
echo "⏳ Esperando que los servicios inicien..."
sleep 5

echo ""
echo "🔍 Verificando servicios:"
echo ""

# Backend
if curl -s http://localhost:8081/health > /dev/null; then
    echo "✅ Backend API: http://localhost:8081"
else
    echo "❌ Backend no responde"
fi

# Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: localhost:6379"
else
    echo "❌ Redis no responde"
fi

# Dashboard
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Dashboard: http://localhost:5173"
else
    echo "❌ Dashboard no responde"
fi

# Landing
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Landing: http://localhost:3000"
else
    echo "❌ Landing no responde"
fi

# =========================
# 3. CONFIGURAR VARIABLES
# =========================

echo ""
echo "⚙️ Configurando variables de entorno..."

# Backend .env
if [ ! -f "services/mcp-server/.env" ]; then
    cat > services/mcp-server/.env << EOF
# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# Cache
ANALYSIS_CACHE_TTL=86400
CACHE_ENABLED=true

# Rate Limiting
RATE_LIMIT_ENABLED=true
ANALYSIS_DAILY_LIMIT=100
API_RATE_LIMIT_WINDOW=3600

# Tavily API (configurar en Super Admin)
TAVILY_API_KEY=

# OpenAI API (configurar en Super Admin)
OPENAI_API_KEY=
EOF
    echo "✅ Archivo .env del backend creado"
fi

# Frontend .env
if [ ! -f "apps/dashboard/.env" ]; then
    cat > apps/dashboard/.env << EOF
VITE_API_URL=http://localhost:8081
VITE_ENABLE_CACHE=true
VITE_REDIS_URL=redis://localhost:6379
EOF
    echo "✅ Archivo .env del dashboard creado"
fi

if [ ! -f "apps/landing/.env" ]; then
    cat > apps/landing/.env << EOF
PUBLIC_API_URL=http://localhost:8081
PUBLIC_DASHBOARD_URL=http://localhost:5173
EOF
    echo "✅ Archivo .env del landing creado"
fi

# =========================
# 4. TEST RÁPIDO
# =========================

echo ""
echo "🧪 Ejecutando test rápido..."

# Test análisis
echo ""
echo "Testing análisis endpoint:"
curl -X POST http://localhost:8081/api/v1/analysis/analyze \
  -H "Content-Type: application/json" \
  -d '{"url":"https://tez.com.co"}' | jq . 2>/dev/null || echo "jq no disponible, mostrando respuesta sin formato"

# =========================
# 5. ACCESOS RÁPIDOS
# =========================

echo ""
echo "✨ TausePro está listo!"
echo ""
echo "🌐 URLs de acceso:"
echo "   Landing: http://localhost:3000"
echo "   Dashboard: http://localhost:5173"
echo "   API Health: http://localhost:8081/health"
echo ""
echo "🔧 Comandos útiles:"
echo "   Ver logs backend: tail -f services/mcp-server/logs/app.log"
echo "   Ver logs Redis: docker logs tausepro-redis"
echo "   Limpiar cache: redis-cli FLUSHALL"
echo "   Detener servicios: ./stop_tausepro.sh"
echo ""
echo "📚 Próximos pasos:"
echo "   1. Visita http://localhost:3000/analisis"
echo "   2. Analiza una empresa"
echo "   3. Regístrate para ver el reporte completo"
echo "   4. Configura tu agente WhatsApp"
echo ""
echo "🎯 Características implementadas:"
echo "   ✅ Análisis robusto con scoring detallado"
echo "   ✅ Cache Redis para performance"
echo "   ✅ Sistema multi-tenant"
echo "   ✅ Rate limiting inteligente"
echo "   ✅ Paywall con preview"

# =========================
# FUNCIÓN HELPER: Aplicar cambios de código
# =========================

apply_code_improvements() {
    echo "Aplicando mejoras de código..."
    
    # 1. Verificar que los archivos ya existen
    if [ -f "services/mcp-server/internal/services/scoring.go" ]; then
        echo "✅ Scoring algorithm ya implementado"
    else
        echo "❌ Scoring algorithm no encontrado"
    fi
    
    if [ -f "services/mcp-server/internal/cache/redis_cache.go" ]; then
        echo "✅ Redis cache ya implementado"
    else
        echo "❌ Redis cache no encontrado"
    fi
    
    if [ -f "services/mcp-server/internal/tenant/manager.go" ]; then
        echo "✅ Multi-tenant ya implementado"
    else
        echo "❌ Multi-tenant no encontrado"
    fi
    
    echo "✅ Verificación completada"
}

# =========================
# TROUBLESHOOTING
# =========================

troubleshoot() {
    echo ""
    echo "🔧 Troubleshooting común:"
    echo ""
    
    # Puerto ocupado
    if lsof -i:8081 | grep -v "go"; then
        echo "⚠️ Puerto 8081 ocupado por otro proceso"
        echo "   Solución: kill -9 $(lsof -t -i:8081)"
    fi
    
    # Redis no conecta
    if ! redis-cli ping > /dev/null 2>&1; then
        echo "⚠️ Redis no está corriendo"
        echo "   Solución: docker start tausepro-redis"
    fi
    
    # NPM errors
    if [ ! -d "apps/dashboard/node_modules" ]; then
        echo "⚠️ Dependencias del dashboard no instaladas"
        echo "   Solución: cd apps/dashboard && npm install"
    fi
    
    if [ ! -d "apps/landing/node_modules" ]; then
        echo "⚠️ Dependencias del landing no instaladas"
        echo "   Solución: cd apps/landing && npm install"
    fi
    
    # Go modules
    if [ ! -f "services/mcp-server/go.mod" ]; then
        echo "⚠️ Go modules no inicializados"
        echo "   Solución: cd services/mcp-server && go mod init"
    fi
}

# =========================
# MENÚ INTERACTIVO
# =========================

show_menu() {
    echo ""
    echo "🎛️ Menú de opciones:"
    echo "1. Verificar servicios"
    echo "2. Aplicar mejoras de código"
    echo "3. Troubleshooting"
    echo "4. Test análisis"
    echo "5. Limpiar cache Redis"
    echo "6. Salir"
    echo ""
    read -p "Selecciona una opción (1-6): " choice
    
    case $choice in
        1)
            echo "🔍 Verificando servicios..."
            # Verificar servicios
            ;;
        2)
            apply_code_improvements
            ;;
        3)
            troubleshoot
            ;;
        4)
            echo "🧪 Testing análisis..."
            curl -X POST http://localhost:8081/api/v1/analysis/analyze \
              -H "Content-Type: application/json" \
              -d '{"url":"https://tez.com.co"}' | jq . 2>/dev/null || echo "jq no disponible"
            ;;
        5)
            echo "🧹 Limpiando cache Redis..."
            redis-cli FLUSHALL
            echo "✅ Cache limpiado"
            ;;
        6)
            echo "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "❌ Opción inválida"
            ;;
    esac
}

# =========================
# EJECUCIÓN PRINCIPAL
# =========================

# Verificar si se ejecuta con argumentos
if [ "$1" = "menu" ]; then
    show_menu
elif [ "$1" = "troubleshoot" ]; then
    troubleshoot
elif [ "$1" = "test" ]; then
    echo "🧪 Testing análisis..."
    curl -X POST http://localhost:8081/api/v1/analysis/analyze \
      -H "Content-Type: application/json" \
      -d '{"url":"https://tez.com.co"}' | jq . 2>/dev/null || echo "jq no disponible"
else
    # Ejecución normal
    echo "🚀 Iniciando TausePro MVP..."
    apply_code_improvements
fi 