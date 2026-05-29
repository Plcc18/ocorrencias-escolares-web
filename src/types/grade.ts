export type GradeShift = 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'

export interface Grade {
  id: number
  name: string
  courseId: number
  courseName: string
  courseAcronym: string
  shift: GradeShift
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export interface GradeDTO {
  name: string
  courseId: number
  shift: GradeShift
}