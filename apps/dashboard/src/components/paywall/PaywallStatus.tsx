import { usePaywall } from '../../hooks/usePaywall'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export function PaywallStatus() {
  const { 
    limits, 
    loading, 
    error, 
    isLimited, 
    plan, 
    canUseFeature, 
    resetLimits 
  } = usePaywall()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando límites de uso...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error al cargar límites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!limits) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No se pudieron cargar los límites</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Intenta recargar la página o contacta soporte.
          </p>
        </CardContent>
      </Card>
    )
  }

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (current: number, limit: number) => {
    if (current >= limit) return <XCircle className="h-4 w-4 text-red-500" />
    if (current >= limit * 0.75) return <AlertCircle className="h-4 w-4 text-yellow-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Límites de Uso</CardTitle>
            <CardDescription>
              Plan actual: <Badge variant={plan === 'free' ? 'secondary' : 'default'}>{plan}</Badge>
            </CardDescription>
          </div>
          {isLimited && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Límite alcanzado
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* API Calls */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(limits.api_calls.current, limits.api_calls.limit)}
              <span className="font-medium">Llamadas API</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {limits.api_calls.current} / {limits.api_calls.limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(limits.api_calls.current, limits.api_calls.limit)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {canUseFeature('api_calls') 
              ? `${limits.api_calls.limit - limits.api_calls.current} llamadas restantes`
              : 'Límite alcanzado'
            }
          </p>
        </div>

        {/* MCP Agents */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(limits.mcp_agents.current, limits.mcp_agents.limit)}
              <span className="font-medium">Agentes MCP</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {limits.mcp_agents.current} / {limits.mcp_agents.limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(limits.mcp_agents.current, limits.mcp_agents.limit)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {canUseFeature('mcp_agents') 
              ? `${limits.mcp_agents.limit - limits.mcp_agents.current} agentes restantes`
              : 'Límite alcanzado'
            }
          </p>
        </div>

        {/* WhatsApp Messages */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(limits.whatsapp_messages.current, limits.whatsapp_messages.limit)}
              <span className="font-medium">Mensajes WhatsApp</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {limits.whatsapp_messages.current} / {limits.whatsapp_messages.limit}
            </span>
          </div>
          <Progress 
            value={getUsagePercentage(limits.whatsapp_messages.current, limits.whatsapp_messages.limit)}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {canUseFeature('whatsapp_messages') 
              ? `${limits.whatsapp_messages.limit - limits.whatsapp_messages.current} mensajes restantes`
              : 'Límite alcanzado'
            }
          </p>
        </div>

        {/* Upgrade Plan */}
        {isLimited && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Límite alcanzado</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Has alcanzado el límite de tu plan gratuito. 
              Actualiza tu plan para continuar usando todas las funciones.
            </p>
            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
              Actualizar Plan
            </Button>
          </div>
        )}

        {/* Reset Button (solo para testing) */}
        <div className="mt-4 pt-4 border-t">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetLimits}
            className="w-full"
          >
            Resetear Límites (Testing)
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 