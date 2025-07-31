import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense } from 'react'
import { useAuthStore } from './store/auth'

// Layout components
import DashboardLayout from './components/layout/DashboardLayout'
import AdminLayout from './components/layout/AdminLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'

// Dashboard pages (Clientes PYMEs)
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import AgentsPage from '@/pages/agents/AgentsPage'
import AgentChatPage from '@/pages/agents/AgentChatPage'
import SettingsPage from '@/pages/settings/SettingsPage'

// Admin pages (Super Admin)
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminTenantsPage from '@/pages/admin/AdminTenantsPage'
import AdminModulesPage from '@/pages/admin/AdminModulesPage'
import AdminAgentsPage from '@/pages/admin/AdminAgentsPage'
import AdminSystemPage from '@/pages/admin/AdminSystemPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminReportsPage from '@/pages/admin/AdminReportsPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminAIIntegrationsPage from '@/pages/admin/AdminAIIntegrationsPage'
import AdminPromptsPage from '@/pages/admin/AdminPromptsPage'
import AnalysisPage from '@/pages/analysis/AnalysisPage'

// Loading component
function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-muted-foreground">Cargando TausePro...</p>
      </div>
    </div>
  )
}

// Debug component to test if the app is loading
function DebugPage() {
  console.log('🔍 DebugPage: Componente de debug cargado')
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Debug: TausePro App</h1>
        <p className="text-muted-foreground">La aplicación está cargando correctamente</p>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}

// Protected route wrapper for regular users (temporalmente deshabilitado)
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log('🔍 ProtectedRoute: Iniciando')
  const { user, isLoading } = useAuthStore()
  console.log('🔍 ProtectedRoute: Estado auth:', { user: user?.id, isLoading })
  
  if (isLoading) {
    console.log('🔍 ProtectedRoute: Mostrando loading')
    return <LoadingPage />
  }
  
  // Temporalmente permitir acceso sin autenticación para debuggear
  console.log('🔍 ProtectedRoute: Permitido acceso temporal')
  return <>{children}</>
  
  // Código original comentado:
  /*
  if (!user) {
    return <Navigate to="/admin/login" replace />
  }

  // Si es super admin, redirigir al admin dashboard
  if (user.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  return <>{children}</>
  */
}

// Protected route wrapper for admin routes (no redirect loop)
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  console.log('🔍 AdminProtectedRoute: Iniciando')
  const { user, isLoading } = useAuthStore()
  console.log('🔍 AdminProtectedRoute: Estado auth:', { user: user?.id, isLoading })
  
  if (isLoading) {
    console.log('🔍 AdminProtectedRoute: Mostrando loading')
    return <LoadingPage />
  }
  
  if (!user) {
    console.log('🔍 AdminProtectedRoute: No hay usuario, redirigiendo a login')
    return <Navigate to="/admin/login" replace />
  }

  // Verificar que sea super admin
  if (user.role !== 'super_admin') {
    console.log('🔍 AdminProtectedRoute: Usuario no es super_admin, redirigiendo')
    return <Navigate to="/admin/login" replace />
  }
  
  console.log('🔍 AdminProtectedRoute: Acceso permitido')
  return <>{children}</>
}

// Public route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  console.log('🔍 PublicRoute: Iniciando')
  const { user, isLoading } = useAuthStore()
  console.log('🔍 PublicRoute: Estado auth:', { user: user?.id, isLoading })
  
  if (isLoading) {
    console.log('🔍 PublicRoute: Mostrando loading')
    return <LoadingPage />
  }
  
  if (user) {
    // Si es super admin, ir al admin dashboard, sino al dashboard normal
    if (user.role === 'super_admin') {
      console.log('🔍 PublicRoute: Usuario es super_admin, redirigiendo a admin dashboard')
      return <Navigate to="/admin/dashboard" replace />
    } else {
      console.log('🔍 PublicRoute: Usuario normal, redirigiendo a dashboard')
      return <Navigate to="/" replace />
    }
  }
  
  console.log('🔍 PublicRoute: Mostrando contenido público')
  return <>{children}</>
}

function App() {
  console.log('🔍 App: Componente App iniciando')
  const { refreshUser } = useAuthStore()
  
  // Initialize app data
  useEffect(() => {
    console.log('🔍 App: useEffect ejecutándose')
    try {
      refreshUser()
      console.log('🔍 App: refreshUser llamado exitosamente')
    } catch (error) {
      console.error('🔍 App: Error initializing app:', error)
    }
  }, [refreshUser])
  
  console.log('🔍 App: Renderizando App')
  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
            {/* Debug route */}
            <Route path="/debug" element={<DebugPage />} />
            
            {/* Public routes */}
            <Route 
              path="/admin/login" 
              element={
                <PublicRoute>
                  <AdminLoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/admin/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected dashboard routes (Clientes PYMEs) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Dashboard pages */}
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="agents" element={<AgentsPage />} />
              <Route path="agents/:agentId/chat" element={<AgentChatPage />} />
              <Route path="analysis" element={<AnalysisPage />} />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Protected admin routes (Super Admin) */}
            <Route 
              path="/admin" 
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              {/* Default redirect to admin dashboard */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              {/* Admin pages */}
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="tenants" element={<AdminTenantsPage />} />
              <Route path="modules" element={<AdminModulesPage />} />
              <Route path="agents" element={<AdminAgentsPage />} />
              <Route path="system" element={<AdminSystemPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
              <Route path="ai-integrations" element={<AdminAIIntegrationsPage />} />
              <Route path="prompts" element={<AdminPromptsPage />} />
              
              {/* Catch all admin routes - redirect to admin dashboard */}
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            
            {/* Catch all public routes - redirect to login */}
            <Route path="*" element={<Navigate to="/admin/login" replace />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  )
}

export default App
