#!/bin/bash

# Cargar variables de entorno
export TAVILY_API_KEY="tvly-dev-your-tavily-api-key-here"
export OPENAI_API_KEY="sk-your-openai-api-key-here"
export PORT="8081"

echo "🚀 Iniciando TausePro MCP Server..."
echo "📊 API Keys configuradas:"
echo "   - Tavily: ${TAVILY_API_KEY:0:20}..."
echo "   - OpenAI: ${OPENAI_API_KEY:0:20}..."
echo "🌐 Puerto: $PORT"

# Ejecutar el servidor
./main 