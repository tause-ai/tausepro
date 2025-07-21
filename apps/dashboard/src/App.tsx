import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, Suspense } from 'react'
import { useAuthStore } from '@/store/auth'

// Layout components
import DashboardLayout from '@/components/layout/DashboardLayout'
import LoginPage from '@/pages/auth/LoginPage'

// Dashboard pages
import DashboardPage from '@/pages/dashboard/DashboardPage'
import AnalyticsPage from '@/pages/analytics/AnalyticsPage'
import AgentsPage from '@/pages/agents/AgentsPage'
import SettingsPage from '@/pages/settings/SettingsPage'

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

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore()
  
  if (isLoading) {
    return <LoadingPage />
  }
  
  if (!isAuthenticated) {
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
            
            {/* Protected dashboard routes */}
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
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
