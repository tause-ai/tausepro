import { useState } from 'react'
import { useAuth } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatPhone } from '@/lib/utils'

export default function LoginPage() {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-colombia-yellow/5 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-2xl font-bold text-primary-foreground">TP</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">TausePro</h1>
          <p className="text-muted-foreground">
            Plataforma MCP para PYMEs colombianas
          </p>
        </div>

        {/* Formulario de login */}
        <Card className="border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Accede a tu cuenta para gestionar tu PYME
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
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="tu@empresa.com.co"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                loading={isLoading}
                loadingText="Iniciando sesión..."
                disabled={!email || !password}
              >
                Ingresar
              </Button>
              
              {/* Demo credentials */}
              <div className="p-3 bg-muted/50 rounded-md text-sm">
                <p className="font-medium text-muted-foreground mb-1">Credenciales de demo:</p>
                <p className="text-xs text-muted-foreground">
                  Email: admin@example.com<br />
                  Contraseña: password
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <div className="text-center space-y-4">
          <div className="text-xs text-muted-foreground">
            <p>¿Necesitas ayuda? Contáctanos:</p>
            <p className="font-medium">{formatPhone('+573001234567')}</p>
            <p>soporte@tause.pro</p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
            <span className="w-3 h-2 colombia-flag-gradient rounded-sm"></span>
            <span>Hecho en Colombia para PYMEs colombianas</span>
          </div>
        </div>
      </div>
    </div>
  )
} 