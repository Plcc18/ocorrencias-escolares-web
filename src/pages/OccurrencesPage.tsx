import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useOccurrences, useDeleteOccurrence } from '../hooks/useOccurrences'
import { useGrades } from '../hooks/useGrades'
import { useTeachers } from '../hooks/useTeachers'
import { useAuth } from '../contexts/AuthContext'
import { OccurrenceBadge } from '../components/common/OccurrenceBadge'
import { EmptyState } from '../components/common/EmptyState'
import { PageHeader } from '../components/common/PageHeader'
import { OccurrenceDetailModal } from '../components/occurrences/OccurrenceDetailModal'
import { formatDate } from '../utils/format'
import { OCCURRENCE_TYPES } from '../utils/occurrenceTypes'
import type { Occurrence, OccurrenceFilters } from '../types'
import { Plus, FileWarning, X, Trash2, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'

export default function OccurrencesPage() {
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState<OccurrenceFilters>({ page: 0, size: 20 })
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null)
  const [editingOccurrence, setEditingOccurrence] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const { data, isLoading } = useOccurrences(filters)
  const { data: grades } = useGrades()
  const { data: teachers } = useTeachers({ enabled: isAdmin })
  const deleteOccurrence = useDeleteOccurrence()

  const occurrences = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const currentPage = filters.page ?? 0

  const handleDelete = async (id: number) => {
    try {
      await deleteOccurrence.mutateAsync(id)
      setConfirmDelete(null)
      if (selectedOccurrence?.id === id) setSelectedOccurrence(null)
    } catch { /* handled */ }
  }

  const handleOpenDetails = (occurrence: Occurrence, editing = false) => {
    setSelectedOccurrence(occurrence)
    setEditingOccurrence(editing && isAdmin)
  }

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Ocorrências" description={`${data?.totalElements ?? 0} registro(s)`}>
        <Link
          to="/occurrences/new"
          className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Registrar
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border bg-background flex items-center gap-3 flex-wrap">
        <select
          value={filters.gradeId ?? ''}
          onChange={e => setFilters(f => ({ ...f, gradeId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
          className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="">Todas as turmas</option>
          {grades?.map(g => <option key={g.id} value={g.id}>{g.displayName}</option>)}
        </select>

        {isAdmin && (
          <select
            value={filters.teacherId ?? ''}
            onChange={e => setFilters(f => ({ ...f, teacherId: e.target.value ? Number(e.target.value) : undefined, page: 0 }))}
            className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <option value="">Todos os professores</option>
            {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        )}

        <select
          value={filters.occurrenceType ?? ''}
          onChange={e => setFilters(f => ({ ...f, occurrenceType: (e.target.value as any) || undefined, page: 0 }))}
          className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <option value="">Todos os tipos</option>
          {OCCURRENCE_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            value={filters.startDate ?? ''}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value || undefined, page: 0 }))}
            className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
          <input
            type="date"
            value={filters.endDate ?? ''}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value || undefined, page: 0 }))}
            className="h-8 px-2 text-sm border border-input rounded-lg bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          />
        </div>

        {(filters.gradeId || filters.teacherId || filters.occurrenceType || filters.startDate) && (
          <button
            onClick={() => setFilters({ page: 0, size: 20 })}
            className="h-8 px-2 text-xs text-muted-foreground border border-border rounded-lg hover:bg-muted flex items-center gap-1 motion-safe:transition-colors"
          >
            <X className="size-3" /> Limpar
          </button>
        )}
      </div>

      {/* Table for md+, Cards for small screens */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4">
                <div className="h-4 w-36 skeleton-shimmer rounded" />
                <div className="h-5 w-24 skeleton-shimmer rounded-full" />
                <div className="h-4 w-28 skeleton-shimmer rounded" />
                <div className="h-4 w-20 skeleton-shimmer rounded ml-auto" />
              </div>
            ))}
          </div>
        ) : occurrences.length === 0 ? (
          <EmptyState
            icon={<FileWarning className="size-6" />}
            title="Nenhuma ocorrência encontrada"
            description="Tente ajustar os filtros ou registre a primeira ocorrência."
            action={
              <Link
                to="/occurrences/new"
                className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 flex items-center gap-1.5 inline-flex"
              >
                <Plus className="size-3.5" /> Registrar
              </Link>
            }
          />
        ) : (
          <>
            {/* Cards for small screens */}
            <div className="md:hidden space-y-3 px-4 py-3">
              {occurrences.map(occ => (
                <div key={occ.id} onClick={() => handleOpenDetails(occ)} className="bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer motion-safe:transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                        <OccurrenceBadge type={occ.occurrenceType} />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{occ.studentName}</div>
                        <div className="text-xs text-muted-foreground">{occ.gradeName} • {formatDate(occ.occurrenceDate)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground max-w-xs truncate">{occ.description}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table for md+ */}
            <table className="w-full text-sm hidden md:table">
              <thead className="bg-muted/50 sticky top-0">
                <tr className="border-b border-border">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Aluno</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Tipo</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Turma</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Professor</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Descrição</th>
                  {isAdmin && <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {occurrences.map(occ => (
                  <tr
                    key={occ.id}
                    onClick={() => handleOpenDetails(occ)}
                    className="hover:bg-muted/30 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground">{occ.studentName}</td>
                    <td className="px-4 py-3.5"><OccurrenceBadge type={occ.occurrenceType} /></td>
                    <td className="px-4 py-3.5 text-muted-foreground">{occ.gradeName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{occ.teacherName}</td>
                    <td className="px-4 py-3.5 text-muted-foreground">{formatDate(occ.occurrenceDate)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground max-w-xs">
                      <span className="truncate block">{occ.description}</span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenDetails(occ, true) }}
                            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Editar"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(occ.id) }}
                            className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {currentPage + 1} de {totalPages} • {data?.totalElements} registros
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 0}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) - 1 }))}
              className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 0) + 1 }))}
              className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Occurrence Detail Modal */}
      {selectedOccurrence && (
        <OccurrenceDetailModal
          occurrence={selectedOccurrence}
          initialEditing={editingOccurrence}
          onClose={() => {
            setSelectedOccurrence(null)
            setEditingOccurrence(false)
          }}
        />
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
            <h3 className="font-semibold text-foreground mb-2">Remover ocorrência?</h3>
            <p className="text-sm text-muted-foreground mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted">
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteOccurrence.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteOccurrence.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
