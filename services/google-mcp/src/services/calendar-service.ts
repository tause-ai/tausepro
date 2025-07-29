import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import type { CalendarEvent, CalendarInsight } from '../types/index.js'

export class CalendarService {
  private calendar: any

  constructor(oauth2Client: OAuth2Client) {
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client })
  }

  /**
   * Obtiene los calendarios del usuario
   */
  async getCalendars(): Promise<any[]> {
    try {
      const response = await this.calendar.calendarList.list()
      return response.data.items || []
    } catch (error) {
      console.error('Error getting calendars:', error)
      throw new Error('Failed to get calendars')
    }
  }

  /**
   * Obtiene eventos de un calendario
   */
  async getEvents(
    calendarId: string = 'primary',
    timeMin?: string,
    timeMax?: string,
    maxResults: number = 10
  ): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId,
        timeMin: timeMin || new Date().toISOString(),
        timeMax,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error getting calendar events:', error)
      throw new Error('Failed to get calendar events')
    }
  }

  /**
   * Obtiene eventos de hoy
   */
  async getTodayEvents(calendarId: string = 'primary'): Promise<CalendarEvent[]> {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return this.getEvents(
      calendarId,
      today.toISOString(),
      tomorrow.toISOString()
    )
  }

  /**
   * Obtiene eventos de esta semana
   */
  async getThisWeekEvents(calendarId: string = 'primary'): Promise<CalendarEvent[]> {
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)

    return this.getEvents(
      calendarId,
      today.toISOString(),
      nextWeek.toISOString()
    )
  }

  /**
   * Crea un nuevo evento
   */
  async createEvent(
    calendarId: string = 'primary',
    event: {
      summary: string
      description?: string
      start: { dateTime: string; timeZone: string }
      end: { dateTime: string; timeZone: string }
      attendees?: Array<{ email: string }>
      location?: string
    }
  ): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event
      })

      return response.data as CalendarEvent
    } catch (error) {
      console.error('Error creating calendar event:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  /**
   * Actualiza un evento existente
   */
  async updateEvent(
    calendarId: string = 'primary',
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.update({
        calendarId,
        eventId,
        requestBody: updates
      })

      return response.data as CalendarEvent
    } catch (error) {
      console.error('Error updating calendar event:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  /**
   * Elimina un evento
   */
  async deleteEvent(calendarId: string = 'primary', eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId,
        eventId
      })
    } catch (error) {
      console.error('Error deleting calendar event:', error)
      throw new Error('Failed to delete calendar event')
    }
  }

  /**
   * Analiza un evento del calendario
   */
  async analyzeEvent(eventId: string, calendarId: string = 'primary'): Promise<CalendarInsight | null> {
    try {
      const response = await this.calendar.events.get({
        calendarId,
        eventId
      })

      const event = response.data as CalendarEvent
      if (!event) return null

      // Calcular duración
      const start = new Date(event.start.dateTime)
      const end = new Date(event.end.dateTime)
      const duration = (end.getTime() - start.getTime()) / (1000 * 60) // en minutos

      // Buscar conflictos
      const conflicts = await this.findConflicts(event)

      // Generar sugerencias
      const suggestions = this.generateSuggestions(event, conflicts)

      const insight: CalendarInsight = {
        eventId: event.id,
        title: event.summary,
        date: event.start.dateTime,
        duration,
        attendees: event.attendees?.map(a => a.email) || [],
        conflicts,
        suggestions
      }

      return insight
    } catch (error) {
      console.error('Error analyzing calendar event:', error)
      return null
    }
  }

  /**
   * Busca conflictos de horario
   */
  private async findConflicts(event: CalendarEvent): Promise<string[]> {
    try {
      const start = new Date(event.start.dateTime)
      const end = new Date(event.end.dateTime)

      // Buscar eventos que se solapan
      const overlappingEvents = await this.getEvents(
        'primary',
        start.toISOString(),
        end.toISOString()
      )

      return overlappingEvents
        .filter(e => e.id !== event.id)
        .map(e => e.summary)
    } catch (error) {
      console.error('Error finding conflicts:', error)
      return []
    }
  }

  /**
   * Genera sugerencias para el evento
   */
  private generateSuggestions(event: CalendarEvent, conflicts: string[]): string[] {
    const suggestions: string[] = []

    // Sugerencias basadas en conflictos
    if (conflicts.length > 0) {
      suggestions.push('Considera reprogramar para evitar conflictos')
      suggestions.push('Revisa si todos los conflictos son necesarios')
    }

    // Sugerencias basadas en duración
    const start = new Date(event.start.dateTime)
    const end = new Date(event.end.dateTime)
    const duration = (end.getTime() - start.getTime()) / (1000 * 60)

    if (duration > 120) {
      suggestions.push('Evento largo - considera dividirlo en sesiones más cortas')
    }

    if (duration < 30) {
      suggestions.push('Evento corto - asegúrate de tener agenda clara')
    }

    // Sugerencias basadas en asistentes
    if (event.attendees && event.attendees.length > 5) {
      suggestions.push('Muchos asistentes - considera enviar agenda previa')
    }

    // Sugerencias basadas en hora
    const hour = start.getHours()
    if (hour < 9 || hour > 17) {
      suggestions.push('Evento fuera de horario laboral - confirma disponibilidad')
    }

    return suggestions
  }

  /**
   * Obtiene estadísticas del calendario
   */
  async getCalendarStats(): Promise<{
    totalEvents: number
    eventsToday: number
    eventsThisWeek: number
    averageDuration: number
    mostActiveDay: string
  }> {
    try {
      const [todayEvents, weekEvents, allEvents] = await Promise.all([
        this.getTodayEvents(),
        this.getThisWeekEvents(),
        this.getEvents('primary', undefined, undefined, 100)
      ])

      // Calcular duración promedio
      const totalDuration = allEvents.reduce((sum, event) => {
        const start = new Date(event.start.dateTime)
        const end = new Date(event.end.dateTime)
        return sum + (end.getTime() - start.getTime()) / (1000 * 60)
      }, 0)

      const averageDuration = allEvents.length > 0 ? totalDuration / allEvents.length : 0

      // Encontrar día más activo
      const dayCounts: Record<string, number> = {}
      allEvents.forEach(event => {
        const day = new Date(event.start.dateTime).toLocaleDateString('es-ES', { weekday: 'long' })
        dayCounts[day] = (dayCounts[day] || 0) + 1
      })

      const mostActiveDay = Object.entries(dayCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'

      return {
        totalEvents: allEvents.length,
        eventsToday: todayEvents.length,
        eventsThisWeek: weekEvents.length,
        averageDuration,
        mostActiveDay
      }
    } catch (error) {
      console.error('Error getting calendar stats:', error)
      return {
        totalEvents: 0,
        eventsToday: 0,
        eventsThisWeek: 0,
        averageDuration: 0,
        mostActiveDay: 'N/A'
      }
    }
  }

  /**
   * Busca eventos por texto
   */
  async searchEvents(query: string, maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        q: query,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime'
      })

      return response.data.items || []
    } catch (error) {
      console.error('Error searching calendar events:', error)
      throw new Error('Failed to search calendar events')
    }
  }
} 