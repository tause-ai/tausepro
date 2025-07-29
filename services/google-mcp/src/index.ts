import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { GoogleAuthService } from './auth/google-auth.js'
import { GmailService } from './services/gmail-service.js'
import { CalendarService } from './services/calendar-service.js'
import type { 
  GoogleAuthConfig, 
  GoogleToken, 
  GoogleUser
} from './types/index.js'

class GoogleMCPServer {
  private server: Server
  private authService: GoogleAuthService
  private gmailService?: GmailService
  private calendarService?: CalendarService
  private currentUser?: GoogleUser

  constructor() {
    this.server = new Server(
      {
        name: 'google-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: [
            'gmail_read_messages',
            'gmail_analyze_email',
            'gmail_search_emails',
            'calendar_read_events',
            'calendar_create_event',
            'calendar_analyze_event',
            'google_auth_url',
            'google_exchange_token'
          ],
          resources: [
            'gmail_messages',
            'calendar_events',
            'google_user_info'
          ]
        }
      },
      {
        transport: new StdioServerTransport()
      }
    )

    // Configurar autenticación de Google
    const config: GoogleAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      scopes: (process.env.GOOGLE_SCOPES || '').split(',')
    }

    this.authService = new GoogleAuthService(config)
    this.setupHandlers()
  }

  private setupHandlers() {
    // Handler para obtener URL de autenticación
    this.server.setRequestHandler('google_auth_url', async (params) => {
      try {
        const state = (params as any).state || 'default'
        const authUrl = this.authService.generateAuthUrl(state)
        
        return {
          authUrl,
          message: 'URL de autenticación generada exitosamente'
        }
      } catch (error) {
        console.error('Error generating auth URL:', error)
        throw new Error('Failed to generate authentication URL')
      }
    })

    // Handler para intercambiar código por tokens
    this.server.setRequestHandler('google_exchange_token', async (params) => {
      try {
        const code = (params as any).code
        if (!code) {
          throw new Error('Authorization code is required')
        }

        const tokens = await this.authService.exchangeCodeForTokens(code)
        const user = await this.authService.getUserInfo(tokens.access_token)
        
        this.currentUser = user
        this.setupServices(tokens)

        return {
          tokens,
          user,
          message: 'Autenticación exitosa'
        }
      } catch (error) {
        console.error('Error exchanging token:', error)
        throw new Error('Failed to exchange authorization code')
      }
    })

    // Handler para leer mensajes de Gmail
    this.server.setRequestHandler('gmail_read_messages', async (params) => {
      try {
        if (!this.gmailService) {
          throw new Error('Gmail service not initialized. Please authenticate first.')
        }

        const query = (params as any).query || ''
        const maxResults = (params as any).maxResults || 10
        const messages = await this.gmailService.getMessages(query, maxResults)

        return {
          messages,
          count: messages.length,
          message: 'Mensajes de Gmail obtenidos exitosamente'
        }
      } catch (error) {
        console.error('Error reading Gmail messages:', error)
        throw new Error('Failed to read Gmail messages')
      }
    })

    // Handler para analizar email
    this.server.setRequestHandler('gmail_analyze_email', async (params) => {
      try {
        if (!this.gmailService) {
          throw new Error('Gmail service not initialized. Please authenticate first.')
        }

        const messageId = (params as any).messageId
        if (!messageId) {
          throw new Error('Message ID is required')
        }

        const analysis = await this.gmailService.analyzeEmail(messageId)

        if (!analysis) {
          throw new Error('Failed to analyze email')
        }

        return {
          analysis,
          message: 'Análisis de email completado'
        }
      } catch (error) {
        console.error('Error analyzing email:', error)
        throw new Error('Failed to analyze email')
      }
    })

    // Handler para buscar emails
    this.server.setRequestHandler('gmail_search_emails', async (params) => {
      try {
        if (!this.gmailService) {
          throw new Error('Gmail service not initialized. Please authenticate first.')
        }

        const query = (params as any).query
        const maxResults = (params as any).maxResults || 10

        if (!query) {
          throw new Error('Search query is required')
        }

        const messages = await this.gmailService.searchEmails(query, maxResults)

        return {
          messages,
          count: messages.length,
          query,
          message: 'Búsqueda de emails completada'
        }
      } catch (error) {
        console.error('Error searching emails:', error)
        throw new Error('Failed to search emails')
      }
    })

    // Handler para leer eventos del calendario
    this.server.setRequestHandler('calendar_read_events', async (params) => {
      try {
        if (!this.calendarService) {
          throw new Error('Calendar service not initialized. Please authenticate first.')
        }

        const calendarId = (params as any).calendarId || 'primary'
        const timeMin = (params as any).timeMin
        const timeMax = (params as any).timeMax
        const maxResults = (params as any).maxResults || 10

        const events = await this.calendarService.getEvents(
          calendarId,
          timeMin,
          timeMax,
          maxResults
        )

        return {
          events,
          count: events.length,
          message: 'Eventos del calendario obtenidos exitosamente'
        }
      } catch (error) {
        console.error('Error reading calendar events:', error)
        throw new Error('Failed to read calendar events')
      }
    })

    // Handler para crear evento en calendario
    this.server.setRequestHandler('calendar_create_event', async (params) => {
      try {
        if (!this.calendarService) {
          throw new Error('Calendar service not initialized. Please authenticate first.')
        }

        const calendarId = (params as any).calendarId || 'primary'
        const event = (params as any).event

        if (!event) {
          throw new Error('Event data is required')
        }

        const createdEvent = await this.calendarService.createEvent(calendarId, event)

        return {
          event: createdEvent,
          message: 'Evento creado exitosamente'
        }
      } catch (error) {
        console.error('Error creating calendar event:', error)
        throw new Error('Failed to create calendar event')
      }
    })

    // Handler para analizar evento del calendario
    this.server.setRequestHandler('calendar_analyze_event', async (params) => {
      try {
        if (!this.calendarService) {
          throw new Error('Calendar service not initialized. Please authenticate first.')
        }

        const eventId = (params as any).eventId
        const calendarId = (params as any).calendarId || 'primary'

        if (!eventId) {
          throw new Error('Event ID is required')
        }

        const insight = await this.calendarService.analyzeEvent(eventId, calendarId)

        if (!insight) {
          throw new Error('Failed to analyze calendar event')
        }

        return {
          insight,
          message: 'Análisis de evento completado'
        }
      } catch (error) {
        console.error('Error analyzing calendar event:', error)
        throw new Error('Failed to analyze calendar event')
      }
    })
  }

  private setupServices(tokens: GoogleToken) {
    const oauth2Client = this.authService.getOAuth2Client()
    this.authService.setCredentials(tokens)
    
    this.gmailService = new GmailService(oauth2Client)
    this.calendarService = new CalendarService(oauth2Client)
  }

  async start() {
    console.log('🚀 Iniciando Google MCP Server...')
    await this.server.connect()
    console.log('✅ Google MCP Server iniciado correctamente')
  }
}

// Iniciar el servidor
const server = new GoogleMCPServer()
server.start().catch(console.error) 