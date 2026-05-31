import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useOccurrences } from '../hooks/useOccurrences';
import { useStudents } from '../hooks/useStudents';
import { useTeachers } from '../hooks/useTeachers';
import { useGrades } from '../hooks/useGrades';
import { OccurrenceBadge } from '../components/common/OccurrenceBadge';
import { OccurrenceDetailModal } from '../components/occurrences/OccurrenceDetailModal';
import { formatDate, todayISO } from '../utils/format';
import { OCCURRENCE_TYPE_MAP } from '../utils/occurrenceTypes';
import type { Occurrence } from '../types';
import { FileWarning, GraduationCap, Users, BookOpen, TrendingUp, Clock, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  loading?: boolean;
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        {loading ? (
          <div className="h-7 w-16 mt-1 skeleton-shimmer rounded" />
        ) : (
          <p className="text-2xl font-semibold text-foreground mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { data: occurrencesData, isLoading: loadingOcc } = useOccurrences({ size: 50 });
  const { data: studentsData, isLoading: loadingStudents } = useStudents({});
  const { data: teachers, isLoading: loadingTeachers } = useTeachers({ enabled: isAdmin });
  const { data: grades, isLoading: loadingGrades } = useGrades({ enabled: isAdmin });

  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);

  const occurrenceSample = occurrencesData?.content ?? [];
  const recentOccurrences = occurrenceSample.slice(0, 5);
  const totalStudents = studentsData?.totalElements ?? 0;
  const totalOccurrences = occurrencesData?.totalElements ?? 0;
  const todayOccurrences = occurrenceSample.filter(
    (occ) => occ.occurrenceDate === todayISO(),
  ).length;
  const typeSummary = Object.entries(
    occurrenceSample.reduce<Record<string, number>>((acc, occ) => {
      acc[occ.occurrenceType] = (acc[occ.occurrenceType] ?? 0) + 1;
      return acc;
    }, {}),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0">
        <div>
          <h2 className="text-base font-semibold text-sidebar-foreground leading-none">
            {greeting()}, {user?.username?.split(' ')[0]}
          </h2>
          <p className="text-sm text-sidebar-foreground/65 mt-0.5">Visão geral do sistema</p>
        </div>
        <Link
          to="/occurrences/new"
          className="h-8 px-3 bg-sidebar-primary text-sidebar-primary-foreground text-sm font-medium rounded-lg hover:bg-sidebar-primary/90 transition-colors flex items-center gap-1.5"
        >
          <Plus className="size-4" /> Nova Ocorrência
        </Link>
      </div>

      <div className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total de Ocorrências"
            value={totalOccurrences}
            icon={<FileWarning className="size-5 text-primary" />}
            color="bg-primary/10"
            loading={loadingOcc}
          />
          <StatCard
            label="Alunos Cadastrados"
            value={totalStudents}
            icon={<GraduationCap className="size-5 text-emerald-700 dark:text-emerald-300" />}
            color="bg-emerald-50 dark:bg-emerald-950"
            loading={loadingStudents}
          />
          <StatCard
            label="Ocorrências Hoje"
            value={todayOccurrences}
            icon={<Clock className="size-5 text-teal-700 dark:text-teal-300" />}
            color="bg-teal-50 dark:bg-teal-950"
            loading={loadingOcc}
          />
          {isAdmin && (
            <>
              <StatCard
                label="Professores"
                value={teachers?.length ?? 0}
                icon={<Users className="size-5 text-cyan-700 dark:text-cyan-300" />}
                color="bg-cyan-50 dark:bg-cyan-950"
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

        {/* Tipos mais registrados */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tipos mais registrados</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Com base nas ocorrências mais recentes
              </p>
            </div>
          </div>

          {loadingOcc ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 skeleton-shimmer rounded-lg" />
              ))}
            </div>
          ) : typeSummary.length === 0 ? (
            <div className="px-5 py-8 text-sm text-muted-foreground text-center">
              Ainda não há dados para comparar.
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-5">
              {typeSummary.map(([type, count]) => {
                const info = OCCURRENCE_TYPE_MAP[type as keyof typeof OCCURRENCE_TYPE_MAP];
                return (
                  <div key={type} className="border border-border rounded-lg p-3 bg-background">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {info?.label ?? type}
                      </span>
                      <span className="text-lg font-semibold text-primary">{count}</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            100,
                            (count / Math.max(...typeSummary.map(([, value]) => value))) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Turmas com mais ocorrências (separado) */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Turmas com mais ocorrências</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Top turmas por número de ocorrências
              </p>
            </div>
            <div className="text-xs text-muted-foreground">Top 5</div>
          </div>

          {loadingOcc ? (
            <div className="p-5 space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 skeleton-shimmer rounded" />
              ))}
            </div>
          ) : (
            <div className="p-5 space-y-3">
              {(() => {
                const gradeSummary = Object.entries(
                  occurrenceSample.reduce<Record<string, number>>((acc, occ) => {
                    const key = occ.gradeName || '—';
                    acc[key] = (acc[key] ?? 0) + 1;
                    return acc;
                  }, {}),
                )
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 5);

                const maxCount = Math.max(1, ...gradeSummary.map(([, v]) => v));

                return gradeSummary.map(([grade, count], idx) => (
                  <div key={grade} className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{grade}</p>
                      <p className="text-xs text-muted-foreground">
                        {count} ocorrênc{count === 1 ? 'ia' : 'ias'}
                      </p>
                    </div>
                    <div className="w-24 ml-3">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.round((count / maxCount) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ));
              })()}
            </div>
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
              {recentOccurrences.map((occ) => (
                <button
                  key={occ.id}
                  onClick={() => setSelectedOccurrence(occ)}
                  className="w-full text-left px-5 py-3.5 flex items-center gap-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {occ.studentName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {occ.gradeName} • {occ.teacherName}
                    </p>
                  </div>
                  <OccurrenceBadge type={occ.occurrenceType} />
                  <p className="text-xs text-muted-foreground shrink-0">
                    {formatDate(occ.occurrenceDate)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOccurrence && (
        <OccurrenceDetailModal
          occurrence={selectedOccurrence}
          onClose={() => setSelectedOccurrence(null)}
        />
      )}
    </div>
  );
}
