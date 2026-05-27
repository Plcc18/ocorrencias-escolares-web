import { OCCURRENCE_TYPE_MAP } from '@/utils/occurrenceTypes'
import type { OccurrenceType } from '@/types'
import { cn } from '@/lib/utils'

interface OccurrenceBadgeProps {
  type: OccurrenceType
  showEmoji?: boolean
  className?: string
}

export function OccurrenceBadge({ type, showEmoji = true, className }: OccurrenceBadgeProps) {
  const info = OCCURRENCE_TYPE_MAP[type] ?? OCCURRENCE_TYPE_MAP.OUTRO
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      info.badgeClass,
      className
    )}>
      {showEmoji && <span>{info.emoji}</span>}
      {info.label}
    </span>
  )
}
