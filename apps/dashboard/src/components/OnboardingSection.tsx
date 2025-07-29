import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Zap, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react'

interface AnalysisSummary {
  companyName: string
  digitalizationScore: number
  opportunities: Array<{
    category: string
    title: string
    description: string
    impact: string
  }>
  recommendations: Array<{
    priority: string
    title: string
    description: string
  }>
}

interface AgentRecommendation {
  id: string
  name: string
  type: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedImpact: string
  setupTime: string
}

const OnboardingSection: React.FC = () => {
  const [analysisSummary, setAnalysisSummary] = useState<AnalysisSummary | null>(null)
  const [agentRecommendations, setAgentRecommendations] = useState<AgentRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de datos del análisis
    setTimeout(() => {
      setAnalysisSummary({
        companyName: "Mi Empresa",
        digitalizationScore: 65,
        opportunities: [
          {
            category: "SEO Local",
            title: "Optimizar Google My Business",
            description: "Mejorar presencia en búsquedas locales",
            impact: "+15 puntos"
          },
          {
            category: "Redes Sociales",
            title: "Activar Instagram Business",
            description: "Conectar con clientes en Instagram",
            impact: "+10 puntos"
          },
          {
            category: "WhatsApp Business",
            title: "Configurar WhatsApp Business",
            description: "Automatizar atención al cliente",
            impact: "+12 puntos"
          }
        ],
        recommendations: [
          {
            priority: "Alta",
            title: "Agente de Ventas",
            description: "Automatizar captación de leads y seguimiento"
          },
          {
            priority: "Media",
            title: "Agente de Soporte",
            description: "Atención 24/7 para consultas de clientes"
          },
          {
            priority: "Baja",
            title: "Agente de Marketing",
            description: "Gestión de redes sociales y contenido"
          }
        ]
      })

      setAgentRecommendations([
        {
          id: "sales-agent",
          name: "Agente de Ventas",
          type: "Ventas",
          description: "Capta leads, califica prospectos y agenda reuniones automáticamente",
          priority: "high",
          estimatedImpact: "Aumento del 40% en conversiones",
          setupTime: "5 minutos"
        },
        {
          id: "support-agent",
          name: "Agente de Soporte",
          type: "Soporte",
          description: "Responde consultas frecuentes y deriva casos complejos",
          priority: "medium",
          estimatedImpact: "Reducción del 60% en tiempo de respuesta",
          setupTime: "3 minutos"
        },
        {
          id: "marketing-agent",
          name: "Agente de Marketing",
          type: "Marketing",
          description: "Gestiona redes sociales y crea contenido automáticamente",
          priority: "low",
          estimatedImpact: "Ahorro de 10 horas semanales",
          setupTime: "7 minutos"
        }
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bueno'
    if (score >= 40) return 'Intermedio'
    return 'Necesita Mejora'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analizando tu empresa...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysisSummary) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Resumen del Análisis */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <Target className="w-5 h-5 mr-2" />
            Resumen de tu Análisis
          </CardTitle>
          <CardDescription className="text-blue-700">
            Basado en el análisis de {analysisSummary.companyName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Score Principal */}
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(analysisSummary.digitalizationScore)}`}>
                {analysisSummary.digitalizationScore}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Nivel de Digitalización
              </div>
              <Badge className={`mt-2 ${getScoreColor(analysisSummary.digitalizationScore).replace('text-', 'bg-').replace('-600', '-100')} ${getScoreColor(analysisSummary.digitalizationScore)}`}>
                {getScoreLevel(analysisSummary.digitalizationScore)}
              </Badge>
            </div>

            {/* Oportunidades */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">🚀 Oportunidades de Mejora</h4>
              <div className="space-y-2">
                {analysisSummary.opportunities.slice(0, 3).map((opp, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{opp.title}</div>
                      <div className="text-xs text-gray-600">{opp.description}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {opp.impact}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendaciones de Agentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Agentes Recomendados para tu Empresa
          </CardTitle>
          <CardDescription>
            Basado en tu análisis, estos agentes te ayudarán a mejorar tu presencia digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentRecommendations.map((agent) => (
              <div key={agent.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                      <Badge className={getPriorityColor(agent.priority)}>
                        {agent.priority === 'high' ? 'Alta Prioridad' : 
                         agent.priority === 'medium' ? 'Media Prioridad' : 'Baja Prioridad'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="font-medium text-gray-700">Impacto Estimado:</span>
                        <div className="text-green-600">{agent.estimatedImpact}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tiempo de Configuración:</span>
                        <div className="text-blue-600">{agent.setupTime}</div>
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="ml-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Activar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Principal */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-lg">¿Listo para automatizar tu empresa?</h4>
                <p className="text-blue-100 text-sm mt-1">
                  Comienza con el agente de mayor prioridad y ve resultados en minutos
                </p>
              </div>
              <Button 
                variant="secondary" 
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Star className="w-4 h-4 mr-2" />
                Comenzar Ahora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OnboardingSection 