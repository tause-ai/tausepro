import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { 
  Mail, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Users,
  FileText
} from 'lucide-react'

interface EmailSuggestion {
  id: string
  type: 'urgent' | 'follow_up' | 'action_required'
  subject: string
  sender: string
  priority: 'high' | 'medium' | 'low'
  action: string
  category: string
}

interface CalendarSuggestion {
  id: string
  type: 'conflict' | 'optimization' | 'reminder'
  title: string
  date: string
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}

interface GoogleSuggestions {
  emails: EmailSuggestion[]
  calendar: CalendarSuggestion[]
  insights: string[]
}

export function GoogleSuggestions() {
  const [suggestions, setSuggestions] = useState<GoogleSuggestions>({
    emails: [],
    calendar: [],
    insights: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSuggestions = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener emails no leídos
      const emailsResponse = await fetch('http://localhost:3003/gmail/messages?query=is:unread&maxResults=5')
      const emailsData = await emailsResponse.json()

      // Obtener eventos de hoy
      const calendarResponse = await fetch('http://localhost:3003/calendar/events?timeMin=' + new Date().toISOString())
      const calendarData = await calendarResponse.json()

      if (emailsData.success && calendarData.success) {
        // Procesar emails para sugerencias
        const emailSuggestions: EmailSuggestion[] = emailsData.messages.slice(0, 3).map((email: any, index: number) => {
          const headers = email.payload?.headers || []
          const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Sin asunto'
          const sender = headers.find((h: any) => h.name === 'From')?.value || 'Desconocido'

          return {
            id: email.id,
            type: 'action_required',
            subject,
            sender,
            priority: 'medium',
            action: 'Revisar y responder',
            category: 'general'
          }
        })

        // Procesar eventos para sugerencias
        const calendarSuggestions: CalendarSuggestion[] = calendarData.events.slice(0, 3).map((event: any, index: number) => {
          return {
            id: event.id,
            type: 'reminder',
            title: event.summary,
            date: new Date(event.start.dateTime).toLocaleString('es-ES'),
            suggestion: 'Preparar para la reunión',
            priority: 'medium'
          }
        })

        setSuggestions({
          emails: emailSuggestions,
          calendar: calendarSuggestions,
          insights: [
            'Tienes 3 emails sin leer que requieren atención',
            '2 eventos programados para hoy',
            'Considera bloquear tiempo para revisar emails'
          ]
        })
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err)
      setError('Error al obtener sugerencias de Google')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'follow_up': return <Clock className="w-4 h-4 text-blue-500" />
      case 'action_required': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'conflict': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'optimization': return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'reminder': return <Clock className="w-4 h-4 text-blue-500" />
      default: return <Mail className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sugerencias de Google</h2>
          <p className="text-gray-600">Basado en tu Gmail y Calendar</p>
        </div>
        <Button 
          onClick={fetchSuggestions}
          disabled={loading}
          variant="outline"
          size="sm"
        >
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Insights */}
      {suggestions.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.insights.map((insight, index) => (
                <li key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Email Suggestions */}
      {suggestions.emails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Emails que requieren atención
            </CardTitle>
            <CardDescription>
              Emails no leídos que podrían necesitar respuesta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.emails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(email.type)}
                    <div>
                      <p className="font-medium text-sm">{email.subject}</p>
                      <p className="text-xs text-gray-500">{email.sender}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(email.priority)}>
                      {email.priority}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar Suggestions */}
      {suggestions.calendar.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Eventos de hoy
            </CardTitle>
            <CardDescription>
              Eventos programados y sugerencias de calendario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.calendar.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(event.type)}
                    <div>
                      <p className="font-medium text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(event.priority)}>
                      {event.priority}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {suggestions.emails.length === 0 && suggestions.calendar.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sugerencias</h3>
            <p className="text-gray-500">
              Conecta tu cuenta de Google para recibir sugerencias personalizadas
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 