import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo de agentes MCP
const demoAgents = [
  {
    id: 'agent-001',
    name: 'Asistente de Ventas',
    description: 'Automatiza leads, cotizaciones y seguimiento de clientes',
    tenant: 'Restaurante El Buen Sabor',
    tenantId: 'buen-sabor',
    model: 'GPT-4o',
    isActive: true,
    lastActive: '2025-01-22T10:30:00Z',
    messagesThisMonth: 2847,
    successRate: 94.2,
    avgResponseTime: 1.2,
    cost: 89.50,
    capabilities: ['lead_generation', 'sales_support', 'customer_follow_up'],
    icon: '💼',
    category: 'Sales'
  },
  {
    id: 'agent-002',
    name: 'Soporte al Cliente',
    description: 'Responde preguntas frecuentes y resuelve problemas básicos',
    tenant: 'Boutique María Fashion',
    tenantId: 'maria-fashion',
    model: 'GPT-4o-mini',
    isActive: true,
    lastActive: '2025-01-22T09:45:00Z',
    messagesThisMonth: 1236,
    successRate: 89.1,
    avgResponseTime: 0.8,
    cost: 45.30,
    capabilities: ['customer_support', 'faq_resolution', 'ticket_routing'],
    icon: '🎧',
    category: 'Support'
  },
  {
    id: 'agent-003',
    name: 'Inventario Inteligente',
    description: 'Gestiona stock, alertas y pedidos automáticos',
    tenant: 'Ferretería Los Tornillos',
    tenantId: 'los-tornillos',
    model: 'Claude-3.5-Sonnet',
    isActive: true,
    lastActive: '2025-01-22T11:15:00Z',
    messagesThisMonth: 856,
    successRate: 97.8,
    avgResponseTime: 2.1,
    cost: 67.80,
    capabilities: ['inventory_management', 'auto_ordering', 'stock_alerts'],
    icon: '📦',
    category: 'Operations'
  },
  {
    id: 'agent-004',
    name: 'Marketing Digital',
    description: 'Crea contenido para redes sociales y campañas automatizadas',
    tenant: 'Cafetería Central',
    tenantId: 'cafe-central',
    model: 'GPT-4o',
    isActive: true,
    lastActive: '2025-01-22T08:20:00Z',
    messagesThisMonth: 645,
    successRate: 91.5,
    avgResponseTime: 3.4,
    cost: 78.90,
    capabilities: ['content_creation', 'social_media', 'campaign_automation'],
    icon: '📱',
    category: 'Marketing'
  },
  {
    id: 'agent-005',
    name: 'Contador Digital',
    description: 'Automatiza facturación DIAN y reportes contables',
    tenant: 'Consultoría Jurídica ABC',
    tenantId: 'juridica-abc',
    model: 'Claude-3.5-Sonnet',
    isActive: true,
    lastActive: '2025-01-22T07:30:00Z',
    messagesThisMonth: 423,
    successRate: 99.1,
    avgResponseTime: 1.8,
    cost: 123.45,
    capabilities: ['invoicing_dian', 'accounting_reports', 'tax_calculations'],
    icon: '🧾',
    category: 'Finance'
  },
  {
    id: 'agent-006',
    name: 'Reservas Automáticas',
    description: 'Gestiona citas, reservas y calendario automáticamente',
    tenant: 'Peluquería Bella Vista',
    tenantId: 'bella-vista',
    model: 'GPT-4o-mini',
    isActive: false,
    lastActive: '2025-01-20T16:45:00Z',
    messagesThisMonth: 234,
    successRate: 88.7,
    avgResponseTime: 1.1,
    cost: 34.20,
    capabilities: ['appointment_booking', 'calendar_management', 'reminder_system'],
    icon: '📅',
    category: 'Scheduling'
  },
  {
    id: 'agent-007',
    name: 'Análisis de Datos',
    description: 'Procesa ventas, genera insights y reportes automatizados',
    tenant: 'Supermercado Mi Pueblo',
    tenantId: 'mi-pueblo',
    model: 'Claude-3.5-Sonnet',
    isActive: true,
    lastActive: '2025-01-22T12:00:00Z',
    messagesThisMonth: 1567,
    successRate: 95.3,
    avgResponseTime: 4.2,
    cost: 156.78,
    capabilities: ['data_analysis', 'report_generation', 'business_insights'],
    icon: '📊',
    category: 'Analytics'
  },
  {
    id: 'agent-008',
    name: 'WhatsApp Bot',
    description: 'Automatiza conversaciones y ventas por WhatsApp Business',
    tenant: 'Domicilios Express',
    tenantId: 'domicilios-express',
    model: 'GPT-4o',
    isActive: true,
    lastActive: '2025-01-22T11:45:00Z',
    messagesThisMonth: 3421,
    successRate: 86.9,
    avgResponseTime: 0.9,
    cost: 167.85,
    capabilities: ['whatsapp_automation', 'order_processing', 'delivery_tracking'],
    icon: '💬',
    category: 'Communication'
  }
]

const models = ['Todos', 'GPT-4o', 'GPT-4o-mini', 'Claude-3.5-Sonnet']
const categories = ['Todos', 'Sales', 'Support', 'Operations', 'Marketing', 'Finance', 'Scheduling', 'Analytics', 'Communication']
const statusOptions = ['Todos', 'Activos', 'Inactivos']

export default function AdminAgentsPage() {
  const [selectedModel, setSelectedModel] = useState('Todos')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAgents = demoAgents.filter(agent => {
    const matchesModel = selectedModel === 'Todos' || agent.model === selectedModel
    const matchesCategory = selectedCategory === 'Todos' || agent.category === selectedCategory
    const matchesStatus = selectedStatus === 'Todos' || 
                          (selectedStatus === 'Activos' && agent.isActive) ||
                          (selectedStatus === 'Inactivos' && !agent.isActive)
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.tenant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesModel && matchesCategory && matchesStatus && matchesSearch
  })

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500'
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600'
    if (rate >= 90) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`
    return `${Math.floor(diffMinutes / 1440)}d ago`
  }

  const totalAgents = demoAgents.length
  const activeAgents = demoAgents.filter(a => a.isActive).length
  const totalMessages = demoAgents.reduce((sum, a) => sum + a.messagesThisMonth, 0)
  const totalCost = demoAgents.reduce((sum, a) => sum + a.cost, 0)
  const avgSuccessRate = demoAgents.reduce((sum, a) => sum + a.successRate, 0) / totalAgents

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🤖 Agentes MCP</h1>
          <p className="text-muted-foreground">
            Gestionar agentes de IA multi-tenant para automatización
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            ⚡ Entrenar Agente
          </Button>
          <Button>
            ➕ Crear Agente
          </Button>
        </div>
      </div>

      {/* Métricas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agentes</CardTitle>
            <span className="text-2xl">🤖</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              {activeAgents} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes/Mes</CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              conversaciones este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Éxito Promedio</CardTitle>
            <span className="text-2xl">📈</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(avgSuccessRate)}`}>
              {avgSuccessRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              tasa de éxito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              USD este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-muted-foreground">
              disponibilidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar agentes por nombre, tenant o descripción..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Filtro por Estado */}
          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Estado:</span>
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Filtro por Modelo */}
          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Modelo:</span>
            {models.map((model) => (
              <Button
                key={model}
                variant={selectedModel === model ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModel(model)}
              >
                {model}
              </Button>
            ))}
          </div>

          {/* Filtro por Categoría */}
          <div className="flex gap-2 overflow-x-auto">
            <span className="text-sm font-medium self-center">Categoría:</span>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Agentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{agent.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {agent.tenant} • {agent.model}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(agent.isActive)}>
                    {agent.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                  <Badge variant="outline">{agent.category}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{agent.description}</p>
              
              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensajes:</span>
                  <span className="font-semibold">{agent.messagesThisMonth.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Éxito:</span>
                  <span className={`font-semibold ${getSuccessRateColor(agent.successRate)}`}>
                    {agent.successRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Respuesta:</span>
                  <span className="font-semibold">{agent.avgResponseTime}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo:</span>
                  <span className="font-semibold">${agent.cost}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Última actividad:</span>
                <span className="font-medium">{formatLastActive(agent.lastActive)}</span>
              </div>

              {/* Capacidades */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">🛠️ Capacidades:</h4>
                <div className="flex flex-wrap gap-1">
                  {agent.capabilities.map((capability) => (
                    <Badge key={capability} variant="secondary" className="text-xs">
                      {capability.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  📊 Métricas
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  ⚙️ Configurar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  🗨️ Chat
                </Button>
                <Button 
                  variant={agent.isActive ? "destructive" : "default"} 
                  size="sm"
                  className="flex-1"
                >
                  {agent.isActive ? "⏹️ Parar" : "▶️ Iniciar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Si no hay resultados */}
      {filteredAgents.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No se encontraron agentes que coincidan con los filtros.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSelectedModel('Todos')
              setSelectedCategory('Todos')
              setSelectedStatus('Todos')
              setSearchTerm('')
            }}>
              🔄 Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 