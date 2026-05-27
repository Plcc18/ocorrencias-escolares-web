import { api } from './axios'
import type { Occurrence, OccurrenceDTO, OccurrenceFilters, PageResponse } from '@/types'

export const occurrencesService = {
  getAll: (filters: OccurrenceFilters = {}) => {
    const params = new URLSearchParams()
    if (filters.studentId) params.append('studentId', String(filters.studentId))
    if (filters.teacherId) params.append('teacherId', String(filters.teacherId))
    if (filters.gradeId) params.append('gradeId', String(filters.gradeId))
    if (filters.occurrenceType) params.append('occurrenceType', filters.occurrenceType)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)
    params.append('page', String(filters.page ?? 0))
    params.append('size', String(filters.size ?? 20))
    params.append('sort', filters.sort || 'occurrenceDate,desc')
    return api.get<PageResponse<Occurrence>>(`/occurrences?${params}`).then(r => r.data)
  },

  getById: (id: number) =>
    api.get<Occurrence>(`/occurrences/${id}`).then(r => r.data),

  create: (data: OccurrenceDTO) =>
    api.post<Occurrence>('/occurrences', data).then(r => r.data),

  update: (id: number, data: Partial<OccurrenceDTO>) =>
    api.put<Occurrence>(`/occurrences/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/occurrences/${id}`),
}