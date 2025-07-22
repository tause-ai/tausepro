import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo de usuarios administradores
const demoUsers = [
  {
    id: 'user-001',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@tause.pro',
    role: 'super_admin',
    status: 'active',
    lastLogin: '2025-01-22T11:30:00Z',
    createdAt: '2024-08-15T10:00:00Z',
    permissions: ['all'],
    department: 'Engineering',
    location: 'Bogotá, Colombia',
    avatar: '👨‍💻',
    loginCount: 1247,
    tenantsManaged: 127,
    lastActivity: 'Configuró módulo MCP'
  },
  {
    id: 'user-002',
    name: 'Ana María Gómez',
    email: 'ana.gomez@tause.pro',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-01-22T09:15:00Z',
    createdAt: '2024-09-20T14:30:00Z',
    permissions: ['tenants', 'modules', 'support'],
    department: 'Operations',
    location: 'Medellín, Colombia',
    avatar: '👩‍💼',
    loginCount: 892,
    tenantsManaged: 45,
    lastActivity: 'Revisó soporte al cliente'
  },
  {
    id: 'user-003',
    name: 'Miguel Ángel Torres',
    email: 'miguel.torres@tause.pro',
    role: 'support_admin',
    status: 'active',
    lastLogin: '2025-01-22T08:45:00Z',
    createdAt: '2024-10-05T09:00:00Z',
    permissions: ['support', 'tenants'],
    department: 'Customer Success',
    location: 'Cali, Colombia',
    avatar: '👨‍🎧',
    loginCount: 634,
    tenantsManaged: 23,
    lastActivity: 'Atendió ticket de soporte'
  },
  {
    id: 'user-004',
    name: 'Laura Fernández',
    email: 'laura.fernandez@tause.pro',
    role: 'billing_admin',
    status: 'active',
    lastLogin: '2025-01-22T07:20:00Z',
    createdAt: '2024-11-12T11:15:00Z',
    permissions: ['billing', 'reports'],
    department: 'Finance',
    location: 'Barranquilla, Colombia',
    avatar: '👩‍💰',
    loginCount: 423,
    tenantsManaged: 89,
    lastActivity: 'Generó reporte de facturación'
  },
  {
    id: 'user-005',
    name: 'Roberto Silva',
    email: 'roberto.silva@tause.pro',
    role: 'tech_admin',
    status: 'inactive',
    lastLogin: '2025-01-20T16:30:00Z',
    createdAt: '2024-12-01T08:00:00Z',
    permissions: ['system', 'modules'],
    department: 'Engineering',
    location: 'Cartagena, Colombia',
    avatar: '👨‍🔧',
    loginCount: 156,
    tenantsManaged: 12,
    lastActivity: 'Actualizó configuración de sistema'
  },
  {
    id: 'user-006',
    name: 'Claudia Morales',
    email: 'claudia.morales@tause.pro',
    role: 'admin',
    status: 'pending',
    lastLogin: null,
    createdAt: '2025-01-20T15:45:00Z',
    permissions: ['tenants'],
    department: 'Operations',
    location: 'Bucaramanga, Colombia',
    avatar: '👩‍💻',
    loginCount: 0,
    tenantsManaged: 0,
    lastActivity: 'Cuenta creada - pendiente activación'
  }
]

const roles = ['Todos', 'super_admin', 'admin', 'support_admin', 'billing_admin', 'tech_admin']
const statusOptions = ['Todos', 'active', 'inactive', 'pending']
const departments = ['Todos', 'Engineering', 'Operations', 'Customer Success', 'Finance']

export default function AdminUsersPage() {
  const [selectedRole, setSelectedRole] = useState('Todos')
  const [selectedStatus, setSelectedStatus] = useState('Todos')
  const [selectedDepartment, setSelectedDepartment] = useState('Todos')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = demoUsers.filter(user => {
    const matchesRole = selectedRole === 'Todos' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'Todos' || user.status === selectedStatus
    const matchesDepartment = selectedDepartment === 'Todos' || user.department === selectedDepartment
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesStatus && matchesDepartment && matchesSearch
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-500'
      case 'admin': return 'bg-blue-500'
      case 'support_admin': return 'bg-green-500'
      case 'billing_admin': return 'bg-purple-500'
      case 'tech_admin': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin'
      case 'admin': return 'Admin'
      case 'support_admin': return 'Soporte'
      case 'billing_admin': return 'Facturación'
      case 'tech_admin': return 'Técnico'
      default: return role
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'inactive': return 'Inactivo'
      case 'pending': return 'Pendiente'
      default: return status
    }
  }

  const formatLastLogin = (dateString: string | null) => {
    if (!dateString) return 'Nunca'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const totalUsers = demoUsers.length
  const activeUsers = demoUsers.filter(u => u.status === 'active').length
  const pendingUsers = demoUsers.filter(u => u.status === 'pending').length
  const totalLogins = demoUsers.reduce((sum, u) => sum + u.loginCount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👥 Usuarios Administradores</h1>
          <p className="text-muted-foreground">
            Gestionar usuarios y permisos del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            📊 Exportar Lista
          </Button>
          <Button>
            ➕ Crear Usuario
          </Button>
        </div>
      </div>

      {/* Métricas de Usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              administradores registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              de {totalUsers} totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingUsers}</div>
            <p className="text-xs text-muted-foreground">
              esperando activación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <span className="text-2xl">🔐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogins.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              sesiones acumuladas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Buscar usuarios por nombre, email o departamento..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4">
          {/* Filtro por Estado */}
          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Estado:</span>
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
              >
                {status === 'Todos' ? status : getStatusLabel(status)}
              </Button>
            ))}
          </div>

          {/* Filtro por Rol */}
          <div className="flex gap-2">
            <span className="text-sm font-medium self-center">Rol:</span>
            {roles.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className="whitespace-nowrap"
              >
                {role === 'Todos' ? role : getRoleLabel(role)}
              </Button>
            ))}
          </div>

          {/* Filtro por Departamento */}
          <div className="flex gap-2 overflow-x-auto">
            <span className="text-sm font-medium self-center">Departamento:</span>
            {departments.map((dept) => (
              <Button
                key={dept}
                variant={selectedDepartment === dept ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment(dept)}
                className="whitespace-nowrap"
              >
                {dept}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{user.avatar}</span>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.department} • {user.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Métricas del usuario */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último login:</span>
                  <span className="font-medium">{formatLastLogin(user.lastLogin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total logins:</span>
                  <span className="font-semibold">{user.loginCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tenants gestionados:</span>
                  <span className="font-semibold">{user.tenantsManaged}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creado:</span>
                  <span className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
              </div>

              {/* Última actividad */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-sm font-semibold mb-1">📝 Última actividad:</h4>
                <p className="text-sm text-gray-600">{user.lastActivity}</p>
              </div>

              {/* Permisos */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">🔐 Permisos:</h4>
                <div className="flex flex-wrap gap-1">
                  {user.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission === 'all' ? 'Todos los permisos' : permission}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" size="sm" className="flex-1">
                  👁️ Ver Detalles
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  ✏️ Editar
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  🔐 Permisos
                </Button>
                <Button 
                  variant={user.status === 'active' ? "destructive" : "default"} 
                  size="sm"
                  className="flex-1"
                >
                  {user.status === 'active' ? '🔴 Desactivar' : 
                   user.status === 'pending' ? '✅ Activar' : '🔄 Reactivar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Si no hay resultados */}
      {filteredUsers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No se encontraron usuarios que coincidan con los filtros.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSelectedRole('Todos')
              setSelectedStatus('Todos')
              setSelectedDepartment('Todos')
              setSearchTerm('')
            }}>
              🔄 Limpiar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 