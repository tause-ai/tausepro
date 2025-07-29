package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"mcp-server/internal/cache"
	"mcp-server/internal/models"
	"time"

	"github.com/google/uuid"
)

// AgentService gestiona los agentes inteligentes
type AgentService struct {
	db    *sql.DB
	cache *cache.RedisCache
}

// NewAgentService crea un nuevo servicio de agentes
func NewAgentService(db *sql.DB, cache *cache.RedisCache) *AgentService {
	return &AgentService{
		db:    db,
		cache: cache,
	}
}

// CreateAgent crea un nuevo agente
func (s *AgentService) CreateAgent(ctx context.Context, agent *models.Agent) error {
	agent.ID = uuid.New().String()
	agent.CreatedAt = time.Now()
	agent.UpdatedAt = time.Now()

	// Serializar datos complejos
	personalityJSON, _ := json.Marshal(agent.Personality)
	knowledgeJSON, _ := json.Marshal(agent.Knowledge)
	contextJSON, _ := json.Marshal(agent.Context)
	skillsJSON, _ := json.Marshal(agent.Skills)
	metadataJSON, _ := json.Marshal(agent.Metadata)

	query := `
		INSERT INTO agents (
			id, name, personality, knowledge, context, skills, 
			is_active, tenant_id, created_at, updated_at, metadata
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err := s.db.ExecContext(ctx, query,
		agent.ID,
		agent.Name,
		personalityJSON,
		knowledgeJSON,
		contextJSON,
		skillsJSON,
		agent.IsActive,
		agent.TenantID,
		agent.CreatedAt,
		agent.UpdatedAt,
		metadataJSON,
	)

	if err != nil {
		log.Printf("Error creando agente: %v", err)
		return err
	}

	// Cache del agente
	cacheKey := fmt.Sprintf("agent:%s", agent.ID)
	s.cache.CacheResult(cacheKey, agent, 24*time.Hour)

	return nil
}

// GetAgent obtiene un agente por ID
func (s *AgentService) GetAgent(ctx context.Context, id string) (*models.Agent, error) {
	// Intentar obtener del cache primero
	cacheKey := fmt.Sprintf("agent:%s", id)
	var cachedAgent models.Agent
	if found, _ := s.cache.GetCachedResult(cacheKey, &cachedAgent); found {
		return &cachedAgent, nil
	}

	query := `
		SELECT id, name, personality, knowledge, context, skills,
		       is_active, tenant_id, created_at, updated_at, metadata
		FROM agents WHERE id = $1
	`

	row := s.db.QueryRowContext(ctx, query, id)

	var agent models.Agent
	var personalityJSON, knowledgeJSON, contextJSON, skillsJSON, metadataJSON []byte

	err := row.Scan(
		&agent.ID,
		&agent.Name,
		&personalityJSON,
		&knowledgeJSON,
		&contextJSON,
		&skillsJSON,
		&agent.IsActive,
		&agent.TenantID,
		&agent.CreatedAt,
		&agent.UpdatedAt,
		&metadataJSON,
	)

	if err != nil {
		return nil, err
	}

	// Deserializar datos complejos
	json.Unmarshal(personalityJSON, &agent.Personality)
	json.Unmarshal(knowledgeJSON, &agent.Knowledge)
	json.Unmarshal(contextJSON, &agent.Context)
	json.Unmarshal(skillsJSON, &agent.Skills)
	json.Unmarshal(metadataJSON, &agent.Metadata)

	// Cache del agente
	s.cache.CacheResult(cacheKey, &agent, 24*time.Hour)

	return &agent, nil
}

// ListAgents lista todos los agentes de un tenant
func (s *AgentService) ListAgents(ctx context.Context, tenantID string) ([]*models.Agent, error) {
	query := `
		SELECT id, name, personality, knowledge, context, skills,
		       is_active, tenant_id, created_at, updated_at, metadata
		FROM agents WHERE tenant_id = $1 AND is_active = true
		ORDER BY created_at DESC
	`

	rows, err := s.db.QueryContext(ctx, query, tenantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var agents []*models.Agent

	for rows.Next() {
		var agent models.Agent
		var personalityJSON, knowledgeJSON, contextJSON, skillsJSON, metadataJSON []byte

		err := rows.Scan(
			&agent.ID,
			&agent.Name,
			&personalityJSON,
			&knowledgeJSON,
			&contextJSON,
			&skillsJSON,
			&agent.IsActive,
			&agent.TenantID,
			&agent.CreatedAt,
			&agent.UpdatedAt,
			&metadataJSON,
		)

		if err != nil {
			continue
		}

		// Deserializar datos complejos
		json.Unmarshal(personalityJSON, &agent.Personality)
		json.Unmarshal(knowledgeJSON, &agent.Knowledge)
		json.Unmarshal(contextJSON, &agent.Context)
		json.Unmarshal(skillsJSON, &agent.Skills)
		json.Unmarshal(metadataJSON, &agent.Metadata)

		agents = append(agents, &agent)
	}

	return agents, nil
}

// UpdateAgent actualiza un agente
func (s *AgentService) UpdateAgent(ctx context.Context, id string, updates map[string]interface{}) error {
	agent, err := s.GetAgent(ctx, id)
	if err != nil {
		return err
	}

	// Aplicar actualizaciones
	if name, ok := updates["name"].(string); ok {
		agent.Name = name
	}
	if isActive, ok := updates["is_active"].(bool); ok {
		agent.IsActive = isActive
	}
	if personality, ok := updates["personality"].(*models.Personality); ok {
		agent.Personality = personality
	}
	if knowledge, ok := updates["knowledge"].(*models.KnowledgeBase); ok {
		agent.Knowledge = knowledge
	}

	agent.UpdatedAt = time.Now()

	// Serializar datos complejos
	personalityJSON, _ := json.Marshal(agent.Personality)
	knowledgeJSON, _ := json.Marshal(agent.Knowledge)
	contextJSON, _ := json.Marshal(agent.Context)
	skillsJSON, _ := json.Marshal(agent.Skills)
	metadataJSON, _ := json.Marshal(agent.Metadata)

	query := `
		UPDATE agents SET 
			name = $1, personality = $2, knowledge = $3, context = $4, 
			skills = $5, is_active = $6, updated_at = $7, metadata = $8
		WHERE id = $9
	`

	_, err = s.db.ExecContext(ctx, query,
		agent.Name,
		personalityJSON,
		knowledgeJSON,
		contextJSON,
		skillsJSON,
		agent.IsActive,
		agent.UpdatedAt,
		metadataJSON,
		id,
	)

	if err != nil {
		return err
	}

	// Limpiar cache
	cacheKey := fmt.Sprintf("agent:%s", id)
	s.cache.InvalidateAnalysis(cacheKey)

	return nil
}

// DeleteAgent elimina un agente (soft delete)
func (s *AgentService) DeleteAgent(ctx context.Context, id string) error {
	query := `UPDATE agents SET is_active = false, updated_at = $1 WHERE id = $2`

	_, err := s.db.ExecContext(ctx, query, time.Now(), id)
	if err != nil {
		return err
	}

	// Limpiar cache
	cacheKey := fmt.Sprintf("agent:%s", id)
	s.cache.InvalidateAnalysis(cacheKey)

	return nil
}

// SendMessage envía un mensaje al agente y obtiene respuesta
func (s *AgentService) SendMessage(ctx context.Context, agentID, userID, sessionID, content string) (*models.Message, error) {
	log.Printf("SendMessage llamado: agentID=%s, userID=%s, sessionID=%s, content=%s", agentID, userID, sessionID, content)

	agent, err := s.GetAgent(ctx, agentID)
	if err != nil {
		log.Printf("Error obteniendo agente: %v", err)
		return nil, err
	}

	// Crear mensaje del usuario
	userMessage := &models.Message{
		ID:        uuid.New().String(),
		Role:      "user",
		Content:   content,
		Timestamp: time.Now(),
	}

	// Guardar mensaje del usuario en la base de datos
	err = s.saveMessageToHistory(ctx, agentID, userID, sessionID, userMessage)
	if err != nil {
		return nil, err
	}

	// Generar respuesta del agente
	response, err := s.generateAgentResponse(ctx, agent, content)
	if err != nil {
		return nil, err
	}

	// Guardar respuesta del agente en la base de datos
	err = s.saveMessageToHistory(ctx, agentID, userID, sessionID, response)
	if err != nil {
		return nil, err
	}

	return response, nil
}

// saveMessageToHistory guarda un mensaje en la tabla conversation_history
func (s *AgentService) saveMessageToHistory(ctx context.Context, agentID, userID, sessionID string, message *models.Message) error {
	query := `
		INSERT INTO conversation_history (
			id, agent_id, user_id, session_id, role, content, timestamp, metadata
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	metadataJSON, _ := json.Marshal(message.Metadata)

	log.Printf("Guardando mensaje: ID=%s, AgentID=%s, UserID=%s, SessionID=%s, Role=%s",
		message.ID, agentID, userID, sessionID, message.Role)

	_, err := s.db.ExecContext(ctx, query,
		message.ID,
		agentID,
		userID,
		sessionID,
		message.Role,
		message.Content,
		message.Timestamp,
		metadataJSON,
	)

	if err != nil {
		log.Printf("Error guardando mensaje: %v", err)
		return err
	}

	log.Printf("Mensaje guardado exitosamente")
	return nil
}

// generateAgentResponse genera una respuesta del agente
func (s *AgentService) generateAgentResponse(ctx context.Context, agent *models.Agent, userMessage string) (*models.Message, error) {
	// Aquí implementaremos la lógica de generación de respuestas
	// Por ahora, una respuesta simple basada en la personalidad

	response := &models.Message{
		ID:        uuid.New().String(),
		Role:      "assistant",
		Timestamp: time.Now(),
	}

	// Lógica básica de respuesta basada en la personalidad
	if agent.Personality != nil {
		switch agent.Personality.Name {
		case "ALI":
			response.Content = s.generateALIResponse(userMessage)
		default:
			response.Content = "Hola, soy tu asistente. ¿En qué puedo ayudarte?"
		}
	} else {
		response.Content = "Hola, soy tu asistente. ¿En qué puedo ayudarte?"
	}

	return response, nil
}

// generateALIResponse genera respuestas específicas para ALI
func (s *AgentService) generateALIResponse(userMessage string) string {
	// Lógica específica para ALI
	// Aquí implementaremos análisis de intención y respuestas contextuales

	if contains(userMessage, "análisis") || contains(userMessage, "empresa") {
		return "¡Perfecto! Soy ALI, tu especialista en análisis empresarial. " +
			"Tengo experiencia en evaluar la salud financiera, madurez digital y posicionamiento de mercado de PYMEs colombianas. " +
			"¿Podrías compartirme el nombre de tu empresa y su NIT para comenzar un análisis completo?"
	}

	if contains(userMessage, "digital") || contains(userMessage, "presencia") {
		return "Excelente pregunta. Basándome en mi experiencia con empresas colombianas, " +
			"la presencia digital es clave para el crecimiento. Te puedo ayudar a evaluar tu madurez digital " +
			"y crear un plan de acción específico. ¿Te gustaría que analicemos tu empresa?"
	}

	if contains(userMessage, "financiero") || contains(userMessage, "salud") {
		return "Como especialista en análisis empresarial, entiendo la importancia de la salud financiera. " +
			"Puedo evaluar aspectos como capacidad de pago, endeudamiento y oportunidades de mejora. " +
			"¿Quieres que analicemos la situación financiera de tu empresa?"
	}

	return "Hola, soy ALI. Soy especialista en análisis empresarial con enfoque en PYMEs colombianas. " +
		"Puedo ayudarte con análisis financiero, evaluación de madurez digital, posicionamiento de mercado " +
		"y mucho más. ¿En qué aspecto de tu empresa te gustaría que te ayude?"
}

// contains verifica si una cadena contiene otra
func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr ||
		(len(s) > len(substr) && (s[:len(substr)] == substr ||
			s[len(s)-len(substr):] == substr ||
			func() bool {
				for i := 0; i <= len(s)-len(substr); i++ {
					if s[i:i+len(substr)] == substr {
						return true
					}
				}
				return false
			}())))
}

// LearnFromInteraction permite al agente aprender de la interacción
func (s *AgentService) LearnFromInteraction(ctx context.Context, agentID string, learningEvent *models.LearningEvent) error {
	agent, err := s.GetAgent(ctx, agentID)
	if err != nil {
		return err
	}

	// Agregar evento de aprendizaje
	if agent.Knowledge == nil {
		agent.Knowledge = &models.KnowledgeBase{}
	}

	agent.Knowledge.LearningHistory = append(agent.Knowledge.LearningHistory, *learningEvent)

	// Actualizar agente
	return s.UpdateAgent(ctx, agentID, map[string]interface{}{
		"knowledge": agent.Knowledge,
	})
}

// GetConversationHistory obtiene el historial de conversación
func (s *AgentService) GetConversationHistory(ctx context.Context, agentID, userID, sessionID string) ([]models.Message, error) {
	query := `
		SELECT id, role, content, timestamp, metadata
		FROM conversation_history 
		WHERE agent_id = $1 AND user_id = $2 AND session_id = $3
		ORDER BY timestamp ASC
	`

	rows, err := s.db.QueryContext(ctx, query, agentID, userID, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var messages []models.Message
	for rows.Next() {
		var msg models.Message
		var metadataJSON []byte

		err := rows.Scan(&msg.ID, &msg.Role, &msg.Content, &msg.Timestamp, &metadataJSON)
		if err != nil {
			return nil, err
		}

		// Deserializar metadata si existe
		if len(metadataJSON) > 0 {
			json.Unmarshal(metadataJSON, &msg.Metadata)
		}

		messages = append(messages, msg)
	}

	return messages, nil
}

// InitializeDefaultAgents inicializa agentes por defecto
func (s *AgentService) InitializeDefaultAgents(ctx context.Context, tenantID string) error {
	// Crear agente ALI por defecto
	aliPersonality := &models.Personality{
		Name:       "ALI",
		Age:        30,
		Style:      "médico",
		Expertise:  []string{"análisis empresarial", "vida saludable", "PYMEs"},
		Tone:       "profesional y empática",
		Background: "Especialista en análisis empresarial con enfoque en bienestar organizacional",
		Language:   "es",
		Preferences: map[string]interface{}{
			"communication_style": "directo pero empático",
			"focus_areas":         []string{"financiero", "digital", "posicionamiento"},
		},
	}

	aliSkills := []models.Skill{
		{
			ID:          uuid.New().String(),
			Name:        "Análisis Financiero",
			Description: "Evaluación de salud financiera y crediticia",
			Category:    "financial",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Evaluación Digital",
			Description: "Análisis de madurez digital y presencia online",
			Category:    "digital",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Posicionamiento de Mercado",
			Description: "Análisis de diferenciación y estrategia competitiva",
			Category:    "positioning",
			Level:       5,
			IsActive:    true,
		},
	}

	aliAgent := &models.Agent{
		Name:        "ALI - Asistente de Análisis Empresarial",
		Personality: aliPersonality,
		Skills:      aliSkills,
		IsActive:    true,
		TenantID:    tenantID,
		Metadata: map[string]interface{}{
			"version": "1.0",
			"type":    "business_analyst",
		},
	}

	return s.CreateAgent(ctx, aliAgent)
}
