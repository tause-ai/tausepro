package search

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// TavilyClient cliente para la API de Tavily
type TavilyClient struct {
	apiKey     string
	httpClient *http.Client
	baseURL    string
}

// TavilySearchRequest estructura de solicitud para Tavily
type TavilySearchRequest struct {
	APIKey            string   `json:"api_key"`
	Query             string   `json:"query"`
	SearchDepth       string   `json:"search_depth,omitempty"`       // "basic" o "advanced"
	IncludeAnswer     bool     `json:"include_answer,omitempty"`
	IncludeRawContent bool     `json:"include_raw_content,omitempty"`
	MaxResults        int      `json:"max_results,omitempty"`
	IncludeDomains    []string `json:"include_domains,omitempty"`
	ExcludeDomains    []string `json:"exclude_domains,omitempty"`
}

// TavilySearchResponse estructura de respuesta de Tavily
type TavilySearchResponse struct {
	Answer      string                `json:"answer"`
	Query       string                `json:"query"`
	ResponseTime float64              `json:"response_time"`
	Results     []TavilySearchResult  `json:"results"`
	Images      []TavilyImageResult   `json:"images,omitempty"`
}

// TavilySearchResult resultado individual de búsqueda
type TavilySearchResult struct {
	Title      string  `json:"title"`
	URL        string  `json:"url"`
	Content    string  `json:"content"`
	Score      float64 `json:"score"`
	RawContent string  `json:"raw_content,omitempty"`
	PublishedDate string `json:"published_date,omitempty"`
}

// TavilyImageResult resultado de imagen
type TavilyImageResult struct {
	URL string `json:"url"`
}

// TavilyOptions opciones para búsqueda en Tavily
type TavilyOptions struct {
	SearchDepth       string   `json:"search_depth"`       // "basic" o "advanced"
	MaxResults        int      `json:"max_results"`
	IncludeDomains    []string `json:"include_domains"`
	ExcludeDomains    []string `json:"exclude_domains"`
	IncludeAnswer     bool     `json:"include_answer"`
	IncludeRawContent bool     `json:"include_raw_content"`
	IncludeImages     bool     `json:"include_images"`
}

// NewTavilyClient crea un nuevo cliente de Tavily
func NewTavilyClient(apiKey string) *TavilyClient {
	return &TavilyClient{
		apiKey:  apiKey,
		baseURL: "https://api.tavily.com",
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Search realiza una búsqueda usando Tavily
func (c *TavilyClient) Search(query string, options TavilyOptions) (*TavilySearchResponse, error) {
	// Configurar valores por defecto
	if options.SearchDepth == "" {
		options.SearchDepth = "basic"
	}
	if options.MaxResults == 0 {
		options.MaxResults = 5
	}

	// Preparar solicitud
	request := TavilySearchRequest{
		APIKey:            c.apiKey,
		Query:             query,
		SearchDepth:       options.SearchDepth,
		IncludeAnswer:     options.IncludeAnswer,
		IncludeRawContent: options.IncludeRawContent,
		MaxResults:        options.MaxResults,
		IncludeDomains:    options.IncludeDomains,
		ExcludeDomains:    options.ExcludeDomains,
	}

	// Serializar a JSON
	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("error al serializar solicitud: %w", err)
	}

	// Crear solicitud HTTP
	req, err := http.NewRequest("POST", c.baseURL+"/search", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error al crear solicitud HTTP: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "TausePro-MCP-Server/1.0")

	// Ejecutar solicitud
	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error al ejecutar solicitud: %w", err)
	}
	defer resp.Body.Close()

	// Leer respuesta
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error al leer respuesta: %w", err)
	}

	// Verificar código de estado
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error HTTP %d: %s", resp.StatusCode, string(body))
	}

	// Deserializar respuesta
	var searchResponse TavilySearchResponse
	if err := json.Unmarshal(body, &searchResponse); err != nil {
		return nil, fmt.Errorf("error al deserializar respuesta: %w", err)
	}

	return &searchResponse, nil
}

// SearchWithContext realiza una búsqueda con contexto específico
func (c *TavilyClient) SearchWithContext(query string, context string, options TavilyOptions) (*TavilySearchResponse, error) {
	// Combinar query con contexto
	enhancedQuery := fmt.Sprintf("%s. Contexto: %s", query, context)
	return c.Search(enhancedQuery, options)
}

// SearchCompany búsqueda especializada para empresas
func (c *TavilyClient) SearchCompany(companyName string, options TavilyOptions) (*TavilySearchResponse, error) {
	// Optimizar query para búsqueda de empresas
	query := fmt.Sprintf("%s empresa información corporativa financiera contacto", companyName)
	
	// Configurar opciones específicas para empresas
	options.SearchDepth = "advanced"
	options.IncludeAnswer = true
	options.IncludeRawContent = true
	if options.MaxResults == 0 {
		options.MaxResults = 8
	}

	return c.Search(query, options)
}

// SearchMarket búsqueda especializada para análisis de mercado
func (c *TavilyClient) SearchMarket(topic string, options TavilyOptions) (*TavilySearchResponse, error) {
	// Optimizar query para análisis de mercado
	query := fmt.Sprintf("%s mercado tendencias análisis competencia oportunidades", topic)
	
	// Configurar opciones específicas para mercado
	options.SearchDepth = "advanced"
	options.IncludeAnswer = true
	if options.MaxResults == 0 {
		options.MaxResults = 10
	}

	return c.Search(query, options)
}

// SearchNews búsqueda especializada para noticias
func (c *TavilyClient) SearchNews(query string, options TavilyOptions) (*TavilySearchResponse, error) {
	// Optimizar query para noticias
	newsQuery := fmt.Sprintf("%s noticias actualidad últimas novedades", query)
	
	// Configurar opciones específicas para noticias
	options.SearchDepth = "basic" // Las noticias no necesitan análisis tan profundo
	options.IncludeAnswer = true
	if options.MaxResults == 0 {
		options.MaxResults = 6
	}

	return c.Search(newsQuery, options)
}

// TestConnection verifica la conexión con Tavily
func (c *TavilyClient) TestConnection() error {
	// Realizar una búsqueda simple para verificar la conexión
	_, err := c.Search("test", TavilyOptions{
		SearchDepth: "basic",
		MaxResults:  1,
	})
	return err
}

// GetUsage obtiene información de uso de la API (si está disponible)
func (c *TavilyClient) GetUsage() (map[string]interface{}, error) {
	// TODO: Implementar si Tavily proporciona endpoint de uso
	return map[string]interface{}{
		"message": "Información de uso no disponible",
	}, nil
}

// ValidateAPIKey valida la clave API
func (c *TavilyClient) ValidateAPIKey() error {
	if c.apiKey == "" {
		return fmt.Errorf("API key de Tavily no configurada")
	}
	if len(c.apiKey) < 10 {
		return fmt.Errorf("API key de Tavily parece inválida (muy corta)")
	}
	return nil
}

// SetTimeout configura el timeout del cliente HTTP
func (c *TavilyClient) SetTimeout(timeout time.Duration) {
	c.httpClient.Timeout = timeout
}

// SetBaseURL configura la URL base (útil para testing)
func (c *TavilyClient) SetBaseURL(baseURL string) {
	c.baseURL = baseURL
}