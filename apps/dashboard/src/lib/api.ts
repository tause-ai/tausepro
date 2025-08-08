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
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
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
    const originalRequest = error?.config || {}
    const status = error?.response?.status
    if (status === 401 && !originalRequest._retry) {
      ;(originalRequest as any)._retry = true
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
    // Llamada real a la API del backend
    const response = await api.get('/pymes/dashboard')
    return response.data
  },
}

// Tipos Tenants
export interface Tenant {
  id: string
  name: string
  slug: string
  domain: string | null
  industry: string | null
  location: string | null
  plan: string
  revenue: number
  is_active: boolean
  created_at: string
  updated_at: string
  settings?: string | null
}

interface TenantsListResponse {
  success: boolean
  data: Tenant[]
  count: number
}

export const tenantsApi = {
  list: async (): Promise<Tenant[]> => {
    const { data } = await api.get<TenantsListResponse>('/tenants')
    return data.data
  },
  create: async (payload: Partial<Tenant> & { name: string; slug: string }): Promise<Tenant> => {
    const { data } = await api.post<{ success: boolean; data: Tenant }>(
      '/tenants',
      payload
    )
    return data.data
  },
  update: async (id: string, payload: Partial<Tenant>): Promise<Tenant> => {
    const { data } = await api.put<{ success: boolean; data: Tenant }>(
      `/tenants/${id}`,
      payload
    )
    return data.data
  },
  remove: async (id: string): Promise<void> => {
    await api.delete(`/tenants/${id}`)
  },
}

// Exportación por defecto para uso simplificado
export default {
  ...authApi,
  ...pymeApi,
  ...tenantsApi,
}
