import { useEffect, useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { tenantsApi, type Tenant } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function formatCOP(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminTenantAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const list = await tenantsApi.list()
        const found = list.find(t => t.id === id) || null
        if (active) setTenant(found)
        if (active && !found) setError('PYME no encontrada')
      } catch (e: any) {
        if (active) setError(e?.response?.data?.error || e?.message || 'Error cargando datos')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [id])

  const planBadge = useMemo(() => {
    const variants = {
      free: { variant: 'outline' as const },
      starter: { variant: 'default' as const },
      growth: { variant: 'default' as const },
      scale: { variant: 'default' as const },
    }
    return tenant ? (variants[tenant.plan as keyof typeof variants] || variants.free) : { variant: 'outline' as const }
  }, [tenant])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">📊 Analytics de PYME</h1>
          <p className="text-muted-foreground">Métricas y estado del tenant</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/tenants">
            <Button variant="outline">⬅️ Volver a PYMEs</Button>
          </Link>
        </div>
      </div>

      {loading && (
        <Card><CardContent className="pt-6">Cargando métricas...</CardContent></Card>
      )}
      {error && !loading && (
        <Card><CardContent className="pt-6 text-red-600">{error}</CardContent></Card>
      )}

      {!loading && !error && tenant && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{tenant.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge {...planBadge}>{tenant.plan.toUpperCase()}</Badge>
                  {tenant.is_active ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">✅ Activa</Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600">⏸️ Inactiva</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subdominio:</span><span className="font-mono">{tenant.slug}.tause.pro</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Dominio:</span><span>{tenant.domain || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Industria:</span><span>{tenant.industry || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Ubicación:</span><span>{tenant.location || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Revenue:</span><span className="font-semibold">{formatCOP(tenant.revenue || 0)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Creado:</span><span>{new Date(tenant.created_at).toLocaleString('es-CO')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Actualizado:</span><span>{new Date(tenant.updated_at).toLocaleString('es-CO')}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Plan actual</span><span className="font-medium">{tenant.plan}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span className="font-medium">{tenant.is_active ? 'Activa' : 'Inactiva'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Revenue (total)</span><span className="font-medium">{formatCOP(tenant.revenue || 0)}</span></div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">Próximamente: series temporales y uso por módulo.</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
