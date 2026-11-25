import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--brand-secondary)] text-[var(--brand-dark)] hover:brightness-105 shadow-sm',
        dark:
          'bg-[var(--brand-primary)] text-white hover:bg-slate-800 shadow-sm',
        outline:
          'border border-slate-300 bg-transparent text-slate-900 hover:bg-slate-100',
        outlineLight:
          'border border-white/35 bg-white/5 text-white backdrop-blur-sm hover:bg-white/15 hover:border-white/60',
        ghost:
          'bg-transparent text-slate-700 hover:bg-slate-100',
        danger:
          'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs rounded-[var(--brand-radius)]',
        md: 'h-11 px-5 rounded-[var(--brand-radius)]',
        lg: 'h-12 px-7 text-base rounded-[var(--brand-radius)]',
        icon: 'h-10 w-10 rounded-[var(--brand-radius)]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = 'Button';
