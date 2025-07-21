import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { pymeApi } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { DashboardResponse, RecentActivity, UsageDetail } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Zap, 
  Users, 
  MessageSquare, 
  Terminal, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react'

const StatCard = ({ title, value, icon, description }: { title: string; value: string | number; icon: React.ReactNode; description?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
)

const UsageBar = ({ name, usage }: { name: string; usage: UsageDetail }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-muted-foreground">{name}</span>
      <span className="text-sm font-bold">{`${usage.used} / ${usage.limit === -1 ? '∞' : usage.limit}`}</span>
    </div>
    <Progress value={usage.percentage} className="h-2" />
  </div>
)

const RecentActivityItem = ({ activity }: { activity: RecentActivity }) => (
  <div className="flex items-center">
    <div className="ml-4 space-y-1">
      <p className="text-sm font-medium leading-none">{activity.description}</p>
      <p className="text-sm text-muted-foreground">{new Date(activity.timestamp).toLocaleString()}</p>
    </div>
  </div>
)

const DashboardPage = () => {
  const [data, setData] = useState<DashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const tenant = useAuthStore((state) => state.tenant)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await pymeApi.getDashboard()
        setData(response)
        setError(null)
      } catch (err) {
        setError('No se pudo cargar el dashboard. Inténtalo de nuevo más tarde.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    const intervalId = setInterval(fetchData, 30000) // Refrescar cada 30 segundos

    return () => clearInterval(intervalId)
  }, [])

  if (isLoading) {
    return <div>Cargando dashboard...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return <div>No hay datos disponibles.</div>
  }

  const isPaywallBlocked = data.usage.api_calls.percentage >= 100 || data.usage.agents.percentage >= 100

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de {tenant?.name}</h1>
          <p className="text-muted-foreground">Resumen de la actividad y uso de tu cuenta.</p>
        </div>
      </div>

      {isPaywallBlocked && (
        <Alert className="border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-4 w-4 !text-yellow-500" />
          <AlertTitle className="font-bold">Límite del Plan Alcanzado</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            Has alcanzado uno de los límites de tu plan '{data.current_plan}'. Para continuar sin interrupciones, por favor, actualiza tu plan.
            <Button size="sm" variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white ml-4">
              Actualizar Plan <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Llamadas API (Mes)" value={data.metrics.total_api_calls} icon={<Zap className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Agentes Activos" value={data.metrics.total_agents} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Chats Activos" value={data.metrics.active_chats} icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Mensajes Enviados" value={data.metrics.messages_sent} icon={<Terminal className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.recent_activity.length > 0 ? (
              data.recent_activity.map((activity) => (
                <RecentActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No hay actividad reciente.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso del Plan</CardTitle>
            <p className="text-sm text-muted-foreground">Plan actual: <span className="font-bold capitalize">{data.current_plan}</span></p>
          </CardHeader>
          <CardContent className="space-y-4">
            <UsageBar name="Llamadas API" usage={data.usage.api_calls} />
            <UsageBar name="Agentes MCP" usage={data.usage.agents} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
