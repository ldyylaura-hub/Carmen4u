import React from 'react'
import { cn } from '@/utils'

type PixelButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'

export default function PixelButton({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: PixelButtonVariant
  size?: 'sm' | 'md' | 'lg'
}) {
  const base =
    'pixel-button inline-flex items-center justify-center gap-2 font-extrabold dotgothic16-regular disabled:opacity-50 disabled:pointer-events-none'

  const paddings =
    size === 'sm'
      ? 'px-3 py-2 text-sm'
      : size === 'lg'
        ? 'px-5 py-3 text-base'
        : 'px-4 py-2.5 text-sm'

  const tone =
    variant === 'primary'
      ? 'bg-[color:var(--k-pink)] text-white'
      : variant === 'danger'
        ? 'bg-[color:var(--k-warn)] text-white'
        : variant === 'ghost'
          ? 'bg-transparent text-[color:var(--k-ink)] shadow-none border-0'
          : 'bg-white text-[color:var(--k-ink)]'

  const hover =
    variant === 'ghost' ? 'hover:bg-black/5 rounded-md' : 'hover:brightness-[0.98]'

  return (
    <button className={cn(base, paddings, tone, hover, className)} {...props} />
  )
}

