import { api } from './axios'
import type { Teacher, TeacherDTO } from '@/types'

export const teachersService = {
  getAll: () =>
    api.get<Teacher[]>('/teachers').then(r => r.data),

  getById: (id: number) =>
    api.get<Teacher>(`/teachers/${id}`).then(r => r.data),

  create: (data: TeacherDTO) =>
    api.post<Teacher>('/teachers', data).then(r => r.data),

  update: (id: number, data: Omit<TeacherDTO, 'password'>) =>
    api.put<Teacher>(`/teachers/${id}`, data).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/teachers/${id}`),
}
