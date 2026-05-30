export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT'

export interface AuthResponse {
  accessToken: string
  tokenType: 'Bearer'
  userId: number
  email: string
  role: Role
  teacherId: number | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface UserMe {
  id: number
  email: string
  username: string
  role: Role
  createdAt: string
  teacherId: number | null
}