import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Tipos para el análisis
interface MarketAnalysis {
  company: {
    name: string
    url: string
    description: string
    industry: string
    location: string
    size: string
    founded: string
    social_media: Record<string, string>
    website: {
      technologies: string[]
      performance: string
      seo: {
        title: string
        description: string
        keywords: string[]
        score: number
      }
      ecommerce: boolean
      blog: boolean
      contact_info: boolean
    }
  }
  industry: {
    name: string
    size: string
    growth: string
    trends: string[]
    challenges: string[]
    opportunities: string[]
  }
  competitors: Array<{
    name: string
    url: string
    strengths: string[]
    weaknesses: string[]
    market_share: string
  }>
  opportunities: Array<{
    category: string
    title: string
    description: string
    impact: string
    effort: string
    roi: string
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
  analysis_date: string
}

interface PaywallPreview {
  company_name: string
  industry: string
  location: string
  summary: string
  highlights: string[]
  preview_data: Record<string, any>
}

interface AnalysisResponse {
  success: boolean
  data?: MarketAnalysis
  preview?: PaywallPreview
  error?: string
  message?: string
}

export default function AnalysisPage() {
  const [url, setUrl] = useState(() => {
    // Obtener URL de los parámetros de la URL si existe
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('companyUrl') || ''
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [preview, setPreview] = useState<PaywallPreview | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // Auto-analizar si viene con URL desde la landing
  useEffect(() => {
    if (url && !analysis && !isAnalyzing) {
      handleAnalyze()
    }
  }, [url])

  const handleAnalyze = async () => {
    if (!url) {
      setError('Por favor ingresa una URL válida')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setProgress(0)

    try {
      // Simular progreso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Llamar al API de análisis
      const response = await fetch('http://localhost:8081/api/v1/analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result: AnalysisResponse = await response.json()

      if (result.success) {
        setAnalysis(result.data || null)
        setPreview(result.preview || null)
      } else {
        setError(result.error || 'Error desconocido en el análisis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsAnalyzing(false)
      setTimeout(() => setProgress(0), 2000)
    }
  }

  const handlePreviewOnly = async () => {
    if (!url) {
      setError('Por favor ingresa una URL válida')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:8081/api/v1/analysis/preview?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const result: AnalysisResponse = await response.json()

      if (result.success) {
        setPreview(result.preview || null)
        setAnalysis(null) // Solo mostrar preview
      } else {
        setError(result.error || 'Error desconocido en el análisis')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!url) return

    try {
      const response = await fetch('http://localhost:8081/api/v1/analysis/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `analisis_${url.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error descargando reporte')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔍 Análisis de Mi Empresa</h1>
          <p className="text-muted-foreground">
            Analiza tu empresa automáticamente y descubre oportunidades de crecimiento
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreviewOnly} disabled={isAnalyzing}>
            👁️ Vista Previa
          </Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? '🔍 Analizando...' : '🚀 Analizar Mi Empresa'}
          </Button>
        </div>
      </div>

      {/* Input de URL */}
      <Card>
        <CardHeader>
          <CardTitle>📝 URL de mi empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">Sitio web de mi empresa</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://miempresa.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isAnalyzing}
              />
            </div>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analizando tu empresa...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">❌ {error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados del Análisis */}
      {analysis && (
        <div className="space-y-6">
          {/* Información de la Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>🏢 Mi Empresa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nombre</Label>
                  <p>{analysis.company.name}</p>
                </div>
                <div>
                  <Label className="font-semibold">Industria</Label>
                  <p>{analysis.company.industry}</p>
                </div>
                <div>
                  <Label className="font-semibold">Ubicación</Label>
                  <p>{analysis.company.location}</p>
                </div>
                <div>
                  <Label className="font-semibold">Tamaño</Label>
                  <p>{analysis.company.size}</p>
                </div>
              </div>
              
              <div>
                <Label className="font-semibold">Descripción</Label>
                <p className="text-muted-foreground">{analysis.company.description}</p>
              </div>

              <div>
                <Label className="font-semibold">Estado de mi sitio web</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  <Badge variant={analysis.company.website.ecommerce ? "default" : "secondary"}>
                    {analysis.company.website.ecommerce ? "✅ E-commerce" : "❌ Sin E-commerce"}
                  </Badge>
                  <Badge variant={analysis.company.website.blog ? "default" : "secondary"}>
                    {analysis.company.website.blog ? "✅ Blog" : "❌ Sin Blog"}
                  </Badge>
                  <Badge variant={analysis.company.website.contact_info ? "default" : "secondary"}>
                    {analysis.company.website.contact_info ? "✅ Contacto" : "❌ Sin Contacto"}
                  </Badge>
                  <Badge variant="outline">
                    SEO: {analysis.company.website.seo.score}/100
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de la Industria */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Mi Industria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="font-semibold">Tamaño del Mercado</Label>
                  <p>{analysis.industry.size}</p>
                </div>
                <div>
                  <Label className="font-semibold">Crecimiento</Label>
                  <p>{analysis.industry.growth}</p>
                </div>
                <div>
                  <Label className="font-semibold">Industria</Label>
                  <p>{analysis.industry.name}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Tendencias del mercado</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.industry.trends.map((trend, index) => (
                    <Badge key={index} variant="outline">{trend}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Desafíos del sector</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.industry.challenges.map((challenge, index) => (
                    <Badge key={index} variant="destructive">{challenge}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Competidores */}
          <Card>
            <CardHeader>
              <CardTitle>🥊 Mis Competidores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.competitors.map((competitor, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{competitor.name}</h4>
                      <Badge variant="outline">{competitor.market_share}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{competitor.url}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold text-sm">Sus Fortalezas</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competitor.strengths.map((strength, idx) => (
                            <Badge key={idx} variant="default" className="text-xs">✅ {strength}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">Sus Debilidades</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {competitor.weaknesses.map((weakness, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">❌ {weakness}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Oportunidades */}
          <Card>
            <CardHeader>
              <CardTitle>💡 Oportunidades para mi empresa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.opportunities.map((opportunity, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <Badge variant="outline">{opportunity.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{opportunity.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="font-semibold text-sm">Impacto</Label>
                        <Badge variant="default">{opportunity.impact}</Badge>
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">Esfuerzo</Label>
                        <Badge variant="secondary">{opportunity.effort}</Badge>
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">ROI Esperado</Label>
                        <Badge variant="outline">{opportunity.roi}</Badge>
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
              <CardTitle>🎯 Plan de Acción Personalizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.recommendations.map((recommendation, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{recommendation.title}</h4>
                      <div className="flex gap-2">
                        <Badge variant={recommendation.priority === 'Alta' ? 'destructive' : 'default'}>
                          {recommendation.priority}
                        </Badge>
                        <Badge variant="outline">{recommendation.category}</Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{recommendation.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div>
                        <Label className="font-semibold text-sm">Tiempo Estimado</Label>
                        <p className="text-sm">{recommendation.timeline}</p>
                      </div>
                      <div>
                        <Label className="font-semibold text-sm">Inversión Estimada</Label>
                        <p className="text-sm">{recommendation.cost}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold text-sm">Pasos a seguir</Label>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        {recommendation.actions.map((action, idx) => (
                          <li key={idx} className="text-sm">{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contexto Colombiano */}
          <Card>
            <CardHeader>
              <CardTitle>🇨🇴 Contexto Colombiano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Contexto Económico</Label>
                  <p className="text-sm">{analysis.colombia_context.economic_context}</p>
                </div>
                <div>
                  <Label className="font-semibold">Adopción Digital</Label>
                  <p className="text-sm">{analysis.colombia_context.digital_adoption}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Métodos de Pago Populares</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.colombia_context.payment_methods.map((method, index) => (
                    <Badge key={index} variant="outline">{method}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Tendencias Locales</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {analysis.colombia_context.local_trends.map((trend, index) => (
                    <Badge key={index} variant="default">{trend}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Próximos Pasos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button onClick={handleDownloadReport} variant="outline">
                  📄 Descargar Reporte
                </Button>
                <Button variant="outline">
                  🤖 Crear Agentes IA
                </Button>
                <Button variant="outline">
                  📊 Ver Dashboard Completo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview del Paywall */}
      {preview && !analysis && (
        <Card>
          <CardHeader>
            <CardTitle>👁️ Vista Previa del Análisis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="font-semibold">Mi Empresa</Label>
                <p>{preview.company_name}</p>
              </div>
              <div>
                <Label className="font-semibold">Industria</Label>
                <p>{preview.industry}</p>
              </div>
              <div>
                <Label className="font-semibold">Ubicación</Label>
                <p>{preview.location}</p>
              </div>
            </div>

            <div>
              <Label className="font-semibold">Resumen del análisis</Label>
              <p className="text-muted-foreground">{preview.summary}</p>
            </div>

            <div>
              <Label className="font-semibold">Lo que descubrimos</Label>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {preview.highlights.map((highlight, index) => (
                  <li key={index} className="text-sm">{highlight}</li>
                ))}
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleAnalyze} variant="outline">
                🔍 Ver Análisis Completo
              </Button>
              <Button variant="outline">
                💳 Ir al Paywall
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 