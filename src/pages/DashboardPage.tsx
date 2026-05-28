import { useAuth } from '../contexts/AuthContext'
import { useOccurrences } from '../hooks/useOccurrences'
import { useStudents } from '../hooks/useStudents'
import { useTeachers } from '../hooks/useTeachers'
import { useGrades } from '../hooks/useGrades'
import { OccurrenceBadge } from '../components/common/OccurrenceBadge'
import { formatDate } from '../utils/format'
import { FileWarning, GraduationCap, Users, BookOpen, TrendingUp, Clock, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  loading?: boolean
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <div className="h-7 w-16 mt-1 skeleton-shimmer rounded" />
        ) : (
          <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth()
  const { data: occurrencesData, isLoading: loadingOcc } = useOccurrences({ size: 5 })
  const { data: studentsData, isLoading: loadingStudents } = useStudents({})
  const { data: teachers, isLoading: loadingTeachers } = useTeachers()
  const { data: grades, isLoading: loadingGrades } = useGrades()

  const recentOccurrences = occurrencesData?.content ?? []
  const totalStudents = studentsData?.totalElements ?? 0
  const totalOccurrences = occurrencesData?.totalElements ?? 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Bom dia'
    if (h < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-background shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground leading-none">
            {greeting()}, {user?.username?.split(' ')[0]}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Visão geral do sistema</p>
        </div>
        <Link
          to="/occurrences/new"
          className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Nova Ocorrência
        </Link>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total de Ocorrências"
            value={totalOccurrences}
            icon={<FileWarning className="size-5 text-orange-600" />}
            color="bg-orange-50 dark:bg-orange-950"
            loading={loadingOcc}
          />
          <StatCard
            label="Alunos Cadastrados"
            value={totalStudents}
            icon={<GraduationCap className="size-5 text-blue-600" />}
            color="bg-blue-50 dark:bg-blue-950"
            loading={loadingStudents}
          />
          {isAdmin && (
            <>
              <StatCard
                label="Professores"
                value={teachers?.length ?? 0}
                icon={<Users className="size-5 text-purple-600" />}
                color="bg-purple-50 dark:bg-purple-950"
                loading={loadingTeachers}
              />
              <StatCard
                label="Turmas"
                value={grades?.length ?? 0}
                icon={<BookOpen className="size-5 text-green-600" />}
                color="bg-green-50 dark:bg-green-950"
                loading={loadingGrades}
              />
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Ocorrências Recentes</h3>
            </div>
            <Link to="/occurrences" className="text-xs text-primary hover:underline">
              Ver todas →
            </Link>
          </div>

          {loadingOcc ? (
            <div className="divide-y divide-border">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4">
                  <div className="h-4 w-32 skeleton-shimmer rounded" />
                  <div className="h-5 w-20 skeleton-shimmer rounded-full" />
                  <div className="h-4 w-24 skeleton-shimmer rounded ml-auto" />
                </div>
              ))}
            </div>
          ) : recentOccurrences.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <TrendingUp className="size-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhuma ocorrência registrada</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentOccurrences.map(occ => (
                <div key={occ.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{occ.studentName}</p>
                    <p className="text-xs text-muted-foreground truncate">{occ.gradeName} • {occ.teacherName}</p>
                  </div>
                  <OccurrenceBadge type={occ.occurrenceType} />
                  <p className="text-xs text-muted-foreground shrink-0">{formatDate(occ.occurrenceDate)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
