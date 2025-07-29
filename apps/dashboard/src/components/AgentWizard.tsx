import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Zap,
  MessageSquare,
  Target,
  Users,
  Mail,
  Phone,
  Instagram,
  Facebook,
  Globe
} from 'lucide-react'

interface WizardStep {
  id: number
  title: string
  description: string
  component: React.ReactNode
}

interface AgentConfig {
  product: string
  contactChannels: string[]
  goal: string
  businessType: string
  targetAudience: string
}

const AgentWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<AgentConfig>({
    product: '',
    contactChannels: [],
    goal: '',
    businessType: '',
    targetAudience: ''
  })

  const businessTypes = [
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'services', name: 'Servicios', icon: '🔧' },
    { id: 'restaurant', name: 'Restaurante', icon: '🍽️' },
    { id: 'health', name: 'Salud', icon: '🏥' },
    { id: 'education', name: 'Educación', icon: '📚' },
    { id: 'real_estate', name: 'Inmobiliaria', icon: '🏠' }
  ]

  const contactChannels = [
    { id: 'whatsapp', name: 'WhatsApp', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-4 h-4" /> },
    { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-4 h-4" /> },
    { id: 'email', name: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'phone', name: 'Teléfono', icon: <Phone className="w-4 h-4" /> },
    { id: 'website', name: 'Sitio Web', icon: <Globe className="w-4 h-4" /> }
  ]

  const goals = [
    { id: 'leads', name: 'Captar Leads', description: 'Generar más prospectos calificados', icon: '🎯' },
    { id: 'sales', name: 'Vender Más', description: 'Aumentar conversiones y ventas', icon: '💰' },
    { id: 'automate', name: 'Automatizar', description: 'Reducir trabajo manual repetitivo', icon: '⚡' },
    { id: 'support', name: 'Mejorar Soporte', description: 'Atención al cliente 24/7', icon: '🤝' }
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleChannelToggle = (channelId: string) => {
    setConfig(prev => ({
      ...prev,
      contactChannels: prev.contactChannels.includes(channelId)
        ? prev.contactChannels.filter(id => id !== channelId)
        : [...prev.contactChannels, channelId]
    }))
  }

  const generateAgentConfig = () => {
    // Lógica para generar configuración del agente basada en las respuestas
    const agentType = config.goal === 'leads' ? 'sales' : 
                     config.goal === 'sales' ? 'sales' :
                     config.goal === 'automate' ? 'automation' : 'support'
    
    return {
      type: agentType,
      name: `${config.businessType} Agent`,
      config: {
        product: config.product,
        channels: config.contactChannels,
        goal: config.goal,
        businessType: config.businessType,
        targetAudience: config.targetAudience
      }
    }
  }

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "¿Qué vendes?",
      description: "Cuéntanos sobre tu producto o servicio",
      component: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="product" className="text-base font-medium">
              Describe tu producto o servicio
            </Label>
            <Input
              id="product"
              placeholder="Ej: Ropa deportiva, Consultoría digital, Comida rápida..."
              value={config.product}
              onChange={(e) => setConfig(prev => ({ ...prev, product: e.target.value }))}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">
              Tipo de negocio
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {businessTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    config.businessType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, businessType: type.id }))}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="font-medium text-sm">{type.name}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="audience" className="text-base font-medium">
              ¿Quién es tu público objetivo?
            </Label>
            <Input
              id="audience"
              placeholder="Ej: Jóvenes 18-35, Empresarios, Familias..."
              value={config.targetAudience}
              onChange={(e) => setConfig(prev => ({ ...prev, targetAudience: e.target.value }))}
              className="mt-2"
            />
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "¿Por dónde te contactan?",
      description: "Selecciona los canales donde quieres automatizar",
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Canales de contacto
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {contactChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    config.contactChannels.includes(channel.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleChannelToggle(channel.id)}
                >
                  <div className="flex items-center space-x-3">
                    {channel.icon}
                    <div>
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-gray-500">
                        {config.contactChannels.includes(channel.id) ? 'Seleccionado' : 'Click para seleccionar'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config.contactChannels.length > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">
                  {config.contactChannels.length} canal(es) seleccionado(s)
                </span>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      id: 3,
      title: "¿Cuál es tu meta?",
      description: "Define el objetivo principal del agente",
      component: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Objetivo principal
            </Label>
            <div className="grid grid-cols-1 gap-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    config.goal === goal.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, goal: goal.id }))}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{goal.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium">{goal.name}</div>
                      <div className="text-sm text-gray-600">{goal.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {config.goal && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  Agente optimizado para: {goals.find(g => g.id === config.goal)?.name}
                </span>
              </div>
            </div>
          )}
        </div>
      )
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)!

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Configurar Agente</CardTitle>
              <CardDescription>
                {currentStepData.description}
              </CardDescription>
            </div>
            <div className="flex space-x-1">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full ${
                    step.id === currentStep
                      ? 'bg-blue-600'
                      : step.id < currentStep
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Contenido del paso actual */}
            {currentStepData.component}

            {/* Navegación */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>

              {currentStep === 3 ? (
                <Button
                  onClick={() => {
                    const agentConfig = generateAgentConfig()
                    console.log('Configuración del agente:', agentConfig)
                    // Aquí se enviaría la configuración al backend
                    alert('¡Agente configurado exitosamente!')
                  }}
                  className="flex items-center bg-green-600 hover:bg-green-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Crear Agente
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={
                    (currentStep === 1 && (!config.product || !config.businessType || !config.targetAudience)) ||
                    (currentStep === 2 && config.contactChannels.length === 0) ||
                    (currentStep === 3 && !config.goal)
                  }
                  className="flex items-center"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AgentWizard 