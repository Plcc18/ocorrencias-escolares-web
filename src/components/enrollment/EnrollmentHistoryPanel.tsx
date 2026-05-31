import { useEnrollmentHistory } from '../../hooks/useEnrollment';
import { useGrades } from '../../hooks/useGrades';
import { usePromoteStudent } from '../../hooks/useEnrollment';
import { formatDate } from '../../utils/format';
import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Clock, GraduationCap, X } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';

const REASON_LABELS: Record<string, { label: string; color: string }> = {
  MATRICULA: {
    label: 'Matrícula inicial',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  PROMOCAO: {
    label: 'Promoção',
    color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  },
  RETENCAO: {
    label: 'Retenção',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
  },
  TRANSFERENCIA: {
    label: 'Transferência',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  },
  CANCELAMENTO: {
    label: 'Cancelamento',
    color: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  },
};

interface Props {
  studentId: number;
  studentName: string;
  currentGradeId: number;
}

export function EnrollmentHistoryPanel({ studentId, studentName, currentGradeId }: Props) {
  const { data: history, isLoading } = useEnrollmentHistory(studentId);
  const { data: grades } = useGrades();
  const promoteStudent = usePromoteStudent();

  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [targetGradeId, setTargetGradeId] = useState<number | null>(null);
  const [reason, setReason] = useState<string>('PROMOCAO');
  const [notes, setNotes] = useState('');

  const currentGrade = grades?.find((g) => g.id === currentGradeId);
  // Suggest grades that are natural next step
  const suggestedGrades =
    grades?.filter(
      (g) =>
        g.id !== currentGradeId &&
        (currentGrade
          ? g.courseId === currentGrade.courseId && g.gradeLevel === currentGrade.gradeLevel + 1
          : true),
    ) ?? [];

  const otherGrades =
    grades?.filter((g) => g.id !== currentGradeId && !suggestedGrades.find((s) => s.id === g.id)) ??
    [];

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetGradeId) return;
    try {
      await promoteStudent.mutateAsync({
        studentId,
        data: { targetGradeId, reason: reason as import('../../types/enrollment').EnrollmentReason, notes: notes || undefined },
      });
      setShowPromoteModal(false);
      setTargetGradeId(null);
      setNotes('');
    } catch {
      /* handled */
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Histórico de Matrículas</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Trajetória escolar de {studentName}
          </p>
        </div>
        <button
          onClick={() => setShowPromoteModal(true)}
          className="h-8 px-3 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <GraduationCap className="size-3.5" /> Promover
        </button>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 skeleton-shimmer rounded-xl" />
          ))}
        </div>
      ) : !history?.length ? (
        <div className="py-6 text-center text-sm text-muted-foreground bg-muted/30 rounded-xl">
          Nenhum histórico encontrado
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" />

          <div className="space-y-3">
            {history.map((entry, _idx) => {
              const reasonInfo = REASON_LABELS[entry.reason] ?? {
                label: entry.reason,
                color: 'bg-muted text-muted-foreground',
              };
              return (
                <div key={entry.id} className="flex gap-3 relative">
                  {/* Timeline dot */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 border-2 border-background ${
                      entry.active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {entry.active ? (
                      <CheckCircle2 className="size-4" />
                    ) : (
                      <BookOpen className="size-4" />
                    )}
                  </div>

                  <div
                    className={`flex-1 rounded-xl p-3 border ${
                      entry.active ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{entry.gradeName}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.courseAcronym} · {formatDate(entry.startDate)}
                          {entry.endDate ? ` → ${formatDate(entry.endDate)}` : ' → atual'}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${reasonInfo.color}`}
                      >
                        {reasonInfo.label}
                      </span>
                    </div>
                    {entry.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic">
                        &ldquo;{entry.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-semibold">Promover {studentName}</h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handlePromote}>
              <div className="p-5 space-y-4">
                {/* Current grade */}
                {currentGrade && (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/50 rounded-xl text-sm">
                    <Clock className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Atual:</span>
                    <span className="font-semibold">{currentGrade.displayName}</span>
                    <ArrowRight className="size-3.5 text-muted-foreground ml-auto" />
                  </div>
                )}

                {/* Target grade */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Turma destino *</label>
                  {suggestedGrades.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground mb-1.5">
                        Sugeridas (próxima série):
                      </p>
                      <div className="space-y-1.5">
                        {suggestedGrades.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setTargetGradeId(g.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                              targetGradeId === g.id
                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            <span className="font-medium">{g.displayName}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {g.courseAcronym}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {otherGrades.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">Outras turmas:</p>
                      <CustomSelect
                        value={targetGradeId ?? ''}
                        onChange={(e) =>
                          setTargetGradeId(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-full"
                        placeholder="Selecionar outra turma..."
                      >
                        {otherGrades.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.displayName} — {g.courseAcronym}
                          </option>
                        ))}
                      </CustomSelect>
                    </div>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Motivo</label>
                  <CustomSelect
                    value={reason}
                    onChange={(e) => setReason(String(e.target.value))}
                    className="w-full"
                  >
                    <option value="PROMOCAO">Promoção (aprovado)</option>
                    <option value="RETENCAO">Retenção (reprovado)</option>
                    <option value="TRANSFERENCIA">Transferência</option>
                  </CustomSelect>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Observações</label>
                  <input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Opcional"
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 px-5 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowPromoteModal(false)}
                  className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetGradeId || promoteStudent.isPending}
                  className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                >
                  {promoteStudent.isPending ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Promovendo...
                    </>
                  ) : (
                    <>
                      <GraduationCap className="size-3.5" />
                      Confirmar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
