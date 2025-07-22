import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Datos demo de integraciones de IA
const demoIntegrations = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-4o, Embeddings, Whisper',
    status: 'active',
    apiKey: 'sk-...***...xyz',
    lastUsed: '2025-01-22T12:30:00Z',
    usage: {
      requests: 1247,
      tokens: 2345678,
      cost: 89.50
    },
    limits: {
      daily: 10000,
      monthly: 300000,
      current: 1247
    },
    icon: '🤖',
    category: 'AI/LLM'
  },
  {
    id: 'tavily',
    name: 'Tavily',
    description: 'Investigación web y análisis de mercado',
    status: 'active',
    apiKey: 'tvly-...***...abc',
    lastUsed: '2025-01-22T11:45:00Z',
    usage: {
      requests: 89,
      searches: 234,
      cost: 12.30
    },
    limits: {
      daily: 1000,
      monthly: 30000,
      current: 89
    },
    icon: '🔍',
    category: 'Research'
  },
  {
    id: '11labs',
    name: 'ElevenLabs',
    description: 'Síntesis de voz conversacional',
    status: 'inactive',
    apiKey: 'xi-api-...***...def',
    lastUsed: '2025-01-20T15:20:00Z',
    usage: {
      requests: 0,
      characters: 0,
      cost: 0
    },
    limits: {
      daily: 10000,
      monthly: 300000,
      current: 0
    },
    icon: '🎤',
    category: 'Voice'
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Métricas de tráfico y comportamiento',
    status: 'active',
    apiKey: 'AIza...***...ghi',
    lastUsed: '2025-01-22T10:15:00Z',
    usage: {
      requests: 567,
      reports: 23,
      cost: 0
    },
    limits: {
      daily: 10000,
      monthly: 300000,
      current: 567
    },
    icon: '📊',
    category: 'Analytics'
  },
  {
    id: 'meta-whatsapp',
    name: 'Meta WhatsApp',
    description: 'WhatsApp Business API',
    status: 'active',
    apiKey: 'EAA...***...jkl',
    lastUsed: '2025-01-22T09:30:00Z',
    usage: {
      requests: 1234,
      messages: 5678,
      cost: 0
    },
    limits: {
      daily: 1000,
      monthly: 30000,
      current: 1234
    },
    icon: '📱',
    category: 'Communication'
  }
]

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
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    apiKey: '',
    category: 'AI/LLM'
  })

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
      minute: '2-digit'
    })
  }

  const testConnection = (integrationId: string) => {
    console.log(`Testing connection for ${integrationId}`)
    // Aquí iría la lógica real de testing
  }

  const rotateApiKey = (integrationId: string) => {
    console.log(`Rotating API key for ${integrationId}`)
    // Aquí iría la lógica real de rotación
  }

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

      {/* Métricas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integraciones</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              4 activas, 1 inactiva
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Mensual</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(101.80)}</div>
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
        {demoIntegrations.map((integration) => (
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
                  onClick={() => setSelectedIntegration(integration.id)}
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
                time: '2025-01-22T12:30:00Z',
                action: 'API Key rotada',
                integration: 'OpenAI',
                user: 'carlos.rodriguez@tause.pro'
              },
              {
                time: '2025-01-22T11:45:00Z',
                action: 'Conexión probada',
                integration: 'Tavily',
                user: 'ana.gomez@tause.pro'
              },
              {
                time: '2025-01-22T10:15:00Z',
                action: 'Límite alcanzado',
                integration: 'Google Analytics',
                user: 'system'
              },
              {
                time: '2025-01-22T09:30:00Z',
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
    </div>
  )
} 