import { MetricCard } from '@/components/ui/card'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { useAuth } from '@/store/auth'

export default function DashboardPage() {
  const { tenant } = useAuth()
  
  // Datos simulados de métricas PYME
  const metrics = {
    revenue: {
      current: 2450000,
      previous: 1980000,
      growth: 23.7
    },
    orders: {
      current: 127,
      previous: 98,
      growth: 29.6
    },
    customers: {
      current: 89,
      previous: 76,
      growth: 17.1
    },
    agents: {
      active: 5,
      total: 7,
      conversations: 234
    }
  }

  return (
    <div className="space-y-6">
      {/* Saludo personalizado */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          ¡Hola! Bienvenido a tu dashboard
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de {tenant?.name || 'tu PYME'} en {tenant?.city}
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos del mes"
          value={formatCurrency(metrics.revenue.current)}
          trend={{
            value: metrics.revenue.growth,
            isPositive: true
          }}
          icon="💰"
          description="Facturación noviembre 2024"
        />
        
        <MetricCard
          title="Órdenes"
          value={formatNumber(metrics.orders.current)}
          trend={{
            value: metrics.orders.growth,
            isPositive: true
          }}
          icon="📦"
          description="Pedidos procesados este mes"
        />
        
        <MetricCard
          title="Clientes"
          value={formatNumber(metrics.customers.current)}
          trend={{
            value: metrics.customers.growth,
            isPositive: true
          }}
          icon="👥"
          description="Clientes activos"
        />
        
        <MetricCard
          title="Agentes MCP"
          value={`${metrics.agents.active}/${metrics.agents.total}`}
          icon="🤖"
          description={`${metrics.agents.conversations} conversaciones`}
        />
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas recientes */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Ventas Recientes</h3>
          <div className="space-y-3">
            {[
              { product: 'Camiseta Colombia', amount: 89900, customer: 'María G.', time: 'hace 2 horas' },
              { product: 'Jeans Premium', amount: 129900, customer: 'Carlos R.', time: 'hace 4 horas' },
              { product: 'Zapatos Deportivos', amount: 189900, customer: 'Ana L.', time: 'hace 6 horas' },
            ].map((sale, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">{sale.product}</p>
                  <p className="text-xs text-muted-foreground">{sale.customer} • {sale.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(sale.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actividad de agentes */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="text-lg font-semibold mb-4">Agentes MCP Activos</h3>
          <div className="space-y-3">
            {[
              { name: 'Asistente de Ventas', conversations: 45, status: 'active' },
              { name: 'Soporte Técnico', conversations: 23, status: 'active' },
              { name: 'Calculadora Envíos', conversations: 67, status: 'active' },
              { name: 'Gestor Inventario', conversations: 12, status: 'inactive' },
            ].map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.conversations} conversaciones</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {agent.status === 'active' ? '🟢 Activo' : '⚪ Inactivo'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información importante para PYMEs */}
      <div className="bg-gradient-to-r from-primary/10 to-colombia-yellow/10 rounded-xl border p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-2xl">🇨🇴</span>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Tu PYME en Colombia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Ubicación</p>
                <p className="font-medium">{tenant?.city}, {tenant?.department}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Industria</p>
                <p className="font-medium">{tenant?.industry}</p>
              </div>
              <div>
                <p className="text-muted-foreground">NIT</p>
                <p className="font-medium">{tenant?.nit}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 