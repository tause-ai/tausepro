// services/mcp-server/internal/handlers/prompts_handler.go
package handlers

import (
	"github.com/gofiber/fiber/v2"

	"mcp-server/internal/services"
)

// PromptsHandler maneja las rutas de prompts
type PromptsHandler struct {
	promptsService *services.PromptsService
}

// NewPromptsHandler crea un nuevo handler
func NewPromptsHandler(promptsService *services.PromptsService) *PromptsHandler {
	return &PromptsHandler{
		promptsService: promptsService,
	}
}

// RegisterRoutes registra las rutas de prompts
func (h *PromptsHandler) RegisterRoutes(app *fiber.App) {
	api := app.Group("/api/v1/prompts")

	// Rutas públicas (solo lectura)
	api.Get("/", h.ListPrompts)
	api.Get("/:id", h.GetPrompt)
	api.Get("/category/:category", h.GetPromptsByCategory)

	// Rutas protegidas (admin)
	admin := api.Group("/", RequireAdmin)
	admin.Post("/", h.CreatePrompt)
	admin.Put("/:id", h.UpdatePrompt)
	admin.Delete("/:id", h.DeletePrompt)
	admin.Post("/:id/test", h.TestPrompt)
	admin.Post("/initialize", h.InitializeDefaults)
}

// ListPrompts lista todos los prompts activos
func (h *PromptsHandler) ListPrompts(c *fiber.Ctx) error {
	category := c.Query("category")

	prompts, err := h.promptsService.GetPromptByCategory(c.Context(), category)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error obteniendo prompts",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"prompts": prompts,
			"total":   len(prompts),
		},
	})
}

// GetPrompt obtiene un prompt específico
func (h *PromptsHandler) GetPrompt(c *fiber.Ctx) error {
	id := c.Params("id")

	prompt, err := h.promptsService.GetPrompt(c.Context(), id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Prompt no encontrado",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    prompt,
	})
}

// GetPromptsByCategory obtiene prompts por categoría
func (h *PromptsHandler) GetPromptsByCategory(c *fiber.Ctx) error {
	category := c.Params("category")

	prompts, err := h.promptsService.GetPromptByCategory(c.Context(), category)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error obteniendo prompts",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"category": category,
			"prompts":  prompts,
			"total":    len(prompts),
		},
	})
}

// CreatePrompt crea un nuevo prompt
func (h *PromptsHandler) CreatePrompt(c *fiber.Ctx) error {
	var input struct {
		Name        string            `json:"name"`
		Description string            `json:"description"`
		Category    string            `json:"category"`
		Prompt      string            `json:"prompt"`
		Variables   map[string]string `json:"variables"`
	}

	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Validaciones básicas
	if input.Name == "" || input.Description == "" || input.Category == "" || input.Prompt == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Todos los campos son requeridos",
		})
	}

	// Validar categoría
	validCategories := map[string]bool{
		"company":       true,
		"industry":      true,
		"competitors":   true,
		"opportunities": true,
	}

	if !validCategories[input.Category] {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Categoría inválida",
		})
	}

	prompt := &services.AnalysisPrompt{
		Name:        input.Name,
		Description: input.Description,
		Category:    input.Category,
		Prompt:      input.Prompt,
		Variables:   input.Variables,
		IsActive:    true,
	}

	if err := h.promptsService.CreatePrompt(c.Context(), prompt); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error creando prompt",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    prompt,
		"message": "Prompt creado exitosamente",
	})
}

// UpdatePrompt actualiza un prompt existente
func (h *PromptsHandler) UpdatePrompt(c *fiber.Ctx) error {
	id := c.Params("id")

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	if err := h.promptsService.UpdatePrompt(c.Context(), id, updates); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error actualizando prompt",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prompt actualizado exitosamente",
	})
}

// DeletePrompt desactiva un prompt
func (h *PromptsHandler) DeletePrompt(c *fiber.Ctx) error {
	id := c.Params("id")

	updates := map[string]interface{}{
		"is_active": false,
	}

	if err := h.promptsService.UpdatePrompt(c.Context(), id, updates); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error eliminando prompt",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prompt eliminado exitosamente",
	})
}

// TestPrompt prueba un prompt con datos de ejemplo
func (h *PromptsHandler) TestPrompt(c *fiber.Ctx) error {
	id := c.Params("id")

	result, err := h.promptsService.TestPrompt(c.Context(), id)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error probando prompt",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// InitializeDefaults inicializa los prompts por defecto
func (h *PromptsHandler) InitializeDefaults(c *fiber.Ctx) error {
	if err := h.promptsService.InitializeDefaultPrompts(c.Context()); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error inicializando prompts",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Prompts por defecto inicializados",
	})
}

// RequireAdmin middleware para verificar admin
func RequireAdmin(c *fiber.Ctx) error {
	// Por ahora, permitir acceso sin verificación
	// TODO: Implementar verificación de admin real
	return c.Next()
}
