import { useParams } from 'react-router-dom'
import { AgentChat } from '@/components/AgentChat'
import { useAgents } from '@/hooks/useAgents'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export default function AgentChatPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { agents, loading } = useAgents()
  
  const agent = agents.find(a => a.id === agentId)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando agente...</span>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/agents')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Agente no encontrado</h2>
          <p className="text-muted-foreground">
            El agente que buscas no existe o ha sido eliminado.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/agents')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a Agentes
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold">Chat con {agent.name}</h1>
          <p className="text-muted-foreground">
            {agent.personality.background}
          </p>
        </div>
      </div>

      <AgentChat
        agentId={agent.id}
        agentName={agent.name}
        userId="dashboard-user"
        sessionId="dashboard-session"
        tenantId="default"
      />
    </div>
  )
} 