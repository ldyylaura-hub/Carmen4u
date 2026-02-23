import React from 'react'
import { cn } from '../../lib/utils'

export default function PixelCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('pixel-card', className)} {...props} />
}

