import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-white hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-text-primary hover:bg-secondary/80',
        success:
          'border-transparent bg-success/10 text-success border-success/20',
        warning:
          'border-transparent bg-warning/10 text-yellow-700 border-warning/20',
        destructive:
          'border-transparent bg-danger/10 text-danger border-danger/20',
        outline:
          'border-border text-text-primary',
        blue:
          'border-transparent bg-primary-light text-primary border-primary/20',
      },
    },
    defaultVariants: {
      variant: 'default',
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

export { Badge, badgeVariants }
