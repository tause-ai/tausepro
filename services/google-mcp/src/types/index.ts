// Tipos para el servidor MCP de Google

export interface GoogleAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleToken {
  access_token: string
  refresh_token?: string
  scope: string
  token_type: string
  expiry_date?: number
}

export interface GoogleUser {
  id: string
  email: string
  name: string
  picture?: string
  tenant_id: string
}

export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
    body?: {
      data?: string
    }
    parts?: Array<{
      mimeType: string
      body: {
        data?: string
      }
    }>
  }
  internalDate: string
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  location?: string
  htmlLink: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size?: string
  createdTime: string
  modifiedTime: string
  parents?: string[]
  webViewLink?: string
  webContentLink?: string
}

export interface MCPRequest {
  jsonrpc: string
  id: string | number
  method: string
  params?: any
}

export interface MCPResponse {
  jsonrpc: string
  id: string | number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

export interface GoogleMCPServer {
  name: string
  version: string
  capabilities: {
    tools: string[]
    resources: string[]
  }
}

export interface EmailAnalysis {
  messageId: string
  subject: string
  sender: string
  date: string
  content: string
  sentiment: 'positive' | 'negative' | 'neutral'
  categories: string[]
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

export interface CalendarInsight {
  eventId: string
  title: string
  date: string
  duration: number
  attendees: string[]
  conflicts: string[]
  suggestions: string[]
}

export interface DriveInsight {
  fileId: string
  fileName: string
  type: string
  size: number
  lastModified: string
  collaborators: string[]
  accessLevel: string
  suggestions: string[]
} 