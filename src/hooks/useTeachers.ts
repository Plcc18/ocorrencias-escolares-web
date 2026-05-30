import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teachersService } from '../api/teachers'
import type { TeacherDTO } from '../types/teacher'
import toast from 'react-hot-toast'

export function useTeachers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => teachersService.getAll(),
    staleTime: 120_000,
    ...options,
  })
}

export function useCreateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TeacherDTO) => teachersService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('Professor cadastrado com sucesso!')
    },
  })
}

export function useUpdateTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<TeacherDTO, 'password'> }) => 
      teachersService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('Professor atualizado com sucesso!')
    },
  })
}

export function useDeleteTeacher() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => teachersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      toast.success('Professor removido.')
    },
  })
}
