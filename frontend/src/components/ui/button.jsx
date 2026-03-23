import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0d17] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-violet-600 to-violet-500 text-white shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-violet-400 hover:shadow-violet-500/40',
        secondary:
          'bg-white/[0.07] border border-white/[0.1] text-slate-300 hover:bg-white/[0.12] hover:text-white hover:border-white/20',
        ghost:
          'text-slate-400 hover:bg-white/[0.06] hover:text-white',
        danger:
          'bg-red-600/20 border border-red-500/30 text-red-400 hover:bg-red-600/30 hover:text-red-300',
        outline:
          'border border-white/[0.1] bg-transparent text-slate-300 hover:bg-white/[0.06] hover:text-white',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-8',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size:    'default',
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, ...props }, ref) => (
  <button
    className={cn(buttonVariants({ variant, size }), className)}
    ref={ref}
    {...props}
  />
));
Button.displayName = 'Button';

export { Button, buttonVariants };