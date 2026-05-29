export interface Course {
  id: number
  name: string
  acronym: string
  gradeCount?: number
  createdAt: string
  updatedAt: string
}

export interface CourseDTO {
  name: string
  acronym: string
}