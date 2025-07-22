package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"mcp-server/internal/models"
)

// PocketBaseService maneja la comunicación con PocketBase
type PocketBaseService struct {
	baseURL    string
	adminEmail string
	adminPass  string
	httpClient *http.Client
	authToken  string
}

// NewPocketBaseService crea una nueva instancia del servicio PocketBase
func NewPocketBaseService(baseURL, adminEmail, adminPass string) *PocketBaseService {
	return &PocketBaseService{
		baseURL:    strings.TrimSuffix(baseURL, "/"),
		adminEmail: adminEmail,
		adminPass:  adminPass,
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// authenticate autentica con PocketBase como admin
func (s *PocketBaseService) authenticate() error {
	if s.authToken != "" {
		return nil // Ya autenticado
	}

	authURL := fmt.Sprintf("%s/api/admins/auth-with-password", s.baseURL)
	authData := map[string]string{
		"identity": s.adminEmail,
		"password": s.adminPass,
	}

	jsonData, err := json.Marshal(authData)
	if err != nil {
		return fmt.Errorf("error serializando datos de autenticación: %w", err)
	}

	resp, err := s.httpClient.Post(authURL, "application/json", strings.NewReader(string(jsonData)))
	if err != nil {
		return fmt.Errorf("error autenticando con PocketBase: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error de autenticación: %d", resp.StatusCode)
	}

	var authResponse struct {
		Token string `json:"token"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&authResponse); err != nil {
		return fmt.Errorf("error decodificando respuesta de autenticación: %w", err)
	}

	s.authToken = authResponse.Token
	return nil
}

// GetAPIKey obtiene una API key por servicio
func (s *PocketBaseService) GetAPIKey(service string) (*models.APIKey, error) {
	if err := s.authenticate(); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/api/collections/api_keys/records?filter=(service='%s')&perPage=1", s.baseURL, service)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creando request: %w", err)
	}

	req.Header.Set("Authorization", s.authToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo API key: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, nil // No existe
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error obteniendo API key: %d", resp.StatusCode)
	}

	var response struct {
		Items []models.APIKey `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("error decodificando respuesta: %w", err)
	}

	if len(response.Items) == 0 {
		return nil, nil
	}

	return &response.Items[0], nil
}

// CreateOrUpdateAPIKey crea o actualiza una API key
func (s *PocketBaseService) CreateOrUpdateAPIKey(service, apiKey string, config map[string]interface{}) error {
	if err := s.authenticate(); err != nil {
		return err
	}

	// Buscar si ya existe
	existing, err := s.GetAPIKey(service)
	if err != nil {
		return err
	}

	apiKeyData := models.APIKey{
		Service:  service,
		APIKey:   apiKey,
		IsActive: true,
		Config:   config,
		LastUsed: time.Now(),
	}

	if existing != nil {
		// Actualizar existente
		url := fmt.Sprintf("%s/api/collections/api_keys/records/%s", s.baseURL, existing.ID)

		jsonData, err := json.Marshal(apiKeyData)
		if err != nil {
			return fmt.Errorf("error serializando datos: %w", err)
		}

		req, err := http.NewRequest("PATCH", url, strings.NewReader(string(jsonData)))
		if err != nil {
			return fmt.Errorf("error creando request: %w", err)
		}

		req.Header.Set("Authorization", s.authToken)
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(req)
		if err != nil {
			return fmt.Errorf("error actualizando API key: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return fmt.Errorf("error actualizando API key: %d", resp.StatusCode)
		}
	} else {
		// Crear nuevo
		url := fmt.Sprintf("%s/api/collections/api_keys/records", s.baseURL)

		jsonData, err := json.Marshal(apiKeyData)
		if err != nil {
			return fmt.Errorf("error serializando datos: %w", err)
		}

		req, err := http.NewRequest("POST", url, strings.NewReader(string(jsonData)))
		if err != nil {
			return fmt.Errorf("error creando request: %w", err)
		}

		req.Header.Set("Authorization", s.authToken)
		req.Header.Set("Content-Type", "application/json")

		resp, err := s.httpClient.Do(req)
		if err != nil {
			return fmt.Errorf("error creando API key: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			return fmt.Errorf("error creando API key: %d", resp.StatusCode)
		}
	}

	return nil
}

// UpdateUsage actualiza las estadísticas de uso
func (s *PocketBaseService) UpdateUsage(service string, requests, tokens int, cost float64) error {
	if err := s.authenticate(); err != nil {
		return err
	}

	apiKey, err := s.GetAPIKey(service)
	if err != nil {
		return err
	}

	if apiKey == nil {
		return fmt.Errorf("API key no encontrada para el servicio: %s", service)
	}

	// Actualizar estadísticas
	apiKey.Usage.Requests += requests
	apiKey.Usage.Tokens += tokens
	apiKey.Usage.Cost += cost
	apiKey.LastUsed = time.Now()

	url := fmt.Sprintf("%s/api/collections/api_keys/records/%s", s.baseURL, apiKey.ID)

	jsonData, err := json.Marshal(apiKey)
	if err != nil {
		return fmt.Errorf("error serializando datos: %w", err)
	}

	req, err := http.NewRequest("PATCH", url, strings.NewReader(string(jsonData)))
	if err != nil {
		return fmt.Errorf("error creando request: %w", err)
	}

	req.Header.Set("Authorization", s.authToken)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("error actualizando uso: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("error actualizando uso: %d", resp.StatusCode)
	}

	return nil
}

// GetAllAPIKeys obtiene todas las API keys
func (s *PocketBaseService) GetAllAPIKeys() ([]models.APIKeyResponse, error) {
	if err := s.authenticate(); err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/api/collections/api_keys/records?perPage=100", s.baseURL)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creando request: %w", err)
	}

	req.Header.Set("Authorization", s.authToken)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo API keys: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error obteniendo API keys: %d", resp.StatusCode)
	}

	var response struct {
		Items []models.APIKey `json:"items"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return nil, fmt.Errorf("error decodificando respuesta: %w", err)
	}

	// Convertir a response sin API keys reales
	var apiKeyResponses []models.APIKeyResponse
	for _, key := range response.Items {
		apiKeyResponses = append(apiKeyResponses, models.APIKeyResponse{
			ID:        key.ID,
			Service:   key.Service,
			IsActive:  key.IsActive,
			LastUsed:  key.LastUsed,
			CreatedAt: key.CreatedAt,
			UpdatedAt: key.UpdatedAt,
			Usage:     key.Usage,
			Config:    key.Config,
			MaskedKey: s.maskAPIKey(key.APIKey),
		})
	}

	return apiKeyResponses, nil
}

// maskAPIKey enmascara una API key para mostrar en el frontend
func (s *PocketBaseService) maskAPIKey(apiKey string) string {
	if len(apiKey) <= 8 {
		return "***"
	}
	return apiKey[:4] + "..." + apiKey[len(apiKey)-4:]
}
