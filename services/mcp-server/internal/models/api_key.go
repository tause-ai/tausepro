package models

import (
	"time"
)

// APIKey representa una API key en la base de datos
type APIKey struct {
	ID        string                 `json:"id"`
	Service   string                 `json:"service"` // openai, tavily, elevenlabs, google, meta
	APIKey    string                 `json:"api_key"` // La API key encriptada
	IsActive  bool                   `json:"is_active"`
	LastUsed  time.Time              `json:"last_used"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
	Usage     UsageStats             `json:"usage"`
	Config    map[string]interface{} `json:"config"` // Configuración específica del servicio
}

// UsageStats estadísticas de uso de la API key
type UsageStats struct {
	Requests  int       `json:"requests"`
	Tokens    int       `json:"tokens"`
	Cost      float64   `json:"cost"`
	LastReset time.Time `json:"last_reset"`
}

// APIKeyRequest request para crear/actualizar API key
type APIKeyRequest struct {
	Service string                 `json:"service"`
	APIKey  string                 `json:"api_key"`
	Config  map[string]interface{} `json:"config,omitempty"`
}

// APIKeyResponse response de API key (sin la key real)
type APIKeyResponse struct {
	ID        string                 `json:"id"`
	Service   string                 `json:"service"`
	IsActive  bool                   `json:"is_active"`
	LastUsed  time.Time              `json:"last_used"`
	CreatedAt time.Time              `json:"created_at"`
	UpdatedAt time.Time              `json:"updated_at"`
	Usage     UsageStats             `json:"usage"`
	Config    map[string]interface{} `json:"config"`
	MaskedKey string                 `json:"masked_key"` // API key enmascarada
}

// TestAPIKeyRequest request para probar API key
type TestAPIKeyRequest struct {
	Service string `json:"service"`
	APIKey  string `json:"api_key"`
}

// TestAPIKeyResponse response del test de API key
type TestAPIKeyResponse struct {
	Valid   bool   `json:"valid"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
