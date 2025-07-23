package services

import (
	"math"
	"strings"
	"time"
)

// ScoringService maneja el cálculo de scores de digitalización
type ScoringService struct {
	weights ScoringWeights
}

// ScoringWeights define los pesos para cada categoría
type ScoringWeights struct {
	WebPresence        float64 // 30%
	LocalSEO           float64 // 25%
	SocialMedia        float64 // 20%
	CustomerEngagement float64 // 15%
	Technical          float64 // 10%
}

// NewScoringService crea una nueva instancia con pesos predefinidos
func NewScoringService() *ScoringService {
	return &ScoringService{
		weights: ScoringWeights{
			WebPresence:        0.30,
			LocalSEO:           0.25,
			SocialMedia:        0.20,
			CustomerEngagement: 0.15,
			Technical:          0.10,
		},
	}
}

// CalculateDigitalizationScore calcula el score total de digitalización
func (s *ScoringService) CalculateDigitalizationScore(analysis *MarketAnalysis) *DigitalizationScore {
	score := &DigitalizationScore{
		Total:      0,
		Categories: make(map[string]CategoryScore),
		Timestamp:  time.Now(),
	}

	// 1. Web Presence Score (30%)
	webScore := s.calculateWebPresenceScore(analysis)
	score.Categories["web_presence"] = webScore
	score.Total += webScore.Score * s.weights.WebPresence

	// 2. Local SEO Score (25%)
	localScore := s.calculateLocalSEOScore(analysis)
	score.Categories["local_seo"] = localScore
	score.Total += localScore.Score * s.weights.LocalSEO

	// 3. Social Media Score (20%)
	socialScore := s.calculateSocialMediaScore(analysis)
	score.Categories["social_media"] = socialScore
	score.Total += socialScore.Score * s.weights.SocialMedia

	// 4. Customer Engagement Score (15%)
	engagementScore := s.calculateEngagementScore(analysis)
	score.Categories["engagement"] = engagementScore
	score.Total += engagementScore.Score * s.weights.CustomerEngagement

	// 5. Technical Score (10%)
	techScore := s.calculateTechnicalScore(analysis)
	score.Categories["technical"] = techScore
	score.Total += techScore.Score * s.weights.Technical

	// Redondear score total
	score.Total = math.Round(score.Total)

	// Calcular nivel y recomendaciones
	score.Level = s.getScoreLevel(score.Total)
	score.Recommendations = s.generatePrioritizedRecommendations(score)

	return score
}

// calculateWebPresenceScore evalúa la presencia web del negocio
func (s *ScoringService) calculateWebPresenceScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// Sitio web propio (40 puntos)
	if analysis.Company.URL != "" {
		score += 25
		details = append(details, ScoreDetail{
			Item:   "Sitio web propio",
			Points: 25,
			Status: "✓",
		})

		// Contenido actualizado (15 puntos adicionales)
		if s.isContentFresh(analysis.AnalysisDate) {
			score += 15
			details = append(details, ScoreDetail{
				Item:   "Contenido actualizado",
				Points: 15,
				Status: "✓",
			})
		} else {
			details = append(details, ScoreDetail{
				Item:           "Contenido desactualizado",
				Points:         0,
				Status:         "✗",
				Recommendation: "Actualizar contenido del sitio web",
			})
		}
	} else {
		details = append(details, ScoreDetail{
			Item:           "Sin sitio web propio",
			Points:         0,
			Status:         "✗",
			Recommendation: "Crear sitio web profesional",
		})
	}

	// Información de contacto clara (20 puntos)
	contactScore := 0
	if analysis.Company.SocialMedia["phone"] != "" {
		contactScore += 10
	}
	if analysis.Company.SocialMedia["email"] != "" {
		contactScore += 5
	}
	if analysis.Company.SocialMedia["whatsapp"] != "" {
		contactScore += 5
	}

	score += float64(contactScore)
	details = append(details, ScoreDetail{
		Item:   "Información de contacto",
		Points: contactScore,
		Status: s.getStatus(contactScore, 20),
	})

	// Descripción del negocio (20 puntos)
	if len(analysis.Company.Description) > 50 {
		score += 20
		details = append(details, ScoreDetail{
			Item:   "Descripción del negocio",
			Points: 20,
			Status: "✓",
		})
	}

	// Análisis del sitio web (20 puntos)
	websiteScore := 0
	if analysis.Company.Website.Ecommerce {
		websiteScore += 10
	}
	if analysis.Company.Website.Blog {
		websiteScore += 5
	}
	if analysis.Company.Website.ContactInfo {
		websiteScore += 5
	}

	score += float64(websiteScore)
	if websiteScore > 0 {
		details = append(details, ScoreDetail{
			Item:   "Funcionalidades del sitio",
			Points: websiteScore,
			Status: "✓",
		})
	}

	// Horario visible (10 puntos)
	if analysis.Company.Location != "" {
		score += 10
		details = append(details, ScoreDetail{
			Item:   "Ubicación visible",
			Points: 10,
			Status: "✓",
		})
	}

	return CategoryScore{
		Name:     "Presencia Web",
		Score:    score,
		MaxScore: 100,
		Details:  details,
	}
}

// calculateLocalSEOScore evalúa el SEO local y presencia en Google
func (s *ScoringService) calculateLocalSEOScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// Google My Business (50 puntos) - Simulado por ahora
	// En implementación real, se haría búsqueda en Google
	score += 30
	details = append(details, ScoreDetail{
		Item:   "Presencia en Google",
		Points: 30,
		Status: "✓",
	})

	// SEO básico (40 puntos)
	seoScore := 0
	if analysis.Company.Website.SEO.Title != "" {
		seoScore += 10
	}
	if analysis.Company.Website.SEO.Description != "" {
		seoScore += 10
	}
	if len(analysis.Company.Website.SEO.Keywords) > 0 {
		seoScore += 10
	}
	if analysis.Company.Website.SEO.Score > 70 {
		seoScore += 10
	}

	score += float64(seoScore)
	details = append(details, ScoreDetail{
		Item:   "Optimización SEO",
		Points: seoScore,
		Status: s.getStatus(seoScore, 40),
	})

	// Ubicación y contexto colombiano (30 puntos)
	colombiaScore := 0
	if strings.Contains(strings.ToLower(analysis.Company.Location), "colombia") {
		colombiaScore += 15
	}
	if len(analysis.ColombiaContext.PaymentMethods) > 0 {
		colombiaScore += 15
	}

	score += float64(colombiaScore)
	details = append(details, ScoreDetail{
		Item:   "Contexto colombiano",
		Points: colombiaScore,
		Status: s.getStatus(colombiaScore, 30),
	})

	return CategoryScore{
		Name:     "SEO Local",
		Score:    score,
		MaxScore: 100,
		Details:  details,
	}
}

// calculateSocialMediaScore evalúa la presencia en redes sociales
func (s *ScoringService) calculateSocialMediaScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// Presencia en redes principales
	socialNetworks := map[string]int{
		"facebook":  20,
		"instagram": 20,
		"whatsapp":  25,
		"tiktok":    10,
		"linkedin":  10,
		"youtube":   15,
	}

	for network, points := range socialNetworks {
		if s.hasSocialPresence(analysis.Company.SocialMedia, network) {
			score += float64(points)
			details = append(details, ScoreDetail{
				Item:   strings.Title(network),
				Points: points,
				Status: "✓",
			})
		}
	}

	// Actividad reciente (bonus)
	if s.hasRecentSocialActivity(analysis.Company.SocialMedia) {
		bonus := math.Min(score*0.2, 20) // 20% bonus, max 20 puntos
		score += bonus
		details = append(details, ScoreDetail{
			Item:   "Actividad reciente",
			Points: int(bonus),
			Status: "✓",
		})
	}

	return CategoryScore{
		Name:     "Redes Sociales",
		Score:    math.Min(score, 100),
		MaxScore: 100,
		Details:  details,
	}
}

// calculateEngagementScore evalúa el engagement con clientes
func (s *ScoringService) calculateEngagementScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// WhatsApp Business (40 puntos)
	if analysis.Company.SocialMedia["whatsapp"] != "" {
		score += 25
		details = append(details, ScoreDetail{
			Item:   "WhatsApp Business",
			Points: 25,
			Status: "✓",
		})

		// Respuesta rápida (simulado)
		score += 15
		details = append(details, ScoreDetail{
			Item:   "Respuesta rápida",
			Points: 15,
			Status: "✓",
		})
	}

	// Información de contacto (30 puntos)
	contactScore := 0
	if analysis.Company.Website.ContactInfo {
		contactScore += 30
	}

	score += float64(contactScore)
	details = append(details, ScoreDetail{
		Item:   "Información de contacto",
		Points: contactScore,
		Status: s.getStatus(contactScore, 30),
	})

	// Blog/Contenido (30 puntos)
	if analysis.Company.Website.Blog {
		score += 30
		details = append(details, ScoreDetail{
			Item:   "Blog/Contenido",
			Points: 30,
			Status: "✓",
		})
	}

	return CategoryScore{
		Name:     "Engagement",
		Score:    score,
		MaxScore: 100,
		Details:  details,
	}
}

// calculateTechnicalScore evalúa aspectos técnicos
func (s *ScoringService) calculateTechnicalScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// HTTPS/SSL (30 puntos) - Simulado
	score += 30
	details = append(details, ScoreDetail{
		Item:   "Sitio seguro (HTTPS)",
		Points: 30,
		Status: "✓",
	})

	// Mobile responsive (40 puntos) - Simulado
	score += 40
	details = append(details, ScoreDetail{
		Item:   "Diseño móvil",
		Points: 40,
		Status: "✓",
	})

	// Velocidad de carga (30 puntos)
	if analysis.Company.Website.Performance == "Buena" {
		score += 30
		details = append(details, ScoreDetail{
			Item:   "Carga rápida",
			Points: 30,
			Status: "✓",
		})
	} else {
		score += 15
		details = append(details, ScoreDetail{
			Item:   "Carga moderada",
			Points: 15,
			Status: "~",
		})
	}

	return CategoryScore{
		Name:     "Aspectos Técnicos",
		Score:    score,
		MaxScore: 100,
		Details:  details,
	}
}

// Funciones auxiliares
func (s *ScoringService) isContentFresh(lastUpdated time.Time) bool {
	return time.Since(lastUpdated) < 90*24*time.Hour // 90 días
}

func (s *ScoringService) hasSocialPresence(socialMedia map[string]string, network string) bool {
	_, exists := socialMedia[network]
	return exists
}

func (s *ScoringService) hasRecentSocialActivity(socialMedia map[string]string) bool {
	// Simulado por ahora - en implementación real verificaría timestamps
	return len(socialMedia) > 0
}

func (s *ScoringService) getStatus(current, max int) string {
	percentage := float64(current) / float64(max)
	if percentage >= 0.8 {
		return "✓"
	} else if percentage >= 0.5 {
		return "~"
	}
	return "✗"
}

func (s *ScoringService) getScoreLevel(score float64) string {
	switch {
	case score >= 80:
		return "Excelente"
	case score >= 60:
		return "Bueno"
	case score >= 40:
		return "Regular"
	case score >= 20:
		return "Básico"
	default:
		return "Inicial"
	}
}

func (s *ScoringService) generatePrioritizedRecommendations(score *DigitalizationScore) []PrioritizedRecommendation {
	recommendations := []PrioritizedRecommendation{}

	// Analizar cada categoría y generar recomendaciones
	for category, catScore := range score.Categories {
		if catScore.Score < catScore.MaxScore*0.6 {
			// Esta categoría necesita mejora
			switch category {
			case "web_presence":
				if catScore.Score < 25 {
					recommendations = append(recommendations, PrioritizedRecommendation{
						Priority:             1,
						Category:             "Presencia Web",
						Action:               "Crear sitio web profesional",
						Impact:               "Alto",
						Effort:               "Medio",
						EstimatedImprovement: 25,
					})
				}
			case "local_seo":
				if catScore.Score < 30 {
					recommendations = append(recommendations, PrioritizedRecommendation{
						Priority:             2,
						Category:             "SEO Local",
						Action:               "Reclamar y optimizar Google My Business",
						Impact:               "Alto",
						Effort:               "Bajo",
						EstimatedImprovement: 30,
					})
				}
			case "engagement":
				if catScore.Score < 25 {
					recommendations = append(recommendations, PrioritizedRecommendation{
						Priority:             3,
						Category:             "Engagement",
						Action:               "Activar WhatsApp Business con respuesta automática",
						Impact:               "Alto",
						Effort:               "Bajo",
						EstimatedImprovement: 25,
					})
				}
			}
		}
	}

	return recommendations
}
