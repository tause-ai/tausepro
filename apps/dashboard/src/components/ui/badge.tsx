import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        
        // Variantes específicas para planes TausePro
        gratis: "border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200",
        starter: "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200",
        growth: "border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200",
        scale: "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
        
        // Variantes para estados
        success: "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/80",
        
        // Variante Colombia
        colombia: "border-transparent bg-gradient-to-r from-colombia-yellow to-colombia-blue text-white shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Componente especializado para planes
interface PlanBadgeProps extends Omit<BadgeProps, 'variant'> {
  plan: 'gratis' | 'starter' | 'growth' | 'scale'
  showIcon?: boolean
}

function PlanBadge({ plan, showIcon = false, className, children, ...props }: PlanBadgeProps) {
  const planLabels = {
    gratis: 'Gratis',
    starter: 'Starter', 
    growth: 'Growth',
    scale: 'Scale'
  }
  
  const planIcons = {
    gratis: '🆓',
    starter: '🚀',
    growth: '📈',
    scale: '💎'
  }
  
  return (
    <Badge 
      variant={plan} 
      className={cn("font-medium", className)} 
      {...props}
    >
      {showIcon && <span className="mr-1">{planIcons[plan]}</span>}
      {children || planLabels[plan]}
    </Badge>
  )
}

// Componente para estado de límites del paywall
interface UsageBadgeProps extends Omit<BadgeProps, 'variant'> {
  percentage: number
  showPercentage?: boolean
}

function UsageBadge({ percentage, showPercentage = true, className, children, ...props }: UsageBadgeProps) {
  const getVariant = (percentage: number) => {
    if (percentage >= 90) return 'destructive'
    if (percentage >= 75) return 'warning'
    if (percentage >= 50) return 'info'
    return 'success'
  }
  
  const getLabel = (percentage: number) => {
    if (percentage >= 100) return 'Límite excedido'
    if (percentage >= 90) return 'Casi agotado'
    if (percentage >= 75) return 'Alto uso'
    if (percentage >= 50) return 'Uso moderado'
    return 'Uso bajo'
  }
  
  return (
    <Badge 
      variant={getVariant(percentage)} 
      className={cn("font-medium", className)} 
      {...props}
    >
      {children || (showPercentage ? `${percentage.toFixed(1)}%` : getLabel(percentage))}
    </Badge>
  )
}

// Componente para estado de agentes MCP
interface AgentStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'error' | 'training'
}

function AgentStatusBadge({ status, className, children, ...props }: AgentStatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Activo', icon: '●' },
    inactive: { variant: 'secondary' as const, label: 'Inactivo', icon: '○' },
    error: { variant: 'destructive' as const, label: 'Error', icon: '✕' },
    training: { variant: 'warning' as const, label: 'Entrenando', icon: '⏳' }
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn("font-medium", className)} 
      {...props}
    >
      <span className="mr-1">{config.icon}</span>
      {children || config.label}
    </Badge>
  )
}

export { Badge, badgeVariants, PlanBadge, UsageBadge, AgentStatusBadge } 