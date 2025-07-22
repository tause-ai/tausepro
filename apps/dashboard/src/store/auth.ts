import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'
import type { AuthState } from '@/types'

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // Modo demo temporal para testing
          if (email === 'admin@example.com' && password === 'password') {
            const demoUser = {
              id: 'demo-user-1',
              email: 'admin@example.com',
              name: 'Admin Demo',
              role: 'admin' as const,
              tenantId: 'demo-tenant-1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const demoTenant = {
              id: 'demo-tenant-1',
              name: 'Mi PYME Colombia',
              subdomain: 'demo',
              plan: 'gratis' as const,
              nit: '900123456-7',
              city: 'Bogotá',
              department: 'Cundinamarca',
              industry: 'Tecnología',
              phone: '+573001234567',
              email: 'admin@example.com',
              address: 'Calle 123 #45-67',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const demoToken = 'demo-token-' + Date.now()
            
            set({ 
              user: demoUser, 
              tenant: demoTenant, 
              token: demoToken, 
              isAuthenticated: true, 
              isLoading: false 
            })
            
            // Verificar redirect parameters
            const urlParams = new URLSearchParams(window.location.search)
            const redirect = urlParams.get('redirect')
            const companyUrl = urlParams.get('companyUrl')
            
            if (redirect === 'analysis' && companyUrl) {
              // Redirigir a la página de análisis con la URL de la empresa
              window.location.href = `/analysis?companyUrl=${encodeURIComponent(companyUrl)}`
            } else {
              // Redirigir al dashboard normal
              window.location.href = '/dashboard'
            }
            return
          }

          // Modo demo para Super Admin
          if (email === 'superadmin@tause.pro' && password === 'admin123') {
            const demoAdminUser = {
              id: 'demo-admin-1',
              email: 'superadmin@tause.pro',
              name: 'Super Admin Demo',
              role: 'super_admin' as const,
              tenantId: 'system',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
            const demoAdminToken = 'demo-admin-token-' + Date.now()
            
            // Guardar token admin en localStorage para el store admin
            localStorage.setItem('admin-token', demoAdminToken)
            
            set({ 
              user: demoAdminUser, 
              tenant: null, 
              token: demoAdminToken, 
              isAuthenticated: true, 
              isLoading: false 
            })
            return
          }
          
          // Intento de login real con PocketBase
          const { token, user, tenant } = await authApi.login(email, password)
          set({ user, tenant, token, isAuthenticated: true, isLoading: false })
        } catch {
          set({ isLoading: false })
          throw new Error('Invalid credentials')
        }
      },

      logout: () => {
        set({ user: null, tenant: null, token: null, isAuthenticated: false })
      },

      refreshUser: async () => {
        try {
          set({ isLoading: false })
        } catch (error) {
          console.error('Error in refreshUser:', error)
          set({ isLoading: false })
        }
      },

      setToken: (token: string) => {
        set({ token })
      },
    }),
    {
      name: 'tausepro-auth-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          const { state } = JSON.parse(str)
          return {
            state: {
              ...state,
              // Asegurarnos que el estado de carga no se persista como true
              isLoading: false,
            },
          }
        },
        setItem: (name, newValue) => {
          // Persistir solo lo necesario
          const { state } = newValue
          const aGuardar = {
            state: {
              user: state.user,
              tenant: state.tenant,
              token: state.token,
              isAuthenticated: state.isAuthenticated,
            },
          }
          localStorage.setItem(name, JSON.stringify(aGuardar))
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
) 