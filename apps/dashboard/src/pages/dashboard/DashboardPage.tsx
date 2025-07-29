import { PaywallStatus } from '../../components/paywall/PaywallStatus'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Bot, 
  Settings, 
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido a TausePro - Plataforma MCP para PYMEs colombianas
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Activo
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análisis Completados</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Activos</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Máximo permitido en plan gratuito
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Enviados</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              5 restantes este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Integraciones</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Google Calendar, Gmail
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Paywall Status */}
        <div className="lg:col-span-1">
          <PaywallStatus />
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>
                Funciones principales de TausePro
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-auto p-4 flex flex-col items-start gap-2">
                <BarChart3 className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Nuevo Análisis</div>
                  <div className="text-xs text-muted-foreground">
                    Analizar empresa
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Bot className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Gestionar Agentes</div>
                  <div className="text-xs text-muted-foreground">
                    Configurar AI agents
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <Zap className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Integraciones MCP</div>
                  <div className="text-xs text-muted-foreground">
                    Conectar servicios
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    Ver métricas
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimas acciones en tu cuenta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Análisis completado</p>
                    <p className="text-xs text-muted-foreground">
                      Empresa ABC analizada exitosamente
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 2h</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Agente creado</p>
                    <p className="text-xs text-muted-foreground">
                      Agente de marketing digital configurado
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 1d</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Integración conectada</p>
                    <p className="text-xs text-muted-foreground">
                      Google Calendar conectado exitosamente
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Hace 3d</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recomendaciones</CardTitle>
          <CardDescription>
            Sugerencias para mejorar tu experiencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Conecta Google MCP</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Conecta tu cuenta de Google para recibir sugerencias de calendario y análisis de emails.
              </p>
              <Button size="sm" variant="outline">
                Conectar Google
              </Button>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span className="font-medium">Crea tu primer agente</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Configura un agente AI personalizado para automatizar tareas específicas de tu empresa.
              </p>
              <Button size="sm" variant="outline">
                Crear Agente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
