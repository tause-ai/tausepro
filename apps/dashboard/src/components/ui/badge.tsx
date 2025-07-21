import * as React from 'react'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { badgeVariants } from './badge.variants'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Componente específico para planes
const planVariantMap = {
  gratis: 'gratis',
  starter: 'starter',
  growth: 'growth',
  scale: 'scale',
} as const

type PlanName = keyof typeof planVariantMap

interface PlanBadgeProps extends Omit<BadgeProps, 'variant'> {
  plan: PlanName
}

function PlanBadge({ plan, className, ...props }: PlanBadgeProps) {
  return (
    <Badge
      variant={planVariantMap[plan]}
      className={cn('capitalize', className)}
      {...props}
    >
      {plan}
    </Badge>
  )
}

// Componente específico para el estado de un agente
interface AgentStatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive';
}

function AgentStatusBadge({ status, className, ...props }: AgentStatusBadgeProps) {
  const variant = status === 'active' ? 'success' : 'inactive';
  const text = status === 'active' ? 'Activo' : 'Inactivo';

  return (
    <Badge
      variant={variant}
      className={cn('capitalize', className)}
      {...props}
    >
      {text}
    </Badge>
  );
}

export { Badge, PlanBadge, AgentStatusBadge }
