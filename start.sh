#!/bin/sh

# TausePro Start Script for Fly.io
# MCP Server serves everything (APIs + static files)

set -e

echo "🚀 Starting TausePro on Fly.io..."

# Set environment variables
export PORT=${PORT:-8080}
export NODE_ENV=${NODE_ENV:-production}
export COLOMBIA_MODE=${COLOMBIA_MODE:-true}

# Create data directories
mkdir -p /data/pocketbase /data/redis /data/postgres

# Start PocketBase in background
echo "📊 Starting PocketBase..."
./pocketbase serve --http=0.0.0.0:8090 --dir=/data/pocketbase &
POCKETBASE_PID=$!

# Wait for PocketBase to be ready
echo "⏳ Waiting for PocketBase..."
sleep 5

# Function to handle shutdown
cleanup() {
    echo "🛑 Shutting down TausePro..."
    kill $POCKETBASE_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

echo "✅ Starting MCP Server (main process)..."
echo "📊 PocketBase: http://localhost:8090"
echo "🤖 MCP Server: http://localhost:8080 (serves APIs + static files)"

# Start MCP Server as main process (this will listen on port 8080)
# The MCP server will serve both APIs and static files
exec ./main 