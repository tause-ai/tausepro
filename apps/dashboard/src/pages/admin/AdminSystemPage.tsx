import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Datos demo del sistema
const systemMetrics = {
  server: {
    uptime: '45 días 12h 34m',
    cpu: 23.4,
    memory: 68.2,
    disk: 34.7,
    network: 45.3
  },
  database: {
    connections: 127,
    maxConnections: 500,
    cacheHitRate: 94.8,
    avgQueryTime: 23.5,
    dbSize: '2.4 GB'
  },
  services: [
    { name: 'MCP Server', status: 'online', uptime: '99.9%', lastCheck: '30s ago' },
    { name: 'PostgreSQL', status: 'online', uptime: '99.8%', lastCheck: '15s ago' },
    { name: 'Redis Cache', status: 'online', uptime: '100%', lastCheck: '45s ago' },
    { name: 'NATS Messaging', status: 'online', uptime: '99.7%', lastCheck: '20s ago' },
    { name: 'Minio Storage', status: 'warning', uptime: '95.2%', lastCheck: '2m ago' },
    { name: 'WhatsApp API', status: 'online', uptime: '98.9%', lastCheck: '10s ago' },
    { name: 'Payment Gateway', status: 'online', uptime: '99.5%', lastCheck: '1m ago' },
    { name: 'DIAN Integration', status: 'offline', uptime: '87.3%', lastCheck: '15m ago' }
  ],
  security: {
    activeConnections: 2847,
    blockedIPs: 12,
    ddosAttempts: 3,
    lastSecurityScan: '2025-01-21T22:00:00Z',
    sslExpiry: '2025-12-15'
  }
}

const logEntries = [
  {
    id: 1,
    timestamp: '2025-01-22T12:45:32Z',
    level: 'INFO',
    service: 'MCP-Server',
    message: 'Agent deployed successfully for tenant buen-sabor',
    tenant: 'buen-sabor'
  },
  {
    id: 2,
    timestamp: '2025-01-22T12:43:15Z',
    level: 'WARN',
    service: 'Storage',
    message: 'Disk usage above 80% threshold',
    tenant: 'system'
  },
  {
    id: 3,
    timestamp: '2025-01-22T12:41:07Z',
    level: 'ERROR',
    service: 'DIAN-API',
    message: 'Connection timeout to DIAN service',
    tenant: 'juridica-abc'
  },
  {
    id: 4,
    timestamp: '2025-01-22T12:38:22Z',
    level: 'INFO',
    service: 'WhatsApp',
    message: 'Message delivered successfully',
    tenant: 'domicilios-express'
  },
  {
    id: 5,
    timestamp: '2025-01-22T12:35:10Z',
    level: 'DEBUG',
    service: 'Analytics',
    message: 'Daily report generated for dashboard',
    tenant: 'system'
  }
]

const configurations = [
  {
    category: 'General',
    settings: [
      { key: 'environment', value: 'development', type: 'select', options: ['development', 'staging', 'production'] },
      { key: 'timezone', value: 'America/Bogota', type: 'text' },
      { key: 'default_language', value: 'es', type: 'select', options: ['es', 'en'] },
      { key: 'maintenance_mode', value: false, type: 'boolean' }
    ]
  },
  {
    category: 'Límites',
    settings: [
      { key: 'max_tenants', value: '1000', type: 'number' },
      { key: 'max_agents_per_tenant', value: '10', type: 'number' },
      { key: 'api_rate_limit', value: '1000', type: 'number' },
      { key: 'file_upload_limit', value: '50MB', type: 'text' }
    ]
  },
  {
    category: 'Integraciones',
    settings: [
      { key: 'openai_api_enabled', value: true, type: 'boolean' },
      { key: 'whatsapp_api_enabled', value: true, type: 'boolean' },
      { key: 'dian_integration_enabled', value: false, type: 'boolean' },
      { key: 'wompi_enabled', value: true, type: 'boolean' }
    ]
  }
]

export default function AdminSystemPage() {
  const [selectedLogLevel, setSelectedLogLevel] = useState('ALL')
  const [selectedService, setSelectedService] = useState('ALL')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'offline': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-600 bg-red-50'
      case 'WARN': return 'text-yellow-600 bg-yellow-50'
      case 'INFO': return 'text-blue-600 bg-blue-50'
      case 'DEBUG': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('es-CO', {
      timeZone: 'America/Bogota',
      hour12: false
    })
  }

  const filteredLogs = logEntries.filter(log => {
    const matchesLevel = selectedLogLevel === 'ALL' || log.level === selectedLogLevel
    const matchesService = selectedService === 'ALL' || log.service === selectedService
    return matchesLevel && matchesService
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">⚙️ Sistema y Configuración</h1>
          <p className="text-muted-foreground">
            Monitoreo del sistema y configuración global
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            📊 Exportar Logs
          </Button>
          <Button variant="outline">
            🔄 Reiniciar Servicios
          </Button>
          <Button>
            💾 Guardar Configuración
          </Button>
        </div>
      </div>

      {/* Métricas del Servidor */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU</CardTitle>
            <span className="text-2xl">💻</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.server.cpu}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${systemMetrics.server.cpu}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memoria</CardTitle>
            <span className="text-2xl">🧠</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.server.memory}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${systemMetrics.server.memory}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disco</CardTitle>
            <span className="text-2xl">💾</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.server.disk}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-600 h-2 rounded-full transition-all"
                style={{ width: `${systemMetrics.server.disk}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <span className="text-2xl">⏰</span>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{systemMetrics.server.uptime}</div>
            <p className="text-xs text-green-600 mt-1">
              99.9% disponibilidad
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Servicios */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Estado de Servicios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemMetrics.services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <div>
                    <p className="font-medium text-sm">{service.name}</p>
                    <p className="text-xs text-muted-foreground">{service.uptime}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{service.lastCheck}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Base de Datos */}
      <Card>
        <CardHeader>
          <CardTitle>🗄️ Base de Datos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{systemMetrics.database.connections}</div>
              <p className="text-sm text-muted-foreground">Conexiones activas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemMetrics.database.cacheHitRate}%</div>
              <p className="text-sm text-muted-foreground">Cache hit rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{systemMetrics.database.avgQueryTime}ms</div>
              <p className="text-sm text-muted-foreground">Query promedio</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{systemMetrics.database.dbSize}</div>
              <p className="text-sm text-muted-foreground">Tamaño BD</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{systemMetrics.database.maxConnections}</div>
              <p className="text-sm text-muted-foreground">Max conexiones</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs del Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📄 Logs del Sistema</CardTitle>
            <div className="flex gap-2">
              <select 
                value={selectedLogLevel}
                onChange={(e) => setSelectedLogLevel(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="ALL">Todos los niveles</option>
                <option value="ERROR">Errores</option>
                <option value="WARN">Advertencias</option>
                <option value="INFO">Info</option>
                <option value="DEBUG">Debug</option>
              </select>
              <select 
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="ALL">Todos los servicios</option>
                <option value="MCP-Server">MCP Server</option>
                <option value="Storage">Storage</option>
                <option value="DIAN-API">DIAN API</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Analytics">Analytics</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 border rounded-lg text-sm">
                <span className="text-xs text-muted-foreground min-w-[130px]">
                  {formatTimestamp(log.timestamp)}
                </span>
                <Badge className={`text-xs ${getLogLevelColor(log.level)}`}>
                  {log.level}
                </Badge>
                <span className="text-xs font-medium min-w-[100px]">
                  {log.service}
                </span>
                <span className="flex-1">
                  {log.message}
                </span>
                <Badge variant="outline" className="text-xs">
                  {log.tenant}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configuración del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {configurations.map((config, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-3">{config.category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.settings.map((setting, settingIndex) => (
                    <div key={settingIndex} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{setting.key.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">{setting.type}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {setting.type === 'boolean' ? (
                          <Badge variant={setting.value ? "default" : "secondary"}>
                            {setting.value ? "Habilitado" : "Deshabilitado"}
                          </Badge>
                        ) : (
                          <span className="font-medium">{setting.value}</span>
                        )}
                        <Button variant="outline" size="sm">
                          ✏️ Editar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card>
        <CardHeader>
          <CardTitle>🔒 Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{systemMetrics.security.activeConnections}</div>
              <p className="text-sm text-muted-foreground">Conexiones activas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{systemMetrics.security.blockedIPs}</div>
              <p className="text-sm text-muted-foreground">IPs bloqueadas</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{systemMetrics.security.ddosAttempts}</div>
              <p className="text-sm text-muted-foreground">Intentos DDoS</p>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">{systemMetrics.security.sslExpiry}</div>
              <p className="text-sm text-muted-foreground">SSL expira</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 