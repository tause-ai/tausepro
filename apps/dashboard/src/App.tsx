import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense } from 'react'
import { useAuthStore } from '@/store/auth'

// Layout components
import DashboardLayout from '@/components/layout/DashboardLayout'
import AdminLayout from '@/components/layout/AdminLayout'
import LoginPage from '@/pages/auth/LoginPage'

// Dashboard pages (Clientes PYMEs)
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import AgentsPage from '@/pages/agents/AgentsPage'
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
import AnalysisPage from '@/pages/dashboard/AnalysisPage'

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

// Protected route wrapper for regular users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  
  if (isLoading) {
    return <LoadingPage />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Si es super admin, redirigir al admin dashboard
  if (user?.role === 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />
  }
  
  return <>{children}</>
}

// Protected route wrapper for admin routes (no redirect loop)
function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuthStore()
  
  if (isLoading) {
    return <LoadingPage />
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  // Verificar que sea super admin
  if (user?.role !== 'super_admin') {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

// Public route wrapper (redirect to dashboard if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <LoadingPage />
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function App() {
  const { refreshUser } = useAuthStore()
  
  // Initialize app data
  useEffect(() => {
    try {
      refreshUser()
    } catch (error) {
      console.error('Error initializing app:', error)
    }
  }, [refreshUser])
  
  return (
    <Router>
      <Suspense fallback={<LoadingPage />}>
        <div className="min-h-screen bg-background font-sans antialiased">
          <Routes>
                                    {/* Public routes */}
                        <Route 
                          path="/login" 
                          element={
                            <PublicRoute>
                              <LoginPage />
                            </PublicRoute>
                          } 
                        />
                        <Route 
                          path="/admin/login" 
                          element={
                            <PublicRoute>
                              <AdminLoginPage />
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
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Suspense>
    </Router>
  )
}

export default App
