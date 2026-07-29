import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

/**
 * ProtectedRoute — Envuelve rutas que requieren autenticación y/o un rol específico.
 * 
 * @param {React.ReactNode} children — Componente a renderizar si pasa la verificación
 * @param {string} requiredRole — 'admin' | 'superadmin'. Si es 'admin', también acepta superadmin.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, userData, loading, isSuperAdmin, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-red-600" />
          <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">
            Verificando acceso...
          </span>
        </div>
      </div>
    );
  }

  // No autenticado → login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado pero sin datos de usuario en Firestore
  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol
  if (requiredRole === 'superadmin' && !isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
