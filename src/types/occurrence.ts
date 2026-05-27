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
  teacherId: number
  teacherName: string
  gradeId: number
  gradeName: string
  createdAt: string
  updatedAt: string
}

export interface OccurrenceDTO {
  description: string
  occurrenceDate: string
  occurrenceType: OccurrenceType
  studentId: number
  teacherId: number
}

export interface OccurrenceFilters {
  studentId?: number
  teacherId?: number
  gradeId?: number
  occurrenceType?: OccurrenceType | ''
  startDate?: string
  endDate?: string
  page?: number
  size?: number
  sort?: string
}