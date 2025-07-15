// Tipos base del sistema
export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'employee'
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface Tenant {
  id: string
  name: string
  subdomain: string
  plan: Plan
  nit: string
  city: string
  department: string
  industry: string
  phone: string
  email: string
  address: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Tipos del paywall
export type Plan = 'gratis' | 'starter' | 'growth' | 'scale'

export interface PlanFeatures {
  name: string
  price: number
  currency: 'COP'
  limits: {
    apiCalls: number
    mcpAgents: number
    whatsappMessages: number
  }
  features: string[]
  isPopular?: boolean
}

export interface Usage {
  apiCalls: number
  mcpAgents: number
  whatsappMessages: number
  period: 'monthly'
  lastReset: string
}

// Tipos MCP (Model Context Protocol)
export interface MCPTool {
  name: string
  description: string
  category: 'ventas' | 'soporte' | 'contabilidad' | 'logistica'
  requiredPlan: Plan
  isEnabled: boolean
  parameters: Record<string, any>
}

export interface MCPAgent {
  id: string
  name: string
  description: string
  tools: string[]
  isActive: boolean
  createdAt: string
  usage: {
    conversations: number
    messages: number
    lastUsed: string
  }
}

export interface MCPMessage {
  id: string
  agentId: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  metadata?: Record<string, any>
}

// Tipos específicos Colombia
export interface ColombiaValidation {
  type: 'nit' | 'cc' | 'phone'
  value: string
  isValid: boolean
  formatted: string
  error?: string
}

export interface Department {
  name: string
  cities: string[]
}

export interface PaymentMethod {
  id: string
  name: 'PSE' | 'Nequi' | 'Wompi' | 'DaviPlata' | 'Efecty'
  logo: string
  isEnabled: boolean
  processingFee: number
}

export interface ShippingCarrier {
  id: string
  name: 'Servientrega' | 'TCC' | 'Interrapidisimo' | 'Coordinadora'
  logo: string
  baseRate: number
  isEnabled: boolean
}

// Tipos del dashboard
export interface DashboardMetrics {
  revenue: {
    current: number
    previous: number
    growth: number
  }
  orders: {
    current: number
    previous: number
    growth: number
  }
  customers: {
    current: number
    previous: number
    growth: number
  }
  agents: {
    active: number
    total: number
    conversations: number
  }
}

export interface AnalyticsData {
  revenue: Array<{
    date: string
    amount: number
  }>
  orders: Array<{
    date: string
    count: number
  }>
  paymentMethods: Array<{
    method: string
    percentage: number
    amount: number
  }>
  topProducts: Array<{
    name: string
    revenue: number
    quantity: number
  }>
  shippingCarriers: Array<{
    carrier: string
    percentage: number
    cost: number
  }>
  geography: Array<{
    department: string
    orders: number
    revenue: number
  }>
}

// Tipos de formularios
export interface CreateAgentForm {
  name: string
  description: string
  tools: string[]
}

export interface TenantSettingsForm {
  name: string
  nit: string
  city: string
  department: string
  industry: string
  phone: string
  email: string
  address: string
}

export interface UserForm {
  name: string
  email: string
  role: 'admin' | 'employee'
}

// Tipos de API
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Tipos de estado global
export interface AuthState {
  user: User | null
  tenant: Tenant | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export interface PaywallState {
  plan: Plan
  usage: Usage
  features: Record<Plan, PlanFeatures>
  isBlocked: (feature: string) => boolean
  upgrade: (plan: Plan) => Promise<void>
  refreshUsage: () => Promise<void>
}

export interface AgentsState {
  agents: MCPAgent[]
  selectedAgent: MCPAgent | null
  isLoading: boolean
  create: (data: CreateAgentForm) => Promise<MCPAgent>
  update: (id: string, data: Partial<MCPAgent>) => Promise<void>
  delete: (id: string) => Promise<void>
  select: (agent: MCPAgent | null) => void
  chat: (agentId: string, message: string) => Promise<MCPMessage>
  refreshAgents: () => Promise<void>
}

export interface DashboardState {
  metrics: DashboardMetrics | null
  analytics: AnalyticsData | null
  isLoading: boolean
  refreshMetrics: () => Promise<void>
  refreshAnalytics: () => Promise<void>
}

// Tipos de navegación
export interface NavigationItem {
  name: string
  href: string
  icon: string
  badge?: number
  requiredPlan?: Plan
}

export interface BreadcrumbItem {
  name: string
  href?: string
}

// Tipos de notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
}

// Tipos de componentes
export interface TableColumn<T = any> {
  key: string
  header: string
  cell: (item: T) => React.ReactNode
  sortable?: boolean
  width?: string
}

export interface ChartData {
  name: string
  value: number
  fill?: string
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

// Constantes de Colombia
export const DEPARTMENTS: Department[] = [
  { name: 'Bogotá D.C.', cities: ['Bogotá'] },
  { name: 'Antioquia', cities: ['Medellín', 'Bello', 'Itagüí', 'Envigado'] },
  { name: 'Valle del Cauca', cities: ['Cali', 'Palmira', 'Buenaventura'] },
  { name: 'Atlántico', cities: ['Barranquilla', 'Soledad', 'Malambo'] },
  { name: 'Santander', cities: ['Bucaramanga', 'Floridablanca', 'Girón'] },
  // ... más departamentos
]

export const INDUSTRIES = [
  'Comercio al por menor',
  'Servicios profesionales',
  'Restaurantes y alimentación',
  'Manufactura',
  'Tecnología',
  'Salud y bienestar',
  'Educación',
  'Construcción',
  'Transporte y logística',
  'Turismo y hotelería',
  'Otros',
] as const

export type Industry = typeof INDUSTRIES[number] 