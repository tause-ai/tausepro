package handlers

import (
	"context"
	"log"

	"mcp-server/internal/models"
	"mcp-server/internal/services"

	"github.com/gofiber/fiber/v2"
)

// AgentsHandler maneja las operaciones de agentes
type AgentsHandler struct {
	agentService *services.AgentService
}

// NewAgentsHandler crea un nuevo handler de agentes
func NewAgentsHandler(agentService *services.AgentService) *AgentsHandler {
	return &AgentsHandler{
		agentService: agentService,
	}
}

// RegisterRoutes registra las rutas de agentes
func (h *AgentsHandler) RegisterRoutes(app *fiber.App) {
	log.Printf("🔧 Registrando rutas de agentes...")
	agents := app.Group("/api/v1/agents")

	agents.Post("/", h.CreateAgent)
	agents.Get("/", h.ListAgents)
	agents.Get("/:id", h.GetAgent)
	agents.Put("/:id", h.UpdateAgent)
	agents.Delete("/:id", h.DeleteAgent)

	// Rutas de conversación
	agents.Post("/:id/chat", h.SendMessage)
	agents.Get("/:id/history", h.GetConversationHistory)
	agents.Post("/:id/learn", h.LearnFromInteraction)

	// Rutas de inicialización
	agents.Post("/initialize", h.InitializeDefaultAgents)
	log.Printf("✅ Rutas de agentes registradas")
}

// CreateAgent crea un nuevo agente
func (h *AgentsHandler) CreateAgent(c *fiber.Ctx) error {
	var agent models.Agent
	if err := c.BodyParser(&agent); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	// Obtener tenant_id del contexto
	tenantID := c.Get("X-Tenant-ID", "default")
	agent.TenantID = tenantID

	ctx := context.Background()
	if err := h.agentService.CreateAgent(ctx, &agent); err != nil {
		log.Printf("Error creando agente: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error creando agente",
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"data":    agent,
		"message": "Agente creado exitosamente",
	})
}

// ListAgents lista todos los agentes del tenant
func (h *AgentsHandler) ListAgents(c *fiber.Ctx) error {
	tenantID := c.Get("X-Tenant-ID", "default")

	ctx := context.Background()
	agents, err := h.agentService.ListAgents(ctx, tenantID)
	if err != nil {
		log.Printf("Error listando agentes: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error obteniendo agentes",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    agents,
		"total":   len(agents),
	})
}

// GetAgent obtiene un agente específico
func (h *AgentsHandler) GetAgent(c *fiber.Ctx) error {
	id := c.Params("id")

	ctx := context.Background()
	agent, err := h.agentService.GetAgent(ctx, id)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"error":   "Agente no encontrado",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    agent,
	})
}

// UpdateAgent actualiza un agente
func (h *AgentsHandler) UpdateAgent(c *fiber.Ctx) error {
	id := c.Params("id")

	var updates map[string]interface{}
	if err := c.BodyParser(&updates); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	ctx := context.Background()
	if err := h.agentService.UpdateAgent(ctx, id, updates); err != nil {
		log.Printf("Error actualizando agente: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error actualizando agente",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Agente actualizado exitosamente",
	})
}

// DeleteAgent elimina un agente (soft delete)
func (h *AgentsHandler) DeleteAgent(c *fiber.Ctx) error {
	id := c.Params("id")

	ctx := context.Background()
	if err := h.agentService.DeleteAgent(ctx, id); err != nil {
		log.Printf("Error eliminando agente: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error eliminando agente",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Agente eliminado exitosamente",
	})
}

// SendMessage envía un mensaje al agente
func (h *AgentsHandler) SendMessage(c *fiber.Ctx) error {
	agentID := c.Params("id")
	log.Printf("SendMessage handler llamado: agentID=%s", agentID)

	var request struct {
		Message   string `json:"message"`
		UserID    string `json:"user_id"`
		SessionID string `json:"session_id"`
		TenantID  string `json:"tenant_id"`
	}

	if err := c.BodyParser(&request); err != nil {
		log.Printf("Error parseando request: %v", err)
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	log.Printf("Request parseado: message=%s, userID=%s, sessionID=%s",
		request.Message, request.UserID, request.SessionID)

	ctx := context.Background()
	response, err := h.agentService.SendMessage(ctx, agentID, request.UserID, request.SessionID, request.Message)
	if err != nil {
		log.Printf("Error enviando mensaje: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error enviando mensaje",
		})
	}

	log.Printf("Mensaje enviado exitosamente")
	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
		"message": "Mensaje enviado exitosamente",
	})
}

// GetConversationHistory obtiene el historial de conversación
func (h *AgentsHandler) GetConversationHistory(c *fiber.Ctx) error {
	agentID := c.Params("id")
	userID := c.Query("user_id")
	sessionID := c.Query("session_id")

	if userID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "user_id es requerido",
		})
	}

	if sessionID == "" {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "session_id es requerido",
		})
	}

	ctx := context.Background()
	history, err := h.agentService.GetConversationHistory(ctx, agentID, userID, sessionID)
	if err != nil {
		log.Printf("Error obteniendo historial: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error obteniendo historial",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    history,
		"total":   len(history),
	})
}

// LearnFromInteraction permite al agente aprender de la interacción
func (h *AgentsHandler) LearnFromInteraction(c *fiber.Ctx) error {
	agentID := c.Params("id")

	var learningEvent models.LearningEvent
	if err := c.BodyParser(&learningEvent); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"error":   "Datos inválidos",
		})
	}

	ctx := context.Background()
	if err := h.agentService.LearnFromInteraction(ctx, agentID, &learningEvent); err != nil {
		log.Printf("Error aprendiendo de interacción: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error procesando aprendizaje",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Aprendizaje procesado exitosamente",
	})
}

// InitializeDefaultAgents inicializa agentes por defecto
func (h *AgentsHandler) InitializeDefaultAgents(c *fiber.Ctx) error {
	tenantID := c.Get("X-Tenant-ID", "default")

	ctx := context.Background()
	if err := h.agentService.InitializeDefaultAgents(ctx, tenantID); err != nil {
		log.Printf("Error inicializando agentes: %v", err)
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"error":   "Error inicializando agentes",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Agentes por defecto inicializados exitosamente",
	})
}
