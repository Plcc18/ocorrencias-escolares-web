import { useState } from 'react'
import { useTeachers, useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from '../hooks/useTeachers'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { formatDate } from '../utils/format'
import { getInitials } from '../utils/format'
import type { Teacher, TeacherCreateDTO } from '../types/teacher'
import { Plus, Trash2, Users, X, Search,Pencil, Eye } from 'lucide-react'

const INITIAL_FORM: TeacherCreateDTO = { name: '', email: '', password: '', subject: '' }

export default function TeachersPage() {
  const { data: teachers, isLoading } = useTeachers()
  const createTeacher = useCreateTeacher()
  const updateTeacher = useUpdateTeacher()
  const deleteTeacher = useDeleteTeacher()

  const [showModal, setShowModal] = useState(false)
  const [viewing, setViewing] = useState<Teacher | null>(null)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [form, setForm] = useState<TeacherCreateDTO>(INITIAL_FORM)
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [showPass, setShowPass] = useState(false)

  const openCreate = () => {
    setViewing(null)
    setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  const openView = (teacher: Teacher) => {
    setViewing(teacher)
    setEditing(null)
    setForm({ name: teacher.name, email: teacher.email, password: '••••••••', subject: teacher.subject || '' })
    setShowModal(true)
  }

  const openEdit = (teacher: Teacher) => {
    setViewing(null)
    setEditing(teacher)
    setForm({ name: teacher.name, email: teacher.email, password: '', subject: teacher.subject || '' })
    setShowModal(true)
  }

  const filtered = (teachers ?? []).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        await updateTeacher.mutateAsync({ id: editing.id, data: form })
      } else {
        await createTeacher.mutateAsync(form)
      }
      setShowModal(false)
      setForm(INITIAL_FORM)
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteTeacher.mutateAsync(id)
      setConfirmDelete(null)
    } catch { /* handled */ }
  }

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Professores" description={`${teachers?.length ?? 0} cadastrado(s)`}>
        <button
          onClick={openCreate}
          className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Novo Professor
        </button>
      </PageHeader>

      <div className="px-6 py-3 border-b border-border">
        <div className="relative max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar professor..."
            className="w-full h-8 pl-8 pr-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full skeleton-shimmer" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 skeleton-shimmer rounded" />
                  <div className="h-3 w-48 skeleton-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users className="size-6" />}
            title="Nenhum professor encontrado"
            action={
              <button onClick={() => setShowModal(true)} className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
                <Plus className="size-3.5 inline mr-1" /> Cadastrar
              </button>
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Professor</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Disciplina</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Cadastrado em</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(teacher => (
                <tr 
                  key={teacher.id} 
                  onClick={() => openView(teacher)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {getInitials(teacher.name)}
                      </div>
                      <span className="font-medium text-foreground">{teacher.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{teacher.email}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{teacher.subject || '—'}</td>
                  <td className="px-4 py-3.5 text-muted-foreground">{teacher.createdAt ? formatDate(teacher.createdAt) : '—'}</td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                          onClick={(e) => { e.stopPropagation(); openEdit(teacher); }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(teacher.id); }}
                      className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold">{viewing ? 'Detalhes do Professor' : editing ? 'Editar Professor' : 'Novo Professor'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={!!viewing} className="p-6 space-y-4 border-none m-0">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nome Completo *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nome do professor"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="professor@escola.com"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                {!editing && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Senha *</label>
                    <div className="relative">
                      <input
                        required
                        type={showPass ? 'text' : 'password'}
                        value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Senha de acesso"
                        minLength={6}
                        className="w-full h-9 px-3 pr-10 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                      />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
                        {showPass ? 'ocultar' : 'mostrar'}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Disciplina</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Ex: Matemática"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              </fieldset>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button type="button" onClick={() => setShowModal(false)} className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted">
                  {viewing ? 'Fechar' : 'Cancelar'}
                </button>
                {!viewing && (
                  <button
                    type="submit"
                    disabled={createTeacher.isPending || updateTeacher.isPending}
                    className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {createTeacher.isPending || updateTeacher.isPending ? (
                      <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Salvando...</>
                    ) : (editing ? 'Salvar' : 'Cadastrar')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
            <h3 className="font-semibold text-foreground mb-2">Remover professor?</h3>
            <p className="text-sm text-muted-foreground mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted">Cancelar</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteTeacher.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteTeacher.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
