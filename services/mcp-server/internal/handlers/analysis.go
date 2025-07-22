package handlers

import (
	"fmt"
	"time"

	"mcp-server/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AnalysisHandler maneja las peticiones de análisis automático
type AnalysisHandler struct {
	analysisService *services.AnalysisService
}

// NewAnalysisHandler crea una nueva instancia del handler
func NewAnalysisHandler(analysisService *services.AnalysisService) *AnalysisHandler {
	return &AnalysisHandler{
		analysisService: analysisService,
	}
}

// AnalysisRequest request para análisis de empresa
type AnalysisRequest struct {
	URL string `json:"url" validate:"required,url"`
}

// AnalysisResponse respuesta del análisis
type AnalysisResponse struct {
	Success bool                     `json:"success"`
	Data    *services.MarketAnalysis `json:"data,omitempty"`
	Preview *services.PaywallPreview `json:"preview,omitempty"`
	Error   string                   `json:"error,omitempty"`
	Message string                   `json:"message,omitempty"`
}

// AnalyzeCompany analiza una empresa completa
func (h *AnalysisHandler) AnalyzeCompany(c *fiber.Ctx) error {
	var req AnalysisRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(AnalysisResponse{
			Success: false,
			Error:   "Formato de request inválido",
		})
	}

	// Validar URL
	if req.URL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(AnalysisResponse{
			Success: false,
			Error:   "URL es requerida",
		})
	}

	// Iniciar análisis
	ctx := c.Context()
	analysis, err := h.analysisService.AnalyzeCompany(ctx, req.URL)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en análisis: %v", err),
		})
	}

	// Generar preview para paywall
	preview, err := h.analysisService.GeneratePaywallPreview(analysis)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error generando preview: %v", err),
		})
	}

	return c.JSON(AnalysisResponse{
		Success: true,
		Data:    analysis,
		Preview: preview,
		Message: fmt.Sprintf("Análisis completado para %s", analysis.Company.Name),
	})
}

// GetAnalysisPreview obtiene solo la vista previa del análisis
func (h *AnalysisHandler) GetAnalysisPreview(c *fiber.Ctx) error {
	url := c.Query("url")
	if url == "" {
		return c.Status(fiber.StatusBadRequest).JSON(AnalysisResponse{
			Success: false,
			Error:   "URL es requerida como query parameter",
		})
	}

	// Realizar análisis completo
	ctx := c.Context()
	analysis, err := h.analysisService.AnalyzeCompany(ctx, url)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en análisis: %v", err),
		})
	}

	// Generar solo preview
	preview, err := h.analysisService.GeneratePaywallPreview(analysis)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error generando preview: %v", err),
		})
	}

	return c.JSON(AnalysisResponse{
		Success: true,
		Preview: preview,
		Message: "Preview generado exitosamente",
	})
}

// GetFullAnalysis obtiene el análisis completo (requiere autenticación)
func (h *AnalysisHandler) GetFullAnalysis(c *fiber.Ctx) error {
	url := c.Query("url")
	if url == "" {
		return c.Status(fiber.StatusBadRequest).JSON(AnalysisResponse{
			Success: false,
			Error:   "URL es requerida como query parameter",
		})
	}

	// Verificar autenticación (aquí se integraría con el middleware de auth)
	// Por ahora, permitimos acceso directo para testing

	ctx := c.Context()
	analysis, err := h.analysisService.AnalyzeCompany(ctx, url)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en análisis: %v", err),
		})
	}

	return c.JSON(AnalysisResponse{
		Success: true,
		Data:    analysis,
		Message: fmt.Sprintf("Análisis completo para %s", analysis.Company.Name),
	})
}

// GenerateReport genera un reporte en formato JSON
func (h *AnalysisHandler) GenerateReport(c *fiber.Ctx) error {
	var req AnalysisRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(AnalysisResponse{
			Success: false,
			Error:   "Formato de request inválido",
		})
	}

	ctx := c.Context()
	analysis, err := h.analysisService.AnalyzeCompany(ctx, req.URL)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error en análisis: %v", err),
		})
	}

	// Generar reporte JSON
	report, err := h.analysisService.GenerateReport(analysis)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(AnalysisResponse{
			Success: false,
			Error:   fmt.Sprintf("Error generando reporte: %v", err),
		})
	}

	// Configurar headers para descarga
	c.Set("Content-Type", "application/json")
	c.Set("Content-Disposition", fmt.Sprintf("attachment; filename=analisis_%s_%s.json",
		analysis.Company.Name, time.Now().Format("2006-01-02")))

	return c.Send(report)
}

// HealthCheck verifica el estado del servicio de análisis
func (h *AnalysisHandler) HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status":    "healthy",
		"service":   "analysis",
		"timestamp": time.Now().UTC(),
		"message":   "Analysis service is running",
	})
}
