import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { coursesService } from '../api/courses'
import type { CourseDTO } from '../types/course'
import toast from 'react-hot-toast'

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => coursesService.getAll(),
    staleTime: 120_000,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CourseDTO) => coursesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Curso criado com sucesso!')
    },
  })
}

export function useUpdateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CourseDTO }) =>
      coursesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      qc.invalidateQueries({ queryKey: ['grades'] })
      toast.success('Curso atualizado!')
    },
  })
}

export function useDeleteCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => coursesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      toast.success('Curso removido.')
    },
  })
}