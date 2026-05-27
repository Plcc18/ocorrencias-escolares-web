export type GradeShift = 'MANHÃ' | 'TARDE' | 'NOITE' | 'INTEGRAL'

export interface Grade {
  id: number
  name: string
  course: string
  shift: GradeShift
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export interface GradeDTO {
  name: string
  course: string
  shift: string
}
