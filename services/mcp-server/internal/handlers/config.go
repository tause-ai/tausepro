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
	Success bool                   `json:"success"`
	Data    *services.SystemConfig `json:"data,omitempty"`
	Error   string                 `json:"error,omitempty"`
}

// GetConfig obtiene la configuración completa del sistema
func (h *ConfigHandler) GetConfig(c *fiber.Ctx) error {
	config := h.configService.GetConfig()

	return c.JSON(ConfigResponse{
		Success: true,
		Data:    config,
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
	config := h.configService.GetConfig()

	status := map[string]interface{}{
		"openai": map[string]interface{}{
			"is_active": config.APIKeys.OpenAI.IsActive,
			"last_used": config.APIKeys.OpenAI.LastUsed,
			"usage":     config.APIKeys.OpenAI.Usage,
		},
		"tavily": map[string]interface{}{
			"is_active": config.APIKeys.Tavily.IsActive,
			"last_used": config.APIKeys.Tavily.LastUsed,
			"usage":     config.APIKeys.Tavily.Usage,
		},
		"elevenlabs": map[string]interface{}{
			"is_active": config.APIKeys.ElevenLabs.IsActive,
			"last_used": config.APIKeys.ElevenLabs.LastUsed,
			"usage":     config.APIKeys.ElevenLabs.Usage,
		},
		"google": map[string]interface{}{
			"is_active": config.APIKeys.Google.IsActive,
			"last_used": config.APIKeys.Google.LastUsed,
			"usage":     config.APIKeys.Google.Usage,
		},
		"meta": map[string]interface{}{
			"is_active": config.APIKeys.Meta.IsActive,
			"last_used": config.APIKeys.Meta.LastUsed,
			"usage":     config.APIKeys.Meta.Usage,
		},
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    status,
	})
}
