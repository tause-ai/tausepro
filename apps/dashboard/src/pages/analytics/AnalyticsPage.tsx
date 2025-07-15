import { useFeatureAccess } from '@/store/paywall'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AnalyticsPage() {
  const hasAccess = useFeatureAccess('analytics')

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <CardTitle>Analytics Avanzados</CardTitle>
            <CardDescription>
              Necesitas el plan Starter o superior para acceder a los analytics detallados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="default" className="w-full">
              Actualizar Plan
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Análisis detallados de tu PYME
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-muted rounded flex items-center justify-center">
              <span className="text-muted-foreground">Gráfico próximamente</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métodos de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>PSE</span>
                <span>45%</span>
              </div>
              <div className="flex justify-between">
                <span>Nequi</span>
                <span>28%</span>
              </div>
              <div className="flex justify-between">
                <span>Efecty</span>
                <span>27%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Regiones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Bogotá</span>
                <span>52%</span>
              </div>
              <div className="flex justify-between">
                <span>Medellín</span>
                <span>23%</span>
              </div>
              <div className="flex justify-between">
                <span>Cali</span>
                <span>25%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 