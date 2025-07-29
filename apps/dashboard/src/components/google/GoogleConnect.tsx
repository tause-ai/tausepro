import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { AlertCircle, CheckCircle, Mail, Calendar, FileText, ExternalLink } from 'lucide-react'

interface GoogleConnection {
  isConnected: boolean
  email?: string
  name?: string
  picture?: string
  services: {
    gmail: boolean
    calendar: boolean
    drive: boolean
  }
}

export function GoogleConnect() {
  const [connection, setConnection] = useState<GoogleConnection>({
    isConnected: false,
    services: {
      gmail: false,
      calendar: false,
      drive: false
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      // Obtener URL de autenticación del servidor Google MCP
      const response = await fetch('http://localhost:3003/auth/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ state: 'tausepro' })
      })

      const data = await response.json()

      if (data.success) {
        // Redirigir a Google OAuth
        window.location.href = data.authUrl
      } else {
        setError('Error al generar URL de autenticación')
      }
    } catch (err) {
      console.error('Error connecting to Google:', err)
      setError('Error de conexión con Google MCP')
    } finally {
      setLoading(false)
    }
  }

  const disconnectGoogle = async () => {
    setLoading(true)
    setError(null)

    try {
      // Aquí implementaríamos la desconexión
      setConnection({
        isConnected: false,
        services: {
          gmail: false,
          calendar: false,
          drive: false
        }
      })
    } catch (err) {
      console.error('Error disconnecting from Google:', err)
      setError('Error al desconectar de Google')
    } finally {
      setLoading(false)
    }
  }

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:3003/stats')
      const data = await response.json()

      if (data.success && data.stats.user) {
        setConnection({
          isConnected: true,
          email: data.stats.user.email,
          name: data.stats.user.name,
          picture: data.stats.user.picture,
          services: {
            gmail: !!data.stats.gmail,
            calendar: !!data.stats.calendar,
            drive: false // Por ahora no implementamos Drive
          }
        })
      }
    } catch (err) {
      console.error('Error checking connection:', err)
    }
  }

  // Verificar conexión al cargar
  React.useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://developers.google.com/identity/images/g-logo.png" 
            alt="Google" 
            className="w-6 h-6"
          />
          Conexión Google
        </CardTitle>
        <CardDescription>
          Conecta tu cuenta de Google para acceder a Gmail, Calendar y Drive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {connection.isConnected ? (
          <div className="space-y-4">
            {/* Información del usuario */}
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="font-medium text-green-800">{connection.name}</p>
                <p className="text-sm text-green-600">{connection.email}</p>
              </div>
            </div>

            {/* Servicios conectados */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Servicios conectados:</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant={connection.services.gmail ? "default" : "secondary"} className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Gmail
                </Badge>
                <Badge variant={connection.services.calendar ? "default" : "secondary"} className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Calendar
                </Badge>
                <Badge variant={connection.services.drive ? "default" : "secondary"} className="flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Drive
                </Badge>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('http://localhost:3003/stats', '_blank')}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                Ver estadísticas
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={disconnectGoogle}
                disabled={loading}
              >
                {loading ? 'Desconectando...' : 'Desconectar'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Beneficios */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Beneficios de conectar Google:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <Mail className="w-3 h-3 text-blue-500" />
                  Análisis automático de emails
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 text-green-500" />
                  Gestión inteligente de calendario
                </li>
                <li className="flex items-center gap-2">
                  <FileText className="w-3 h-3 text-purple-500" />
                  Acceso a documentos de Drive
                </li>
              </ul>
            </div>

            {/* Botón de conexión */}
            <Button 
              onClick={connectGoogle}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Conectando...' : 'Conectar con Google'}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Al conectar, autorizas a TausePro a acceder a tu Gmail, Calendar y Drive
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 