import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Share2, TrendingUp, Users, Target, Zap, Trophy, Star, AlertTriangle, Rocket, Crown, Award } from 'lucide-react'

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

export default function AnalysisPage() {
  const { user } = useAuthStore()
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [companyUrl, setCompanyUrl] = useState('')

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search)
        const urlFromParams = urlParams.get('companyUrl')
        
        if (!urlFromParams) {
          setShowForm(true)
          setLoading(false)
          return
        }

        setCompanyUrl(urlFromParams)
        await performAnalysis(urlFromParams)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        setLoading(false)
      }
    }

    loadAnalysis()
  }, [])

  const performAnalysis = async (url: string) => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('http://localhost:8081/api/v1/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error('Error al cargar el análisis')
      }

      const data = await response.json()
      setAnalysis(data.data)
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyUrl.trim()) {
      setError('Por favor ingresa una URL válida')
      return
    }
    await performAnalysis(companyUrl.trim())
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-yellow-600 bg-yellow-100'
    if (score >= 20) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLevel = (score: number) => {
    if (score >= 80) return 'Excelente'
    if (score >= 60) return 'Bueno'
    if (score >= 40) return 'Regular'
    if (score >= 20) return 'Básico'
    return 'Inicial'
  }

  // Funciones de gamificación
  const getDigitalizationBadge = (score: number) => {
    if (score >= 90) return { emoji: '👑', level: 'Líder Digital', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600', icon: Crown }
    if (score >= 80) return { emoji: '🏆', level: 'Experto Digital', color: 'bg-gradient-to-r from-green-400 to-green-600', icon: Trophy }
    if (score >= 70) return { emoji: '🥇', level: 'Avanzado', color: 'bg-gradient-to-r from-blue-400 to-blue-600', icon: Award }
    if (score >= 60) return { emoji: '🥈', level: 'Intermedio', color: 'bg-gradient-to-r from-purple-400 to-purple-600', icon: Star }
    if (score >= 40) return { emoji: '🥉', level: 'Básico', color: 'bg-gradient-to-r from-orange-400 to-orange-600', icon: Target }
    return { emoji: '🚀', level: 'Principiante', color: 'bg-gradient-to-r from-red-400 to-red-600', icon: Rocket }
  }

  const getCategoryEmoji = (score: number) => {
    if (score >= 80) return '🟢'
    if (score >= 60) return '🔵'
    if (score >= 40) return '🟡'
    if (score >= 20) return '🟠'
    return '🔴'
  }

  const getOpportunityMessage = (score: number) => {
    const potential = 100 - score
    if (potential >= 60) return {
      message: `¡Estás dejando ${potential}% de oportunidades sobre la mesa! 💰`,
      cta: 'Activa tu transformación digital ahora',
      urgency: 'high'
    }
    if (potential >= 40) return {
      message: `Tienes un ${potential}% de potencial sin explotar 📈`,
      cta: 'Acelera tu crecimiento digital',
      urgency: 'medium'
    }
    if (potential >= 20) return {
      message: `${potential}% de mejora te espera 🎯`,
      cta: 'Optimiza tu presencia digital',
      urgency: 'low'
    }
    return {
      message: '¡Excelente! Mantén tu liderazgo digital 🌟',
      cta: 'Descubre nuevas oportunidades',
      urgency: 'maintain'
    }
  }

  const getEmotionalCopy = (category: string, score: number) => {
    const copies = {
      web_presence: {
        low: '🚨 Tu sitio web está perdiendo clientes cada día',
        medium: '⚡ Tu web tiene potencial, pero necesita más poder',
        high: '🌟 Tu presencia web está brillando'
      },
      social_media: {
        low: '📱 Tus competidores te están ganando en redes sociales',
        medium: '🎯 Estás en el camino correcto en redes sociales',
        high: '🔥 Dominas las redes sociales'
      },
      local_seo: {
        low: '📍 Los clientes no te encuentran cuando te buscan',
        medium: '🗺️ Estás apareciendo, pero puedes ser más visible',
        high: '🎯 Eres fácil de encontrar localmente'
      },
      engagement: {
        low: '💔 Tus clientes no están conectando contigo',
        medium: '💬 Tienes buena conexión, pero puede mejorar',
        high: '❤️ Tus clientes te aman'
      },
      technical: {
        low: '⚠️ Problemas técnicos están afectando tu negocio',
        medium: '🔧 Tu tecnología funciona, pero puede optimizarse',
        high: '⚡ Tu tecnología está a la vanguardia'
      }
    }
    
    const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low'
    return copies[category as keyof typeof copies]?.[level] || ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando análisis...</p>
        </div>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🔍 Análisis de Empresa</CardTitle>
            <CardDescription>
              Ingresa la URL de la empresa que quieres analizar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label htmlFor="companyUrl" className="text-sm font-medium">
                  URL de la empresa
                </label>
                <input
                  id="companyUrl"
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="https://ejemplo.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Ingresa la URL del sitio web o redes sociales de la empresa
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!companyUrl.trim() || loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  '🔍 Analizar Empresa'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => setShowForm(true)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al formulario
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No se encontró análisis</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Análisis de {analysis.company.name}
              </h1>
              <p className="text-gray-600">
                Análisis completo del mercado colombiano
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        </div>

        {/* Score principal gamificado */}
        <Card className="overflow-hidden">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold">
              Nivel de Digitalización
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6 mb-6">
              {/* Badge de nivel */}
              <div className={`${getDigitalizationBadge(analysis.digitalization_score.total).color} text-white px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-transform`}>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{getDigitalizationBadge(analysis.digitalization_score.total).emoji}</span>
                  <div>
                    <div className="text-xl font-bold">{getDigitalizationBadge(analysis.digitalization_score.total).level}</div>
                    <div className="text-sm opacity-90">Puntuación: {analysis.digitalization_score.total}%</div>
                  </div>
                </div>
              </div>

              {/* Círculo de progreso mejorado */}
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    strokeDasharray={`${analysis.digitalization_score.total}, 100`}
                    strokeLinecap="round"
                    className="drop-shadow-sm"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={analysis.digitalization_score.total >= 70 ? '#10b981' : analysis.digitalization_score.total >= 40 ? '#f59e0b' : '#ef4444'} />
                      <stop offset="100%" stopColor={analysis.digitalization_score.total >= 70 ? '#059669' : analysis.digitalization_score.total >= 40 ? '#d97706' : '#dc2626'} />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">{analysis.digitalization_score.total}%</span>
                  <span className="text-sm text-gray-500 mt-1">Digital Score</span>
                </div>
              </div>

              {/* Mensaje de oportunidad */}
              <div className={`p-4 rounded-xl border-l-4 w-full ${
                getOpportunityMessage(analysis.digitalization_score.total).urgency === 'high' ? 'bg-red-50 border-red-400' :
                getOpportunityMessage(analysis.digitalization_score.total).urgency === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                getOpportunityMessage(analysis.digitalization_score.total).urgency === 'low' ? 'bg-blue-50 border-blue-400' :
                'bg-green-50 border-green-400'
              }`}>
                <p className="font-semibold text-lg mb-2">{getOpportunityMessage(analysis.digitalization_score.total).message}</p>
                <Button className={`w-full ${
                  getOpportunityMessage(analysis.digitalization_score.total).urgency === 'high' ? 'bg-red-600 hover:bg-red-700' :
                  getOpportunityMessage(analysis.digitalization_score.total).urgency === 'medium' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  getOpportunityMessage(analysis.digitalization_score.total).urgency === 'low' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-green-600 hover:bg-green-700'
                } text-white font-bold py-3 text-lg shadow-lg hover:shadow-xl transition-all`}>
                  <Rocket className="mr-2 h-5 w-5" />
                  {getOpportunityMessage(analysis.digitalization_score.total).cta}
                </Button>
              </div>
            </div>

            {/* Categorías gamificadas */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(analysis.digitalization_score.categories).map(([key, category]) => (
                <div key={key} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {key === 'web_presence' && '🌐 Presencia Web'}
                      {key === 'local_seo' && '📍 SEO Local'}
                      {key === 'social_media' && '📱 Redes Sociales'}
                      {key === 'engagement' && '💬 Engagement'}
                      {key === 'technical' && '⚙️ Aspectos Técnicos'}
                    </h4>
                    <span className="text-2xl">{getCategoryEmoji(category.score)}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-3xl font-bold px-3 py-1 rounded-lg ${getScoreColor(category.score)}`}>
                        {category.score}%
                      </span>
                      <Badge className={`${getScoreColor(category.score)} font-semibold`}>
                        {getScoreLevel(category.score)}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${category.score}%` }}
                      ></div>
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {getEmotionalCopy(key, category.score)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Logros y Oportunidades Gamificadas */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Logros Desbloqueados */}
          <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Trophy className="w-6 h-6 mr-2" />
                Logros Desbloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.digitalization_score.categories.web_presence.score >= 70 && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-semibold text-green-700">Presencia Web Sólida</p>
                      <p className="text-sm text-gray-600">Tu sitio web está bien establecido</p>
                    </div>
                  </div>
                )}
                {analysis.digitalization_score.categories.social_media.score >= 60 && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="font-semibold text-blue-700">Conectado Socialmente</p>
                      <p className="text-sm text-gray-600">Buena presencia en redes sociales</p>
                    </div>
                  </div>
                )}
                {analysis.digitalization_score.categories.technical.score >= 80 && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">⚡</span>
                    <div>
                      <p className="font-semibold text-purple-700">Técnicamente Superior</p>
                      <p className="text-sm text-gray-600">Excelente implementación técnica</p>
                    </div>
                  </div>
                )}
                {analysis.digitalization_score.total >= 90 && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <span className="text-2xl">👑</span>
                    <div>
                      <p className="font-semibold text-yellow-700">Líder Digital</p>
                      <p className="text-sm text-gray-600">¡Eres un referente en digitalización!</p>
                    </div>
                  </div>
                )}
                {(analysis.digitalization_score.categories.web_presence.score < 70 && analysis.digitalization_score.categories.social_media.score < 60 && analysis.digitalization_score.categories.technical.score < 80 && analysis.digitalization_score.total < 90) && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <p className="font-semibold text-gray-700">Comenzando el Viaje</p>
                      <p className="text-sm text-gray-600">¡Grandes oportunidades te esperan!</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Oportunidades como Misiones */}
          <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center text-red-800">
                <AlertTriangle className="w-6 h-6 mr-2" />
                Misiones Pendientes
              </CardTitle>
              <CardDescription className="text-red-600">
                Completa estas misiones para subir de nivel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.opportunities.slice(0, 3).map((opportunity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm border-l-4 border-red-400">
                    <span className="text-xl">🎯</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">{opportunity.category}</h4>
                      <p className="text-red-700 text-sm">{opportunity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                          +{opportunity.impact} puntos
                        </span>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                          Completar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Oportunidades Completas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Todas las Oportunidades Identificadas
            </CardTitle>
            <CardDescription>
              Acciones específicas para mejorar tu presencia digital
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analysis.opportunities.map((opportunity, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{opportunity.category}</Badge>
                    <Badge 
                      variant={opportunity.impact === 'Alto' ? 'default' : 'secondary'}
                    >
                      {opportunity.impact}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{opportunity.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Esfuerzo: {opportunity.effort}</span>
                    <span className="font-medium text-green-600">{opportunity.roi}</span>
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
              <Users className="w-5 h-5 mr-2" />
              Análisis Competitivo
            </CardTitle>
            <CardDescription>
              Principales competidores identificados en el mercado colombiano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {analysis.competitors.map((competitor, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{competitor.name}</h4>
                    <Badge variant="outline">{competitor.market_share}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-green-600 mb-2">Fortalezas</h5>
                      <ul className="text-sm space-y-1">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium text-red-600 mb-2">Debilidades</h5>
                      <ul className="text-sm space-y-1">
                        {competitor.weaknesses.map((weakness, i) => (
                          <li key={i} className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recomendaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Plan de Acción Recomendado
            </CardTitle>
            <CardDescription>
              Acciones priorizadas para implementar en tu PYME
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysis.recommendations.map((rec, index) => (
                <div key={index} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Badge 
                        variant={rec.priority === 'Alta' ? 'destructive' : 'secondary'}
                      >
                        {rec.priority}
                      </Badge>
                      <Badge variant="outline">{rec.category}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Timeline</div>
                      <div className="font-medium">{rec.timeline}</div>
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold mb-2">{rec.title}</h4>
                  <p className="text-gray-600 mb-4">{rec.description}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Acciones Específicas:</h5>
                      <ul className="text-sm space-y-1">
                        {rec.actions.map((action, i) => (
                          <li key={i} className="flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Inversión Estimada</div>
                      <div className="font-bold text-lg text-green-600">{rec.cost}</div>
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
            <CardTitle>🇨🇴 Contexto Colombiano</CardTitle>
            <CardDescription>
              Información específica del mercado colombiano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Tendencias Locales</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.colombia_context.local_trends.map((trend, index) => (
                    <Badge key={index} variant="outline">{trend}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Métodos de Pago</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.colombia_context.payment_methods.map((method, index) => (
                    <Badge key={index} variant="secondary">{method}</Badge>
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