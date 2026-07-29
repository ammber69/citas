import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../utils/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { CIUDADES } from '../utils/ciudades';
import { 
  UserPlus, 
  Trash2, 
  LogOut, 
  Shield, 
  MapPin, 
  Users, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import logo from '../assets/logo.png';

const SuperAdminPanel = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Estado del formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: '',
    ciudad: '',
    rol: 'admin'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Lista de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Cargar usuarios
  const fetchUsuarios = async () => {
    setLoadingUsers(true);
    try {
      const q = query(collection(db, 'usuarios'), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const lista = [];
      snapshot.forEach((documento) => {
        lista.push({ id: documento.id, ...documento.data() });
      });
      setUsuarios(lista);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setCreating(true);

    const { email, password, nombre, ciudad, rol } = formData;

    if (!email || !password || !nombre || !ciudad) {
      setMessage({ type: 'error', text: 'Todos los campos son obligatorios' });
      setCreating(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      setCreating(false);
      return;
    }

    const ciudadInfo = CIUDADES.find(c => c.slug === ciudad);
    if (!ciudadInfo) {
      setMessage({ type: 'error', text: 'Ciudad inválida' });
      setCreating(false);
      return;
    }

    try {
      // Guardar el usuario actual del SuperAdmin antes de crear el nuevo
      const superAdminUser = currentUser;

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Guardar datos del usuario en Firestore
      await setDoc(doc(db, 'usuarios', newUser.uid), {
        uid: newUser.uid,
        email: email,
        nombre: nombre,
        rol: rol,
        ciudad: ciudad,
        ciudadNombre: ciudadInfo.nombre,
        created_at: new Date().toISOString()
      });

      setMessage({ type: 'success', text: `Usuario "${nombre}" creado exitosamente para ${ciudadInfo.nombre}` });
      setFormData({ email: '', password: '', nombre: '', ciudad: '', rol: 'admin' });
      
      // Recargar lista de usuarios
      await fetchUsuarios();

      // NOTA: createUserWithEmailAndPassword cambia el usuario autenticado.
      // Necesitamos re-autenticar al SuperAdmin. El usuario verá un mensaje de éxito
      // y luego puede necesitar re-loguearse si la sesión cambia.
      // Para evitar esto, usamos la API de Admin SDK en un backend, pero como
      // no tenemos backend, mostramos un aviso.
      if (auth.currentUser?.uid !== superAdminUser?.uid) {
        setMessage({ 
          type: 'success', 
          text: `Usuario "${nombre}" creado exitosamente para ${ciudadInfo.nombre}. NOTA: Tu sesión cambió. Haz logout y vuelve a entrar como SuperAdmin.`
        });
      }

    } catch (error) {
      console.error('Error al crear usuario:', error);
      if (error.code === 'auth/email-already-in-use') {
        setMessage({ type: 'error', text: 'Este email ya está registrado' });
      } else if (error.code === 'auth/weak-password') {
        setMessage({ type: 'error', text: 'La contraseña es muy débil (mínimo 6 caracteres)' });
      } else if (error.code === 'auth/invalid-email') {
        setMessage({ type: 'error', text: 'Email inválido' });
      } else {
        setMessage({ type: 'error', text: `Error: ${error.message}` });
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`¿Seguro que quieres eliminar al usuario "${userName}"? Esto solo elimina sus datos, no su cuenta de Auth.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'usuarios', userId));
      setMessage({ type: 'success', text: `Usuario "${userName}" eliminado` });
      await fetchUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setMessage({ type: 'error', text: 'Error al eliminar usuario' });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-lg">
              <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase leading-none flex items-center gap-2">
                <Shield size={20} className="text-red-600" />
                SuperAdmin
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Gestión de Usuarios
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={18} />
            <span className="hidden md:inline">CERRAR SESIÓN</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Mensaje global */}
        {message.text && (
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-semibold border transition-all ${
            message.type === 'error' 
              ? 'bg-red-50 border-red-100 text-red-700' 
              : 'bg-green-50 border-green-100 text-green-700'
          }`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Crear Usuario */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-xl">
              <UserPlus size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Crear Nuevo Usuario
            </h2>
          </div>

          <form onSubmit={handleCreateUser} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Nombre completo
                </label>
                <input
                  id="sa-nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all font-medium"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Email
                </label>
                <input
                  id="sa-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="usuario@agencia.com"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all font-medium"
                />
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="sa-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all font-medium pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Ciudad */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Ciudad / Agencia
                </label>
                <div className="relative">
                  <select
                    id="sa-ciudad"
                    name="ciudad"
                    value={formData.ciudad}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="">Selecciona una ciudad</option>
                    {CIUDADES.map(c => (
                      <option key={c.slug} value={c.slug}>{c.nombre}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                id="sa-create-btn"
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-red-200 font-bold text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl">
                <Users size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
                Usuarios Registrados
              </h2>
            </div>
            <span className="bg-slate-200 text-slate-600 font-black text-xs px-3 py-1 rounded-full uppercase">
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="divide-y divide-slate-50">
            {loadingUsers ? (
              <div className="p-16 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando usuarios...</span>
                </div>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="p-16 text-center text-slate-300">
                <div className="flex flex-col items-center gap-4">
                  <Users size={48} className="opacity-20" />
                  <p className="font-bold uppercase tracking-widest text-sm">No hay usuarios registrados</p>
                </div>
              </div>
            ) : (
              usuarios.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm ${
                      user.rol === 'superadmin' ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'
                    }`}>
                      {user.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{user.nombre || 'Sin nombre'}</div>
                      <div className="text-slate-400 text-xs font-medium">{user.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={14} />
                      <span className="font-bold text-xs uppercase tracking-wider">{user.ciudadNombre || user.ciudad}</span>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                      user.rol === 'superadmin' 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {user.rol}
                    </span>

                    {user.rol !== 'superadmin' && (
                      <button
                        onClick={() => handleDeleteUser(user.id, user.nombre)}
                        className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminPanel;
