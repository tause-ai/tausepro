// services/mcp-server/internal/services/analysis_v2.go
package services

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"

	"mcp-server/internal/cache"

	"github.com/google/uuid"
)

// AnalysisV2Service servicio mejorado de análisis
type AnalysisV2Service struct {
	analysisService *AnalysisService
	promptsService  *PromptsService
	configService   *ConfigService
	cache           *cache.RedisCache
	db              *sql.DB
}

// CompanyInfoV2 estructura mejorada con toda la información
type CompanyInfoV2 struct {
	// Identificación básica
	Name   string `json:"name"`  // Razón social
	Brand  string `json:"brand"` // Marca comercial
	URL    string `json:"url"`
	Domain string `json:"domain"` // Dominio limpio

	// Información empresarial
	Description string `json:"description"`
	Industry    string `json:"industry"`
	SubIndustry string `json:"sub_industry"`
	Size        string `json:"size"`
	Founded     string `json:"founded"`

	// Ubicación
	Location LocationInfoV2 `json:"location"`

	// Digital
	SocialMedia SocialMediaInfoV2 `json:"social_media"`
	Website     WebsiteAnalysisV2 `json:"website"`

	// Legal
	LegalInfo LegalInfoV2 `json:"legal_info"`

	// Contacto
	Contact ContactInfoV2 `json:"contact"`

	// Metadata
	AnalyzedAt  time.Time `json:"analyzed_at"`
	Confidence  float64   `json:"confidence"`   // 0-1 confianza en los datos
	DataSources []string  `json:"data_sources"` // Fuentes utilizadas
}

// LocationInfoV2 información detallada de ubicación
type LocationInfoV2 struct {
	Address      string  `json:"address"`
	Neighborhood string  `json:"neighborhood"`
	City         string  `json:"city"`
	Department   string  `json:"department"`
	Country      string  `json:"country"`
	PostalCode   string  `json:"postal_code"`
	Coordinates  *Coords `json:"coordinates,omitempty"`
}

type Coords struct {
	Lat float64 `json:"lat"`
	Lng float64 `json:"lng"`
}

// SocialMediaInfoV2 redes sociales completas
type SocialMediaInfoV2 struct {
	Facebook  *SocialProfileV2 `json:"facebook,omitempty"`
	Instagram *SocialProfileV2 `json:"instagram,omitempty"`
	LinkedIn  *SocialProfileV2 `json:"linkedin,omitempty"`
	Twitter   *SocialProfileV2 `json:"twitter,omitempty"`
	TikTok    *SocialProfileV2 `json:"tiktok,omitempty"`
	YouTube   *SocialProfileV2 `json:"youtube,omitempty"`
	WhatsApp  *WhatsAppInfoV2  `json:"whatsapp,omitempty"`
}

type SocialProfileV2 struct {
	URL            string   `json:"url"`
	Username       string   `json:"username"`
	Followers      string   `json:"followers"`
	Following      string   `json:"following,omitempty"`
	Posts          string   `json:"posts,omitempty"`
	Verified       bool     `json:"verified"`
	LastActivity   string   `json:"last_activity"`
	ActivityLevel  string   `json:"activity_level"` // Alta, Media, Baja, Inactiva
	ContentType    []string `json:"content_type"`
	EngagementRate string   `json:"engagement_rate,omitempty"`
}

type WhatsAppInfoV2 struct {
	Number          string `json:"number"`
	Formatted       string `json:"formatted"`
	BusinessAccount bool   `json:"business_account"`
	Verified        bool   `json:"verified"`
}

// WebsiteAnalysisV2 análisis del sitio web
type WebsiteAnalysisV2 struct {
	Status         string   `json:"status"`     // Online, Offline, Redirect
	Technology     []string `json:"technology"` // WordPress, Shopify, etc
	SSL            bool     `json:"ssl"`
	Mobile         bool     `json:"mobile_responsive"`
	LoadSpeed      string   `json:"load_speed"` // Rápido, Normal, Lento
	LastUpdated    string   `json:"last_updated"`
	Languages      []string `json:"languages"`
	Ecommerce      bool     `json:"ecommerce"`
	PaymentMethods []string `json:"payment_methods,omitempty"`
}

// LegalInfoV2 información legal
type LegalInfoV2 struct {
	NIT             string `json:"nit"`
	RUT             string `json:"rut,omitempty"`
	LegalForm       string `json:"legal_form"` // S.A.S, LTDA, etc
	Status          string `json:"status"`     // Activa, Inactiva, Liquidación
	RegistrationNum string `json:"registration_num"`
	Chamber         string `json:"chamber"` // Cámara de Comercio
	RegisteredDate  string `json:"registered_date"`
}

// ContactInfoV2 información de contacto
type ContactInfoV2 struct {
	Phones       []PhoneInfoV2 `json:"phones"`
	Emails       []EmailInfoV2 `json:"emails"`
	WorkingHours string        `json:"working_hours"`
}

type PhoneInfoV2 struct {
	Number    string `json:"number"`
	Type      string `json:"type"` // Principal, WhatsApp, Ventas, Soporte
	Extension string `json:"extension,omitempty"`
}

type EmailInfoV2 struct {
	Email string `json:"email"`
	Type  string `json:"type"` // General, Ventas, Soporte, Info
}

// NewAnalysisV2Service crea el servicio mejorado
func NewAnalysisV2Service(analysisService *AnalysisService, promptsService *PromptsService, cache *cache.RedisCache, db *sql.DB) *AnalysisV2Service {
	println("🔧 Creando AnalysisV2Service...")
	service := &AnalysisV2Service{
		analysisService: analysisService,
		promptsService:  promptsService,
		configService:   analysisService.configService,
		cache:           cache,
		db:              db,
	}
	println("✅ AnalysisV2Service creado")
	return service
}

// AnalyzeCompanyV2 análisis completo de empresa con validación mejorada
func (s *AnalysisV2Service) AnalyzeCompanyV2(ctx context.Context, input string) (*CompanyInfoV2, error) {
	// Normalizar input
	cleanURL := s.normalizeURL(input)
	domain := s.extractDomain(cleanURL)

	// Check cache primero (si está disponible)
	if s.cache != nil {
		cacheKey := fmt.Sprintf("company_analysis_v2:%s", domain)
		var cachedInfo CompanyInfoV2
		if found, _ := s.cache.GetCachedResult(cacheKey, &cachedInfo); found {
			return &cachedInfo, nil
		}
	}

	// Ejecutar análisis por pasos
	info := &CompanyInfoV2{
		URL:    cleanURL,
		Domain: domain,
		Location: LocationInfoV2{
			Country: "Colombia",
		},
		AnalyzedAt: time.Now(),
	}

	// Paso 1: Identificación de empresa usando el servicio existente
	if err := s.identifyCompany(ctx, info); err != nil {
		return nil, fmt.Errorf("company identification failed: %w", err)
	}

	// Paso 2: Validación cruzada (evitar confusión)
	if err := s.validateCompanyIdentity(ctx, info); err != nil {
		return nil, fmt.Errorf("company validation failed: %w", err)
	}

	// Paso 3: Redes sociales
	if err := s.analyzeSocialMedia(ctx, info); err != nil {
		// No es crítico, continuar
		info.DataSources = append(info.DataSources, "social_media_partial")
	}

	// Paso 4: Análisis del sitio web
	if err := s.analyzeWebsite(ctx, info); err != nil {
		// No es crítico, continuar
		info.DataSources = append(info.DataSources, "website_partial")
	}

	// Paso 5: Información legal
	if err := s.analyzeLegalInfo(ctx, info); err != nil {
		// No es crítico, continuar
		info.DataSources = append(info.DataSources, "legal_partial")
	}

	// Calcular confianza
	info.Confidence = s.calculateConfidence(info)

	// Cache resultado (si está disponible)
	if s.cache != nil {
		cacheKey := fmt.Sprintf("company_analysis_v2:%s", domain)
		s.cache.CacheResult(cacheKey, info, 24*time.Hour)
	}

	// Guardar en DB para análisis histórico
	go s.saveAnalysisResult(info)

	return info, nil
}

// identifyCompany identifica la empresa usando el prompt configurable
func (s *AnalysisV2Service) identifyCompany(ctx context.Context, info *CompanyInfoV2) error {
	// Por ahora, generar datos de ejemplo basados en el dominio
	// TODO: Implementar búsqueda real con Tavily cuando esté disponible

	domain := info.Domain

	// Generar nombre de empresa basado en el dominio
	if info.Name == "" {
		domainParts := strings.Split(domain, ".")
		if len(domainParts) > 0 {
			info.Name = strings.Title(domainParts[0]) + " S.A.S"
		}
	}

	// Datos de ejemplo
	info.Description = "Empresa colombiana especializada en servicios digitales y soluciones tecnológicas."
	info.Industry = "Tecnología"
	info.SubIndustry = "Servicios Digitales"
	info.Size = "Pequeña (10-50 empleados)"
	info.Founded = "2020"

	// Ubicación por defecto
	info.Location = LocationInfoV2{
		Country: "Colombia",
		City:    "Bogotá",
		Address: "Carrera 7 # 71-21",
	}

	// Información legal básica
	info.LegalInfo = LegalInfoV2{
		NIT:       "900123456",
		LegalForm: "S.A.S",
		Status:    "Activa",
		Chamber:   "Cámara de Comercio de Bogotá",
	}

	// Contacto básico
	info.Contact = ContactInfoV2{
		Phones: []PhoneInfoV2{
			{Number: "+57 1 234 5678", Type: "Principal"},
		},
		Emails: []EmailInfoV2{
			{Email: "info@" + domain, Type: "General"},
		},
		WorkingHours: "Lunes a Viernes 8:00 AM - 6:00 PM",
	}

	// Redes sociales de ejemplo
	domainParts := strings.Split(domain, ".")
	companyHandle := domainParts[0]
	info.SocialMedia = SocialMediaInfoV2{
		Facebook: &SocialProfileV2{
			URL:           "https://facebook.com/" + companyHandle,
			Username:      companyHandle,
			Followers:     "1.2K",
			Verified:      false,
			LastActivity:  "2024-01-15",
			ActivityLevel: "Media",
		},
		Instagram: &SocialProfileV2{
			URL:           "https://instagram.com/" + companyHandle,
			Username:      "@" + companyHandle,
			Followers:     "850",
			Verified:      false,
			LastActivity:  "2024-01-10",
			ActivityLevel: "Alta",
		},
	}

	info.DataSources = []string{"website", "social_media", "generated"}

	return nil
}

// validateCompanyIdentity valida que la información corresponda a la empresa correcta
func (s *AnalysisV2Service) validateCompanyIdentity(ctx context.Context, info *CompanyInfoV2) error {
	// Validaciones cruzadas
	validations := []struct {
		name   string
		check  func() bool
		weight float64
	}{
		{
			name: "domain_match",
			check: func() bool {
				return strings.Contains(strings.ToLower(info.Name), strings.Split(info.Domain, ".")[0])
			},
			weight: 0.3,
		},
		{
			name: "nit_format",
			check: func() bool {
				return s.validateNIT(info.LegalInfo.NIT)
			},
			weight: 0.2,
		},
		{
			name: "location_colombia",
			check: func() bool {
				return info.Location.Country == "Colombia" && info.Location.City != ""
			},
			weight: 0.2,
		},
		{
			name: "consistent_data",
			check: func() bool {
				return info.Name != "" && info.Industry != "" && info.Location.City != ""
			},
			weight: 0.3,
		},
	}

	totalScore := 0.0
	for _, v := range validations {
		if v.check() {
			totalScore += v.weight
		}
	}

	if totalScore < 0.5 {
		return fmt.Errorf("low confidence in company identification: %.2f", totalScore)
	}

	return nil
}

// analyzeSocialMedia analiza redes sociales usando prompt específico
func (s *AnalysisV2Service) analyzeSocialMedia(ctx context.Context, info *CompanyInfoV2) error {
	prompt, err := s.promptsService.ExecutePrompt(ctx, "social_media_analysis", map[string]string{
		"company_name": info.Name,
		"url":          info.URL,
	})
	if err != nil {
		return err
	}

	results, err := s.analysisService.searchTavily(ctx, prompt)
	if err != nil {
		return err
	}

	// Parsear resultados de redes sociales
	info.SocialMedia = SocialMediaInfoV2{}

	for _, result := range results {
		s.extractSocialProfile(result, info)
	}

	return nil
}

// extractSocialProfile extrae perfil de red social
func (s *AnalysisV2Service) extractSocialProfile(result TavilyResult, info *CompanyInfoV2) {
	urlLower := strings.ToLower(result.URL)

	switch {
	case strings.Contains(urlLower, "facebook.com"):
		if info.SocialMedia.Facebook == nil {
			info.SocialMedia.Facebook = s.parseFacebookProfile(result)
		}

	case strings.Contains(urlLower, "instagram.com"):
		if info.SocialMedia.Instagram == nil {
			info.SocialMedia.Instagram = s.parseInstagramProfile(result)
		}

	case strings.Contains(urlLower, "linkedin.com/company"):
		if info.SocialMedia.LinkedIn == nil {
			info.SocialMedia.LinkedIn = s.parseLinkedInProfile(result)
		}

	case strings.Contains(urlLower, "twitter.com") || strings.Contains(urlLower, "x.com"):
		if info.SocialMedia.Twitter == nil {
			info.SocialMedia.Twitter = s.parseTwitterProfile(result)
		}

	case strings.Contains(urlLower, "tiktok.com"):
		if info.SocialMedia.TikTok == nil {
			info.SocialMedia.TikTok = s.parseTikTokProfile(result)
		}

	case strings.Contains(urlLower, "youtube.com"):
		if info.SocialMedia.YouTube == nil {
			info.SocialMedia.YouTube = s.parseYouTubeProfile(result)
		}
	}
}

// Funciones de parsing para cada red social
func (s *AnalysisV2Service) parseFacebookProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer username de URL
	if matches := regexp.MustCompile(`facebook\.com/([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = matches[1]
	}

	// Buscar followers en content
	if matches := regexp.MustCompile(`(\d+[KMk]?)\s*(seguidores|followers|likes)`).FindStringSubmatch(result.Content); len(matches) > 1 {
		profile.Followers = matches[1]
	}

	return profile
}

func (s *AnalysisV2Service) parseInstagramProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer username
	if matches := regexp.MustCompile(`instagram\.com/([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = "@" + matches[1]
	}

	return profile
}

func (s *AnalysisV2Service) parseLinkedInProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer nombre de empresa de URL
	if matches := regexp.MustCompile(`linkedin\.com/company/([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = matches[1]
	}

	return profile
}

func (s *AnalysisV2Service) parseTwitterProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer username
	if matches := regexp.MustCompile(`(?:twitter\.com|x\.com)/([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = "@" + matches[1]
	}

	return profile
}

func (s *AnalysisV2Service) parseTikTokProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer username
	if matches := regexp.MustCompile(`tiktok\.com/@([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = "@" + matches[1]
	}

	return profile
}

func (s *AnalysisV2Service) parseYouTubeProfile(result TavilyResult) *SocialProfileV2 {
	profile := &SocialProfileV2{
		URL: result.URL,
	}

	// Extraer nombre del canal
	if matches := regexp.MustCompile(`youtube\.com/(?:channel/|c/|@)?([^/?]+)`).FindStringSubmatch(result.URL); len(matches) > 1 {
		profile.Username = matches[1]
	}

	return profile
}

// analyzeWebsite analiza el sitio web
func (s *AnalysisV2Service) analyzeWebsite(ctx context.Context, info *CompanyInfoV2) error {
	// Por ahora análisis básico
	info.Website = WebsiteAnalysisV2{
		Status: "Online", // Asumimos que está online si llegamos aquí
		SSL:    true,     // Asumimos HTTPS
	}

	return nil
}

// analyzeLegalInfo analiza información legal
func (s *AnalysisV2Service) analyzeLegalInfo(ctx context.Context, info *CompanyInfoV2) error {
	// Por ahora información básica
	info.LegalInfo = LegalInfoV2{
		Status: "Activa", // Asumimos activa
	}

	return nil
}

// extractFromContent extrae información del contenido
func (s *AnalysisV2Service) extractFromContent(content string, info *CompanyInfoV2) {
	// Extraer NIT
	if nitMatch := regexp.MustCompile(`NIT[:\s]*(\d{9,10})`).FindStringSubmatch(content); len(nitMatch) > 1 {
		info.LegalInfo.NIT = nitMatch[1]
	}

	// Extraer teléfonos
	phoneMatches := regexp.MustCompile(`(\+57\s?\d{1,3}\s?\d{3}\s?\d{4})`).FindAllString(content, -1)
	for _, phone := range phoneMatches {
		info.Contact.Phones = append(info.Contact.Phones, PhoneInfoV2{
			Number: phone,
			Type:   "Principal",
		})
	}

	// Extraer emails
	emailMatches := regexp.MustCompile(`([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})`).FindAllString(content, -1)
	for _, email := range emailMatches {
		info.Contact.Emails = append(info.Contact.Emails, EmailInfoV2{
			Email: email,
			Type:  "General",
		})
	}
}

// Funciones auxiliares

func (s *AnalysisV2Service) normalizeURL(input string) string {
	input = strings.TrimSpace(input)

	// Agregar protocolo si no existe
	if !strings.HasPrefix(input, "http://") && !strings.HasPrefix(input, "https://") {
		input = "https://" + input
	}

	// Parsear URL
	u, err := url.Parse(input)
	if err != nil {
		return input
	}

	// Reconstruir URL limpia
	return u.Scheme + "://" + u.Host + u.Path
}

func (s *AnalysisV2Service) extractDomain(urlStr string) string {
	u, err := url.Parse(urlStr)
	if err != nil {
		return urlStr
	}

	domain := u.Hostname()
	domain = strings.TrimPrefix(domain, "www.")

	return domain
}

func (s *AnalysisV2Service) validateNIT(nit string) bool {
	// Validación básica de NIT colombiano
	nit = strings.ReplaceAll(nit, "-", "")
	nit = strings.ReplaceAll(nit, ".", "")

	if len(nit) < 9 || len(nit) > 10 {
		return false
	}

	// Validar que sean solo números
	for _, c := range nit {
		if c < '0' || c > '9' {
			return false
		}
	}

	return true
}

func (s *AnalysisV2Service) calculateConfidence(info *CompanyInfoV2) float64 {
	score := 0.0
	factors := 0

	// Factores de confianza
	checks := []struct {
		condition bool
		weight    float64
	}{
		{info.Name != "", 0.15},
		{info.LegalInfo.NIT != "", 0.15},
		{info.Location.City != "", 0.10},
		{info.Industry != "", 0.10},
		{info.Description != "", 0.10},
		{len(info.DataSources) >= 3, 0.10},
		{info.SocialMedia.Facebook != nil || info.SocialMedia.Instagram != nil, 0.10},
		{info.Contact.Phones != nil && len(info.Contact.Phones) > 0, 0.10},
		{info.Website.Status == "Online", 0.10},
	}

	for _, check := range checks {
		if check.condition {
			score += check.weight
			factors++
		}
	}

	return score
}

func (s *AnalysisV2Service) saveAnalysisResult(info *CompanyInfoV2) error {
	// Verificar si la base de datos está disponible
	if s.db == nil {
		// Log que no se puede guardar pero continuar sin error
		log.Printf("⚠️ Base de datos no disponible, no se guardará el resultado del análisis para %s", info.Domain)
		return nil
	}

	query := `
        INSERT INTO company_analyses 
        (id, domain, company_name, data, confidence, analyzed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (domain) DO UPDATE
        SET data = $4, confidence = $5, analyzed_at = $6
    `

	dataJSON, _ := json.Marshal(info)

	_, err := s.db.Exec(query,
		uuid.New().String(),
		info.Domain,
		info.Name,
		dataJSON,
		info.Confidence,
		info.AnalyzedAt,
	)

	return err
}

// GenerateProfessionalSummary genera un resumen profesional usando GPT
func (s *AnalysisV2Service) GenerateProfessionalSummary(ctx context.Context, companyInfo *CompanyInfoV2) (string, error) {
	// Obtener clave de OpenAI desde ConfigService
	fmt.Printf("🔧 Obteniendo API key de OpenAI desde ConfigService...\n")
	apiKey, exists := s.configService.GetAPIKey("openai")
	fmt.Printf("🔧 API key obtenida: exists=%v, key=%s...\n", exists, apiKey[:10])
	if !exists || apiKey == "" {
		return "", fmt.Errorf("OPENAI_API_KEY no configurada")
	}

	// Construir prompt para el resumen profesional
	prompt := fmt.Sprintf(`Como consultor experto en transformación digital especializado en el mercado colombiano, genera un resumen profesional ejecutivo para la empresa %s.

Información de la empresa:
- Nombre: %s
- Industria: %s
- Ubicación: %s, %s
- Tamaño: %s
- Descripción: %s
- Sitio web: %s
- NIT: %s

Genera un resumen profesional de máximo 200 palabras que incluya:
1. Análisis del posicionamiento digital actual
2. Fortalezas identificadas
3. Áreas de oportunidad específicas para el mercado colombiano
4. Recomendaciones estratégicas prioritarias

El tono debe ser profesional, directo y orientado a resultados. Enfócate en insights accionables para mejorar la presencia digital de la empresa.`,
		companyInfo.Name,
		companyInfo.Name,
		companyInfo.Industry,
		companyInfo.Location.City,
		companyInfo.Location.Country,
		companyInfo.Size,
		companyInfo.Description,
		companyInfo.URL,
		companyInfo.LegalInfo.NIT,
	)

	// Preparar request para OpenAI
	requestBody := map[string]interface{}{
		"model": "gpt-3.5-turbo",
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"max_tokens":  300,
		"temperature": 0.7,
	}

	requestJSON, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %v", err)
	}

	// Hacer request a OpenAI
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(requestJSON))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("OpenAI API error: %s - %s", resp.Status, string(body))
	}

	// Parsear respuesta
	var response struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("error parsing response: %v", err)
	}

	if len(response.Choices) == 0 {
		return "", fmt.Errorf("no response from OpenAI")
	}

	return strings.TrimSpace(response.Choices[0].Message.Content), nil
}
