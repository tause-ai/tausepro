import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store/auth'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { login } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      // El login exitoso redirigirá automáticamente al admin dashboard
    } catch (err) {
      setError('Credenciales inválidas. Verifica tu email y contraseña.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('superadmin@tause.pro')
    setPassword('admin123')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-primary-foreground">TP</span>
          </div>
          <CardTitle className="text-2xl">TausePro Admin</CardTitle>
          <p className="text-muted-foreground">
            Acceso al panel de Super Administrador
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="superadmin@tause.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Acceder al Admin'}
            </Button>

            <div className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleDemoLogin}
                className="text-xs"
              >
                Usar credenciales demo
              </Button>
            </div>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Credenciales Demo</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Email:</strong> superadmin@tause.pro</p>
              <p><strong>Contraseña:</strong> admin123</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Estas credenciales te darán acceso completo al panel de administración con datos demo.
            </p>
          </div>

          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/login')}
            >
              ← Volver al login de clientes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 