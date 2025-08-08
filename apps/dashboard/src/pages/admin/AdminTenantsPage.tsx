import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { tenantsApi, type Tenant } from '@/lib/api'

// Fuente de verdad: API /api/v1/tenants

// Función para obtener el color del plan
function getPlanBadge(plan: string) {
  const variants = {
    free: { variant: 'outline' as const, color: 'text-gray-600' },
    starter: { variant: 'default' as const, color: 'text-blue-600' },
    growth: { variant: 'default' as const, color: 'text-green-600' },
    scale: { variant: 'default' as const, color: 'text-purple-600' }
  }
  return variants[plan as keyof typeof variants] || variants.free
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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'free' | 'starter' | 'growth' | 'scale'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [editTenant, setEditTenant] = useState<Tenant | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Cerrar modales con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCreateOpen(false)
        setEditTenant(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const refetch = async () => {
    try {
      setLoading(true)
      const data = await tenantsApi.list()
      setTenants(data)
    } catch (e: any) {
      console.error('Error cargando tenants', e)
      setError(e?.message ?? 'Error cargando tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await tenantsApi.list()
        if (active) setTenants(data)
      } catch (e: any) {
        console.error('Error cargando tenants', e)
        if (active) setError(e?.response?.data?.error || e?.message || 'Error cargando tenants')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => { active = false }
  }, [])

  // Crear Tenant
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    // Normalizar y validar inputs
    const name = String(form.get('name') || '').trim()
    let slug = String(form.get('slug') || '').trim().toLowerCase()
    slug = slug
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9-]/g, '-')                       // solo a-z0-9-
      .replace(/-+/g, '-')                               // sin duplicados
      .replace(/^-|-$/g, '')                             // sin guiones extremos
    if (!name || !slug) {
      setError('Nombre y slug son obligatorios')
      setSuccess(null)
      return
    }
    if (tenants.some(t => t.slug === slug)) {
      setError('Ya existe un tenant con ese slug')
      setSuccess(null)
      return
    }
    const payload = {
      name,
      slug,
      domain: String(form.get('domain') || ''),
      plan: String(form.get('plan') || 'free'),
      is_active: form.get('is_active') === 'on',
      industry: String(form.get('industry') || ''),
      location: String(form.get('location') || ''),
      revenue: 0,
    }
    try {
      setCreating(true)
      await tenantsApi.create(payload as any)
      setCreateOpen(false)
      setError(null)
      setSuccess('PYME creada correctamente')
      await refetch()
    } catch (err: any) {
      console.error('Error creando tenant', err)
      setSuccess(null)
      setError(err?.response?.data?.error || err?.message || 'Error creando tenant')
    } finally {
      setCreating(false)
    }
  }

  // Guardar edición
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editTenant) return
    const form = new FormData(e.currentTarget)
    // Normalizar slug como en creación
    const name = String(form.get('name') || editTenant.name).trim()
    let slug = String(form.get('slug') || editTenant.slug).trim().toLowerCase()
    slug = slug
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const payload = {
      name,
      slug,
      domain: String(form.get('domain') || editTenant.domain || ''),
      plan: String(form.get('plan') || editTenant.plan),
      is_active: form.get('is_active') ? true : false,
      industry: String(form.get('industry') || editTenant.industry || ''),
      location: String(form.get('location') || editTenant.location || ''),
      revenue: Number(form.get('revenue') || editTenant.revenue || 0),
    }
    try {
      setSavingEdit(true)
      await tenantsApi.update(editTenant.id, payload as any)
      setEditTenant(null)
      setError(null)
      setSuccess('PYME actualizada correctamente')
      await refetch()
    } catch (err: any) {
      console.error('Error actualizando tenant', err)
      setSuccess(null)
      setError(err?.response?.data?.error || err?.message || 'Error actualizando tenant')
    } finally {
      setSavingEdit(false)
    }
  }

  // Eliminar tenant
  const handleDelete = async (tenant: Tenant) => {
    if (!confirm(`¿Eliminar la PYME "${tenant.name}"?`)) return
    try {
      await tenantsApi.remove(tenant.id)
      setError(null)
      setSuccess('PYME eliminada correctamente')
      await refetch()
    } catch (err) {
      console.error('Error eliminando tenant', err)
      setSuccess(null)
      setError('Error eliminando tenant')
    }
  }

  const filteredTenants = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return tenants.filter(t => {
      const matchesFilter = selectedFilter === 'all' || t.plan === selectedFilter
      const matchesSearch = (
        t.name?.toLowerCase().includes(term) ||
        t.industry?.toLowerCase().includes(term) ||
        t.location?.toLowerCase().includes(term) ||
        t.domain?.toLowerCase().includes(term) ||
        t.slug?.toLowerCase().includes(term)
      )
      return matchesFilter && matchesSearch
    })
  }, [tenants, selectedFilter, searchTerm])

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
          <Button variant="outline" onClick={() => alert('Exportación aún no implementada')}>
            📊 Exportar Lista
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            ➕ Agregar PYME
          </Button>
        </div>
      </div>

      {/* Banners de estado */}
      {(error || success) && (
        <Card>
          <CardContent className={`pt-4 ${error ? 'text-red-700' : 'text-green-700'}`}>
            <div className="flex items-center justify-between">
              <div>{error ?? success}</div>
              <Button size="sm" variant="outline" onClick={() => { setError(null); setSuccess(null) }}>Cerrar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Editar Tenant */}
      {editTenant && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Editar PYME</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm mb-1">Nombre</label>
                <input name="name" defaultValue={editTenant.name} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Slug</label>
                <input name="slug" defaultValue={editTenant.slug} className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Dominio</label>
                <input name="domain" defaultValue={editTenant.domain || ''} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Plan</label>
                <select name="plan" defaultValue={editTenant.plan} className="w-full border rounded px-3 py-2">
                  <option value="free">Gratis</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="scale">Scale</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Industria</label>
                <input name="industry" defaultValue={editTenant.industry || ''} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Ubicación</label>
                <input name="location" defaultValue={editTenant.location || ''} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Revenue (COP)</label>
                <input name="revenue" type="number" min={0} step={1000} defaultValue={Number(editTenant.revenue || 0)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <input id="is_active_edit" name="is_active" type="checkbox" defaultChecked={!!editTenant.is_active} />
                <label htmlFor="is_active_edit">Activa</label>
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setEditTenant(null)}>Cancelar</Button>
                <Button type="submit" disabled={savingEdit}>{savingEdit ? 'Guardando...' : 'Guardar Cambios'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Modal Crear Tenant */}
      {createOpen && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Agregar PYME</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm mb-1">Nombre</label>
                <input name="name" className="w-full border rounded px-3 py-2" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Slug</label>
                <input name="slug" className="w-full border rounded px-3 py-2" placeholder="mi-pyme" required />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Dominio</label>
                <input name="domain" className="w-full border rounded px-3 py-2" placeholder="mi-pyme.com" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Plan</label>
                <select name="plan" className="w-full border rounded px-3 py-2" defaultValue="free">
                  <option value="free">Gratis</option>
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="scale">Scale</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Industria</label>
                <input name="industry" className="w-full border rounded px-3 py-2" placeholder="Restaurantes" />
              </div>
              <div className="col-span-1">
                <label className="block text-sm mb-1">Ubicación</label>
                <input name="location" className="w-full border rounded px-3 py-2" placeholder="Bogotá" />
              </div>
              <div className="col-span-1 flex items-center gap-2">
                <input id="is_active" name="is_active" type="checkbox" defaultChecked />
                <label htmlFor="is_active">Activa</label>
              </div>
              <div className="col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={creating}>{creating ? 'Creando...' : 'Crear'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tenants.length}</div>
              <p className="text-sm text-muted-foreground">Total PYMEs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tenants.filter(t => t.is_active).length}
              </div>
              <p className="text-sm text-muted-foreground">Activas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCOP(tenants.reduce((sum, t) => sum + (t.revenue || 0), 0))}
              </div>
              <p className="text-sm text-muted-foreground">Revenue Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {tenants.length.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Tenants cargados</p>
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
                Todos ({tenants.length})
              </Button>
              <Button 
                variant={selectedFilter === 'free' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('free')}
              >
                Gratis ({tenants.filter(t => t.plan === 'free').length})
              </Button>
              <Button 
                variant={selectedFilter === 'starter' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('starter')}
              >
                Starter ({tenants.filter(t => t.plan === 'starter').length})
              </Button>
              <Button 
                variant={selectedFilter === 'growth' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('growth')}
              >
                Growth ({tenants.filter(t => t.plan === 'growth').length})
              </Button>
              <Button 
                variant={selectedFilter === 'scale' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setSelectedFilter('scale')}
              >
                Scale ({tenants.filter(t => t.plan === 'scale').length})
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
        {loading && (
          <Card><CardContent className="pt-6">Cargando PYMEs...</CardContent></Card>
        )}
        {error && !loading && (
          <Card><CardContent className="pt-6 text-red-600">{error}</CardContent></Card>
        )}
        {!loading && !error && filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tenant.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge {...getPlanBadge(tenant.plan)}>
                    {tenant.plan.toUpperCase()}
                  </Badge>
                  {tenant.is_active ? (
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
                  <span className="font-mono">{tenant.slug}.tause.pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">NIT:</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ubicación:</span>
                  <span>{tenant.location || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Industria:</span>
                  <span>{tenant.industry || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Revenue:</span>
                  <span className="font-semibold">{formatCOP(tenant.revenue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dominio:</span>
                  <span>{tenant.domain || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desde:</span>
                  <span>{new Date(tenant.created_at).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setEditTenant(tenant)}>
                  👁️ Ver Detalles
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditTenant(tenant)}>
                  ⚙️ Configurar
                </Button>
                <Link to={`/admin/tenants/${tenant.id}/analytics`} title="Ver Analytics">
                  <Button variant="outline" size="sm">📊 Analytics</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => handleDelete(tenant)}>
                  🗑️ Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mensaje si no hay resultados */}
      {!loading && !error && filteredTenants.length === 0 && (
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