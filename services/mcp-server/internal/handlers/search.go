package handlers

import (
	"context"
	"fmt"
	"log"
	"mcp-server/internal/search"
	"mcp-server/internal/services"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// SearchHandler maneja las solicitudes de búsqueda
type SearchHandler struct {
	coordinator   *search.SearchCoordinator
	configService *services.ConfigService
}

// NewSearchHandler crea un nuevo handler de búsqueda
func NewSearchHandler(configService *services.ConfigService) *SearchHandler {
	log.Printf("🔍 Inicializando SearchHandler...")
	return &SearchHandler{
		coordinator:   nil, // Inicialización lazy
		configService: configService,
	}
}

// getCoordinator inicializa el coordinator de forma lazy
func (h *SearchHandler) getCoordinator() *search.SearchCoordinator {
	if h.coordinator == nil {
		h.coordinator = search.NewSearchCoordinator(h.configService)
	}
	return h.coordinator
}

// SearchRequest estructura de solicitud de búsqueda
type SearchRequest struct {
	Query         string `json:"query"`
	Strategy      string `json:"strategy,omitempty"`      // "fast", "balanced", "deep", "comprehensive"
	MaxResults    int    `json:"max_results,omitempty"`
	Country       string `json:"country,omitempty"`
	Language      string `json:"language,omitempty"`
	IncludeNews   bool   `json:"include_news,omitempty"`
	IncludeImages bool   `json:"include_images,omitempty"`
	AnalysisType  string `json:"analysis_type,omitempty"` // "company", "market", "general"
}

// SearchResponse estructura de respuesta de búsqueda
type SearchResponse struct {
	Success bool                  `json:"success"`
	Data    *search.SearchResult  `json:"data,omitempty"`
	Error   string                `json:"error,omitempty"`
	Meta    map[string]interface{} `json:"meta,omitempty"`
}

// HandleSearch maneja solicitudes POST /api/search
func (h *SearchHandler) HandleSearch(c *fiber.Ctx) error {
	// Parsear solicitud
	var req SearchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error al parsear solicitud: %v", err),
		})
	}

	// Validar query
	if strings.TrimSpace(req.Query) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   "Query es requerido",
		})
	}

	// Configurar opciones
	options := search.SearchOptions{
		Strategy:      search.SearchStrategy(req.Strategy),
		MaxResults:    req.MaxResults,
		Country:       req.Country,
		Language:      req.Language,
		IncludeNews:   req.IncludeNews,
		IncludeImages: req.IncludeImages,
		AnalysisType:  req.AnalysisType,
	}

	// Ejecutar búsqueda
	ctx, cancel := context.WithTimeout(c.Context(), 60*time.Second)
	defer cancel()

	result, err := h.getCoordinator().Search(ctx, req.Query, options)
	if err != nil {
		log.Printf("Error en búsqueda: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en búsqueda: %v", err),
		})
	}

	// Enviar respuesta
	return c.JSON(SearchResponse{
		Success: true,
		Data:    result,
		Meta: map[string]interface{}{
			"timestamp": time.Now().Unix(),
			"version":   "1.0",
		},
	})
}

// HandleSearchCompany maneja búsquedas especializadas de empresas
func (h *SearchHandler) HandleSearchCompany(c *fiber.Ctx) error {
	var req struct {
		CompanyName string `json:"company_name"`
		Country     string `json:"country,omitempty"`
		Language    string `json:"language,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error al parsear solicitud: %v", err),
		})
	}

	if strings.TrimSpace(req.CompanyName) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   "company_name es requerido",
		})
	}

	// Configurar búsqueda especializada para empresas
	options := search.SearchOptions{
		Strategy:     search.StrategyDeep,
		MaxResults:   10,
		Country:      req.Country,
		Language:     req.Language,
		AnalysisType: "company",
		IncludeNews:  true,
	}

	ctx, cancel := context.WithTimeout(c.Context(), 90*time.Second)
	defer cancel()

	// Usar query optimizada para empresas
	query := fmt.Sprintf("%s empresa información corporativa contacto", req.CompanyName)
	result, err := h.getCoordinator().Search(ctx, query, options)
	if err != nil {
		log.Printf("Error en búsqueda de empresa: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en búsqueda: %v", err),
		})
	}

	return c.JSON(SearchResponse{
		Success: true,
		Data:    result,
		Meta: map[string]interface{}{
			"search_type": "company",
			"timestamp":   time.Now().Unix(),
		},
	})
}

// HandleSearchMarket maneja búsquedas de análisis de mercado
func (h *SearchHandler) HandleSearchMarket(c *fiber.Ctx) error {
	var req struct {
		Topic    string `json:"topic"`
		Country  string `json:"country,omitempty"`
		Language string `json:"language,omitempty"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error al parsear solicitud: %v", err),
		})
	}

	if strings.TrimSpace(req.Topic) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   "topic es requerido",
		})
	}

	// Configurar búsqueda especializada para mercado
	options := search.SearchOptions{
		Strategy:     search.StrategyDeep,
		MaxResults:   12,
		Country:      req.Country,
		Language:     req.Language,
		AnalysisType: "market",
		IncludeNews:  true,
	}

	ctx, cancel := context.WithTimeout(c.Context(), 90*time.Second)
	defer cancel()

	// Usar query optimizada para análisis de mercado
	query := fmt.Sprintf("%s mercado análisis tendencias competencia oportunidades", req.Topic)
	result, err := h.getCoordinator().Search(ctx, query, options)
	if err != nil {
		log.Printf("Error en análisis de mercado: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en búsqueda: %v", err),
		})
	}

	return c.JSON(SearchResponse{
		Success: true,
		Data:    result,
		Meta: map[string]interface{}{
			"search_type": "market",
			"timestamp":   time.Now().Unix(),
		},
	})
}

// HandleSearchStatus obtiene el estado de las APIs de búsqueda
func (h *SearchHandler) HandleSearchStatus(c *fiber.Ctx) error {
	// Respuesta básica sin verificar configuración para evitar bloqueos
	status := map[string]interface{}{
		"serper": map[string]interface{}{
			"configured": false,
			"status":     "not_checked",
		},
		"tavily": map[string]interface{}{
			"configured": false,
			"status":     "not_checked",
		},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    status,
		"meta": map[string]interface{}{
			"timestamp": time.Now().Unix(),
			"note":      "Basic status endpoint. Configuration checking disabled to prevent blocking.",
		},
	})
}

// HandleSearchQuick búsqueda rápida con parámetros GET
func (h *SearchHandler) HandleSearchQuick(c *fiber.Ctx) error {
	query := c.Query("q")
	if strings.TrimSpace(query) == "" {
		return c.Status(fiber.StatusBadRequest).JSON(SearchResponse{
			Success: false,
			Error:   "Parámetro 'q' es requerido",
		})
	}

	// Parsear parámetros opcionales
	maxResults := 5
	if mr := c.Query("max_results"); mr != "" {
		if parsed, err := strconv.Atoi(mr); err == nil && parsed > 0 && parsed <= 20 {
			maxResults = parsed
		}
	}

	strategy := c.Query("strategy")
	if strategy == "" {
		strategy = "fast"
	}

	country := c.Query("country")
	if country == "" {
		country = "co"
	}

	language := c.Query("language")
	if language == "" {
		language = "es"
	}

	// Configurar opciones
	options := search.SearchOptions{
		Strategy:   search.SearchStrategy(strategy),
		MaxResults: maxResults,
		Country:    country,
		Language:   language,
	}

	// Ejecutar búsqueda rápida
	ctx, cancel := context.WithTimeout(c.Context(), 30*time.Second)
	defer cancel()

	result, err := h.getCoordinator().Search(ctx, query, options)
	if err != nil {
		log.Printf("Error en búsqueda rápida: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(SearchResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en búsqueda: %v", err),
		})
	}

	return c.JSON(SearchResponse{
		Success: true,
		Data:    result,
		Meta: map[string]interface{}{
			"search_type": "quick",
			"timestamp":   time.Now().Unix(),
		},
	})
}

// RegisterRoutes registra las rutas del handler
func (h *SearchHandler) RegisterRoutes(app *fiber.App) {
	log.Printf("🔍 Registrando rutas de búsqueda...")
	api := app.Group("/api")
	v1 := app.Group("/api/v1")
	
	// Registrar en ambos grupos para compatibilidad
	api.Post("/search", h.HandleSearch)
	api.Post("/search/company", h.HandleSearchCompany)
	api.Post("/search/market", h.HandleSearchMarket)
	api.Get("/search/quick", h.HandleSearchQuick)
	api.Get("/search/status", h.HandleSearchStatus)
	
	v1.Post("/search", h.HandleSearch)
	v1.Post("/search/company", h.HandleSearchCompany)
	v1.Post("/search/market", h.HandleSearchMarket)
	v1.Get("/search/quick", h.HandleSearchQuick)
	v1.Get("/search/status", h.HandleSearchStatus)
	
	log.Printf("✅ Rutas de búsqueda registradas en /api/search y /api/v1/search")
}