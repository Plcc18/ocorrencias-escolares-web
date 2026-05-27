export interface Teacher {
  id: number
  name: string
  email: string
  subject?: string
  createdAt?: string
}

export interface TeacherDTO {
  name: string
  email: string
  subject: string  
}

export interface TeacherCreateDTO extends TeacherDTO {
  password: string 
}