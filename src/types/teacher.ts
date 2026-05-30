export interface Teacher {
  id: number
  name: string
  email: string
  subjects: string[]
  createdAt?: string
}

export interface TeacherDTO {
  name: string
  email: string
  subjects: string[]
}

export interface TeacherCreateDTO extends TeacherDTO {
  password: string
}