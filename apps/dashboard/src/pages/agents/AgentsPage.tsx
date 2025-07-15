import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AgentStatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function AgentsPage() {
  const agents = [
    {
      id: 'agent_1',
      name: 'Asistente de Ventas',
      description: 'Ayuda con consultas de productos y precios',
      status: 'active' as const,
      conversations: 45,
      tools: ['product_catalog', 'price_calculator']
    },
    {
      id: 'agent_2', 
      name: 'Soporte Técnico',
      description: 'Resuelve dudas técnicas y problemas',
      status: 'active' as const,
      conversations: 23,
      tools: ['faq_searcher', 'inventory_check']
    },
    {
      id: 'agent_3',
      name: 'Calculadora Envíos',
      description: 'Calcula costos de envío para clientes',
      status: 'active' as const,
      conversations: 67,
      tools: ['shipping_calculator']
    },
    {
      id: 'agent_4',
      name: 'Gestor Inventario',
      description: 'Monitorea stock y productos',
      status: 'inactive' as const,
      conversations: 12,
      tools: ['inventory_check']
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agentes MCP</h1>
          <p className="text-muted-foreground">
            Gestiona tus asistentes de inteligencia artificial
          </p>
        </div>
        <Button>
          + Crear Agente
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="pyme-hover">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{agent.name}</CardTitle>
                <AgentStatusBadge status={agent.status} />
              </div>
              <CardDescription>
                {agent.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conversaciones:</span>
                  <span className="font-medium">{agent.conversations}</span>
                </div>
                
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Herramientas:</span>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs"
                      >
                        {tool.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Chat
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 