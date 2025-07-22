// API client para el Super Admin Dashboard de TausePro
import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import type { 
  AdminTenant, 
  AdminModule, 
  AdminMCPAgent, 
  SystemConfig, 
  SystemMetrics,
  AdminUser 
} from '@/types/admin'

// Instancia de axios para el admin API
const adminApiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir el token JWT a las peticiones admin
adminApiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===== API CLIENT PARA SUPER ADMIN =====
export const adminApi = {
  // ===== AUTENTICACIÓN ADMIN =====
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: AdminUser }> => {
      const response = await adminApiClient.post('/admin/auth/login', { email, password })
      return response.data
    },

    logout: async (): Promise<void> => {
      await adminApiClient.post('/admin/auth/logout')
    },

    refreshUser: async (): Promise<AdminUser> => {
      const response = await adminApiClient.get('/admin/auth/me')
      return response.data
    },
  },

  // ===== GESTIÓN DE TENANTS (PYMEs) =====
  tenants: {
    // Obtener lista de tenants
    getAll: async (filters?: {
      plan?: string
      status?: string
      city?: string
      industry?: string
    }): Promise<AdminTenant[]> => {
      const params = new URLSearchParams()
      if (filters?.plan) params.append('plan', filters.plan)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.city) params.append('city', filters.city)
      if (filters?.industry) params.append('industry', filters.industry)

      const response = await adminApiClient.get(`/admin/tenants?${params.toString()}`)
      return response.data
    },

    // Obtener tenant específico
    getById: async (id: string): Promise<AdminTenant> => {
      const response = await adminApiClient.get(`/admin/tenants/${id}`)
      return response.data
    },

    // Crear nuevo tenant
    create: async (data: Partial<AdminTenant>): Promise<AdminTenant> => {
      const response = await adminApiClient.post('/admin/tenants', data)
      return response.data
    },

    // Actualizar tenant
    update: async (id: string, data: Partial<AdminTenant>): Promise<void> => {
      await adminApiClient.put(`/admin/tenants/${id}`, data)
    },

    // Eliminar tenant
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/admin/tenants/${id}`)
    },

    // Suspender tenant
    suspend: async (id: string, reason?: string): Promise<void> => {
      await adminApiClient.post(`/admin/tenants/${id}/suspend`, { reason })
    },

    // Activar tenant
    activate: async (id: string): Promise<void> => {
      await adminApiClient.post(`/admin/tenants/${id}/activate`)
    },

    // Obtener métricas de tenant
    getMetrics: async (id: string): Promise<AdminTenant['metrics']> => {
      const response = await adminApiClient.get(`/admin/tenants/${id}/metrics`)
      return response.data
    },

    // Cambiar plan de tenant
    changePlan: async (id: string, plan: AdminTenant['plan']): Promise<void> => {
      await adminApiClient.post(`/admin/tenants/${id}/plan`, { plan })
    },
  },

  // ===== GESTIÓN DE MÓDULOS =====
  modules: {
    // Obtener lista de módulos
    getAll: async (filters?: {
      category?: string
      status?: string
    }): Promise<AdminModule[]> => {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)

      const response = await adminApiClient.get(`/admin/modules?${params.toString()}`)
      return response.data
    },

    // Obtener módulo específico
    getById: async (id: string): Promise<AdminModule> => {
      const response = await adminApiClient.get(`/admin/modules/${id}`)
      return response.data
    },

    // Actualizar módulo
    update: async (id: string, data: Partial<AdminModule>): Promise<void> => {
      await adminApiClient.put(`/admin/modules/${id}`, data)
    },

    // Habilitar/deshabilitar módulo
    toggle: async (id: string, enabled: boolean): Promise<void> => {
      await adminApiClient.post(`/admin/modules/${id}/toggle`, { enabled })
    },

    // Obtener métricas de módulo
    getMetrics: async (id: string): Promise<AdminModule['usage']> => {
      const response = await adminApiClient.get(`/admin/modules/${id}/metrics`)
      return response.data
    },

    // Actualizar configuración de módulo
    updateConfig: async (id: string, config: Partial<AdminModule['config']>): Promise<void> => {
      await adminApiClient.put(`/admin/modules/${id}/config`, config)
    },
  },

  // ===== GESTIÓN DE AGENTES MCP =====
  agents: {
    // Obtener lista de agentes
    getAll: async (filters?: {
      category?: string
      status?: string
    }): Promise<AdminMCPAgent[]> => {
      const params = new URLSearchParams()
      if (filters?.category) params.append('category', filters.category)
      if (filters?.status) params.append('status', filters.status)

      const response = await adminApiClient.get(`/admin/agents?${params.toString()}`)
      return response.data
    },

    // Obtener agente específico
    getById: async (id: string): Promise<AdminMCPAgent> => {
      const response = await adminApiClient.get(`/admin/agents/${id}`)
      return response.data
    },

    // Crear nuevo agente
    create: async (data: Partial<AdminMCPAgent>): Promise<AdminMCPAgent> => {
      const response = await adminApiClient.post('/admin/agents', data)
      return response.data
    },

    // Actualizar agente
    update: async (id: string, data: Partial<AdminMCPAgent>): Promise<void> => {
      await adminApiClient.put(`/admin/agents/${id}`, data)
    },

    // Eliminar agente
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/admin/agents/${id}`)
    },

    // Asignar agente a tenant
    assignToTenant: async (agentId: string, tenantId: string): Promise<void> => {
      await adminApiClient.post(`/admin/agents/${agentId}/assign`, { tenantId })
    },

    // Remover agente de tenant
    removeFromTenant: async (agentId: string, tenantId: string): Promise<void> => {
      await adminApiClient.delete(`/admin/agents/${agentId}/assign/${tenantId}`)
    },

    // Obtener métricas de agente
    getMetrics: async (id: string): Promise<AdminMCPAgent['performance']> => {
      const response = await adminApiClient.get(`/admin/agents/${id}/metrics`)
      return response.data
    },

    // Probar agente
    test: async (id: string, message: string): Promise<{ response: string; time: number }> => {
      const response = await adminApiClient.post(`/admin/agents/${id}/test`, { message })
      return response.data
    },
  },

  // ===== CONFIGURACIÓN DEL SISTEMA =====
  system: {
    // Obtener configuración del sistema
    getConfig: async (): Promise<SystemConfig> => {
      const response = await adminApiClient.get('/admin/system/config')
      return response.data
    },

    // Actualizar configuración del sistema
    updateConfig: async (data: Partial<SystemConfig>): Promise<void> => {
      await adminApiClient.put('/admin/system/config', data)
    },

    // Obtener métricas del sistema
    getMetrics: async (): Promise<SystemMetrics> => {
      const response = await adminApiClient.get('/admin/system/metrics')
      return response.data
    },

    // Obtener logs del sistema
    getLogs: async (filters?: {
      level?: 'info' | 'warn' | 'error'
      service?: string
      startDate?: string
      endDate?: string
      limit?: number
    }): Promise<Array<{
      timestamp: string
      level: string
      service: string
      message: string
      metadata?: Record<string, any>
    }>> => {
      const params = new URLSearchParams()
      if (filters?.level) params.append('level', filters.level)
      if (filters?.service) params.append('service', filters.service)
      if (filters?.startDate) params.append('startDate', filters.startDate)
      if (filters?.endDate) params.append('endDate', filters.endDate)
      if (filters?.limit) params.append('limit', filters.limit.toString())

      const response = await adminApiClient.get(`/admin/system/logs?${params.toString()}`)
      return response.data
    },

    // Ejecutar comando del sistema
    executeCommand: async (command: string, params?: Record<string, any>): Promise<{
      success: boolean
      output: string
      error?: string
    }> => {
      const response = await adminApiClient.post('/admin/system/execute', { command, params })
      return response.data
    },
  },

  // ===== GESTIÓN DE USUARIOS ADMIN =====
  users: {
    // Obtener lista de usuarios admin
    getAll: async (): Promise<AdminUser[]> => {
      const response = await adminApiClient.get('/admin/users')
      return response.data
    },

    // Crear usuario admin
    create: async (data: Partial<AdminUser>): Promise<AdminUser> => {
      const response = await adminApiClient.post('/admin/users', data)
      return response.data
    },

    // Actualizar usuario admin
    update: async (id: string, data: Partial<AdminUser>): Promise<void> => {
      await adminApiClient.put(`/admin/users/${id}`, data)
    },

    // Eliminar usuario admin
    delete: async (id: string): Promise<void> => {
      await adminApiClient.delete(`/admin/users/${id}`)
    },

    // Cambiar contraseña de usuario admin
    changePassword: async (id: string, newPassword: string): Promise<void> => {
      await adminApiClient.post(`/admin/users/${id}/password`, { newPassword })
    },
  },

  // ===== REPORTES Y ANALYTICS =====
  reports: {
    // Reporte de tenants por plan
    tenantsByPlan: async (): Promise<Array<{
      plan: string
      count: number
      revenue: number
    }>> => {
      const response = await adminApiClient.get('/admin/reports/tenants-by-plan')
      return response.data
    },

    // Reporte de uso por módulo
    usageByModule: async (period: 'day' | 'week' | 'month' = 'month'): Promise<Array<{
      module: string
      calls: number
      errors: number
      avgResponseTime: number
    }>> => {
      const response = await adminApiClient.get(`/admin/reports/usage-by-module?period=${period}`)
      return response.data
    },

    // Reporte de agentes más usados
    topAgents: async (limit: number = 10): Promise<Array<{
      agent: string
      conversations: number
      satisfaction: number
      tenants: number
    }>> => {
      const response = await adminApiClient.get(`/admin/reports/top-agents?limit=${limit}`)
      return response.data
    },

    // Reporte de geografía
    geographyReport: async (): Promise<{
      cities: Array<{ city: string; count: number; revenue: number }>
      departments: Array<{ department: string; count: number; revenue: number }>
    }> => {
      const response = await adminApiClient.get('/admin/reports/geography')
      return response.data
    },
  },
}

// ===== MODO DEMO PARA TESTING =====
export const adminApiDemo = {
  // Datos demo para testing sin backend
  getDemoData: () => ({
    tenants: [
      {
        id: 'tenant-1',
        name: 'Restaurante El Sabor Colombiano',
        subdomain: 'sabor',
        plan: 'starter' as const,
        status: 'active' as const,
        nit: '900123456-7',
        city: 'Bogotá',
        department: 'Cundinamarca',
        industry: 'Restaurantes',
        email: 'admin@sabor.com',
        phone: '+573001234567',
        address: 'Calle 123 #45-67',
        metrics: {
          apiCalls: 1247,
          agentsCount: 3,
          usersCount: 5,
          revenueCOP: 2450000,
          lastActivity: '2025-01-17T10:30:00Z',
        },
        settings: {
          isActive: true,
          features: ['ecommerce', 'whatsapp', 'analytics'],
          integrations: {
            wompi: true,
            dian: true,
            servientrega: false,
            whatsapp: true,
          },
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-17T10:30:00Z',
      },
      {
        id: 'tenant-2',
        name: 'Tienda de Ropa Fashion Colombia',
        subdomain: 'fashion',
        plan: 'growth' as const,
        status: 'active' as const,
        nit: '900987654-3',
        city: 'Medellín',
        department: 'Antioquia',
        industry: 'Moda',
        email: 'admin@fashion.com',
        phone: '+573009876543',
        address: 'Carrera 70 #45-89',
        metrics: {
          apiCalls: 3421,
          agentsCount: 7,
          usersCount: 12,
          revenueCOP: 8900000,
          lastActivity: '2025-01-17T09:15:00Z',
        },
        settings: {
          isActive: true,
          features: ['ecommerce', 'whatsapp', 'analytics', 'inventory'],
          integrations: {
            wompi: true,
            dian: true,
            servientrega: true,
            whatsapp: true,
          },
        },
        createdAt: '2024-02-15T00:00:00Z',
        updatedAt: '2025-01-17T09:15:00Z',
      },
    ] as AdminTenant[],

    modules: [
      {
        id: 'module-ecommerce',
        name: 'E-commerce',
        description: 'Tienda en línea con pagos colombianos',
        category: 'ecommerce' as const,
        status: 'active' as const,
        config: {
          isEnabled: true,
          isRequired: false,
          version: '2.1.0',
          dependencies: ['payments', 'inventory'],
          settings: { currency: 'COP', taxRate: 19 },
        },
        usage: {
          activeTenants: 45,
          totalCalls: 125000,
          errorRate: 0.5,
          avgResponseTime: 120,
        },
        permissions: {
          canEnable: true,
          canConfigure: true,
          canViewMetrics: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-17T00:00:00Z',
      },
      {
        id: 'module-whatsapp',
        name: 'WhatsApp Business',
        description: 'Integración con WhatsApp Business API',
        category: 'communication' as const,
        status: 'active' as const,
        config: {
          isEnabled: true,
          isRequired: false,
          version: '1.5.2',
          dependencies: ['messaging'],
          settings: { webhookUrl: '', templates: [] },
        },
        usage: {
          activeTenants: 32,
          totalCalls: 89000,
          errorRate: 1.2,
          avgResponseTime: 200,
        },
        permissions: {
          canEnable: true,
          canConfigure: true,
          canViewMetrics: true,
        },
        createdAt: '2024-01-15T00:00:00Z',
        updatedAt: '2025-01-16T00:00:00Z',
      },
    ] as AdminModule[],

    agents: [
      {
        id: 'agent-ventas',
        name: 'Asistente de Ventas',
        description: 'Agente especializado en ventas y atención al cliente',
        category: 'ventas' as const,
        status: 'active' as const,
        config: {
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 1000,
          tools: ['product_catalog', 'price_calculator', 'order_processor'],
          prompts: {
            greeting: 'Hola, soy tu asistente de ventas. ¿En qué puedo ayudarte?',
            sales: 'Te ayudo a encontrar el producto perfecto para ti.',
          },
        },
        performance: {
          totalConversations: 1247,
          avgResponseTime: 2.3,
          satisfactionScore: 4.8,
          errorRate: 0.5,
          lastUsed: '2025-01-17T10:30:00Z',
        },
        tenants: {
          assigned: ['tenant-1', 'tenant-2'],
          active: ['tenant-1', 'tenant-2'],
          usage: { 'tenant-1': 45, 'tenant-2': 89 },
        },
        permissions: {
          canEdit: true,
          canDelete: false,
          canAssign: true,
          canViewMetrics: true,
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2025-01-17T00:00:00Z',
      },
    ] as AdminMCPAgent[],

    systemMetrics: {
      overview: {
        totalTenants: 127,
        activeTenants: 124,
        totalUsers: 456,
        totalRevenueCOP: 45600000,
        avgTenantRevenueCOP: 367742,
      },
      usage: {
        totalApiCalls: 1250000,
        totalAgentConversations: 89000,
        totalWhatsAppMessages: 45000,
        avgResponseTime: 150,
      },
      plans: {
        gratis: 45,
        starter: 52,
        growth: 23,
        scale: 7,
      },
      geography: {
        topCities: [
          { city: 'Bogotá', count: 45 },
          { city: 'Medellín', count: 23 },
          { city: 'Cali', count: 18 },
        ],
        topDepartments: [
          { department: 'Cundinamarca', count: 52 },
          { department: 'Antioquia', count: 28 },
          { department: 'Valle del Cauca', count: 22 },
        ],
        topIndustries: [
          { industry: 'Restaurantes', count: 34 },
          { industry: 'Moda', count: 28 },
          { industry: 'Tecnología', count: 25 },
        ],
      },
      performance: {
        uptime: 99.9,
        errorRate: 0.8,
        avgLoadTime: 120,
        concurrentUsers: 89,
      },
      growth: {
        newTenantsThisMonth: 12,
        newTenantsThisWeek: 3,
        churnRate: 2.1,
        upgradeRate: 15.3,
      },
      lastUpdated: '2025-01-17T10:30:00Z',
    } as SystemMetrics,
  }),
} 