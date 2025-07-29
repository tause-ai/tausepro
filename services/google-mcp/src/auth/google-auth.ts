import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import type { GoogleAuthConfig, GoogleToken, GoogleUser } from '../types/index.js'

export class GoogleAuthService {
  private oauth2Client: OAuth2Client
  private config: GoogleAuthConfig

  constructor(config: GoogleAuthConfig) {
    this.config = config
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
  }

  /**
   * Genera la URL de autorización de Google OAuth2
   */
  generateAuthUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      prompt: 'consent',
      state: state || 'default'
    })
  }

  /**
   * Intercambia el código de autorización por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleToken> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      return tokens as GoogleToken
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      throw new Error('Failed to exchange authorization code for tokens')
    }
  }

  /**
   * Refresca el token de acceso usando el refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleToken> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      })
      
      const { credentials } = await this.oauth2Client.refreshAccessToken()
      return credentials as GoogleToken
    } catch (error) {
      console.error('Error refreshing access token:', error)
      throw new Error('Failed to refresh access token')
    }
  }

  /**
   * Obtiene información del usuario de Google
   */
  async getUserInfo(accessToken: string): Promise<GoogleUser> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      })

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      const { data } = await oauth2.userinfo.get()

      return {
        id: data.id!,
        email: data.email!,
        name: data.name!,
        picture: data.picture,
        tenant_id: '00000000-0000-0000-0000-000000000000' // Por defecto
      }
    } catch (error) {
      console.error('Error getting user info:', error)
      throw new Error('Failed to get user information')
    }
  }

  /**
   * Verifica si un token es válido
   */
  async isTokenValid(accessToken: string): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({
        access_token: accessToken
      })

      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client })
      await oauth2.userinfo.get()
      return true
    } catch (error) {
      console.error('Token validation failed:', error)
      return false
    }
  }

  /**
   * Revoca un token de acceso
   */
  async revokeToken(accessToken: string): Promise<void> {
    try {
      await this.oauth2Client.revokeToken(accessToken)
    } catch (error) {
      console.error('Error revoking token:', error)
      throw new Error('Failed to revoke token')
    }
  }

  /**
   * Configura las credenciales del cliente OAuth2
   */
  setCredentials(tokens: GoogleToken): void {
    this.oauth2Client.setCredentials(tokens)
  }

  /**
   * Obtiene el cliente OAuth2 configurado
   */
  getOAuth2Client(): OAuth2Client {
    return this.oauth2Client
  }
} 