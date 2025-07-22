import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// Tipos de prompts del sistema
interface SystemPrompt {
  id: string
  name: string
  description: string
  category: string
  aiService: string
  content: string
  variables: string[]
  isActive: boolean
  lastUpdated: string
  version: string
}

// Prompts demo del sistema organizados por IA
const demoPrompts: SystemPrompt[] = [
  {
    id: 'openai-company-analysis',
    name: 'Análisis de Empresa (OpenAI)',
    description: 'Prompt principal para analizar empresas colombianas usando GPT-4',
    category: 'OpenAI',
    aiService: 'openai',
    content: `Eres un experto analista de mercado colombiano especializado en PYMEs. Tu tarea es analizar la empresa "{company_name}" y proporcionar un análisis completo del mercado colombiano.

INSTRUCCIONES:
1. Analiza la empresa basándote en su sitio web y presencia digital
2. Identifica el sector/industria y su posición en el mercado colombiano
3. Encuentra competidores directos e indirectos
4. Identifica oportunidades de crecimiento específicas para Colombia
5. Proporciona recomendaciones prácticas y accionables
6. Considera el contexto económico y regulatorio colombiano

CONTEXTO COLOMBIANO:
- Moneda: COP (sin decimales)
- Métodos de pago: PSE, Nequi, Wompi, DaviPlata, Efecty
- Envíos: Servientrega, TCC, Interrapidisimo, Coordinadora
- Regulaciones: DIAN, Habeas Data, Cámara de Comercio
- Mercado objetivo: PYMEs colombianas (97% del tejido empresarial)

FORMATO DE RESPUESTA:
- Análisis estructurado en JSON
- Incluir métricas cuantificables
- Recomendaciones con timeline y costos en COP
- Considerar limitaciones de PYMEs colombianas`,
    variables: ['{company_name}', '{company_url}', '{industry}'],
    isActive: true,
    lastUpdated: '2025-07-21T22:00:00Z',
    version: '1.0.0'
  },
  {
    id: 'tavily-competitor-analysis',
    name: 'Análisis de Competidores (Tavily)',
    description: 'Prompt para identificar y analizar competidores usando búsqueda web',
    category: 'Tavily',
    aiService: 'tavily',
    content: `Analiza los competidores de "{company_name}" en el mercado colombiano.

OBJETIVO:
Identificar competidores directos e indirectos, analizar sus fortalezas y debilidades, y determinar oportunidades de diferenciación.

INSTRUCCIONES:
1. Busca competidores en el mismo sector/industria
2. Analiza su presencia digital y estrategia de marketing
3. Identifica sus fortalezas y debilidades
4. Compara precios, servicios y propuesta de valor
5. Encuentra gaps en el mercado
6. Sugiere estrategias de diferenciación

CONTEXTO COLOMBIANO:
- Considerar competidores locales y regionales
- Analizar adaptación al mercado colombiano
- Evaluar cumplimiento de regulaciones locales
- Considerar preferencias culturales colombianas

FORMATO:
- Lista estructurada de competidores
- Análisis comparativo
- Oportunidades de diferenciación
- Recomendaciones estratégicas`,
    variables: ['{company_name}', '{industry}', '{location}'],
    isActive: true,
    lastUpdated: '2025-07-21T22:00:00Z',
    version: '1.0.0'
  },
  {
    id: 'openai-opportunity-identification',
    name: 'Identificación de Oportunidades (OpenAI)',
    description: 'Prompt para identificar oportunidades de crecimiento usando GPT-4',
    category: 'OpenAI',
    aiService: 'openai',
    content: `Identifica oportunidades de crecimiento específicas para "{company_name}" en el mercado colombiano.

ENFOQUE:
- Oportunidades de mercado no aprovechadas
- Nuevos segmentos de clientes
- Expansión de productos/servicios
- Mejoras operacionales
- Digitalización y automatización

CRITERIOS DE EVALUACIÓN:
1. Viabilidad técnica y financiera
2. Alineación con capacidades actuales
3. Potencial de ROI
4. Riesgos y mitigaciones
5. Timeline de implementación
6. Recursos requeridos

CONTEXTO COLOMBIANO:
- Considerar limitaciones de PYMEs
- Evaluar acceso a financiamiento
- Analizar barreras regulatorias
- Considerar infraestructura disponible
- Evaluar competencia local

FORMATO:
- Oportunidades priorizadas por impacto
- Análisis de viabilidad
- Plan de implementación
- Estimación de costos en COP
- Timeline realista`,
    variables: ['{company_name}', '{current_services}', '{target_market}'],
    isActive: true,
    lastUpdated: '2025-07-21T22:00:00Z',
    version: '1.0.0'
  },
  {
    id: 'openai-recommendation-engine',
    name: 'Motor de Recomendaciones (OpenAI)',
    description: 'Prompt para generar recomendaciones específicas usando GPT-4',
    category: 'OpenAI',
    aiService: 'openai',
    content: `Genera recomendaciones específicas y accionables para "{company_name}" basándote en el análisis del mercado colombiano.

TIPOS DE RECOMENDACIONES:
1. ESTRATÉGICAS: Posicionamiento, diferenciación, expansión
2. OPERACIONALES: Eficiencia, procesos, tecnología
3. MARKETING: Digital, tradicional, contenido
4. FINANCIERAS: Optimización de costos, ingresos
5. LEGALES: Cumplimiento, regulaciones

CRITERIOS:
- Específicas y medibles
- Accionables inmediatamente
- Alineadas con capacidades actuales
- Considerar limitaciones de PYMEs
- ROI claro y cuantificable

CONTEXTO COLOMBIANO:
- Adaptadas al mercado local
- Considerar regulaciones DIAN
- Evaluar acceso a recursos
- Considerar preferencias culturales
- Analizar competencia local

FORMATO:
- Recomendaciones priorizadas
- Acciones específicas
- Timeline de implementación
- Costos estimados en COP
- Métricas de éxito
- Riesgos y mitigaciones`,
    variables: ['{company_name}', '{analysis_results}', '{current_challenges}'],
    isActive: true,
    lastUpdated: '2025-07-21T22:00:00Z',
    version: '1.0.0'
  },
  {
    id: 'openai-colombia-context',
    name: 'Contexto Colombiano (OpenAI)',
    description: 'Prompt para análisis específico del mercado colombiano usando GPT-4',
    category: 'OpenAI',
    aiService: 'openai',
    content: `Proporciona contexto específico del mercado colombiano para el análisis de "{company_name}".

ASPECTOS ECONÓMICOS:
- Tamaño del mercado colombiano
- Tendencias de crecimiento del sector
- Factores económicos que afectan el negocio
- Acceso a financiamiento para PYMEs

ASPECTOS REGULATORIOS:
- Regulaciones específicas del sector
- Requisitos DIAN y tributarios
- Cumplimiento de Habeas Data
- Licencias y permisos requeridos

ASPECTOS CULTURALES:
- Preferencias del consumidor colombiano
- Comportamiento de compra
- Canales de distribución preferidos
- Estacionalidad del mercado

ASPECTOS TECNOLÓGICOS:
- Penetración digital en el sector
- Adopción de tecnologías
- Infraestructura disponible
- Barreras tecnológicas

OPORTUNIDADES ESPECÍFICAS:
- Tendencias emergentes
- Gaps en el mercado
- Nichos no atendidos
- Potencial de expansión

FORMATO:
- Análisis estructurado por categorías
- Datos cuantificables cuando sea posible
- Implicaciones para la estrategia
- Recomendaciones específicas`,
    variables: ['{company_name}', '{industry}', '{location}'],
    isActive: true,
    lastUpdated: '2025-07-21T22:00:00Z',
    version: '1.0.0'
  }
]

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<SystemPrompt[]>(demoPrompts)
  const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedAI, setSelectedAI] = useState<string>('all')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'OpenAI': return 'bg-green-100 text-green-800'
      case 'Tavily': return 'bg-blue-100 text-blue-800'
      case 'ElevenLabs': return 'bg-purple-100 text-purple-800'
      case 'Google': return 'bg-red-100 text-red-800'
      case 'Meta': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleEditPrompt = (prompt: SystemPrompt) => {
    setSelectedPrompt(prompt)
    setIsEditing(true)
  }

  const handleSavePrompt = async () => {
    if (!selectedPrompt) return

    try {
      setIsLoading(true)
      // TODO: Implementar guardado real en backend
      console.log('Guardando prompt:', selectedPrompt)
      
      setMessage('✅ Prompt guardado exitosamente')
      setIsEditing(false)
      setSelectedPrompt(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando prompt')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)
    }
  }

  const handleToggleActive = (promptId: string) => {
    setPrompts(prev => prev.map(p => 
      p.id === promptId ? { ...p, isActive: !p.isActive } : p
    ))
  }

  const handleTestPrompt = async (prompt: SystemPrompt) => {
    try {
      setIsLoading(true)
      // TODO: Implementar test real del prompt
      console.log('Probando prompt:', prompt.name)
      
      setMessage(`✅ Prompt "${prompt.name}" probado exitosamente`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error probando prompt')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)
    }
  }

  // Filtrar prompts por IA seleccionada
  const filteredPrompts = selectedAI === 'all' 
    ? prompts 
    : prompts.filter(prompt => prompt.aiService === selectedAI)

  // Obtener lista única de IAs
  const availableAIs = ['all', ...new Set(prompts.map(p => p.aiService))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📝 Prompts del Sistema</h1>
          <p className="text-muted-foreground">
            Gestiona los prompts de IA para análisis automático de empresas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedAI}
            onChange={(e) => setSelectedAI(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {availableAIs.map(ai => (
              <option key={ai} value={ai}>
                {ai === 'all' ? '🤖 Todas las IAs' : `🤖 ${ai.toUpperCase()}`}
              </option>
            ))}
          </select>
          <Button variant="outline">
            📊 Ver Estadísticas
          </Button>
          <Button>
            🔄 Actualizar Todos
          </Button>
        </div>
      </div>

      {/* Mensajes de estado */}
      {message && (
        <div className="p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
          {message}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Métricas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredPrompts.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredPrompts.filter(p => p.isActive).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <span className="text-2xl">🏷️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredPrompts.map(p => p.category)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Diferentes tipos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <span className="text-2xl">🕒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Hoy</div>
            <p className="text-xs text-muted-foreground">
              22:00 hrs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Versión</CardTitle>
            <span className="text-2xl">📦</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.0.0</div>
            <p className="text-xs text-muted-foreground">
              Estable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-xl">📝</span>
                    <span>{prompt.name}</span>
                    <Badge 
                      variant={prompt.isActive ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {prompt.isActive ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {prompt.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Categoría */}
              <div className="flex items-center space-x-2">
                <Badge className={getCategoryColor(prompt.category)}>
                  {prompt.category}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  v{prompt.version}
                </span>
              </div>

              {/* Variables */}
              <div>
                <Label className="text-sm font-medium">Variables:</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {prompt.variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Contenido Preview */}
              <div>
                <Label className="text-sm font-medium">Contenido:</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600 max-h-20 overflow-hidden">
                  {prompt.content.substring(0, 150)}...
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Actualizado: {formatDate(prompt.lastUpdated)}</span>
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditPrompt(prompt)}
                  className="flex-1"
                >
                  ✏️ Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestPrompt(prompt)}
                  className="flex-1"
                >
                  🧪 Probar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(prompt.id)}
                >
                  {prompt.isActive ? '⏸️' : '▶️'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Edición */}
      {isEditing && selectedPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              ✏️ Editar Prompt - {selectedPrompt.name}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="promptName">Nombre</Label>
                <Input
                  id="promptName"
                  value={selectedPrompt.name}
                  onChange={(e) => setSelectedPrompt({
                    ...selectedPrompt,
                    name: e.target.value
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="promptDescription">Descripción</Label>
                <Input
                  id="promptDescription"
                  value={selectedPrompt.description}
                  onChange={(e) => setSelectedPrompt({
                    ...selectedPrompt,
                    description: e.target.value
                  })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="promptContent">Contenido del Prompt</Label>
                <textarea
                  id="promptContent"
                  value={selectedPrompt.content}
                  onChange={(e) => setSelectedPrompt({
                    ...selectedPrompt,
                    content: e.target.value
                  })}
                  className="mt-1 w-full h-64 p-3 border border-gray-300 rounded-md resize-none"
                  placeholder="Ingresa el contenido del prompt..."
                />
              </div>

              <div>
                <Label htmlFor="promptVariables">Variables (separadas por comas)</Label>
                <Input
                  id="promptVariables"
                  value={selectedPrompt.variables.join(', ')}
                  onChange={(e) => setSelectedPrompt({
                    ...selectedPrompt,
                    variables: e.target.value.split(',').map(v => v.trim()).filter(v => v)
                  })}
                  className="mt-1"
                  placeholder="{variable1}, {variable2}, {variable3}"
                />
              </div>

              {/* Mensajes de estado */}
              {message && (
                <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">
                  {message}
                </div>
              )}
              
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Button
                  onClick={handleSavePrompt}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Guardando...' : '💾 Guardar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false)
                    setSelectedPrompt(null)
                  }}
                  disabled={isLoading}
                >
                  ❌ Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 