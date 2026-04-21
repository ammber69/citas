import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './pages/AdminPanel';
import TVDisplay from './pages/TVDisplay';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el personal de administración */}
        <Route path="/admin" element={<AdminPanel />} />
        
        {/* Ruta para la pantalla de visualización TV */}
        <Route path="/tv" element={<TVDisplay />} />
        
        {/* Redirigir por defecto al Admin */}
        <Route path="*" element={<Navigate to="/tv" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
