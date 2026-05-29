import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../hooks/useCourses'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import type { Course, CourseDTO } from '../types'
import { Plus, Pencil, Trash2, BookMarked, X, Search } from 'lucide-react'

const INITIAL_FORM: CourseDTO = { name: '', acronym: '' }

export default function CoursesPage() {
  const navigate = useNavigate()
  const { data: courses, isLoading } = useCourses()
  const createCourse = useCreateCourse()
  const updateCourse = useUpdateCourse()
  const deleteCourse = useDeleteCourse()

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseDTO>(INITIAL_FORM)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const filtered = (courses ?? []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.acronym.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  const openEdit = (course: Course) => {
    setEditing(course)
    setForm({ name: course.name, acronym: course.acronym })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateCourse.mutateAsync({ id: editing.id, data: form })
      } else {
        await createCourse.mutateAsync(form)
      }
      setShowModal(false)
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCourse.mutateAsync(id)
      setConfirmDelete(null)
    } catch { /* handled */ }
  }

  const isBusy = createCourse.isPending || updateCourse.isPending

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Cursos" description={`${courses?.length ?? 0} curso(s) cadastrado(s)`}>
        <button
          onClick={openCreate}
          className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Novo Curso
        </button>
      </PageHeader>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border bg-background">
        <div className="relative max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar curso ou sigla..."
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="h-5 w-32 skeleton-shimmer rounded" />
                <div className="h-4 w-16 skeleton-shimmer rounded" />
                <div className="h-4 w-24 skeleton-shimmer rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<BookMarked className="size-6" />}
            title="Nenhum curso encontrado"
            description={search ? 'Tente outro termo de busca.' : 'Crie o primeiro curso para começar.'}
            action={
              <button
                onClick={openCreate}
                className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 flex items-center gap-1.5"
              >
                <Plus className="size-3.5" /> Criar Curso
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(course => (
              <div
                key={course.id}
                onClick={() => navigate(`/grades?course=${encodeURIComponent(course.acronym)}`)}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookMarked className="size-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(course); }}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(course.id); }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-foreground mb-0.5">{course.name}</h3>

                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                    {course.acronym}
                  </span>
                  {course.gradeCount !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {course.gradeCount} turma(s)
                    </span>
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
              <h3 className="text-base font-semibold">{editing ? 'Editar Curso' : 'Novo Curso'}</h3>
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
                  <label className="text-sm font-medium mb-1.5 block">Nome do Curso *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ex: Desenvolvimento de Sistemas"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Sigla *</label>
                  <input
                    required
                    value={form.acronym}
                    onChange={e => setForm(f => ({ ...f, acronym: e.target.value.toUpperCase() }))}
                    placeholder="Ex: DS"
                    maxLength={20}
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 uppercase"
                  />
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
                  ) : (editing ? 'Salvar' : 'Criar Curso')}
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
            <h3 className="font-semibold text-foreground mb-2">Remover curso?</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Todas as turmas vinculadas precisam ser removidas antes. Esta ação não pode ser desfeita.
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
                disabled={deleteCourse.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteCourse.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}