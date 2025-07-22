package services

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

// ConfigService maneja las configuraciones del sistema
type ConfigService struct {
	configPath string
	config     *SystemConfig
	mutex      sync.RWMutex
}

// SystemConfig configuración del sistema
type SystemConfig struct {
	APIKeys     APIKeysConfig  `json:"api_keys"`
	Analysis    AnalysisConfig `json:"analysis"`
	LastUpdated time.Time      `json:"last_updated"`
}

// APIKeysConfig configuración de API keys
type APIKeysConfig struct {
	OpenAI     OpenAIConfig     `json:"openai"`
	Tavily     TavilyConfig     `json:"tavily"`
	ElevenLabs ElevenLabsConfig `json:"elevenlabs"`
	Google     GoogleConfig     `json:"google"`
	Meta       MetaConfig       `json:"meta"`
}

// OpenAIConfig configuración de OpenAI
type OpenAIConfig struct {
	APIKey      string     `json:"api_key"`
	Model       string     `json:"model"`
	MaxTokens   int        `json:"max_tokens"`
	Temperature float64    `json:"temperature"`
	IsActive    bool       `json:"is_active"`
	LastUsed    time.Time  `json:"last_used"`
	Usage       UsageStats `json:"usage"`
}

// TavilyConfig configuración de Tavily
type TavilyConfig struct {
	APIKey      string     `json:"api_key"`
	SearchDepth string     `json:"search_depth"`
	IsActive    bool       `json:"is_active"`
	LastUsed    time.Time  `json:"last_used"`
	Usage       UsageStats `json:"usage"`
}

// ElevenLabsConfig configuración de ElevenLabs
type ElevenLabsConfig struct {
	APIKey   string     `json:"api_key"`
	VoiceID  string     `json:"voice_id"`
	IsActive bool       `json:"is_active"`
	LastUsed time.Time  `json:"last_used"`
	Usage    UsageStats `json:"usage"`
}

// GoogleConfig configuración de Google APIs
type GoogleConfig struct {
	AnalyticsAPIKey string     `json:"analytics_api_key"`
	BusinessAPIKey  string     `json:"business_api_key"`
	IsActive        bool       `json:"is_active"`
	LastUsed        time.Time  `json:"last_used"`
	Usage           UsageStats `json:"usage"`
}

// MetaConfig configuración de Meta APIs
type MetaConfig struct {
	WhatsAppToken string     `json:"whatsapp_token"`
	FacebookToken string     `json:"facebook_token"`
	IsActive      bool       `json:"is_active"`
	LastUsed      time.Time  `json:"last_used"`
	Usage         UsageStats `json:"usage"`
}

// UsageStats estadísticas de uso
type UsageStats struct {
	Requests  int       `json:"requests"`
	Tokens    int       `json:"tokens"`
	Cost      float64   `json:"cost"`
	LastReset time.Time `json:"last_reset"`
}

// AnalysisConfig configuración del análisis
type AnalysisConfig struct {
	MaxAnalysisPerDay   int `json:"max_analysis_per_day"`
	MaxAnalysisPerMonth int `json:"max_analysis_per_month"`
	AnalysisTimeout     int `json:"analysis_timeout"` // en segundos
}

// NewConfigService crea una nueva instancia del servicio de configuración
func NewConfigService(configPath string) *ConfigService {
	service := &ConfigService{
		configPath: configPath,
		config:     &SystemConfig{},
	}

	// Cargar configuración existente o crear nueva
	service.loadConfig()

	return service
}

// loadConfig carga la configuración desde el archivo
func (s *ConfigService) loadConfig() error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Verificar si el archivo existe
	if _, err := os.Stat(s.configPath); os.IsNotExist(err) {
		// Crear configuración por defecto
		s.config = &SystemConfig{
			APIKeys: APIKeysConfig{
				OpenAI: OpenAIConfig{
					Model:       "gpt-4o-mini",
					MaxTokens:   4000,
					Temperature: 0.7,
					IsActive:    false,
					Usage:       UsageStats{LastReset: time.Now()},
				},
				Tavily: TavilyConfig{
					SearchDepth: "advanced",
					IsActive:    false,
					Usage:       UsageStats{LastReset: time.Now()},
				},
				ElevenLabs: ElevenLabsConfig{
					VoiceID:  "21m00Tcm4TlvDq8ikWAM", // Rachel voice
					IsActive: false,
					Usage:    UsageStats{LastReset: time.Now()},
				},
				Google: GoogleConfig{
					IsActive: false,
					Usage:    UsageStats{LastReset: time.Now()},
				},
				Meta: MetaConfig{
					IsActive: false,
					Usage:    UsageStats{LastReset: time.Now()},
				},
			},
			Analysis: AnalysisConfig{
				MaxAnalysisPerDay:   100,
				MaxAnalysisPerMonth: 3000,
				AnalysisTimeout:     300, // 5 minutos
			},
			LastUpdated: time.Now(),
		}

		// Guardar configuración por defecto
		return s.saveConfig()
	}

	// Leer archivo existente
	data, err := os.ReadFile(s.configPath)
	if err != nil {
		return fmt.Errorf("error leyendo archivo de configuración: %w", err)
	}

	if err := json.Unmarshal(data, s.config); err != nil {
		return fmt.Errorf("error parseando configuración: %w", err)
	}

	return nil
}

// saveConfig guarda la configuración en el archivo
func (s *ConfigService) saveConfig() error {
	// Usar zona horaria de Colombia
	loc, _ := time.LoadLocation("America/Bogota")
	s.config.LastUpdated = time.Now().In(loc)

	data, err := json.MarshalIndent(s.config, "", "  ")
	if err != nil {
		return fmt.Errorf("error serializando configuración: %w", err)
	}

	if err := os.WriteFile(s.configPath, data, 0644); err != nil {
		return fmt.Errorf("error guardando configuración: %w", err)
	}

	return nil
}

// GetConfig obtiene la configuración completa
func (s *ConfigService) GetConfig() *SystemConfig {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	// Retornar una copia para evitar modificaciones directas
	configCopy := *s.config
	return &configCopy
}

// UpdateAPIKey actualiza una API key específica
func (s *ConfigService) UpdateAPIKey(service string, apiKey string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	// Usar zona horaria de Colombia
	loc, _ := time.LoadLocation("America/Bogota")
	now := time.Now().In(loc)

	switch service {
	case "openai":
		s.config.APIKeys.OpenAI.APIKey = apiKey
		s.config.APIKeys.OpenAI.IsActive = apiKey != ""
		s.config.APIKeys.OpenAI.LastUsed = now
	case "tavily":
		s.config.APIKeys.Tavily.APIKey = apiKey
		s.config.APIKeys.Tavily.IsActive = apiKey != ""
		s.config.APIKeys.Tavily.LastUsed = now
	case "elevenlabs":
		s.config.APIKeys.ElevenLabs.APIKey = apiKey
		s.config.APIKeys.ElevenLabs.IsActive = apiKey != ""
		s.config.APIKeys.ElevenLabs.LastUsed = now
	case "google":
		s.config.APIKeys.Google.AnalyticsAPIKey = apiKey
		s.config.APIKeys.Google.IsActive = apiKey != ""
		s.config.APIKeys.Google.LastUsed = now
	case "meta":
		s.config.APIKeys.Meta.WhatsAppToken = apiKey
		s.config.APIKeys.Meta.IsActive = apiKey != ""
		s.config.APIKeys.Meta.LastUsed = now
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}

	return s.saveConfig()
}

// GetAPIKey obtiene una API key específica
func (s *ConfigService) GetAPIKey(service string) (string, bool) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	switch service {
	case "openai":
		return s.config.APIKeys.OpenAI.APIKey, s.config.APIKeys.OpenAI.IsActive
	case "tavily":
		return s.config.APIKeys.Tavily.APIKey, s.config.APIKeys.Tavily.IsActive
	case "elevenlabs":
		return s.config.APIKeys.ElevenLabs.APIKey, s.config.APIKeys.ElevenLabs.IsActive
	case "google":
		return s.config.APIKeys.Google.AnalyticsAPIKey, s.config.APIKeys.Google.IsActive
	case "meta":
		return s.config.APIKeys.Meta.WhatsAppToken, s.config.APIKeys.Meta.IsActive
	default:
		return "", false
	}
}

// UpdateUsage actualiza las estadísticas de uso
func (s *ConfigService) UpdateUsage(service string, requests int, tokens int, cost float64) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	switch service {
	case "openai":
		s.config.APIKeys.OpenAI.Usage.Requests += requests
		s.config.APIKeys.OpenAI.Usage.Tokens += tokens
		s.config.APIKeys.OpenAI.Usage.Cost += cost
		s.config.APIKeys.OpenAI.LastUsed = time.Now()
	case "tavily":
		s.config.APIKeys.Tavily.Usage.Requests += requests
		s.config.APIKeys.Tavily.Usage.Cost += cost
		s.config.APIKeys.Tavily.LastUsed = time.Now()
	case "elevenlabs":
		s.config.APIKeys.ElevenLabs.Usage.Requests += requests
		s.config.APIKeys.ElevenLabs.Usage.Cost += cost
		s.config.APIKeys.ElevenLabs.LastUsed = time.Now()
	case "google":
		s.config.APIKeys.Google.Usage.Requests += requests
		s.config.APIKeys.Google.Usage.Cost += cost
		s.config.APIKeys.Google.LastUsed = time.Now()
	case "meta":
		s.config.APIKeys.Meta.Usage.Requests += requests
		s.config.APIKeys.Meta.Usage.Cost += cost
		s.config.APIKeys.Meta.LastUsed = time.Now()
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}

	return s.saveConfig()
}

// ResetUsage resetea las estadísticas de uso
func (s *ConfigService) ResetUsage(service string) error {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	now := time.Now()

	switch service {
	case "openai":
		s.config.APIKeys.OpenAI.Usage = UsageStats{LastReset: now}
	case "tavily":
		s.config.APIKeys.Tavily.Usage = UsageStats{LastReset: now}
	case "elevenlabs":
		s.config.APIKeys.ElevenLabs.Usage = UsageStats{LastReset: now}
	case "google":
		s.config.APIKeys.Google.Usage = UsageStats{LastReset: now}
	case "meta":
		s.config.APIKeys.Meta.Usage = UsageStats{LastReset: now}
	case "all":
		s.config.APIKeys.OpenAI.Usage = UsageStats{LastReset: now}
		s.config.APIKeys.Tavily.Usage = UsageStats{LastReset: now}
		s.config.APIKeys.ElevenLabs.Usage = UsageStats{LastReset: now}
		s.config.APIKeys.Google.Usage = UsageStats{LastReset: now}
		s.config.APIKeys.Meta.Usage = UsageStats{LastReset: now}
	default:
		return fmt.Errorf("servicio no reconocido: %s", service)
	}

	return s.saveConfig()
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
	// Por ahora, validar formato básico
	if len(apiKey) < 10 {
		return fmt.Errorf("API key de Tavily demasiado corta")
	}

	// Para desarrollo, aceptar cualquier key que tenga al menos 10 caracteres
	// En producción, validar formato específico: apiKey[:4] == "tvly"
	return nil
}

// testElevenLabsKey prueba la API key de ElevenLabs
func (s *ConfigService) testElevenLabsKey(apiKey string) error {
	// TODO: Implementar test real de ElevenLabs
	// Por ahora, solo validar formato
	if len(apiKey) < 20 {
		return fmt.Errorf("formato de API key de ElevenLabs inválido")
	}
	return nil
}
