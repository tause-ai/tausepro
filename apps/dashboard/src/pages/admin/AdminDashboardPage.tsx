import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo del dashboard principal
const dashboardData = {
  metrics: {
      totalTenants: 127,
      activeTenants: 124,
    totalRevenue: 45678900, // COP
    monthlyGrowth: 12.5,
    apiCalls: 1245678,
    uptime: 99.9
  },
  geography: [
    { city: 'Bogotá', tenants: 45, percentage: 35.4, revenue: 18500000 },
    { city: 'Medellín', tenants: 23, percentage: 18.1, revenue: 12400000 },
    { city: 'Cali', tenants: 18, percentage: 14.2, revenue: 8900000 },
    { city: 'Barranquilla', tenants: 15, percentage: 11.8, revenue: 4300000 },
    { city: 'Otras', tenants: 26, percentage: 20.5, revenue: 1578900 }
  ],
  plans: [
    { name: 'Gratis', tenants: 45, percentage: 35.4, color: 'bg-gray-500' },
    { name: 'Starter', tenants: 52, percentage: 40.9, color: 'bg-blue-500' },
    { name: 'Growth', tenants: 23, percentage: 18.1, color: 'bg-green-500' },
    { name: 'Scale', tenants: 7, percentage: 5.5, color: 'bg-purple-500' }
  ],
  recentActivity: [
    {
      type: 'tenant',
      message: 'Nuevo tenant: Restaurante El Buen Sabor',
      time: '5 min ago',
      icon: '🏢'
    },
    {
      type: 'agent',
      message: 'Agente MCP desplegado para María Fashion',
      time: '12 min ago',
      icon: '🤖'
    },
    {
      type: 'payment',
      message: 'Pago procesado: $890,000 COP',
      time: '18 min ago',
      icon: '💰'
    },
    {
      type: 'system',
      message: 'Actualización del sistema completada',
      time: '1 hora ago',
      icon: '⚡'
    }
      ],
  systemStatus: [
    { service: 'MCP Server', status: 'online', uptime: '99.9%' },
    { service: 'PostgreSQL', status: 'online', uptime: '99.8%' },
    { service: 'Redis Cache', status: 'online', uptime: '100%' },
    { service: 'WhatsApp API', status: 'online', uptime: '98.9%' }
  ]
}

export default function AdminDashboardPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 Dashboard Super Admin</h1>
          <p className="text-muted-foreground">
            Vista general del estado del sistema TausePro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            📊 Exportar Reporte
          </Button>
          <Button>
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData.metrics.activeTenants} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Total</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(dashboardData.metrics.totalRevenue)}</div>
            <p className="text-xs text-green-600">
              ↗️ +{dashboardData.metrics.monthlyGrowth}% este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <span className="text-2xl">🔗</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.metrics.apiCalls.toLocaleString()}</div>
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
            <div className="text-2xl font-bold text-green-600">{dashboardData.metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              disponibilidad del sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución Geográfica */}
      <Card>
        <CardHeader>
            <CardTitle>🌎 Distribución por Ciudades</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {dashboardData.geography.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{location.city}</div>
                    <Badge variant="outline">{location.tenants} tenants</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(location.revenue)}</div>
                    <div className="text-sm text-muted-foreground">{location.percentage}%</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

        {/* Distribución por Planes */}
      <Card>
        <CardHeader>
            <CardTitle>📊 Distribución por Planes</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {dashboardData.plans.map((plan, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${plan.color}`}></div>
                      <span className="font-medium">{plan.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{plan.tenants}</span>
                      <span className="text-sm text-muted-foreground">({plan.percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${plan.color} h-2 rounded-full transition-all`}
                      style={{ width: `${plan.percentage}%` }}
                    ></div>
                  </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actividad Reciente */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <span className="text-2xl">{activity.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                  </div>
                ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver Todas las Actividades
            </Button>
        </CardContent>
      </Card>

        {/* Estado del Sistema */}
      <Card>
        <CardHeader>
            <CardTitle>⚡ Estado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              {dashboardData.systemStatus.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                    <span className="font-medium">{service.service}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {service.uptime} uptime
                  </div>
                </div>
              ))}
          </div>
            <Button variant="outline" className="w-full mt-4">
              🔧 Ver Sistema Completo
            </Button>
        </CardContent>
      </Card>
      </div>

      {/* Enlaces Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>🚀 Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">🏢</span>
              <span>Gestionar Tenants</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">🤖</span>
              <span>Ver Agentes MCP</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">📊</span>
              <span>Generar Reporte</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <span className="text-2xl">⚙️</span>
              <span>Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 