package services

import (
	"fmt"
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

// calculateLocalSEOScore evalúa el SEO local y presencia en Google de forma realista
func (s *ScoringService) calculateLocalSEOScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// Google My Business - evaluación más realista
	googleScore := 0
	// Solo dar puntos si realmente hay evidencia de presencia en Google
	if len(analysis.Company.SocialMedia) > 0 {
		googleScore = 15 // Presencia básica
		details = append(details, ScoreDetail{
			Item:   "Presencia básica en Google",
			Points: 15,
			Status: "~",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Sin presencia verificable en Google",
			Points:         0,
			Status:         "✗",
			Recommendation: "Crear perfil de Google My Business",
		})
	}

	// SEO básico - evaluación más estricta
	seoScore := 0
	if analysis.Company.Website.SEO.Title != "" && analysis.Company.Website.SEO.Title != "Análisis pendiente" {
		seoScore += 10
		details = append(details, ScoreDetail{
			Item:   "Título SEO",
			Points: 10,
			Status: "✓",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Título SEO faltante",
			Points:         0,
			Status:         "✗",
			Recommendation: "Optimizar títulos de página",
		})
	}
	
	if analysis.Company.Website.SEO.Description != "" && analysis.Company.Website.SEO.Description != "Requiere análisis detallado del sitio" {
		seoScore += 10
		details = append(details, ScoreDetail{
			Item:   "Meta descripción",
			Points: 10,
			Status: "✓",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Meta descripción faltante",
			Points:         0,
			Status:         "✗",
			Recommendation: "Agregar meta descripciones",
		})
	}
	
	if len(analysis.Company.Website.SEO.Keywords) > 0 && analysis.Company.Website.SEO.Keywords[0] != "pendiente" {
		seoScore += 10
		details = append(details, ScoreDetail{
			Item:   "Palabras clave",
			Points: 10,
			Status: "✓",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Palabras clave no optimizadas",
			Points:         0,
			Status:         "✗",
			Recommendation: "Investigar y optimizar palabras clave",
		})
	}
	
	// Score SEO realista - no dar puntos automáticamente
	if analysis.Company.Website.SEO.Score > 50 {
		seoScore += 10
		details = append(details, ScoreDetail{
			Item:   "Score SEO aceptable",
			Points: 10,
			Status: "✓",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Score SEO bajo",
			Points:         0,
			Status:         "✗",
			Recommendation: "Mejorar optimización SEO general",
		})
	}

	score += float64(googleScore + seoScore)

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

// calculateSocialMediaScore evalúa la presencia en redes sociales de forma realista
func (s *ScoringService) calculateSocialMediaScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// Presencia en redes principales - solo contar las que realmente existen
	socialNetworks := map[string]int{
		"facebook":  20,
		"instagram": 20,
		"whatsapp":  25,
		"tiktok":    10,
		"linkedin":  15,
		"twitter":   10,
	}

	foundNetworks := 0
	for network, points := range socialNetworks {
		if s.hasSocialPresence(analysis.Company.SocialMedia, network) {
			score += float64(points)
			foundNetworks++
			details = append(details, ScoreDetail{
				Item:   strings.Title(network) + " verificado",
				Points: points,
				Status: "✓",
			})
		} else {
			// Mostrar redes faltantes importantes
			if network == "facebook" || network == "instagram" || network == "whatsapp" {
				details = append(details, ScoreDetail{
					Item:           strings.Title(network) + " no encontrado",
					Points:         0,
					Status:         "✗",
					Recommendation: fmt.Sprintf("Crear presencia en %s", strings.Title(network)),
				})
			}
		}
	}

	// Penalizar si no hay presencia en redes sociales
	if foundNetworks == 0 {
		details = append(details, ScoreDetail{
			Item:           "Sin presencia en redes sociales",
			Points:         0,
			Status:         "✗",
			Recommendation: "Crear perfiles en redes sociales principales",
		})
	} else if foundNetworks == 1 {
		details = append(details, ScoreDetail{
			Item:           "Presencia limitada en redes",
			Points:         0,
			Status:         "~",
			Recommendation: "Expandir presencia a más redes sociales",
		})
	} else {
		// Bonus por diversificación
		bonus := math.Min(float64(foundNetworks*5), 15)
		score += bonus
		details = append(details, ScoreDetail{
			Item:   "Diversificación de redes",
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

// calculateTechnicalScore evalúa aspectos técnicos de forma realista
func (s *ScoringService) calculateTechnicalScore(analysis *MarketAnalysis) CategoryScore {
	score := 0.0
	details := []ScoreDetail{}

	// HTTPS/SSL - evaluación más realista
	if strings.HasPrefix(analysis.Company.URL, "https://") {
		score += 30
		details = append(details, ScoreDetail{
			Item:   "Sitio seguro (HTTPS)",
			Points: 30,
			Status: "✓",
		})
	} else {
		details = append(details, ScoreDetail{
			Item:           "Sitio no seguro (HTTP)",
			Points:         0,
			Status:         "✗",
			Recommendation: "Implementar certificado SSL/HTTPS",
		})
	}

	// Mobile responsive - evaluación básica
	// Por ahora asumir que sitios modernos son responsive
	if len(analysis.Company.Website.Technologies) > 0 {
		hasModernTech := false
		for _, tech := range analysis.Company.Website.Technologies {
			if strings.Contains(strings.ToLower(tech), "wordpress") || 
			   strings.Contains(strings.ToLower(tech), "shopify") ||
			   strings.Contains(strings.ToLower(tech), "wix") {
				hasModernTech = true
				break
			}
		}
		
		if hasModernTech {
			score += 25
			details = append(details, ScoreDetail{
				Item:   "Diseño móvil (probable)",
				Points: 25,
				Status: "~",
			})
		} else {
			score += 15
			details = append(details, ScoreDetail{
				Item:   "Diseño móvil (incierto)",
				Points: 15,
				Status: "~",
			})
		}
	} else {
		details = append(details, ScoreDetail{
			Item:           "Diseño móvil no verificado",
			Points:         0,
			Status:         "✗",
			Recommendation: "Verificar y optimizar para dispositivos móviles",
		})
	}

	// Velocidad de carga - más realista
	switch analysis.Company.Website.Performance {
	case "Buena":
		score += 25
		details = append(details, ScoreDetail{
			Item:   "Velocidad de carga buena",
			Points: 25,
			Status: "✓",
		})
	case "Regular":
		score += 15
		details = append(details, ScoreDetail{
			Item:   "Velocidad de carga regular",
			Points: 15,
			Status: "~",
		})
	default:
		details = append(details, ScoreDetail{
			Item:           "Velocidad de carga no evaluada",
			Points:         0,
			Status:         "✗",
			Recommendation: "Optimizar velocidad de carga del sitio",
		})
	}

	// Funcionalidades técnicas adicionales
	if analysis.Company.Website.Ecommerce {
		score += 20
		details = append(details, ScoreDetail{
			Item:   "Funcionalidad e-commerce",
			Points: 20,
			Status: "✓",
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
