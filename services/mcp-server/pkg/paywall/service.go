package paywall

import (
	"fmt"
	"time"
)

// Service servicio para manejo del paywall y límites de planes
type Service struct {
	// En producción tendría conexión a Redis para tracking de usage
}

// NewService crea una nueva instancia del servicio Paywall
func NewService() *Service {
	return &Service{}
}

// CheckLimits verifica si el tenant puede realizar una acción
func (s *Service) CheckLimits(tenantID, plan, action string) (*LimitCheck, error) {
	planLimits := s.getPlanLimits(plan)
	currentUsage := s.getCurrentUsage(tenantID, action) // Simulado por ahora
	
	var limit int
	switch action {
	case "api_call":
		limit = planLimits.APICalls
	case "create_agent":
		limit = planLimits.MCPAgents
	case "whatsapp_message":
		limit = planLimits.WhatsAppMessages
	default:
		return &LimitCheck{
			Allowed: false,
			Message: "Acción no reconocida",
		}, nil
	}

	// -1 significa ilimitado
	if limit == -1 {
		return &LimitCheck{
			Allowed: true,
			Current: currentUsage,
			Limit:   -1,
			Message: "Acción permitida (plan ilimitado)",
		}, nil
	}

	allowed := currentUsage < limit
	message := s.getLimitMessage(action, allowed, currentUsage, limit)

	return &LimitCheck{
		Allowed:    allowed,
		Current:    currentUsage,
		Limit:      limit,
		Message:    message,
		UpgradeURL: s.getUpgradeURL(action),
	}, nil
}

// IncrementUsage incrementa el contador de uso para un tenant
func (s *Service) IncrementUsage(tenantID, action string) error {
	// TODO: Implementar con Redis
	// Key pattern: usage:{tenant}:{action}:{period}
	// TTL automático por período (mes)
	
	fmt.Printf("Incrementing usage for tenant %s, action %s\n", tenantID, action)
	return nil
}

// GetUsageStats retorna estadísticas de uso para un tenant
func (s *Service) GetUsageStats(tenantID, plan string) *UsageStats {
	planLimits := s.getPlanLimits(plan)
	
	return &UsageStats{
		APICalls: UsageStat{
			Current: s.getCurrentUsage(tenantID, "api_call"),
			Limit:   planLimits.APICalls,
			Period:  "monthly",
		},
		MCPAgents: UsageStat{
			Current: s.getCurrentUsage(tenantID, "create_agent"),
			Limit:   planLimits.MCPAgents,
			Period:  "total",
		},
		WhatsAppMessages: UsageStat{
			Current: s.getCurrentUsage(tenantID, "whatsapp_message"),
			Limit:   planLimits.WhatsAppMessages,
			Period:  "monthly",
		},
		Plan:     plan,
		PriceCOP: planLimits.PriceCOP,
	}
}

// GetPlanComparison retorna comparación de planes para upgrade
func (s *Service) GetPlanComparison() *PlanComparison {
	return &PlanComparison{
		Plans: []Plan{
			{
				Name:        "gratis",
				DisplayName: "Gratis",
				PriceCOP:    0,
				Features: PlanFeatures{
					APICalls:         100,
					MCPAgents:        3,
					WhatsAppMessages: 50,
					EcommerceTool:    false,
					AnalyticsDashboard: false,
					CustomBranding:   false,
					APIAccess:        false,
					PrioritySupport:  false,
				},
				PopularFeatures: []string{
					"3 agentes MCP",
					"100 llamadas API/mes",
					"50 mensajes WhatsApp/mes",
					"Soporte básico",
				},
			},
			{
				Name:        "starter",
				DisplayName: "Starter",
				PriceCOP:    49900,
				Features: PlanFeatures{
					APICalls:         5000,
					MCPAgents:        10,
					WhatsAppMessages: 1000,
					EcommerceTool:    true,
					AnalyticsDashboard: true,
					CustomBranding:   false,
					APIAccess:        false,
					PrioritySupport:  false,
				},
				PopularFeatures: []string{
					"10 agentes MCP",
					"5.000 llamadas API/mes",
					"1.000 mensajes WhatsApp/mes",
					"Tienda online",
					"Dashboard analytics",
					"Múltiples usuarios",
				},
				Recommended: true,
			},
			{
				Name:        "growth",
				DisplayName: "Growth",
				PriceCOP:    149900,
				Features: PlanFeatures{
					APICalls:         25000,
					MCPAgents:        50,
					WhatsAppMessages: 5000,
					EcommerceTool:    true,
					AnalyticsDashboard: true,
					CustomBranding:   true,
					APIAccess:        true,
					PrioritySupport:  true,
				},
				PopularFeatures: []string{
					"50 agentes MCP",
					"25.000 llamadas API/mes",
					"5.000 mensajes WhatsApp/mes",
					"Branding personalizado",
					"Acceso API completo",
					"Soporte prioritario",
				},
			},
			{
				Name:        "scale",
				DisplayName: "Scale",
				PriceCOP:    499900,
				Features: PlanFeatures{
					APICalls:         -1, // Ilimitado
					MCPAgents:        -1, // Ilimitado
					WhatsAppMessages: -1, // Ilimitado
					EcommerceTool:    true,
					AnalyticsDashboard: true,
					CustomBranding:   true,
					APIAccess:        true,
					PrioritySupport:  true,
				},
				PopularFeatures: []string{
					"Agentes MCP ilimitados",
					"API calls ilimitadas",
					"WhatsApp ilimitado",
					"Todo incluido",
					"Soporte 24/7",
					"Onboarding dedicado",
				},
				Enterprise: true,
			},
		},
	}
}

// Helper methods

func (s *Service) getPlanLimits(plan string) PlanLimits {
	plans := map[string]PlanLimits{
		"gratis": {
			APICalls:         100,
			MCPAgents:        3,
			WhatsAppMessages: 50,
			PriceCOP:         0,
		},
		"starter": {
			APICalls:         5000,
			MCPAgents:        10,
			WhatsAppMessages: 1000,
			PriceCOP:         49900,
		},
		"growth": {
			APICalls:         25000,
			MCPAgents:        50,
			WhatsAppMessages: 5000,
			PriceCOP:         149900,
		},
		"scale": {
			APICalls:         -1, // Ilimitado
			MCPAgents:        -1, // Ilimitado
			WhatsAppMessages: -1, // Ilimitado
			PriceCOP:         499900,
		},
	}

	if limits, exists := plans[plan]; exists {
		return limits
	}
	return plans["gratis"] // Default
}

func (s *Service) getCurrentUsage(tenantID, action string) int {
	// TODO: Implementar consulta a Redis
	// Por ahora simular algunos valores
	
	usage := map[string]int{
		"api_call":          42,  // De 100 en plan gratis
		"create_agent":      2,   // De 3 en plan gratis
		"whatsapp_message":  15,  // De 50 en plan gratis
	}
	
	if current, exists := usage[action]; exists {
		return current
	}
	return 0
}

func (s *Service) getLimitMessage(action string, allowed bool, current, limit int) string {
	actionNames := map[string]string{
		"api_call":          "llamadas API",
		"create_agent":      "agentes MCP",
		"whatsapp_message":  "mensajes WhatsApp",
	}
	
	actionName := actionNames[action]
	if actionName == "" {
		actionName = action
	}
	
	if allowed {
		return fmt.Sprintf("Has usado %d de %d %s este mes", current, limit, actionName)
	}
	
	return fmt.Sprintf("Has alcanzado el límite de %s (%d/%d). ¡Upgradea tu plan para continuar!", actionName, current, limit)
}

func (s *Service) getUpgradeURL(action string) string {
	return fmt.Sprintf("https://app.tause.pro/billing/upgrade?reason=%s", action)
}

// Types

type LimitCheck struct {
	Allowed    bool   `json:"allowed"`
	Current    int    `json:"current"`
	Limit      int    `json:"limit"`
	Message    string `json:"message"`
	UpgradeURL string `json:"upgrade_url,omitempty"`
}

type UsageStats struct {
	APICalls         UsageStat `json:"api_calls"`
	MCPAgents        UsageStat `json:"mcp_agents"`
	WhatsAppMessages UsageStat `json:"whatsapp_messages"`
	Plan             string    `json:"plan"`
	PriceCOP         int       `json:"price_cop"`
}

type UsageStat struct {
	Current int    `json:"current"`
	Limit   int    `json:"limit"` // -1 para ilimitado
	Period  string `json:"period"` // monthly, daily, total
}

type PlanLimits struct {
	APICalls         int `json:"api_calls"`
	MCPAgents        int `json:"mcp_agents"`
	WhatsAppMessages int `json:"whatsapp_messages"`
	PriceCOP         int `json:"price_cop"`
}

type PlanComparison struct {
	Plans []Plan `json:"plans"`
}

type Plan struct {
	Name            string      `json:"name"`
	DisplayName     string      `json:"display_name"`
	PriceCOP        int         `json:"price_cop"`
	Features        PlanFeatures `json:"features"`
	PopularFeatures []string    `json:"popular_features"`
	Recommended     bool        `json:"recommended,omitempty"`
	Enterprise      bool        `json:"enterprise,omitempty"`
}

type PlanFeatures struct {
	APICalls           int  `json:"api_calls"`
	MCPAgents          int  `json:"mcp_agents"`
	WhatsAppMessages   int  `json:"whatsapp_messages"`
	EcommerceTool      bool `json:"ecommerce_tool"`
	AnalyticsDashboard bool `json:"analytics_dashboard"`
	CustomBranding     bool `json:"custom_branding"`
	APIAccess          bool `json:"api_access"`
	PrioritySupport    bool `json:"priority_support"`
} 