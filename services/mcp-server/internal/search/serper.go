package search

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// SerperClient cliente para la API de Serper
type SerperClient struct {
	apiKey     string
	httpClient *http.Client
}

// SerperRequest estructura de request para Serper
type SerperRequest struct {
	Q      string `json:"q"`
	GL     string `json:"gl,omitempty"`     // País (ej: "co" para Colombia)
	HL     string `json:"hl,omitempty"`     // Idioma (ej: "es" para español)
	Num    int    `json:"num,omitempty"`    // Número de resultados (1-100)
	Page   int    `json:"page,omitempty"`   // Página de resultados
	Type   string `json:"type,omitempty"`   // Tipo de búsqueda: search, images, news, etc.
}

// SerperResponse estructura de respuesta de Serper
type SerperResponse struct {
	SearchParameters struct {
		Q    string `json:"q"`
		GL   string `json:"gl"`
		HL   string `json:"hl"`
		Num  int    `json:"num"`
		Type string `json:"type"`
	} `json:"searchParameters"`
	Organic []SerperResult `json:"organic"`
	News    []SerperNews   `json:"news,omitempty"`
	Images  []SerperImage  `json:"images,omitempty"`
	KnowledgeGraph *SerperKnowledgeGraph `json:"knowledgeGraph,omitempty"`
	AnswerBox      *SerperAnswerBox      `json:"answerBox,omitempty"`
}

// SerperResult resultado orgánico de búsqueda
type SerperResult struct {
	Title    string `json:"title"`
	Link     string `json:"link"`
	Snippet  string `json:"snippet"`
	Date     string `json:"date,omitempty"`
	Position int    `json:"position"`
}

// SerperNews resultado de noticias
type SerperNews struct {
	Title     string `json:"title"`
	Link      string `json:"link"`
	Snippet   string `json:"snippet"`
	Date      string `json:"date"`
	Source    string `json:"source"`
	ImageUrl  string `json:"imageUrl,omitempty"`
	Position  int    `json:"position"`
}

// SerperImage resultado de imágenes
type SerperImage struct {
	Title     string `json:"title"`
	ImageUrl  string `json:"imageUrl"`
	ImageWidth int   `json:"imageWidth"`
	ImageHeight int  `json:"imageHeight"`
	ThumbnailUrl string `json:"thumbnailUrl"`
	Source    string `json:"source"`
	Link      string `json:"link"`
	Position  int    `json:"position"`
}

// SerperKnowledgeGraph panel de conocimiento
type SerperKnowledgeGraph struct {
	Title       string                 `json:"title"`
	Type        string                 `json:"type"`
	Website     string                 `json:"website,omitempty"`
	ImageUrl    string                 `json:"imageUrl,omitempty"`
	Description string                 `json:"description,omitempty"`
	DescriptionSource string           `json:"descriptionSource,omitempty"`
	DescriptionLink   string           `json:"descriptionLink,omitempty"`
	Attributes        map[string]string `json:"attributes,omitempty"`
}

// SerperAnswerBox caja de respuesta directa
type SerperAnswerBox struct {
	Answer       string `json:"answer"`
	Title        string `json:"title,omitempty"`
	Link         string `json:"link,omitempty"`
	Snippet      string `json:"snippet,omitempty"`
}

// NewSerperClient crea un nuevo cliente de Serper
func NewSerperClient(apiKey string) *SerperClient {
	return &SerperClient{
		apiKey: apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// Search realiza una búsqueda básica en Google
func (c *SerperClient) Search(query string, options ...SearchOption) (*SerperResponse, error) {
	req := &SerperRequest{
		Q:    query,
		GL:   "co", // Colombia por defecto
		HL:   "es", // Español por defecto
		Num:  10,   // 10 resultados por defecto
		Type: "search",
	}

	// Aplicar opciones
	for _, option := range options {
		option(req)
	}

	return c.makeRequest(req)
}

// SearchNews busca noticias específicamente
func (c *SerperClient) SearchNews(query string, options ...SearchOption) (*SerperResponse, error) {
	req := &SerperRequest{
		Q:    query,
		GL:   "co",
		HL:   "es",
		Num:  10,
		Type: "news",
	}

	for _, option := range options {
		option(req)
	}

	return c.makeRequest(req)
}

// SearchImages busca imágenes
func (c *SerperClient) SearchImages(query string, options ...SearchOption) (*SerperResponse, error) {
	req := &SerperRequest{
		Q:    query,
		GL:   "co",
		HL:   "es",
		Num:  10,
		Type: "images",
	}

	for _, option := range options {
		option(req)
	}

	return c.makeRequest(req)
}

// makeRequest realiza la petición HTTP a Serper
func (c *SerperClient) makeRequest(req *SerperRequest) (*SerperResponse, error) {
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}

	httpReq, err := http.NewRequest("POST", "https://google.serper.dev/search", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	httpReq.Header.Set("X-API-KEY", c.apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response: %w", err)
	}

	var response SerperResponse
	if err := json.Unmarshal(body, &response); err != nil {
		return nil, fmt.Errorf("error unmarshaling response: %w", err)
	}

	return &response, nil
}

// SearchOption función para configurar opciones de búsqueda
type SearchOption func(*SerperRequest)

// WithCountry establece el país de búsqueda
func WithCountry(country string) SearchOption {
	return func(req *SerperRequest) {
		req.GL = country
	}
}

// WithLanguage establece el idioma de búsqueda
func WithLanguage(language string) SearchOption {
	return func(req *SerperRequest) {
		req.HL = language
	}
}

// WithNumResults establece el número de resultados
func WithNumResults(num int) SearchOption {
	return func(req *SerperRequest) {
		if num > 0 && num <= 100 {
			req.Num = num
		}
	}
}

// WithPage establece la página de resultados
func WithPage(page int) SearchOption {
	return func(req *SerperRequest) {
		if page > 0 {
			req.Page = page
		}
	}
}

// TestConnection prueba la conexión con Serper
func (c *SerperClient) TestConnection() error {
	resp, err := c.Search("test", WithNumResults(1))
	if err != nil {
		return fmt.Errorf("error testing Serper connection: %w", err)
	}

	if len(resp.Organic) == 0 {
		return fmt.Errorf("no results returned from Serper")
	}

	return nil
}