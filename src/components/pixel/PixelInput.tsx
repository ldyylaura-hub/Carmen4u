import React from 'react'
import { cn } from '../../lib/utils'

export default function PixelInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('pixel-input w-full', className)} {...props} />
}

