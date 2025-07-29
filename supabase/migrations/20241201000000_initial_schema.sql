-- Migración inicial para TausePro
-- Creado: 2024-12-01

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de tenants (multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de usuarios (extendiendo auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    company_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- user, admin, super_admin
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de análisis de empresas
CREATE TABLE IF NOT EXISTS company_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_url VARCHAR(500) NOT NULL,
    company_name VARCHAR(255),
    analysis_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    findings JSONB DEFAULT '[]',
    recommendations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de agentes AI
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    personality JSONB NOT NULL,
    knowledge JSONB DEFAULT '{}',
    skills JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de conversaciones con agentes
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    session_id VARCHAR(255) NOT NULL,
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de prompts del sistema
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de integraciones MCP
CREATE TABLE IF NOT EXISTS mcp_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(100) NOT NULL, -- google, notion, slack, etc.
    credentials JSONB NOT NULL,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reportes
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- analysis, agent_performance, etc.
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, key)
);

-- Tabla de uso y límites (paywall)
CREATE TABLE IF NOT EXISTS usage_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_type VARCHAR(100) NOT NULL, -- api_calls, mcp_agents, whatsapp_messages
    current_usage INTEGER DEFAULT 0,
    limit_value INTEGER NOT NULL,
    reset_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_analyses_tenant_id ON company_analyses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_company_analyses_user_id ON company_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_agents_tenant_id ON agents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_session_id ON agent_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_prompts_tenant_id ON prompts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mcp_integrations_user_id ON mcp_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_tenant_id ON usage_limits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_id ON usage_limits(user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_company_analyses_updated_at BEFORE UPDATE ON company_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_conversations_updated_at BEFORE UPDATE ON agent_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prompts_updated_at BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mcp_integrations_updated_at BEFORE UPDATE ON mcp_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON usage_limits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants (solo super_admin puede ver todos)
CREATE POLICY "Super admins can view all tenants" ON tenants
    FOR ALL USING (auth.jwt() ->> 'role' = 'super_admin');

-- Políticas para users (usuarios solo ven su propio tenant)
CREATE POLICY "Users can view their own tenant users" ON users
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para company_analyses
CREATE POLICY "Users can view their own analyses" ON company_analyses
    FOR ALL USING (user_id = auth.uid());

-- Políticas para agents
CREATE POLICY "Users can view their tenant agents" ON agents
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para agent_conversations
CREATE POLICY "Users can view their own conversations" ON agent_conversations
    FOR ALL USING (user_id = auth.uid());

-- Políticas para prompts
CREATE POLICY "Users can view their tenant prompts" ON prompts
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para mcp_integrations
CREATE POLICY "Users can view their own integrations" ON mcp_integrations
    FOR ALL USING (user_id = auth.uid());

-- Políticas para reports
CREATE POLICY "Users can view their own reports" ON reports
    FOR ALL USING (user_id = auth.uid());

-- Políticas para system_config
CREATE POLICY "Users can view their tenant config" ON system_config
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas para usage_limits
CREATE POLICY "Users can view their own usage" ON usage_limits
    FOR ALL USING (user_id = auth.uid());

-- Insertar tenant por defecto
INSERT INTO tenants (id, name, slug, domain, settings) 
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'TausePro Default',
    'default',
    'localhost',
    '{"plan": "free", "features": {"api_calls": 100, "mcp_agents": 3, "whatsapp_messages": 50}}'
) ON CONFLICT (slug) DO NOTHING;

-- Insertar prompts por defecto
INSERT INTO prompts (tenant_id, name, description, content, category) VALUES
('00000000-0000-0000-0000-000000000000', 'Análisis de Empresa', 'Prompt para análisis completo de empresa', 'Analiza la empresa {company_url} y proporciona un análisis detallado incluyendo: 1) Información general, 2) Presencia digital, 3) Análisis de competencia, 4) Oportunidades de mejora, 5) Recomendaciones estratégicas.', 'analysis'),
('00000000-0000-0000-0000-000000000000', 'Agente Asistente', 'Prompt para agente asistente general', 'Eres un asistente virtual especializado en ayudar a PYMEs colombianas. Proporciona consejos prácticos y soluciones basadas en el contexto de la empresa del usuario.', 'assistant'),
('00000000-0000-0000-0000-000000000000', 'Agente de Marketing', 'Prompt para agente de marketing digital', 'Eres un especialista en marketing digital para PYMEs. Ayuda a crear estrategias de marketing efectivas, calendarios de contenido y optimización de presencia digital.', 'marketing'); 