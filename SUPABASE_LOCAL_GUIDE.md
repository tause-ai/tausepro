# 🚀 Guía de Supabase Local - TausePro

## 📋 Resumen

TausePro ahora usa **Supabase local** para desarrollo, proporcionando:
- ✅ Base de datos PostgreSQL completa
- ✅ Autenticación con JWT
- ✅ API REST automática
- ✅ Row Level Security (RLS)
- ✅ Multi-tenancy implementado
- ✅ Studio web para administración

## 🛠️ Configuración Inicial

### 1. Instalar Supabase CLI
```bash
# macOS
brew install supabase/tap/supabase

# Verificar instalación
supabase --version
```

### 2. Iniciar Supabase Local
```bash
# Desde la raíz del proyecto
cd /Users/tause/Documents/proyectos/tp/tausepro

# Iniciar todos los servicios
supabase start

# Verificar estado
supabase status
```

## 🔗 URLs de Acceso

```bash
# Dashboard TausePro
http://localhost:5173

# Supabase Studio (Admin de BD)
http://127.0.0.1:54323

# API Supabase
http://127.0.0.1:54321

# Email Testing
http://127.0.0.1:54324

# GraphQL API
http://127.0.0.1:54321/graphql/v1
```

## 🔑 Credenciales de Desarrollo

```bash
# Clave anónima (para frontend)
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Clave de servicio (para backend)
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Base de datos
DB_URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres

# JWT Secret
JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
```

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `tenants` - Multi-tenancy
```sql
- id (UUID, PK)
- name (VARCHAR)
- slug (VARCHAR, UNIQUE)
- domain (VARCHAR)
- settings (JSONB)
- is_active (BOOLEAN)
```

#### `users` - Usuarios del sistema
```sql
- id (UUID, PK, FK a auth.users)
- tenant_id (UUID, FK a tenants)
- email (VARCHAR)
- full_name (VARCHAR)
- company_name (VARCHAR)
- role (VARCHAR) -- user, admin, super_admin
- settings (JSONB)
```

#### `company_analyses` - Análisis de empresas
```sql
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK)
- company_url (VARCHAR)
- analysis_data (JSONB)
- status (VARCHAR) -- pending, processing, completed, failed
- findings (JSONB)
- recommendations (JSONB)
```

#### `agents` - Agentes AI
```sql
- id (UUID, PK)
- tenant_id (UUID, FK)
- name (VARCHAR)
- personality (JSONB)
- knowledge (JSONB)
- skills (JSONB)
- context (JSONB)
```

#### `mcp_integrations` - Integraciones MCP
```sql
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK)
- provider (VARCHAR) -- google, notion, slack, etc.
- credentials (JSONB)
- settings (JSONB)
```

#### `usage_limits` - Sistema de paywall
```sql
- id (UUID, PK)
- tenant_id (UUID, FK)
- user_id (UUID, FK)
- resource_type (VARCHAR) -- api_calls, mcp_agents, etc.
- current_usage (INTEGER)
- limit_value (INTEGER)
- reset_date (DATE)
```

## 🔐 Seguridad (RLS)

### Políticas Implementadas

```sql
-- Usuarios solo ven su propio tenant
CREATE POLICY "Users can view their own tenant users" ON users
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Análisis solo del usuario
CREATE POLICY "Users can view their own analyses" ON company_analyses
    FOR ALL USING (user_id = auth.uid());

-- Agentes del tenant
CREATE POLICY "Users can view their tenant agents" ON agents
    FOR ALL USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));
```

## 🚀 Comandos Útiles

### Gestión de Base de Datos
```bash
# Reiniciar base de datos
supabase db reset

# Ver logs
supabase logs

# Parar servicios
supabase stop

# Iniciar servicios
supabase start

# Estado de servicios
supabase status
```

### Migraciones
```bash
# Crear nueva migración
supabase migration new nombre_migracion

# Aplicar migraciones
supabase db push

# Generar tipos TypeScript
supabase gen types typescript --local > apps/dashboard/src/types/supabase.ts
```

### Desarrollo
```bash
# Iniciar dashboard
cd apps/dashboard && npm run dev

# Ver logs en tiempo real
supabase logs --follow

# Conectar a PostgreSQL
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

## 🧪 Testing

### Probar Registro de Usuario
1. Ir a http://localhost:5173/admin/register
2. Llenar formulario con datos de prueba
3. Verificar en Supabase Studio que se creó el usuario

### Probar Login
1. Ir a http://localhost:5173/admin/login
2. Usar credenciales del usuario registrado
3. Verificar redirección al dashboard

### Probar API
```bash
# Obtener usuarios (requiere autenticación)
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://127.0.0.1:54321/rest/v1/users

# Obtener análisis
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://127.0.0.1:54321/rest/v1/company_analyses
```

## 🔧 Configuración Avanzada

### Variables de Entorno
```bash
# .env.local en apps/dashboard
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Configuración de Supabase
```toml
# supabase/config.toml
[api]
port = 54321
schemas = ["public", "storage", "graphql_public"]

[auth]
site_url = "http://localhost:3000"
enable_signup = true
```

## 🚨 Troubleshooting

### Problemas Comunes

#### 1. Puerto ocupado
```bash
# Verificar puertos en uso
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Matar proceso si es necesario
kill -9 PID
```

#### 2. Docker no disponible
```bash
# Verificar Docker
docker --version
docker ps

# Reiniciar Docker si es necesario
```

#### 3. Migraciones fallan
```bash
# Resetear completamente
supabase stop
supabase start --reset
```

#### 4. Problemas de autenticación
```bash
# Verificar JWT secret
# Verificar políticas RLS
# Verificar configuración de auth
```

## 📈 Próximos Pasos

1. **Implementar sistema de paywall**
   - Middleware para verificar límites
   - Dashboard de uso
   - Alertas de límites

2. **Conectar con MCP Server**
   - Migrar análisis existente
   - Integrar agentes
   - Sincronizar datos

3. **Implementar Google MCP**
   - OAuth con Google
   - Calendar integration
   - Gmail integration

4. **Producción**
   - Migrar a Supabase Cloud
   - Configurar dominio
   - SSL y seguridad

## 📞 Soporte

- **Documentación Supabase**: https://supabase.com/docs
- **CLI Reference**: https://supabase.com/docs/reference/cli
- **Issues**: Crear issue en el repositorio

---

**Última actualización**: 2024-12-01
**Versión**: 1.0.0 