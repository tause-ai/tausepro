-- Migración para crear la tabla de agentes inteligentes
-- Fecha: 2025-07-28

CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    personality JSON,
    knowledge JSON,
    context JSON,
    skills JSON,
    is_active BOOLEAN DEFAULT true,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_active ON agents(is_active);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);

-- Tabla para el historial de conversaciones
CREATE TABLE IF NOT EXISTS conversation_history (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    session_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_conversation_agent_id ON conversation_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_timestamp ON conversation_history(timestamp);

-- Tabla para eventos de aprendizaje
CREATE TABLE IF NOT EXISTS learning_events (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    type VARCHAR(100) NOT NULL,
    description TEXT,
    data JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_learning_agent_id ON learning_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_learning_type ON learning_events(type);
CREATE INDEX IF NOT EXISTS idx_learning_timestamp ON learning_events(timestamp);

-- Tabla para patrones identificados
CREATE TABLE IF NOT EXISTS patterns (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    industry VARCHAR(100),
    company_size VARCHAR(50),
    problem TEXT,
    solution TEXT,
    success_rate DECIMAL(5,2),
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_patterns_agent_id ON patterns(agent_id);
CREATE INDEX IF NOT EXISTS idx_patterns_industry ON patterns(industry);
CREATE INDEX IF NOT EXISTS idx_patterns_success_rate ON patterns(success_rate);

-- Tabla para mejores prácticas
CREATE TABLE IF NOT EXISTS best_practices (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    industry VARCHAR(100),
    success_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_best_practices_agent_id ON best_practices(agent_id);
CREATE INDEX IF NOT EXISTS idx_best_practices_category ON best_practices(category);
CREATE INDEX IF NOT EXISTS idx_best_practices_industry ON best_practices(industry);

-- Tabla para casos de estudio
CREATE TABLE IF NOT EXISTS case_studies (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company VARCHAR(255),
    industry VARCHAR(100),
    challenge TEXT,
    solution TEXT,
    results TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_case_studies_agent_id ON case_studies(agent_id);
CREATE INDEX IF NOT EXISTS idx_case_studies_company ON case_studies(company);
CREATE INDEX IF NOT EXISTS idx_case_studies_industry ON case_studies(industry);

-- Tabla para feedback de usuarios
CREATE TABLE IF NOT EXISTS user_feedback (
    id VARCHAR(36) PRIMARY KEY,
    agent_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    category VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX IF NOT EXISTS idx_user_feedback_agent_id ON user_feedback(agent_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_feedback_category ON user_feedback(category);

-- Insertar agente ALI por defecto
INSERT INTO agents (
    id, name, personality, knowledge, context, skills, 
    is_active, tenant_id, metadata
) VALUES (
    'ali-default-agent',
    'ALI - Asistente de Análisis Empresarial',
    '{"name":"ALI","age":30,"style":"médico","expertise":["análisis empresarial","vida saludable","PYMEs"],"tone":"profesional y empática","background":"Especialista en análisis empresarial con enfoque en bienestar organizacional","language":"es","preferences":{"communication_style":"directo pero empático","focus_areas":["financiero","digital","posicionamiento"]}}',
    '{"company_analysis":[],"google_drive":null,"specialized_apis":{},"learning_history":[],"patterns":[],"best_practices":[],"case_studies":[],"user_feedback":[],"metadata":{}}',
    '{"user_id":"","session_id":"","tenant_id":"","current_topic":"","history":[],"user_profile":null,"intent":"","confidence":0,"metadata":{}}',
    '[{"id":"skill-1","name":"Análisis Financiero","description":"Evaluación de salud financiera y crediticia","category":"financial","level":5,"is_active":true,"metadata":{}},{"id":"skill-2","name":"Evaluación Digital","description":"Análisis de madurez digital y presencia online","category":"digital","level":5,"is_active":true,"metadata":{}},{"id":"skill-3","name":"Posicionamiento de Mercado","description":"Análisis de diferenciación y estrategia competitiva","category":"positioning","level":5,"is_active":true,"metadata":{}}]',
    true,
    'default',
    '{"version":"1.0","type":"business_analyst"}'
); 