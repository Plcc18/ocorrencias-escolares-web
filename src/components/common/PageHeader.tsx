import React from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('h-16 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0', className)}>
      <div>
        <h2 className="text-base font-semibold text-sidebar-foreground leading-none">{title}</h2>
        {description && (
          <p className="text-sm text-sidebar-foreground/65 mt-0.5">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 [&_.bg-primary]:bg-sidebar-primary [&_.text-primary-foreground]:text-sidebar-primary-foreground [&_.border-border]:border-sidebar-border [&_.text-muted-foreground]:text-sidebar-foreground/75 [&_.hover\\:bg-muted:hover]:bg-sidebar-accent">
          {children}
        </div>
      )}
    </div>
  )
}
