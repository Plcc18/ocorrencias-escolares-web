import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCreateOccurrence } from '../hooks/useOccurrences'
import { useGrades } from '../hooks/useGrades'
import { useStudentsByGrade } from '../hooks/useStudents'
import { useTeachers } from '../hooks/useTeachers'
import { useAuth } from '../contexts/AuthContext'
import { PageHeader } from '../components/common/PageHeader'
import { OccurrenceBadge } from '../components/common/OccurrenceBadge'
import { OCCURRENCE_TYPES } from '../utils/occurrenceTypes'
import { todayISO } from '../utils/format'
import type { OccurrenceType } from '../types'
import { ArrowLeft, Search, CheckCircle2, UserCheck } from 'lucide-react'

export default function NewOccurrencePage() {
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const createOccurrence = useCreateOccurrence()

  const [gradeId, setGradeId] = useState<number | null>(null)
  const [studentId, setStudentId] = useState<number | null>(null)
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null)
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceType | null>(null)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [studentSearch, setStudentSearch] = useState('')

  const { data: grades } = useGrades()
  const { data: students, isLoading: loadingStudents } = useStudentsByGrade(gradeId)
  // TEACHER não precisa carregar a lista — o teacherId já vem do contexto
  const { data: teachers } = useTeachers({ enabled: isAdmin })

  /**
   * Resolução do professor responsável:
   * - TEACHER: usa o próprio teacherId do contexto de autenticação (automático, sem seleção)
   * - ADMIN: usa o professor selecionado no dropdown
   */
  const effectiveTeacherId = isAdmin ? selectedTeacherId : (user?.teacherId ?? null)

  const filteredStudents = students?.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  ) ?? []

  const selectedGrade = grades?.find(g => g.id === gradeId)
  const selectedStudent = students?.find(s => s.id === studentId)
  const selectedTeacher = isAdmin
    ? teachers?.find(t => t.id === selectedTeacherId)
    : null

  const canSubmit =
    gradeId &&
    studentId &&
    occurrenceType &&
    description.trim() &&
    effectiveTeacherId !== null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId || !occurrenceType || !description.trim() || !effectiveTeacherId) return

    try {
      await createOccurrence.mutateAsync({
        studentId,
        teacherId: effectiveTeacherId,
        occurrenceType,
        description: description.trim(),
        occurrenceDate: date,
      })
      navigate('/occurrences')
    } catch { /* handled */ }
  }

  // Número do passo do professor varia conforme o papel:
  // TEACHER: passo 3 não existe (pulamos para o 4 direto)
  // ADMIN: passo 3 = selecionar professor
  const teacherStepNumber = isAdmin ? 3 : null
  const typeStepNumber = isAdmin ? 4 : 3
  const detailStepNumber = isAdmin ? 5 : 4

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Registrar Ocorrência" description="Preencha os dados da ocorrência">
        <Link to="/occurrences"
          className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground">
          <ArrowLeft className="size-4" /> Voltar
        </Link>
      </PageHeader>

      <div className="flex-1 p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Passo 1 — Turma */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${gradeId ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {gradeId ? <CheckCircle2 className="size-4" /> : '1'}
              </div>
              <h3 className="text-sm font-semibold">Selecionar Turma</h3>
            </div>
            <select
              value={gradeId ?? ''}
              onChange={e => {
                setGradeId(e.target.value ? Number(e.target.value) : null)
                setStudentId(null); setStudentSearch('')
              }}
              className="w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Selecione a turma...</option>
              {grades?.map(g => <option key={g.id} value={g.id}>{g.displayName}</option>)}
            </select>
          </div>

          {/* Passo 2 — Aluno */}
          <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!gradeId ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${studentId ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {studentId ? <CheckCircle2 className="size-4" /> : '2'}
              </div>
              <h3 className="text-sm font-semibold">Selecionar Aluno</h3>
              {selectedGrade && <span className="text-xs text-muted-foreground ml-1">— {selectedGrade.displayName}</span>}
            </div>
            {gradeId && (
              <>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <input
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                    placeholder="Buscar aluno por nome..."
                    className="w-full h-9 pl-8 pr-3 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border">
                  {loadingStudents ? (
                    <div className="py-4 text-center">
                      <div className="w-4 h-4 border-2 border-muted border-t-primary rounded-full animate-spin mx-auto" />
                    </div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-4 text-center text-sm text-muted-foreground">Nenhum aluno encontrado</div>
                  ) : (
                    filteredStudents.map(s => (
                      <button key={s.id} type="button" onClick={() => setStudentId(s.id)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center justify-between ${studentId === s.id ? 'bg-primary/5 font-medium' : ''}`}>
                        <div>
                          <span className="text-foreground">{s.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">{s.enrollment}</span>
                        </div>
                        {studentId === s.id && <CheckCircle2 className="size-4 text-green-500" />}
                      </button>
                    ))
                  )}
                </div>
                {selectedStudent && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> {selectedStudent.name} selecionado(a)
                  </p>
                )}
              </>
            )}
          </div>

          {/* Passo 3 — Professor (somente ADMIN seleciona; TEACHER é automático) */}
          {isAdmin ? (
            <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!studentId ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${selectedTeacherId ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                  {selectedTeacherId ? <CheckCircle2 className="size-4" /> : String(teacherStepNumber)}
                </div>
                <h3 className="text-sm font-semibold">Professor Responsável</h3>
              </div>
              <select
                value={selectedTeacherId ?? ''}
                onChange={e => setSelectedTeacherId(e.target.value ? Number(e.target.value) : null)}
                className="w-full h-10 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">Selecione o professor...</option>
                {teachers?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}{t.subjects?.length ? ` — ${t.subjects.join(', ')}` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* TEACHER: mostra info de quem vai ser o responsável, sem campo de seleção */
            <div className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
                  <UserCheck className="size-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Professor Responsável</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    A ocorrência será registrada em seu nome: <span className="font-medium text-foreground">{user?.username}</span>
                  </p>
                </div>
                <CheckCircle2 className="size-4 text-green-500 ml-auto" />
              </div>
            </div>
          )}

          {/* Tipo de Ocorrência */}
          <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${
            isAdmin ? (!selectedTeacherId ? 'opacity-40 pointer-events-none' : '')
                    : (!studentId ? 'opacity-40 pointer-events-none' : '')
          }`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${occurrenceType ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {occurrenceType ? <CheckCircle2 className="size-4" /> : String(typeStepNumber)}
              </div>
              <h3 className="text-sm font-semibold">Tipo de Ocorrência</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {OCCURRENCE_TYPES.map(type => {
                const Icon = type.icon
                return (
                  <button key={type.value} type="button" onClick={() => setOccurrenceType(type.value)}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-lg border text-center transition-all ${
                      occurrenceType === type.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:bg-muted'
                    }`}>
                    <Icon className={`size-5 ${occurrenceType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-xs font-medium text-foreground leading-tight">{type.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Detalhes */}
          <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${!occurrenceType ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${description.trim() ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                {description.trim() ? <CheckCircle2 className="size-4" /> : String(detailStepNumber)}
              </div>
              <h3 className="text-sm font-semibold">Detalhes</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Data da Ocorrência</label>
                <input type="date" value={date} max={todayISO()}
                  onChange={e => setDate(e.target.value)}
                  className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Descrição *</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)}
                  rows={4} placeholder="Descreva detalhadamente o ocorrido..."
                  className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none" />
                <p className="text-xs text-muted-foreground mt-1">{description.length} caracteres</p>
              </div>
            </div>
          </div>

          {/* Resumo */}
          {canSubmit && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Resumo</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Aluno:</span><span className="ml-2 font-medium">{selectedStudent?.name}</span></div>
                <div><span className="text-muted-foreground">Turma:</span><span className="ml-2 font-medium">{selectedGrade?.displayName}</span></div>
                <div><span className="text-muted-foreground">Tipo:</span><span className="ml-2">{occurrenceType && <OccurrenceBadge type={occurrenceType} />}</span></div>
                <div>
                  <span className="text-muted-foreground">Professor:</span>
                  <span className="ml-2 font-medium">
                    {isAdmin ? selectedTeacher?.name : user?.username}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Link to="/occurrences"
              className="h-10 px-5 text-sm border border-border rounded-lg hover:bg-muted transition-colors flex items-center">
              Cancelar
            </Link>
            <button type="submit" disabled={!canSubmit || createOccurrence.isPending}
              className="h-10 px-5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
              {createOccurrence.isPending ? (
                <><div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> Registrando...</>
              ) : 'Registrar Ocorrência'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}