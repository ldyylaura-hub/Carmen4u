import React from 'react'
import { cn } from '@/utils'

export default function PixelTextarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('pixel-input w-full resize-none', className)} {...props} />
}

