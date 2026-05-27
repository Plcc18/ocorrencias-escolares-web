import { api } from './axios'
import type { Grade, GradeDTO } from '@/types'

export const gradesService = {
  getAll: () =>
    api.get<Grade[]>('/grades').then(r => r.data),

  getById: (id: number) =>
    api.get<Grade>(`/grades/${id}`).then(r => r.data),

  create: (data: GradeDTO) =>
    api.post<Grade>('/grades', data).then(r => r.data),

  update: (id: number, data: GradeDTO) =>
    api.put<Grade>(`/grades/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/grades/${id}`),
}
