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

  // Obtener usuario actual
  const getCurrentUser = async () => {
    try {
      const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser()
      
      if (supabaseError) {
        setError(supabaseError.message)
        setUser(null)
        return
      }

      if (!supabaseUser) {
        setUser(null)
        return
      }

      // Obtener datos del usuario desde nuestra tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (userError) {
        console.error('Error fetching user data:', userError)
        setUser(null)
        return
      }

      if (userData) {
        setUser({
          ...userData,
          supabase_user: supabaseUser
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      console.error('Error in getCurrentUser:', err)
      setError('Error al obtener usuario')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // Registro de usuario
  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    setLoading(true)
    setError(null)

    try {
      // Registrar en Supabase Auth
      const { data: { user: supabaseUser }, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return { success: false, error: authError.message }
      }

      if (!supabaseUser) {
        setError('Error al crear usuario')
        return { success: false, error: 'Error al crear usuario' }
      }

      // Crear usuario en nuestra tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: supabaseUser.id,
          email,
          tenant_id: '00000000-0000-0000-0000-000000000000', // Tenant por defecto
          ...userData
        })

      if (userError) {
        console.error('Error creating user record:', userError)
        setError('Error al crear perfil de usuario')
        return { success: false, error: 'Error al crear perfil de usuario' }
      }

      // Obtener el usuario completo
      await getCurrentUser()

      return { success: true, user: supabaseUser }
    } catch (err) {
      console.error('Error in signUp:', err)
      setError('Error en el registro')
      return { success: false, error: 'Error en el registro' }
    } finally {
      setLoading(false)
    }
  }

  // Inicio de sesión
  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      if (supabaseUser) {
        await getCurrentUser()
        return { success: true, user: supabaseUser }
      }

      return { success: false, error: 'Error al iniciar sesión' }
    } catch (err) {
      console.error('Error in signIn:', err)
      setError('Error al iniciar sesión')
      return { success: false, error: 'Error al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }

  // Cerrar sesión
  const signOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      setUser(null)
      return { success: true }
    } catch (err) {
      console.error('Error in signOut:', err)
      setError('Error al cerrar sesión')
      return { success: false, error: 'Error al cerrar sesión' }
    } finally {
      setLoading(false)
    }
  }

  // Actualizar perfil de usuario
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      setError('No hay usuario autenticado')
      return { success: false, error: 'No hay usuario autenticado' }
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        setError(error.message)
        return { success: false, error: error.message }
      }

      // Actualizar estado local
      await getCurrentUser()
      return { success: true }
    } catch (err) {
      console.error('Error in updateProfile:', err)
      setError('Error al actualizar perfil')
      return { success: false, error: 'Error al actualizar perfil' }
    } finally {
      setLoading(false)
    }
  }

  // Escuchar cambios de autenticación
  useEffect(() => {
    getCurrentUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await getCurrentUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

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