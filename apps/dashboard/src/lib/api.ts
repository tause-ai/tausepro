// apps/dashboard/src/lib/api.ts
// CLIENTE DE API CENTRALIZADO PARA TAUSEPRO

import axios from 'axios'
import { useAuthStore } from '@/store/auth'
import type { 
  LoginResponse, 
  RefreshResponse, 
  DashboardResponse 
} from '@/types'

// 1. CONFIGURACIÓN DE AXIOS
// =========================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para añadir el token JWT y el Tenant ID a las peticiones
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  const tenantId = useAuthStore.getState().tenant?.id

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId
  }
  return config
})

// Interceptor para manejar la expiración del token y errores 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // Intentar refrescar el token
        const { token } = await authApi.refreshToken()
        useAuthStore.getState().setToken(token)
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
        return api(originalRequest)
      } catch (refreshError) {
        // Si el refresh falla, desloguear
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

// 3. MÉTODOS DE LA API
// ====================

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },
  refreshToken: async (): Promise<RefreshResponse> => {
    // Esta ruta necesita existir en el backend y ser pública
    const response = await api.post('/auth/refresh')
    return response.data
  },
}

export const pymeApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    // Modo demo temporal para testing
    const token = useAuthStore.getState().token
    if (token && token.startsWith('demo-token-')) {
      // Datos demo para testing
      return {
        metrics: {
          total_api_calls: 87,
          total_agents: 3,
          active_chats: 12,
          messages_sent: 245,
        },
        usage: {
          api_calls: {
            used: 87,
            limit: 100,
            percentage: 87,
          },
          agents: {
            used: 3,
            limit: 3,
            percentage: 100,
          },
        },
        recent_activity: [
          {
            id: '1',
            type: 'agent_execution',
            description: 'Agente de ventas procesó consulta de cliente',
            timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            type: 'chat_message',
            description: 'Mensaje enviado a través de WhatsApp Business',
            timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'system_alert',
            description: 'Límite de agentes MCP alcanzado (3/3)',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          },
        ],
        current_plan: 'gratis',
      }
    }
    
    // Intento de llamada real a la API
    const response = await api.get('/pymes/dashboard')
    return response.data
  },
}

// Exportación por defecto para uso simplificado
export default {
  ...authApi,
  ...pymeApi,
}
