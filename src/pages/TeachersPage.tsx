import { useState } from 'react'
import { useTeachers, useCreateTeacher, useDeleteTeacher, useUpdateTeacher } from '../hooks/useTeachers'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { formatDate, getInitials } from '../utils/format'
import type { Teacher, TeacherCreateDTO } from '../types/teacher'
import { api } from '../api/axios'
import toast from 'react-hot-toast'
import { Plus, Trash2, Users, X, Search, Pencil, KeyRound, Eye, EyeOff } from 'lucide-react'

const INITIAL_FORM: TeacherCreateDTO = { name: '', email: '', password: '', subjects: [] }

// ── SubjectTagInput ───────────────────────────────────────────────────────────
interface SubjectTagInputProps {
  value: string[]
  onChange: (subjects: string[]) => void
  disabled?: boolean
}

function SubjectTagInput({ value, onChange, disabled }: SubjectTagInputProps) {
  const [input, setInput] = useState('')

  const add = (raw: string) => {
    const subject = raw.trim()
    if (!subject || value.includes(subject)) { setInput(''); return }
    onChange([...value, subject])
    setInput('')
  }

  const remove = (subject: string) => onChange(value.filter(s => s !== subject))

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(input)
    } else if (e.key === 'Backspace' && input === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div className={`min-h-[38px] w-full px-3 py-1.5 border border-input rounded-lg bg-background flex flex-wrap gap-1.5 items-center focus-within:ring-2 focus-within:ring-ring/50 transition-all ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {value.map(subject => (
        <span
          key={subject}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
        >
          {subject}
          {!disabled && (
            <button type="button" onClick={() => remove(subject)} className="hover:text-destructive transition-colors">
              <X className="size-2.5" />
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) add(input) }}
          placeholder={value.length === 0 ? 'Digite e pressione Enter...' : ''}
          className="flex-1 min-w-24 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
        />
      )}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
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

  // Password change state
  const [pwTeacher, setPwTeacher] = useState<Teacher | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [showNewPass, setShowNewPass] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const openCreate = () => {
    setViewing(null); setEditing(null)
    setForm(INITIAL_FORM)
    setShowModal(true)
  }

  const openView = (teacher: Teacher) => {
    setViewing(teacher); setEditing(null)
    setForm({ name: teacher.name, email: teacher.email, password: '', subjects: teacher.subjects ?? [] })
    setShowModal(true)
  }

  const openEdit = (teacher: Teacher) => {
    setViewing(null); setEditing(teacher)
    setForm({ name: teacher.name, email: teacher.email, password: '', subjects: teacher.subjects ?? [] })
    setShowModal(true)
  }

  const openPasswordChange = (teacher: Teacher, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setPwTeacher(teacher); setNewPassword(''); setShowNewPass(false)
  }

  const filtered = (teachers ?? []).filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.subjects ?? []).some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.subjects.length === 0) { toast.error('Adicione pelo menos uma disciplina.'); return }
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      subjects: form.subjects.map(s => s.trim()).filter(Boolean),
    }
    if (!payload.name || !payload.email) {
      toast.error('Informe nome e e-mail do professor.')
      return
    }
    if (!editing && payload.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    try {
      if (editing) {
        await updateTeacher.mutateAsync({ id: editing.id, data: payload })
      } else {
        await createTeacher.mutateAsync(payload)
      }
      setShowModal(false); setForm(INITIAL_FORM)
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try { await deleteTeacher.mutateAsync(id); setConfirmDelete(null) } catch { /* handled */ }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pwTeacher || newPassword.length < 6) return
    setSavingPw(true)
    try {
      await api.patch(`/teachers/${pwTeacher.id}/password`, { newPassword })
      toast.success(`Senha de ${pwTeacher.name} alterada com sucesso!`)
      setPwTeacher(null); setNewPassword('')
    } catch { /* handled by axios interceptor */ } finally { setSavingPw(false) }
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
            placeholder="Buscar por nome, email ou disciplina..."
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
              <button onClick={openCreate} className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90">
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Disciplinas</th>
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
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {(teacher.subjects ?? []).length === 0 ? (
                        <span className="text-muted-foreground text-xs">—</span>
                      ) : (
                        (teacher.subjects ?? []).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{s}</span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{teacher.createdAt ? formatDate(teacher.createdAt) : '—'}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); openPasswordChange(teacher, e) }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Alterar senha">
                        <KeyRound className="size-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); openEdit(teacher) }}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Editar">
                        <Pencil className="size-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(teacher.id) }}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Remover">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold">
                {viewing ? 'Detalhes do Professor' : editing ? 'Editar Professor' : 'Novo Professor'}
              </h3>
              <div className="flex items-center gap-2">
                {viewing && (
                  <button onClick={() => openEdit(viewing)}
                    className="h-8 px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground">
                    <Pencil className="size-3.5" /> Editar
                  </button>
                )}
                <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <fieldset disabled={!!viewing} className="p-6 space-y-4 border-none m-0">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nome Completo *</label>
                  <input required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Nome do professor"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email *</label>
                  <input required type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="professor@escola.com"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50" />
                </div>
                {!editing && !viewing && (
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Senha *</label>
                    <div className="relative">
                      <input required type={showPass ? 'text' : 'password'} value={form.password}
                        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Mínimo 6 caracteres" minLength={6}
                        className="w-full h-9 px-3 pr-20 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
                        {showPass ? 'ocultar' : 'mostrar'}
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Disciplinas *
                    {!viewing && (
                      <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                        (pressione Enter ou vírgula para adicionar)
                      </span>
                    )}
                  </label>
                  <SubjectTagInput
                    value={form.subjects}
                    onChange={subjects => setForm(f => ({ ...f, subjects }))}
                    disabled={!!viewing}
                  />
                </div>
              </fieldset>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button type="button" onClick={() => setShowModal(false)}
                  className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted">
                  {viewing ? 'Fechar' : 'Cancelar'}
                </button>
                {!viewing && (
                  <button type="submit" disabled={createTeacher.isPending || updateTeacher.isPending}
                    className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
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

      {/* Password Change Modal */}
      {pwTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-base font-semibold">Alterar Senha</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{pwTeacher.name}</p>
              </div>
              <button onClick={() => setPwTeacher(null)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="p-6 space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  A nova senha será usada pelo professor para fazer login no sistema.
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Nova Senha *</label>
                  <div className="relative">
                    <input required type={showNewPass ? 'text' : 'password'} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} minLength={6}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full h-9 px-3 pr-20 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50" />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {showNewPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      {showNewPass ? 'ocultar' : 'mostrar'}
                    </button>
                  </div>
                  {newPassword.length > 0 && newPassword.length < 6 && (
                    <p className="text-xs text-destructive mt-1">Mínimo 6 caracteres ({newPassword.length}/6)</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button type="button" onClick={() => setPwTeacher(null)} className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted">
                  Cancelar
                </button>
                <button type="submit" disabled={savingPw || newPassword.length < 6}
                  className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                  {savingPw ? (
                    <><div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Salvando...</>
                  ) : (
                    <><KeyRound className="size-3.5" /> Alterar Senha</>
                  )}
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
            <h3 className="font-semibold text-foreground mb-2">Remover professor?</h3>
            <p className="text-sm text-muted-foreground mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted">Cancelar</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deleteTeacher.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50">
                {deleteTeacher.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
