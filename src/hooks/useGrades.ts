import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gradesService } from '../api/grades'
import type { GradeDTO } from '../types/grade'
import toast from 'react-hot-toast'

export function useGrades() {
  return useQuery({
    queryKey: ['grades'],
    queryFn: () => gradesService.getAll(),
    staleTime: 120_000,
  })
}

export function useCreateGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: GradeDTO) => gradesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Turma criada com sucesso!')
    },
  })
}

export function useUpdateGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GradeDTO }) =>
      gradesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Turma atualizada!')
    },
  })
}

export function useDeleteGrade() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => gradesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Turma removida.')
    },
  })
}
