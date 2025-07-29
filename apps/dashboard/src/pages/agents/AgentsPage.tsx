import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAgents } from '@/hooks/useAgents'
import { Loader2, MessageCircle, Settings, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AgentsPage() {
  const { 
    agents, 
    loading, 
    error, 
    deleteAgent, 
    initializeDefaultAgents 
  } = useAgents()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleDeleteAgent = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este agente?')) {
      setDeletingId(id)
      await deleteAgent(id)
      setDeletingId(null)
    }
  }

  const handleInitializeAgents = async () => {
    await initializeDefaultAgents()
  }

  if (loading && agents.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando agentes...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agentes MCP</h1>
            <p className="text-muted-foreground">
              Gestiona tus asistentes de inteligencia artificial
            </p>
          </div>
          <Button onClick={handleInitializeAgents} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Inicializar Agentes
          </Button>
        </div>
        
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive">Error: {error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agentes MCP</h1>
          <p className="text-muted-foreground">
            Gestiona tus asistentes de inteligencia artificial
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleInitializeAgents} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Inicializar Agentes
          </Button>
        </div>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay agentes configurados</h3>
          <p className="text-muted-foreground mb-4">
            Inicializa los agentes por defecto para comenzar
          </p>
          <Button onClick={handleInitializeAgents} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Inicializar Agentes
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Card key={agent.id} className="pyme-hover">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{agent.name}</CardTitle>
                  <AgentStatusBadge status={agent.is_active ? 'active' : 'inactive'} />
                </div>
                <CardDescription>
                  {agent.personality.background}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Especialidad:</span>
                    <span className="font-medium">{agent.personality.expertise.join(', ')}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Habilidades:</span>
                    <div className="flex flex-wrap gap-1">
                      {agent.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill.id}
                          className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
                        >
                          {skill.name}
                        </span>
                      ))}
                      {agent.skills.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs">
                          +{agent.skills.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estilo:</span>
                    <span className="font-medium">{agent.personality.style}</span>
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/agents/${agent.id}/chat`)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteAgent(agent.id)}
                      disabled={deletingId === agent.id}
                    >
                      {deletingId === agent.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 