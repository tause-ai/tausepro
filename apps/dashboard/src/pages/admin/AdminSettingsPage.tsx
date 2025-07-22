import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Configuraciones del Super Admin
const adminSettings = {
  general: [
    { key: 'admin_notifications', label: 'Notificaciones de Admin', value: true, type: 'boolean', description: 'Recibir alertas del sistema' },
    { key: 'email_notifications', label: 'Notificaciones por Email', value: true, type: 'boolean', description: 'Alertas críticas por correo' },
    { key: 'dashboard_refresh', label: 'Actualización Dashboard', value: 30, type: 'select', options: [10, 30, 60, 120], description: 'Segundos entre actualizaciones' },
    { key: 'timezone', label: 'Zona Horaria', value: 'America/Bogota', type: 'select', options: ['America/Bogota', 'UTC', 'America/New_York'], description: 'Zona horaria para reportes' }
  ],
  security: [
    { key: 'two_factor_enabled', label: 'Autenticación 2FA', value: true, type: 'boolean', description: 'Seguridad adicional para login' },
    { key: 'session_timeout', label: 'Timeout de Sesión', value: 60, type: 'select', options: [30, 60, 120, 240], description: 'Minutos de inactividad' },
    { key: 'ip_whitelist_enabled', label: 'Lista Blanca de IPs', value: false, type: 'boolean', description: 'Restringir acceso por IP' },
    { key: 'audit_logs_retention', label: 'Retención de Logs', value: 90, type: 'select', options: [30, 60, 90, 180], description: 'Días de retención' }
  ],
  monitoring: [
    { key: 'alert_downtime', label: 'Alertas de Downtime', value: true, type: 'boolean', description: 'Notificar caídas del sistema' },
    { key: 'alert_high_usage', label: 'Alertas de Alto Uso', value: true, type: 'boolean', description: 'Notificar uso excesivo de recursos' },
    { key: 'alert_threshold_cpu', label: 'Umbral CPU (%)', value: 80, type: 'number', description: 'Porcentaje para alertar' },
    { key: 'alert_threshold_memory', label: 'Umbral Memoria (%)', value: 85, type: 'number', description: 'Porcentaje para alertar' }
  ],
  integrations: [
    { key: 'slack_webhooks', label: 'Webhooks Slack', value: 'https://hooks.slack.com/services/...', type: 'text', description: 'URL para notificaciones Slack' },
    { key: 'telegram_bot', label: 'Bot de Telegram', value: '', type: 'text', description: 'Token del bot para alertas' },
    { key: 'webhook_signature', label: 'Firma de Webhooks', value: 'whsec_...', type: 'text', description: 'Clave secreta para validación' }
  ]
}

const recentActivity = [
  {
    id: 1,
    action: 'Configuración actualizada',
    details: 'Modificó umbral de CPU a 80%',
    timestamp: '2025-07-21T11:30:00Z',
    type: 'config'
  },
  {
    id: 2,
    action: 'Usuario creado',
    details: 'Creó cuenta para claudia.morales@tause.pro',
    timestamp: '2025-07-21T10:15:00Z',
    type: 'user'
  },
  {
    id: 3,
    action: 'Módulo activado',
    details: 'Habilitó facturación DIAN para todos los tenants',
    timestamp: '2025-07-21T09:45:00Z',
    type: 'module'
  },
  {
    id: 4,
    action: 'Reporte generado',
    details: 'Exportó reporte mensual de revenue',
    timestamp: '2025-07-21T08:30:00Z',
    type: 'report'
  },
  {
    id: 5,
    action: 'Sistema reiniciado',
    details: 'Reinició servicio MCP después de actualización',
    timestamp: '2025-01-21T22:00:00Z',
    type: 'system'
  }
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [tempSettings, setTempSettings] = useState(adminSettings)
  const [hasChanges, setHasChanges] = useState(false)

  const tabs = [
    { id: 'general', label: '⚙️ General', icon: '⚙️' },
    { id: 'security', label: '🔒 Seguridad', icon: '🔒' },
    { id: 'monitoring', label: '📊 Monitoreo', icon: '📊' },
    { id: 'integrations', label: '🔗 Integraciones', icon: '🔗' }
  ]

  const updateSetting = (category: string, key: string, value: any) => {
    setTempSettings(prev => ({
      ...prev,
      [category]: prev[category as keyof typeof prev].map(setting => 
        setting.key === key ? { ...setting, value } : setting
      )
    }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    // Aquí iría la lógica para guardar en el backend
    console.log('Guardando configuraciones:', tempSettings)
    setHasChanges(false)
  }

  const resetSettings = () => {
    setTempSettings(adminSettings)
    setHasChanges(false)
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'config': return '⚙️'
      case 'user': return '👤'
      case 'module': return '🔧'
      case 'report': return '📊'
      case 'system': return '🖥️'
      default: return '📝'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'config': return 'bg-blue-500'
      case 'user': return 'bg-green-500'
      case 'module': return 'bg-purple-500'
      case 'report': return 'bg-orange-500'
      case 'system': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const renderSetting = (setting: any, category: string) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={setting.value}
              onChange={(e) => updateSetting(category, setting.key, e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className={setting.value ? 'text-green-600' : 'text-gray-500'}>
              {setting.value ? 'Habilitado' : 'Deshabilitado'}
            </span>
          </div>
        )
      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => updateSetting(category, setting.key, e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            {setting.options.map((option: any) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      case 'number':
        return (
          <input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(category, setting.key, parseInt(e.target.value))}
            className="px-3 py-1 border rounded-md text-sm w-20"
          />
        )
      case 'text':
        return (
          <input
            type="text"
            value={setting.value}
            onChange={(e) => updateSetting(category, setting.key, e.target.value)}
            className="px-3 py-1 border rounded-md text-sm flex-1"
            placeholder="Configurar..."
          />
        )
      default:
        return <span className="text-gray-500">N/A</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Configuración Super Admin</h1>
          <p className="text-muted-foreground">
            Ajustes personales y configuración global del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <>
              <Button variant="outline" onClick={resetSettings}>
                🔄 Descartar
              </Button>
              <Button onClick={saveSettings}>
                💾 Guardar Cambios
              </Button>
            </>
          )}
          <Button variant="outline">
            📤 Exportar Config
          </Button>
        </div>
      </div>

      {/* Alertas de cambios */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-800">
                Tienes cambios sin guardar. No olvides hacer clic en "Guardar Cambios".
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de Configuración */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenido de Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {tabs.find(t => t.id === activeTab)?.icon} 
                Configuración {tabs.find(t => t.id === activeTab)?.label.split(' ')[1]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {tempSettings[activeTab as keyof typeof tempSettings].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{setting.label}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderSetting(setting, activeTab)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel Lateral */}
        <div className="space-y-6">
          {/* Estado del Admin */}
          <Card>
            <CardHeader>
              <CardTitle>👤 Perfil Super Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">👨‍💻</span>
                <div>
                  <div className="font-semibold">Carlos Rodríguez</div>
                  <div className="text-sm text-muted-foreground">superadmin@tause.pro</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Último login:</div>
                  <div className="font-medium">Hoy 11:30</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Sesiones:</div>
                  <div className="font-medium">1,247</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Permisos:</div>
                  <Badge className="bg-red-500">Super Admin</Badge>
                </div>
                <div>
                  <div className="text-muted-foreground">2FA:</div>
                  <Badge className="bg-green-500">Activo</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                ✏️ Editar Perfil
              </Button>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <Badge className={`${getActivityColor(activity.type)} p-1`}>
                      {getActivityIcon(activity.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {activity.details}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Ver Todo el Historial
              </Button>
            </CardContent>
          </Card>

          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Estado Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tenants Activos</span>
                  <span className="font-semibold">124/127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uptime</span>
                  <span className="font-semibold text-green-600">99.9%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">CPU</span>
                  <span className="font-semibold">23.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Memoria</span>
                  <span className="font-semibold">68.2%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Alertas Activas</span>
                  <Badge className="bg-yellow-500">2</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 