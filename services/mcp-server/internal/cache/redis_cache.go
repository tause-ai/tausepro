package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

// RedisCache maneja el cache y rate limiting
type RedisCache struct {
	client *redis.Client
	ctx    context.Context
}

// NewRedisCache crea una nueva instancia de cache
func NewRedisCache(redisURL string) (*RedisCache, error) {
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("invalid redis URL: %w", err)
	}

	client := redis.NewClient(opt)
	ctx := context.Background()

	// Test connection
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis connection failed: %w", err)
	}

	return &RedisCache{
		client: client,
		ctx:    ctx,
	}, nil
}

// ===== RATE LIMITING =====

// RateLimitConfig configura los límites
type RateLimitConfig struct {
	Key        string        // Clave única (IP, userID, etc)
	Limit      int           // Límite de requests
	Window     time.Duration // Ventana de tiempo
	Identifier string        // Identificador adicional (endpoint, acción)
}

// CheckRateLimit verifica si se puede hacer la request
func (r *RedisCache) CheckRateLimit(config RateLimitConfig) (allowed bool, remaining int, resetAt time.Time, err error) {
	key := fmt.Sprintf("rate_limit:%s:%s", config.Identifier, config.Key)

	// Usar pipeline para operación atómica
	pipe := r.client.Pipeline()

	// Incrementar contador
	incr := pipe.Incr(r.ctx, key)

	// Establecer TTL solo si es la primera vez
	pipe.Expire(r.ctx, key, config.Window)

	// Ejecutar pipeline
	_, err = pipe.Exec(r.ctx)
	if err != nil {
		return false, 0, time.Time{}, err
	}

	// Obtener valor actual
	count := incr.Val()

	// Obtener TTL para calcular reset time
	ttl, err := r.client.TTL(r.ctx, key).Result()
	if err != nil {
		return false, 0, time.Time{}, err
	}

	resetAt = time.Now().Add(ttl)
	remaining = config.Limit - int(count)

	if remaining < 0 {
		remaining = 0
	}

	return count <= int64(config.Limit), remaining, resetAt, nil
}

// AnalysisRateLimit middleware específico para análisis
func (r *RedisCache) AnalysisRateLimit(ip string) (bool, error) {
	config := RateLimitConfig{
		Key:        ip,
		Limit:      3, // 3 análisis
		Window:     time.Hour,
		Identifier: "analysis",
	}

	allowed, _, _, err := r.CheckRateLimit(config)
	return allowed, err
}

// APIRateLimit para llamadas generales de API
func (r *RedisCache) APIRateLimit(tenantID string, plan string) (bool, error) {
	limits := map[string]int{
		"gratis":  100,
		"starter": 5000,
		"growth":  25000,
		"scale":   100000,
	}

	limit, exists := limits[plan]
	if !exists {
		limit = 100 // Default to free tier
	}

	config := RateLimitConfig{
		Key:        tenantID,
		Limit:      limit,
		Window:     30 * 24 * time.Hour, // Monthly
		Identifier: "api_calls",
	}

	allowed, _, _, err := r.CheckRateLimit(config)
	return allowed, err
}

// ===== CACHE DE ANÁLISIS =====

// CacheAnalysis guarda un análisis en cache
func (r *RedisCache) CacheAnalysis(url string, analysis interface{}) error {
	key := r.getAnalysisKey(url)

	// Serializar a JSON
	data, err := json.Marshal(analysis)
	if err != nil {
		return fmt.Errorf("failed to marshal analysis: %w", err)
	}

	// Guardar con TTL de 24 horas
	return r.client.Set(r.ctx, key, data, 24*time.Hour).Err()
}

// GetCachedAnalysis obtiene un análisis del cache
func (r *RedisCache) GetCachedAnalysis(url string, dest interface{}) (bool, error) {
	key := r.getAnalysisKey(url)

	// Obtener del cache
	data, err := r.client.Get(r.ctx, key).Result()
	if err == redis.Nil {
		return false, nil // No existe en cache
	}
	if err != nil {
		return false, err
	}

	// Deserializar
	if err := json.Unmarshal([]byte(data), dest); err != nil {
		return false, fmt.Errorf("failed to unmarshal analysis: %w", err)
	}

	return true, nil
}

// InvalidateAnalysis invalida el cache de un análisis
func (r *RedisCache) InvalidateAnalysis(url string) error {
	key := r.getAnalysisKey(url)
	return r.client.Del(r.ctx, key).Err()
}

// ===== CACHE DE SESIONES =====

// SessionData estructura para datos de sesión
type SessionData struct {
	UserID    string                 `json:"userId"`
	TenantID  string                 `json:"tenantId"`
	Plan      string                 `json:"plan"`
	ExpiresAt time.Time              `json:"expiresAt"`
	Data      map[string]interface{} `json:"data"`
}

// SetSession guarda una sesión
func (r *RedisCache) SetSession(sessionID string, data SessionData) error {
	key := fmt.Sprintf("session:%s", sessionID)

	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	ttl := time.Until(data.ExpiresAt)
	return r.client.Set(r.ctx, key, jsonData, ttl).Err()
}

// GetSession obtiene una sesión
func (r *RedisCache) GetSession(sessionID string) (*SessionData, error) {
	key := fmt.Sprintf("session:%s", sessionID)

	data, err := r.client.Get(r.ctx, key).Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var session SessionData
	if err := json.Unmarshal([]byte(data), &session); err != nil {
		return nil, err
	}

	return &session, nil
}

// ===== CACHE DE RESULTADOS COSTOSOS =====

// CacheResult guarda cualquier resultado con TTL personalizado
func (r *RedisCache) CacheResult(key string, value interface{}, ttl time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return r.client.Set(r.ctx, key, data, ttl).Err()
}

// GetCachedResult obtiene un resultado genérico del cache
func (r *RedisCache) GetCachedResult(key string, dest interface{}) (bool, error) {
	data, err := r.client.Get(r.ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}

	if err := json.Unmarshal([]byte(data), dest); err != nil {
		return false, err
	}

	return true, nil
}

// ===== DISTRIBUTED LOCKS =====

// AcquireLock intenta adquirir un lock distribuido
func (r *RedisCache) AcquireLock(lockKey string, ttl time.Duration) (bool, error) {
	key := fmt.Sprintf("lock:%s", lockKey)

	// SetNX retorna true si la clave no existía
	ok, err := r.client.SetNX(r.ctx, key, "1", ttl).Result()
	return ok, err
}

// ReleaseLock libera un lock
func (r *RedisCache) ReleaseLock(lockKey string) error {
	key := fmt.Sprintf("lock:%s", lockKey)
	return r.client.Del(r.ctx, key).Err()
}

// ===== ANALYTICS COUNTERS =====

// IncrementCounter incrementa un contador
func (r *RedisCache) IncrementCounter(metric string, tags map[string]string) error {
	key := r.buildMetricKey(metric, tags)
	return r.client.Incr(r.ctx, key).Err()
}

// GetCounter obtiene el valor de un contador
func (r *RedisCache) GetCounter(metric string, tags map[string]string) (int64, error) {
	key := r.buildMetricKey(metric, tags)
	return r.client.Get(r.ctx, key).Int64()
}

// ===== UTILIDADES PRIVADAS =====

func (r *RedisCache) getAnalysisKey(url string) string {
	// Normalizar URL para mejor hit rate
	normalized := normalizeURL(url)
	return fmt.Sprintf("analysis:%s", normalized)
}

func (r *RedisCache) buildMetricKey(metric string, tags map[string]string) string {
	key := fmt.Sprintf("metric:%s", metric)
	for k, v := range tags {
		key += fmt.Sprintf(":%s=%s", k, v)
	}
	return key
}

func normalizeURL(url string) string {
	// Implementación simple, mejorar según necesidad
	normalized := url
	normalized = strings.TrimPrefix(normalized, "https://")
	normalized = strings.TrimPrefix(normalized, "http://")
	normalized = strings.TrimPrefix(normalized, "www.")
	normalized = strings.TrimSuffix(normalized, "/")
	return normalized
}

// ===== MIDDLEWARE PARA FIBER =====

// RateLimitMiddleware para Fiber
func RateLimitMiddleware(cache *RedisCache) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Para análisis
		if strings.Contains(c.Path(), "/analysis") {
			allowed, err := cache.AnalysisRateLimit(c.IP())
			if err != nil {
				return c.Status(500).JSON(fiber.Map{
					"error": "Error verificando límites",
				})
			}

			if !allowed {
				return c.Status(429).JSON(fiber.Map{
					"error": "Has alcanzado el límite de análisis. Intenta en 1 hora.",
					"code":  "RATE_LIMIT_EXCEEDED",
				})
			}
		}

		// Para API general (si hay tenant)
		tenantID := c.Locals("tenantID")
		if tenantID != nil {
			plan := c.Locals("plan").(string)
			allowed, err := cache.APIRateLimit(tenantID.(string), plan)
			if err != nil {
				return c.Status(500).JSON(fiber.Map{
					"error": "Error verificando límites",
				})
			}

			if !allowed {
				return c.Status(402).JSON(fiber.Map{
					"error":       "Límite del plan alcanzado. Actualiza tu plan para continuar.",
					"code":        "PLAN_LIMIT_EXCEEDED",
					"upgrade_url": "/upgrade",
				})
			}
		}

		return c.Next()
	}
}

// CacheMiddleware para respuestas
func CacheMiddleware(cache *RedisCache, ttl time.Duration) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Solo cachear GET requests
		if c.Method() != "GET" {
			return c.Next()
		}

		// Generar cache key
		cacheKey := fmt.Sprintf("response:%s:%s", c.Path(), c.Query(""))

		// Buscar en cache
		var cachedResponse map[string]interface{}
		found, err := cache.GetCachedResult(cacheKey, &cachedResponse)
		if err == nil && found {
			return c.JSON(cachedResponse)
		}

		// Continuar con el handler
		err = c.Next()
		if err != nil {
			return err
		}

		// Cachear respuesta exitosa
		if c.Response().StatusCode() == 200 {
			// Parsear body para cachear
			var response map[string]interface{}
			if err := json.Unmarshal(c.Response().Body(), &response); err == nil {
				cache.CacheResult(cacheKey, response, ttl)
			}
		}

		return nil
	}
}
