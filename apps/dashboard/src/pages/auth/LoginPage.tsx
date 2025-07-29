import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function LoginPage() {
  const { signIn, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await signIn(formData.email, formData.password)

    if (result.success) {
      alert('Inicio de sesión exitoso')
      // Redirigir según el tipo de usuario
      // Por ahora, todos van al dashboard del cliente
      window.location.href = '/'
    } else {
      alert(`Error: ${result.error}`)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión - TausePro</CardTitle>
          <CardDescription>
            Accede a tu cuenta de TausePro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/admin/register" className="text-blue-600 hover:underline">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 