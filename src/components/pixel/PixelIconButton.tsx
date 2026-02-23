import React from 'react'
import { cn } from '../../lib/utils'

export default function PixelIconButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'pixel-button h-10 w-10 p-0 bg-white text-[color:var(--k-ink)] inline-flex items-center justify-center',
        className,
      )}
      type="button"
      {...props}
    />
  )
}

