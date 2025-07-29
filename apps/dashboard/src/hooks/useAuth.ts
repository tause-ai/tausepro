import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface AuthUser extends User {
  supabase_user: SupabaseUser
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Versión temporal sin Supabase para debuggear
  useEffect(() => {
    console.log('🔍 useAuth: Iniciando versión temporal...')
    
    // Simular carga
    setTimeout(() => {
      console.log('🔍 useAuth: Carga completada (sin usuario)')
      setLoading(false)
      setUser(null)
    }, 1000)
  }, [])

  // Funciones temporales
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    console.log('🔍 signUp: Registro temporal')
    setLoading(true)
    setError(null)

    try {
      // Simular registro exitoso
      setTimeout(() => {
        console.log('🔍 signUp: Registro simulado exitoso')
        setLoading(false)
        // Redirigir al dashboard
        window.location.href = '/'
      }, 1000)

      return { success: true }
    } catch (err) {
      console.error('Error in signUp:', err)
      setError('Error en el registro')
      return { success: false, error: 'Error en el registro' }
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔍 signIn: Login temporal')
    setLoading(true)
    setError(null)

    try {
      // Simular login exitoso
      setTimeout(() => {
        console.log('🔍 signIn: Login simulado exitoso')
        setLoading(false)
        // Redirigir al dashboard del cliente (no al admin)
        window.location.href = '/'
      }, 1000)

      return { success: true }
    } catch (err) {
      console.error('Error in signIn:', err)
      setError('Error al iniciar sesión')
      return { success: false, error: 'Error al iniciar sesión' }
    }
  }

  const signOut = async () => {
    console.log('🔍 signOut: Logout temporal')
    setLoading(true)
    setError(null)

    try {
      setTimeout(() => {
        console.log('🔍 signOut: Logout simulado exitoso')
        setUser(null)
        setLoading(false)
        // Redirigir al login
        window.location.href = '/admin/login'
      }, 500)

      return { success: true }
    } catch (err) {
      console.error('Error in signOut:', err)
      setError('Error al cerrar sesión')
      return { success: false, error: 'Error al cerrar sesión' }
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    console.log('🔍 updateProfile: Actualización temporal')
    return { success: true }
  }

  const getCurrentUser = async () => {
    console.log('🔍 getCurrentUser: Función temporal')
  }

  console.log('🔍 useAuth: Estado actual:', { user: user?.id, loading, error })

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    getCurrentUser
  }
} 