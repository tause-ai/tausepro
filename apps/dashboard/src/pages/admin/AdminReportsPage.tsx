import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo de reportes y métricas
const reportsData = {
  revenue: {
    thisMonth: 45678900, // COP
    lastMonth: 42345600,
    growth: 7.9,
    byPlan: [
      { plan: 'Gratis', tenants: 45, revenue: 0 },
      { plan: 'Starter', tenants: 52, revenue: 15600000 },
      { plan: 'Growth', tenants: 23, revenue: 20700000 },
      { plan: 'Scale', tenants: 7, revenue: 9378900 }
    ]
  },
  usage: {
    apiCalls: 1245678,
    whatsappMessages: 87432,
    aiTokens: 2345678,
    storageUsed: 567.8 // GB
  },
  geography: [
    { city: 'Bogotá', tenants: 45, revenue: 18500000, growth: 12.5 },
    { city: 'Medellín', tenants: 23, revenue: 12400000, growth: 8.2 },
    { city: 'Cali', tenants: 18, revenue: 8900000, growth: 15.1 },
    { city: 'Barranquilla', tenants: 15, revenue: 4300000, growth: 6.8 },
    { city: 'Cartagena', tenants: 12, revenue: 1578900, growth: -2.1 },
    { city: 'Bucaramanga', tenants: 8, revenue: 890000, growth: 22.3 },
    { city: 'Otras', tenants: 6, revenue: 1200000, growth: 5.5 }
  ],
  performance: {
    uptime: 99.94,
    avgResponseTime: 145, // ms
    errorRate: 0.12, // %
    successfulTransactions: 98.76 // %
  }
}

const availableReports = [
  {
    id: 'revenue-monthly',
    name: 'Reporte de Revenue Mensual',
    description: 'Ingresos detallados por plan y geografía',
    category: 'Financiero',
    format: ['PDF', 'Excel', 'CSV'],
    frequency: 'Mensual',
    lastGenerated: '2025-07-21T08:00:00Z',
    icon: '💰'
  },
  {
    id: 'tenant-usage',
    name: 'Análisis de Uso por Tenant',
    description: 'Métricas de uso de API, WhatsApp y almacenamiento',
    category: 'Técnico',
    format: ['Excel', 'CSV'],
    frequency: 'Semanal',
    lastGenerated: '2025-01-21T06:00:00Z',
    icon: '📊'
  },
  {
    id: 'performance-system',
    name: 'Reporte de Performance',
    description: 'Uptime, latencia y métricas de sistema',
    category: 'Técnico',
    format: ['PDF', 'JSON'],
    frequency: 'Diario',
    lastGenerated: '2025-07-21T00:00:00Z',
    icon: '⚡'
  },
  {
    id: 'user-activity',
    name: 'Actividad de Usuarios Admin',
    description: 'Logins, acciones y uso por administradores',
    category: 'Seguridad',
    format: ['PDF', 'Excel'],
    frequency: 'Semanal',
    lastGenerated: '2025-01-21T10:00:00Z',
    icon: '👥'
  },
  {
    id: 'mcp-agents',
    name: 'Análisis de Agentes MCP',
    description: 'Performance, costos y uso de agentes de IA',
    category: 'AI/Analytics',
    format: ['Excel', 'JSON'],
    frequency: 'Semanal',
    lastGenerated: '2025-01-21T12:00:00Z',
    icon: '🤖'
  },
  {
    id: 'colombia-compliance',
    name: 'Reporte de Cumplimiento DIAN',
    description: 'Facturación electrónica y compliance colombiano',
    category: 'Legal/Compliance',
    format: ['PDF', 'XML'],
    frequency: 'Mensual',
    lastGenerated: '2025-01-20T09:00:00Z',
    icon: '🧾'
  }
]

export default function AdminReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedTimeRange, setSelectedTimeRange] = useState('Este mes')

  const categories = ['Todos', 'Financiero', 'Técnico', 'Seguridad', 'AI/Analytics', 'Legal/Compliance']
  const timeRanges = ['Última semana', 'Este mes', 'Último trimestre', 'Este año']

  const filteredReports = availableReports.filter(report => 
    selectedCategory === 'Todos' || report.category === selectedCategory
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Financiero': return 'bg-green-500'
      case 'Técnico': return 'bg-blue-500'
      case 'Seguridad': return 'bg-red-500'
      case 'AI/Analytics': return 'bg-purple-500'
      case 'Legal/Compliance': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📈 Reportes y Analytics</h1>
          <p className="text-muted-foreground">
            Métricas, análisis y reportes del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {timeRanges.map(range => (
              <option key={range} value={range}>{range}</option>
            ))}
          </select>
          <Button variant="outline">
            📊 Crear Reporte
          </Button>
          <Button>
            ⬇️ Exportar Todos
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportsData.revenue.thisMonth)}</div>
            <p className="text-xs text-green-600 flex items-center">
              ↗️ +{reportsData.revenue.growth}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.usage.apiCalls.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportsData.performance.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              disponibilidad del sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes WhatsApp</CardTitle>
            <span className="text-2xl">💬</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportsData.usage.whatsappMessages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue por Plan */}
      <Card>
        <CardHeader>
          <CardTitle>💰 Revenue por Plan de Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {reportsData.revenue.byPlan.map((plan, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">{plan.plan}</h3>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(plan.revenue)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.tenants} tenants
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(plan.revenue / Math.max(...reportsData.revenue.byPlan.map(p => p.revenue))) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribución Geográfica */}
      <Card>
        <CardHeader>
          <CardTitle>🌎 Distribución Geográfica</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reportsData.geography.map((location, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-lg">{location.city}</span>
                  <Badge variant="outline">{location.tenants} tenants</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatCurrency(location.revenue)}</span>
                  <Badge 
                    className={location.growth >= 0 ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {location.growth >= 0 ? '↗️' : '↘️'} {Math.abs(location.growth)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Performance del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{reportsData.performance.uptime}%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: `${reportsData.performance.uptime}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{reportsData.performance.avgResponseTime}ms</div>
              <p className="text-sm text-muted-foreground">Resp. Promedio</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-blue-600 h-2 rounded-full w-3/4"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{reportsData.performance.errorRate}%</div>
              <p className="text-sm text-muted-foreground">Tasa de Error</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-yellow-600 h-2 rounded-full w-1/12"></div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{reportsData.performance.successfulTransactions}%</div>
              <p className="text-sm text-muted-foreground">Transacciones OK</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full"
                  style={{ width: `${reportsData.performance.successfulTransactions}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros para Reportes */}
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

      {/* Lista de Reportes Disponibles */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Reportes Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{report.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{report.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{report.description}</p>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frecuencia:</span>
                      <span className="font-medium">{report.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Último:</span>
                      <span className="font-medium">{formatDate(report.lastGenerated)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">📄 Formatos disponibles:</h4>
                    <div className="flex gap-1">
                      {report.format.map((format) => (
                        <Badge key={format} variant="secondary" className="text-xs">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      👁️ Ver Último
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      🔄 Generar
                    </Button>
                    <Button size="sm" className="flex-1">
                      ⬇️ Descargar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Uso de Recursos */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Uso de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Almacenamiento</span>
                <span className="font-semibold">{reportsData.usage.storageUsed} GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
              </div>
              <p className="text-xs text-muted-foreground">de 2,000 GB disponibles</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tokens IA</span>
                <span className="font-semibold">{reportsData.usage.aiTokens.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full w-1/2"></div>
              </div>
              <p className="text-xs text-muted-foreground">este mes</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>API Calls</span>
                <span className="font-semibold">{reportsData.usage.apiCalls.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-3/5"></div>
              </div>
              <p className="text-xs text-muted-foreground">de 5M límite mensual</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 