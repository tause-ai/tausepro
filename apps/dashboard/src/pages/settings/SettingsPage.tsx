import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanBadge } from '@/components/ui/badge'
import { useAuthStore as useAuth } from '@/store/auth'
import { usePaywall, usePlanInfo } from '@/store/paywall'

export default function SettingsPage() {
  const { tenant } = useAuth()
  const { plan } = usePaywall()
  const planInfo = usePlanInfo()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la información de tu PYME
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <p>{tenant?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">NIT</label>
              <p>{tenant?.nit}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Ciudad</label>
              <p>{tenant?.city}, {tenant?.department}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Actual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Plan:</span>
                <PlanBadge plan={plan} />
              </div>
              <div>
                <span>Precio: {planInfo.price === 0 ? 'Gratis' : `$${planInfo.price.toLocaleString()} COP/mes`}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 