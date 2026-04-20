import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:     'border-transparent bg-primary text-white',
        secondary:   'border-transparent bg-secondary text-text-primary',
        success:     'bg-success/10 text-success border-success/25',
        warning:     'bg-warning/10 text-warning border-warning/25',
        destructive: 'bg-danger/10 text-danger border-danger/25',
        outline:     'border-border text-text-primary',
        blue:        'bg-primary/10 text-primary border-primary/20',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColor =
    variant === 'success' ? 'bg-success' :
    variant === 'warning' ? 'bg-warning' :
    variant === 'destructive' ? 'bg-danger' :
    variant === 'blue' ? 'bg-primary' : 'bg-white'

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }