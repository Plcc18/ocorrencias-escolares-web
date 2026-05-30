import { useState } from 'react'
import { useGrades } from '../../hooks/useGrades'
import { useTeachers } from '../../hooks/useTeachers'
import { useStudents } from '../../hooks/useStudents'
import { OccurrenceBadge } from '../common/OccurrenceBadge'
import { formatDate, formatDateTime } from '../../utils/format'
import { OCCURRENCE_TYPES } from '../../utils/occurrenceTypes'
import { occurrencesService } from '../../api/occurrences'
import type { Occurrence, OccurrenceType } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  X, Pencil, Save, User, GraduationCap, Users,
  Calendar, Clock, FileText, Tag, ChevronRight
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  occurrence: Occurrence
  onClose: () => void
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-muted-foreground">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <div className="text-sm text-foreground font-medium">{value}</div>
      </div>
    </div>
  )
}

export function OccurrenceDetailModal({ occurrence, onClose }: Props) {
  const { isAdmin, isTeacher } = useAuth()
  const canEdit = isAdmin || isTeacher
  const qc = useQueryClient()

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit form state
  const [description, setDescription] = useState(occurrence.description)
  const [occurrenceType, setOccurrenceType] = useState<OccurrenceType>(occurrence.occurrenceType)
  const [occurrenceDate, setOccurrenceDate] = useState(occurrence.occurrenceDate)
  const [teacherId, setTeacherId] = useState(occurrence.teacherId)

  const { data: teachers } = useTeachers({ enabled: canEdit })

  const handleSave = async () => {
    setSaving(true)
    try {
      await occurrencesService.update(occurrence.id, {
        description,
        occurrenceType,
        occurrenceDate,
        studentId: occurrence.studentId,
        teacherId,
      })
      qc.invalidateQueries({ queryKey: ['occurrences'] })
      toast.success('Ocorrência atualizada!')
      setEditing(false)
      // Update local display without closing
    } catch {
      // handled by interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setDescription(occurrence.description)
    setOccurrenceType(occurrence.occurrenceType)
    setOccurrenceDate(occurrence.occurrenceDate)
    setTeacherId(occurrence.teacherId)
    setEditing(false)
  }

  // Use updated values when in edit mode, original otherwise
  const displayDescription = editing ? description : occurrence.description
  const displayType = editing ? occurrenceType : occurrence.occurrenceType
  const displayDate = editing ? occurrenceDate : occurrence.occurrenceDate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-xl animate-fadeIn flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <OccurrenceBadge type={displayType} />
            <p className="text-sm font-semibold text-foreground truncate">
              {occurrence.studentName}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {canEdit && !editing && (
              <button
                onClick={() => setEditing(true)}
                className="h-8 px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="size-3.5" /> Editar
              </button>
            )}
            {editing && (
              <>
                <button
                  onClick={handleDiscard}
                  className="h-8 px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                >
                  Descartar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-8 px-3 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {saving ? (
                    <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Salvar
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-2">

          {/* Type selector (edit mode) */}
          {editing && (
            <div className="py-3 border-b border-border">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">Tipo de ocorrência</p>
              <div className="grid grid-cols-4 gap-1.5">
                {OCCURRENCE_TYPES.map(type => {
                  const Icon = type.icon
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setOccurrenceType(type.value)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border text-center transition-all ${
                        occurrenceType === type.value
                          ? 'border-primary bg-primary/5 ring-1 ring-primary'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <Icon className={`size-4.5 ${occurrenceType === type.value ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="text-xs font-medium leading-tight">{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <InfoRow
            icon={<User className="size-4" />}
            label="Aluno"
            value={
              <div>
                <span>{occurrence.studentName}</span>
                <span className="text-xs text-muted-foreground ml-2 font-normal">
                  <ChevronRight className="size-3 inline -mt-px" /> {occurrence.gradeName}
                </span>
              </div>
            }
          />

          <InfoRow
            icon={<GraduationCap className="size-4" />}
            label="Turma"
            value={occurrence.gradeName}
          />

          <InfoRow
            icon={<Users className="size-4" />}
            label="Professor"
            value={
              editing ? (
                <select
                  value={teacherId}
                  onChange={e => setTeacherId(Number(e.target.value))}
                  className="w-full h-8 px-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  {teachers?.map(t => (
                    <option key={t.id} value={t.id}>{t.name} — {t.subjects}</option>
                  ))}
                </select>
              ) : (
                occurrence.teacherName
              )
            }
          />

          <InfoRow
            icon={<Calendar className="size-4" />}
            label="Data da ocorrência"
            value={
              editing ? (
                <input
                  type="date"
                  value={occurrenceDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={e => setOccurrenceDate(e.target.value)}
                  className="h-8 px-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              ) : (
                formatDate(displayDate)
              )
            }
          />

          <InfoRow
            icon={<Tag className="size-4" />}
            label="Tipo"
            value={<OccurrenceBadge type={displayType} />}
          />

          <div className="py-3 border-b border-border last:border-0">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <FileText className="size-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1.5">Descrição</p>
                {editing ? (
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                  />
                ) : (
                  <p className="text-sm text-foreground leading-relaxed">{displayDescription}</p>
                )}
              </div>
            </div>
          </div>

          <InfoRow
            icon={<Clock className="size-4" />}
            label="Registrado em"
            value={
              <span className="text-muted-foreground font-normal">
                {formatDateTime(occurrence.createdAt)}
                {occurrence.updatedAt !== occurrence.createdAt && (
                  <span className="ml-2 text-xs">(editado {formatDateTime(occurrence.updatedAt)})</span>
                )}
              </span>
            }
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 rounded-b-2xl shrink-0">
          <p className="text-xs text-muted-foreground">ID #{occurrence.id}</p>
        </div>
      </div>
    </div>
  )
}