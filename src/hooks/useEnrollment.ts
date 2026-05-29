import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enrollmentService } from '../api/enrollment'
import type { BulkPromoteDTO, PromoteStudentDTO } from '../types/enrollment'
import toast from 'react-hot-toast'

export function useEnrollmentHistory(studentId: number | null) {
  return useQuery({
    queryKey: ['enrollments', 'student', studentId],
    queryFn: () => enrollmentService.getHistory(studentId!),
    enabled: !!studentId,
    staleTime: 30_000,
  })
}

export function usePromoteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ studentId, data }: { studentId: number; data: PromoteStudentDTO }) =>
      enrollmentService.promote(studentId, data),
    onSuccess: (_, { studentId }) => {
      qc.invalidateQueries({ queryKey: ['enrollments', 'student', studentId] })
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Aluno promovido com sucesso!')
    },
  })
}

export function useBulkPromote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: BulkPromoteDTO) => enrollmentService.bulkPromote(data),
    onSuccess: result => {
      qc.invalidateQueries({ queryKey: ['students'] })
      qc.invalidateQueries({ queryKey: ['enrollments'] })
      toast.success(`${result.promoted} aluno(s) promovido(s) para ${result.targetGradeName}!`)
    },
  })
}