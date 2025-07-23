package main

import (
	"log"
	"mcp-server/internal/cache"
	"mcp-server/internal/handlers"
	"mcp-server/internal/services"
	"mcp-server/internal/tenant"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:5174,http://localhost:5176",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	// Inicializar Redis cache
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "redis://localhost:6379"
	}

	redisCache, err := cache.NewRedisCache(redisURL)
	if err != nil {
		log.Printf("⚠️ Redis no disponible, continuando sin cache: %v", err)
		redisCache = nil
	} else {
		log.Printf("✅ Redis conectado: %s", redisURL)
	}

	// Inicializar servicios
	configService := services.NewConfigService("http://localhost:8090", "admin@tause.pro", "admin123")
	analysisService := services.NewAnalysisService(configService, redisCache)

	// Inicializar tenant manager (simulado sin DB por ahora)
	var tenantManager *tenant.TenantManager
	if redisCache != nil {
		// TODO: Conectar a DB real
		// tenantManager = tenant.NewTenantManager(db, redisCache)
		log.Printf("⚠️ Tenant manager no inicializado - requiere DB")
	}

	// Inicializar handlers
	configHandler := handlers.NewConfigHandler(configService)
	analysisHandler := handlers.NewAnalysisHandler(analysisService)
	var tenantHandler *handlers.TenantHandler
	if tenantManager != nil {
		tenantHandler = handlers.NewTenantHandler(tenantManager)
	}

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "tausepro-mcp-server",
		})
	})

	// API routes
	api := app.Group("/api/v1")

	// Rutas de configuración del sistema
	config := api.Group("/config")
	config.Get("/", configHandler.GetConfig)
	config.Post("/api-key", configHandler.UpdateAPIKey)
	config.Post("/test-api-key", configHandler.TestAPIKey)
	config.Get("/api-key-status", configHandler.GetAPIKeyStatus)
	config.Post("/reset-usage", configHandler.ResetUsage)

	// Rutas de análisis automático
	analysis := api.Group("/analysis")
	analysis.Post("/analyze", analysisHandler.AnalyzeCompany)
	analysis.Get("/preview", analysisHandler.GetAnalysisPreview)
	analysis.Get("/full", analysisHandler.GetFullAnalysis)
	analysis.Post("/report", analysisHandler.GenerateReport)
	analysis.Get("/health", analysisHandler.HealthCheck)

	// Rutas de tenant (si está disponible)
	if tenantHandler != nil {
		tenantRoutes := api.Group("/tenant")
		tenantRoutes.Post("/create", tenantHandler.CreateTenant)
		tenantRoutes.Get("/info", tenantHandler.GetTenant)
		tenantRoutes.Put("/update", tenantHandler.UpdateTenant)
		tenantRoutes.Get("/features", tenantHandler.GetTenantFeatures)
		tenantRoutes.Get("/check-limit", tenantHandler.CheckTenantLimit)
	}

	// Auth con PocketBase
	api.Post("/auth/login", func(c *fiber.Ctx) error {
		type LoginPayload struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}

		var payload LoginPayload
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Cannot parse JSON",
			})
		}

		// MODO SIMULADO: PocketBase no está disponible
		// Verificar credenciales simuladas
		if payload.Email == "admin@example.com" && payload.Password == "password" {
			// Autenticación exitosa simulada
			return c.JSON(fiber.Map{
				"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzI1NzE2ODAwfQ.simulated-jwt-token-for-testing",
				"user": fiber.Map{
					"id":           "1",
					"email":        payload.Email,
					"name":         "Admin User",
					"role":         "admin",
					"company_name": "TausePro Admin",
					"plan":         "enterprise",
					"created":      "2025-01-01T00:00:00Z",
					"updated":      "2025-01-01T00:00:00Z",
				},
			})
		} else if payload.Email == "demo@tause.pro" && payload.Password == "demo123" {
			// Usuario demo
			return c.JSON(fiber.Map{
				"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6ImRlbW9AdGF1c2UucHJvIiwicm9sZSI6InVzZXIiLCJleHAiOjE3MjU3MTY4MDB9.simulated-jwt-token-for-demo-user",
				"user": fiber.Map{
					"id":           "2",
					"email":        payload.Email,
					"name":         "Demo User",
					"role":         "user",
					"company_name": "Demo Company",
					"plan":         "starter",
					"created":      "2025-01-01T00:00:00Z",
					"updated":      "2025-01-01T00:00:00Z",
				},
			})
		}

		// Autenticación fallida
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	})

	// Dashboard
	api.Get("/pymes/dashboard", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"metrics": fiber.Map{
				"total_api_calls": 42,
				"total_agents":    2,
				"active_chats":    5,
				"messages_sent":   123,
			},
			"usage": fiber.Map{
				"api_calls": fiber.Map{
					"used":       42,
					"limit":      100,
					"percentage": 42,
				},
				"agents": fiber.Map{
					"used":       2,
					"limit":      3,
					"percentage": 66,
				},
			},
			"recent_activity": []fiber.Map{
				{
					"id":          "1",
					"type":        "agent_execution",
					"description": "Agente de ventas respondió cliente",
					"timestamp":   "2025-01-17T10:30:00Z",
				},
			},
		})
	})

	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("⚡️ TausePro MCP Server running on :%s", port)
	log.Printf("🔧 Configuración completada, iniciando servidor...")
	app.Listen(":" + port)
}
