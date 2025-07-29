import { useState, useEffect } from 'react'

export interface Agent {
  id: string
  name: string
  personality: {
    name: string
    age: number
    style: string
    expertise: string[]
    tone: string
    background: string
    language: string
    preferences: {
      communication_style: string
      focus_areas: string[]
    }
  }
  knowledge: {
    company_analysis: any[]
    google_drive: any
    specialized_apis: Record<string, any>
    learning_history: any[]
    patterns: any[]
    best_practices: any[]
    case_studies: any[]
    user_feedback: any[]
    metadata: Record<string, any>
  }
  skills: Array<{
    id: string
    name: string
    description: string
    category: string
    level: number
    is_active: boolean
    metadata: Record<string, any>
  }>
  context: {
    user_id: string
    session_id: string
    tenant_id: string
    current_topic: string
    history: any[]
    user_profile: any
    intent: string
    confidence: number
    metadata: Record<string, any>
  }
  is_active: boolean
  tenant_id: string
  created_at: string
  updated_at: string
  metadata: Record<string, any>
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: any
}

export interface SendMessageRequest {
  message: string
  user_id: string
  session_id: string
  tenant_id: string
}

export interface SendMessageResponse {
  data: ChatMessage
  message: string
  success: boolean
}

export interface ConversationHistoryResponse {
  data: ChatMessage[] | null
  success: boolean
  total: number
}

const API_BASE_URL = 'http://localhost:8080/api/v1'

export function useAgents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener todos los agentes
  const fetchAgents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/agents/`)
      const data = await response.json()
      
      if (data.success) {
        setAgents(data.data)
      } else {
        setError(data.error || 'Error al cargar agentes')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error fetching agents:', err)
    } finally {
      setLoading(false)
    }
  }

  // Enviar mensaje a un agente
  const sendMessage = async (
    agentId: string, 
    request: SendMessageRequest
  ): Promise<SendMessageResponse | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })
      
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error sending message:', err)
      return null
    }
  }

  // Obtener historial de conversación
  const getConversationHistory = async (
    agentId: string,
    sessionId: string,
    userId: string
  ): Promise<ConversationHistoryResponse | null> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/agents/${agentId}/history?session_id=${sessionId}&user_id=${userId}`
      )
      
      const data = await response.json()
      return data
    } catch (err) {
      console.error('Error fetching conversation history:', err)
      return null
    }
  }

  // Crear nuevo agente
  const createAgent = async (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/agents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agent),
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAgents() // Recargar la lista
        return data.data
      } else {
        setError(data.error || 'Error al crear agente')
        return null
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error creating agent:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Actualizar agente
  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAgents() // Recargar la lista
        return data.data
      } else {
        setError(data.error || 'Error al actualizar agente')
        return null
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error updating agent:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Eliminar agente
  const deleteAgent = async (id: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/agents/${id}`, {
        method: 'DELETE',
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAgents() // Recargar la lista
        return true
      } else {
        setError(data.error || 'Error al eliminar agente')
        return false
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error deleting agent:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Inicializar agentes por defecto
  const initializeDefaultAgents = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/agents/initialize`, {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        await fetchAgents() // Recargar la lista
        return data.data
      } else {
        setError(data.error || 'Error al inicializar agentes')
        return null
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error initializing agents:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAgents()
  }, [])

  return {
    agents,
    loading,
    error,
    fetchAgents,
    sendMessage,
    getConversationHistory,
    createAgent,
    updateAgent,
    deleteAgent,
    initializeDefaultAgents,
  }
} 