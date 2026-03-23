import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default:  'bg-violet-500/20 text-violet-300 border border-violet-500/30',
        success:  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
        warning:  'bg-amber-500/20 text-amber-300 border border-amber-500/30',
        danger:   'bg-red-500/20 text-red-400 border border-red-500/30',
        secondary:'bg-white/[0.07] text-slate-300 border border-white/10',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };