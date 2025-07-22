// Store para el Super Admin Dashboard de TausePro
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { adminApi, adminApiDemo } from '@/lib/admin-api'
import type { AdminState, AdminUser, AdminTenant, AdminModule, AdminMCPAgent, SystemConfig, SystemMetrics } from '@/types/admin'

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // ===== ESTADO INICIAL =====
      currentUser: null,
      tenants: [],
      modules: [],
      agents: [],
      systemConfig: null,
      systemMetrics: null,

      isLoading: {
        tenants: false,
        modules: false,
        agents: false,
        config: false,
        metrics: false,
      },

      errors: {
        tenants: null,
        modules: null,
        agents: null,
        config: null,
        metrics: null,
      },

      filters: {
        tenants: {
          plan: '',
          status: '',
          city: '',
          industry: '',
        },
        modules: {
          category: '',
          status: '',
        },
        agents: {
          category: '',
          status: '',
        },
      },

      // ===== ACCIONES =====
      actions: {
        // ===== GESTIÓN DE TENANTS =====
        fetchTenants: async () => {
          set((state) => ({
            isLoading: { ...state.isLoading, tenants: true },
            errors: { ...state.errors, tenants: null },
          }))

          try {
            // Modo demo para testing
            const token = localStorage.getItem('admin-token')
            if (token && token.startsWith('demo-admin-')) {
              const demoData = adminApiDemo.getDemoData()
              set({ tenants: demoData.tenants })
              return
            }

            const tenants = await adminApi.tenants.getAll(get().filters.tenants)
            set({ tenants })
          } catch (error) {
            console.error('Error fetching tenants:', error)
            set((state) => ({
              errors: { ...state.errors, tenants: 'Error al cargar tenants' },
            }))
          } finally {
            set((state) => ({
              isLoading: { ...state.isLoading, tenants: false },
            }))
          }
        },

        createTenant: async (data: Partial<AdminTenant>) => {
          try {
            const newTenant = await adminApi.tenants.create(data)
            set((state) => ({
              tenants: [...state.tenants, newTenant],
            }))
            return newTenant
          } catch (error) {
            console.error('Error creating tenant:', error)
            throw error
          }
        },

        updateTenant: async (id: string, data: Partial<AdminTenant>) => {
          try {
            await adminApi.tenants.update(id, data)
            set((state) => ({
              tenants: state.tenants.map((tenant) =>
                tenant.id === id ? { ...tenant, ...data } : tenant
              ),
            }))
          } catch (error) {
            console.error('Error updating tenant:', error)
            throw error
          }
        },

        deleteTenant: async (id: string) => {
          try {
            await adminApi.tenants.delete(id)
            set((state) => ({
              tenants: state.tenants.filter((tenant) => tenant.id !== id),
            }))
          } catch (error) {
            console.error('Error deleting tenant:', error)
            throw error
          }
        },

        suspendTenant: async (id: string, reason?: string) => {
          try {
            await adminApi.tenants.suspend(id, reason)
            set((state) => ({
              tenants: state.tenants.map((tenant) =>
                tenant.id === id ? { ...tenant, status: 'suspended' as const } : tenant
              ),
            }))
          } catch (error) {
            console.error('Error suspending tenant:', error)
            throw error
          }
        },

        activateTenant: async (id: string) => {
          try {
            await adminApi.tenants.activate(id)
            set((state) => ({
              tenants: state.tenants.map((tenant) =>
                tenant.id === id ? { ...tenant, status: 'active' as const } : tenant
              ),
            }))
          } catch (error) {
            console.error('Error activating tenant:', error)
            throw error
          }
        },

        // ===== GESTIÓN DE MÓDULOS =====
        fetchModules: async () => {
          set((state) => ({
            isLoading: { ...state.isLoading, modules: true },
            errors: { ...state.errors, modules: null },
          }))

          try {
            // Modo demo para testing
            const token = localStorage.getItem('admin-token')
            if (token && token.startsWith('demo-admin-')) {
              const demoData = adminApiDemo.getDemoData()
              set({ modules: demoData.modules })
              return
            }

            const modules = await adminApi.modules.getAll(get().filters.modules)
            set({ modules })
          } catch (error) {
            console.error('Error fetching modules:', error)
            set((state) => ({
              errors: { ...state.errors, modules: 'Error al cargar módulos' },
            }))
          } finally {
            set((state) => ({
              isLoading: { ...state.isLoading, modules: false },
            }))
          }
        },

        updateModule: async (id: string, data: Partial<AdminModule>) => {
          try {
            await adminApi.modules.update(id, data)
            set((state) => ({
              modules: state.modules.map((module) =>
                module.id === id ? { ...module, ...data } : module
              ),
            }))
          } catch (error) {
            console.error('Error updating module:', error)
            throw error
          }
        },

        toggleModule: async (id: string, enabled: boolean) => {
          try {
            await adminApi.modules.toggle(id, enabled)
            set((state) => ({
              modules: state.modules.map((module) =>
                module.id === id
                  ? { ...module, config: { ...module.config, isEnabled: enabled } }
                  : module
              ),
            }))
          } catch (error) {
            console.error('Error toggling module:', error)
            throw error
          }
        },

        // ===== GESTIÓN DE AGENTES MCP =====
        fetchAgents: async () => {
          set((state) => ({
            isLoading: { ...state.isLoading, agents: true },
            errors: { ...state.errors, agents: null },
          }))

          try {
            // Modo demo para testing
            const token = localStorage.getItem('admin-token')
            if (token && token.startsWith('demo-admin-')) {
              const demoData = adminApiDemo.getDemoData()
              set({ agents: demoData.agents })
              return
            }

            const agents = await adminApi.agents.getAll(get().filters.agents)
            set({ agents })
          } catch (error) {
            console.error('Error fetching agents:', error)
            set((state) => ({
              errors: { ...state.errors, agents: 'Error al cargar agentes' },
            }))
          } finally {
            set((state) => ({
              isLoading: { ...state.isLoading, agents: false },
            }))
          }
        },

        createAgent: async (data: Partial<AdminMCPAgent>) => {
          try {
            const newAgent = await adminApi.agents.create(data)
            set((state) => ({
              agents: [...state.agents, newAgent],
            }))
            return newAgent
          } catch (error) {
            console.error('Error creating agent:', error)
            throw error
          }
        },

        updateAgent: async (id: string, data: Partial<AdminMCPAgent>) => {
          try {
            await adminApi.agents.update(id, data)
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === id ? { ...agent, ...data } : agent
              ),
            }))
          } catch (error) {
            console.error('Error updating agent:', error)
            throw error
          }
        },

        deleteAgent: async (id: string) => {
          try {
            await adminApi.agents.delete(id)
            set((state) => ({
              agents: state.agents.filter((agent) => agent.id !== id),
            }))
          } catch (error) {
            console.error('Error deleting agent:', error)
            throw error
          }
        },

        assignAgentToTenant: async (agentId: string, tenantId: string) => {
          try {
            await adminApi.agents.assignToTenant(agentId, tenantId)
            set((state) => ({
              agents: state.agents.map((agent) =>
                agent.id === agentId
                  ? {
                      ...agent,
                      tenants: {
                        ...agent.tenants,
                        assigned: [...agent.tenants.assigned, tenantId],
                        active: [...agent.tenants.active, tenantId],
                      },
                    }
                  : agent
              ),
            }))
          } catch (error) {
            console.error('Error assigning agent to tenant:', error)
            throw error
          }
        },

        // ===== CONFIGURACIÓN DEL SISTEMA =====
        fetchSystemConfig: async () => {
          set((state) => ({
            isLoading: { ...state.isLoading, config: true },
            errors: { ...state.errors, config: null },
          }))

          try {
            const config = await adminApi.system.getConfig()
            set({ systemConfig: config })
          } catch (error) {
            console.error('Error fetching system config:', error)
            set((state) => ({
              errors: { ...state.errors, config: 'Error al cargar configuración' },
            }))
          } finally {
            set((state) => ({
              isLoading: { ...state.isLoading, config: false },
            }))
          }
        },

        updateSystemConfig: async (data: Partial<SystemConfig>) => {
          try {
            await adminApi.system.updateConfig(data)
            set((state) => ({
              systemConfig: state.systemConfig ? { ...state.systemConfig, ...data } : null,
            }))
          } catch (error) {
            console.error('Error updating system config:', error)
            throw error
          }
        },

        fetchSystemMetrics: async () => {
          set((state) => ({
            isLoading: { ...state.isLoading, metrics: true },
            errors: { ...state.errors, metrics: null },
          }))

          try {
            // Modo demo para testing
            const token = localStorage.getItem('admin-token')
            if (token && token.startsWith('demo-admin-')) {
              const demoData = adminApiDemo.getDemoData()
              set({ systemMetrics: demoData.systemMetrics })
              return
            }

            const metrics = await adminApi.system.getMetrics()
            set({ systemMetrics: metrics })
          } catch (error) {
            console.error('Error fetching system metrics:', error)
            set((state) => ({
              errors: { ...state.errors, metrics: 'Error al cargar métricas' },
            }))
          } finally {
            set((state) => ({
              isLoading: { ...state.isLoading, metrics: false },
            }))
          }
        },

        // ===== FILTROS =====
        setTenantFilter: (filter: Partial<AdminState['filters']['tenants']>) => {
          set((state) => ({
            filters: {
              ...state.filters,
              tenants: { ...state.filters.tenants, ...filter },
            },
          }))
        },

        setModuleFilter: (filter: Partial<AdminState['filters']['modules']>) => {
          set((state) => ({
            filters: {
              ...state.filters,
              modules: { ...state.filters.modules, ...filter },
            },
          }))
        },

        setAgentFilter: (filter: Partial<AdminState['filters']['agents']>) => {
          set((state) => ({
            filters: {
              ...state.filters,
              agents: { ...state.filters.agents, ...filter },
            },
          }))
        },
      },
    }),
    {
      name: 'tausepro-admin-store',
      partialize: (state) => ({
        currentUser: state.currentUser,
        filters: state.filters,
      }),
    }
  )
)

// ===== SELECTORES ÚTILES =====
export const useAdminTenants = () => useAdminStore((state) => state.tenants)
export const useAdminModules = () => useAdminStore((state) => state.modules)
export const useAdminAgents = () => useAdminStore((state) => state.agents)
export const useAdminSystemMetrics = () => useAdminStore((state) => state.systemMetrics)
export const useAdminSystemConfig = () => useAdminStore((state) => state.systemConfig)

export const useAdminLoading = () => useAdminStore((state) => state.isLoading)
export const useAdminErrors = () => useAdminStore((state) => state.errors)
export const useAdminFilters = () => useAdminStore((state) => state.filters)

export const useAdminActions = () => useAdminStore((state) => state.actions)

// ===== SELECTORES COMPUTADOS =====
export const useAdminTenantsByPlan = () => {
  const tenants = useAdminTenants()
  return tenants.reduce(
    (acc, tenant) => {
      acc[tenant.plan] = (acc[tenant.plan] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

export const useAdminTenantsByStatus = () => {
  const tenants = useAdminTenants()
  return tenants.reduce(
    (acc, tenant) => {
      acc[tenant.status] = (acc[tenant.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
}

export const useAdminActiveModules = () => {
  const modules = useAdminModules()
  return modules.filter((module) => module.config.isEnabled)
}

export const useAdminActiveAgents = () => {
  const agents = useAdminAgents()
  return agents.filter((agent) => agent.status === 'active')
} 