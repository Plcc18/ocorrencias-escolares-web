import { api } from './axios'
import type { Student, StudentDTO, StudentFilters, PageResponse } from '@/types'

export const studentsService = {
  getAll: (filters: StudentFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.name) params.append('name', filters.name)
    if (filters.gradeId) params.append('gradeId', String(filters.gradeId))
    if (filters.status) params.append('status', filters.status)
    params.append('page', String(filters.page ?? 0))
    params.append('size', String(filters.size ?? 20))
    return api.get<PageResponse<Student>>(`/students?${params}`).then(r => r.data)
  },

  getByGrade: (gradeId: number) =>
    api.get<Student[]>(`/students/grade/${gradeId}`).then(r => r.data),

  getById: (id: number) =>
    api.get<Student>(`/students/${id}`).then(r => r.data),

  create: (data: StudentDTO) =>
    api.post<Student>('/students', data).then(r => r.data),

  update: (id: number, data: StudentDTO) =>
    api.put<Student>(`/students/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/students/${id}`),
}
