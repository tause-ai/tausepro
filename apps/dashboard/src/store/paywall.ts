import { create } from 'zustand'
import type { PaywallState, Plan, PlanFeatures, Usage } from '@/types'

// Configuración de planes en pesos colombianos
const PLAN_FEATURES: Record<Plan, PlanFeatures> = {
  gratis: {
    name: 'Gratis',
    price: 0,
    currency: 'COP',
    limits: {
      apiCalls: 100,
      mcpAgents: 3,
      whatsappMessages: 50,
    },
    features: [
      'Dashboard básico',
      'Agentes MCP básicos',
      'Soporte por email',
      'Validaciones Colombia (NIT, CC)',
      'Reportes básicos',
    ],
  },
  starter: {
    name: 'Starter',
    price: 49900,
    currency: 'COP',
    limits: {
      apiCalls: 5000,
      mcpAgents: 10,
      whatsappMessages: 1000,
    },
    features: [
      'Todo lo del plan Gratis',
      'Analytics avanzados',
      'Integraciones PSE/Nequi',
      'Chat WhatsApp Business',
      'Soporte prioritario',
      'Facturación DIAN básica',
    ],
    isPopular: true,
  },
  growth: {
    name: 'Growth',
    price: 149900,
    currency: 'COP',
    limits: {
      apiCalls: 25000,
      mcpAgents: 50,
      whatsappMessages: 5000,
    },
    features: [
      'Todo lo del plan Starter',
      'Multi-usuario (hasta 10)',
      'API personalizada',
      'Integraciones Servientrega/TCC',
      'Facturación DIAN completa',
      'Exportación de datos',
      'Webhooks',
    ],
  },
  scale: {
    name: 'Scale',
    price: 499900,
    currency: 'COP',
    limits: {
      apiCalls: Infinity,
      mcpAgents: Infinity,
      whatsappMessages: Infinity,
    },
    features: [
      'Todo lo del plan Growth',
      'Usuarios ilimitados',
      'SLA 99.9% uptime',
      'Soporte telefónico',
      'Onboarding personalizado',
      'Integración ERP/CRM',
      'White-label disponible',
    ],
  },
}

export const usePaywall = create<PaywallState>((set, get) => ({
  plan: 'gratis',
  usage: {
    apiCalls: 0,
    mcpAgents: 0,
    whatsappMessages: 0,
    period: 'monthly',
    lastReset: new Date().toISOString(),
  },
  features: PLAN_FEATURES,

  isBlocked: (feature: string) => {
    const { plan, usage, features } = get()
    const currentPlanFeatures = features[plan]
    
    // Verificar límites específicos
    const checks = {
      'api_calls': usage.apiCalls >= currentPlanFeatures.limits.apiCalls,
      'mcp_agents': usage.mcpAgents >= currentPlanFeatures.limits.mcpAgents,
      'whatsapp': usage.whatsappMessages >= currentPlanFeatures.limits.whatsappMessages,
      'analytics': plan === 'gratis',
      'multi_user': plan === 'gratis' || plan === 'starter',
      'api_access': plan === 'gratis',
      'webhooks': plan === 'gratis' || plan === 'starter',
      'white_label': plan !== 'scale',
      'phone_support': plan !== 'scale',
      'sla_uptime': plan !== 'scale',
      'pse_integration': plan === 'gratis',
      'dian_full': plan === 'gratis' || plan === 'starter',
      'shipping_integration': plan === 'gratis',
      'data_export': plan === 'gratis' || plan === 'starter',
    }
    
    return checks[feature as keyof typeof checks] || false
  },

  upgrade: async (plan: Plan) => {
    console.log('Upgrading to plan:', plan)
    // Lógica de API real irá aquí
    return Promise.resolve()
  },

  refreshUsage: async () => {
    console.log('Refreshing usage data...')
    // Lógica de API real irá aquí
    return Promise.resolve()
  },
}))

// Hook para obtener información de plan actual
export function usePlanInfo() {
  const { plan, features } = usePaywall()
  return features[plan]
}

// Hook para verificar si una feature está disponible
export function useFeatureAccess(feature: string) {
  const isBlocked = usePaywall(state => state.isBlocked)
  return !isBlocked(feature)
}

// Hook para obtener el progreso de uso
export function useUsageProgress() {
  const { usage, plan, features } = usePaywall()
  const limits = features[plan].limits
  
  return {
    apiCalls: {
      used: usage.apiCalls,
      limit: limits.apiCalls,
      percentage: limits.apiCalls === Infinity ? 0 : (usage.apiCalls / limits.apiCalls) * 100,
    },
    mcpAgents: {
      used: usage.mcpAgents,
      limit: limits.mcpAgents,
      percentage: limits.mcpAgents === Infinity ? 0 : (usage.mcpAgents / limits.mcpAgents) * 100,
    },
    whatsappMessages: {
      used: usage.whatsappMessages,
      limit: limits.whatsappMessages,
      percentage: limits.whatsappMessages === Infinity ? 0 : (usage.whatsappMessages / limits.whatsappMessages) * 100,
    },
  }
}

// Hook para obtener el plan recomendado basado en uso
export function getRecommendedPlan(usage: Usage): Plan {
  const { apiCalls, mcpAgents, whatsappMessages } = usage
  
  // Si excede los límites de Growth, recomendar Scale
  if (apiCalls > 25000 || mcpAgents > 50 || whatsappMessages > 5000) {
    return 'scale'
  }
  
  // Si excede los límites de Starter, recomendar Growth
  if (apiCalls > 5000 || mcpAgents > 10 || whatsappMessages > 1000) {
    return 'growth'
  }
  
  // Si excede los límites de Gratis, recomendar Starter
  if (apiCalls > 100 || mcpAgents > 3 || whatsappMessages > 50) {
    return 'starter'
  }
  
  return 'gratis'
}

// Función para formatear precios en COP
export function formatPlanPrice(price: number): string {
  if (price === 0) return 'Gratis'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price)
} 