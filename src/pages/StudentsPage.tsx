import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  useStudents,
  useCreateStudent,
  useUpdateStudent,
  useDeleteStudent,
} from '../hooks/useStudents';
import { useGrades } from '../hooks/useGrades';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { PageHeader } from '../components/common/PageHeader';
import { STUDENT_SHIFTS } from '../utils/occurrenceTypes';
import { todayISO } from '../utils/format';
import type { Student, StudentDTO, StudentFilters, GradeShift } from '../types';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CustomSelect } from '../components/common/CustomSelect';
import toast from 'react-hot-toast';

const INITIAL_FORM: StudentDTO = {
  name: '',
  enrollment: '',
  gradeId: 0,
  shift: 'MANHA',
  status: 'ATIVO',
  email: '',
  birthDate: '',
  guardian: '',
  guardianPhone: '',
  guardianEmail: '',
  notes: '',
};

export default function StudentsPage() {
  const { isAdmin } = useAuth();
  const [searchParams] = useSearchParams();
  const initialGradeId = searchParams.get('gradeId')
    ? Number(searchParams.get('gradeId'))
    : undefined;

  const [filters, setFilters] = useState<StudentFilters>({
    page: 0,
    size: 15,
    gradeId: initialGradeId,
  });
  // single search field covers both name and enrollment
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<StudentDTO>(INITIAL_FORM);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const { data, isLoading } = useStudents({ ...filters, name: search || undefined });
  const { data: grades } = useGrades();
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();

  const students = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = filters.page ?? 0;

  const selectedGrade = grades?.find((g) => g.id === form.gradeId);
  const isBirthDateFuture = !!form.birthDate && form.birthDate > todayISO();
  const hasInvalidGuardianPhone =
    !!form.guardianPhone && form.guardianPhone.replace(/\D/g, '').length < 10;

  const openCreate = () => {
    setViewing(null);
    setEditing(null);
    setForm(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setViewing(null);
    setEditing(student);
    setForm({
      name: student.name,
      enrollment: student.enrollment,
      gradeId: student.gradeId,
      shift: student.shift,
      status: student.status,
      email: student.email ?? '',
      birthDate: student.birthDate ?? '',
      guardian: student.guardian ?? '',
      guardianPhone: student.guardianPhone ?? '',
      guardianEmail: student.guardianEmail ?? '',
      notes: student.notes ?? '',
    });
    setShowModal(true);
  };

  const openView = (student: Student) => {
    setViewing(student);
    setEditing(null);
    setForm({
      name: student.name,
      enrollment: student.enrollment,
      gradeId: student.gradeId,
      shift: student.shift,
      status: student.status,
      email: student.email ?? '',
      birthDate: student.birthDate ?? '',
      guardian: student.guardian ?? '',
      guardianPhone: student.guardianPhone ?? '',
      guardianEmail: student.guardianEmail ?? '',
      notes: student.notes ?? '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.gradeId || form.gradeId === 0) {
      toast.error('Selecione uma turma.');
      return;
    }
    if (isBirthDateFuture) {
      toast.error('A data de nascimento não pode ser futura.');
      return;
    }
    if (hasInvalidGuardianPhone) {
      toast.error('Informe um telefone de responsável válido.');
      return;
    }
    const payload = {
      ...form,
      name: form.name.trim(),
      enrollment: form.enrollment.trim(),
      email: form.email?.trim(),
      guardian: form.guardian?.trim(),
      guardianPhone: form.guardianPhone?.trim(),
      guardianEmail: form.guardianEmail?.trim(),
      notes: form.notes?.trim(),
    };
    try {
      if (editing) {
        await updateStudent.mutateAsync({ id: editing.id, data: payload });
      } else {
        await createStudent.mutateAsync(payload);
      }
      setShowModal(false);
    } catch {
      /* handled by interceptor */
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent.mutateAsync(id);
      setConfirmDelete(null);
    } catch {
      /* handled */
    }
  };

  const isBusy = createStudent.isPending || updateStudent.isPending;

  return (
    <div className="flex flex-col flex-1 animate-fadeIn">
      <PageHeader title="Alunos" description={`${data?.totalElements ?? 0} cadastrado(s)`}>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="h-8 px-3 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
          >
            <Plus className="size-4" /> Novo Aluno
          </button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-border bg-background flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFilters((f) => ({ ...f, page: 0 }));
            }}
            placeholder="Buscar por nome ou matrícula..."
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
        <CustomSelect
          value={filters.gradeId ?? ''}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              gradeId: e.target.value ? Number(e.target.value) : undefined,
              page: 0,
            }))
          }
          className="w-56"
          placeholder="Todas as turmas"
          variant="outline"
        >
          {grades?.map((g) => (
            <option key={g.id} value={g.id}>
              {g.displayName} — {g.courseAcronym}
            </option>
          ))}
        </CustomSelect>
        <CustomSelect
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value || undefined, page: 0 }))
          }
          className="w-40"
          placeholder="Todos os status"
          variant="outline"
        >
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </CustomSelect>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="divide-y divide-border">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4">
                <div className="h-4 w-40 skeleton-shimmer rounded" />
                <div className="h-4 w-24 skeleton-shimmer rounded" />
                <div className="h-4 w-20 skeleton-shimmer rounded" />
                <div className="h-5 w-14 skeleton-shimmer rounded-full ml-auto" />
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <EmptyState
            icon={<GraduationCap className="size-6" />}
            title="Nenhum aluno encontrado"
            description={
              search
                ? `Nenhum resultado para "${search}". Tente o nome completo ou a matrícula exata.`
                : 'Cadastre o primeiro aluno.'
            }
            action={
              isAdmin ? (
                <button
                  onClick={openCreate}
                  className="h-8 px-3 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90"
                >
                  <Plus className="size-3.5 inline mr-1" /> Cadastrar
                </button>
              ) : undefined
            }
          />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left font-medium text-muted-foreground">Aluno</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Matrícula</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Turma</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Curso</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Turno</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Responsável
                </th>
                {isAdmin && (
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.map((student) => (
                <tr
                  key={student.id}
                  onClick={() => openView(student)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-3.5">
                    <p className="font-medium text-foreground">{student.name}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-mono text-xs">
                    {student.enrollment}
                  </td>
                  <td className="px-4 py-3.5 text-foreground">{student.gradeName}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {student.courseAcronym}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground">{student.shift}</td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground text-xs">
                    {student.guardian || '-'}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(student);
                          }}
                          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(student.id);
                          }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-border flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Página {currentPage + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 0}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) - 1 }))}
              className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 0) + 1 }))}
              className="h-7 w-7 flex items-center justify-center rounded border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal (view / edit / create) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-xl animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold">
                {viewing ? 'Detalhes do Aluno' : editing ? 'Editar Aluno' : 'Novo Aluno'}
              </h3>
              <div className="flex items-center gap-2">
                {/* ADMIN can switch from view to edit */}
                {viewing && isAdmin && (
                  <button
                    onClick={() => {
                      openEdit(viewing);
                    }}
                    className="h-8 px-3 text-xs border border-border rounded-lg hover:bg-muted transition-colors flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="size-3.5" /> Editar
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="overflow-y-auto">
              <fieldset disabled={!!viewing} className="p-6 grid grid-cols-2 gap-4 border-none m-0">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1.5 block">Nome Completo *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="Nome do aluno"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Matrícula *</label>
                  <input
                    required
                    value={form.enrollment}
                    onChange={(e) => setForm((f) => ({ ...f, enrollment: e.target.value }))}
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono"
                    placeholder="Ex: 2024001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Turma *</label>
                  <CustomSelect
                    required
                    value={form.gradeId || ''}
                    onChange={(e) => {
                      const gradeId = Number(e.target.value);
                      const grade = grades?.find((g) => g.id === gradeId);
                      setForm((f) => ({
                        ...f,
                        gradeId,
                        ...(grade && { shift: grade.shift as GradeShift }),
                      }));
                    }}
                    className="w-full"
                    placeholder="Selecionar turma"
                  >
                    {grades?.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.displayName}
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                {selectedGrade && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        Curso
                      </label>
                      <div className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted/40 flex items-center text-muted-foreground overflow-hidden">
                        <span className="font-medium text-foreground mr-2">
                          {selectedGrade.courseAcronym}
                        </span>
                        <span className="truncate">{selectedGrade.courseName}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block text-muted-foreground">
                        Turno
                      </label>
                      <div className="w-full h-9 px-3 border border-border rounded-lg text-sm bg-muted/40 flex items-center text-foreground font-medium">
                        {STUDENT_SHIFTS.find((s) => s.value === selectedGrade.shift)?.label ||
                          selectedGrade.shift}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                    placeholder="aluno@email.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Data de Nascimento *</label>
                  <input
                    type="date"
                    required
                    value={form.birthDate}
                    max={todayISO()}
                    onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                    aria-invalid={isBirthDateFuture}
                    className={`w-full h-9 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                      isBirthDateFuture
                        ? 'border-destructive text-destructive focus:ring-destructive/30'
                        : 'border-input'
                    }`}
                  />
                  {isBirthDateFuture && (
                    <p className="text-xs text-destructive mt-1">
                      A data deve ser de hoje ou anterior.
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <CustomSelect
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: String(e.target.value) }))}
                    className="w-full"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                  </CustomSelect>
                </div>

                <div className="col-span-2 border-t border-border pt-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Responsável
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Nome *</label>
                      <input
                        required
                        maxLength={100}
                        value={form.guardian}
                        onChange={(e) => setForm((f) => ({ ...f, guardian: e.target.value }))}
                        className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Telefone *</label>
                      <input
                        required
                        maxLength={20}
                        value={form.guardianPhone}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '');
                          if (v.length > 11) v = v.substring(0, 11);
                          let formatted = v;
                          if (v.length > 2) formatted = `(${v.substring(0, 2)}) ${v.substring(2)}`;
                          if (v.length > 6) {
                            const prefixLen = v.length === 11 ? 5 : 4;
                            formatted = `(${v.substring(0, 2)}) ${v.substring(
                              2,
                              2 + prefixLen,
                            )}-${v.substring(2 + prefixLen)}`;
                          }
                          setForm((f) => ({ ...f, guardianPhone: formatted }));
                        }}
                        placeholder="(00) 00000-0000"
                        aria-invalid={hasInvalidGuardianPhone}
                        className={`w-full h-9 px-3 border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50 ${
                          hasInvalidGuardianPhone
                            ? 'border-destructive text-destructive focus:ring-destructive/30'
                            : 'border-input'
                        }`}
                      />
                      {hasInvalidGuardianPhone && (
                        <p className="text-xs text-destructive mt-1">Informe DDD e telefone.</p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Email *</label>
                      <input
                        type="email"
                        required
                        maxLength={100}
                        value={form.guardianEmail}
                        onChange={(e) => setForm((f) => ({ ...f, guardianEmail: e.target.value }))}
                        className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                        placeholder="responsavel@email.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Observações</label>
                      <input
                        value={form.notes}
                        onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        className="w-full h-9 px-3 border border-input rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring/50"
                        placeholder="Observações adicionais"
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-9 px-4 text-sm border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  {viewing ? 'Fechar' : 'Cancelar'}
                </button>
                {!viewing && isAdmin && (
                  <button
                    type="submit"
                    disabled={isBusy}
                    className="h-9 px-4 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                  >
                    {isBusy ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />{' '}
                        Salvando...
                      </>
                    ) : editing ? (
                      'Salvar Alterações'
                    ) : (
                      'Cadastrar Aluno'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm shadow-xl animate-fadeIn">
            <h3 className="font-semibold text-foreground mb-2">Remover aluno?</h3>
            <p className="text-sm text-muted-foreground mb-5">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="h-8 px-3 text-sm border border-border rounded-lg hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleteStudent.isPending}
                className="h-8 px-3 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {deleteStudent.isPending ? 'Removendo...' : 'Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
