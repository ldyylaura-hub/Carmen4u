import React from 'react'
import { cn } from '../../lib/utils'

export default function PixelWindow({
  title,
  left,
  right,
  children,
  className,
}: {
  title?: React.ReactNode
  left?: React.ReactNode
  right?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('pixel-window', className)}>
      {(title || left || right) && (
        <div className="pixel-titlebar px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-[color:var(--k-pink)] border-2 border-[color:var(--k-ink)]" />
            <span className="h-3 w-3 bg-[color:var(--k-blue)] border-2 border-[color:var(--k-ink)]" />
            <span className="h-3 w-3 bg-white border-2 border-[color:var(--k-ink)]" />
          </div>
          {left}
          <div className="flex-1 min-w-0">
            {title && <div className="dotgothic16-regular font-extrabold truncate">{title}</div>}
          </div>
          {right}
        </div>
      )}
      {children}
    </div>
  )
}

