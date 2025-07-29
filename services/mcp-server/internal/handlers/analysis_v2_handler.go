// services/mcp-server/internal/handlers/analysis_v2_handler.go
package handlers

import (
	"fmt"
	"time"

	"mcp-server/internal/cache"
	"mcp-server/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AnalysisV2Handler maneja el análisis mejorado
type AnalysisV2Handler struct {
	analysisService *services.AnalysisV2Service
	cache           *cache.RedisCache
}

// NewAnalysisV2Handler crea el handler
func NewAnalysisV2Handler(analysisService *services.AnalysisV2Service, cache *cache.RedisCache) *AnalysisV2Handler {
	return &AnalysisV2Handler{
		analysisService: analysisService,
		cache:           cache,
	}
}

// RegisterRoutes registra las rutas de análisis v2
func (h *AnalysisV2Handler) RegisterRoutes(app *fiber.App) {
	println("🔧 Registrando rutas de AnalysisV2Handler...")
	api := app.Group("/api/v1/analysis")

	// Rate limiting para análisis
	api.Use(h.RateLimitMiddleware)

	// Rutas de análisis modular
	api.Post("/analyze", h.AnalyzeComplete)                          // Análisis completo
	api.Post("/company", h.AnalyzeCompany)                           // Solo empresa
	api.Post("/social", h.AnalyzeSocialMedia)                        // Solo redes
	api.Post("/industry", h.AnalyzeIndustry)                         // Solo industria
	api.Post("/competitors", h.AnalyzeCompetitors)                   // Solo competidores
	api.Post("/opportunities", h.AnalyzeOpportunities)               // Solo oportunidades
	api.Post("/professional-summary", h.GenerateProfessionalSummary) // Resumen profesional GPT

	// Status y resultados
	api.Get("/status/:id", h.GetAnalysisStatus)
	api.Get("/result/:id", h.GetAnalysisResult)

	println("✅ Rutas de AnalysisV2Handler registradas")
}

// CompleteAnalysisResult resultado completo del análisis
type CompleteAnalysisResult struct {
	ID            string                     `json:"id"`
	Company       *services.CompanyInfoV2    `json:"company"`
	Industry      *services.IndustryAnalysis `json:"industry,omitempty"`
	Competitors   []*services.CompetitorInfo `json:"competitors,omitempty"`
	Opportunities []*services.Opportunity    `json:"opportunities,omitempty"`
	StartedAt     time.Time                  `json:"started_at"`
	CompletedAt   time.Time                  `json:"completed_at"`
	Duration      time.Duration              `json:"duration"`
	Status        string                     `json:"status"`
	Error         string                     `json:"error,omitempty"`
}

// AnalyzeComplete análisis completo de empresa (síncrono para compatibilidad con frontend)
func (h *AnalysisV2Handler) AnalyzeComplete(c *fiber.Ctx) error {
	var input struct {
		URL      string   `json:"url"`
		Modules  []string `json:"modules"` // Módulos específicos a analizar
		Language string   `json:"language"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Validar URL
	if input.URL == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "URL requerida",
		})
	}

	// Ejecutar análisis síncronamente
	companyInfo, err := h.analysisService.AnalyzeCompanyV2(c.Context(), input.URL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error analizando empresa",
			"details": err.Error(),
		})
	}

	// Crear estructura de respuesta compatible con el frontend
	analysisResult := map[string]interface{}{
		"company": map[string]interface{}{
			"name":        companyInfo.Name,
			"url":         companyInfo.URL,
			"description": companyInfo.Description,
			"industry":    companyInfo.Industry,
			"location":    companyInfo.Location.City + ", " + companyInfo.Location.Country,
			"size":        companyInfo.Size,
			"founded":     companyInfo.Founded,
		},
		"digitalization_score": map[string]interface{}{
			"total":        h.calculateDigitalizationScore(companyInfo),
			"web_presence": 75,
			"local_seo":    65,
			"social_media": 60,
			"engagement":   70,
			"technical":    80,
		},
		"analysis_date": time.Now(),
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    analysisResult,
		"message": fmt.Sprintf("Análisis completado para %s", companyInfo.Name),
	})
}

// AnalyzeCompany análisis solo de empresa
func (h *AnalysisV2Handler) AnalyzeCompany(c *fiber.Ctx) error {
	var input struct {
		URL string `json:"url"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	companyInfo, err := h.analysisService.AnalyzeCompanyV2(c.Context(), input.URL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error analizando empresa",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    companyInfo,
	})
}

// AnalyzeSocialMedia análisis de redes sociales
func (h *AnalysisV2Handler) AnalyzeSocialMedia(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{
		"success": false,
		"error":   "Módulo de redes sociales no implementado aún",
	})
}

// AnalyzeIndustry análisis de industria
func (h *AnalysisV2Handler) AnalyzeIndustry(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{
		"success": false,
		"error":   "Módulo de industria no implementado aún",
	})
}

// AnalyzeCompetitors análisis de competidores
func (h *AnalysisV2Handler) AnalyzeCompetitors(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{
		"success": false,
		"error":   "Módulo de competidores no implementado aún",
	})
}

// AnalyzeOpportunities análisis de oportunidades
func (h *AnalysisV2Handler) AnalyzeOpportunities(c *fiber.Ctx) error {
	return c.Status(501).JSON(fiber.Map{
		"success": false,
		"error":   "Módulo de oportunidades no implementado aún",
	})
}

// GenerateProfessionalSummary genera un resumen profesional usando GPT
func (h *AnalysisV2Handler) GenerateProfessionalSummary(c *fiber.Ctx) error {
	var input struct {
		URL string `json:"url"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Validar URL
	if input.URL == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "URL requerida",
		})
	}

	// Primero analizar la empresa
	companyInfo, err := h.analysisService.AnalyzeCompanyV2(c.Context(), input.URL)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error analizando empresa",
			"details": err.Error(),
		})
	}

	// Generar resumen profesional
	summary, err := h.analysisService.GenerateProfessionalSummary(c.Context(), companyInfo)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error generando resumen profesional",
			"details": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"company":              companyInfo,
			"professional_summary": summary,
		},
	})
}

// GetAnalysisStatus obtiene el estado del análisis
func (h *AnalysisV2Handler) GetAnalysisStatus(c *fiber.Ctx) error {
	// Si no hay cache disponible, retornar error
	if h.cache == nil {
		return c.Status(503).JSON(fiber.Map{
			"success": false,
			"error":   "Cache no disponible",
			"message": "El servicio de cache no está disponible",
		})
	}

	id := c.Params("id")

	var result CompleteAnalysisResult
	found, err := h.cache.GetCachedResult(fmt.Sprintf("analysis_result:%s", id), &result)
	if err != nil || !found {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Análisis no encontrado",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"id":           result.ID,
			"status":       result.Status,
			"started_at":   result.StartedAt,
			"completed_at": result.CompletedAt,
			"duration":     result.Duration,
			"error":        result.Error,
		},
	})
}

// GetAnalysisResult obtiene el resultado completo del análisis
func (h *AnalysisV2Handler) GetAnalysisResult(c *fiber.Ctx) error {
	// Si no hay cache disponible, retornar error
	if h.cache == nil {
		return c.Status(503).JSON(fiber.Map{
			"success": false,
			"error":   "Cache no disponible",
			"message": "El servicio de cache no está disponible",
		})
	}

	id := c.Params("id")

	var result CompleteAnalysisResult
	found, err := h.cache.GetCachedResult(fmt.Sprintf("analysis_result:%s", id), &result)
	if err != nil || !found {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Análisis no encontrado",
		})
	}

	if result.Status != "completed" {
		return c.Status(202).JSON(fiber.Map{
			"success": true,
			"data": fiber.Map{
				"status":     result.Status,
				"started_at": result.StartedAt,
				"error":      result.Error,
			},
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// RateLimitMiddleware middleware específico para análisis
func (h *AnalysisV2Handler) RateLimitMiddleware(c *fiber.Ctx) error {
	// TEMPORALMENTE DESHABILITADO PARA TESTING
	return c.Next()
	
	// Si no hay cache disponible, permitir acceso sin rate limiting
	if h.cache == nil {
		return c.Next()
	}

	ip := c.IP()

	// Verificar límite por IP
	allowed, remaining, resetAt, err := h.cache.CheckRateLimit(cache.RateLimitConfig{
		Key:        ip,
		Limit:      50, // Aumentado temporalmente para testing
		Window:     time.Hour,
		Identifier: "analysis_v2",
	})

	// Agregar headers de rate limit
	c.Set("X-RateLimit-Limit", "50")
	c.Set("X-RateLimit-Remaining", fmt.Sprintf("%d", remaining))
	c.Set("X-RateLimit-Reset", fmt.Sprintf("%d", resetAt.Unix()))

	if err != nil || !allowed {
		return c.Status(429).JSON(fiber.Map{
			"success":  false,
			"error":    "Límite de análisis excedido",
			"message":  "Has alcanzado el límite de 50 análisis por hora. Intenta más tarde.",
			"reset_at": resetAt.Format(time.RFC3339),
		})
	}

	return c.Next()
}

// Funciones auxiliares

func containsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func (h *AnalysisV2Handler) calculateDigitalizationScore(company *services.CompanyInfoV2) int {
	// Implementar cálculo de score
	// Por ahora, retornar un valor de ejemplo
	return 65
}

func (h *AnalysisV2Handler) saveAnalysisResult(id string, result interface{}) {
	// Si no hay cache disponible, no guardar
	if h.cache == nil {
		return
	}

	// Guardar en cache
	cacheKey := fmt.Sprintf("analysis_result:%s", id)
	h.cache.CacheResult(cacheKey, result, 24*time.Hour)
}

func (h *AnalysisV2Handler) saveAnalysisError(id string, err error) {
	// Si no hay cache disponible, no guardar
	if h.cache == nil {
		return
	}

	// Guardar error en cache
	cacheKey := fmt.Sprintf("analysis_result:%s", id)
	h.cache.CacheResult(cacheKey, fiber.Map{
		"status": "error",
		"error":  err.Error(),
	}, 1*time.Hour)
}
