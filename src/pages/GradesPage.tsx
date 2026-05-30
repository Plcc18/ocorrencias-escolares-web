import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useGrades, useCreateGrade, useUpdateGrade, useDeleteGrade } from '../hooks/useGrades'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { GRADE_SHIFTS, SHIFT_LABELS, SHIFT_COLORS } from '../utils/occurrenceTypes'
import type { Grade, GradeDTO } from '../types'
import { Plus, Pencil, Trash2, BookOpen, X, Search, Users } from 'lucide-react'

const currentYear = new Date().getFullYear()
const HISTORY_YEARS = 2

const YEAR_OPTIONS = Array.from(
  { length: HISTORY_YEARS + 1 },
  (_, i) => currentYear - HISTORY_YEARS + i
)

const INITIAL_FORM: GradeDTO = {
  gradeLevel: 1,
  schoolYear: currentYear,
  courseId: 0,
  shift: 'MANHA',
}

function buildDisplayName(gradeLevel: number, courseAcronym: string, schoolYear: number, shift: GradeDTO['shift']): string {
  if (!courseAcronym) return `${gradeLevel}º - ${schoolYear}`
  const base = `${gradeLevel}º ${courseAcronym} - ${schoolYear}`
  if (shift && shift !== 'MANHA') {
    const labels: Record<string, string> = { TARDE: 'Tarde', NOITE: 'Noite', INTEGRAL: 'Integral' }
    return `${base} (${labels[shift]})`
  }
  return base
}

export default function GradesPage() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [searchParams] = useSearchParams()
  const { data: grades, isLoading } = useGrades()
  const { data: courses } = useCourses()
  const createGrade = useCreateGrade()
  const updateGrade = useUpdateGrade()
  const deleteGrade = useDeleteGrade()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Grade | null>(null)
  const [form, setForm] = useState<GradeDTO>(INITIAL_FORM)
  const [search, setSearch] = useState(searchParams.get('course') || '')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const filtered = (grades ?? []).filter(g => {
    const q = search.toLowerCase()
    return (
      g.displayName.toLowerCase().includes(q) ||
      g.courseName.toLowerCase().includes(q) ||
      g.courseAcronym.toLowerCase().includes(q) ||
      String(g.schoolYear).includes(q)
    )
  })

  const selectedCourse = courses?.find(c => c.id === form.courseId)
  const previewName = selectedCourse
    ? buildDisplayName(form.gradeLevel, selectedCourse.acronym, form.schoolYear, form.shift)
    : null

  const openCreate = () => {
    if (!isAdmin) return
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  const openEdit = (grade: Grade) => {
    if (!isAdmin) return
    setEditing(grade)
    setForm({
      gradeLevel: grade.gradeLevel,
      schoolYear: grade.schoolYear,
      courseId: grade.courseId,
      shift: grade.shift,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdmin) return
    if (!form.courseId) return
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
    if (!isAdmin) return
    try {
      await deleteGrade.mutateAsync(id)
      setConfirmDelete(null)
    } catch { /* handled */ }
  }

  const isBusy = createGrade.isPending || updateGrade.isPending

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Turmas" description={`${grades?.length ?? 0} turma(s) cadastrada(s)`}>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Nova Turma
          </button>
        )}
      </PageHeader>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border bg-background">
        <div className="relative max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar turma, curso ou ano..."
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

      {/* Content */}
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
            description={search ? 'Tente outro termo de busca.' : isAdmin ? 'Crie a primeira turma para começar.' : 'Nenhuma turma cadastrada.'}
            action={isAdmin ? (
              <button
                onClick={openCreate}
                className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Plus className="size-3.5" /> Criar Turma
              </button>
            ) : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(grade => (
              <div
                key={grade.id}
                onClick={() => navigate(`/students?gradeId=${grade.id}`)}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="size-5 text-primary" />
                  </div>
                  {isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(grade); }}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(grade.id); }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  )}
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-0.5">{grade.displayName}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium text-foreground/70">{grade.courseAcronym}</span>
                  {' · '}{grade.courseName}
                </p>

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

      {/* Modal */}
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

                {/* Preview do nome */}
                {previewName && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
                    <p className="text-xs text-primary font-medium uppercase tracking-wider mb-0.5">Nome</p>
                    <p className="text-sm font-semibold text-foreground">{previewName}</p>
                  </div>
                )}

                {/* Curso */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Curso *</label>
                  <select
                    required
                    value={form.courseId || ''}
                    onChange={e => setForm(f => ({ ...f, courseId: Number(e.target.value) }))}
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="">Selecione o curso...</option>
                    {courses?.map(c => (
                      <option key={c.id} value={c.id}>{c.acronym} — {c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Série + Ano na mesma linha */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Série *</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[1, 2, 3].map(n => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, gradeLevel: n }))}
                          className={`h-9 text-sm rounded-lg border font-medium transition-all ${
                            form.gradeLevel === n
                              ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary'
                              : 'border-border hover:bg-muted text-foreground'
                          }`}
                        >
                          {n}º
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Ano letivo *</label>
                    <select
                      required
                      value={form.schoolYear}
                      onChange={e => setForm(f => ({ ...f, schoolYear: Number(e.target.value) }))}
                      className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                    >
                      {YEAR_OPTIONS.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Turno */}
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
                  disabled={isBusy || !form.courseId}
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
              Remova ou transfira os alunos antes de excluir esta turma. Esta ação não pode ser desfeita.
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
