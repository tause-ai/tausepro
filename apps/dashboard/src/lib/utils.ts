import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS de manera segura con Tailwind CSS
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea moneda colombiana (COP) sin decimales
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formatea números con separadores de miles para Colombia
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-CO').format(num)
}

/**
 * Formatea porcentajes con estilo colombiano
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Formatea fechas para zona horaria de Colombia (UTC-5)
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }
  
  return new Intl.DateTimeFormat('es-CO', defaultOptions).format(dateObj)
}

/**
 * Formatea fechas cortas (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  return formatDate(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Formatea tiempo relativo en español
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`
  return `hace ${Math.floor(diffInSeconds / 31536000)} años`
}

/**
 * Valida NIT colombiano
 */
export function validateNIT(nit: string): boolean {
  // Remover puntos y guiones
  const cleanNIT = nit.replace(/[.-]/g, '')
  
  if (!/^\d{9,10}$/.test(cleanNIT)) return false
  
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
  const digits = cleanNIT.split('').map(Number)
  const checkDigit = digits.pop()!
  
  let sum = 0
  for (let i = 0; i < digits.length; i++) {
    sum += digits[digits.length - 1 - i] * weights[i]
  }
  
  const remainder = sum % 11
  const calculatedCheckDigit = remainder < 2 ? remainder : 11 - remainder
  
  return calculatedCheckDigit === checkDigit
}

/**
 * Formatea NIT colombiano (XXX.XXX.XXX-X)
 */
export function formatNIT(nit: string): string {
  const cleanNIT = nit.replace(/[.-]/g, '')
  if (cleanNIT.length < 9) return nit
  
  const digits = cleanNIT.slice(0, -1)
  const checkDigit = cleanNIT.slice(-1)
  
  // Agregar puntos cada 3 dígitos desde la derecha
  const formatted = digits.replace(/(\d)(?=(\d{3})+$)/g, '$1.')
  
  return `${formatted}-${checkDigit}`
}

/**
 * Valida cédula colombiana
 */
export function validateCC(cc: string): boolean {
  const cleanCC = cc.replace(/[.-]/g, '')
  return /^\d{6,10}$/.test(cleanCC)
}

/**
 * Formatea cédula colombiana (X.XXX.XXX)
 */
export function formatCC(cc: string): string {
  const cleanCC = cc.replace(/[.-]/g, '')
  return cleanCC.replace(/(\d)(?=(\d{3})+$)/g, '$1.')
}

/**
 * Formatea teléfono colombiano (+57 XXX XXX XXXX)
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '')
  
  if (cleanPhone.startsWith('57')) {
    const number = cleanPhone.slice(2)
    if (number.length === 10) {
      return `+57 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
    }
  }
  
  if (cleanPhone.length === 10) {
    return `+57 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`
  }
  
  return phone
}

/**
 * Genera ID único para agentes MCP
 */
export function generateAgentId(): string {
  return `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Calcula el plan del paywall basado en el uso
 */
export function calculatePlan(usage: { apiCalls: number; mcpAgents: number; whatsappMessages: number }): string {
  if (usage.apiCalls <= 100 && usage.mcpAgents <= 3 && usage.whatsappMessages <= 50) {
    return 'gratis'
  } else if (usage.apiCalls <= 5000 && usage.mcpAgents <= 10 && usage.whatsappMessages <= 1000) {
    return 'starter'
  } else if (usage.apiCalls <= 25000 && usage.mcpAgents <= 50 && usage.whatsappMessages <= 5000) {
    return 'growth'
  }
  return 'scale'
}

/**
 * Obtiene el color del plan para badges
 */
export function getPlanColor(plan: string): string {
  const colors = {
    gratis: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    growth: 'bg-purple-100 text-purple-800',
    scale: 'bg-yellow-100 text-yellow-800',
  }
  return colors[plan as keyof typeof colors] || colors.gratis
}

/**
 * Trunca texto y agrega puntos suspensivos
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Debounce para optimizar búsquedas
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Manejo seguro de errores para mostrar a PYMEs
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Ha ocurrido un error inesperado. Por favor intenta de nuevo.'
} 