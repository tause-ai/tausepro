import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { UsageLimit } from '../lib/supabase'

export interface PaywallLimits {
  api_calls: { current: number; limit: number; reset_date: string }
  mcp_agents: { current: number; limit: number; reset_date: string }
  whatsapp_messages: { current: number; limit: number; reset_date: string }
}

export interface PaywallStatus {
  isLimited: boolean
  limits: PaywallLimits
  plan: 'free' | 'starter' | 'growth' | 'scale'
  canUseFeature: (feature: keyof PaywallLimits) => boolean
}

export function usePaywall() {
  const [limits, setLimits] = useState<PaywallLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener límites de uso del usuario actual
  const fetchUsageLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      const { data: usageData, error: usageError } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)

      if (usageError) {
        console.error('Error fetching usage limits:', usageError)
        setError('Error al obtener límites de uso')
        return
      }

      // Convertir datos a formato PaywallLimits
      const limitsData: PaywallLimits = {
        api_calls: { current: 0, limit: 100, reset_date: new Date().toISOString() },
        mcp_agents: { current: 0, limit: 3, reset_date: new Date().toISOString() },
        whatsapp_messages: { current: 0, limit: 50, reset_date: new Date().toISOString() }
      }

      // Mapear datos de Supabase
      usageData?.forEach((limit: UsageLimit) => {
        if (limit.resource_type in limitsData) {
          limitsData[limit.resource_type as keyof PaywallLimits] = {
            current: limit.current_usage,
            limit: limit.limit_value,
            reset_date: limit.reset_date
          }
        }
      })

      setLimits(limitsData)
    } catch (err) {
      console.error('Error in fetchUsageLimits:', err)
      setError('Error al obtener límites de uso')
    } finally {
      setLoading(false)
    }
  }

  // Incrementar uso de un recurso
  const incrementUsage = async (resourceType: keyof PaywallLimits, amount: number = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener límite actual
      const { data: currentLimit, error: fetchError } = await supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_type', resourceType)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (currentLimit) {
        // Actualizar uso existente
        const { error: updateError } = await supabase
          .from('usage_limits')
          .update({ 
            current_usage: currentLimit.current_usage + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentLimit.id)

        if (updateError) {
          throw updateError
        }
      } else {
        // Crear nuevo registro de límite
        const { error: insertError } = await supabase
          .from('usage_limits')
          .insert({
            user_id: user.id,
            tenant_id: '00000000-0000-0000-0000-000000000000', // Tenant por defecto
            resource_type: resourceType,
            current_usage: amount,
            limit_value: getDefaultLimit(resourceType),
            reset_date: new Date().toISOString()
          })

        if (insertError) {
          throw insertError
        }
      }

      // Actualizar estado local
      await fetchUsageLimits()
      
      return { success: true }
    } catch (err) {
      console.error('Error incrementing usage:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Verificar si se puede usar una característica
  const canUseFeature = (feature: keyof PaywallLimits): boolean => {
    if (!limits) return false
    
    const limit = limits[feature]
    return limit.current < limit.limit
  }

  // Obtener límite por defecto según el recurso
  const getDefaultLimit = (resourceType: string): number => {
    const defaultLimits: Record<string, number> = {
      api_calls: 100,
      mcp_agents: 3,
      whatsapp_messages: 50
    }
    return defaultLimits[resourceType] || 0
  }

  // Obtener plan del usuario
  const getPlan = (): 'free' | 'starter' | 'growth' | 'scale' => {
    // Por ahora todos los usuarios están en plan free
    // En el futuro esto vendría de la tabla tenants
    return 'free'
  }

  // Verificar si el usuario está limitado
  const isLimited = (): boolean => {
    if (!limits) return false
    
    return Object.values(limits).some(limit => limit.current >= limit.limit)
  }

  // Obtener estado completo del paywall
  const getPaywallStatus = (): PaywallStatus => {
    return {
      isLimited: isLimited(),
      limits: limits || {
        api_calls: { current: 0, limit: 100, reset_date: new Date().toISOString() },
        mcp_agents: { current: 0, limit: 3, reset_date: new Date().toISOString() },
        whatsapp_messages: { current: 0, limit: 50, reset_date: new Date().toISOString() }
      },
      plan: getPlan(),
      canUseFeature
    }
  }

  // Resetear límites (para testing)
  const resetLimits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      const { error } = await supabase
        .from('usage_limits')
        .update({ 
          current_usage: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      await fetchUsageLimits()
      return { success: true }
    } catch (err) {
      console.error('Error resetting limits:', err)
      return { success: false, error: err instanceof Error ? err.message : 'Error desconocido' }
    }
  }

  // Cargar límites al inicializar
  useEffect(() => {
    fetchUsageLimits()
  }, [])

  return {
    limits,
    loading,
    error,
    fetchUsageLimits,
    incrementUsage,
    canUseFeature,
    getPaywallStatus,
    resetLimits,
    isLimited: isLimited(),
    plan: getPlan()
  }
} 