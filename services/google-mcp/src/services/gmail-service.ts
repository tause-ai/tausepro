import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import type { GmailMessage, EmailAnalysis } from '../types/index.js'

export class GmailService {
  private gmail: any

  constructor(oauth2Client: OAuth2Client) {
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client })
  }

  /**
   * Obtiene los mensajes de Gmail
   */
  async getMessages(query: string = '', maxResults: number = 10): Promise<GmailMessage[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      })

      const messages = response.data.messages || []
      const detailedMessages: GmailMessage[] = []

      for (const message of messages) {
        const detail = await this.getMessage(message.id)
        if (detail) {
          detailedMessages.push(detail)
        }
      }

      return detailedMessages
    } catch (error) {
      console.error('Error getting Gmail messages:', error)
      throw new Error('Failed to get Gmail messages')
    }
  }

  /**
   * Obtiene un mensaje específico de Gmail
   */
  async getMessage(messageId: string): Promise<GmailMessage | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      })

      return response.data as GmailMessage
    } catch (error) {
      console.error('Error getting Gmail message:', error)
      return null
    }
  }

  /**
   * Obtiene los mensajes no leídos
   */
  async getUnreadMessages(maxResults: number = 10): Promise<GmailMessage[]> {
    return this.getMessages('is:unread', maxResults)
  }

  /**
   * Obtiene mensajes de un remitente específico
   */
  async getMessagesFromSender(sender: string, maxResults: number = 10): Promise<GmailMessage[]> {
    return this.getMessages(`from:${sender}`, maxResults)
  }

  /**
   * Obtiene mensajes con una etiqueta específica
   */
  async getMessagesWithLabel(label: string, maxResults: number = 10): Promise<GmailMessage[]> {
    return this.getMessages(`label:${label}`, maxResults)
  }

  /**
   * Analiza el contenido de un email
   */
  async analyzeEmail(messageId: string): Promise<EmailAnalysis | null> {
    try {
      const message = await this.getMessage(messageId)
      if (!message) return null

      const headers = message.payload.headers
      const subject = headers.find(h => h.name === 'Subject')?.value || ''
      const sender = headers.find(h => h.name === 'From')?.value || ''
      const date = headers.find(h => h.name === 'Date')?.value || ''

      // Extraer contenido del email
      const content = this.extractEmailContent(message)

      // Análisis básico (en producción se usaría IA)
      const analysis: EmailAnalysis = {
        messageId,
        subject,
        sender,
        date,
        content,
        sentiment: this.analyzeSentiment(content),
        categories: this.categorizeEmail(subject, content),
        actionItems: this.extractActionItems(content),
        priority: this.determinePriority(subject, content)
      }

      return analysis
    } catch (error) {
      console.error('Error analyzing email:', error)
      return null
    }
  }

  /**
   * Extrae el contenido del email
   */
  private extractEmailContent(message: GmailMessage): string {
    try {
      if (message.payload.body?.data) {
        return Buffer.from(message.payload.body.data, 'base64').toString('utf-8')
      }

      if (message.payload.parts) {
        for (const part of message.payload.parts) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8')
          }
        }
      }

      return message.snippet || ''
    } catch (error) {
      console.error('Error extracting email content:', error)
      return message.snippet || ''
    }
  }

  /**
   * Analiza el sentimiento del email (básico)
   */
  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['gracias', 'excelente', 'bueno', 'perfecto', 'genial', 'feliz']
    const negativeWords = ['problema', 'error', 'malo', 'terrible', 'urgente', 'crítico']

    const lowerContent = content.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length

    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  /**
   * Categoriza el email
   */
  private categorizeEmail(subject: string, content: string): string[] {
    const categories: string[] = []
    const lowerSubject = subject.toLowerCase()
    const lowerContent = content.toLowerCase()

    if (lowerSubject.includes('factura') || lowerContent.includes('pago')) {
      categories.push('billing')
    }
    if (lowerSubject.includes('soporte') || lowerContent.includes('ayuda')) {
      categories.push('support')
    }
    if (lowerSubject.includes('venta') || lowerContent.includes('cliente')) {
      categories.push('sales')
    }
    if (lowerSubject.includes('reunión') || lowerContent.includes('cita')) {
      categories.push('meeting')
    }

    return categories.length > 0 ? categories : ['general']
  }

  /**
   * Extrae elementos de acción del email
   */
  private extractActionItems(content: string): string[] {
    const actionItems: string[] = []
    const actionPhrases = [
      'necesito que',
      'por favor',
      'requiero',
      'urgente',
      'responder',
      'llamar',
      'revisar'
    ]

    const lines = content.split('\n')
    for (const line of lines) {
      for (const phrase of actionPhrases) {
        if (line.toLowerCase().includes(phrase)) {
          actionItems.push(line.trim())
          break
        }
      }
    }

    return actionItems
  }

  /**
   * Determina la prioridad del email
   */
  private determinePriority(subject: string, content: string): 'high' | 'medium' | 'low' {
    const urgentWords = ['urgente', 'crítico', 'importante', 'inmediato']
    const lowerSubject = subject.toLowerCase()
    const lowerContent = content.toLowerCase()

    for (const word of urgentWords) {
      if (lowerSubject.includes(word) || lowerContent.includes(word)) {
        return 'high'
      }
    }

    if (subject.toLowerCase().includes('re:') || content.length > 500) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Busca emails por texto
   */
  async searchEmails(query: string, maxResults: number = 10): Promise<GmailMessage[]> {
    return this.getMessages(query, maxResults)
  }

  /**
   * Obtiene estadísticas de emails
   */
  async getEmailStats(): Promise<{
    total: number
    unread: number
    fromToday: number
    fromThisWeek: number
  }> {
    try {
      const [total, unread, today, thisWeek] = await Promise.all([
        this.getMessages('', 1),
        this.getMessages('is:unread', 1),
        this.getMessages('after:2024/01/01', 1),
        this.getMessages('after:2024/01/01', 1)
      ])

      return {
        total: total.length,
        unread: unread.length,
        fromToday: today.length,
        fromThisWeek: thisWeek.length
      }
    } catch (error) {
      console.error('Error getting email stats:', error)
      return {
        total: 0,
        unread: 0,
        fromToday: 0,
        fromThisWeek: 0
      }
    }
  }
} 