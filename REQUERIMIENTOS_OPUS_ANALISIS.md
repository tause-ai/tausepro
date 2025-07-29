# **📋 REQUERIMIENTOS PARA OPUS - SISTEMA DE ANÁLISIS ROBUSTO**

## **🎯 OBJETIVO**
Crear un sistema de análisis empresarial que extraiga información precisa y completa de empresas colombianas usando Tavily API, con prompts configurables desde el backend.

## **🔍 PROBLEMAS ACTUALES**

### **1. Confusión de Empresas**
- **tez.com.co** → A.C DERMA S.A.S (Medellín, 2004)
- **Tez Pharma S.A.S** → Empresa diferente (Bogotá, 2019)
- El sistema mezcla datos de ambas empresas

### **2. Información Incompleta**
- No extrae redes sociales
- No identifica razón social correctamente
- No distingue entre marca y empresa
- Datos hardcodeados en lugar de reales

### **3. Falta de Control**
- Prompts hardcodeados en el código
- No hay gestión desde el backend
- No se pueden editar sin recompilar

## **✅ REQUERIMIENTOS ESPECÍFICOS**

### **1. SISTEMA DE PROMPTS CONFIGURABLES**

```go
// Estructura para prompts configurables
type AnalysisPrompt struct {
    ID          string            `json:"id"`
    Name        string            `json:"name"`
    Description string            `json:"description"`
    Category    string            `json:"category"` // company, industry, competitors, opportunities
    Prompt      string            `json:"prompt"`
    Variables   map[string]string `json:"variables"`
    IsActive    bool              `json:"is_active"`
    CreatedAt   time.Time         `json:"created_at"`
    UpdatedAt   time.Time         `json:"updated_at"`
}
```

### **2. PROMPTS ESPECÍFICOS NECESARIOS**

#### **A. Identificación de Empresa**
```json
{
  "id": "company_identification",
  "name": "Identificación de Empresa",
  "category": "company",
  "prompt": "Analiza la URL {url} y extrae la siguiente información de la empresa:\n\n1. Nombre de la empresa (razón social)\n2. Marca comercial (si es diferente)\n3. Industria/sector\n4. Ubicación (ciudad, departamento)\n5. Año de fundación\n6. Tamaño de la empresa\n7. Descripción del negocio\n\nBusca información en:\n- Sitio web oficial\n- Registro mercantil\n- LinkedIn\n- Datacrédito\n- Portafolio.co\n\nResponde en formato JSON."
}
```

#### **B. Redes Sociales**
```json
{
  "id": "social_media_analysis",
  "name": "Análisis de Redes Sociales",
  "category": "company",
  "prompt": "Busca todas las redes sociales de la empresa '{company_name}' en Colombia:\n\n- Facebook\n- Instagram\n- LinkedIn\n- Twitter/X\n- TikTok\n- YouTube\n- WhatsApp Business\n\nPara cada red social encontrada, extrae:\n- URL del perfil\n- Número de seguidores (si está disponible)\n- Fecha de última publicación\n- Tipo de contenido que publican\n\nResponde en formato JSON."
}
```

#### **C. Análisis de Industria**
```json
{
  "id": "industry_analysis",
  "name": "Análisis de Industria",
  "category": "industry",
  "prompt": "Analiza la industria '{industry}' en Colombia:\n\n1. Tamaño del mercado\n2. Tendencias actuales (últimos 2 años)\n3. Principales desafíos\n4. Oportunidades de crecimiento\n5. Regulaciones específicas\n6. Competidores principales\n7. Tecnologías emergentes\n\nEnfócate en el contexto colombiano y datos recientes.\nResponde en formato JSON."
}
```

#### **D. Competidores**
```json
{
  "id": "competitor_analysis",
  "name": "Análisis de Competidores",
  "category": "competitors",
  "prompt": "Identifica los principales competidores de '{company_name}' en Colombia:\n\nPara cada competidor:\n1. Nombre de la empresa\n2. URL del sitio web\n3. Ubicación\n4. Fortalezas principales\n5. Debilidades identificadas\n6. Diferenciadores\n7. Participación en el mercado (si está disponible)\n\nBusca al menos 5 competidores directos.\nResponde en formato JSON."
}
```

#### **E. Oportunidades**
```json
{
  "id": "opportunities_analysis",
  "name": "Análisis de Oportunidades",
  "category": "opportunities",
  "prompt": "Basándote en el análisis de '{company_name}' y su industria '{industry}', identifica oportunidades específicas para PYMEs colombianas:\n\nCategorías:\n1. Digital (e-commerce, marketing digital, automatización)\n2. Marketing (redes sociales, SEO, publicidad)\n3. Operaciones (procesos, logística, atención al cliente)\n4. Financiero (financiamiento, costos, rentabilidad)\n\nPara cada oportunidad:\n- Título\n- Descripción\n- Impacto esperado (Alto/Medio/Bajo)\n- Esfuerzo requerido (Alto/Medio/Bajo)\n- ROI estimado\n- Timeline recomendado\n- Costo estimado en COP\n\nResponde en formato JSON."
}
```

### **3. API ENDPOINTS NECESARIOS**

#### **Gestión de Prompts**
```go
// GET /api/v1/prompts - Listar todos los prompts
// GET /api/v1/prompts/{id} - Obtener prompt específico
// POST /api/v1/prompts - Crear nuevo prompt
// PUT /api/v1/prompts/{id} - Actualizar prompt
// DELETE /api/v1/prompts/{id} - Eliminar prompt
// POST /api/v1/prompts/{id}/test - Probar prompt
```

#### **Análisis Mejorado**
```go
// POST /api/v1/analysis/analyze - Análisis completo
// POST /api/v1/analysis/company - Solo identificación de empresa
// POST /api/v1/analysis/social - Solo redes sociales
// POST /api/v1/analysis/industry - Solo análisis de industria
// POST /api/v1/analysis/competitors - Solo competidores
// POST /api/v1/analysis/opportunities - Solo oportunidades
```

### **4. ESTRUCTURA DE DATOS MEJORADA**

```go
type CompanyInfo struct {
    Name            string            `json:"name"`              // Razón social
    Brand           string            `json:"brand"`             // Marca comercial
    URL             string            `json:"url"`
    Description     string            `json:"description"`
    Industry        string            `json:"industry"`
    Location        LocationInfo      `json:"location"`
    Size            string            `json:"size"`
    Founded         string            `json:"founded"`
    SocialMedia     SocialMediaInfo   `json:"social_media"`
    Website         WebsiteAnalysis   `json:"website"`
    LegalInfo       LegalInfo         `json:"legal_info"`
}

type LocationInfo struct {
    City        string `json:"city"`
    Department  string `json:"department"`
    Address     string `json:"address"`
    Coordinates string `json:"coordinates"`
}

type SocialMediaInfo struct {
    Facebook    *SocialProfile `json:"facebook"`
    Instagram   *SocialProfile `json:"instagram"`
    LinkedIn    *SocialProfile `json:"linkedin"`
    Twitter     *SocialProfile `json:"twitter"`
    TikTok      *SocialProfile `json:"tiktok"`
    YouTube     *SocialProfile `json:"youtube"`
    WhatsApp    *SocialProfile `json:"whatsapp"`
}

type SocialProfile struct {
    URL           string `json:"url"`
    Followers     string `json:"followers"`
    LastPost      string `json:"last_post"`
    ContentType   string `json:"content_type"`
    IsActive      bool   `json:"is_active"`
}

type LegalInfo struct {
    NIT         string `json:"nit"`
    RUT         string `json:"rut"`
    LegalForm   string `json:"legal_form"`
    Status      string `json:"status"`
    Chamber     string `json:"chamber"`
}
```

### **5. SISTEMA DE CACHE INTELIGENTE**

```go
type CacheConfig struct {
    CompanyInfo     time.Duration `json:"company_info"`      // 24 horas
    SocialMedia     time.Duration `json:"social_media"`      // 6 horas
    Industry        time.Duration `json:"industry"`          // 7 días
    Competitors     time.Duration `json:"competitors"`       // 24 horas
    Opportunities   time.Duration `json:"opportunities"`     // 7 días
}
```

### **6. VALIDACIÓN Y LIMPIEZA DE DATOS**

```go
// Funciones de validación
func ValidateCompanyInfo(info *CompanyInfo) error
func CleanCompanyName(name string) string
func ExtractNITFromText(text string) string
func ValidateSocialMediaURL(url string) bool
func NormalizeIndustry(industry string) string
```

## **🎯 ENTREGABLES ESPERADOS**

### **1. Archivos Go**
- `internal/services/prompts.go` - Gestión de prompts
- `internal/services/analysis_v2.go` - Análisis mejorado
- `internal/handlers/prompts.go` - API de prompts
- `internal/models/prompts.go` - Modelos de prompts

### **2. Base de Datos**
- Tabla `analysis_prompts` para almacenar prompts
- Tabla `prompt_executions` para logs de ejecución
- Tabla `analysis_cache` para cache inteligente

### **3. API Endpoints**
- CRUD completo para prompts
- Endpoints de análisis modular
- Sistema de testing de prompts

### **4. Documentación**
- Guía de uso de prompts
- Ejemplos de prompts efectivos
- Documentación de API

## **🚀 CRITERIOS DE ÉXITO**

1. **Precisión**: 95% de identificación correcta de empresas
2. **Completitud**: Extraer al menos 80% de la información disponible
3. **Velocidad**: Análisis completo en menos de 30 segundos
4. **Flexibilidad**: Prompts editables sin recompilación
5. **Escalabilidad**: Soporte para múltiples idiomas y regiones

## **📞 CONTACTO**
- **Proyecto**: TausePro
- **Contexto**: SaaS para PYMEs colombianas
- **Prioridad**: ALTA - Necesario para MVP funcional 