import { useState, useMemo } from 'react'
import { useGrades } from '../hooks/useGrades'
import { useStudents } from '../hooks/useStudents'
import { useBulkPromote } from '../hooks/useEnrollment'
import { PageHeader } from '../components/common/PageHeader'
import { formatDate } from '../utils/format'
import { SHIFT_LABELS, SHIFT_COLORS } from '../utils/occurrenceTypes'
import type { PromotionResult } from '../types/enrollment'
import type { Grade } from '../types'
import {
  ArrowRight, GraduationCap, CheckCircle2, AlertCircle,
  Users, BookOpen, ChevronDown, X, RotateCcw, Sparkles
} from 'lucide-react'

const REASON_OPTIONS = [
  { value: 'PROMOCAO', label: '🎓 Promoção', desc: 'Aluno aprovado, avança de série' },
  { value: 'RETENCAO', label: '🔁 Retenção', desc: 'Aluno reprovado, repete ou vai para turma de retenção' },
  { value: 'TRANSFERENCIA', label: '↔️ Transferência', desc: 'Mudança de turma no mesmo período' },
] as const

type Reason = typeof REASON_OPTIONS[number]['value']

function GradeCard({
  grade,
  selected,
  onClick,
  label,
}: {
  grade: Grade
  selected: boolean
  onClick: () => void
  label: 'Origem' | 'Destino'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-primary/40 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            <BookOpen className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{grade.displayName}</p>
            <p className="text-xs text-muted-foreground">{grade.courseName}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SHIFT_COLORS[grade.shift] ?? 'bg-muted text-muted-foreground'}`}>
            {SHIFT_LABELS[grade.shift]}
          </span>
          {selected && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              label === 'Origem'
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                : 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
            }`}>
              {label}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function ResultPanel({ result, onReset }: { result: PromotionResult; onReset: () => void }) {
  const [showDetails, setShowDetails] = useState(false)
  return (
    <div className="animate-fadeIn space-y-4">
      <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <Sparkles className="size-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-green-800 dark:text-green-200">Promoção concluída!</h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Alunos movidos para <strong>{result.targetGradeName}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-green-950/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{result.promoted}</p>
            <p className="text-xs text-muted-foreground mt-1">promovidos</p>
          </div>
          <div className="bg-white dark:bg-green-950/50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">{result.skipped}</p>
            <p className="text-xs text-muted-foreground mt-1">ignorados</p>
          </div>
        </div>

        {result.promotedStudentNames.length > 0 && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="mt-4 flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400 hover:underline"
          >
            <ChevronDown className={`size-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
            {showDetails ? 'Ocultar' : 'Ver'} lista de alunos promovidos
          </button>
        )}

        {showDetails && (
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {result.promotedStudentNames.map((name, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-300">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        )}

        {result.skippedReasons.length > 0 && (
          <div className="mt-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1.5">
              <AlertCircle className="size-3.5" /> Ignorados
            </p>
            {result.skippedReasons.map((reason, i) => (
              <p key={i} className="text-xs text-orange-600 dark:text-orange-400">{reason}</p>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full h-10 border border-border rounded-xl text-sm hover:bg-muted transition-colors flex items-center justify-center gap-2 text-muted-foreground"
      >
        <RotateCcw className="size-4" /> Nova promoção
      </button>
    </div>
  )
}

export default function PromotionPage() {
  const { data: grades } = useGrades()
  const bulkPromote = useBulkPromote()

  const [sourceGradeId, setSourceGradeId] = useState<number | null>(null)
  const [targetGradeId, setTargetGradeId] = useState<number | null>(null)
  const [reason, setReason] = useState<Reason>('PROMOCAO')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<PromotionResult | null>(null)
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const sourceGrade = grades?.find(g => g.id === sourceGradeId)
  const targetGrade = grades?.find(g => g.id === targetGradeId)

  // Suggested targets: same course, next level, next year
  const suggestedTargets = useMemo(() => {
    if (!sourceGrade || !grades) return []
    return grades.filter(g =>
      g.courseId === sourceGrade.courseId &&
      g.gradeLevel === sourceGrade.gradeLevel + 1 &&
      g.schoolYear === sourceGrade.schoolYear + 1
    )
  }, [sourceGrade, grades])

  // Students preview for source grade
  const { data: studentsData } = useStudents({
    gradeId: sourceGradeId ?? undefined,
    status: 'ATIVO',
    size: 100,
  })
  const students = studentsData?.content ?? []

  const canProceed = sourceGradeId && targetGradeId && sourceGradeId !== targetGradeId
  const isCurrentYear = (year: number) => year === new Date().getFullYear()

  const handleSubmit = async () => {
    if (!sourceGradeId || !targetGradeId) return
    try {
      const res = await bulkPromote.mutateAsync({
        sourceGradeId,
        targetGradeId,
        reason,
        notes: notes || undefined,
      })
      setResult(res)
    } catch { /* handled */ }
  }

  const reset = () => {
    setSourceGradeId(null)
    setTargetGradeId(null)
    setReason('PROMOCAO')
    setNotes('')
    setResult(null)
    setStep(1)
  }

  // Group grades by year for display
  const gradesByYear = useMemo(() => {
    if (!grades) return {}
    const map: Record<number, Grade[]> = {}
    grades.forEach(g => {
      if (!map[g.schoolYear]) map[g.schoolYear] = []
      map[g.schoolYear].push(g)
    })
    return map
  }, [grades])

  const sortedYears = Object.keys(gradesByYear).map(Number).sort((a, b) => b - a)

  if (result) {
    return (
      <div className="flex flex-col flex-1 animate-fadeIn">
        <PageHeader title="Promoção de Alunos" description="Virada de ano letivo" />
        <div className="flex-1 p-6 max-w-lg">
          <ResultPanel result={result} onReset={reset} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader
        title="Promoção de Alunos"
        description="Move todos os alunos de uma turma para a turma do próximo ano"
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl space-y-6">

          {/* Informational banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
            <div className="shrink-0 mt-0.5">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">i</span>
              </div>
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <p className="font-semibold">Como funciona a promoção?</p>
              <p>Cada aluno promovido terá sua matrícula encerrada na turma de origem e uma nova matrícula aberta na turma destino. O histórico de ocorrências é preservado intacto — cada ocorrência continua mostrando a turma em que o aluno estava quando ela foi registrada.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Grade selection */}
            <div className="space-y-5">

              {/* Step 1: Source */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    sourceGradeId ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {sourceGradeId ? <CheckCircle2 className="size-4" /> : '1'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Turma de Origem</p>
                    <p className="text-xs text-muted-foreground">Qual turma será promovida?</p>
                  </div>
                  {sourceGradeId && (
                    <button onClick={() => { setSourceGradeId(null); setTargetGradeId(null) }}
                      className="ml-auto p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {sortedYears.map(year => (
                    <div key={year}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        {year}
                        {isCurrentYear(year) && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">atual</span>
                        )}
                      </p>
                      <div className="space-y-2">
                        {gradesByYear[year].map(grade => (
                          <GradeCard
                            key={grade.id}
                            grade={grade}
                            selected={sourceGradeId === grade.id}
                            onClick={() => {
                              setSourceGradeId(grade.id)
                              setTargetGradeId(null)
                            }}
                            label="Origem"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Target */}
              <div className={`bg-card border border-border rounded-2xl overflow-hidden transition-opacity ${!sourceGradeId ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    targetGradeId ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    {targetGradeId ? <CheckCircle2 className="size-4" /> : '2'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Turma Destino</p>
                    <p className="text-xs text-muted-foreground">Para onde os alunos serão movidos?</p>
                  </div>
                  {targetGradeId && (
                    <button onClick={() => setTargetGradeId(null)}
                      className="ml-auto p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground">
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                  {suggestedTargets.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Sparkles className="size-3" /> Sugeridas
                      </p>
                      <div className="space-y-2">
                        {suggestedTargets.map(grade => (
                          <GradeCard
                            key={grade.id}
                            grade={grade}
                            selected={targetGradeId === grade.id}
                            onClick={() => setTargetGradeId(grade.id)}
                            label="Destino"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {sortedYears.map(year => {
                    const available = gradesByYear[year].filter(g => g.id !== sourceGradeId)
                    if (!available.length) return null
                    return (
                      <div key={year}>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{year}</p>
                        <div className="space-y-2">
                          {available.map(grade => (
                            <GradeCard
                              key={grade.id}
                              grade={grade}
                              selected={targetGradeId === grade.id}
                              onClick={() => setTargetGradeId(grade.id)}
                              label="Destino"
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Summary & Confirm */}
            <div className="space-y-4">

              {/* Students preview */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
                  <Users className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">
                    {sourceGrade
                      ? `Alunos ativos em ${sourceGrade.displayName}`
                      : 'Alunos da turma de origem'}
                  </p>
                  {students.length > 0 && (
                    <span className="ml-auto text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {students.length}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-border max-h-52 overflow-y-auto">
                  {!sourceGradeId ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Selecione uma turma de origem
                    </div>
                  ) : students.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                      Nenhum aluno ativo nesta turma
                    </div>
                  ) : (
                    students.map(s => (
                      <div key={s.id} className="px-5 py-2.5 flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <GraduationCap className="size-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.enrollment}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Flow preview */}
              {canProceed && (
                <div className="bg-card border border-border rounded-2xl p-5 animate-fadeIn">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Resumo da operação</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 text-center p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl">
                      <p className="text-xs text-orange-500 font-medium mb-1">De</p>
                      <p className="text-sm font-bold text-foreground">{sourceGrade?.displayName}</p>
                      <p className="text-xs text-muted-foreground">{sourceGrade?.courseAcronym}</p>
                    </div>
                    <ArrowRight className="size-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 text-center p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                      <p className="text-xs text-green-600 font-medium mb-1">Para</p>
                      <p className="text-sm font-bold text-foreground">{targetGrade?.displayName}</p>
                      <p className="text-xs text-muted-foreground">{targetGrade?.courseAcronym}</p>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{students.length}</span> aluno(s) serão movidos
                    </p>
                  </div>

                  {/* Reason */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Motivo</p>
                    <div className="space-y-2">
                      {REASON_OPTIONS.map(r => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setReason(r.value)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                            reason === r.value
                              ? 'border-primary bg-primary/5 ring-1 ring-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          <p className="font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-4">
                    <label className="text-sm font-medium mb-1.5 block">Observações (opcional)</label>
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={2}
                      placeholder="Ex: Turma aprovada com média geral 7.8"
                      className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={bulkPromote.isPending}
                    className="mt-4 w-full h-11 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {bulkPromote.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Promovendo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Promover {students.length} aluno(s)
                      </>
                    )}
                  </button>
                </div>
              )}

              {!canProceed && (
                <div className="bg-muted/40 border border-dashed border-border rounded-2xl p-8 text-center">
                  <ArrowRight className="size-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground">
                    Selecione turma de origem e destino para continuar
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}