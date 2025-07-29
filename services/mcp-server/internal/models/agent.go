package models

import (
	"time"
)

// Agent representa un agente conversacional inteligente
type Agent struct {
	ID          string                 `json:"id" db:"id"`
	Name        string                 `json:"name" db:"name"`
	Personality *Personality           `json:"personality" db:"personality"`
	Knowledge   *KnowledgeBase         `json:"knowledge" db:"knowledge"`
	Skills      []Skill                `json:"skills" db:"skills"`
	Context     *ConversationContext   `json:"context" db:"context"`
	IsActive    bool                   `json:"is_active" db:"is_active"`
	TenantID    string                 `json:"tenant_id" db:"tenant_id"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time              `json:"updated_at" db:"updated_at"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// Personality define la personalidad del agente
type Personality struct {
	Name        string                 `json:"name" db:"name"`
	Age         int                    `json:"age" db:"age"`
	Style       string                 `json:"style" db:"style"`
	Expertise   []string               `json:"expertise" db:"expertise"`
	Tone        string                 `json:"tone" db:"tone"`
	Background  string                 `json:"background" db:"background"`
	Language    string                 `json:"language" db:"language"`
	Preferences map[string]interface{} `json:"preferences" db:"preferences"`
}

// KnowledgeBase contiene el conocimiento del agente
type KnowledgeBase struct {
	CompanyAnalysis []CompanyAnalysis      `json:"company_analysis" db:"company_analysis"`
	GoogleDrive     *GoogleDriveClient     `json:"google_drive" db:"google_drive"`
	SpecializedAPIs map[string]APIClient   `json:"specialized_apis" db:"specialized_apis"`
	LearningHistory []LearningEvent        `json:"learning_history" db:"learning_history"`
	Patterns        []Pattern              `json:"patterns" db:"patterns"`
	BestPractices   []BestPractice         `json:"best_practices" db:"best_practices"`
	CaseStudies     []CaseStudy            `json:"case_studies" db:"case_studies"`
	UserFeedback    []UserFeedback         `json:"user_feedback" db:"user_feedback"`
	Metadata        map[string]interface{} `json:"metadata" db:"metadata"`
}

// Skill representa una habilidad del agente
type Skill struct {
	ID          string                 `json:"id" db:"id"`
	Name        string                 `json:"name" db:"name"`
	Description string                 `json:"description" db:"description"`
	Category    string                 `json:"category" db:"category"`
	Level       int                    `json:"level" db:"level"`
	IsActive    bool                   `json:"is_active" db:"is_active"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// ConversationContext mantiene el contexto de la conversación
type ConversationContext struct {
	UserID       string                 `json:"user_id" db:"user_id"`
	SessionID    string                 `json:"session_id" db:"session_id"`
	TenantID     string                 `json:"tenant_id" db:"tenant_id"`
	CurrentTopic string                 `json:"current_topic" db:"current_topic"`
	History      []Message              `json:"history" db:"history"`
	UserProfile  *UserProfile           `json:"user_profile" db:"user_profile"`
	Intent       string                 `json:"intent" db:"intent"`
	Confidence   float64                `json:"confidence" db:"confidence"`
	Metadata     map[string]interface{} `json:"metadata" db:"metadata"`
}

// Message representa un mensaje en la conversación
type Message struct {
	ID        string                 `json:"id" db:"id"`
	Role      string                 `json:"role" db:"role"` // "user", "assistant", "system"
	Content   string                 `json:"content" db:"content"`
	Timestamp time.Time              `json:"timestamp" db:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata" db:"metadata"`
}

// UserProfile contiene información del usuario
type UserProfile struct {
	UserID      string                 `json:"user_id" db:"user_id"`
	Name        string                 `json:"name" db:"name"`
	Company     string                 `json:"company" db:"company"`
	Industry    string                 `json:"industry" db:"industry"`
	Preferences map[string]interface{} `json:"preferences" db:"preferences"`
	History     []string               `json:"history" db:"history"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// CompanyAnalysis representa un análisis de empresa
type CompanyAnalysis struct {
	CompanyID       string                 `json:"company_id" db:"company_id"`
	AnalysisDate    time.Time              `json:"analysis_date" db:"analysis_date"`
	AnalysisType    string                 `json:"analysis_type" db:"analysis_type"` // "financial", "digital", "positioning"
	Data            map[string]interface{} `json:"data" db:"data"`
	Insights        []Insight              `json:"insights" db:"insights"`
	Recommendations []Recommendation       `json:"recommendations" db:"recommendations"`
	LearningPoints  []LearningPoint        `json:"learning_points" db:"learning_points"`
	Metadata        map[string]interface{} `json:"metadata" db:"metadata"`
}

// Insight representa un insight del análisis
type Insight struct {
	Category    string                 `json:"category" db:"category"`
	Description string                 `json:"description" db:"description"`
	Confidence  float64                `json:"confidence" db:"confidence"`
	Sources     []string               `json:"sources" db:"sources"`
	Impact      string                 `json:"impact" db:"impact"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// Recommendation representa una recomendación
type Recommendation struct {
	ID          string                 `json:"id" db:"id"`
	Title       string                 `json:"title" db:"title"`
	Description string                 `json:"description" db:"description"`
	Priority    int                    `json:"priority" db:"priority"`
	Category    string                 `json:"category" db:"category"`
	ActionItems []string               `json:"action_items" db:"action_items"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// LearningPoint representa un punto de aprendizaje
type LearningPoint struct {
	Topic       string                 `json:"topic" db:"topic"`
	Description string                 `json:"description" db:"description"`
	Application string                 `json:"application" db:"application"`
	SuccessRate float64                `json:"success_rate" db:"success_rate"`
	UsageCount  int                    `json:"usage_count" db:"usage_count"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// LearningEvent representa un evento de aprendizaje
type LearningEvent struct {
	ID          string                 `json:"id" db:"id"`
	Type        string                 `json:"type" db:"type"`
	Description string                 `json:"description" db:"description"`
	Data        map[string]interface{} `json:"data" db:"data"`
	Timestamp   time.Time              `json:"timestamp" db:"timestamp"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// Pattern representa un patrón identificado
type Pattern struct {
	ID          string                 `json:"id" db:"id"`
	Industry    string                 `json:"industry" db:"industry"`
	CompanySize string                 `json:"company_size" db:"company_size"`
	Problem     string                 `json:"problem" db:"problem"`
	Solution    string                 `json:"solution" db:"solution"`
	SuccessRate float64                `json:"success_rate" db:"success_rate"`
	UsageCount  int                    `json:"usage_count" db:"usage_count"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// BestPractice representa una mejor práctica
type BestPractice struct {
	ID          string                 `json:"id" db:"id"`
	Title       string                 `json:"title" db:"title"`
	Description string                 `json:"description" db:"description"`
	Category    string                 `json:"category" db:"category"`
	Industry    string                 `json:"industry" db:"industry"`
	SuccessRate float64                `json:"success_rate" db:"success_rate"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// CaseStudy representa un caso de estudio
type CaseStudy struct {
	ID          string                 `json:"id" db:"id"`
	Title       string                 `json:"title" db:"title"`
	Description string                 `json:"description" db:"description"`
	Company     string                 `json:"company" db:"company"`
	Industry    string                 `json:"industry" db:"industry"`
	Challenge   string                 `json:"challenge" db:"challenge"`
	Solution    string                 `json:"solution" db:"solution"`
	Results     string                 `json:"results" db:"results"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
}

// UserFeedback representa feedback del usuario
type UserFeedback struct {
	ID        string                 `json:"id" db:"id"`
	UserID    string                 `json:"user_id" db:"user_id"`
	Rating    int                    `json:"rating" db:"rating"`
	Comment   string                 `json:"comment" db:"comment"`
	Category  string                 `json:"category" db:"category"`
	Timestamp time.Time              `json:"timestamp" db:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata" db:"metadata"`
}

// GoogleDriveClient representa el cliente de Google Drive
type GoogleDriveClient struct {
	Client   interface{}            `json:"client" db:"client"`
	FolderID string                 `json:"folder_id" db:"folder_id"`
	Cache    interface{}            `json:"cache" db:"cache"`
	Metadata map[string]interface{} `json:"metadata" db:"metadata"`
}

// APIClient representa un cliente de API especializada
type APIClient struct {
	Name     string                 `json:"name" db:"name"`
	Endpoint string                 `json:"endpoint" db:"endpoint"`
	APIKey   string                 `json:"api_key" db:"api_key"`
	IsActive bool                   `json:"is_active" db:"is_active"`
	Metadata map[string]interface{} `json:"metadata" db:"metadata"`
}

// Document representa un documento de Google Drive
type Document struct {
	ID          string                 `json:"id" db:"id"`
	Name        string                 `json:"name" db:"name"`
	Type        string                 `json:"type" db:"type"` // "manual", "template", "case_study"
	Content     string                 `json:"content" db:"content"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
	Tags        []string               `json:"tags" db:"tags"`
	LastUpdated time.Time              `json:"last_updated" db:"last_updated"`
}

// ConversationFlow representa un flujo de conversación
type ConversationFlow struct {
	ID        string                 `json:"id" db:"id"`
	Name      string                 `json:"name" db:"name"`
	Triggers  []string               `json:"triggers" db:"triggers"`
	Steps     []ConversationStep     `json:"steps" db:"steps"`
	Fallbacks []FallbackResponse     `json:"fallbacks" db:"fallbacks"`
	Metadata  map[string]interface{} `json:"metadata" db:"metadata"`
}

// ConversationStep representa un paso en el flujo
type ConversationStep struct {
	ID         string                 `json:"id" db:"id"`
	Type       string                 `json:"type" db:"type"` // "question", "information", "action"
	Content    string                 `json:"content" db:"content"`
	Conditions []Condition            `json:"conditions" db:"conditions"`
	NextSteps  []string               `json:"next_steps" db:"next_steps"`
	Metadata   map[string]interface{} `json:"metadata" db:"metadata"`
}

// Condition representa una condición para un paso
type Condition struct {
	Field    string `json:"field" db:"field"`
	Operator string `json:"operator" db:"operator"`
	Value    string `json:"value" db:"value"`
}

// FallbackResponse representa una respuesta de fallback
type FallbackResponse struct {
	ID         string                 `json:"id" db:"id"`
	Trigger    string                 `json:"trigger" db:"trigger"`
	Response   string                 `json:"response" db:"response"`
	Confidence float64                `json:"confidence" db:"confidence"`
	Metadata   map[string]interface{} `json:"metadata" db:"metadata"`
}
