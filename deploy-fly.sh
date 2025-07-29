#!/bin/bash

echo "🚀 Deploying TausePro to Fly.io"
echo "================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si fly CLI está instalado
if ! command -v fly &> /dev/null; then
    echo -e "${YELLOW}Instalando Fly CLI...${NC}"
    curl -L https://fly.io/install.sh | sh
    export PATH="$HOME/.fly/bin:$PATH"
fi

# Login a Fly.io
echo -e "${YELLOW}Iniciando sesión en Fly.io...${NC}"
fly auth login

# Crear app si no existe
if ! fly apps list | grep -q "tausepro"; then
    echo -e "${YELLOW}Creando aplicación en Fly.io...${NC}"
    fly apps create tausepro --org personal
fi

# Configurar secrets (usar variables de entorno)
echo -e "${YELLOW}Configurando variables de entorno...${NC}"
echo "Por favor, configura las siguientes variables de entorno:"
echo "- OPENAI_API_KEY"
echo "- TAVILY_API_KEY"
echo "- SERPER_API_KEY"
echo ""
echo "Ejemplo:"
echo "fly secrets set OPENAI_API_KEY=tu_api_key_aqui"
echo "fly secrets set TAVILY_API_KEY=tu_api_key_aqui"
echo "fly secrets set SERPER_API_KEY=tu_api_key_aqui"

# Deploy
echo -e "${YELLOW}Haciendo deploy...${NC}"
fly deploy --region bog

echo -e "${GREEN}✅ Deploy completado!${NC}"
echo -e "${GREEN}🌐 URL: https://tausepro.fly.dev${NC}" 