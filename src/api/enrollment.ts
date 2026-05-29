import { api } from './axios'
import type {
  EnrollmentHistory,
  PromoteStudentDTO,
  BulkPromoteDTO,
  PromotionResult,
} from '@/types/enrollment'

export const enrollmentService = {
  getHistory: (studentId: number) =>
    api.get<EnrollmentHistory[]>(`/enrollments/student/${studentId}`).then(r => r.data),

  promote: (studentId: number, data: PromoteStudentDTO) =>
    api.post<EnrollmentHistory>(`/enrollments/student/${studentId}/promote`, data).then(r => r.data),

  bulkPromote: (data: BulkPromoteDTO) =>
    api.post<PromotionResult>('/enrollments/bulk-promote', data).then(r => r.data),
}