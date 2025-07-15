import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/store/auth'
import { usePaywall, usePlanInfo } from '@/store/paywall'
import { Button } from '@/components/ui/button'
import { PlanBadge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

// Iconos (usando emojis para simplicidad - en producción usar Lucide)
const icons = {
  dashboard: '📊',
  analytics: '📈',
  agents: '🤖',
  settings: '⚙️',
  logout: '🚪',
  upgrade: '⬆️',
  user: '👤',
  company: '🏢'
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: icons.dashboard },
  { name: 'Analytics', href: '/analytics', icon: icons.analytics, requiredPlan: 'starter' },
  { name: 'Agentes MCP', href: '/agents', icon: icons.agents },
  { name: 'Configuración', href: '/settings', icon: icons.settings },
]

export default function DashboardLayout() {
  const location = useLocation()
  const { user, tenant, logout } = useAuth()
  const { plan, isBlocked } = usePaywall()
  const planInfo = usePlanInfo()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">TP</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-foreground truncate">
                  TausePro
                </h2>
                <p className="text-xs text-muted-foreground truncate">
                  {tenant?.name || 'Mi PYME'}
                </p>
              </div>
            </div>
          </div>

          {/* Plan actual */}
          <div className="p-4 border-b border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Plan actual</span>
                <PlanBadge plan={plan} />
              </div>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(planInfo.price)}/mes
              </div>
              {plan !== 'scale' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  asChild
                >
                  <Link to="/settings?tab=billing">
                    {icons.upgrade} Actualizar
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Navegación */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              const isFeatureBlocked = item.requiredPlan && isBlocked('analytics')
              
              return (
                <Link
                  key={item.href}
                  to={isFeatureBlocked ? '#' : item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isFeatureBlocked
                        ? 'text-muted-foreground cursor-not-allowed opacity-50'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }
                  `}
                  onClick={(e) => {
                    if (isFeatureBlocked) {
                      e.preventDefault()
                    }
                  }}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.name}</span>
                  {isFeatureBlocked && (
                    <span className="text-xs">🔒</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-border">
            <div className="space-y-3">
              {/* Info del usuario */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-xs">{icons.user}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.role === 'owner' ? 'Propietario' : 'Empleado'}
                  </p>
                </div>
              </div>

              {/* Botón de logout */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-xs"
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
      <div className="pl-64">
        {/* Header superior */}
        <header className="sticky top-0 z-40 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-foreground">
                {getPageTitle(location.pathname)}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Info de la empresa */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{icons.company}</span>
                <span>{tenant?.city}, {tenant?.department}</span>
              </div>
              
              {/* NIT */}
              <div className="text-sm text-muted-foreground">
                NIT: {tenant?.nit}
              </div>
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

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/analytics': 'Analytics',
    '/agents': 'Agentes MCP',
    '/settings': 'Configuración',
  }
  
  return titles[pathname] || 'TausePro'
} 