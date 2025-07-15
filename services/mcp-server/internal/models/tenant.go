package models

import "time"

// Tenant representa una PYME en TausePro
type Tenant struct {
	ID        string         `json:"id" db:"id"`
	Name      string         `json:"name" db:"name"`
	Plan      string         `json:"plan" db:"plan"` // gratis, starter, growth, scale
	Active    bool           `json:"active" db:"active"`
	Settings  TenantSettings `json:"settings" db:"settings"`
	CreatedAt string         `json:"created_at" db:"created_at"`
	UpdatedAt string         `json:"updated_at" db:"updated_at"`
}

// TenantSettings configuraciones específicas por PYME
type TenantSettings struct {
	// Información Colombia
	Country   string `json:"country" db:"country"`     // "CO"
	Currency  string `json:"currency" db:"currency"`   // "COP"
	Timezone  string `json:"timezone" db:"timezone"`   // "America/Bogota"
	Language  string `json:"language" db:"language"`   // "es"
	NITNumber string `json:"nit_number" db:"nit_number"` // NIT de la empresa
	City      string `json:"city" db:"city"`           // Ciudad principal
	Industry  string `json:"industry" db:"industry"`   // retail, services, manufacturing, etc

	// Configuraciones de negocio
	BusinessName    string `json:"business_name" db:"business_name"`
	BusinessAddress string `json:"business_address" db:"business_address"`
	BusinessPhone   string `json:"business_phone" db:"business_phone"`
	BusinessEmail   string `json:"business_email" db:"business_email"`

	// Integraciones Colombia
	WompiAPIKey       string `json:"wompi_api_key,omitempty" db:"wompi_api_key"`
	DIANAPIKey        string `json:"dian_api_key,omitempty" db:"dian_api_key"`
	ServientregaAPIKey string `json:"servientrega_api_key,omitempty" db:"servientrega_api_key"`

	// Configuraciones UI
	PrimaryColor   string `json:"primary_color" db:"primary_color"`     // Color primario de la marca
	Logo          string `json:"logo" db:"logo"`                       // URL del logo
	WhatsAppNumber string `json:"whatsapp_number" db:"whatsapp_number"` // Número WhatsApp Business

	// Features habilitados por plan
	Features TenantFeatures `json:"features" db:"features"`
}

// TenantFeatures features disponibles según el plan
type TenantFeatures struct {
	EcommerceTool    bool `json:"ecommerce_tool"`     // Herramienta e-commerce
	WhatsAppBot      bool `json:"whatsapp_bot"`       // Bot WhatsApp
	AnalyticsDashboard bool `json:"analytics_dashboard"` // Dashboard analytics
	CustomBranding   bool `json:"custom_branding"`    // Branding personalizado
	APIAccess        bool `json:"api_access"`         // Acceso a API
	MultipleUsers    bool `json:"multiple_users"`     // Múltiples usuarios
	PrioritySupport  bool `json:"priority_support"`   // Soporte prioritario
}

// PlanLimits límites por plan del paywall
type PlanLimits struct {
	APICalls         int `json:"api_calls"`          // -1 para ilimitado
	MCPAgents        int `json:"mcp_agents"`         // -1 para ilimitado
	WhatsAppMessages int `json:"whatsapp_messages"`  // -1 para ilimitado
	PriceCOP         int `json:"price_cop"`          // Precio en pesos colombianos
}

// GetPlanFeatures retorna las features disponibles según el plan
func (t *Tenant) GetPlanFeatures() TenantFeatures {
	switch t.Plan {
	case "gratis":
		return TenantFeatures{
			EcommerceTool:      false,
			WhatsAppBot:        true,
			AnalyticsDashboard: false,
			CustomBranding:     false,
			APIAccess:          false,
			MultipleUsers:      false,
			PrioritySupport:    false,
		}
	case "starter":
		return TenantFeatures{
			EcommerceTool:      true,
			WhatsAppBot:        true,
			AnalyticsDashboard: true,
			CustomBranding:     false,
			APIAccess:          false,
			MultipleUsers:      true,
			PrioritySupport:    false,
		}
	case "growth":
		return TenantFeatures{
			EcommerceTool:      true,
			WhatsAppBot:        true,
			AnalyticsDashboard: true,
			CustomBranding:     true,
			APIAccess:          true,
			MultipleUsers:      true,
			PrioritySupport:    true,
		}
	case "scale":
		return TenantFeatures{
			EcommerceTool:      true,
			WhatsAppBot:        true,
			AnalyticsDashboard: true,
			CustomBranding:     true,
			APIAccess:          true,
			MultipleUsers:      true,
			PrioritySupport:    true,
		}
	default:
		return TenantFeatures{} // Sin features para plan desconocido
	}
}

// IsFeatureEnabled verifica si una feature está habilitada
func (t *Tenant) IsFeatureEnabled(feature string) bool {
	features := t.GetPlanFeatures()
	
	switch feature {
	case "ecommerce_tool":
		return features.EcommerceTool
	case "whatsapp_bot":
		return features.WhatsAppBot
	case "analytics_dashboard":
		return features.AnalyticsDashboard
	case "custom_branding":
		return features.CustomBranding
	case "api_access":
		return features.APIAccess
	case "multiple_users":
		return features.MultipleUsers
	case "priority_support":
		return features.PrioritySupport
	default:
		return false
	}
}

// GetColombiaFormatted retorna información formateada para Colombia
func (t *Tenant) GetColombiaFormatted() map[string]string {
	return map[string]string{
		"nit":      t.Settings.NITNumber,
		"city":     t.Settings.City,
		"timezone": t.Settings.Timezone,
		"currency": "COP",
		"country":  "Colombia",
		"language": "Español",
	}
} 