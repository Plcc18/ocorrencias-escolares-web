import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  LayoutDashboard,
  GraduationCap,
  FileWarning,
  Users,
  BookOpen,
  BookMarked,
  LogOut,
  ChevronRight,
  School,
  TrendingUp,
} from 'lucide-react'
import { getInitials } from '../utils/format'
import { cn } from '../lib/utils'
import { ProfilePanel } from '../components/profile/ProfilePanel'

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
}

function NavItem({ to, icon, label }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight className="size-3.5 opacity-0 group-[.active]:opacity-100 transition-opacity" />
    </NavLink>
  )
}

export function AppLayout() {
  const { user, isAdmin, isTeacher, logout } = useAuth()
  const navigate = useNavigate()
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <School className="size-4 text-sidebar-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-sidebar-foreground leading-none">EscolaGestão</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Ocorrências</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
          <NavItem to="/dashboard"   icon={<LayoutDashboard className="size-4" />} label="Dashboard" />
          <NavItem to="/occurrences" icon={<FileWarning className="size-4" />}     label="Ocorrências" />
          <NavItem to="/students"    icon={<GraduationCap className="size-4" />}   label="Alunos" />

          {/* Turmas e cursos: ADMIN e TEACHER podem ver */}
          {(isAdmin || isTeacher) && (
            <>
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                {isAdmin ? 'Administração' : 'Escola'}
              </p>
              <NavItem to="/courses" icon={<BookMarked className="size-4" />} label="Cursos" />
              <NavItem to="/grades"  icon={<BookOpen className="size-4" />}   label="Turmas" />
            </>
          )}

          {/* Somente ADMIN */}
          {isAdmin && (
            <>
              <NavItem to="/teachers"  icon={<Users className="size-4" />}       label="Professores" />
              <NavItem to="/promotion" icon={<TrendingUp className="size-4" />}  label="Promoções" />
            </>
          )}
        </nav>

        {/* User footer — clicável para abrir perfil */}
        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent transition-colors text-left group"
          >
            <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-sidebar-primary-foreground">
                {/* user.username é o nome real — getDisplayName() no backend */}
                {user?.username ? getInitials(user.username) : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate leading-none">
                {user?.username}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
            </div>
            <ChevronRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto flex flex-col">
        <Outlet />
      </main>

      {/* Profile Panel */}
      {showProfile && (
        <ProfilePanel onClose={() => setShowProfile(false)} />
      )}
    </div>
  )
}