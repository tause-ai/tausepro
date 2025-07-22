package handlers

import (
	"fmt"
	"mcp-server/internal/services"

	"github.com/gofiber/fiber/v2"
)

// ConfigHandler maneja las peticiones de configuración del sistema
type ConfigHandler struct {
	configService *services.ConfigService
}

// NewConfigHandler crea una nueva instancia del handler
func NewConfigHandler(configService *services.ConfigService) *ConfigHandler {
	return &ConfigHandler{
		configService: configService,
	}
}

// APIKeyRequest request para actualizar API key
type APIKeyRequest struct {
	Service string `json:"service" validate:"required"`
	APIKey  string `json:"api_key" validate:"required"`
}

// APIKeyResponse respuesta de API key
type APIKeyResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Error   string `json:"error,omitempty"`
}

// ConfigResponse respuesta de configuración
type ConfigResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// GetConfig obtiene todas las API keys del sistema
func (h *ConfigHandler) GetConfig(c *fiber.Ctx) error {
	apiKeys, err := h.configService.GetAllAPIKeys()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(ConfigResponse{
			Success: false,
			Error:   fmt.Sprintf("Error obteniendo configuración: %v", err),
		})
	}

	return c.JSON(ConfigResponse{
		Success: true,
		Data:    apiKeys,
	})
}

// UpdateAPIKey actualiza una API key específica
func (h *ConfigHandler) UpdateAPIKey(c *fiber.Ctx) error {
	var req APIKeyRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   "Formato de request inválido",
		})
	}

	// Validar servicio
	if req.Service == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   "Servicio es requerido",
		})
	}

	if req.APIKey == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   "API Key es requerida",
		})
	}

	// Probar la API key antes de guardarla
	if err := h.configService.TestAPIKey(req.Service, req.APIKey); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   fmt.Sprintf("API Key inválida: %v", err),
		})
	}

	// Actualizar la API key
	if err := h.configService.UpdateAPIKey(req.Service, req.APIKey); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIKeyResponse{
			Success: false,
			Error:   fmt.Sprintf("Error actualizando API key: %v", err),
		})
	}

	return c.JSON(APIKeyResponse{
		Success: true,
		Message: fmt.Sprintf("API key de %s actualizada exitosamente", req.Service),
	})
}

// TestAPIKey prueba una API key sin guardarla
func (h *ConfigHandler) TestAPIKey(c *fiber.Ctx) error {
	var req APIKeyRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   "Formato de request inválido",
		})
	}

	if req.Service == "" || req.APIKey == "" {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   "Servicio y API Key son requeridos",
		})
	}

	// Probar la API key
	if err := h.configService.TestAPIKey(req.Service, req.APIKey); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(APIKeyResponse{
			Success: false,
			Error:   fmt.Sprintf("API Key inválida: %v", err),
		})
	}

	return c.JSON(APIKeyResponse{
		Success: true,
		Message: fmt.Sprintf("API key de %s es válida", req.Service),
	})
}

// ResetUsage resetea las estadísticas de uso
func (h *ConfigHandler) ResetUsage(c *fiber.Ctx) error {
	service := c.Query("service")
	if service == "" {
		service = "all" // Resetear todas por defecto
	}

	if err := h.configService.ResetUsage(service); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(APIKeyResponse{
			Success: false,
			Error:   fmt.Sprintf("Error reseteando uso: %v", err),
		})
	}

	return c.JSON(APIKeyResponse{
		Success: true,
		Message: fmt.Sprintf("Estadísticas de uso de %s reseteadas", service),
	})
}

// GetAPIKeyStatus obtiene el estado de las API keys
func (h *ConfigHandler) GetAPIKeyStatus(c *fiber.Ctx) error {
	apiKeys, err := h.configService.GetAllAPIKeys()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"error":   fmt.Sprintf("Error obteniendo estado de API keys: %v", err),
		})
	}

	// Convertir a formato de estado
	status := make(map[string]interface{})
	for _, key := range apiKeys {
		status[key.Service] = map[string]interface{}{
			"is_active":  key.IsActive,
			"last_used":  key.LastUsed,
			"usage":      key.Usage,
			"masked_key": key.MaskedKey,
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    status,
	})
}
