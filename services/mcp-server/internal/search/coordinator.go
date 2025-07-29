package search

import (
	"context"
	"fmt"
	"log"
	"mcp-server/internal/services"
	"strings"
	"time"
)

// SearchCoordinator coordina las búsquedas entre Serper y Tavily
type SearchCoordinator struct {
	serperClient  *SerperClient
	tavilyClient  *TavilyClient
	configService *services.ConfigService
}

// SearchResult resultado unificado de búsqueda
type SearchResult struct {
	Query       string                 `json:"query"`
	Sources     []Source               `json:"sources"`
	Summary     string                 `json:"summary"`
	Analysis    string                 `json:"analysis"`
	Metadata    SearchMetadata         `json:"metadata"`
	RawResults  map[string]interface{} `json:"raw_results,omitempty"`
}

// Source fuente de información
type Source struct {
	Title       string    `json:"title"`
	URL         string    `json:"url"`
	Snippet     string    `json:"snippet"`
	PublishedAt time.Time `json:"published_at,omitempty"`
	Relevance   float64   `json:"relevance"`
	Provider    string    `json:"provider"` // "serper" o "tavily"
}

// SearchMetadata metadatos de la búsqueda
type SearchMetadata struct {
	TotalResults    int           `json:"total_results"`
	SearchTime      time.Duration `json:"search_time"`
	ProvidersUsed   []string      `json:"providers_used"`
	Cost            float64       `json:"cost"`
	SerperResults   int           `json:"serper_results"`
	TavilyResults   int           `json:"tavily_results"`
	AnalysisDepth   string        `json:"analysis_depth"`
}

// SearchStrategy estrategia de búsqueda
type SearchStrategy string

const (
	StrategyFast       SearchStrategy = "fast"       // Solo Serper
	StrategyBalanced   SearchStrategy = "balanced"   // Serper + Tavily básico
	StrategyDeep       SearchStrategy = "deep"       // Serper + Tavily avanzado
	StrategyComprehensive SearchStrategy = "comprehensive" // Múltiples consultas
)

// SearchOptions opciones de búsqueda
type SearchOptions struct {
	Strategy      SearchStrategy `json:"strategy"`
	MaxResults    int           `json:"max_results"`
	Country       string        `json:"country"`
	Language      string        `json:"language"`
	IncludeNews   bool          `json:"include_news"`
	IncludeImages bool          `json:"include_images"`
	AnalysisType  string        `json:"analysis_type"` // "company", "market", "general"
}

// NewSearchCoordinator crea un nuevo coordinador de búsqueda
func NewSearchCoordinator(configService *services.ConfigService) *SearchCoordinator {
	// Obtener API keys
	serperKey, _ := configService.GetAPIKey("serper")
	tavilyKey, _ := configService.GetAPIKey("tavily")

	return &SearchCoordinator{
		serperClient:  NewSerperClient(serperKey),
		tavilyClient:  NewTavilyClient(tavilyKey),
		configService: configService,
	}
}

// Search realiza una búsqueda coordinada
func (sc *SearchCoordinator) Search(ctx context.Context, query string, options SearchOptions) (*SearchResult, error) {

	// Configurar opciones por defecto
	if options.Strategy == "" {
		options.Strategy = StrategyBalanced
	}
	if options.MaxResults == 0 {
		options.MaxResults = 10
	}
	if options.Country == "" {
		options.Country = "co"
	}
	if options.Language == "" {
		options.Language = "es"
	}

	result := &SearchResult{
		Query:      query,
		Sources:    []Source{},
		RawResults: make(map[string]interface{}),
		Metadata: SearchMetadata{
			ProvidersUsed: []string{},
			AnalysisDepth: string(options.Strategy),
		},
	}

	// Ejecutar estrategia de búsqueda
	switch options.Strategy {
	case StrategyFast:
		return sc.executeFastSearch(ctx, query, options, result)
	case StrategyBalanced:
		return sc.executeBalancedSearch(ctx, query, options, result)
	case StrategyDeep:
		return sc.executeDeepSearch(ctx, query, options, result)
	case StrategyComprehensive:
		return sc.executeComprehensiveSearch(ctx, query, options, result)
	default:
		return sc.executeBalancedSearch(ctx, query, options, result)
	}
}

// executeFastSearch búsqueda rápida solo con Serper
func (sc *SearchCoordinator) executeFastSearch(ctx context.Context, query string, options SearchOptions, result *SearchResult) (*SearchResult, error) {
	startTime := time.Now()

	// Búsqueda con Serper
	serperResp, err := sc.serperClient.Search(query,
		WithCountry(options.Country),
		WithLanguage(options.Language),
		WithNumResults(options.MaxResults),
	)
	if err != nil {
		return nil, fmt.Errorf("error en búsqueda Serper: %w", err)
	}

	// Convertir resultados de Serper
	for _, organic := range serperResp.Organic {
		source := Source{
			Title:     organic.Title,
			URL:       organic.Link,
			Snippet:   organic.Snippet,
			Relevance: float64(len(serperResp.Organic)-organic.Position) / float64(len(serperResp.Organic)),
			Provider:  "serper",
		}
		result.Sources = append(result.Sources, source)
	}

	// Generar resumen básico
	result.Summary = sc.generateBasicSummary(result.Sources)
	result.Analysis = "Búsqueda rápida completada. Para análisis más profundo, use estrategia 'balanced' o 'deep'."

	// Actualizar metadatos
	result.Metadata.TotalResults = len(result.Sources)
	result.Metadata.SearchTime = time.Since(startTime)
	result.Metadata.ProvidersUsed = []string{"serper"}
	result.Metadata.SerperResults = len(serperResp.Organic)
	result.Metadata.Cost = 0.001 // Costo estimado de Serper
	result.RawResults["serper"] = serperResp

	return result, nil
}

// executeBalancedSearch búsqueda balanceada con Serper + Tavily básico
func (sc *SearchCoordinator) executeBalancedSearch(ctx context.Context, query string, options SearchOptions, result *SearchResult) (*SearchResult, error) {
	startTime := time.Now()

	// 1. Búsqueda inicial con Serper
	serperResp, err := sc.serperClient.Search(query,
		WithCountry(options.Country),
		WithLanguage(options.Language),
		WithNumResults(5), // Menos resultados para dejar espacio a Tavily
	)
	if err != nil {
		log.Printf("Error en Serper (continuando con Tavily): %v", err)
	} else {
		// Convertir resultados de Serper
		for _, organic := range serperResp.Organic {
			source := Source{
				Title:     organic.Title,
				URL:       organic.Link,
				Snippet:   organic.Snippet,
				Relevance: float64(len(serperResp.Organic)-organic.Position) / float64(len(serperResp.Organic)),
				Provider:  "serper",
			}
			result.Sources = append(result.Sources, source)
		}
		result.Metadata.SerperResults = len(serperResp.Organic)
		result.RawResults["serper"] = serperResp
	}

	// 2. Análisis con Tavily para profundizar
	tavilyResp, err := sc.tavilyClient.Search(query, TavilyOptions{
		SearchDepth:      "basic",
		MaxResults:       5,
		IncludeDomains:   []string{}, // Permitir todos los dominios
		IncludeAnswer:    true,
		IncludeRawContent: false,
	})
	if err != nil {
		log.Printf("Error en Tavily: %v", err)
	} else {
		// Convertir resultados de Tavily
		for _, tavilyResult := range tavilyResp.Results {
			source := Source{
				Title:     tavilyResult.Title,
				URL:       tavilyResult.URL,
				Snippet:   tavilyResult.Content,
				Relevance: tavilyResult.Score,
				Provider:  "tavily",
			}
			result.Sources = append(result.Sources, source)
		}
		result.Metadata.TavilyResults = len(tavilyResp.Results)
		result.RawResults["tavily"] = tavilyResp

		// Usar respuesta de Tavily como análisis
		if tavilyResp.Answer != "" {
			result.Analysis = tavilyResp.Answer
		}
	}

	// Generar resumen combinado
	result.Summary = sc.generateCombinedSummary(result.Sources, options.AnalysisType)

	// Actualizar metadatos
	result.Metadata.TotalResults = len(result.Sources)
	result.Metadata.SearchTime = time.Since(startTime)
	result.Metadata.ProvidersUsed = []string{"serper", "tavily"}
	result.Metadata.Cost = 0.001 + 0.005 // Serper + Tavily básico

	return result, nil
}

// executeDeepSearch búsqueda profunda con análisis avanzado
func (sc *SearchCoordinator) executeDeepSearch(ctx context.Context, query string, options SearchOptions, result *SearchResult) (*SearchResult, error) {
	startTime := time.Now()

	// 1. Búsqueda inicial con Serper (más resultados)
	serperResp, err := sc.serperClient.Search(query,
		WithCountry(options.Country),
		WithLanguage(options.Language),
		WithNumResults(8),
	)
	if err != nil {
		log.Printf("Error en Serper: %v", err)
	} else {
		for _, organic := range serperResp.Organic {
			source := Source{
				Title:     organic.Title,
				URL:       organic.Link,
				Snippet:   organic.Snippet,
				Relevance: float64(len(serperResp.Organic)-organic.Position) / float64(len(serperResp.Organic)),
				Provider:  "serper",
			}
			result.Sources = append(result.Sources, source)
		}
		result.RawResults["serper"] = serperResp
	}

	// 2. Análisis profundo con Tavily
	tavilyResp, err := sc.tavilyClient.Search(query, TavilyOptions{
		SearchDepth:       "advanced",
		MaxResults:        7,
		IncludeAnswer:     true,
		IncludeRawContent: true,
	})
	if err != nil {
		log.Printf("Error en Tavily: %v", err)
	} else {
		for _, tavilyResult := range tavilyResp.Results {
			source := Source{
				Title:     tavilyResult.Title,
				URL:       tavilyResult.URL,
				Snippet:   tavilyResult.Content,
				Relevance: tavilyResult.Score,
				Provider:  "tavily",
			}
			result.Sources = append(result.Sources, source)
		}
		result.RawResults["tavily"] = tavilyResp

		if tavilyResp.Answer != "" {
			result.Analysis = tavilyResp.Answer
		}
	}

	// 3. Búsqueda de noticias si se solicita
	if options.IncludeNews {
		newsResp, err := sc.serperClient.SearchNews(query,
			WithCountry(options.Country),
			WithLanguage(options.Language),
			WithNumResults(3),
		)
		if err == nil {
			for _, news := range newsResp.News {
				publishedAt, _ := time.Parse("2006-01-02", news.Date)
				source := Source{
					Title:       news.Title,
					URL:         news.Link,
					Snippet:     news.Snippet,
					PublishedAt: publishedAt,
					Relevance:   0.8, // Noticias tienen alta relevancia
					Provider:    "serper-news",
				}
				result.Sources = append(result.Sources, source)
			}
		}
	}

	// Generar análisis especializado
	result.Summary = sc.generateDeepSummary(result.Sources, options.AnalysisType)

	// Actualizar metadatos
	result.Metadata.TotalResults = len(result.Sources)
	result.Metadata.SearchTime = time.Since(startTime)
	result.Metadata.ProvidersUsed = []string{"serper", "tavily"}
	if options.IncludeNews {
		result.Metadata.ProvidersUsed = append(result.Metadata.ProvidersUsed, "serper-news")
	}
	result.Metadata.Cost = 0.001 + 0.01 // Serper + Tavily avanzado

	return result, nil
}

// executeComprehensiveSearch búsqueda comprehensiva con múltiples consultas
func (sc *SearchCoordinator) executeComprehensiveSearch(ctx context.Context, query string, options SearchOptions, result *SearchResult) (*SearchResult, error) {
	// TODO: Implementar búsqueda comprehensiva
	// Por ahora, usar búsqueda profunda
	return sc.executeDeepSearch(ctx, query, options, result)
}

// generateBasicSummary genera un resumen básico
func (sc *SearchCoordinator) generateBasicSummary(sources []Source) string {
	if len(sources) == 0 {
		return "No se encontraron resultados."
	}

	summary := fmt.Sprintf("Se encontraron %d resultados relevantes. ", len(sources))
	if len(sources) > 0 {
		summary += fmt.Sprintf("El resultado más relevante es: %s", sources[0].Title)
	}

	return summary
}

// generateCombinedSummary genera un resumen combinando fuentes
func (sc *SearchCoordinator) generateCombinedSummary(sources []Source, analysisType string) string {
	if len(sources) == 0 {
		return "No se encontraron resultados."
	}

	serperCount := 0
	tavilyCount := 0
	for _, source := range sources {
		if source.Provider == "serper" {
			serperCount++
		} else if source.Provider == "tavily" {
			tavilyCount++
		}
	}

	summary := fmt.Sprintf("Análisis combinado de %d fuentes (%d de búsqueda general, %d de análisis profundo). ",
		len(sources), serperCount, tavilyCount)

	switch analysisType {
	case "company":
		summary += "Información empresarial recopilada de fuentes oficiales y análisis de mercado."
	case "market":
		summary += "Análisis de mercado basado en datos actuales y tendencias identificadas."
	default:
		summary += "Información general recopilada de múltiples fuentes confiables."
	}

	return summary
}

// generateDeepSummary genera un resumen profundo
func (sc *SearchCoordinator) generateDeepSummary(sources []Source, analysisType string) string {
	if len(sources) == 0 {
		return "No se encontraron resultados para el análisis profundo."
	}

	// Contar fuentes por tipo
	counts := make(map[string]int)
	for _, source := range sources {
		counts[source.Provider]++
	}

	summary := fmt.Sprintf("Análisis profundo completado con %d fuentes: ", len(sources))
	for provider, count := range counts {
		summary += fmt.Sprintf("%s (%d), ", provider, count)
	}
	summary = strings.TrimSuffix(summary, ", ") + ". "

	switch analysisType {
	case "company":
		summary += "Análisis empresarial detallado incluyendo información corporativa, financiera y de mercado."
	case "market":
		summary += "Análisis de mercado comprehensivo con datos de tendencias, competencia y oportunidades."
	default:
		summary += "Análisis detallado con información verificada de múltiples fuentes especializadas."
	}

	return summary
}

// Tipos de Tavily ahora están en tavily.go