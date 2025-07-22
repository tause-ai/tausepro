// Tipos para el Super Admin Dashboard de TausePro

// ===== TENANTS (PYMEs) =====
export interface AdminTenant {
  id: string
  name: string
  subdomain: string
  plan: 'gratis' | 'starter' | 'growth' | 'scale'
  status: 'active' | 'suspended' | 'pending'
  
  // Información Colombia
  nit: string
  city: string
  department: string
  industry: string
  
  // Contacto
  email: string
  phone: string
  address: string
  
  // Métricas
  metrics: {
    apiCalls: number
    agentsCount: number
    usersCount: number
    revenueCOP: number
    lastActivity: string
  }
  
  // Configuración
  settings: {
    isActive: boolean
    features: string[]
    integrations: {
      wompi: boolean
      dian: boolean
      servientrega: boolean
      whatsapp: boolean
    }
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// ===== MÓDULOS Y APPS =====
export interface AdminModule {
  id: string
  name: string
  description: string
  category: 'core' | 'ecommerce' | 'communication' | 'analytics' | 'integration'
  status: 'active' | 'beta' | 'deprecated'
  
  // Configuración
  config: {
    isEnabled: boolean
    isRequired: boolean
    version: string
    dependencies: string[]
    settings: Record<string, any>
  }
  
  // Métricas de uso
  usage: {
    activeTenants: number
    totalCalls: number
    errorRate: number
    avgResponseTime: number
  }
  
  // Permisos
  permissions: {
    canEnable: boolean
    canConfigure: boolean
    canViewMetrics: boolean
  }
  
  createdAt: string
  updatedAt: string
}

// ===== AGENTES MCP =====
export interface AdminMCPAgent {
  id: string
  name: string
  description: string
  category: 'ventas' | 'soporte' | 'contabilidad' | 'logistica' | 'custom'
  status: 'active' | 'inactive' | 'error'
  
  // Configuración técnica
  config: {
    model: string
    temperature: number
    maxTokens: number
    tools: string[]
    prompts: Record<string, string>
  }
  
  // Métricas de rendimiento
  performance: {
    totalConversations: number
    avgResponseTime: number
    satisfactionScore: number
    errorRate: number
    lastUsed: string
  }
  
  // Asignación a tenants
  tenants: {
    assigned: string[]
    active: string[]
    usage: Record<string, number>
  }
  
  // Permisos
  permissions: {
    canEdit: boolean
    canDelete: boolean
    canAssign: boolean
    canViewMetrics: boolean
  }
  
  createdAt: string
  updatedAt: string
}

// ===== CONFIGURACIÓN DEL SISTEMA =====
export interface SystemConfig {
  // Configuración general
  general: {
    maintenanceMode: boolean
    debugMode: boolean
    timezone: string
    language: string
  }
  
  // Configuración de pagos
  payments: {
    wompiEnabled: boolean
    pseEnabled: boolean
    nequiEnabled: boolean
    testMode: boolean
  }
  
  // Configuración de integraciones
  integrations: {
    dianEnabled: boolean
    servientregaEnabled: boolean
    whatsappEnabled: boolean
  }
  
  // Configuración de seguridad
  security: {
    jwtExpiry: number
    refreshTokenExpiry: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
  }
  
  // Configuración de límites
  limits: {
    maxTenants: number
    maxUsersPerTenant: number
    maxAgentsPerTenant: number
    maxApiCallsPerMonth: number
  }
  
  updatedAt: string
  updatedBy: string
}

// ===== MÉTRICAS DEL SISTEMA =====
export interface SystemMetrics {
  // Métricas generales
  overview: {
    totalTenants: number
    activeTenants: number
    totalUsers: number
    totalRevenueCOP: number
    avgTenantRevenueCOP: number
  }
  
  // Métricas de uso
  usage: {
    totalApiCalls: number
    totalAgentConversations: number
    totalWhatsAppMessages: number
    avgResponseTime: number
  }
  
  // Métricas de planes
  plans: {
    gratis: number
    starter: number
    growth: number
    scale: number
  }
  
  // Métricas de geografía
  geography: {
    topCities: Array<{ city: string; count: number }>
    topDepartments: Array<{ department: string; count: number }>
    topIndustries: Array<{ industry: string; count: number }>
  }
  
  // Métricas de rendimiento
  performance: {
    uptime: number
    errorRate: number
    avgLoadTime: number
    concurrentUsers: number
  }
  
  // Métricas de crecimiento
  growth: {
    newTenantsThisMonth: number
    newTenantsThisWeek: number
    churnRate: number
    upgradeRate: number
  }
  
  lastUpdated: string
}

// ===== ESTADOS Y PERMISOS =====
export interface AdminUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'support' | 'developer'
  permissions: {
    canManageTenants: boolean
    canManageModules: boolean
    canManageAgents: boolean
    canViewSystemMetrics: boolean
    canManageSystemConfig: boolean
    canManageUsers: boolean
    canViewBilling: boolean
  }
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

// ===== ESTADOS DE STORE =====
export interface AdminState {
  // Usuario admin actual
  currentUser: AdminUser | null
  
  // Datos principales
  tenants: AdminTenant[]
  modules: AdminModule[]
  agents: AdminMCPAgent[]
  systemConfig: SystemConfig | null
  systemMetrics: SystemMetrics | null
  
  // Estados de carga
  isLoading: {
    tenants: boolean
    modules: boolean
    agents: boolean
    config: boolean
    metrics: boolean
  }
  
  // Estados de error
  errors: {
    tenants: string | null
    modules: string | null
    agents: string | null
    config: string | null
    metrics: string | null
  }
  
  // Filtros y búsqueda
  filters: {
    tenants: {
      plan: string
      status: string
      city: string
      industry: string
    }
    modules: {
      category: string
      status: string
    }
    agents: {
      category: string
      status: string
    }
  }
  
  // Acciones
  actions: {
    // Tenants
    fetchTenants: () => Promise<void>
    createTenant: (data: Partial<AdminTenant>) => Promise<AdminTenant>
    updateTenant: (id: string, data: Partial<AdminTenant>) => Promise<void>
    deleteTenant: (id: string) => Promise<void>
    suspendTenant: (id: string) => Promise<void>
    activateTenant: (id: string) => Promise<void>
    
    // Modules
    fetchModules: () => Promise<void>
    updateModule: (id: string, data: Partial<AdminModule>) => Promise<void>
    toggleModule: (id: string, enabled: boolean) => Promise<void>
    
    // Agents
    fetchAgents: () => Promise<void>
    createAgent: (data: Partial<AdminMCPAgent>) => Promise<AdminMCPAgent>
    updateAgent: (id: string, data: Partial<AdminMCPAgent>) => Promise<void>
    deleteAgent: (id: string) => Promise<void>
    assignAgentToTenant: (agentId: string, tenantId: string) => Promise<void>
    
    // System
    fetchSystemConfig: () => Promise<void>
    updateSystemConfig: (data: Partial<SystemConfig>) => Promise<void>
    fetchSystemMetrics: () => Promise<void>
    
    // Filters
    setTenantFilter: (filter: Partial<AdminState['filters']['tenants']>) => void
    setModuleFilter: (filter: Partial<AdminState['filters']['modules']>) => void
    setAgentFilter: (filter: Partial<AdminState['filters']['agents']>) => void
  }
} 