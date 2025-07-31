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
	// Verificar si la base de datos está disponible
	if s.db == nil {
		return fmt.Errorf("database not available")
	}

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
	// Verificar si la base de datos está disponible
	if s.db == nil {
		return nil, fmt.Errorf("database not available")
	}

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
	// Verificar si la base de datos está disponible
	if s.db == nil {
		return []*models.Agent{}, nil
	}

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
	// Generar respuesta basada en el tipo de agente
	response := ""
	
	// Determinar el tipo de agente basado en el nombre y metadata
	agentType := ""
	if agent.Metadata != nil {
		if t, ok := agent.Metadata["type"].(string); ok {
			agentType = t
		}
	}
	
	// Si no hay tipo en metadata, inferir del nombre
	if agentType == "" {
		if contains(agent.Name, "ALI") {
			agentType = "business_analyst"
		} else if contains(agent.Name, "COLOMBIA") {
			agentType = "colombia_specialist"
		} else if contains(agent.Name, "DIGITAL") {
			agentType = "digital_specialist"
		} else if contains(agent.Name, "MCP") {
			agentType = "mcp_specialist"
		}
	}
	
	// Generar respuesta específica según el tipo de agente
	switch agentType {
	case "business_analyst":
		response = s.generateALIResponse(userMessage)
	case "colombia_specialist":
		response = s.generateColombiaResponse(userMessage)
	case "digital_specialist":
		response = s.generateDigitalResponse(userMessage)
	case "mcp_specialist":
		response = s.generateMCPResponse(userMessage)
	default:
		response = s.generateGenericResponse(userMessage)
	}

	return &models.Message{
		ID:        uuid.New().String(),
		Role:      "assistant",
		Content:   response,
		Timestamp: time.Now(),
		Metadata: map[string]interface{}{
			"agent_id":   agent.ID,
			"agent_name": agent.Name,
			"agent_type": agentType,
		},
	}, nil
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

// generateColombiaResponse genera respuestas específicas para COLOMBIA
func (s *AgentService) generateColombiaResponse(userMessage string) string {
	if contains(userMessage, "DIAN") || contains(userMessage, "impuestos") {
		return "¡Hola! Soy COLOMBIA, tu especialista en regulaciones colombianas. " +
			"Te puedo ayudar con temas de DIAN, facturación electrónica, retenciones y obligaciones fiscales. " +
			"¿Qué consulta específica tienes sobre impuestos?"
	}

	if contains(userMessage, "mercado libre") || contains(userMessage, "rappi") || contains(userMessage, "e-commerce") {
		return "Perfecto, soy experto en el ecosistema digital colombiano. " +
			"Te puedo asesorar sobre Mercado Libre, Rappi, Wompi, PSE, Nequi y otras plataformas locales. " +
			"¿Quieres expandir tu presencia en alguna de estas plataformas?"
	}

	if contains(userMessage, "PYME") || contains(userMessage, "colombiana") {
		return "¡Excelente! Como especialista en PYMEs colombianas, conozco los desafíos y oportunidades del mercado local. " +
			"Te puedo ayudar con estrategias específicas para el contexto colombiano, " +
			"tendencias del mercado y regulaciones aplicables. ¿En qué área necesitas asesoría?"
	}

	return "Hola, soy COLOMBIA. Soy tu especialista en el ecosistema empresarial colombiano. " +
		"Conozco las regulaciones DIAN, el mercado local, e-commerce colombiano y las tendencias PYMEs. " +
		"¿En qué puedo ayudarte específicamente?"
}

// generateDigitalResponse genera respuestas específicas para DIGITAL
func (s *AgentService) generateDigitalResponse(userMessage string) string {
	if contains(userMessage, "automatización") || contains(userMessage, "chatbot") {
		return "¡Hola! Soy DIGITAL, tu especialista en transformación digital. " +
			"Te puedo ayudar a implementar chatbots, CRM, marketing automation y otras herramientas " +
			"que optimicen tus procesos. ¿Qué proceso te gustaría automatizar?"
	}

	if contains(userMessage, "google") || contains(userMessage, "canva") || contains(userMessage, "whatsapp") {
		return "Perfecto, soy experto en herramientas digitales para PYMEs. " +
			"Te puedo asesorar sobre Google Workspace, Canva, WhatsApp Business y otras herramientas " +
			"que potencien tu presencia digital. ¿Qué herramienta te interesa implementar?"
	}

	if contains(userMessage, "analytics") || contains(userMessage, "métricas") {
		return "¡Excelente! Como especialista en analytics, te puedo ayudar a implementar " +
			"Google Analytics, Facebook Insights y otras métricas que te permitan medir el ROI " +
			"de tus estrategias digitales. ¿Qué métricas te interesan?"
	}

	return "Hola, soy DIGITAL. Soy tu especialista en transformación digital para PYMEs. " +
		"Te puedo ayudar con automatización, herramientas digitales, analytics y estrategias " +
		"que impulsen tu crecimiento digital. ¿En qué área digital necesitas asesoría?"
}

// generateMCPResponse genera respuestas específicas para MCP
func (s *AgentService) generateMCPResponse(userMessage string) string {
	if contains(userMessage, "MCP") || contains(userMessage, "integración") {
		return "¡Hola! Soy MCP, tu especialista en integraciones y automatización avanzada. " +
			"Te puedo ayudar a configurar agentes MCP, workflows complejos y conectores " +
			"con servicios externos. ¿Qué integración te interesa implementar?"
	}

	if contains(userMessage, "workflow") || contains(userMessage, "orquestación") {
		return "Perfecto, soy experto en automatización avanzada. " +
			"Te puedo ayudar a diseñar workflows complejos que orquesten múltiples agentes " +
			"y servicios para optimizar tus procesos. ¿Qué proceso quieres automatizar?"
	}

	if contains(userMessage, "API") || contains(userMessage, "conector") {
		return "¡Excelente! Como especialista en integraciones, te puedo ayudar a conectar " +
			"tu negocio con APIs externas, servicios de terceros y plataformas " +
			"que potencien tus operaciones. ¿Qué servicio quieres integrar?"
	}

	return "Hola, soy MCP. Soy tu especialista en integraciones MCP y automatización avanzada. " +
		"Te puedo ayudar con configuración de agentes, workflows complejos, " +
		"integración de APIs y escalabilidad de procesos. ¿En qué integración necesitas ayuda?"
}

// generateGenericResponse genera respuestas genéricas
func (s *AgentService) generateGenericResponse(userMessage string) string {
	return "Hola, soy tu asistente virtual. Estoy aquí para ayudarte con cualquier consulta " +
		"relacionada con tu negocio. ¿En qué puedo ayudarte hoy?"
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
	// Verificar si la base de datos está disponible
	if s.db == nil {
		return fmt.Errorf("database not available")
	}

	// 1. Agente ALI - Análisis Empresarial
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

	// 2. Agente COLOMBIA - Especialista en contexto colombiano
	colombiaPersonality := &models.Personality{
		Name:       "COLOMBIA",
		Age:        35,
		Style:      "consultor",
		Expertise:  []string{"PYMEs colombianas", "regulaciones DIAN", "e-commerce local"},
		Tone:       "experto local con conocimiento profundo",
		Background: "Consultor especializado en el ecosistema empresarial colombiano",
		Language:   "es",
		Preferences: map[string]interface{}{
			"communication_style": "experto pero accesible",
			"focus_areas":         []string{"regulaciones", "mercado local", "tendencias colombianas"},
		},
	}

	colombiaSkills := []models.Skill{
		{
			ID:          uuid.New().String(),
			Name:        "Regulaciones Colombianas",
			Description: "Conocimiento de DIAN, Cámara de Comercio, Habeas Data",
			Category:    "regulatory",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "E-commerce Local",
			Description: "Mercado Libre, Rappi, Wompi, PSE, Nequi",
			Category:    "ecommerce",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Tendencias PYMEs",
			Description: "Análisis del mercado colombiano y oportunidades",
			Category:    "market_analysis",
			Level:       5,
			IsActive:    true,
		},
	}

	colombiaAgent := &models.Agent{
		Name:        "COLOMBIA - Especialista en PYMEs Colombianas",
		Personality: colombiaPersonality,
		Skills:      colombiaSkills,
		IsActive:    true,
		TenantID:    tenantID,
		Metadata: map[string]interface{}{
			"version": "1.0",
			"type":    "colombia_specialist",
		},
	}

	// 3. Agente DIGITAL - Especialista en transformación digital
	digitalPersonality := &models.Personality{
		Name:       "DIGITAL",
		Age:        28,
		Style:      "tech evangelist",
		Expertise:  []string{"transformación digital", "automatización", "tecnologías emergentes"},
		Tone:       "innovador y práctico",
		Background: "Especialista en tecnologías digitales para PYMEs",
		Language:   "es",
		Preferences: map[string]interface{}{
			"communication_style": "innovador pero realista",
			"focus_areas":         []string{"automatización", "herramientas digitales", "ROI tecnológico"},
		},
	}

	digitalSkills := []models.Skill{
		{
			ID:          uuid.New().String(),
			Name:        "Automatización",
			Description: "Chatbots, CRM, marketing automation",
			Category:    "automation",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Herramientas Digitales",
			Description: "Google Workspace, Canva, WhatsApp Business",
			Category:    "digital_tools",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Analytics",
			Description: "Google Analytics, Facebook Insights, métricas de negocio",
			Category:    "analytics",
			Level:       5,
			IsActive:    true,
		},
	}

	digitalAgent := &models.Agent{
		Name:        "DIGITAL - Especialista en Transformación Digital",
		Personality: digitalPersonality,
		Skills:      digitalSkills,
		IsActive:    true,
		TenantID:    tenantID,
		Metadata: map[string]interface{}{
			"version": "1.0",
			"type":    "digital_specialist",
		},
	}

	// 4. Agente MCP - Especialista en integraciones MCP
	mcpPersonality := &models.Personality{
		Name:       "MCP",
		Age:        32,
		Style:      "system integrator",
		Expertise:  []string{"Model Context Protocol", "integración de APIs", "automatización avanzada"},
		Tone:       "técnico pero comprensible",
		Background: "Especialista en integraciones MCP y automatización de procesos",
		Language:   "es",
		Preferences: map[string]interface{}{
			"communication_style": "técnico pero pedagógico",
			"focus_areas":         []string{"integración", "automatización", "escalabilidad"},
		},
	}

	mcpSkills := []models.Skill{
		{
			ID:          uuid.New().String(),
			Name:        "Integración MCP",
			Description: "Configuración y uso de agentes MCP",
			Category:    "mcp_integration",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "Automatización Avanzada",
			Description: "Workflows complejos y orquestación de agentes",
			Category:    "advanced_automation",
			Level:       5,
			IsActive:    true,
		},
		{
			ID:          uuid.New().String(),
			Name:        "API Integration",
			Description: "Conectores con servicios externos y APIs",
			Category:    "api_integration",
			Level:       5,
			IsActive:    true,
		},
	}

	mcpAgent := &models.Agent{
		Name:        "MCP - Especialista en Integraciones MCP",
		Personality: mcpPersonality,
		Skills:      mcpSkills,
		IsActive:    true,
		TenantID:    tenantID,
		Metadata: map[string]interface{}{
			"version": "1.0",
			"type":    "mcp_specialist",
		},
	}

	// Crear todos los agentes
	agents := []*models.Agent{
		aliAgent,
		colombiaAgent,
		digitalAgent,
		mcpAgent,
	}

	for _, agent := range agents {
		if err := s.CreateAgent(ctx, agent); err != nil {
			log.Printf("Error creando agente %s: %v", agent.Name, err)
			return err
		}
	}

	log.Printf("✅ Agentes inicializados para tenant %s: ALI, COLOMBIA, DIGITAL, MCP", tenantID)
	return nil
}
