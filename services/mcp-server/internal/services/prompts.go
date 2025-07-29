// services/mcp-server/internal/services/prompts.go
package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"mcp-server/internal/cache"
	"strings"
	"time"

	"github.com/google/uuid"
)

// PromptsService gestiona los prompts del sistema
type PromptsService struct {
	db    *sql.DB
	cache *cache.RedisCache
}

// AnalysisPrompt representa un prompt configurable
type AnalysisPrompt struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Description string            `json:"description"`
	Category    string            `json:"category"`
	Prompt      string            `json:"prompt"`
	Variables   map[string]string `json:"variables"`
	IsActive    bool              `json:"is_active"`
	Version     int               `json:"version"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

// PromptExecution registro de ejecución de prompts
type PromptExecution struct {
	ID         string                 `json:"id"`
	PromptID   string                 `json:"prompt_id"`
	Input      map[string]interface{} `json:"input"`
	Output     interface{}            `json:"output"`
	Duration   time.Duration          `json:"duration"`
	Success    bool                   `json:"success"`
	Error      string                 `json:"error,omitempty"`
	ExecutedAt time.Time              `json:"executed_at"`
}

// NewPromptsService crea una nueva instancia del servicio
func NewPromptsService(db *sql.DB, cache *cache.RedisCache) *PromptsService {
	if db == nil {
		fmt.Printf("⚠️ PromptsService: DB es nil\n")
	} else {
		fmt.Printf("✅ PromptsService: DB conectada\n")
	}

	return &PromptsService{
		db:    db,
		cache: cache,
	}
}

// GetDefaultPrompts retorna los prompts predefinidos del sistema
func (s *PromptsService) GetDefaultPrompts() []AnalysisPrompt {
	return []AnalysisPrompt{
		{
			ID:          "company_identification",
			Name:        "Identificación de Empresa",
			Description: "Extrae información precisa de la empresa",
			Category:    "company",
			Prompt: `Analiza la URL {url} y extrae ÚNICAMENTE información de esta empresa específica:

IMPORTANTE: NO confundas con empresas similares. Verifica:
- Dominio exacto del sitio web
- Razón social en el footer o términos legales
- NIT/RUT en documentos legales
- Dirección específica

Información a extraer:
1. Razón social (nombre legal exacto)
2. Marca comercial (si es diferente)
3. NIT/RUT
4. Industria/sector específico
5. Ubicación exacta (dirección, ciudad, departamento)
6. Año de fundación
7. Tamaño de empresa (empleados)
8. Descripción del negocio
9. Productos/servicios principales
10. Información de contacto

Si encuentras múltiples empresas con nombres similares, identifica cuál corresponde al dominio {url}.

Busca en:
- Footer del sitio web
- Página "Quiénes somos" o "Nosotros"
- Términos y condiciones
- Política de privacidad
- LinkedIn de la empresa
- Registro mercantil Colombia

Responde SOLO en formato JSON con la estructura exacta.`,
			Variables: map[string]string{
				"url": "URL del sitio web",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "social_media_analysis",
			Name:        "Análisis de Redes Sociales",
			Description: "Encuentra todas las redes sociales de la empresa",
			Category:    "company",
			Prompt: `Busca TODAS las redes sociales de la empresa '{company_name}' con dominio {url}:

IMPORTANTE: Verifica que los perfiles correspondan a la misma empresa:
- Mismo logo/branding
- Misma ubicación (ciudad)
- Enlaces al sitio web oficial
- Información consistente

Redes a buscar:
- Facebook (página de empresa, no perfil personal)
- Instagram (@usuario)
- LinkedIn (página de empresa)
- Twitter/X (@usuario)
- TikTok (@usuario)
- YouTube (canal)
- WhatsApp Business (número)

Para cada red social encontrada:
{
  "platform": "nombre",
  "url": "URL completa del perfil",
  "username": "@usuario o nombre",
  "followers": "número o 'No disponible'",
  "verified": true/false,
  "last_post": "fecha aproximada",
  "activity_level": "Alta/Media/Baja/Inactiva",
  "content_type": "tipo de contenido que publican"
}

Si no tiene presencia en alguna red, NO la incluyas.
Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"url":          "URL del sitio web",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "industry_analysis",
			Name:        "Análisis de Industria",
			Description: "Analiza el sector específico en Colombia",
			Category:    "industry",
			Prompt: `Analiza la industria '{industry}' en Colombia con datos actualizados:

Contexto: Análisis para PYME ubicada en {city}, Colombia.

Información requerida:
1. Tamaño del mercado en Colombia (COP)
2. Crecimiento anual (últimos 3 años)
3. Tendencias actuales (2024-2025)
4. Principales desafíos del sector
5. Oportunidades emergentes
6. Regulaciones colombianas específicas
7. Tecnologías adoptadas en el sector
8. Estacionalidad del negocio

Fuentes confiables:
- DANE
- Cámaras de Comercio
- Asociaciones del sector
- Portafolio, La República
- Informes sectoriales recientes

Responde con datos ESPECÍFICOS de Colombia, no genéricos.
Incluye cifras y porcentajes cuando sea posible.
Formato: JSON estructurado.`,
			Variables: map[string]string{
				"industry": "Sector o industria",
				"city":     "Ciudad de operación",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "competitor_analysis",
			Name:        "Análisis de Competidores",
			Description: "Identifica competidores directos e indirectos",
			Category:    "competitors",
			Prompt: `Identifica competidores de '{company_name}' en {city}, Colombia:

Criterios de búsqueda:
1. Mismo sector: {industry}
2. Misma ciudad o cercanía
3. Público objetivo similar
4. Rango de precios similar

Tipos de competidores:
- DIRECTOS: Mismo producto/servicio
- INDIRECTOS: Satisfacen misma necesidad
- SUSTITUTOS: Alternativas diferentes

Para CADA competidor (mínimo 5):
{
  "name": "Razón social",
  "brand": "Marca comercial",
  "type": "Directo/Indirecto/Sustituto",
  "website": "URL",
  "location": "Ciudad, Departamento",
  "strengths": ["Lista de fortalezas"],
  "weaknesses": ["Lista de debilidades"],
  "unique_value": "Propuesta de valor",
  "price_range": "Rango de precios",
  "market_share": "% si está disponible",
  "years_in_market": "Antigüedad",
  "social_presence": {
    "facebook": "URL o null",
    "instagram": "URL o null"
  }
}

Ordena por relevancia/amenaza.
NO incluyas la empresa analizada.
Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"city":         "Ciudad",
				"industry":     "Industria",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "opportunities_analysis",
			Name:        "Análisis de Oportunidades",
			Description: "Identifica oportunidades específicas de mejora",
			Category:    "opportunities",
			Prompt: `Genera oportunidades ESPECÍFICAS para '{company_name}' en {industry}:

Contexto actual:
- Digitalización: {digitalization_score}/100
- Ubicación: {city}, Colombia
- Tamaño: {company_size}
- Presencia digital: {digital_presence}

Categorías de oportunidades:
1. DIGITALIZACIÓN
   - E-commerce
   - Marketing digital
   - Automatización
   - IA y chatbots

2. MARKETING
   - Redes sociales
   - SEO local
   - Email marketing
   - WhatsApp Business

3. OPERACIONES
   - Procesos
   - Inventarios
   - Logística
   - Atención al cliente

4. FINANCIERO
   - Facturación electrónica
   - Pagos digitales
   - Financiamiento
   - Reducción costos

Para CADA oportunidad:
{
  "id": "opp_001",
  "category": "categoría",
  "title": "Título accionable",
  "description": "Descripción detallada",
  "impact": "Alto/Medio/Bajo",
  "effort": "Alto/Medio/Bajo",
  "roi_months": "Retorno en meses",
  "investment": "Rango en COP",
  "implementation_time": "Semanas",
  "priority": 1-10,
  "requirements": ["Lista de requisitos"],
  "success_metrics": ["KPIs medibles"],
  "local_providers": ["Proveedores en Colombia"]
}

Prioriza por impacto/esfuerzo.
Máximo 10 oportunidades más relevantes.
Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name":         "Nombre",
				"industry":             "Industria",
				"city":                 "Ciudad",
				"company_size":         "Tamaño",
				"digitalization_score": "Score",
				"digital_presence":     "Presencia digital",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "financial_health_analysis",
			Name:        "Análisis de Salud Financiera",
			Description: "Evalúa la salud financiera y crediticia de la empresa",
			Category:    "financial",
			Prompt: `Analiza la salud financiera de '{company_name}' en Colombia:

Información a buscar:
1. DATOS LEGALES
   - NIT activo/inactivo
   - Responsabilidades tributarias
   - Sanciones o multas recientes
   - Certificados de cumplimiento

2. CREDITICIA
   - Historial en centrales de riesgo
   - Capacidad de pago
   - Endeudamiento
   - Garantías disponibles

3. OPERACIONAL
   - Antigüedad en el mercado
   - Crecimiento de ventas
   - Estabilidad del negocio
   - Diversificación de ingresos

4. RIESGOS
   - Dependencia de clientes
   - Concentración sectorial
   - Vulnerabilidades operativas
   - Riesgos regulatorios

Para cada aspecto:
{
  "category": "Legal/Crediticia/Operacional/Riesgos",
  "score": 1-10,
  "status": "Excelente/Bueno/Regular/Crítico",
  "details": "Análisis detallado",
  "recommendations": ["Acciones recomendadas"],
  "red_flags": ["Señales de alerta si las hay"]
}

Usa fuentes oficiales colombianas:
- DIAN
- Cámara de Comercio
- Centrales de riesgo
- Supersociedades

Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"nit":          "NIT de la empresa",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "digital_maturity_assessment",
			Name:        "Evaluación de Madurez Digital",
			Description: "Evalúa el nivel de digitalización de la empresa",
			Category:    "digital",
			Prompt: `Evalúa la madurez digital de '{company_name}' en Colombia:

Dimensiones a evaluar (1-10 cada una):

1. PRESENCIA DIGITAL
   - Sitio web profesional
   - Redes sociales activas
   - SEO local implementado
   - Google My Business optimizado

2. E-COMMERCE
   - Plataforma de ventas online
   - Pagos digitales
   - Logística integrada
   - Experiencia de usuario

3. AUTOMATIZACIÓN
   - Procesos digitalizados
   - CRM implementado
   - Facturación electrónica
   - Gestión de inventarios

4. MARKETING DIGITAL
   - Estrategia multicanal
   - Email marketing
   - Publicidad digital
   - Analytics implementado

5. TECNOLOGÍA
   - Software empresarial
   - Cloud computing
   - Seguridad digital
   - Backup y recuperación

Para cada dimensión:
{
  "dimension": "nombre",
  "score": 1-10,
  "current_state": "Descripción actual",
  "gaps": ["Oportunidades de mejora"],
  "priority_actions": ["Acciones prioritarias"],
  "estimated_investment": "Rango en COP",
  "timeline": "Meses para implementar"
}

Calcula score promedio y categoriza:
- 8-10: Líder digital
- 6-7: En desarrollo
- 4-5: Básico
- 1-3: Inicial

Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"url":          "URL del sitio web",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "market_positioning_analysis",
			Name:        "Análisis de Posicionamiento de Mercado",
			Description: "Analiza el posicionamiento y diferenciación de la empresa",
			Category:    "positioning",
			Prompt: `Analiza el posicionamiento de mercado de '{company_name}' en {industry}:

Elementos a evaluar:

1. PROPUESTA DE VALOR
   - Diferenciadores únicos
   - Beneficios principales
   - Solución a problemas específicos
   - Experiencia del cliente

2. SEGMENTACIÓN
   - Público objetivo definido
   - Nichos de mercado
   - Perfil del cliente ideal
   - Comportamiento de compra

3. POSICIONAMIENTO
   - Posición vs competidores
   - Percepción de marca
   - Reputación en el mercado
   - Fortalezas competitivas

4. COMUNICACIÓN
   - Mensaje de marca
   - Canales de comunicación
   - Consistencia de mensaje
   - Engagement con audiencia

Para cada elemento:
{
  "element": "Propuesta de valor/Segmentación/Posicionamiento/Comunicación",
  "current_state": "Estado actual",
  "strengths": ["Fortalezas identificadas"],
  "weaknesses": ["Áreas de mejora"],
  "opportunities": ["Oportunidades"],
  "threats": ["Amenazas"],
  "recommendations": ["Acciones recomendadas"],
  "priority": 1-5
}

Incluye análisis de:
- Diferenciación vs competidores
- Oportunidades de nicho
- Estrategias de posicionamiento
- Plan de comunicación

Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"industry":     "Industria",
				"city":         "Ciudad",
			},
			IsActive: true,
			Version:  1,
		},
		{
			ID:          "regulatory_compliance_check",
			Name:        "Verificación de Cumplimiento Normativo",
			Description: "Verifica el cumplimiento de regulaciones colombianas",
			Category:    "compliance",
			Prompt: `Verifica el cumplimiento normativo de '{company_name}' en Colombia:

Regulaciones a verificar:

1. TRIBUTARIA
   - Inscripción en RUT
   - Declaración de renta
   - IVA y retenciones
   - Facturación electrónica

2. LABORAL
   - Afiliación a seguridad social
   - Pago de prestaciones
   - Contratos de trabajo
   - Seguridad industrial

3. COMERCIAL
   - Registro mercantil
   - Licencias de funcionamiento
   - Permisos sectoriales
   - Renovaciones vigentes

4. SECTORIAL
   - Regulaciones específicas del sector
   - Certificaciones requeridas
   - Inspecciones vigentes
   - Sanciones o multas

Para cada categoría:
{
  "category": "Tributaria/Laboral/Comercial/Sectorial",
  "compliance_status": "Cumple/Parcial/No cumple",
  "requirements": ["Requisitos aplicables"],
  "current_status": ["Estado actual"],
  "missing_documents": ["Documentos faltantes"],
  "deadlines": ["Fechas límite"],
  "penalties": ["Sanciones si aplican"],
  "recommendations": ["Acciones recomendadas"]
}

Usa fuentes oficiales:
- DIAN
- Ministerio de Trabajo
- Cámaras de Comercio
- Entidades sectoriales

Responde SOLO en formato JSON.`,
			Variables: map[string]string{
				"company_name": "Nombre de la empresa",
				"nit":          "NIT de la empresa",
				"industry":     "Sector de actividad",
			},
			IsActive: true,
			Version:  1,
		},
	}
}

// CreatePrompt crea un nuevo prompt
func (s *PromptsService) CreatePrompt(ctx context.Context, prompt *AnalysisPrompt) error {
	prompt.ID = uuid.New().String()
	prompt.CreatedAt = time.Now()
	prompt.UpdatedAt = time.Now()
	prompt.Version = 1

	query := `
        INSERT INTO analysis_prompts 
        (id, name, description, category, prompt, variables, is_active, version, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `

	variablesJSON, _ := json.Marshal(prompt.Variables)

	_, err := s.db.ExecContext(ctx, query,
		prompt.ID,
		prompt.Name,
		prompt.Description,
		prompt.Category,
		prompt.Prompt,
		variablesJSON,
		prompt.IsActive,
		prompt.Version,
		prompt.CreatedAt,
		prompt.UpdatedAt,
	)

	if err != nil {
		return fmt.Errorf("failed to create prompt: %w", err)
	}

	// Invalidar cache - por ahora no invalidamos, se actualizará en la próxima consulta

	return nil
}

// GetPrompt obtiene un prompt por ID
func (s *PromptsService) GetPrompt(ctx context.Context, id string) (*AnalysisPrompt, error) {
	// Si no hay DB disponible, retornar error
	if s.db == nil {
		return nil, fmt.Errorf("base de datos no disponible")
	}

	// Check cache
	if s.cache != nil {
		cacheKey := fmt.Sprintf("prompts:%s", id)
		var prompt AnalysisPrompt

		found, err := s.cache.GetCachedResult(cacheKey, &prompt)
		if err == nil && found {
			return &prompt, nil
		}
	}

	// Query DB
	query := `
        SELECT id, name, description, category, prompt, variables, is_active, version, created_at, updated_at
        FROM analysis_prompts
        WHERE id = $1 AND is_active = true
    `

	var prompt AnalysisPrompt
	var variablesJSON []byte
	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&prompt.ID,
		&prompt.Name,
		&prompt.Description,
		&prompt.Category,
		&prompt.Prompt,
		&variablesJSON,
		&prompt.IsActive,
		&prompt.Version,
		&prompt.CreatedAt,
		&prompt.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	json.Unmarshal(variablesJSON, &prompt.Variables)

	// Cache result
	if s.cache != nil {
		cacheKey := fmt.Sprintf("prompts:%s", id)
		s.cache.CacheResult(cacheKey, prompt, 1*time.Hour)
	}

	return &prompt, nil
}

// GetPromptByCategory obtiene prompts por categoría
func (s *PromptsService) GetPromptByCategory(ctx context.Context, category string) ([]*AnalysisPrompt, error) {
	// Si no hay DB disponible, retornar error
	if s.db == nil {
		return nil, fmt.Errorf("base de datos no disponible")
	}

	query := `
        SELECT id, name, description, category, prompt, variables, is_active, version, created_at, updated_at
        FROM analysis_prompts
        WHERE category = $1 AND is_active = true
        ORDER BY name
    `

	rows, err := s.db.QueryContext(ctx, query, category)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prompts []*AnalysisPrompt

	for rows.Next() {
		var prompt AnalysisPrompt
		var variablesJSON []byte

		err := rows.Scan(
			&prompt.ID,
			&prompt.Name,
			&prompt.Description,
			&prompt.Category,
			&prompt.Prompt,
			&variablesJSON,
			&prompt.IsActive,
			&prompt.Version,
			&prompt.CreatedAt,
			&prompt.UpdatedAt,
		)

		if err != nil {
			continue
		}

		json.Unmarshal(variablesJSON, &prompt.Variables)
		prompts = append(prompts, &prompt)
	}

	return prompts, nil
}

// ExecutePrompt ejecuta un prompt con variables
func (s *PromptsService) ExecutePrompt(ctx context.Context, promptID string, variables map[string]string) (string, error) {
	prompt, err := s.GetPrompt(ctx, promptID)
	if err != nil {
		return "", fmt.Errorf("prompt not found: %w", err)
	}

	// Reemplazar variables en el prompt
	finalPrompt := prompt.Prompt
	for key, value := range variables {
		placeholder := fmt.Sprintf("{%s}", key)
		finalPrompt = strings.ReplaceAll(finalPrompt, placeholder, value)
	}

	// Validar que no queden variables sin reemplazar
	if strings.Contains(finalPrompt, "{") && strings.Contains(finalPrompt, "}") {
		return "", fmt.Errorf("missing required variables in prompt")
	}

	// Log execution
	execution := &PromptExecution{
		ID:         uuid.New().String(),
		PromptID:   promptID,
		Input:      make(map[string]interface{}),
		ExecutedAt: time.Now(),
	}

	for k, v := range variables {
		execution.Input[k] = v
	}

	// Guardar ejecución (async)
	go s.logExecution(execution)

	return finalPrompt, nil
}

// TestPrompt prueba un prompt con datos de ejemplo
func (s *PromptsService) TestPrompt(ctx context.Context, promptID string) (interface{}, error) {
	prompt, err := s.GetPrompt(ctx, promptID)
	if err != nil {
		return nil, err
	}

	// Datos de prueba según categoría
	testData := s.getTestDataForCategory(prompt.Category)

	// Ejecutar prompt con datos de prueba
	finalPrompt, err := s.ExecutePrompt(ctx, promptID, testData)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"prompt":       prompt,
		"test_data":    testData,
		"final_prompt": finalPrompt,
	}, nil
}

// UpdatePrompt actualiza un prompt existente
func (s *PromptsService) UpdatePrompt(ctx context.Context, id string, updates map[string]interface{}) error {
	// Obtener prompt actual
	current, err := s.GetPrompt(ctx, id)
	if err != nil {
		return err
	}

	// Incrementar versión
	current.Version++
	current.UpdatedAt = time.Now()

	// Aplicar actualizaciones
	if name, ok := updates["name"].(string); ok {
		current.Name = name
	}
	if desc, ok := updates["description"].(string); ok {
		current.Description = desc
	}
	if prompt, ok := updates["prompt"].(string); ok {
		current.Prompt = prompt
	}
	if vars, ok := updates["variables"].(map[string]string); ok {
		current.Variables = vars
	}

	// Actualizar en DB
	query := `
        UPDATE analysis_prompts
        SET name = $2, description = $3, prompt = $4, variables = $5, 
            version = $6, updated_at = $7
        WHERE id = $1
    `

	variablesJSON, _ := json.Marshal(current.Variables)

	_, err = s.db.ExecContext(ctx, query,
		id,
		current.Name,
		current.Description,
		current.Prompt,
		variablesJSON,
		current.Version,
		current.UpdatedAt,
	)

	if err != nil {
		return err
	}

	// Invalidar cache - por ahora no invalidamos, se actualizará en la próxima consulta

	return nil
}

// Funciones auxiliares

func (s *PromptsService) logExecution(execution *PromptExecution) {
	query := `
        INSERT INTO prompt_executions 
        (id, prompt_id, input, output, duration_ms, success, error, executed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

	inputJSON, _ := json.Marshal(execution.Input)
	outputJSON, _ := json.Marshal(execution.Output)

	s.db.Exec(query,
		execution.ID,
		execution.PromptID,
		inputJSON,
		outputJSON,
		execution.Duration.Milliseconds(),
		execution.Success,
		execution.Error,
		execution.ExecutedAt,
	)
}

func (s *PromptsService) getTestDataForCategory(category string) map[string]string {
	switch category {
	case "company":
		return map[string]string{
			"url":          "https://example.com",
			"company_name": "Empresa Ejemplo S.A.S",
		}
	case "industry":
		return map[string]string{
			"industry": "Tecnología",
			"city":     "Bogotá",
		}
	case "competitors":
		return map[string]string{
			"company_name": "Empresa Ejemplo S.A.S",
			"city":         "Bogotá",
			"industry":     "Tecnología",
		}
	case "opportunities":
		return map[string]string{
			"company_name":         "Empresa Ejemplo S.A.S",
			"industry":             "Tecnología",
			"city":                 "Bogotá",
			"company_size":         "50-100 empleados",
			"digitalization_score": "45",
			"digital_presence":     "Básica",
		}
	case "financial":
		return map[string]string{
			"company_name": "Empresa Ejemplo S.A.S",
			"nit":          "900123456-7",
		}
	case "digital":
		return map[string]string{
			"company_name": "Empresa Ejemplo S.A.S",
			"url":          "https://example.com",
		}
	case "positioning":
		return map[string]string{
			"company_name": "Empresa Ejemplo S.A.S",
			"industry":     "Tecnología",
			"city":         "Bogotá",
		}
	case "compliance":
		return map[string]string{
			"company_name": "Empresa Ejemplo S.A.S",
			"nit":          "900123456-7",
			"industry":     "Tecnología",
		}
	default:
		return map[string]string{}
	}
}

// InitializeDefaultPrompts inicializa los prompts por defecto
func (s *PromptsService) InitializeDefaultPrompts(ctx context.Context) error {
	prompts := s.GetDefaultPrompts()

	for _, prompt := range prompts {
		// Verificar si ya existe
		existing, _ := s.GetPrompt(ctx, prompt.ID)
		if existing == nil {
			if err := s.CreatePrompt(ctx, &prompt); err != nil {
				return err
			}
		}
	}

	return nil
}
