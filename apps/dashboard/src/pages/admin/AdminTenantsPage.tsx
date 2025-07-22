import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo de PYMEs colombianas
const demoTenants = [
  {
    id: '1',
    name: 'Restaurante El Buen Sabor',
    subdomain: 'buen-sabor',
    plan: 'growth',
    nit: '900123456-7',
    city: 'Bogotá',
    department: 'Cundinamarca',
    industry: 'Restaurantes',
    email: 'admin@buensabor.com',
    phone: '+573001234567',
    isActive: true,
    revenue: 2800000,
    apiCalls: 4500,
    createdAt: '2024-08-15',
  },
  {
    id: '2', 
    name: 'Boutique María Fashion',
    subdomain: 'maria-fashion',
    plan: 'starter',
    nit: '800987654-3',
    city: 'Medellín',
    department: 'Antioquia',
    industry: 'Moda',
    email: 'info@mariafashion.co',
    phone: '+573109876543',
    isActive: true,
    revenue: 1200000,
    apiCalls: 2100,
    createdAt: '2024-09-03',
  },
  {
    id: '3',
    name: 'TechSolutions Colombia',
    subdomain: 'techsolutions',
    plan: 'scale',
    nit: '901234567-8',
    city: 'Cali',
    department: 'Valle del Cauca',
    industry: 'Tecnología',
    email: 'contacto@techsolutions.com.co',
    phone: '+573201237890',
    isActive: true,
    revenue: 8500000,
    apiCalls: 12000,
    createdAt: '2024-06-20',
  },
  {
    id: '4',
    name: 'Panadería Doña Rosa',
    subdomain: 'dona-rosa',
    plan: 'gratis',
    nit: '700456789-1',
    city: 'Barranquilla',
    department: 'Atlántico',
    industry: 'Alimentación',
    email: 'rosa@panaderia.com',
    phone: '+573154567890',
    isActive: true,
    revenue: 0,
    apiCalls: 150,
    createdAt: '2024-10-10',
  },
  {
    id: '5',
    name: 'Clínica Dental Sonrisas',
    subdomain: 'sonrisas',
    plan: 'growth',
    nit: '800555444-2',
    city: 'Bucaramanga',
    department: 'Santander',
    industry: 'Salud',
    email: 'citas@sonrisas.com.co',
    phone: '+573175554444',
    isActive: false,
    revenue: 3200000,
    apiCalls: 3800,
    createdAt: '2024-07-12',
  }
]

// Función para obtener el color del plan
function getPlanBadge(plan: string) {
  const variants = {
    gratis: { variant: 'outline' as const, color: 'text-gray-600' },
    starter: { variant: 'default' as const, color: 'text-blue-600' },
    growth: { variant: 'default' as const, color: 'text-green-600' },
    scale: { variant: 'default' as const, color: 'text-purple-600' }
  }
  return variants[plan as keyof typeof variants] || variants.gratis
}

// Función para formatear currency en COP
function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminTenantsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtrar tenants
  const filteredTenants = demoTenants.filter(tenant => {
    const matchesFilter = selectedFilter === 'all' || tenant.plan === selectedFilter
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tenant.industry.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🏢 Gestión de Tenants (PYMEs)</h1>
          <p className="text-muted-foreground">
            Administrar empresas clientes de TausePro
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            📊 Exportar Lista
          </Button>
          <Button>
            ➕ Agregar PYME
          </Button>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{demoTenants.length}</div>
              <p className="text-sm text-muted-foreground">Total PYMEs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {demoTenants.filter(t => t.isActive).length}
              </div>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCOP(demoTenants.reduce((sum, t) => sum + t.revenue, 0))}
              </div>
              <p className="text-sm text-muted-foreground">Revenue Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {demoTenants.reduce((sum, t) => sum + t.apiCalls, 0).toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">API Calls</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex space-x-2">
              <Button 
                variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Todos ({demoTenants.length})
              </Button>
              <Button 
                variant={selectedFilter === 'gratis' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('gratis')}
              >
                Gratis ({demoTenants.filter(t => t.plan === 'gratis').length})
              </Button>
              <Button 
                variant={selectedFilter === 'starter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('starter')}
              >
                Starter ({demoTenants.filter(t => t.plan === 'starter').length})
              </Button>
              <Button 
                variant={selectedFilter === 'growth' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('growth')}
              >
                Growth ({demoTenants.filter(t => t.plan === 'growth').length})
              </Button>
              <Button 
                variant={selectedFilter === 'scale' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('scale')}
              >
                Scale ({demoTenants.filter(t => t.plan === 'scale').length})
              </Button>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad o industria..."
              className="px-3 py-2 border rounded-md flex-1 max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Tenants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tenant.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge {...getPlanBadge(tenant.plan)}>
                    {tenant.plan.toUpperCase()}
                  </Badge>
                  {tenant.isActive ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      ✅ Activa
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">
                      ⏸️ Inactiva
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subdomain:</span>
                  <span className="font-mono">{tenant.subdomain}.tause.pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIT:</span>
                  <span>{tenant.nit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span>{tenant.city}, {tenant.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industria:</span>
                  <span>{tenant.industry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold">{formatCOP(tenant.revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">API Calls:</span>
                  <span>{tenant.apiCalls.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desde:</span>
                  <span>{new Date(tenant.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button variant="outline" size="sm">
                  👁️ Ver Detalles
                </Button>
                <Button variant="outline" size="sm">
                  ⚙️ Configurar
                </Button>
                <Button variant="outline" size="sm">
                  📊 Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {filteredTenants.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <p>No se encontraron PYMEs con los filtros seleccionados.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 