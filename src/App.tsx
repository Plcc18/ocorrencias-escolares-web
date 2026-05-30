import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { AuthGuard } from './guards/AuthGuard'
import { RoleGuard } from './guards/RoleGuard'
import { AppLayout } from './layouts/AppLayout'
import { AuthLayout } from './layouts/AuthLayout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import StudentsPage from './pages/StudentsPage'
import TeachersPage from './pages/TeachersPage'
import GradesPage from './pages/GradesPage'
import CoursesPage from './pages/CoursesPage'
import OccurrencesPage from './pages/OccurrencesPage'
import NewOccurrencePage from './pages/NewOccurrencePage'
import PromotionPage from './pages/PromotionPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Públicas */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protegidas */}
            <Route element={<AuthGuard />}>
              <Route element={<AppLayout />}>
                {/* Todos os autenticados */}
                <Route path="/dashboard"   element={<DashboardPage />} />
                <Route path="/occurrences" element={<OccurrencesPage />} />
                <Route path="/students"    element={<StudentsPage />} />

                {/* ADMIN e TEACHER podem registrar ocorrências e ver turmas/cursos */}
                <Route element={<RoleGuard allowedRoles={['ADMIN', 'TEACHER']} />}>
                  <Route path="/occurrences/new" element={<NewOccurrencePage />} />
                  <Route path="/grades"          element={<GradesPage />} />
                  <Route path="/courses"         element={<CoursesPage />} />
                </Route>

                {/* Somente ADMIN */}
                <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
                  <Route path="/teachers"  element={<TeachersPage />} />
                  <Route path="/promotion" element={<PromotionPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="/"  element={<Navigate to="/dashboard" replace />} />
            <Route path="*"  element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '10px',
              fontSize: '13px',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  )
}