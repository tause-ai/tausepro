import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { PaywallStatus } from '../../components/paywall/PaywallStatus'
import { GoogleConnect } from '../../components/google/GoogleConnect'
import { GoogleSuggestions } from '../../components/google/GoogleSuggestions'
import { 
  TrendingUp, 
  Users, 
  Mail, 
  Calendar, 
  FileText, 
  Settings,
  Plus,
  ArrowRight
} from 'lucide-react'

export default function DashboardPage() {
  // Datos estáticos para el MVP
  const stats = {
    totalAgents: 3,
    activeAgents: 2,
    totalConversations: 45,
    emailsAnalyzed: 12,
    calendarEvents: 8,
    documentsProcessed: 5
  }

  const usage = {
    apiCalls: 75,
    maxApiCalls: 100,
    agents: 2,
    maxAgents: 3,
    whatsappMessages: 30,
    maxWhatsappMessages: 50
  }

  const recentActivity = [
    {
      id: 1,
      type: 'agent_created',
      title: 'Agente de Soporte creado',
      description: 'Nuevo agente configurado para atención al cliente',
      time: '2 horas atrás',
      status: 'success'
    },
    {
      id: 2,
      type: 'email_analyzed',
      title: 'Email analizado',
      description: 'Análisis completado de email de cliente',
      time: '4 horas atrás',
      status: 'success'
    },
    {
      id: 3,
      type: 'calendar_event',
      title: 'Evento de calendario',
      description: 'Reunión programada automáticamente',
      time: '1 día atrás',
      status: 'info'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800'
      case 'warning': return 'bg-yellow-100 text-yellow-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'agent_created': return <Users className="w-4 h-4" />
      case 'email_analyzed': return <Mail className="w-4 h-4" />
      case 'calendar_event': return <Calendar className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Bienvenido a TausePro</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Agente
        </Button>
      </div>

      {/* Paywall Status */}
      <PaywallStatus />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAgents}/{stats.totalAgents}</div>
            <p className="text-xs text-muted-foreground">
              +1 desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversaciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              +12% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Analizados</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.emailsAnalyzed}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Calendar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.calendarEvents}</div>
            <p className="text-xs text-muted-foreground">
              Esta semana
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Google Integration Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Google Connect */}
        <GoogleConnect />

        {/* Google Suggestions */}
        <div className="space-y-4">
          <GoogleSuggestions />
        </div>
      </div>

      {/* Usage Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Uso del Plan</CardTitle>
          <CardDescription>
            Monitoreo de tu uso actual vs límites del plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Llamadas API</span>
              <span>{usage.apiCalls}/{usage.maxApiCalls}</span>
            </div>
            <Progress value={(usage.apiCalls / usage.maxApiCalls) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Agentes</span>
              <span>{usage.agents}/{usage.maxAgents}</span>
            </div>
            <Progress value={(usage.agents / usage.maxAgents) * 100} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mensajes WhatsApp</span>
              <span>{usage.whatsappMessages}/{usage.maxWhatsappMessages}</span>
            </div>
            <Progress value={(usage.whatsappMessages / usage.maxWhatsappMessages) * 100} />
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas acciones y eventos en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Acciones comunes para optimizar tu flujo de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                <span>Crear Agente</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Configura un nuevo agente inteligente
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Analizar Emails</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Revisa y analiza emails automáticamente
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Gestionar Calendar</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Optimiza tu calendario y eventos
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span>Configuración</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Ajusta preferencias y configuraciones
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Ver Analytics</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Revisa métricas y rendimiento
              </p>
            </Button>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                <span>Ver Todo</span>
              </div>
              <p className="text-xs text-gray-500 text-left">
                Accede a todas las funcionalidades
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
