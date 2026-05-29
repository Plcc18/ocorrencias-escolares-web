import { api } from './axios'
import type { Course, CourseDTO } from '@/types'

export const coursesService = {
  getAll: () =>
    api.get<Course[]>('/courses').then(r => r.data),

  getById: (id: number) =>
    api.get<Course>(`/courses/${id}`).then(r => r.data),

  create: (data: CourseDTO) =>
    api.post<Course>('/courses', data).then(r => r.data),

  update: (id: number, data: CourseDTO) =>
    api.put<Course>(`/courses/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/courses/${id}`),
}