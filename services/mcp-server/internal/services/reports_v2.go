// services/mcp-server/internal/services/reports_v2.go
package services

import (
	"context"
	"fmt"
	"time"

	"mcp-server/internal/cache"
)

// ReportsV2Service servicio simplificado de reportes para PYMEs
type ReportsV2Service struct {
	analysisService *AnalysisV2Service
	cache           *cache.RedisCache
}

// ReportTypeV2 tipo de reporte
type ReportTypeV2 string

const (
	ReportTypeDigitalAuditV2 ReportTypeV2 = "digital_audit"
	ReportTypeCompetitiveV2  ReportTypeV2 = "competitive"
	ReportTypeColombiaV2     ReportTypeV2 = "colombia"
)

// ReportRequestV2 solicitud de reporte
type ReportRequestV2 struct {
	CompanyURL string       `json:"company_url"`
	ReportType ReportTypeV2 `json:"report_type"`
	Language   string       `json:"language"` // "es" o "en"
}

// ReportResultV2 resultado del reporte
type ReportResultV2 struct {
	ID              string                 `json:"id"`
	CompanyURL      string                 `json:"company_url"`
	ReportType      ReportTypeV2           `json:"report_type"`
	GeneratedAt     time.Time              `json:"generated_at"`
	Content         map[string]interface{} `json:"content"`
	Summary         string                 `json:"summary"`
	Score           int                    `json:"score"` // 0-100
	Recommendations []string               `json:"recommendations"`
}

// NewReportsV2Service crea un nuevo servicio de reportes
func NewReportsV2Service(analysisService *AnalysisV2Service, cache *cache.RedisCache) *ReportsV2Service {
	println("🔧 Creando ReportsV2Service...")
	service := &ReportsV2Service{
		analysisService: analysisService,
		cache:           cache,
	}
	println("✅ ReportsV2Service creado")
	return service
}

// GenerateReportV2 genera un reporte automático simplificado
func (s *ReportsV2Service) GenerateReportV2(ctx context.Context, req *ReportRequestV2) (*ReportResultV2, error) {
	// Analizar la empresa
	companyInfo, err := s.analysisService.AnalyzeCompanyV2(ctx, req.CompanyURL)
	if err != nil {
		return nil, fmt.Errorf("error analizando empresa: %w", err)
	}

	// Generar reporte según el tipo
	var report *ReportResultV2
	switch req.ReportType {
	case ReportTypeDigitalAuditV2:
		report, err = s.generateDigitalAuditV2(ctx, companyInfo, req)
	case ReportTypeCompetitiveV2:
		report, err = s.generateCompetitiveV2(ctx, companyInfo, req)
	case ReportTypeColombiaV2:
		report, err = s.generateColombiaV2(ctx, companyInfo, req)
	default:
		return nil, fmt.Errorf("tipo de reporte no soportado: %s", req.ReportType)
	}

	if err != nil {
		return nil, err
	}

	// Guardar en cache
	s.cache.CacheResult(fmt.Sprintf("report_v2:%s", report.ID), report, 24*time.Hour)

	return report, nil
}

// generateDigitalAuditV2 genera auditoría digital
func (s *ReportsV2Service) generateDigitalAuditV2(ctx context.Context, company *CompanyInfoV2, req *ReportRequestV2) (*ReportResultV2, error) {
	score := s.calculateDigitalScore(company)

	recommendations := []string{
		"Optimizar Google My Business para mejorar visibilidad local",
		"Implementar WhatsApp Business para atención 24/7",
		"Mejorar la experiencia móvil del sitio web",
		"Crear contenido regular en redes sociales",
		"Implementar SEO local para búsquedas orgánicas",
	}

	return &ReportResultV2{
		ID:              generateReportIDV2(),
		CompanyURL:      req.CompanyURL,
		ReportType:      req.ReportType,
		GeneratedAt:     time.Now(),
		Content:         s.generateDigitalContent(company),
		Summary:         fmt.Sprintf("Auditoría digital para %s. Puntuación: %d/100", company.Name, score),
		Score:           score,
		Recommendations: recommendations,
	}, nil
}

// generateCompetitiveV2 genera análisis competitivo
func (s *ReportsV2Service) generateCompetitiveV2(ctx context.Context, company *CompanyInfoV2, req *ReportRequestV2) (*ReportResultV2, error) {
	score := s.calculateCompetitiveScore(company)

	recommendations := []string{
		"Desarrollar propuesta de valor única",
		"Identificar diferenciadores competitivos",
		"Analizar competidores directos",
		"Optimizar precios según el mercado",
		"Mejorar la experiencia del cliente",
	}

	return &ReportResultV2{
		ID:              generateReportIDV2(),
		CompanyURL:      req.CompanyURL,
		ReportType:      req.ReportType,
		GeneratedAt:     time.Now(),
		Content:         s.generateCompetitiveContent(company),
		Summary:         fmt.Sprintf("Análisis competitivo para %s. Puntuación: %d/100", company.Name, score),
		Score:           score,
		Recommendations: recommendations,
	}, nil
}

// generateColombiaV2 genera reporte específico Colombia
func (s *ReportsV2Service) generateColombiaV2(ctx context.Context, company *CompanyInfoV2, req *ReportRequestV2) (*ReportResultV2, error) {
	score := s.calculateColombiaScore(company)

	recommendations := []string{
		"Implementar facturación electrónica DIAN",
		"Integrar métodos de pago locales (PSE, Nequi, DaviPlata)",
		"Optimizar logística con Servientrega, TCC",
		"Cumplir con Ley 1581 de 2012 (Habeas Data)",
		"Configurar IVA y ReteFuente automático",
	}

	return &ReportResultV2{
		ID:              generateReportIDV2(),
		CompanyURL:      req.CompanyURL,
		ReportType:      req.ReportType,
		GeneratedAt:     time.Now(),
		Content:         s.generateColombiaContent(company),
		Summary:         fmt.Sprintf("Reporte Colombia para %s. Puntuación: %d/100", company.Name, score),
		Score:           score,
		Recommendations: recommendations,
	}, nil
}

// Helper functions para calcular puntuaciones
func (s *ReportsV2Service) calculateDigitalScore(company *CompanyInfoV2) int {
	score := 0

	// Website
	if company.Website.Status == "Online" {
		score += 20
	}
	if company.Website.SSL {
		score += 10
	}
	if company.Website.Mobile {
		score += 15
	}

	// Social Media
	if company.SocialMedia.Facebook != nil {
		score += 10
	}
	if company.SocialMedia.Instagram != nil {
		score += 10
	}
	if company.SocialMedia.WhatsApp != nil {
		score += 15
	}

	// Contact
	if len(company.Contact.Phones) > 0 {
		score += 10
	}
	if len(company.Contact.Emails) > 0 {
		score += 10
	}

	return score
}

func (s *ReportsV2Service) calculateCompetitiveScore(company *CompanyInfoV2) int {
	score := 50 // Base

	// Basado en presencia digital
	if company.Website.Status == "Online" {
		score += 10
	}
	if company.SocialMedia.WhatsApp != nil {
		score += 15
	}
	if company.SocialMedia.Facebook != nil {
		score += 10
	}
	if company.SocialMedia.Instagram != nil {
		score += 10
	}

	// Basado en información legal
	if company.LegalInfo.NIT != "" {
		score += 5
	}

	return score
}

func (s *ReportsV2Service) calculateColombiaScore(company *CompanyInfoV2) int {
	score := 0

	// Cumplimiento legal
	if company.LegalInfo.NIT != "" {
		score += 20
	}
	if company.LegalInfo.Status == "Activa" {
		score += 15
	}

	// Métodos de pago locales
	if company.Website.PaymentMethods != nil {
		score += 25
	}

	// WhatsApp Business (muy importante en Colombia)
	if company.SocialMedia.WhatsApp != nil {
		score += 25
	}

	// Presencia local
	if company.Location.City != "" {
		score += 15
	}

	return score
}

// Helper functions para generar contenido
func (s *ReportsV2Service) generateDigitalContent(company *CompanyInfoV2) map[string]interface{} {
	return map[string]interface{}{
		"company_name":    company.Name,
		"website_status":  company.Website.Status,
		"ssl_enabled":     company.Website.SSL,
		"mobile_friendly": company.Website.Mobile,
		"social_media_count": len([]interface{}{
			company.SocialMedia.Facebook,
			company.SocialMedia.Instagram,
			company.SocialMedia.WhatsApp,
		}),
		"contact_info": map[string]interface{}{
			"phones": len(company.Contact.Phones),
			"emails": len(company.Contact.Emails),
		},
	}
}

func (s *ReportsV2Service) generateCompetitiveContent(company *CompanyInfoV2) map[string]interface{} {
	return map[string]interface{}{
		"company_name": company.Name,
		"industry":     company.Industry,
		"digital_presence": map[string]interface{}{
			"website": company.Website.Status == "Online",
			"social_media": len([]interface{}{
				company.SocialMedia.Facebook,
				company.SocialMedia.Instagram,
				company.SocialMedia.WhatsApp,
			}),
		},
		"legal_status": company.LegalInfo.Status,
	}
}

func (s *ReportsV2Service) generateColombiaContent(company *CompanyInfoV2) map[string]interface{} {
	return map[string]interface{}{
		"company_name": company.Name,
		"nit":          company.LegalInfo.NIT,
		"legal_status": company.LegalInfo.Status,
		"location": map[string]interface{}{
			"city":       company.Location.City,
			"department": company.Location.Department,
		},
		"whatsapp_business": company.SocialMedia.WhatsApp != nil,
		"payment_methods":   company.Website.PaymentMethods,
	}
}

// generateReportIDV2 genera ID único para reporte
func generateReportIDV2() string {
	return fmt.Sprintf("report_v2_%d", time.Now().Unix())
}
