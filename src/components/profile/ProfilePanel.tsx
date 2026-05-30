import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatDateTime } from '../../utils/format'
import { getInitials } from '../../utils/format'
import { X, LogOut, User, Mail, Shield, Calendar } from 'lucide-react'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  ADMIN:   { label: 'Administrador', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  TEACHER: { label: 'Professor',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  STUDENT: { label: 'Aluno',         color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' },
}

interface Props {
  onClose: () => void
}

export function ProfilePanel({ onClose }: Props) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const roleInfo = ROLE_LABELS[user.role] ?? { label: user.role, color: 'bg-muted text-muted-foreground' }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Panel — slides in from left over the sidebar */}
      <div className="fixed left-0 top-0 h-full w-72 z-50 bg-card border-r border-border shadow-2xl flex flex-col animate-slideInLeft">

        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border shrink-0">
          <h2 className="text-sm font-semibold text-foreground">Meu Perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="text-lg font-bold text-primary-foreground">
                {getInitials(user.username)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground leading-tight truncate">
                {user.username}
              </p>
              <span className={`inline-flex items-center gap-1 mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
                <Shield className="size-3" />
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        {/* Info rows */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Informações da conta
            </p>

            <InfoRow
              icon={<User className="size-3.5" />}
              label="Nome"
              value={user.username}
            />

            <InfoRow
              icon={<Mail className="size-3.5" />}
              label="Email"
              value={user.email}
            />

            <InfoRow
              icon={<Shield className="size-3.5" />}
              label="Perfil de acesso"
              value={
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              }
            />

            {user.createdAt && (
              <InfoRow
                icon={<Calendar className="size-3.5" />}
                label="Conta criada em"
                value={
                  <span className="text-muted-foreground font-normal">
                    {formatDateTime(user.createdAt)}
                  </span>
                }
              />
            )}
          </div>

          {/* Permissions summary */}
          <div className="px-5 py-4 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Permissões
            </p>
            <div className="space-y-2">
              {getPermissions(user.role).map((perm, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${perm.allowed ? 'bg-green-500' : 'bg-muted-foreground/30'}`} />
                  <span className={perm.allowed ? 'text-foreground' : 'text-muted-foreground/60 line-through'}>
                    {perm.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: logout */}
        <div className="p-4 border-t border-border shrink-0">
          <button
            onClick={handleLogout}
            className="w-full h-9 flex items-center justify-center gap-2 text-sm font-medium text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="size-4" />
            Sair da conta
          </button>
        </div>
      </div>
    </>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-sm font-medium text-foreground truncate">{value}</div>
      </div>
    </div>
  )
}

function getPermissions(role: string) {
  const all = [
    { label: 'Registrar ocorrências',    allowed: role === 'ADMIN' || role === 'TEACHER' },
    { label: 'Visualizar ocorrências',   allowed: true },
    { label: 'Gerenciar alunos',         allowed: role === 'ADMIN' },
    { label: 'Visualizar alunos',        allowed: role === 'ADMIN' || role === 'TEACHER' },
    { label: 'Visualizar turmas e cursos', allowed: role === 'ADMIN' || role === 'TEACHER' },
    { label: 'Gerenciar professores',    allowed: role === 'ADMIN' },
    { label: 'Gerenciar turmas e cursos', allowed: role === 'ADMIN' },
    { label: 'Promoção de alunos',       allowed: role === 'ADMIN' },
  ]
  return all
}