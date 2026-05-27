import type { OccurrenceType } from '../types/occurrence'

export interface OccurrenceTypeInfo {
  label: string
  badgeClass: string
  dotClass: string
  emoji: string
}

export const OCCURRENCE_TYPE_MAP: Record<OccurrenceType, OccurrenceTypeInfo> = {
  DISCIPLINA: {
    label: 'Indisciplina',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
    dotClass: 'bg-orange-500',
    emoji: '⚡',
  },
  FALTA: {
    label: 'Falta',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
    dotClass: 'bg-red-500',
    emoji: '📵',
  },
  ELOGIO: {
    label: 'Elogio',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    dotClass: 'bg-green-500',
    emoji: '⭐',
  },
  ADVERTENCIA: {
    label: 'Advertência',
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
    dotClass: 'bg-yellow-500',
    emoji: '⚠️',
  },
  SUSPENSAO: {
    label: 'Suspensão',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    dotClass: 'bg-rose-500',
    emoji: '🚫',
  },
  ATRASO: {
    label: 'Atraso',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    dotClass: 'bg-blue-500',
    emoji: '🕐',
  },
  CELULAR: {
    label: 'Uso de celular',
    badgeClass: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    dotClass: 'bg-purple-500',
    emoji: '📱',
  },
  OUTRO: {
    label: 'Outro',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    dotClass: 'bg-slate-500',
    emoji: '📝',
  },
}

export const OCCURRENCE_TYPES = Object.entries(OCCURRENCE_TYPE_MAP).map(([value, info]) => ({
  value: value as OccurrenceType,
  ...info,
}))

// Shifts — sem acento, alinhados com enum GradeShift do backend
export const GRADE_SHIFTS = [
  { value: 'MANHA' as const, label: 'Manhã' },
  { value: 'TARDE' as const, label: 'Tarde' },
  { value: 'NOITE' as const, label: 'Noite' },
  { value: 'INTEGRAL' as const, label: 'Integral' },
]

export const STUDENT_SHIFTS = GRADE_SHIFTS