export type OccurrenceType =
  | 'DISCIPLINA'
  | 'FALTA'
  | 'ELOGIO'
  | 'ADVERTENCIA'
  | 'SUSPENSAO'
  | 'ATRASO'
  | 'CELULAR'
  | 'OUTRO'

export interface Occurrence {
  id: number
  description: string
  occurrenceDate: string
  occurrenceType: OccurrenceType
  studentId: number
  studentName: string
  gradeId: number
  gradeName: string
  teacherId: number
  teacherName: string
  createdAt: string
  updatedAt: string
}

export interface OccurrenceDTO {
  description: string
  occurrenceDate: string
  occurrenceType: OccurrenceType
  studentId: number
  gradeId: number
}

export interface OccurrenceFilters {
  studentName?: string
  teacherId?: number
  gradeId?: number
  occurrenceType?: OccurrenceType | ''
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sort?: string
}
