import { useState } from 'react'
import { useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade } from '../hooks/useGrades'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { GRADE_SHIFTS } from '../utils/occurrenceTypes'
import type { Grade, GradeDTO } from '../types'
import { Plus, Pencil, Trash2, BookOpen, X, Search, Users } from 'lucide-react'

const INITIAL_FORM: GradeDTO = { name: '', course: '', shift: 'MANHÃ' }

const SHIFT_LABELS: Record<string, string> = {
  'MANHÃ': 'Manhã',
  'TARDE': 'Tarde',
  'NOITE': 'Noite',
  'INTEGRAL': 'Integral',
}

const SHIFT_COLORS: Record<string, string> = {
  'MANHÃ': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300',
  'TARDE': 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  'NOITE': 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  'INTEGRAL': 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
}

export default function GradesPage() {
  const { data: grades, isLoading } = useGrades()
  const createGrade = useCreateGrade()
  const updateGrade = useUpdateGrade()
  const deleteGrade = useDeleteGrade()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Grade | null>(null)
  const [form, setForm] = useState<GradeDTO>(INITIAL_FORM)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const filtered = (grades ?? []).filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.course.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  const openEdit = (grade: Grade) => {
    setEditing(grade)
    setForm({ name: grade.name, course: grade.course, shift: grade.shift })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateGrade.mutateAsync({ id: editing.id, data: form })
      } else {
        await createGrade.mutateAsync(form)
      }
      setShowModal(false)
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteGrade.mutateAsync(id)
      setConfirmDelete(null)
    } catch { /* handled */ }
  }

  const isBusy = createGrade.isPending || updateGrade.isPending

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Turmas" description={`${grades?.length ?? 0} turma(s) cadastrada(s)`}>
        <button
          onClick={openCreate}
          className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Nova Turma
        </button>
      </PageHeader>

      {/* Filtro */}
      <div className="px-6 py-3 border-b border-border bg-background">
        <div className="relative max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar turma ou curso..."
            className="w-full h-8 pl-8 pr-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="h-5 w-32 skeleton-shimmer rounded" />
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="h-6 w-16 skeleton-shimmer rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="size-6" />}
            title="Nenhuma turma encontrada"
            description={search ? 'Tente outro termo de busca.' : 'Crie a primeira turma para começar.'}
            action={
              <button
                onClick={openCreate}
                className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Plus className="size-3.5" /> Criar Turma
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(grade => (
              <div
                key={grade.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group"
              >
                {/* Header do card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(grade)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(grade.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <h3 className="text-sm font-semibold text-foreground mb-0.5">{grade.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{grade.course}</p>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SHIFT_COLORS[grade.shift] ?? 'bg-muted text-muted-foreground'}`}>
                    {SHIFT_LABELS[grade.shift] ?? grade.shift}
                  </span>
                  {grade.studentCount !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="size-3" />
                      {grade.studentCount}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold">{editing ? 'Editar Turma' : 'Nova Turma'}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nome da Turma *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: 1º A, 2º B, Turma 3..."
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Curso *</label>
                  <input
                    required
                    value={form.course}
                    onChange={e => setForm(f => ({ ...f, course: e.target.value }))}
                    placeholder="Ex: Ensino Médio, Técnico em TI..."
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Turno *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADE_SHIFTS.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, shift: s.value }))}
                        className={`h-9 px-3 text-sm rounded-lg border transition-all ${
                          form.shift === s.value
                            ? 'border-primary bg-primary/5 text-primary font-medium ring-1 ring-primary'
                            : 'border-border hover:bg-muted text-foreground'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {isBusy ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Salvando...
                    </>
                  ) : (editing ? 'Salvar' : 'Criar Turma')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
            <h3 className="font-semibold text-foreground mb-2">Remover turma?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Os alunos e ocorrências relacionados podem ser afetados. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteGrade.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteGrade.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
