import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useSelector } from 'react-redux'
import ProtectedRoute from './components/common/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Orders from './pages/orders/Orders'
import Dashboard from './pages/dashboard/Dashboard'
import useSocket from './hooks/useSocket'

function SocketManager() {
  useSocket()
  return null
}

function AppRoutes() {
  const { user } = useSelector((state) => state.auth)

  return (
    <>
      {user && <SocketManager />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            style: {
              background: '#16a34a',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#16a34a',
            }
          },
          error: {
            style: {
              background: '#dc2626',
              color: '#ffffff',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#dc2626',
            }
          }
        }}
      />
      <AppRoutes />
    </Router>
  )
}

export default App