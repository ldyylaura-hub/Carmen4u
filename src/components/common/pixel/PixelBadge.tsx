import React from 'react'
import { cn } from '@/utils'

type PixelBadgeVariant = 'neutral' | 'pink' | 'blue' | 'warn'

export default function PixelBadge({
  variant = 'neutral',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: PixelBadgeVariant }) {
  const tone =
    variant === 'pink'
      ? 'bg-[color:var(--k-pink)] text-white'
      : variant === 'blue'
        ? 'bg-[color:var(--k-blue)] text-[color:var(--k-ink)]'
        : variant === 'warn'
          ? 'bg-[color:var(--k-warn)] text-white'
          : 'bg-white text-[color:var(--k-ink)]'

  return (
    <span
      className={cn('pixel-badge text-[11px] uppercase', tone, className)}
      {...props}
    />
  )
}

