import React from 'react'
import { cn } from '@/utils'

export default function PixelChip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        'pixel-chip inline-flex items-center gap-1 text-xs dotgothic16-regular transition-colors',
        active ? 'bg-[color:var(--k-pink)] text-white' : 'text-[color:var(--k-ink)]',
        className,
      )}
      type="button"
      {...props}
    />
  )
}

