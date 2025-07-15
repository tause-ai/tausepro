# Makefile para TausePro
.PHONY: help dev test build deploy

DOCKER_REGISTRY := tausepro
VERSION := $(shell git describe --tags --always --dirty)

help: ## Mostrar ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

dev: ## Iniciar ambiente desarrollo
	docker-compose up -d
	@echo "✅ TausePro corriendo en:"
	@echo "   - Landing: http://localhost:3000 (tause.pro)"
	@echo "   - Dashboard: http://localhost:5173 (app.tause.pro)"
	@echo "   - API: http://localhost:8080 (api.tause.pro)"
	@echo "   - PocketBase: http://localhost:8090/_/"

install: ## Instalar dependencias
	cd apps/dashboard && npm install
	cd apps/landing && npm install
	cd services/mcp-server && go mod download
	cd services/e-commerce && npm install

test: ## Correr tests
	cd services/mcp-server && go test ./...
	cd apps/dashboard && npm test

test-colombia: ## Tests específicos Colombia
	cd services/mcp-server && go test -tags=colombia ./...
	cd packages/colombia-sdk && go test ./...

build: ## Build para producción
	docker build -t $(DOCKER_REGISTRY)/mcp-server:$(VERSION) ./services/mcp-server
	docker build -t $(DOCKER_REGISTRY)/dashboard:$(VERSION) ./apps/dashboard
	docker build -t $(DOCKER_REGISTRY)/landing:$(VERSION) ./apps/landing

migrate: ## Correr migraciones
	cd migrations && pocketbase migrate up

seed-colombia: ## Seed data Colombia
	go run tools/scripts/seed-colombia-data.go

deploy-staging: ## Deploy a staging
	./infrastructure/scripts/deploy-staging.sh

monitor: ## Ver logs en tiempo real
	docker-compose logs -f

clean: ## Limpiar containers y volumes
	docker-compose down -v
	rm -rf data/* 