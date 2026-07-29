import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import AdminPanel from './pages/AdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';
import TVDisplay from './pages/TVDisplay';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin — protegido, requiere rol admin o superadmin */}
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* SuperAdmin — protegido, solo superadmin */}
          <Route path="/superadmin" element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminPanel />
            </ProtectedRoute>
          } />

          {/* Pantalla TV pública — una ruta por ciudad */}
          <Route path="/tv/:ciudad" element={<TVDisplay />} />

          {/* Backward compatible: /tv sin ciudad redirige a cordoba */}
          <Route path="/tv" element={<Navigate to="/tv/cordoba" replace />} />

          {/* Redirigir cualquier otra ruta al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
