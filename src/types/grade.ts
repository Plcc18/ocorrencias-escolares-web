export type GradeShift = 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'

export interface Grade {
  id: number
  gradeLevel: number        
  schoolYear: number        
  displayName: string
  courseId: number
  courseName: string
  courseAcronym: string
  shift: GradeShift
  studentCount?: number
  createdAt: string
  updatedAt: string
}

export interface GradeDTO {
  gradeLevel: number
  schoolYear: number
  courseId: number
  shift: GradeShift
}