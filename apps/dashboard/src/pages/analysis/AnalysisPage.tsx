import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Share2, TrendingUp, Users, Target, Zap, Trophy, Star, AlertTriangle, Rocket, Crown, Award } from 'lucide-react'
import GamifiedReport from '@/components/GamifiedReport'

interface AnalysisData {
  company: {
    name: string
    url: string
    description: string
    industry: string
    location: string
  }
  digitalization_score: {
    total: number
    level: string
    categories: {
      web_presence: { score: number; details: any[] }
      local_seo: { score: number; details: any[] }
      social_media: { score: number; details: any[] }
      engagement: { score: number; details: any[] }
      technical: { score: number; details: any[] }
    }
  }
  opportunities: Array<{
    category: string
    title: string
    description: string
    impact: string
    effort: string
    roi: string
  }>
  competitors: Array<{
    name: string
    url: string
    strengths: string[]
    weaknesses: string[]
    market_share: string
  }>
  recommendations: Array<{
    priority: string
    category: string
    title: string
    description: string
    actions: string[]
    timeline: string
    cost: string
  }>
  colombia_context: {
    economic_context: string
    digital_adoption: string
    payment_methods: string[]
    shipping_options: string[]
    regulations: string[]
    local_trends: string[]
  }
}

export default function AnalysisPageNew() {
  const { user } = useAuthStore()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')

  const loadAnalysis = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/v1/analysis/latest', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.data)
      }
    } catch (error) {
      console.error('Error loading analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const performAnalysis = async (url: string) => {
    if (!user) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/v1/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ url })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.data)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error performing analysis:', error)
      alert('Error al realizar el análisis')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return
    await performAnalysis(url)
  }

  useEffect(() => {
    loadAnalysis()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Analizando tu empresa...</p>
        </div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Análisis de Digitalización
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa la URL de tu empresa para obtener un análisis completo de tu presencia digital
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de tu empresa
                  </label>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://tuempresa.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Analizando...' : 'Iniciar Análisis'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => setAnalysis(null)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nuevo Análisis
        </Button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Análisis de {analysis.company.name}
            </h1>
            <p className="text-gray-600 mt-2">{analysis.company.url}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Reporte Gamificado */}
        <GamifiedReport 
          score={{
            total: analysis.digitalization_score.total,
            web_presence: analysis.digitalization_score.categories.web_presence.score,
            local_seo: analysis.digitalization_score.categories.local_seo.score,
            social_media: analysis.digitalization_score.categories.social_media.score,
            technical: analysis.digitalization_score.categories.technical.score,
            engagement: analysis.digitalization_score.categories.engagement.score,
          }}
          companyName={analysis.company.name}
        />

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-6 h-6 mr-2" />
              Recomendaciones Prioritarias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.recommendations.slice(0, 5).map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Prioridad: {rec.priority}</span>
                    <span>Timeline: {rec.timeline}</span>
                    <span>Costo: {rec.cost}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Competidores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Análisis de Competidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.competitors.map((competitor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{competitor.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{competitor.url}</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-green-600">Fortalezas:</span>
                      <ul className="text-xs text-gray-600 mt-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-red-600">Debilidades:</span>
                      <ul className="text-xs text-gray-600 mt-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i}>• {weakness}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contexto Colombia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-6 h-6 mr-2" />
              Contexto Colombiano
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Contexto Económico</h4>
                <p className="text-sm text-gray-600">{analysis.colombia_context.economic_context}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Adopción Digital</h4>
                <p className="text-sm text-gray-600">{analysis.colombia_context.digital_adoption}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Métodos de Pago</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.colombia_context.payment_methods.map((method, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tendencias Locales</h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.colombia_context.local_trends.map((trend, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {trend}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 