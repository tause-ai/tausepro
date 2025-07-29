package services

import (
	"encoding/json"
	"fmt"
	"os"
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

// getAPIKeyInternal obtiene una API key sin locks (para uso interno)
func (s *ConfigService) getAPIKeyInternal(service string) (string, bool) {
	// Buscar en el almacenamiento en memoria
	if apiKey, exists := s.apiKeys[service]; exists {
		return apiKey, true
	}

	// Primero, intentar leer desde variables de entorno
	var envVarName string
	switch service {
	case "tavily":
		envVarName = "TAVILY_API_KEY"
	case "openai":
		envVarName = "OPENAI_API_KEY"
	case "anthropic":
		envVarName = "ANTHROPIC_API_KEY"
	case "elevenlabs":
		envVarName = "ELEVENLABS_API_KEY"
	case "serper":
		envVarName = "SERPER_API_KEY"
	case "google_analytics":
		envVarName = "GOOGLE_ANALYTICS_API_KEY"
	case "google_business":
		envVarName = "GOOGLE_BUSINESS_API_KEY"
	case "meta_whatsapp":
		envVarName = "META_WHATSAPP_TOKEN"
	case "meta_facebook":
		envVarName = "META_FACEBOOK_TOKEN"
	}

	if envVarName != "" {
		if envAPIKey := os.Getenv(envVarName); envAPIKey != "" && envAPIKey != "your_api_key_here" {
			// Guardar en memoria para futuras consultas
			s.apiKeys[service] = envAPIKey
			fmt.Printf("✅ API key de %s cargada desde variable de entorno: %s...\n", service, envAPIKey[:10])
			return envAPIKey, true
		}
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

// GetAPIKey obtiene una API key por servicio desde variables de entorno, archivo de configuración o memoria
func (s *ConfigService) GetAPIKey(service string) (string, bool) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	return s.getAPIKeyInternal(service)
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
	case "serper":
		if len(apiKey) < 10 {
			return fmt.Errorf("formato de API key de Serper inválido")
		}
	case "anthropic":
		if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "sk-ant-") {
			return fmt.Errorf("formato de API key de Anthropic inválido")
		}
	case "google_analytics", "google_business", "meta_whatsapp", "meta_facebook":
		if len(apiKey) < 10 {
			return fmt.Errorf("formato de API key inválido para %s", service)
		}
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}

	// Guardar en memoria
	s.apiKeys[service] = apiKey
	
	// Intentar persistir en PocketBase
	if err := s.pocketbase.CreateOrUpdateAPIKey(service, apiKey, nil); err != nil {
		fmt.Printf("⚠️ Error persistiendo API key en PocketBase: %v\n", err)
		// No fallar si PocketBase no está disponible, continuar con memoria
	}
	
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
	case "serper":
		return s.testSerperKey(apiKey)
	case "anthropic":
		return s.testAnthropicKey(apiKey)
	case "google_analytics", "google_business", "meta_whatsapp", "meta_facebook":
		// Para estos servicios, solo validamos formato por ahora
		return nil
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

// testSerperKey prueba la API key de Serper
func (s *ConfigService) testSerperKey(apiKey string) error {
	// TODO: Implementar test real de Serper
	// Por ahora, solo validar formato
	if len(apiKey) < 10 {
		return fmt.Errorf("formato de API key de Serper inválido")
	}
	return nil
}

// testAnthropicKey prueba la API key de Anthropic
func (s *ConfigService) testAnthropicKey(apiKey string) error {
	// TODO: Implementar test real de Anthropic
	// Por ahora, solo validar formato
	if len(apiKey) < 20 || !strings.HasPrefix(apiKey, "sk-ant-") {
		return fmt.Errorf("formato de API key de Anthropic inválido")
	}
	return nil
}

// GetAllAPIKeys obtiene todas las API keys para el Super Admin
func (s *ConfigService) GetAllAPIKeys() ([]models.APIKeyResponse, error) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// Lista de servicios soportados
	supportedServices := []string{"tavily", "openai", "serper", "anthropic", "elevenlabs", "google_analytics", "google_business", "meta_whatsapp", "meta_facebook"}
	
	apiKeys := make([]models.APIKeyResponse, 0, len(supportedServices))
	
	for i, service := range supportedServices {
		// Verificar si hay API key configurada (sin locks anidados)
		apiKey, hasKey := s.getAPIKeyInternal(service)
		isActive := hasKey && apiKey != "" && !strings.Contains(apiKey, "test-key-for-development")
		
		// Crear máscara de la API key
		maskedKey := "No configurada"
		if isActive && len(apiKey) > 10 {
			maskedKey = apiKey[:6] + "...***..." + apiKey[len(apiKey)-4:]
		}
		
		// Configuración por defecto según el servicio
		config := make(map[string]interface{})
		switch service {
		case "tavily":
			config["search_depth"] = "advanced"
		case "openai":
			config["model"] = "gpt-4o-mini"
			config["max_tokens"] = 4000
			config["temperature"] = 0.7
		case "serper":
			config["search_type"] = "search"
			config["country"] = "us"
		case "anthropic":
			config["model"] = "claude-3-sonnet-20240229"
			config["max_tokens"] = 4000
		case "elevenlabs":
			config["voice_id"] = "default"
			config["model_id"] = "eleven_monolingual_v1"
		}
		
		apiKeyResponse := models.APIKeyResponse{
			ID:        fmt.Sprintf("%d", i+1),
			Service:   service,
			IsActive:  isActive,
			LastUsed:  time.Time{},
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
			Usage: models.UsageStats{
				Requests:  0,
				Tokens:    0,
				Cost:      0,
				LastReset: time.Now(),
			},
			Config:    config,
			MaskedKey: maskedKey,
		}
		
		// Si hay API key activa, actualizar LastUsed
		if isActive {
			apiKeyResponse.LastUsed = time.Now()
		}
		
		apiKeys = append(apiKeys, apiKeyResponse)
	}

	return apiKeys, nil
}

// readAPIKeyFromFile lee la API key desde el archivo de configuración
func (s *ConfigService) readAPIKeyFromFile(service, configPath string) bool {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Leer archivo de configuración
	data, err := os.ReadFile(configPath)
	if err != nil {
		fmt.Printf("⚠️ No se pudo leer archivo de configuración: %v\n", err)
		return false
	}

	// Parsear JSON
	var config struct {
		APIKeys map[string]struct {
			APIKey   string `json:"api_key"`
			IsActive bool   `json:"is_active"`
		} `json:"api_keys"`
	}

	if err := json.Unmarshal(data, &config); err != nil {
		fmt.Printf("⚠️ Error parseando archivo de configuración: %v\n", err)
		return false
	}

	// Buscar la API key del servicio
	if serviceConfig, exists := config.APIKeys[service]; exists && serviceConfig.IsActive {
		s.apiKeys[service] = serviceConfig.APIKey
		fmt.Printf("✅ API key de %s cargada desde archivo: %s...\n", service, serviceConfig.APIKey[:10])
		return true
	}

	return false
}
