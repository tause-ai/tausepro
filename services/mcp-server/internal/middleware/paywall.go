package middleware

import (
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
	"github.com/tausepro/mcp-server/internal/models"
	"github.com/tausepro/mcp-server/pkg/errors"
)

// PaywallMiddleware enforza los límites del paywall para PYMEs
func PaywallMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Obtener información del tenant del contexto
		tenant, ok := c.Locals("tenant").(*models.Tenant)
		if !ok {
			return errors.NewPaywallError("Tenant no encontrado", "TENANT_NOT_FOUND")
		}

		// Verificar límites según el plan
		if err := checkUsageLimits(c, tenant); err != nil {
			return err
		}

		// Incrementar contador de uso
		if err := incrementUsage(c, tenant); err != nil {
			// Log error pero continuar (no bloquear por error de tracking)
			fmt.Printf("Error incrementando usage para tenant %s: %v\n", tenant.ID, err)
		}

		return c.Next()
	}
}

func checkUsageLimits(c *fiber.Ctx, tenant *models.Tenant) error {
	// Obtener plan del tenant
	plan := getPlanLimits(tenant.Plan)
	
	// Verificar límite de API calls
	currentUsage, err := getCurrentUsage(tenant.ID, "api_calls", "month")
	if err != nil {
		return err
	}

	if plan.APICalls != -1 && currentUsage >= plan.APICalls {
		return createUpgradeRequiredError(c, "api_calls", currentUsage, plan.APICalls)
	}

	// Verificar límite de agentes MCP si es una ruta de agentes
	if isAgentRoute(c.Path()) {
		agentCount, err := getAgentCount(tenant.ID)
		if err != nil {
			return err
		}

		if plan.MCPAgents != -1 && agentCount >= plan.MCPAgents {
			return createUpgradeRequiredError(c, "mcp_agents", agentCount, plan.MCPAgents)
		}
	}

	// Verificar límite de mensajes WhatsApp si es ruta de chat
	if isChatRoute(c.Path()) {
		whatsappUsage, err := getCurrentUsage(tenant.ID, "whatsapp_messages", "month")
		if err != nil {
			return err
		}

		if plan.WhatsAppMessages != -1 && whatsappUsage >= plan.WhatsAppMessages {
			return createUpgradeRequiredError(c, "whatsapp_messages", whatsappUsage, plan.WhatsAppMessages)
		}
	}

	return nil
}

func getCurrentUsage(tenantID, metric, period string) (int, error) {
	// TODO: Implementar con Redis
	// Formato de key: usage:{tenant}:{metric}:{period}:{timestamp}
	
	// Por ahora returnar 0 (simulación)
	// En producción esto consultaría Redis
	return 0, nil
}

func incrementUsage(c *fiber.Ctx, tenant *models.Tenant) error {
	// TODO: Implementar incremento en Redis
	// - Incrementar contador de API calls
	// - Si es ruta de chat, incrementar WhatsApp messages
	// - Usar TTL para expiración automática por período
	
	return nil
}

func getAgentCount(tenantID string) (int, error) {
	// TODO: Consultar PocketBase para contar agentes del tenant
	return 0, nil
}

func getPlanLimits(planName string) models.PlanLimits {
	plans := map[string]models.PlanLimits{
		"gratis": {
			APICalls:        100,
			MCPAgents:       3,
			WhatsAppMessages: 50,
			PriceCOP:        0,
		},
		"starter": {
			APICalls:        5000,
			MCPAgents:       10,
			WhatsAppMessages: 1000,
			PriceCOP:        49900,
		},
		"growth": {
			APICalls:        25000,
			MCPAgents:       50,
			WhatsAppMessages: 5000,
			PriceCOP:        149900,
		},
		"scale": {
			APICalls:        -1, // Ilimitado
			MCPAgents:       -1, // Ilimitado
			WhatsAppMessages: -1, // Ilimitado
			PriceCOP:        499900,
		},
	}

	if plan, exists := plans[planName]; exists {
		return plan
	}
	
	// Default a plan gratis si no existe
	return plans["gratis"]
}

func createUpgradeRequiredError(c *fiber.Ctx, metric string, current, limit int) error {
	upgradeURL := fmt.Sprintf("https://app.tause.pro/billing/upgrade?metric=%s", metric)
	
	return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
		"error": true,
		"code":  "UPGRADE_REQUIRED",
		"message": "Has alcanzado el límite de tu plan. ¡Upgradeate para continuar!",
		"details": fiber.Map{
			"metric":      metric,
			"current":     current,
			"limit":       limit,
			"upgrade_url": upgradeURL,
			"plans": fiber.Map{
				"starter": "Desde $49.900 COP/mes",
				"growth":  "Desde $149.900 COP/mes", 
				"scale":   "Desde $499.900 COP/mes",
			},
		},
	})
}

func isAgentRoute(path string) bool {
	agentRoutes := []string{"/api/v1/pymes/agents", "/api/v1/mcp/agents"}
	for _, route := range agentRoutes {
		if len(path) >= len(route) && path[:len(route)] == route {
			return true
		}
	}
	return false
}

func isChatRoute(path string) bool {
	chatRoutes := []string{"/api/v1/mcp/agents/", "/api/v1/chat", "/api/v1/whatsapp"}
	for _, route := range chatRoutes {
		if len(path) >= len(route) && path[:len(route)] == route {
			return true
		}
	}
	return false
} 