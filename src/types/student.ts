export type StudentStatus = 'ATIVO' | 'INATIVO'
export type StudentShift = 'MANHA' | 'TARDE' | 'NOITE' | 'INTEGRAL'

export interface Student {
  id: number
  name: string
  email?: string
  enrollment: string
  gradeId: number
  gradeName: string
  courseName: string
  courseAcronym: string
  shift: StudentShift
  status: StudentStatus
  birthDate?: string
  guardian?: string
  guardianPhone?: string
  guardianEmail?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface StudentDTO {
  name: string
  email?: string
  enrollment: string
  gradeId: number
  shift: StudentShift
  status?: string
  birthDate?: string
  guardian?: string
  guardianPhone?: string
  guardianEmail?: string
  notes?: string
}

export interface StudentFilters {
  name?: string
  gradeId?: number
  status?: string
  page?: number
  size?: number
}