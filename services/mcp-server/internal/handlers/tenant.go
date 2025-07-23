package handlers

import (
	"mcp-server/internal/tenant"

	"github.com/gofiber/fiber/v2"
)

// TenantHandler maneja las operaciones de tenants
type TenantHandler struct {
	tenantManager *tenant.TenantManager
}

// NewTenantHandler crea un nuevo handler de tenants
func NewTenantHandler(tenantManager *tenant.TenantManager) *TenantHandler {
	return &TenantHandler{
		tenantManager: tenantManager,
	}
}

// CreateTenant crea un nuevo tenant
func (h *TenantHandler) CreateTenant(c *fiber.Ctx) error {
	var input tenant.CreateTenantInput
	if err := c.BodyParser(&input); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validar input
	if input.Subdomain == "" || input.CompanyName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Subdomain and company name are required",
		})
	}

	// Crear tenant
	tenant, err := h.tenantManager.CreateTenant(c.Context(), input)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create tenant",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tenant,
	})
}

// GetTenant obtiene información del tenant actual
func (h *TenantHandler) GetTenant(c *fiber.Ctx) error {
	// Obtener tenant del contexto (seteado por middleware)
	tenant := c.Locals("tenant").(*tenant.Tenant)
	if tenant == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Tenant not found",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tenant,
	})
}

// UpdateTenant actualiza configuración del tenant
func (h *TenantHandler) UpdateTenant(c *fiber.Ctx) error {
	// Obtener tenant del contexto
	tenant := c.Locals("tenant").(*tenant.Tenant)
	if tenant == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Tenant not found",
		})
	}

	// TODO: Implementar actualización de tenant
	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tenant updated successfully",
	})
}

// GetTenantFeatures obtiene las features disponibles para el tenant
func (h *TenantHandler) GetTenantFeatures(c *fiber.Ctx) error {
	// Obtener tenant del contexto
	tenant := c.Locals("tenant").(*tenant.Tenant)
	if tenant == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Tenant not found",
		})
	}

	// Obtener features disponibles
	features := map[string]bool{
		"whatsapp_basic":     tenant.HasFeature("whatsapp_basic"),
		"whatsapp_advanced":  tenant.HasFeature("whatsapp_advanced"),
		"analytics_basic":    tenant.HasFeature("analytics_basic"),
		"analytics_advanced": tenant.HasFeature("analytics_advanced"),
		"api_access":         tenant.HasFeature("api_access"),
		"custom_branding":    tenant.HasFeature("custom_branding"),
		"multiple_agents":    tenant.HasFeature("multiple_agents"),
		"analysis_basic":     tenant.HasFeature("analysis_basic"),
		"analysis_advanced":  tenant.HasFeature("analysis_advanced"),
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"features": features,
			"plan":     tenant.Plan,
			"limits":   tenant.Limits,
		},
	})
}

// CheckTenantLimit verifica si el tenant puede realizar una acción
func (h *TenantHandler) CheckTenantLimit(c *fiber.Ctx) error {
	// Obtener tenant del contexto
	tenant := c.Locals("tenant").(*tenant.Tenant)
	if tenant == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Tenant not found",
		})
	}

	// Obtener recurso a verificar
	resource := c.Query("resource")
	if resource == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Resource parameter is required",
		})
	}

	// Verificar límite
	allowed, err := h.tenantManager.CheckLimit(c.Context(), tenant.ID, resource)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to check limit",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"allowed":  allowed,
			"resource": resource,
		},
	})
}
