package tenant

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"sync"
	"time"

	"mcp-server/internal/cache"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

// TenantManager gestiona la lógica multi-tenant
type TenantManager struct {
	db          *sql.DB
	cache       *cache.RedisCache
	configCache sync.Map // Cache en memoria para configuraciones
	tenantPool  *TenantConnectionPool
}

// Tenant representa un tenant en el sistema
type Tenant struct {
	ID          string                 `json:"id"`
	Subdomain   string                 `json:"subdomain"`
	CompanyName string                 `json:"companyName"`
	Plan        string                 `json:"plan"`
	Status      string                 `json:"status"` // active, suspended, trial
	Config      TenantConfig           `json:"config"`
	Limits      TenantLimits           `json:"limits"`
	CreatedAt   time.Time              `json:"createdAt"`
	Metadata    map[string]interface{} `json:"metadata"`
}

// TenantConfig configuración específica del tenant
type TenantConfig struct {
	Features       map[string]bool              `json:"features"`
	Branding       BrandingConfig               `json:"branding"`
	Integrations   map[string]IntegrationConfig `json:"integrations"`
	CustomDomain   string                       `json:"customDomain,omitempty"`
	DataRetention  int                          `json:"dataRetention"`  // días
	IsolationLevel string                       `json:"isolationLevel"` // shared, dedicated
}

// BrandingConfig configuración de marca
type BrandingConfig struct {
	LogoURL      string `json:"logoUrl"`
	PrimaryColor string `json:"primaryColor"`
	CompanyName  string `json:"companyName"`
}

// IntegrationConfig configuración de integración
type IntegrationConfig struct {
	Enabled bool                   `json:"enabled"`
	Config  map[string]interface{} `json:"config"`
}

// TenantLimits límites según el plan
type TenantLimits struct {
	MaxUsers            int            `json:"maxUsers"`
	MaxAPICallsMonthly  int            `json:"maxApiCallsMonthly"`
	MaxMCPAgents        int            `json:"maxMcpAgents"`
	MaxWhatsAppMessages int            `json:"maxWhatsappMessages"`
	StorageGB           float64        `json:"storageGb"`
	CustomLimits        map[string]int `json:"customLimits"`
}

// CreateTenantInput input para crear tenant
type CreateTenantInput struct {
	Subdomain   string `json:"subdomain"`
	CompanyName string `json:"companyName"`
	Plan        string `json:"plan"`
	Email       string `json:"email"`
}

// NewTenantManager crea un nuevo gestor de tenants
func NewTenantManager(db *sql.DB, cache *cache.RedisCache) *TenantManager {
	return &TenantManager{
		db:         db,
		cache:      cache,
		tenantPool: NewTenantConnectionPool(),
	}
}

// ===== IDENTIFICACIÓN DE TENANT =====

// IdentifyTenant identifica el tenant desde la request
func (tm *TenantManager) IdentifyTenant(c *fiber.Ctx) (*Tenant, error) {
	// Prioridad 1: Header X-Tenant-ID (para APIs)
	if tenantID := c.Get("X-Tenant-ID"); tenantID != "" {
		return tm.GetTenantByID(c.Context(), tenantID)
	}

	// Prioridad 2: Subdomain
	if tenant := tm.identifyBySubdomain(c); tenant != nil {
		return tenant, nil
	}

	// Prioridad 3: Custom domain
	if tenant := tm.identifyByCustomDomain(c); tenant != nil {
		return tenant, nil
	}

	// Prioridad 4: JWT Token
	if tenant := tm.identifyByToken(c); tenant != nil {
		return tenant, nil
	}

	return nil, fmt.Errorf("tenant not identified")
}

// identifyBySubdomain identifica por subdomain
func (tm *TenantManager) identifyBySubdomain(c *fiber.Ctx) *Tenant {
	host := c.Hostname()

	// Extraer subdomain
	parts := strings.Split(host, ".")
	if len(parts) < 2 {
		return nil
	}

	subdomain := parts[0]

	// Ignorar www y otros subdominios del sistema
	systemSubdomains := []string{"www", "api", "app", "admin"}
	for _, sys := range systemSubdomains {
		if subdomain == sys {
			return nil
		}
	}

	tenant, err := tm.GetTenantBySubdomain(c.Context(), subdomain)
	if err != nil {
		return nil
	}

	return tenant
}

// identifyByCustomDomain identifica por dominio personalizado
func (tm *TenantManager) identifyByCustomDomain(c *fiber.Ctx) *Tenant {
	host := c.Hostname()

	// Buscar tenant por custom domain
	query := `SELECT id FROM tenants WHERE config->>'customDomain' = $1 AND status != 'deleted'`
	var tenantID string
	err := tm.db.QueryRowContext(c.Context(), query, host).Scan(&tenantID)
	if err != nil {
		return nil
	}

	tenant, err := tm.GetTenantByID(c.Context(), tenantID)
	if err != nil {
		return nil
	}
	return tenant
}

// identifyByToken identifica por JWT token
func (tm *TenantManager) identifyByToken(c *fiber.Ctx) *Tenant {
	// Extraer token del header
	token := c.Get("Authorization")
	if token == "" {
		return nil
	}

	// Remover "Bearer " prefix
	token = strings.TrimPrefix(token, "Bearer ")

	// TODO: Implementar JWT parsing y extraer tenant_id
	// Por ahora, retornar nil
	return nil
}

// ===== GESTIÓN DE DATOS =====

// GetTenantByID obtiene tenant por ID con cache
func (tm *TenantManager) GetTenantByID(ctx context.Context, tenantID string) (*Tenant, error) {
	// Check cache primero
	cacheKey := fmt.Sprintf("tenant:id:%s", tenantID)

	var tenant Tenant
	found, err := tm.cache.GetCachedResult(cacheKey, &tenant)
	if err == nil && found {
		return &tenant, nil
	}

	// Query DB
	query := `
		SELECT id, subdomain, company_name, plan, status, config, limits, created_at, metadata
		FROM tenants 
		WHERE id = $1 AND status != 'deleted'
	`

	var configJSON, limitsJSON, metadataJSON []byte
	err = tm.db.QueryRowContext(ctx, query, tenantID).Scan(
		&tenant.ID,
		&tenant.Subdomain,
		&tenant.CompanyName,
		&tenant.Plan,
		&tenant.Status,
		&configJSON,
		&limitsJSON,
		&tenant.CreatedAt,
		&metadataJSON,
	)

	if err != nil {
		return nil, err
	}

	// Parsear JSON
	if err := json.Unmarshal(configJSON, &tenant.Config); err != nil {
		return nil, fmt.Errorf("error parsing config: %w", err)
	}
	if err := json.Unmarshal(limitsJSON, &tenant.Limits); err != nil {
		return nil, fmt.Errorf("error parsing limits: %w", err)
	}
	if err := json.Unmarshal(metadataJSON, &tenant.Metadata); err != nil {
		return nil, fmt.Errorf("error parsing metadata: %w", err)
	}

	// Cache resultado
	tm.cache.CacheResult(cacheKey, tenant, 5*time.Minute)

	return &tenant, nil
}

// GetTenantBySubdomain obtiene tenant por subdomain
func (tm *TenantManager) GetTenantBySubdomain(ctx context.Context, subdomain string) (*Tenant, error) {
	query := `
		SELECT id, subdomain, company_name, plan, status, config, limits, created_at, metadata
		FROM tenants 
		WHERE subdomain = $1 AND status != 'deleted'
	`

	var configJSON, limitsJSON, metadataJSON []byte
	var tenant Tenant
	err := tm.db.QueryRowContext(ctx, query, subdomain).Scan(
		&tenant.ID,
		&tenant.Subdomain,
		&tenant.CompanyName,
		&tenant.Plan,
		&tenant.Status,
		&configJSON,
		&limitsJSON,
		&tenant.CreatedAt,
		&metadataJSON,
	)

	if err != nil {
		return nil, err
	}

	// Parsear JSON
	if err := json.Unmarshal(configJSON, &tenant.Config); err != nil {
		return nil, fmt.Errorf("error parsing config: %w", err)
	}
	if err := json.Unmarshal(limitsJSON, &tenant.Limits); err != nil {
		return nil, fmt.Errorf("error parsing limits: %w", err)
	}
	if err := json.Unmarshal(metadataJSON, &tenant.Metadata); err != nil {
		return nil, fmt.Errorf("error parsing metadata: %w", err)
	}

	return &tenant, nil
}

// ===== AISLAMIENTO DE DATOS =====

// WithTenantContext añade contexto del tenant
func (tm *TenantManager) WithTenantContext(ctx context.Context, tenant *Tenant) context.Context {
	ctx = context.WithValue(ctx, "tenantID", tenant.ID)
	ctx = context.WithValue(ctx, "tenantPlan", tenant.Plan)
	ctx = context.WithValue(ctx, "tenantLimits", tenant.Limits)
	return ctx
}

// GetTenantDB obtiene conexión específica del tenant
func (tm *TenantManager) GetTenantDB(tenant *Tenant) (*sql.DB, error) {
	// Para tenants con aislamiento dedicado
	if tenant.Config.IsolationLevel == "dedicated" {
		return tm.tenantPool.GetConnection(tenant.ID)
	}

	// Para tenants compartidos, usar DB principal con filtros
	return tm.db, nil
}

// ===== MIDDLEWARE =====

// TenantMiddleware middleware para identificar y validar tenant
func (tm *TenantManager) TenantMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Identificar tenant
		tenant, err := tm.IdentifyTenant(c)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{
				"error": "Tenant no encontrado",
				"code":  "TENANT_NOT_FOUND",
			})
		}

		// Validar estado del tenant
		if tenant.Status == "suspended" {
			return c.Status(403).JSON(fiber.Map{
				"error": "Cuenta suspendida. Contacta soporte.",
				"code":  "TENANT_SUSPENDED",
			})
		}

		// Añadir al contexto
		c.Locals("tenant", tenant)
		c.Locals("tenantID", tenant.ID)
		c.Locals("plan", tenant.Plan)

		// Añadir headers de respuesta
		c.Set("X-Tenant-ID", tenant.ID)

		return c.Next()
	}
}

// ===== QUERIES CON AISLAMIENTO =====

// TenantQueryBuilder construye queries con filtros de tenant
type TenantQueryBuilder struct {
	tenantID  string
	baseQuery string
}

// NewQueryBuilder crea un nuevo builder
func (tm *TenantManager) NewQueryBuilder(tenantID string) *TenantQueryBuilder {
	return &TenantQueryBuilder{
		tenantID: tenantID,
	}
}

// Build construye la query con filtro de tenant
func (qb *TenantQueryBuilder) Build(query string, args ...interface{}) (string, []interface{}) {
	// Añadir filtro de tenant automáticamente
	if !strings.Contains(strings.ToLower(query), "tenant_id") {
		if strings.Contains(strings.ToLower(query), "where") {
			query += " AND tenant_id = ?"
		} else {
			query += " WHERE tenant_id = ?"
		}
		args = append(args, qb.tenantID)
	}

	return query, args
}

// ===== POOL DE CONEXIONES =====

// TenantConnectionPool gestiona conexiones dedicadas
type TenantConnectionPool struct {
	connections sync.Map
	mu          sync.RWMutex
}

func NewTenantConnectionPool() *TenantConnectionPool {
	return &TenantConnectionPool{}
}

func (p *TenantConnectionPool) GetConnection(tenantID string) (*sql.DB, error) {
	// Buscar conexión existente
	if conn, ok := p.connections.Load(tenantID); ok {
		return conn.(*sql.DB), nil
	}

	// Crear nueva conexión
	p.mu.Lock()
	defer p.mu.Unlock()

	// Double-check
	if conn, ok := p.connections.Load(tenantID); ok {
		return conn.(*sql.DB), nil
	}

	// Crear conexión dedicada
	connStr := fmt.Sprintf("postgres://user:pass@localhost:5432/tenant_%s?sslmode=disable", tenantID)
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Configurar pool
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	p.connections.Store(tenantID, db)

	return db, nil
}

// ===== GESTIÓN DE FEATURES =====

// HasFeature verifica si el tenant tiene una feature habilitada
func (tenant *Tenant) HasFeature(feature string) bool {
	if enabled, exists := tenant.Config.Features[feature]; exists {
		return enabled
	}

	// Features por defecto según plan
	defaultFeatures := map[string]map[string]bool{
		"gratis": {
			"whatsapp_basic":  true,
			"analytics_basic": true,
			"analysis_basic":  true,
		},
		"starter": {
			"whatsapp_basic":     true,
			"whatsapp_advanced":  true,
			"analytics_basic":    true,
			"analytics_advanced": true,
			"api_access":         true,
			"analysis_advanced":  true,
		},
		"growth": {
			"whatsapp_basic":     true,
			"whatsapp_advanced":  true,
			"analytics_basic":    true,
			"analytics_advanced": true,
			"api_access":         true,
			"custom_branding":    true,
			"multiple_agents":    true,
			"analysis_advanced":  true,
		},
		"scale": {
			"all": true, // Todas las features
		},
	}

	planFeatures, exists := defaultFeatures[tenant.Plan]
	if !exists {
		return false
	}

	// Plan scale tiene todo
	if all, ok := planFeatures["all"]; ok && all {
		return true
	}

	return planFeatures[feature]
}

// ===== AUDITORÍA Y LOGS =====

// AuditLog registra acciones del tenant
type AuditLog struct {
	TenantID  string                 `json:"tenantId"`
	UserID    string                 `json:"userId"`
	Action    string                 `json:"action"`
	Resource  string                 `json:"resource"`
	Details   map[string]interface{} `json:"details"`
	IP        string                 `json:"ip"`
	UserAgent string                 `json:"userAgent"`
	Timestamp time.Time              `json:"timestamp"`
}

// LogAction registra una acción
func (tm *TenantManager) LogAction(ctx context.Context, log AuditLog) error {
	detailsJSON, _ := json.Marshal(log.Details)

	query := `
		INSERT INTO audit_logs (tenant_id, user_id, action, resource, details, ip, user_agent, timestamp)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	_, err := tm.db.ExecContext(ctx, query,
		log.TenantID,
		log.UserID,
		log.Action,
		log.Resource,
		detailsJSON,
		log.IP,
		log.UserAgent,
		log.Timestamp,
	)

	return err
}

// ===== LÍMITES Y QUOTAS =====

// CheckLimit verifica si el tenant puede realizar una acción
func (tm *TenantManager) CheckLimit(ctx context.Context, tenantID string, resource string) (bool, error) {
	tenant, err := tm.GetTenantByID(ctx, tenantID)
	if err != nil {
		return false, err
	}

	// Verificar límites específicos
	switch resource {
	case "api_calls":
		count, _ := tm.cache.GetCounter("api_calls", map[string]string{"tenant": tenantID})
		return count < int64(tenant.Limits.MaxAPICallsMonthly), nil

	case "mcp_agents":
		// Query actual count from DB
		var count int
		query := "SELECT COUNT(*) FROM mcp_agents WHERE tenant_id = $1"
		tm.db.QueryRowContext(ctx, query, tenantID).Scan(&count)
		return count < tenant.Limits.MaxMCPAgents, nil

	case "whatsapp_messages":
		count, _ := tm.cache.GetCounter("whatsapp_messages", map[string]string{"tenant": tenantID})
		return count < int64(tenant.Limits.MaxWhatsAppMessages), nil

	default:
		// Check custom limits
		if limit, exists := tenant.Limits.CustomLimits[resource]; exists {
			count, _ := tm.cache.GetCounter(resource, map[string]string{"tenant": tenantID})
			return count < int64(limit), nil
		}
	}

	return true, nil
}

// ===== MIGRACIÓN Y ONBOARDING =====

// CreateTenant crea un nuevo tenant
func (tm *TenantManager) CreateTenant(ctx context.Context, input CreateTenantInput) (*Tenant, error) {
	tenant := &Tenant{
		ID:          generateTenantID(),
		Subdomain:   input.Subdomain,
		CompanyName: input.CompanyName,
		Plan:        "trial",
		Status:      "active",
		CreatedAt:   time.Now(),
		Config:      getDefaultConfig(),
		Limits:      getDefaultLimits("trial"),
		Metadata:    make(map[string]interface{}),
	}

	// Transacción para crear tenant
	tx, err := tm.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	// Serializar config y limits
	configJSON, _ := json.Marshal(tenant.Config)
	limitsJSON, _ := json.Marshal(tenant.Limits)
	metadataJSON, _ := json.Marshal(tenant.Metadata)

	// Insertar tenant
	query := `
		INSERT INTO tenants (id, subdomain, company_name, plan, status, config, limits, created_at, metadata)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err = tx.ExecContext(ctx, query,
		tenant.ID,
		tenant.Subdomain,
		tenant.CompanyName,
		tenant.Plan,
		tenant.Status,
		configJSON,
		limitsJSON,
		tenant.CreatedAt,
		metadataJSON,
	)

	if err != nil {
		return nil, err
	}

	// Crear esquema o base de datos dedicada si es necesario
	if tenant.Config.IsolationLevel == "dedicated" {
		if err := tm.createDedicatedSchema(ctx, tx, tenant.ID); err != nil {
			return nil, err
		}
	}

	// Seed data inicial
	if err := tm.seedInitialData(ctx, tx, tenant.ID); err != nil {
		return nil, err
	}

	if err := tx.Commit(); err != nil {
		return nil, err
	}

	// Invalidar cache
	tm.cache.InvalidateAnalysis(tenant.Subdomain)

	return tenant, nil
}

// ===== FUNCIONES AUXILIARES =====

// generateTenantID genera un ID único para el tenant
func generateTenantID() string {
	return uuid.New().String()
}

// getDefaultConfig retorna configuración por defecto
func getDefaultConfig() TenantConfig {
	return TenantConfig{
		Features: map[string]bool{
			"whatsapp_basic":  true,
			"analytics_basic": true,
			"analysis_basic":  true,
		},
		Branding: BrandingConfig{
			PrimaryColor: "#3B82F6",
			CompanyName:  "Mi PYME",
		},
		Integrations:   make(map[string]IntegrationConfig),
		DataRetention:  90,
		IsolationLevel: "shared",
	}
}

// getDefaultLimits retorna límites por defecto según plan
func getDefaultLimits(plan string) TenantLimits {
	limits := map[string]TenantLimits{
		"trial": {
			MaxUsers:            1,
			MaxAPICallsMonthly:  100,
			MaxMCPAgents:        1,
			MaxWhatsAppMessages: 50,
			StorageGB:           1.0,
			CustomLimits:        make(map[string]int),
		},
		"gratis": {
			MaxUsers:            1,
			MaxAPICallsMonthly:  100,
			MaxMCPAgents:        3,
			MaxWhatsAppMessages: 50,
			StorageGB:           1.0,
			CustomLimits:        make(map[string]int),
		},
		"starter": {
			MaxUsers:            5,
			MaxAPICallsMonthly:  5000,
			MaxMCPAgents:        5,
			MaxWhatsAppMessages: 500,
			StorageGB:           10.0,
			CustomLimits:        make(map[string]int),
		},
		"growth": {
			MaxUsers:            20,
			MaxAPICallsMonthly:  25000,
			MaxMCPAgents:        10,
			MaxWhatsAppMessages: 2000,
			StorageGB:           50.0,
			CustomLimits:        make(map[string]int),
		},
		"scale": {
			MaxUsers:            100,
			MaxAPICallsMonthly:  100000,
			MaxMCPAgents:        50,
			MaxWhatsAppMessages: 10000,
			StorageGB:           500.0,
			CustomLimits:        make(map[string]int),
		},
	}

	if limit, exists := limits[plan]; exists {
		return limit
	}

	return limits["gratis"]
}

// createDedicatedSchema crea esquema dedicado para el tenant
func (tm *TenantManager) createDedicatedSchema(ctx context.Context, tx *sql.Tx, tenantID string) error {
	// Crear esquema dedicado
	schemaName := fmt.Sprintf("tenant_%s", tenantID)
	query := fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", schemaName)
	_, err := tx.ExecContext(ctx, query)
	return err
}

// seedInitialData crea datos iniciales para el tenant
func (tm *TenantManager) seedInitialData(ctx context.Context, tx *sql.Tx, tenantID string) error {
	// Crear usuario admin inicial
	adminUserID := uuid.New().String()
	query := `
		INSERT INTO users (id, tenant_id, email, name, role, created_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := tx.ExecContext(ctx, query,
		adminUserID,
		tenantID,
		"admin@"+tenantID+".tause.pro",
		"Administrador",
		"admin",
		time.Now(),
	)
	return err
}
