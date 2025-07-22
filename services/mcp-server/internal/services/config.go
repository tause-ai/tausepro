package services

import (
	"fmt"
	"strings"
	"sync"
	"time"

	"mcp-server/internal/models"
)

// ConfigService maneja las configuraciones del sistema usando PocketBase
type ConfigService struct {
	pocketbase *PocketBaseService
	mutex      sync.RWMutex
	// Almacenamiento temporal en memoria para API keys
	apiKeys map[string]string
}

// NewConfigService crea una nueva instancia del servicio de configuración
func NewConfigService(pocketbaseURL, adminEmail, adminPass string) *ConfigService {
	return &ConfigService{
		pocketbase: NewPocketBaseService(pocketbaseURL, adminEmail, adminPass),
		apiKeys:    make(map[string]string),
	}
}

// GetAPIKey obtiene una API key por servicio desde el almacenamiento en memoria
func (s *ConfigService) GetAPIKey(service string) (string, bool) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// Buscar en el almacenamiento en memoria
	if apiKey, exists := s.apiKeys[service]; exists {
		return apiKey, true
	}

	// Si no existe, retornar datos por defecto
	switch service {
	case "tavily":
		return "tvly-test-key-for-development", true
	case "openai":
		return "sk-test-key-for-development", true
	default:
		return "", false
	}
}

// UpdateAPIKey actualiza una API key
func (s *ConfigService) UpdateAPIKey(service string, apiKey string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Validar formato de la API key
	switch service {
	case "tavily":
		if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "tvly") {
			return fmt.Errorf("formato de API key de Tavily inválido")
		}
	case "openai":
		if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "sk-") {
			return fmt.Errorf("formato de API key de OpenAI inválido")
		}
	case "elevenlabs":
		if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "xi-api") {
			return fmt.Errorf("formato de API key de ElevenLabs inválido")
		}
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}

	// Guardar en memoria
	s.apiKeys[service] = apiKey
	fmt.Printf("✅ API key de %s actualizada: %s...\n", service, apiKey[:10])
	return nil
}

// UpdateUsage actualiza las estadísticas de uso
func (s *ConfigService) UpdateUsage(service string, requests int, tokens int, cost float64) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	return s.pocketbase.UpdateUsage(service, requests, tokens, cost)
}

// ResetUsage resetea las estadísticas de uso
func (s *ConfigService) ResetUsage(service string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Obtener la API key actual
	apiKey, err := s.pocketbase.GetAPIKey(service)
	if err != nil {
		return fmt.Errorf("error obteniendo API key: %w", err)
	}

	if apiKey == nil {
		return fmt.Errorf("API key no encontrada para el servicio: %s", service)
	}

	// Resetear estadísticas
	apiKey.Usage = models.UsageStats{
		LastReset: time.Now(),
	}

	// Actualizar en PocketBase
	return s.pocketbase.CreateOrUpdateAPIKey(service, apiKey.APIKey, apiKey.Config)
}

// TestAPIKey prueba una API key
func (s *ConfigService) TestAPIKey(service string, apiKey string) error {
	switch service {
	case "openai":
		return s.testOpenAIKey(apiKey)
	case "tavily":
		return s.testTavilyKey(apiKey)
	case "elevenlabs":
		return s.testElevenLabsKey(apiKey)
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}
}

// testOpenAIKey prueba la API key de OpenAI
func (s *ConfigService) testOpenAIKey(apiKey string) error {
	// TODO: Implementar test real de OpenAI
	// Por ahora, solo validar formato
	if len(apiKey) < 20 || apiKey[:3] != "sk-" {
		return fmt.Errorf("formato de API key de OpenAI inválido")
	}
	return nil
}

// testTavilyKey prueba la API key de Tavily
func (s *ConfigService) testTavilyKey(apiKey string) error {
	// TODO: Implementar test real de Tavily
	// Por ahora, solo validar formato
	if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "tvly") {
		return fmt.Errorf("formato de API key de Tavily inválido")
	}
	return nil
}

// testElevenLabsKey prueba la API key de ElevenLabs
func (s *ConfigService) testElevenLabsKey(apiKey string) error {
	// TODO: Implementar test real de ElevenLabs
	// Por ahora, solo validar formato
	if len(apiKey) < 20 || apiKey[:6] != "xi-api" {
		return fmt.Errorf("formato de API key de ElevenLabs inválido")
	}
	return nil
}

// GetAllAPIKeys obtiene todas las API keys para el Super Admin
func (s *ConfigService) GetAllAPIKeys() ([]models.APIKeyResponse, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// TODO: Implementar conexión real con PocketBase
	// Por ahora, retornar datos de prueba para que el Super Admin funcione
	apiKeys := []models.APIKeyResponse{
		{
			ID:        "1",
			Service:   "tavily",
			IsActive:  true,
			LastUsed:  time.Now(),
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Usage: models.UsageStats{
				Requests:  0,
				Tokens:    0,
				Cost:      0,
				LastReset: time.Now(),
			},
			Config: map[string]interface{}{
				"search_depth": "advanced",
			},
			MaskedKey: "tvly-...***...abc",
		},
		{
			ID:        "2",
			Service:   "openai",
			IsActive:  false,
			LastUsed:  time.Time{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Usage: models.UsageStats{
				Requests:  0,
				Tokens:    0,
				Cost:      0,
				LastReset: time.Now(),
			},
			Config: map[string]interface{}{
				"model":       "gpt-4o-mini",
				"max_tokens":  4000,
				"temperature": 0.7,
			},
			MaskedKey: "sk-...***...xyz",
		},
	}

	return apiKeys, nil
}
