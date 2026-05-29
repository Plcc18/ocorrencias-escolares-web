export type EnrollmentReason = 'MATRICULA' | 'PROMOCAO' | 'RETENCAO' | 'TRANSFERENCIA' | 'CANCELAMENTO'

export interface EnrollmentHistory {
  id: number
  studentId: number
  studentName: string
  gradeId: number
  gradeName: string
  courseAcronym: string
  startDate: string
  endDate: string | null
  reason: EnrollmentReason
  notes: string | null
  active: boolean
  createdAt: string
}

export interface PromoteStudentDTO {
  targetGradeId: number
  reason?: EnrollmentReason
  notes?: string
}

export interface BulkPromoteDTO {
  sourceGradeId: number
  targetGradeId: number
  studentIds?: number[]
  reason?: EnrollmentReason
  notes?: string
}

export interface PromotionResult {
  promoted: number
  skipped: number
  targetGradeName: string
  promotedStudentNames: string[]
  skippedReasons: string[]
}