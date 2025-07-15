package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/tausepro/mcp-server/internal/models"
)

// GetDashboard retorna el dashboard principal para la PYME
func GetDashboard(c *fiber.Ctx) error {
	// Obtener información del tenant y usuario del contexto
	tenant := c.Locals("tenant").(*models.Tenant)
	user := c.Locals("user").(*models.User)

	// Simular datos del dashboard (en producción vendría de PocketBase)
	dashboardData := map[string]interface{}{
		"tenant": map[string]interface{}{
			"name":     tenant.Name,
			"plan":     tenant.Plan,
			"industry": tenant.Settings.Industry,
			"city":     tenant.Settings.City,
			"features": tenant.GetPlanFeatures(),
		},
		"user": user.GetDisplayInfo(),
		"stats": map[string]interface{}{
			"api_calls_today":     42,
			"agents_active":       2,
			"whatsapp_messages":   15,
			"orders_pending":      8,
			"revenue_month_cop":   2450000, // $2.450.000 COP
		},
		"recent_activity": []map[string]interface{}{
			{
				"type":        "order",
				"description": "Nueva orden de Maria González",
				"amount_cop":  125000,
				"timestamp":   time.Now().Add(-2 * time.Hour),
			},
			{
				"type":        "agent",
				"description": "Agente de ventas respondió 3 consultas",
				"timestamp":   time.Now().Add(-4 * time.Hour),
			},
			{
				"type":        "payment",
				"description": "Pago PSE recibido - Pedido #1234",
				"amount_cop":  89000,
				"timestamp":   time.Now().Add(-6 * time.Hour),
			},
		},
		"quick_actions": []map[string]interface{}{
			{
				"title":       "Crear Agente MCP",
				"description": "Nuevo agente para ventas o soporte",
				"icon":        "bot",
				"url":         "/api/v1/pymes/agents/create",
				"available":   tenant.IsFeatureEnabled("whatsapp_bot"),
			},
			{
				"title":       "Ver Analytics",
				"description": "Reportes de ventas y métricas",
				"icon":        "chart",
				"url":         "/api/v1/pymes/analytics",
				"available":   tenant.IsFeatureEnabled("analytics_dashboard"),
			},
			{
				"title":       "Generar Factura DIAN",
				"description": "Facturación electrónica",
				"icon":        "receipt",
				"url":         "/api/v1/colombia/invoice/dian",
				"available":   true,
			},
		},
		"notifications": []map[string]interface{}{
			{
				"type":    "paywall",
				"message": "Has usado 42 de 100 llamadas API este mes",
				"level":   "info",
			},
		},
	}

	// Agregar notificación de paywall si está cerca del límite
	if tenant.Plan == "gratis" {
		dashboardData["notifications"] = append(
			dashboardData["notifications"].([]map[string]interface{}),
			map[string]interface{}{
				"type":    "upgrade",
				"message": "¡Upgrade a Starter por solo $49.900 COP/mes y desbloquea e-commerce!",
				"level":   "warning",
				"cta":     "Ver Planes",
				"url":     "https://app.tause.pro/billing/upgrade",
			},
		)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    dashboardData,
	})
}

// GetAnalytics retorna analytics para la PYME
func GetAnalytics(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)

	// Verificar que tenga acceso a analytics
	if !tenant.IsFeatureEnabled("analytics_dashboard") {
		return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
			"error":   true,
			"message": "Analytics solo disponible en plan Starter o superior",
			"upgrade_url": "https://app.tause.pro/billing/upgrade",
		})
	}

	// Simular datos de analytics (en producción vendría de PostgreSQL/ClickHouse)
	analyticsData := map[string]interface{}{
		"revenue": map[string]interface{}{
			"total_month_cop": 4780000, // $4.780.000 COP
			"growth_percent":  15.3,
			"chart_data": []map[string]interface{}{
				{"date": "2024-01-01", "amount": 450000},
				{"date": "2024-01-02", "amount": 520000},
				{"date": "2024-01-03", "amount": 380000},
				{"date": "2024-01-04", "amount": 650000},
				{"date": "2024-01-05", "amount": 720000},
			},
		},
		"orders": map[string]interface{}{
			"total_month":    127,
			"pending":        8,
			"completed":      115,
			"cancelled":      4,
			"average_cop":    37638, // Promedio por orden
		},
		"customers": map[string]interface{}{
			"total_active":   89,
			"new_this_month": 23,
			"returning":      66,
			"top_cities": []map[string]interface{}{
				{"city": "Bogotá", "count": 34},
				{"city": "Medellín", "count": 18},
				{"city": "Cali", "count": 12},
				{"city": "Barranquilla", "count": 8},
			},
		},
		"mcp_agents": map[string]interface{}{
			"total_interactions": 245,
			"resolution_rate":    0.87,
			"avg_response_time":  "2.3 segundos",
			"top_queries": []string{
				"¿Cuánto cuesta el envío a Medellín?",
				"¿Tienen disponible en talla M?",
				"¿Aceptan PSE?",
				"Horarios de atención",
			},
		},
		"colombia_specific": map[string]interface{}{
			"payment_methods": map[string]int{
				"PSE":       45,
				"Nequi":     28,
				"Wompi":     19,
				"Efectivo":  35,
			},
			"shipping_carriers": map[string]int{
				"Servientrega": 67,
				"TCC":          34,
				"Coordinadora": 26,
			},
			"cities_delivered": 15,
			"dian_invoices":    89,
		},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    analyticsData,
	})
}

// CreateAgent crea un nuevo agente MCP para la PYME
func CreateAgent(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)
	user := c.Locals("user").(*models.User)

	// Verificar permisos
	if !user.CanPerform("manage_agents") {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error":   true,
			"message": "No tienes permisos para crear agentes",
		})
	}

	// Parse request body
	var request struct {
		Name        string `json:"name" validate:"required"`
		Description string `json:"description" validate:"required"`
		Category    string `json:"category" validate:"required,oneof=ventas soporte contabilidad logistica"`
		Tools       []string `json:"tools"`
		Settings    map[string]interface{} `json:"settings"`
	}

	if err := c.BodyParser(&request); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error":   true,
			"message": "Datos inválidos",
		})
	}

	// TODO: Validar límites del paywall para agentes MCP

	// Simular creación del agente (en producción iría a PocketBase)
	agent := map[string]interface{}{
		"id":          "agent_" + time.Now().Format("20060102150405"),
		"name":        request.Name,
		"description": request.Description,
		"category":    request.Category,
		"tenant_id":   tenant.ID,
		"created_by":  user.ID,
		"status":      "active",
		"tools":       getDefaultToolsForCategory(request.Category),
		"settings": map[string]interface{}{
			"language":        "es",
			"colombia_mode":   true,
			"whatsapp_number": tenant.Settings.WhatsAppNumber,
			"business_name":   tenant.Settings.BusinessName,
		},
		"created_at": time.Now(),
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Agente MCP creado exitosamente",
		"data":    agent,
	})
}

// ListAgents lista los agentes MCP de la PYME
func ListAgents(c *fiber.Ctx) error {
	tenant := c.Locals("tenant").(*models.Tenant)

	// Simular lista de agentes (en producción vendría de PocketBase)
	agents := []map[string]interface{}{
		{
			"id":          "agent_001",
			"name":        "Asistente de Ventas",
			"description": "Ayuda con consultas de productos y precios",
			"category":    "ventas",
			"status":      "active",
			"interactions_today": 15,
			"created_at":  "2024-01-01T10:00:00Z",
		},
		{
			"id":          "agent_002", 
			"name":        "Soporte Técnico",
			"description": "Resuelve dudas técnicas y problemas",
			"category":    "soporte",
			"status":      "active",
			"interactions_today": 8,
			"created_at":  "2024-01-02T14:30:00Z",
		},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": map[string]interface{}{
			"agents": agents,
			"total":  len(agents),
			"limits": map[string]interface{}{
				"max_agents": getMaxAgentsForPlan(tenant.Plan),
				"current":    len(agents),
			},
		},
	})
}

// Helper functions

func getDefaultToolsForCategory(category string) []string {
	toolsByCategory := map[string][]string{
		"ventas": {
			"product_catalog",
			"price_calculator", 
			"inventory_check",
			"order_creator",
			"payment_processor",
		},
		"soporte": {
			"faq_searcher",
			"ticket_creator",
			"status_checker",
			"troubleshooter",
		},
		"contabilidad": {
			"invoice_generator",
			"expense_tracker",
			"tax_calculator",
			"dian_reporter",
		},
		"logistica": {
			"shipping_calculator",
			"tracking_checker",
			"route_optimizer",
			"carrier_selector",
		},
	}

	if tools, exists := toolsByCategory[category]; exists {
		return tools
	}
	return []string{}
}

func getMaxAgentsForPlan(plan string) int {
	limits := map[string]int{
		"gratis":  3,
		"starter": 10,
		"growth":  50,
		"scale":   -1, // Ilimitado
	}
	
	if limit, exists := limits[plan]; exists {
		return limit
	}
	return 3 // Default al plan gratis
} 