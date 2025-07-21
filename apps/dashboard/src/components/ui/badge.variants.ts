import { cva } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        // Variantes específicas para planes TausePro
        gratis: 'border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200',
        starter: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200',
        growth: 'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200',
        scale: 'border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
        // Variantes para estados
        success: 'border-transparent bg-green-500 text-white hover:bg-green-600',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
        info: 'border-transparent bg-sky-500 text-white hover:bg-sky-600',
        inactive: 'border-transparent bg-gray-400 text-white hover:bg-gray-500',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)
