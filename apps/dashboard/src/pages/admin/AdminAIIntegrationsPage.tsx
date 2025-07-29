import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

// Mapeo de servicios a información de display
const serviceInfo = {
  'tavily': {
    name: 'Tavily',
    description: 'Investigación web y análisis de mercado',
    icon: '🔍',
    category: 'Research'
  },
  'openai': {
    name: 'OpenAI',
    description: 'GPT-4, GPT-4o, Embeddings, Whisper',
    icon: '🤖',
    category: 'AI/LLM'
  },
  'serper': {
    name: 'Serper',
    description: 'API de búsqueda web alternativa',
    icon: '🔍',
    category: 'Research'
  },
  'elevenlabs': {
    name: 'ElevenLabs',
    description: 'Síntesis de voz conversacional',
    icon: '🎤',
    category: 'Voice'
  },
  'anthropic': {
    name: 'Anthropic',
    description: 'Claude AI para análisis avanzado',
    icon: '🧠',
    category: 'AI/LLM'
  },
  'google-analytics': {
    name: 'Google Analytics',
    description: 'Métricas de tráfico y comportamiento',
    icon: '📊',
    category: 'Analytics'
  },
  'meta-whatsapp': {
    name: 'Meta WhatsApp',
    description: 'WhatsApp Business API',
    icon: '📱',
    category: 'Communication'
  }
}

// Configuraciones de planes
const planConfigs = {
  gratis: {
    openai: { model: 'gpt-4o-mini', requests: 100 },
    tavily: { requests: 50 },
    analysis: 10
  },
  starter: {
    openai: { model: 'gpt-4o-mini', requests: 500 },
    tavily: { requests: 200 },
    analysis: 50
  },
  growth: {
    openai: { model: 'gpt-4o', requests: 2000 },
    tavily: { requests: 1000 },
    analysis: 200
  },
  scale: {
    openai: { model: 'gpt-4o', requests: -1 }, // Ilimitado
    tavily: { requests: -1 },
    analysis: -1
  }
}

export default function AdminAIIntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null)
  const [integrations, setIntegrations] = useState<any[]>([])
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showApiKeyModal, setShowApiKeyModal] = useState(false)
  const [editingService, setEditingService] = useState('')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    apiKey: '',
    category: 'AI/LLM'
  })

  // Simple toast replacement
  const toast = (options: { title: string; description: string; variant?: string }) => {
    console.log(`${options.title}: ${options.description}`)
    if (options.variant === 'destructive') {
      setError(options.description)
    } else {
      setMessage(options.description)
    }
  }

  useEffect(() => {
    loadIntegrations()
  }, [])

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-500' : 'bg-red-500'
  }

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // Ilimitado
    return Math.round((current / limit) * 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

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

  const testConnection = async (integrationId: string) => {
    try {
      setIsLoading(true)
      
      // Obtener la API key real del backend
      const response = await fetch('http://localhost:8080/api/v1/config/')
      const result = await response.json()
      
      if (!result.success) {
        setError('Error obteniendo configuración')
        return
      }
      
      const apiKeyData = result.data.find((key: any) => key.service === integrationId)
      if (!apiKeyData || !apiKeyData.masked_key || apiKeyData.masked_key.includes('***')) {
        setError('API key no configurada. Configura una API key válida primero.')
        return
      }

      // Probar la conexión usando la API key real
      const testResponse = await fetch('http://localhost:8080/api/v1/config/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          service: integrationId, 
          api_key: apiKeyData.masked_key
        }),
      })

      const testResult = await testResponse.json()

      if (testResult.success) {
        setMessage(`✅ Conexión exitosa con ${integrationId}`)
      } else {
        setError(`❌ Error de conexión: ${testResult.error}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)
    }
  }

  const rotateApiKey = (integrationId: string) => {
    console.log(`Rotating API key for ${integrationId}`)
    // Aquí iría la lógica real de rotación
  }

  const handleSaveAPIKey = async (service: string, apiKey: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8080/api/v1/config/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service, api_key: apiKey }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
        // Recargar datos después de un breve delay para evitar bucles
        setTimeout(() => loadIntegrations(), 100)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)
    }
  }

  const handleTestAPIKey = async (service: string, apiKey: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('http://localhost:8080/api/v1/config/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ service, api_key: apiKey }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage(result.message)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 3000)
    }
  }

  const loadIntegrations = async () => {
    console.log('🔄 Iniciando carga de integraciones...')
    setIsLoading(true)
    
    // Datos demo que siempre se cargan para asegurar funcionalidad
    const demoIntegrations = [
      {
        id: 'openai',
        name: 'OpenAI',
        description: 'GPT-4, GPT-4o, Embeddings, Whisper',
        status: 'active',
        apiKey: 'sk-proj-***...***abc123',
        lastUsed: '2025-01-21T10:30:00Z',
        usage: {
          requests: 8547,
          cost: 45.67
        },
        limits: {
          daily: 10000,
          monthly: 300000,
          current: 8547
        },
        icon: '🤖',
        category: 'AI/LLM'
      },
      {
        id: 'tavily',
        name: 'Tavily',
        description: 'Investigación web y análisis de mercado',
        status: 'active',
        apiKey: 'tvly-***...***xyz789',
        lastUsed: '2025-01-21T09:15:00Z',
        usage: {
          requests: 2341,
          cost: 12.45
        },
        limits: {
          daily: 5000,
          monthly: 150000,
          current: 2341
        },
        icon: '🔍',
        category: 'Research'
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'Síntesis de voz conversacional',
        status: 'active',
        apiKey: 'el_***...***def456',
        lastUsed: '2025-01-20T16:45:00Z',
        usage: {
          requests: 156,
          cost: 8.90
        },
        limits: {
          daily: 1000,
          monthly: 30000,
          current: 156
        },
        icon: '🎤',
        category: 'Voice'
      },
      {
        id: 'anthropic',
        name: 'Anthropic',
        description: 'Claude AI para análisis avanzado',
        status: 'inactive',
        apiKey: 'No configurada',
        lastUsed: 'Nunca',
        usage: {
          requests: 0,
          cost: 0
        },
        limits: {
          daily: 2000,
          monthly: 60000,
          current: 0
        },
        icon: '🧠',
        category: 'AI/LLM'
      },
      {
        id: 'serper',
        name: 'Serper',
        description: 'API de búsqueda web alternativa',
        status: 'active',
        apiKey: 'sp_***...***ser123',
        lastUsed: '2025-01-21T11:20:00Z',
        usage: {
          requests: 892,
          cost: 4.46
        },
        limits: {
          daily: 2500,
          monthly: 75000,
          current: 892
        },
        icon: '🔍',
        category: 'Research'
      },
      {
        id: 'google-analytics',
        name: 'Google Analytics',
        description: 'Métricas de tráfico y comportamiento',
        status: 'active',
        apiKey: 'ga_***...***ghi789',
        lastUsed: '2025-01-21T08:00:00Z',
        usage: {
          requests: 1205,
          cost: 0 // Gratis
        },
        limits: {
          daily: -1, // Ilimitado
          monthly: -1,
          current: 1205
        },
        icon: '📊',
        category: 'Analytics'
      }
    ]
    
    try {
      // Intentar cargar datos del backend
      const response = await fetch('http://localhost:8080/api/v1/config/')
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          // Transformar datos del backend al formato esperado por la UI
          const transformedIntegrations = result.data.map((item: any) => {
            const serviceData = serviceInfo[item.service as keyof typeof serviceInfo]
            return {
              id: item.service,
              name: serviceData?.name || item.service,
              description: serviceData?.description || 'Servicio de API',
              status: item.is_active ? 'active' : 'inactive',
              apiKey: item.masked_key || 'No configurada',
              lastUsed: item.last_used || new Date().toISOString(),
              usage: {
                requests: item.usage?.requests || 0,
                cost: item.usage?.cost || 0
              },
              limits: {
                daily: 10000,
                monthly: 300000,
                current: item.usage?.requests || 0
              },
              icon: serviceData?.icon || '🔧',
              category: serviceData?.category || 'Other'
            }
          })
          
          console.log('Datos del backend cargados:', transformedIntegrations)
          setIntegrations(transformedIntegrations)
          setMessage('Datos cargados desde el backend')
        } else {
          throw new Error('Backend response not successful')
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (err) {
      console.error('❌ Error cargando desde backend:', err)
      console.log('📦 Usando datos demo como fallback')
      console.log('📊 Demo integrations count:', demoIntegrations.length)
      
      setIntegrations(demoIntegrations)
      console.log('✅ Estado de integraciones actualizado con datos demo')
      setMessage('Usando datos demo - Backend no disponible')
    } finally {
      console.log('🏁 Finalizando carga de integraciones')
      setIsLoading(false)
    }
    
    // Log final para verificar el estado
    setTimeout(() => {
      console.log('🔍 Estado final de integraciones:', integrations.length)
    }, 100)
  }

  const openApiKeyModal = (service: string) => {
    setEditingService(service)
    setApiKeyValue('')
    setShowApiKeyModal(true)
  }

  const closeApiKeyModal = () => {
    setShowApiKeyModal(false)
    setEditingService('')
    setApiKeyValue('')
  }

  const saveApiKey = async () => {
    if (!apiKeyValue.trim()) {
      setError('La API key no puede estar vacía')
      return
    }

    try {
      setIsLoading(true)
      console.log('Guardando API key para:', editingService)
      console.log('URL:', 'http://localhost:8080/api/v1/config/api-key')
      
      const response = await fetch('http://localhost:8080/api/v1/config/api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          service: editingService, 
          api_key: apiKeyValue.trim() 
        }),
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Response data:', result)

      if (result.success) {
        setMessage(`✅ API key de ${editingService} guardada exitosamente`)
        closeApiKeyModal()
        // Recargar datos
        loadIntegrations()
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 5000) // Aumentar tiempo para ver el error
    }
  }

  const testApiKey = async () => {
    if (!apiKeyValue.trim()) {
      setError('La API key no puede estar vacía')
      return
    }

    try {
      setIsLoading(true)
      console.log('Probando API key para:', editingService)
      console.log('URL:', 'http://localhost:8080/api/v1/config/test-api-key')
      
      const response = await fetch('http://localhost:8080/api/v1/config/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          service: editingService, 
          api_key: apiKeyValue.trim() 
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Response data:', result)

      if (result.success) {
        setMessage(`✅ API key de ${editingService} es válida`)
      } else {
        setError(result.error)
      }
    } catch (err) {
      console.error('Error completo:', err)
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        setMessage('')
        setError('')
      }, 5000) // Aumentar tiempo para ver el error
    }
  }

  // useEffect duplicado eliminado - ya existe uno en línea 98

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 Integraciones de IA</h1>
          <p className="text-muted-foreground">
            Gestiona API keys y configuraciones de inteligencia artificial
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsAddingNew(true)}>
            ➕ Agregar Integración
          </Button>
          <Button>
            🔄 Actualizar Todas
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
            <CardTitle className="text-sm font-medium">Total Integraciones</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              5 activas, 1 inactiva
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Mensual</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(106.26)}</div>
            <p className="text-xs text-muted-foreground">
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requests Hoy</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,137</div>
            <p className="text-xs text-muted-foreground">
              67% del límite diario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Activos</CardTitle>
            <span className="text-2xl">🤖</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">
              En 89 tenants
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Integraciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integrations.map((integration: any) => (
          <Card key={integration.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {integration.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(integration.status)}`} />
                  <Badge variant={integration.status === 'active' ? 'default' : 'secondary'}>
                    {integration.status === 'active' ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* API Key */}
              <div>
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    value={integration.apiKey}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => rotateApiKey(integration.id)}
                  >
                    🔄
                  </Button>
                </div>
              </div>

              {/* Uso */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Requests</Label>
                  <div className="text-lg font-semibold">
                    {integration.usage.requests.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Último uso: {formatDate(integration.lastUsed)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Costo</Label>
                  <div className="text-lg font-semibold">
                    {formatCurrency(integration.usage.cost)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Este mes
                  </div>
                </div>
              </div>

              {/* Límites */}
              {integration.limits.monthly !== -1 && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Uso del límite</span>
                    <span className={getUsageColor(getUsagePercentage(integration.limits.current, integration.limits.monthly))}>
                      {getUsagePercentage(integration.limits.current, integration.limits.monthly)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        getUsagePercentage(integration.limits.current, integration.limits.monthly) < 50
                          ? 'bg-green-500'
                          : getUsagePercentage(integration.limits.current, integration.limits.monthly) < 80
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{
                        width: `${Math.min(getUsagePercentage(integration.limits.current, integration.limits.monthly), 100)}%`
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {integration.limits.current.toLocaleString()} / {integration.limits.monthly.toLocaleString()}
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => testConnection(integration.id)}
                  className="flex-1"
                >
                  🧪 Probar Conexión
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openApiKeyModal(integration.id)}
                  className="flex-1"
                >
                  ⚙️ Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuración de Planes */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Configuración de Planes</CardTitle>
          <p className="text-muted-foreground">
            Límites de uso por plan de suscripción
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Plan</th>
                  <th className="text-left p-2">OpenAI</th>
                  <th className="text-left p-2">Tavily</th>
                  <th className="text-left p-2">Análisis</th>
                  <th className="text-left p-2">Agentes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(planConfigs).map(([plan, config]) => (
                  <tr key={plan} className="border-b">
                    <td className="p-2 font-medium capitalize">{plan}</td>
                    <td className="p-2">
                      {config.openai.requests === -1 ? 'Ilimitado' : config.openai.requests.toLocaleString()}
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {config.openai.model}
                      </span>
                    </td>
                    <td className="p-2">
                      {config.tavily.requests === -1 ? 'Ilimitado' : config.tavily.requests.toLocaleString()}
                    </td>
                    <td className="p-2">
                      {config.analysis === -1 ? 'Ilimitado' : config.analysis.toLocaleString()}
                    </td>
                    <td className="p-2">
                      {plan === 'gratis' ? '3 básicos' : 
                       plan === 'starter' ? '5 básicos' :
                       plan === 'growth' ? '10 avanzados' : 'Ilimitados'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Logs de Actividad */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Actividad Reciente</CardTitle>
          <p className="text-muted-foreground">
            Últimas acciones en las integraciones
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: '2025-07-21T12:30:00Z',
                action: 'API Key rotada',
                integration: 'OpenAI',
                user: 'carlos.rodriguez@tause.pro'
              },
              {
                time: '2025-07-21T11:45:00Z',
                action: 'Conexión probada',
                integration: 'Tavily',
                user: 'ana.gomez@tause.pro'
              },
              {
                time: '2025-07-21T10:15:00Z',
                action: 'Límite alcanzado',
                integration: 'Google Analytics',
                user: 'system'
              },
              {
                time: '2025-07-21T09:30:00Z',
                action: 'Integración agregada',
                integration: 'Meta WhatsApp',
                user: 'miguel.torres@tause.pro'
              }
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(log.time)}
                  </span>
                  <span className="font-medium">{log.action}</span>
                  <Badge variant="outline">{log.integration}</Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {log.user}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal para configurar API Key */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              🔑 Configurar API Key - {editingService.toUpperCase()}
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={`Ingresa tu API key de ${editingService}`}
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  className="mt-1"
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
                  onClick={saveApiKey}
                  disabled={isLoading || !apiKeyValue.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Guardando...' : '💾 Guardar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={testApiKey}
                  disabled={isLoading || !apiKeyValue.trim()}
                  className="flex-1"
                >
                  {isLoading ? 'Probando...' : '🧪 Probar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={closeApiKeyModal}
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