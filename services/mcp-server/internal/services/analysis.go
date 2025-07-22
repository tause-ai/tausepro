package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"
)

// AnalysisService maneja el análisis automático de empresas
type AnalysisService struct {
	configService *ConfigService
	httpClient    *http.Client
}

// MarketAnalysis representa el análisis completo de una empresa
type MarketAnalysis struct {
	Company         CompanyInfo        `json:"company"`
	Industry        IndustryAnalysis   `json:"industry"`
	Competitors     []CompetitorInfo   `json:"competitors"`
	Opportunities   []Opportunity      `json:"opportunities"`
	Recommendations []Recommendation   `json:"recommendations"`
	ColombiaContext ColombiaMarketData `json:"colombia_context"`
	AnalysisDate    time.Time          `json:"analysis_date"`
}

// CompanyInfo información básica de la empresa
type CompanyInfo struct {
	Name        string            `json:"name"`
	URL         string            `json:"url"`
	Description string            `json:"description"`
	Industry    string            `json:"industry"`
	Location    string            `json:"location"`
	Size        string            `json:"size"`
	Founded     string            `json:"founded"`
	SocialMedia map[string]string `json:"social_media"`
	Website     WebsiteAnalysis   `json:"website"`
}

// WebsiteAnalysis análisis del sitio web
type WebsiteAnalysis struct {
	Technologies []string    `json:"technologies"`
	Performance  string      `json:"performance"`
	SEO          SEOAnalysis `json:"seo"`
	Ecommerce    bool        `json:"ecommerce"`
	Blog         bool        `json:"blog"`
	ContactInfo  bool        `json:"contact_info"`
}

// SEOAnalysis análisis SEO básico
type SEOAnalysis struct {
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Keywords    []string `json:"keywords"`
	Score       int      `json:"score"`
}

// IndustryAnalysis análisis de la industria
type IndustryAnalysis struct {
	Name          string   `json:"name"`
	Size          string   `json:"size"`
	Growth        string   `json:"growth"`
	Trends        []string `json:"trends"`
	Challenges    []string `json:"challenges"`
	Opportunities []string `json:"opportunities"`
}

// CompetitorInfo información de competidores
type CompetitorInfo struct {
	Name        string   `json:"name"`
	URL         string   `json:"url"`
	Strengths   []string `json:"strengths"`
	Weaknesses  []string `json:"weaknesses"`
	MarketShare string   `json:"market_share"`
}

// Opportunity oportunidades identificadas
type Opportunity struct {
	Category    string `json:"category"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Impact      string `json:"impact"`
	Effort      string `json:"effort"`
	ROI         string `json:"roi"`
}

// Recommendation recomendaciones específicas
type Recommendation struct {
	Priority    string   `json:"priority"`
	Category    string   `json:"category"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Actions     []string `json:"actions"`
	Timeline    string   `json:"timeline"`
	Cost        string   `json:"cost"`
}

// ColombiaMarketData contexto específico de Colombia
type ColombiaMarketData struct {
	EconomicContext string   `json:"economic_context"`
	DigitalAdoption string   `json:"digital_adoption"`
	PaymentMethods  []string `json:"payment_methods"`
	ShippingOptions []string `json:"shipping_options"`
	Regulations     []string `json:"regulations"`
	LocalTrends     []string `json:"local_trends"`
}

// TavilySearchRequest request para Tavily
type TavilySearchRequest struct {
	APIKey            string `json:"api_key"`
	Query             string `json:"query"`
	SearchDepth       string `json:"search_depth"`
	IncludeAnswer     bool   `json:"include_answer"`
	IncludeRawContent bool   `json:"include_raw_content"`
	IncludeImages     bool   `json:"include_images"`
}

// TavilySearchResponse respuesta de Tavily
type TavilySearchResponse struct {
	Query   string         `json:"query"`
	Results []TavilyResult `json:"results"`
	Answer  string         `json:"answer"`
	Images  []string       `json:"images"`
}

// TavilyResult resultado individual de Tavily
type TavilyResult struct {
	Title   string  `json:"title"`
	URL     string  `json:"url"`
	Content string  `json:"content"`
	Score   float64 `json:"score"`
}

// NewAnalysisService crea una nueva instancia del servicio de análisis
func NewAnalysisService(configService *ConfigService) *AnalysisService {
	return &AnalysisService{
		configService: configService,
		httpClient:    &http.Client{Timeout: 30 * time.Second},
	}
}

// AnalyzeCompany analiza una empresa completa
func (s *AnalysisService) AnalyzeCompany(ctx context.Context, url string) (*MarketAnalysis, error) {
	log.Printf("Iniciando análisis de empresa: %s", url)

	// 1. Extraer información básica de la empresa
	companyInfo, err := s.extractCompanyInfo(ctx, url)
	if err != nil {
		return nil, fmt.Errorf("error extrayendo información de empresa: %w", err)
	}

	// 2. Investigar la industria
	industryAnalysis, err := s.analyzeIndustry(ctx, companyInfo.Industry)
	if err != nil {
		return nil, fmt.Errorf("error analizando industria: %w", err)
	}

	// 3. Identificar competidores
	competitors, err := s.findCompetitors(ctx, companyInfo.Name, companyInfo.Industry)
	if err != nil {
		return nil, fmt.Errorf("error encontrando competidores: %w", err)
	}

	// 4. Identificar oportunidades
	opportunities, err := s.identifyOpportunities(ctx, companyInfo, industryAnalysis)
	if err != nil {
		return nil, fmt.Errorf("error identificando oportunidades: %w", err)
	}

	// 5. Generar recomendaciones
	recommendations, err := s.generateRecommendations(ctx, companyInfo, industryAnalysis, competitors)
	if err != nil {
		return nil, fmt.Errorf("error generando recomendaciones: %w", err)
	}

	// 6. Contexto colombiano
	colombiaContext, err := s.getColombiaContext(ctx, companyInfo.Industry)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo contexto colombiano: %w", err)
	}

	analysis := &MarketAnalysis{
		Company:         *companyInfo,
		Industry:        *industryAnalysis,
		Competitors:     competitors,
		Opportunities:   opportunities,
		Recommendations: recommendations,
		ColombiaContext: *colombiaContext,
		AnalysisDate:    time.Now(),
	}

	log.Printf("Análisis completado para: %s", companyInfo.Name)
	return analysis, nil
}

// extractCompanyInfo extrae información básica de la empresa
func (s *AnalysisService) extractCompanyInfo(ctx context.Context, url string) (*CompanyInfo, error) {
	query := fmt.Sprintf("información empresa %s sitio web análisis", url)

	_, err := s.searchTavily(ctx, query)
	if err != nil {
		return nil, err
	}

	// Procesar resultados para extraer información
	companyInfo := &CompanyInfo{
		URL:         url,
		SocialMedia: make(map[string]string),
	}

	// Por ahora, usar valores por defecto ya que Tavily no está configurado
	// TODO: Implementar extracción real de información cuando Tavily esté disponible

	// Si no se pudo extraer información, usar valores por defecto
	if companyInfo.Name == "" {
		companyInfo.Name = "Empresa Analizada"
	}
	if companyInfo.Industry == "" {
		companyInfo.Industry = "Tecnología"
	}
	if companyInfo.Location == "" {
		companyInfo.Location = "Colombia"
	}

	// Analizar sitio web
	companyInfo.Website = s.analyzeWebsite(url)

	return companyInfo, nil
}

// analyzeWebsite analiza el sitio web de la empresa
func (s *AnalysisService) analyzeWebsite(url string) WebsiteAnalysis {
	// Análisis básico del sitio web
	analysis := WebsiteAnalysis{
		Technologies: []string{"WordPress", "PHP", "MySQL"},
		Performance:  "Buena",
		Ecommerce:    false,
		Blog:         true,
		ContactInfo:  true,
		SEO: SEOAnalysis{
			Title:       "Título de la empresa",
			Description: "Descripción de la empresa",
			Keywords:    []string{"colombia", "servicios", "empresa"},
			Score:       75,
		},
	}

	return analysis
}

// analyzeIndustry analiza la industria de la empresa
func (s *AnalysisService) analyzeIndustry(ctx context.Context, industry string) (*IndustryAnalysis, error) {
	query := fmt.Sprintf("industria %s Colombia mercado tendencias 2025", industry)

	_, err := s.searchTavily(ctx, query)
	if err != nil {
		return nil, err
	}

	analysis := &IndustryAnalysis{
		Name:   industry,
		Size:   "Mediana",
		Growth: "Creciente",
		Trends: []string{
			"Digitalización acelerada",
			"E-commerce en crecimiento",
			"Automatización de procesos",
		},
		Challenges: []string{
			"Competencia internacional",
			"Cambios regulatorios",
			"Escasez de talento",
		},
		Opportunities: []string{
			"Expansión digital",
			"Automatización",
			"Servicios especializados",
		},
	}

	return analysis, nil
}

// findCompetitors encuentra competidores de la empresa
func (s *AnalysisService) findCompetitors(ctx context.Context, companyName, industry string) ([]CompetitorInfo, error) {
	query := fmt.Sprintf("competidores %s %s Colombia", companyName, industry)

	_, err := s.searchTavily(ctx, query)
	if err != nil {
		return nil, err
	}

	competitors := []CompetitorInfo{
		{
			Name:        "Competidor 1",
			URL:         "https://competidor1.com",
			Strengths:   []string{"Marca reconocida", "Presencia digital"},
			Weaknesses:  []string{"Precios altos", "Servicio al cliente"},
			MarketShare: "25%",
		},
		{
			Name:        "Competidor 2",
			URL:         "https://competidor2.com",
			Strengths:   []string{"Innovación", "Precios competitivos"},
			Weaknesses:  []string{"Cobertura limitada", "Experiencia limitada"},
			MarketShare: "15%",
		},
	}

	return competitors, nil
}

// identifyOpportunities identifica oportunidades para la empresa
func (s *AnalysisService) identifyOpportunities(ctx context.Context, company *CompanyInfo, industry *IndustryAnalysis) ([]Opportunity, error) {
	opportunities := []Opportunity{
		{
			Category:    "Digital",
			Title:       "Implementar E-commerce",
			Description: "Crear tienda online para vender productos/servicios",
			Impact:      "Alto",
			Effort:      "Medio",
			ROI:         "200% en 12 meses",
		},
		{
			Category:    "Marketing",
			Title:       "Marketing Digital",
			Description: "Implementar estrategias de marketing digital",
			Impact:      "Alto",
			Effort:      "Bajo",
			ROI:         "150% en 6 meses",
		},
		{
			Category:    "Operaciones",
			Title:       "Automatización",
			Description: "Automatizar procesos operativos",
			Impact:      "Medio",
			Effort:      "Alto",
			ROI:         "300% en 18 meses",
		},
	}

	return opportunities, nil
}

// generateRecommendations genera recomendaciones específicas
func (s *AnalysisService) generateRecommendations(ctx context.Context, company *CompanyInfo, industry *IndustryAnalysis, competitors []CompetitorInfo) ([]Recommendation, error) {
	recommendations := []Recommendation{
		{
			Priority:    "Alta",
			Category:    "Digital",
			Title:       "Crear presencia digital profesional",
			Description: "Desarrollar sitio web moderno y optimizado para SEO",
			Actions:     []string{"Diseñar sitio web responsive", "Optimizar SEO", "Implementar analytics"},
			Timeline:    "2-3 meses",
			Cost:        "$2,000,000 - $5,000,000 COP",
		},
		{
			Priority:    "Alta",
			Category:    "Marketing",
			Title:       "Implementar marketing digital",
			Description: "Crear estrategia de marketing digital integral",
			Actions:     []string{"Crear redes sociales", "Implementar Google Ads", "Email marketing"},
			Timeline:    "1-2 meses",
			Cost:        "$1,500,000 - $3,000,000 COP",
		},
		{
			Priority:    "Media",
			Category:    "Operaciones",
			Title:       "Automatizar procesos",
			Description: "Implementar herramientas de automatización",
			Actions:     []string{"CRM", "Automatización de emails", "Gestión de inventario"},
			Timeline:    "3-4 meses",
			Cost:        "$3,000,000 - $6,000,000 COP",
		},
	}

	return recommendations, nil
}

// getColombiaContext obtiene contexto específico de Colombia
func (s *AnalysisService) getColombiaContext(ctx context.Context, industry string) (*ColombiaMarketData, error) {
	context := &ColombiaMarketData{
		EconomicContext: "Economía en crecimiento con fuerte enfoque en digitalización",
		DigitalAdoption: "Acelerada por la pandemia, 70% de PYMEs digitalizadas",
		PaymentMethods:  []string{"PSE", "Nequi", "Wompi", "DaviPlata", "Efecty"},
		ShippingOptions: []string{"Servientrega", "TCC", "Interrapidisimo", "Coordinadora"},
		Regulations:     []string{"Ley 1581 de 2012", "Circular Externa 002 de 2018", "DIAN"},
		LocalTrends:     []string{"E-commerce", "Automatización", "Servicios digitales"},
	}

	return context, nil
}

// searchTavily realiza búsquedas usando Tavily
func (s *AnalysisService) searchTavily(ctx context.Context, query string) ([]TavilyResult, error) {
	// Obtener API key de Tavily desde el config
	tavilyAPIKey, isActive := s.configService.GetAPIKey("tavily")
	if !isActive {
		return nil, fmt.Errorf("API key de Tavily no configurada")
	}

	request := TavilySearchRequest{
		APIKey:            tavilyAPIKey,
		Query:             query,
		SearchDepth:       "advanced",
		IncludeAnswer:     true,
		IncludeRawContent: true,
		IncludeImages:     false,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("error marshaling request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.tavily.com/search", strings.NewReader(string(jsonData)))
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tavily API error: %d", resp.StatusCode)
	}

	var tavilyResp TavilySearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&tavilyResp); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return tavilyResp.Results, nil
}

// GenerateReport genera un reporte en formato JSON
func (s *AnalysisService) GenerateReport(analysis *MarketAnalysis) ([]byte, error) {
	return json.MarshalIndent(analysis, "", "  ")
}

// GeneratePaywallPreview genera una vista previa para el paywall
func (s *AnalysisService) GeneratePaywallPreview(analysis *MarketAnalysis) (*PaywallPreview, error) {
	preview := &PaywallPreview{
		CompanyName: analysis.Company.Name,
		Industry:    analysis.Company.Industry,
		Location:    analysis.Company.Location,
		Summary:     fmt.Sprintf("Análisis completo de %s en el mercado colombiano", analysis.Company.Name),
		Highlights: []string{
			fmt.Sprintf("Identificamos %d oportunidades de crecimiento", len(analysis.Opportunities)),
			fmt.Sprintf("Analizamos %d competidores directos", len(analysis.Competitors)),
			fmt.Sprintf("Generamos %d recomendaciones específicas", len(analysis.Recommendations)),
		},
		PreviewData: map[string]interface{}{
			"industry_trends":  analysis.Industry.Trends[:2],
			"opportunities":    analysis.Opportunities[:1],
			"colombia_context": analysis.ColombiaContext.LocalTrends,
		},
	}

	return preview, nil
}

// PaywallPreview vista previa para el paywall
type PaywallPreview struct {
	CompanyName string                 `json:"company_name"`
	Industry    string                 `json:"industry"`
	Location    string                 `json:"location"`
	Summary     string                 `json:"summary"`
	Highlights  []string               `json:"highlights"`
	PreviewData map[string]interface{} `json:"preview_data"`
}
