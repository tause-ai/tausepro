import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo de módulos de TausePro
const demoModules = [
  {
    id: 'mcp-agents',
    name: 'Agentes MCP',
    description: 'Sistema de agentes de IA multi-tenant para automatización',
    category: 'AI/Automation',
    isEnabled: true,
    version: 'v2.1.4',
    tenants: 89,
    usage: 'Alto',
    configs: {
      maxAgentsPerTenant: 5,
      modelProvider: 'OpenAI GPT-4',
      rateLimit: '100 requests/min'
    },
    icon: '🤖'
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    description: 'Integración completa con WhatsApp Business API para Colombia',
    category: 'Communication',
    isEnabled: true,
    version: 'v1.8.2',
    tenants: 67,
    usage: 'Muy Alto',
    configs: {
      maxMessages: '1000/mes',
      webhook: 'Configurado',
      verification: 'Meta Verified'
    },
    icon: '📱'
  },
  {
    id: 'analytics-colombia',
    name: 'Analytics Colombia',
    description: 'Métricas y analytics específicas para el mercado colombiano',
    category: 'Analytics',
    isEnabled: true,
    version: 'v3.0.1',
    tenants: 124,
    usage: 'Alto',
    configs: {
      dashboards: 'Real-time',
      retention: '2 años',
      export: 'CSV, Excel, PDF'
    },
    icon: '📊'
  },
  {
    id: 'pagos-colombia',
    name: 'Pagos Colombia',
    description: 'PSE, Nequi, Wompi y métodos de pago colombianos',
    category: 'Payments',
    isEnabled: true,
    version: 'v2.3.7',
    tenants: 78,
    usage: 'Alto',
    configs: {
      pse: 'Activo',
      nequi: 'Activo',
      wompi: 'Configurado'
    },
    icon: '💳'
  },
  {
    id: 'facturacion-dian',
    name: 'Facturación DIAN',
    description: 'Facturación electrónica compatible con DIAN Colombia',
    category: 'Legal/Compliance',
    isEnabled: true,
    version: 'v1.9.3',
    tenants: 45,
    usage: 'Medio',
    configs: {
      dianStatus: 'Homologado',
      retention: 'Configurado',
      iva: '19%, 5%, 0%'
    },
    icon: '🧾'
  },
  {
    id: 'e-commerce',
    name: 'E-commerce Avanzado',
    description: 'Tienda online completa con Medusa.js backend',
    category: 'E-commerce',
    isEnabled: true,
    version: 'v4.1.2',
    tenants: 34,
    usage: 'Medio',
    configs: {
      productos: 'Ilimitados',
      payment: 'Multi-gateway',
      shipping: 'Colombia'
    },
    icon: '🛒'
  },
  {
    id: 'crm-pymes',
    name: 'CRM para PYMEs',
    description: 'Sistema CRM especializado para pequeñas y medianas empresas',
    category: 'CRM',
    isEnabled: false,
    version: 'v0.8.1-beta',
    tenants: 12,
    usage: 'Beta',
    configs: {
      contacts: '10,000 límite',
      automation: 'Básica',
      integrations: 'WhatsApp, Email'
    },
    icon: '👥'
  },
  {
    id: 'inventario',
    name: 'Gestión de Inventario',
    description: 'Control de stock e inventario en tiempo real',
    category: 'Operations',
    isEnabled: true,
    version: 'v2.5.6',
    tenants: 56,
    usage: 'Alto',
    configs: {
      productos: 'Ilimitados',
      barcodes: 'Soporte QR/EAN',
      alerts: 'Stock mínimo'
    },
    icon: '📦'
  }
]

const categories = ['Todos', 'AI/Automation', 'Communication', 'Analytics', 'Payments', 'Legal/Compliance', 'E-commerce', 'CRM', 'Operations']

export default function AdminModulesPage() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredModules = demoModules.filter(module => {
    const matchesCategory = selectedCategory === 'Todos' || module.category === selectedCategory
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getUsageBadgeColor = (usage: string) => {
    switch (usage) {
      case 'Muy Alto': return 'bg-red-500'
      case 'Alto': return 'bg-orange-500'
      case 'Medio': return 'bg-yellow-500'
      case 'Beta': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const totalModules = demoModules.length
  const enabledModules = demoModules.filter(m => m.isEnabled).length
  const totalTenants = demoModules.reduce((sum, m) => sum + m.tenants, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔧 Módulos del Sistema</h1>
          <p className="text-muted-foreground">
            Configurar y gestionar funcionalidades de TausePro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            📦 Instalar Módulo
          </Button>
          <Button>
            ⚙️ Configuración Global
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Módulos</CardTitle>
            <span className="text-2xl">🔧</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground">
              {enabledModules} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Módulos Activos</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledModules}</div>
            <p className="text-xs text-muted-foreground">
              de {totalModules} disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants Usando</CardTitle>
            <span className="text-2xl">🏢</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              usos acumulados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Sistema</CardTitle>
            <span className="text-2xl">⚡</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-xs text-muted-foreground">
              uptime módulos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar módulos..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
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

      {/* Lista de Módulos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredModules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{module.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">v{module.version}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getUsageBadgeColor(module.usage)}>
                    {module.usage}
                  </Badge>
                  <Badge variant={module.isEnabled ? "default" : "secondary"}>
                    {module.isEnabled ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{module.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Categoría:</span>
                <Badge variant="outline">{module.category}</Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tenants usando:</span>
                <span className="font-semibold">{module.tenants}</span>
              </div>

              {/* Configuraciones */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">⚙️ Configuraciones:</h4>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {Object.entries(module.configs).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  ⚙️ Configurar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  📊 Métricas
                </Button>
                <Button 
                  variant={module.isEnabled ? "destructive" : "default"} 
                  size="sm"
                  className="flex-1"
                >
                  {module.isEnabled ? "🔴 Desactivar" : "✅ Activar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Si no hay resultados */}
      {filteredModules.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No se encontraron módulos que coincidan con los filtros.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSelectedCategory('Todos')
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