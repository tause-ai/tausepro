import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthState, User, Tenant } from '@/types'

// Simulación de API - En producción esto se conectaría al MCP Server
const authApi = {
  async login(email: string, password: string): Promise<{ user: User; tenant: Tenant; token: string }> {
    // Simulación de autenticación
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (email === 'admin@example.com' && password === 'password') {
      const tenant: Tenant = {
        id: 'tenant_colombia_1',
        name: 'Mi PYME Colombiana',
        subdomain: 'mipyme',
        plan: 'starter',
        nit: '900.123.456-7',
        city: 'Bogotá',
        department: 'Bogotá D.C.',
        industry: 'Comercio al por menor',
        phone: '+57 301 234 5678',
        email: 'info@mipyme.com.co',
        address: 'Calle 93 #11-50, Bogotá',
        isActive: true,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: new Date().toISOString(),
      }
      
      const user: User = {
        id: 'user_colombia_1',
        email: 'admin@example.com',
        name: 'María García',
        role: 'owner',
        tenantId: tenant.id,
        createdAt: '2024-01-15T08:00:00Z',
        updatedAt: new Date().toISOString(),
      }
      
      return { user, tenant, token: 'mock_jwt_token_123' }
    }
    
    throw new Error('Credenciales incorrectas')
  },
  
  async refreshUser(): Promise<{ user: User; tenant: Tenant }> {
    // Simulación de refresh del usuario
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const tenant: Tenant = {
      id: 'tenant_colombia_1',
      name: 'Mi PYME Colombiana',
      subdomain: 'mipyme',
      plan: 'starter',
      nit: '900.123.456-7',
      city: 'Bogotá',
      department: 'Bogotá D.C.',
      industry: 'Comercio al por menor',
      phone: '+57 301 234 5678',
      email: 'info@mipyme.com.co',
      address: 'Calle 93 #11-50, Bogotá',
      isActive: true,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: new Date().toISOString(),
    }
    
    const user: User = {
      id: 'user_colombia_1',
      email: 'admin@example.com',
      name: 'María García',
      role: 'owner',
      tenantId: tenant.id,
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: new Date().toISOString(),
    }
    
    return { user, tenant }
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const { user, tenant, token } = await authApi.login(email, password)
          
          // Guardar token en localStorage
          localStorage.setItem('authToken', token)
          
          set({
            user,
            tenant,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        // Limpiar token
        localStorage.removeItem('authToken')
        
        set({
          user: null,
          tenant: null,
          isAuthenticated: false,
          isLoading: false,
        })
      },

      refreshUser: async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return
        
        set({ isLoading: true })
        
        try {
          const { user, tenant } = await authApi.refreshUser()
          
          set({
            user,
            tenant,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Si falla el refresh, hacer logout
          get().logout()
        }
      },
    }),
    {
      name: 'tausepro-auth',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
) 