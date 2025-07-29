import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export function RegisterPage() {
  const { signUp, loading, error } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: ''
  })

  const [isFromPaywall, setIsFromPaywall] = useState(false)
  const [companyUrl, setCompanyUrl] = useState('')

  // Obtener parámetros de URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const redirect = urlParams.get('redirect')
    const companyUrlParam = urlParams.get('companyUrl')
    const source = urlParams.get('source')

    // Si viene del paywall, mostrar mensaje especial
    if (source === 'paywall' && companyUrlParam) {
      setIsFromPaywall(true)
      setCompanyUrl(companyUrlParam)
      console.log('Usuario viene del paywall para analizar:', companyUrlParam)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden')
      return
    }

    const result = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      company_name: formData.companyName
    })

    if (result.success) {
      alert('Usuario registrado exitosamente')
      
      // Verificar si viene del paywall
      const urlParams = new URLSearchParams(window.location.search)
      const redirect = urlParams.get('redirect')
      const companyUrl = urlParams.get('companyUrl')
      const source = urlParams.get('source')
      
      if (source === 'paywall' && redirect === 'analysis' && companyUrl) {
        // Redirigir a la página de análisis con la URL de la empresa
        window.location.href = `/analysis?companyUrl=${encodeURIComponent(companyUrl)}`
      } else {
        // Redirigir al dashboard por defecto
        window.location.href = '/dashboard'
      }
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
          <CardTitle>Registro - TausePro</CardTitle>
          <CardDescription>
            {isFromPaywall 
              ? `Crea tu cuenta gratuita para desbloquear el análisis completo de ${companyUrl}`
              : 'Crea tu cuenta para acceder a TausePro'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="companyName">Nombre de la empresa</Label>
              <Input
                id="companyName"
                name="companyName"
                type="text"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>

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
                minLength={6}
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
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
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/admin/login" className="text-blue-600 hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 