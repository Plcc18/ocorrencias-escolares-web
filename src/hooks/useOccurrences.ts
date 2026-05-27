import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { occurrencesService } from '../api/occurrences'
import type { OccurrenceDTO, OccurrenceFilters } from '../types/occurrence'
import toast from 'react-hot-toast'

export function useOccurrences(filters: OccurrenceFilters = {}) {
  return useQuery({
    queryKey: ['occurrences', filters],
    queryFn: () => occurrencesService.getAll(filters),
    staleTime: 30_000,
  })
}

export function useOccurrenceSummary() {
  return useQuery({
    queryKey: ['occurrences', 'summary'],
    queryFn: () => occurrencesService.getSummary(),
    staleTime: 60_000,
  })
}

export function useCreateOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: OccurrenceDTO) => occurrencesService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['occurrences'] })
      toast.success('Ocorrência registrada com sucesso!')
    },
  })
}

export function useDeleteOccurrence() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => occurrencesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['occurrences'] })
      toast.success('Ocorrência removida.')
    },
  })
}
