package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"github.com/tausepro/mcp-server/internal/handlers"
	"github.com/tausepro/mcp-server/internal/middleware"
	"github.com/tausepro/mcp-server/internal/services"
	"github.com/tausepro/mcp-server/internal/repositories"
	"github.com/tausepro/mcp-server/pkg/colombia"
	"github.com/tausepro/mcp-server/pkg/paywall"
)

func main() {
	// Cargar variables de entorno
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment")
	}

	// Crear aplicación Fiber
	app := fiber.New(fiber.Config{
		AppName:      "TausePro MCP Server v1.0",
		ErrorHandler: customErrorHandler,
	})

	// Middleware global
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path} - ${latency}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,http://app.tause.localhost",
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, X-Tenant-ID",
	}))

	// Inicializar servicios
	initServices(app)

	// Inicializar rutas
	setupRoutes(app)

	// Health check para PYMEs
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "TausePro MCP Server",
			"version": "1.0",
			"colombia": "ready",
		})
	})

	// Iniciar servidor
	port := getEnv("PORT", "8080")
	log.Printf("🚀 TausePro MCP Server iniciando en puerto %s", port)
	log.Printf("🇨🇴 Optimizado para PYMEs colombianas")
	
	if err := app.Listen(":" + port); err != nil {
		log.Fatal("Error iniciando servidor:", err)
	}
}

func initServices(app *fiber.App) {
	// Inicializar repositorios
	// TODO: Configurar PocketBase
	
	// Inicializar servicios específicos Colombia
	colombiaService := colombia.NewService()
	paywallService := paywall.NewService()
	
	// Configurar en contexto de app
	app.Locals("colombiaService", colombiaService)
	app.Locals("paywallService", paywallService)
}

func setupRoutes(app *fiber.App) {
	// API base
	api := app.Group("/api/v1")
	
	// Middleware de autenticación y tenant
	api.Use(middleware.TenantMiddleware())
	api.Use(middleware.AuthMiddleware())
	api.Use(middleware.PaywallMiddleware())
	
	// Rutas para PYMEs
	setupPymeRoutes(api)
	setupMCPRoutes(api)
	setupColombiaRoutes(api)
}

func setupPymeRoutes(api fiber.Router) {
	pymes := api.Group("/pymes")
	
	// Gestión de PYMEs
	pymes.Get("/dashboard", handlers.GetDashboard)
	pymes.Get("/analytics", handlers.GetAnalytics)
	pymes.Post("/agents", handlers.CreateAgent)
	pymes.Get("/agents", handlers.ListAgents)
}

func setupMCPRoutes(api fiber.Router) {
	mcp := api.Group("/mcp")
	
	// Protocolo MCP para agentes
	mcp.Post("/tools/execute", handlers.ExecuteMCPTool)
	mcp.Get("/tools", handlers.ListMCPTools)
	mcp.Post("/agents/:id/chat", handlers.ChatWithAgent)
}

func setupColombiaRoutes(api fiber.Router) {
	colombia := api.Group("/colombia")
	
	// Integraciones específicas Colombia
	colombia.Post("/validate/nit", handlers.ValidateNIT)
	colombia.Post("/validate/cc", handlers.ValidateCC)
	colombia.Post("/invoice/dian", handlers.CreateDIANInvoice)
	colombia.Post("/payment/pse", handlers.ProcessPSEPayment)
	colombia.Post("/shipping/servientrega", handlers.CreateShipment)
}

func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	message := "Error interno del servidor"

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
		message = e.Message
	}

	return c.Status(code).JSON(fiber.Map{
		"error":   true,
		"message": message,
		"code":    code,
	})
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
} 