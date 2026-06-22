import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          'pg-gradient-primary text-primary-foreground shadow-[0_2px_8px_rgba(10,77,191,0.25)] hover:shadow-[0_4px_16px_rgba(10,77,191,0.35)] hover:scale-[1.03]',
        cta:
          'pg-gradient-cta text-white shadow-[0_2px_8px_rgba(255,122,26,0.3)] hover:shadow-[0_4px_16px_rgba(255,122,26,0.4)] hover:scale-[1.03]',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        outline:
          'border border-border bg-background shadow-xs hover:border-[#1E88FF]/40 hover:bg-[#EEF5FF] hover:text-[#0A4DBF] dark:bg-input/30 dark:border-input',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#DDEAFF]',
        ghost:
          'hover:bg-[#EEF5FF] hover:text-[#0A4DBF] dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-5 py-2 has-[>svg]:px-4',
        sm: 'h-8 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3 text-xs',
        lg: 'h-12 rounded-xl px-8 has-[>svg]:px-6 text-base',
        icon: 'size-10 rounded-xl',
        'icon-sm': 'size-8 rounded-lg',
        'icon-lg': 'size-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
