import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      // AuthContext ya cargó el userData, verificar rol para redirigir
      // Usamos un pequeño delay para que el state se actualice
      setTimeout(() => {
        navigate('/admin');
      }, 100);
    } catch (err) {
      console.error('Error de login:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email o contraseña incorrectos');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Intenta más tarde.');
      } else {
        setError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-600/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/3 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <img src={logo} alt="Logo" className="h-16 w-auto object-contain" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 pb-2 text-center">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Control de Citas
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-2 tracking-wide">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
                <AlertCircle size={18} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="usuario@agencia.com"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 px-4 py-3.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black uppercase tracking-wider py-4 rounded-xl transition-all shadow-lg shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-sm"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-600 text-xs font-bold uppercase tracking-widest mt-6">
          Sistema de Gestión de Taller
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
