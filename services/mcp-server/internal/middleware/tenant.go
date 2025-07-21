package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"mcp-server/internal/models"
	"mcp-server/pkg/errors"
)

// TenantMiddleware maneja la identificación y contexto del tenant (PYME)
func TenantMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		var tenantID string

		// 1. Intentar obtener tenant desde header X-Tenant-ID
		tenantID = c.Get("X-Tenant-ID")

		// 2. Si no está en header, extraer desde subdomain
		if tenantID == "" {
			tenantID = extractTenantFromHost(c.Get("Host"))
		}

		// 3. Si aún no hay tenant, usar valor por defecto para desarrollo
		if tenantID == "" {
			tenantID = "default"
		}

		// Obtener información completa del tenant
		tenant, err := getTenantInfo(tenantID)
		if err != nil {
			return errors.NewTenantError("Tenant no encontrado", "TENANT_NOT_FOUND")
		}

		// Verificar que el tenant esté activo
		if !tenant.Active {
			return errors.NewTenantError("Tenant inactivo", "TENANT_INACTIVE")
		}

		// Guardar tenant en contexto para uso en otros middlewares y handlers
		c.Locals("tenant", tenant)
		c.Locals("tenantID", tenant.ID)

		// Agregar header de respuesta para debugging
		c.Set("X-Tenant-ID", tenant.ID)

		return c.Next()
	}
}

func extractTenantFromHost(host string) string {
	// Para desarrollo local (ej: empresa1.tause.localhost)
	if strings.Contains(host, "localhost") {
		parts := strings.Split(host, ".")
		if len(parts) >= 3 && parts[0] != "app" && parts[0] != "api" && parts[0] != "tause" {
			return parts[0]
		}
		return ""
	}

	// Para producción (ej: empresa1.tause.pro)
	if strings.Contains(host, "tause.pro") {
		parts := strings.Split(host, ".")
		if len(parts) >= 3 && parts[0] != "app" && parts[0] != "api" {
			return parts[0]
		}
		return ""
	}

	return ""
}

func getTenantInfo(tenantID string) (*models.Tenant, error) {
	// TODO: Implementar consulta a PocketBase
	// Por ahora retornar tenant mock para desarrollo
	
	// Simulación de tenant para desarrollo
	mockTenant := &models.Tenant{
		ID:       tenantID,
		Name:     getTenantDisplayName(tenantID),
		Plan:     "gratis", // Plan por defecto
		Active:   true,
		Settings: models.TenantSettings{
			Country:    "CO",
			Currency:   "COP",
			Timezone:   "America/Bogota",
			Language:   "es",
			NITNumber:  "900123456-7",
			City:       "Bogotá",
			Industry:   "retail",
		},
		CreatedAt: "2024-01-01T00:00:00Z",
		UpdatedAt: "2024-01-01T00:00:00Z",
	}

	return mockTenant, nil
}

func getTenantDisplayName(tenantID string) string {
	// Generar nombre display amigable para PYMEs
	displayNames := map[string]string{
		"default":    "PYME Demo",
		"empresa1":   "Tienda El Éxito",
		"empresa2":   "Distribuidora López",
		"empresa3":   "Boutique María",
		"panaderia":  "Panadería San Juan",
		"ferreteria": "Ferretería Central",
		"farmacia":   "Farmacia Popular",
	}

	if name, exists := displayNames[tenantID]; exists {
		return name
	}

	// Capitalizar tenant ID como fallback
	return strings.Title(tenantID) + " PYME"
} 