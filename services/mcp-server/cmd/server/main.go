package main

import (
	"database/sql"
	"log"
	"mcp-server/internal/cache"
	"mcp-server/internal/handlers"
	"mcp-server/internal/services"
	"os"

	"net/http"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/filesystem"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	defer func() {
		if r := recover(); r != nil {
			log.Printf("🔥 PANIC capturado en main: %v", r)
		}
	}()
	log.Printf("🚀 INICIANDO MAIN FUNCTION...")
	// Cargar variables de entorno desde .env
	if err := godotenv.Load(); err != nil {
		log.Printf("⚠️ No se pudo cargar archivo .env: %v", err)
	} else {
		log.Printf("✅ Variables de entorno cargadas desde .env")
	}
	app := fiber.New()

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://localhost:5173,http://localhost:3000,http://localhost:3001,http://localhost:5174,http://localhost:5175,http://localhost:5176",
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization",
		AllowCredentials: true,
	}))

	// Servir archivos estáticos del Dashboard
	app.Use("/admin", filesystem.New(filesystem.Config{
		Root:   http.Dir("./dashboard"),
		Browse: true,
	}))

	// Servir archivos estáticos del Landing
	app.Use("/", filesystem.New(filesystem.Config{
		Root:   http.Dir("./landing"),
		Browse: true,
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
	log.Printf("🔧 Creando ConfigService...")
	configService := services.NewConfigService("http://localhost:8090", "admin@tause.pro", "admin123")
	log.Printf("✅ ConfigService inicializado")
	log.Printf("🔧 Creando AnalysisService...")
	analysisService := services.NewAnalysisService(configService, redisCache)
	log.Printf("✅ AnalysisService inicializado")
	log.Printf("🔧 Verificando conexiones antes de servicios v2...")

	// Conectar a PostgreSQL
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://tausepro:tausepro_dev@localhost:5433/tausepro_analytics?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Printf("⚠️ No se pudo conectar a PostgreSQL: %v", err)
		db = nil
	} else {
		// Verificar conexión
		if err := db.Ping(); err != nil {
			log.Printf("⚠️ PostgreSQL no responde: %v", err)
			db = nil
		} else {
			log.Printf("✅ PostgreSQL conectado: %s", dbURL)
		}
	}

	// Inicializar servicios v2
	log.Printf("🔧 Creando PromptsService...")
	promptsService := services.NewPromptsService(db, redisCache)
	log.Printf("✅ PromptsService inicializado")
	log.Printf("🔧 Creando AgentService...")
	agentService := services.NewAgentService(db, redisCache)
	log.Printf("✅ AgentService inicializado")
	log.Printf("🔧 Creando AnalysisV2Service...")
	analysisV2Service := services.NewAnalysisV2Service(analysisService, promptsService, redisCache, db)
	log.Printf("✅ AnalysisV2Service inicializado")
	log.Printf("🔧 Creando ReportsV2Service...")
	reportsV2Service := services.NewReportsV2Service(analysisV2Service, redisCache)
	log.Printf("✅ ReportsV2Service inicializado")
	log.Printf("🔧 Todos los servicios v2 inicializados correctamente")

	// Inicializar handlers esenciales para MVP
	log.Printf("🔧 Inicializando handlers...")
	log.Printf("🔧 Creando ConfigHandler...")
	configHandler := handlers.NewConfigHandler(configService)
	log.Printf("✅ ConfigHandler inicializado")
	log.Printf("🔧 Creando AnalysisV2Handler...")
	analysisV2Handler := handlers.NewAnalysisV2Handler(analysisV2Service, redisCache)
	log.Printf("✅ AnalysisV2Handler inicializado")
	log.Printf("🔧 Creando ReportsHandler...")
	reportsHandler := handlers.NewReportsHandler(reportsV2Service)
	log.Printf("✅ ReportsHandler inicializado")
	log.Printf("🔧 Creando SearchHandler...")
	searchHandler := handlers.NewSearchHandler(configService)
	log.Printf("✅ SearchHandler inicializado")
	log.Printf("🔧 Creando PromptsHandler...")
	promptsHandler := handlers.NewPromptsHandler(promptsService)
	log.Printf("✅ PromptsHandler inicializado")
	log.Printf("🔧 Creando AgentsHandler...")
	agentsHandler := handlers.NewAgentsHandler(agentService)
	log.Printf("✅ AgentsHandler inicializado")
	log.Printf("✅ Handlers inicializados: config, analysis, reports, search, prompts, agents")

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
	config.Get("/keys", configHandler.GetConfig)
	config.Post("/api-key", configHandler.UpdateAPIKey)
	config.Post("/test-api-key", configHandler.TestAPIKey)
	config.Get("/api-key-status", configHandler.GetAPIKeyStatus)
	config.Post("/reset-usage", configHandler.ResetUsage)

	// Rutas de análisis v2 (único sistema de análisis)
	log.Printf("🔧 Llamando a RegisterRoutes del AnalysisV2Handler...")
	analysisV2Handler.RegisterRoutes(app)
	log.Printf("✅ Rutas de análisis registradas")

	// Rutas de reportes
	reportsHandler.RegisterRoutes(app)
	log.Printf("✅ Rutas de reportes registradas")

	// Rutas de búsqueda
	searchHandler.RegisterRoutes(app)
	log.Printf("✅ Rutas de búsqueda registradas")

	// Rutas de prompts
	promptsHandler.RegisterRoutes(app)
	log.Printf("✅ Rutas de prompts registradas")

	// Rutas de agentes
	log.Printf("🔧 ANTES de llamar a RegisterRoutes del AgentsHandler...")
	log.Printf("🔧 Llamando a RegisterRoutes del AgentsHandler...")
	log.Printf("🔧 agentsHandler es: %v", agentsHandler)
	log.Printf("🔧 app es: %v", app)
	log.Printf("🔧 DESPUÉS de los logs, antes de llamar a RegisterRoutes...")
	agentsHandler.RegisterRoutes(app)
	log.Printf("✅ Rutas de agentes registradas")

	// Iniciar servidor
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("⚡️ TausePro MCP Server running on :%s", port)
	log.Printf("🔧 Configuración completada, iniciando servidor...")
	log.Printf("🚀 INICIANDO FIBER SERVER...")
	app.Listen(":" + port)
}
