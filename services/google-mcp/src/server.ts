import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleAuthService } from './auth/google-auth.js'
import { GmailService } from './services/gmail-service.js'
import { CalendarService } from './services/calendar-service.js'
import type { GoogleAuthConfig, GoogleToken, GoogleUser } from './types/index.js'

dotenv.config()

class GoogleMCPServer {
  private app: express.Application
  private authService: GoogleAuthService
  private gmailService?: GmailService
  private calendarService?: CalendarService
  private currentUser?: GoogleUser

  constructor() {
    this.app = express()
    
    // Configurar middleware
    this.app.use(cors())
    this.app.use(express.json())

    // Configurar autenticación de Google
    const config: GoogleAuthConfig = {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
      scopes: (process.env.GOOGLE_SCOPES || '').split(',')
    }

    this.authService = new GoogleAuthService(config)
    this.setupRoutes()
  }

  private setupRoutes() {
    // Ruta de salud
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'ok', 
        service: 'google-mcp',
        version: '1.0.0'
      })
    })

    // Obtener URL de autenticación
    this.app.post('/auth/url', (req, res) => {
      try {
        const { state } = req.body
        const authUrl = this.authService.generateAuthUrl(state)
        
        res.json({
          success: true,
          authUrl,
          message: 'URL de autenticación generada exitosamente'
        })
      } catch (error) {
        console.error('Error generating auth URL:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to generate authentication URL'
        })
      }
    })

    // Intercambiar código por tokens
    this.app.post('/auth/exchange', async (req, res) => {
      try {
        const { code } = req.body
        if (!code) {
          return res.status(400).json({
            success: false,
            error: 'Authorization code is required'
          })
        }

        const tokens = await this.authService.exchangeCodeForTokens(code)
        const user = await this.authService.getUserInfo(tokens.access_token)
        
        this.currentUser = user
        this.setupServices(tokens)

        res.json({
          success: true,
          tokens,
          user,
          message: 'Autenticación exitosa'
        })
      } catch (error) {
        console.error('Error exchanging token:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to exchange authorization code'
        })
      }
    })

    // Leer mensajes de Gmail
    this.app.get('/gmail/messages', async (req, res) => {
      try {
        if (!this.gmailService) {
          return res.status(401).json({
            success: false,
            error: 'Gmail service not initialized. Please authenticate first.'
          })
        }

        const { query = '', maxResults = 10 } = req.query
        const messages = await this.gmailService.getMessages(query as string, Number(maxResults))

        res.json({
          success: true,
          messages,
          count: messages.length,
          message: 'Mensajes de Gmail obtenidos exitosamente'
        })
      } catch (error) {
        console.error('Error reading Gmail messages:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to read Gmail messages'
        })
      }
    })

    // Analizar email
    this.app.post('/gmail/analyze', async (req, res) => {
      try {
        if (!this.gmailService) {
          return res.status(401).json({
            success: false,
            error: 'Gmail service not initialized. Please authenticate first.'
          })
        }

        const { messageId } = req.body
        if (!messageId) {
          return res.status(400).json({
            success: false,
            error: 'Message ID is required'
          })
        }

        const analysis = await this.gmailService.analyzeEmail(messageId)

        if (!analysis) {
          return res.status(404).json({
            success: false,
            error: 'Failed to analyze email'
          })
        }

        res.json({
          success: true,
          analysis,
          message: 'Análisis de email completado'
        })
      } catch (error) {
        console.error('Error analyzing email:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to analyze email'
        })
      }
    })

    // Buscar emails
    this.app.get('/gmail/search', async (req, res) => {
      try {
        if (!this.gmailService) {
          return res.status(401).json({
            success: false,
            error: 'Gmail service not initialized. Please authenticate first.'
          })
        }

        const { query, maxResults = 10 } = req.query
        if (!query) {
          return res.status(400).json({
            success: false,
            error: 'Search query is required'
          })
        }

        const messages = await this.gmailService.searchEmails(query as string, Number(maxResults))

        res.json({
          success: true,
          messages,
          count: messages.length,
          query,
          message: 'Búsqueda de emails completada'
        })
      } catch (error) {
        console.error('Error searching emails:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to search emails'
        })
      }
    })

    // Leer eventos del calendario
    this.app.get('/calendar/events', async (req, res) => {
      try {
        if (!this.calendarService) {
          return res.status(401).json({
            success: false,
            error: 'Calendar service not initialized. Please authenticate first.'
          })
        }

        const { calendarId = 'primary', timeMin, timeMax, maxResults = 10 } = req.query

        const events = await this.calendarService.getEvents(
          calendarId as string,
          timeMin as string,
          timeMax as string,
          Number(maxResults)
        )

        res.json({
          success: true,
          events,
          count: events.length,
          message: 'Eventos del calendario obtenidos exitosamente'
        })
      } catch (error) {
        console.error('Error reading calendar events:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to read calendar events'
        })
      }
    })

    // Crear evento en calendario
    this.app.post('/calendar/events', async (req, res) => {
      try {
        if (!this.calendarService) {
          return res.status(401).json({
            success: false,
            error: 'Calendar service not initialized. Please authenticate first.'
          })
        }

        const { calendarId = 'primary', event } = req.body
        if (!event) {
          return res.status(400).json({
            success: false,
            error: 'Event data is required'
          })
        }

        const createdEvent = await this.calendarService.createEvent(calendarId, event)

        res.json({
          success: true,
          event: createdEvent,
          message: 'Evento creado exitosamente'
        })
      } catch (error) {
        console.error('Error creating calendar event:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to create calendar event'
        })
      }
    })

    // Analizar evento del calendario
    this.app.post('/calendar/analyze', async (req, res) => {
      try {
        if (!this.calendarService) {
          return res.status(401).json({
            success: false,
            error: 'Calendar service not initialized. Please authenticate first.'
          })
        }

        const { eventId, calendarId = 'primary' } = req.body
        if (!eventId) {
          return res.status(400).json({
            success: false,
            error: 'Event ID is required'
          })
        }

        const insight = await this.calendarService.analyzeEvent(eventId, calendarId)

        if (!insight) {
          return res.status(404).json({
            success: false,
            error: 'Failed to analyze calendar event'
          })
        }

        res.json({
          success: true,
          insight,
          message: 'Análisis de evento completado'
        })
      } catch (error) {
        console.error('Error analyzing calendar event:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to analyze calendar event'
        })
      }
    })

    // Obtener estadísticas
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = {
          gmail: this.gmailService ? await this.gmailService.getEmailStats() : null,
          calendar: this.calendarService ? await this.calendarService.getCalendarStats() : null,
          user: this.currentUser
        }

        res.json({
          success: true,
          stats
        })
      } catch (error) {
        console.error('Error getting stats:', error)
        res.status(500).json({
          success: false,
          error: 'Failed to get statistics'
        })
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
    const port = process.env.PORT || 3003
    this.app.listen(port, () => {
      console.log(`🚀 Google MCP Server iniciado en puerto ${port}`)
      console.log(`📊 Health check: http://localhost:${port}/health`)
      console.log(`🔐 Auth URL: http://localhost:${port}/auth/url`)
      console.log(`📧 Gmail API: http://localhost:${port}/gmail/*`)
      console.log(`📅 Calendar API: http://localhost:${port}/calendar/*`)
    })
  }
}

// Iniciar el servidor
const server = new GoogleMCPServer()
server.start().catch(console.error) 