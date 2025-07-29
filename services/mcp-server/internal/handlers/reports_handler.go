// services/mcp-server/internal/handlers/reports_handler.go
package handlers

import (
	"mcp-server/internal/services"

	"github.com/gofiber/fiber/v2"
)

// ReportsHandler maneja las rutas de reportes
type ReportsHandler struct {
	reportsService *services.ReportsV2Service
}

// NewReportsHandler crea un nuevo handler
func NewReportsHandler(reportsService *services.ReportsV2Service) *ReportsHandler {
	println("🔧 Creando ReportsHandler...")
	handler := &ReportsHandler{
		reportsService: reportsService,
	}
	println("✅ ReportsHandler creado")
	return handler
}

// RegisterRoutes registra las rutas de reportes
func (h *ReportsHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/reports")

	// Rutas públicas
	api.Post("/generate", h.GenerateReport)
	api.Get("/:id", h.GetReport)
	api.Get("/types", h.GetReportTypes)

	// Log para debug
	println("🔧 Rutas de reportes registradas")
}

// GenerateReport genera un nuevo reporte
func (h *ReportsHandler) GenerateReport(c *fiber.Ctx) error {
	var request services.ReportRequestV2

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Validar campos requeridos
	if request.CompanyURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "URL de la empresa es requerida",
		})
	}

	if request.ReportType == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"error":   "Tipo de reporte es requerido",
		})
	}

	// Configurar idioma por defecto
	if request.Language == "" {
		request.Language = "es"
	}

	// Generar reporte
	report, err := h.reportsService.GenerateReportV2(c.Context(), &request)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   "Error generando reporte: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    report,
		"message": "Reporte generado exitosamente",
	})
}

// GetReport obtiene un reporte específico
func (h *ReportsHandler) GetReport(c *fiber.Ctx) error {
	_ = c.Params("id") // TODO: Usar reportID para obtener reporte

	// TODO: Implementar obtención de reporte desde cache o DB
	// Por ahora retornar error
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"success": false,
		"error":   "Reporte no encontrado",
	})
}

// GetReportTypes obtiene los tipos de reporte disponibles
func (h *ReportsHandler) GetReportTypes(c *fiber.Ctx) error {
	reportTypes := []map[string]interface{}{
		{
			"id":          "digital_audit",
			"name":        "Auditoría Digital",
			"description": "Análisis completo de presencia digital y recomendaciones de mejora",
			"duration":    "2-3 minutos",
			"features": []string{
				"Análisis de sitio web",
				"Presencia en redes sociales",
				"SEO local",
				"Experiencia móvil",
				"Recomendaciones específicas",
			},
		},
		{
			"id":          "competitive",
			"name":        "Análisis Competitivo",
			"description": "Evaluación de posición en el mercado y ventajas competitivas",
			"duration":    "3-4 minutos",
			"features": []string{
				"Posición en el mercado",
				"Análisis de competidores",
				"Propuesta de valor",
				"Oportunidades de diferenciación",
				"Estrategias de crecimiento",
			},
		},
		{
			"id":          "colombia",
			"name":        "Reporte Colombia",
			"description": "Análisis específico para el mercado colombiano con cumplimiento legal",
			"duration":    "2-3 minutos",
			"features": []string{
				"Cumplimiento DIAN",
				"Métodos de pago locales",
				"Logística nacional",
				"Regulaciones colombianas",
				"Optimización para PYMEs",
			},
		},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"report_types": reportTypes,
			"total":        len(reportTypes),
		},
	})
}
