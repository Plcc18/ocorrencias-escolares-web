import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentsService } from '../api/students'
import type { StudentDTO, StudentFilters } from '../types/student'
import toast from 'react-hot-toast'

export function useStudents(filters: StudentFilters = {}) {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentsService.getAll(filters),
    staleTime: 60_000,
  })
}

export function useStudentsByGrade(gradeId: number | null) {
  return useQuery({
    queryKey: ['students', 'grade', gradeId],
    queryFn: () => studentsService.getByGrade(gradeId!),
    enabled: !!gradeId,
    staleTime: 30_000,
  })
}

export function useCreateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StudentDTO) => studentsService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Aluno cadastrado com sucesso!')
    },
  })
}

export function useUpdateStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StudentDTO }) =>
      studentsService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Aluno atualizado com sucesso!')
    },
  })
}

export function useDeleteStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => studentsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      toast.success('Aluno removido.')
    },
  })
}
