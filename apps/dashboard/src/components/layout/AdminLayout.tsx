import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAdminStore } from '@/store/admin'
import { Button } from '@/components/ui/button'

// Iconos para el admin dashboard
const icons = {
  dashboard: '📊',
  tenants: '🏢',
  modules: '🔧',
  agents: '🤖',
  system: '⚙️',
  users: '👥',
  reports: '📈',
  logs: '📋',
  logout: '🚪',
  user: '👤',
  settings: '🔧'
}

// Navegación del Super Admin
const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin/dashboard', 
    icon: icons.dashboard,
    description: 'Vista general del sistema'
  },
  { 
    name: 'Tenants (PYMEs)', 
    href: '/admin/tenants', 
    icon: icons.tenants,
    description: 'Gestionar empresas clientes'
  },
  { 
    name: 'Módulos', 
    href: '/admin/modules', 
    icon: icons.modules,
    description: 'Configurar funcionalidades'
  },
  { 
    name: 'Agentes MCP', 
    href: '/admin/agents', 
    icon: icons.agents,
    description: 'Gestionar agentes de IA'
  },
  { 
    name: 'Sistema', 
    href: '/admin/system', 
    icon: icons.system,
    description: 'Configuración global'
  },
  { 
    name: 'Usuarios Admin', 
    href: '/admin/users', 
    icon: icons.users,
    description: 'Gestionar administradores'
  },
  { 
    name: 'Reportes', 
    href: '/admin/reports', 
    icon: icons.reports,
    description: 'Analytics y métricas'
  },
                {
                name: 'Configuración',
                href: '/admin/settings',
                icon: icons.settings,
                description: 'Ajustes del Super Admin'
              },
              {
                name: 'Integraciones IA',
                href: '/admin/ai-integrations',
                icon: icons.agents,
                description: 'API Keys y configuraciones'
              },
]

export default function AdminLayout() {
  const location = useLocation()
  const { currentUser, systemMetrics } = useAdminStore()

  const handleLogout = () => {
    // TODO: Implementar logout del admin
    localStorage.removeItem('admin-token')
    window.location.href = '/admin/login'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-slate-200">
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">TP</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-foreground">
                  TausePro Admin
                </h2>
                <p className="text-sm text-muted-foreground">
                  Super Administrador
                </p>
              </div>
            </div>
          </div>

          {/* Métricas rápidas */}
          {systemMetrics && (
            <div className="p-4 border-b border-slate-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Total Tenants</span>
                  <span className="text-sm font-semibold">{systemMetrics.overview.totalTenants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Activos</span>
                  <span className="text-sm font-semibold text-green-600">{systemMetrics.overview.activeTenants}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Revenue</span>
                  <span className="text-sm font-semibold">
                    ${(systemMetrics.overview.totalRevenueCOP / 1000000).toFixed(1)}M COP
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-colors group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                  title={item.description}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1">
                    <span className="font-medium">{item.name}</span>
                    <p className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-slate-200">
            <div className="space-y-3">
              {/* Info del usuario admin */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm">{icons.user}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser?.name || 'Super Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {currentUser?.role || 'super_admin'}
                  </p>
                </div>
              </div>

              {/* Botón de logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-sm"
                onClick={handleLogout}
              >
                <span className="mr-2">{icons.logout}</span>
                Cerrar sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pl-80">
        {/* Header superior */}
        <header className="sticky top-0 z-40 bg-background border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-foreground">
                {getPageTitle(location.pathname)}
              </h1>
              <span className="text-sm text-muted-foreground">
                {getPageDescription(location.pathname)}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado del sistema */}
              {systemMetrics && (
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sistema Operativo</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Uptime: {systemMetrics.performance.uptime}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Usuarios: {systemMetrics.performance.concurrentUsers}</span>
                  </div>
                </div>
              )}
              
              {/* Botón de configuración rápida */}
              <Button variant="outline" size="sm">
                <span className="mr-2">{icons.settings}</span>
                Configuración
              </Button>
            </div>
          </div>
        </header>

        {/* Contenido de la página */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Función para obtener el título de la página
function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/admin/dashboard': 'Dashboard del Sistema',
    '/admin/tenants': 'Gestión de Tenants',
    '/admin/modules': 'Configuración de Módulos',
    '/admin/agents': 'Gestión de Agentes MCP',
    '/admin/system': 'Configuración del Sistema',
    '/admin/users': 'Usuarios Administradores',
                    '/admin/reports': 'Reportes y Analytics',
                '/admin/settings': 'Configuración Super Admin',
                '/admin/ai-integrations': 'Integraciones de IA',
  }
  
  return titles[pathname] || 'TausePro Admin'
}

// Función para obtener la descripción de la página
function getPageDescription(pathname: string): string {
  const descriptions: Record<string, string> = {
    '/admin/dashboard': 'Vista general del estado del sistema',
    '/admin/tenants': 'Gestionar empresas clientes y sus configuraciones',
    '/admin/modules': 'Habilitar y configurar funcionalidades del sistema',
    '/admin/agents': 'Crear y gestionar agentes de inteligencia artificial',
    '/admin/system': 'Configuración global y parámetros del sistema',
    '/admin/users': 'Gestionar usuarios administradores del sistema',
                    '/admin/reports': 'Reportes detallados y métricas de uso',
                '/admin/settings': 'Ajustes personales y configuración del Super Admin',
                '/admin/ai-integrations': 'Gestiona API keys y configuraciones de IA',
  }
  
  return descriptions[pathname] || 'Panel de administración'
} 