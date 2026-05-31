import type { StudentStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: StudentStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const isActive = status === 'ATIVO'
  return (
    <span title={isActive ? 'Ativo' : 'Inativo'} className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
      isActive
        ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-green-500' : 'bg-slate-400')} />
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  )
}
