package services

import "time"

// AnalysisReport estructura principal para el análisis robusto
type AnalysisReport struct {
	Website          WebsiteInfo
	Contact          ContactInfo
	Products         []string
	Description      string
	Schedule         string
	GoogleBusiness   GoogleBusinessInfo
	Location         Location
	SocialMedia      SocialMediaInfo
	WhatsAppBusiness WhatsAppInfo
	FAQs             []string
	Testimonials     int
	Technical        TechnicalInfo
	LocalDirectories []string
}

// WebsiteInfo información del sitio web
type WebsiteInfo struct {
	URL         string
	LastUpdated time.Time
}

// ContactInfo información de contacto
type ContactInfo struct {
	Phone    string
	Email    string
	WhatsApp string
}

// GoogleBusinessInfo información de Google My Business
type GoogleBusinessInfo struct {
	Claimed       bool
	Rating        float64
	RecentReviews int
}

// Location información de ubicación
type Location struct {
	Street     string
	City       string
	Department string
}

// SocialMediaInfo información de redes sociales
type SocialMediaInfo struct {
	Networks map[string]bool
	Activity map[string]time.Time
}

// WhatsAppInfo información de WhatsApp Business
type WhatsAppInfo struct {
	Active       bool
	ResponseTime int // en minutos
}

// TechnicalInfo información técnica
type TechnicalInfo struct {
	HTTPS            bool
	MobileResponsive bool
	LoadSpeed        float64 // en segundos
}

// DigitalizationScore resultado del scoring de digitalización
type DigitalizationScore struct {
	Total           float64                     `json:"total"`
	Level           string                      `json:"level"`
	Categories      map[string]CategoryScore    `json:"categories"`
	Recommendations []PrioritizedRecommendation `json:"recommendations"`
	Timestamp       time.Time                   `json:"timestamp"`
}

// CategoryScore puntuación por categoría
type CategoryScore struct {
	Name     string        `json:"name"`
	Score    float64       `json:"score"`
	MaxScore float64       `json:"maxScore"`
	Details  []ScoreDetail `json:"details"`
}

// ScoreDetail detalle específico de puntuación
type ScoreDetail struct {
	Item           string `json:"item"`
	Points         int    `json:"points"`
	Status         string `json:"status"` // ✓, ✗, ~
	Recommendation string `json:"recommendation,omitempty"`
}

// PrioritizedRecommendation recomendación priorizada
type PrioritizedRecommendation struct {
	Priority             int    `json:"priority"`
	Category             string `json:"category"`
	Action               string `json:"action"`
	Impact               string `json:"impact"`
	Effort               string `json:"effort"`
	EstimatedImprovement int    `json:"estimatedImprovement"`
}
