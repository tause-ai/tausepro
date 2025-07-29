-- migrations/001_create_prompts_tables.sql

-- Tabla para almacenar prompts configurables
CREATE TABLE IF NOT EXISTS analysis_prompts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('company', 'industry', 'competitors', 'opportunities')),
    prompt TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para analysis_prompts
CREATE INDEX IF NOT EXISTS idx_prompts_category ON analysis_prompts (category);
CREATE INDEX IF NOT EXISTS idx_prompts_active ON analysis_prompts (is_active);
CREATE UNIQUE INDEX IF NOT EXISTS idx_prompts_name_category ON analysis_prompts (name, category);

-- Tabla para logs de ejecución de prompts
CREATE TABLE IF NOT EXISTS prompt_executions (
    id VARCHAR(36) PRIMARY KEY,
    prompt_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36),
    user_id VARCHAR(36),
    input JSONB NOT NULL,
    output JSONB,
    duration_ms INTEGER,
    success BOOLEAN DEFAULT false,
    error TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (prompt_id) REFERENCES analysis_prompts(id)
);

-- Índices para prompt_executions
CREATE INDEX IF NOT EXISTS idx_executions_prompt ON prompt_executions (prompt_id);
CREATE INDEX IF NOT EXISTS idx_executions_tenant ON prompt_executions (tenant_id);
CREATE INDEX IF NOT EXISTS idx_executions_date ON prompt_executions (executed_at);

-- Tabla para análisis de empresas con datos completos
CREATE TABLE IF NOT EXISTS company_analyses (
    id VARCHAR(36) PRIMARY KEY,
    domain VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    data JSONB NOT NULL, -- Toda la información de CompanyInfo
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para company_analyses
CREATE UNIQUE INDEX IF NOT EXISTS idx_analyses_domain ON company_analyses (domain);
CREATE INDEX IF NOT EXISTS idx_analyses_name ON company_analyses (company_name);
CREATE INDEX IF NOT EXISTS idx_analyses_date ON company_analyses (analyzed_at);
CREATE INDEX IF NOT EXISTS idx_analyses_confidence ON company_analyses (confidence);

-- Tabla para cache de análisis
CREATE TABLE IF NOT EXISTS analysis_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    cache_type VARCHAR(50) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    hit_count INTEGER DEFAULT 0
);

-- Índices para analysis_cache
CREATE INDEX IF NOT EXISTS idx_cache_type ON analysis_cache (cache_type);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON analysis_cache (expires_at);

-- Tabla para resultados de análisis completos
CREATE TABLE IF NOT EXISTS analysis_results (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    user_id VARCHAR(36),
    url VARCHAR(512) NOT NULL,
    company_data JSONB,
    industry_data JSONB,
    competitors_data JSONB,
    opportunities_data JSONB,
    status VARCHAR(20) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    error TEXT
);

-- Índices para analysis_results
CREATE INDEX IF NOT EXISTS idx_results_tenant ON analysis_results (tenant_id);
CREATE INDEX IF NOT EXISTS idx_results_status ON analysis_results (status);
CREATE INDEX IF NOT EXISTS idx_results_date ON analysis_results (started_at);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analysis_prompts_updated_at 
    BEFORE UPDATE ON analysis_prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_analyses_updated_at 
    BEFORE UPDATE ON company_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para limpiar cache expirado
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM analysis_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas de prompts
CREATE VIEW prompt_statistics AS
SELECT 
    p.id,
    p.name,
    p.category,
    COUNT(e.id) as execution_count,
    AVG(e.duration_ms) as avg_duration_ms,
    SUM(CASE WHEN e.success THEN 1 ELSE 0 END)::float / COUNT(e.id) as success_rate,
    MAX(e.executed_at) as last_executed
FROM analysis_prompts p
LEFT JOIN prompt_executions e ON p.id = e.prompt_id
GROUP BY p.id, p.name, p.category;

-- Vista para análisis recientes
CREATE VIEW recent_analyses AS
SELECT 
    domain,
    company_name,
    data->>'industry' as industry,
    data->'location'->>'city' as city,
    confidence,
    analyzed_at
FROM company_analyses
WHERE analyzed_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY analyzed_at DESC;

-- ===== DATOS INICIALES =====

-- Insertar prompts por defecto
INSERT INTO analysis_prompts (id, name, description, category, prompt, variables, is_active) VALUES
(
    'company_identification',
    'Identificación de Empresa',
    'Extrae información precisa de la empresa evitando confusiones',
    'company',
    'Analiza la URL {url} y extrae ÚNICAMENTE información de esta empresa específica. Busca en el sitio web oficial, registro mercantil, LinkedIn y otras fuentes confiables. Responde en formato JSON con: {"name": "Razón social exacta", "brand": "Marca comercial", "industry": "Sector", "location": {"city": "Ciudad", "department": "Departamento"}, "founded": "Año", "size": "Tamaño", "description": "Descripción del negocio", "nit": "NIT si está disponible"}. IMPORTANTE: No confundas con empresas similares.',
    '{"url": "URL del sitio web"}',
    true
),
(
    'social_media_analysis',
    'Análisis de Redes Sociales',
    'Encuentra todas las redes sociales de la empresa',
    'company',
    'Busca TODAS las redes sociales de la empresa ''{company_name}'' con dominio {url}. Busca en: Facebook, Instagram, LinkedIn, Twitter/X, TikTok, YouTube, WhatsApp Business. Para cada red encontrada, extrae: {"platform": "nombre", "url": "URL del perfil", "followers": "número si disponible", "last_post": "fecha última publicación", "content_type": "tipo de contenido", "is_active": true/false}. Responde en formato JSON con array de redes sociales.',
    '{"company_name": "Nombre de la empresa", "url": "URL del sitio web"}',
    true
),
(
    'industry_analysis',
    'Análisis de Industria',
    'Analiza el sector específico en Colombia',
    'industry',
    'Analiza la industria ''{industry}'' en Colombia con datos actualizados de los últimos 2 años. Incluye: {"market_size": "Tamaño del mercado", "growth_rate": "Tasa de crecimiento", "trends": ["tendencia1", "tendencia2"], "challenges": ["desafío1", "desafío2"], "opportunities": ["oportunidad1", "oportunidad2"], "regulations": ["regulación1", "regulación2"], "key_players": ["empresa1", "empresa2"], "technologies": ["tecnología1", "tecnología2"]}. Enfócate en el contexto colombiano.',
    '{"industry": "Sector o industria", "city": "Ciudad de operación"}',
    true
),
(
    'competitor_analysis',
    'Análisis de Competidores',
    'Identifica competidores directos e indirectos',
    'competitors',
    'Identifica competidores de ''{company_name}'' en {city}, Colombia, en la industria {industry}. Para cada competidor extrae: {"name": "Nombre", "url": "Sitio web", "location": "Ubicación", "strengths": ["fortaleza1", "fortaleza2"], "weaknesses": ["debilidad1", "debilidad2"], "differentiators": ["diferenciador1", "diferenciador2"], "market_share": "Participación si disponible"}. Busca al menos 5 competidores directos.',
    '{"company_name": "Nombre de la empresa", "city": "Ciudad", "industry": "Industria"}',
    true
),
(
    'opportunities_analysis',
    'Análisis de Oportunidades',
    'Identifica oportunidades específicas de mejora',
    'opportunities',
    'Genera oportunidades ESPECÍFICAS para ''{company_name}'' en {industry} en {city}. Considera: tamaño {company_size}, score de digitalización {digitalization_score}, presencia digital {digital_presence}. Categorías: Digital, Marketing, Operaciones, Financiero. Para cada oportunidad: {"category": "categoría", "title": "Título", "description": "Descripción", "impact": "Alto/Medio/Bajo", "effort": "Alto/Medio/Bajo", "roi": "ROI estimado", "timeline": "Timeline", "cost_cop": "Costo en COP"}. Sé específico para Colombia.',
    '{"company_name": "Nombre", "industry": "Industria", "city": "Ciudad", "company_size": "Tamaño", "digitalization_score": "Score", "digital_presence": "Presencia digital"}',
    true
)
ON CONFLICT (name, category) DO NOTHING;

-- ===== ÍNDICES ADICIONALES PARA PERFORMANCE =====

-- Índices para búsquedas JSON
CREATE INDEX IF NOT EXISTS idx_company_analyses_nit ON company_analyses ((data->'legal_info'->>'nit'));
CREATE INDEX IF NOT EXISTS idx_company_analyses_city ON company_analyses ((data->'location'->>'city'));
CREATE INDEX IF NOT EXISTS idx_company_analyses_industry ON company_analyses ((data->>'industry'));

-- Índices para análisis de redes sociales
CREATE INDEX IF NOT EXISTS idx_company_analyses_facebook ON company_analyses ((data->'social_media'->'facebook'->>'url'));
CREATE INDEX IF NOT EXISTS idx_company_analyses_instagram ON company_analyses ((data->'social_media'->'instagram'->>'url'));

-- ===== FUNCIONES ÚTILES =====

-- Función para buscar empresas similares (evitar duplicados)
CREATE OR REPLACE FUNCTION find_similar_companies(search_name VARCHAR)
RETURNS TABLE(
    domain VARCHAR,
    company_name VARCHAR,
    similarity_score FLOAT,
    confidence DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.domain,
        c.company_name,
        similarity(c.company_name, search_name) as similarity_score,
        c.confidence
    FROM company_analyses c
    WHERE similarity(c.company_name, search_name) > 0.3
    ORDER BY similarity_score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas de uso por tenant
CREATE OR REPLACE FUNCTION get_tenant_usage_stats(p_tenant_id VARCHAR, p_period INTERVAL DEFAULT '30 days')
RETURNS TABLE(
    total_analyses BIGINT,
    unique_companies BIGINT,
    avg_confidence DECIMAL,
    most_analyzed_industry VARCHAR,
    api_calls_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT ar.id) as total_analyses,
        COUNT(DISTINCT ar.company_data->>'domain') as unique_companies,
        AVG((ar.company_data->>'confidence')::DECIMAL) as avg_confidence,
        MODE() WITHIN GROUP (ORDER BY ar.company_data->>'industry') as most_analyzed_industry,
        COUNT(pe.id) as api_calls_count
    FROM analysis_results ar
    LEFT JOIN prompt_executions pe ON pe.tenant_id = p_tenant_id
    WHERE ar.tenant_id = p_tenant_id
    AND ar.started_at > CURRENT_TIMESTAMP - p_period;
END;
$$ LANGUAGE plpgsql; 