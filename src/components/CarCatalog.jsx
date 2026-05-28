import React, { useState, useEffect } from 'react';
import { X, Trash2, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// Modelos Nissan México conocidos (para el dropdown)
const MODELOS_NISSAN = [
  'versa', 'v-drive', 'sentra', 'march', 'kicks',
  'xtrail', 'pathfinder', 'magnite', 'murano',
  'np300', 'frontier', 'armada', 'leaf', 'ariya'
];

// Rango de años disponibles
const ANIOS = Array.from({ length: 12 }, (_, i) => String(2019 + i)); // 2019 - 2030

const CarCatalog = ({ onClose }) => {
  const [modelos, setModelos] = useState([]);
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [nuevoAnio, setNuevoAnio] = useState('');
  const [previewBase64, setPreviewBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [filtroModelo, setFiltroModelo] = useState('todos');

  // Escuchar la base de datos en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'catalogo_autos'), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordenar: primero por modelo, luego por año
      data.sort((a, b) => {
        if (a.modelo !== b.modelo) return a.modelo.localeCompare(b.modelo);
        return String(b.anio).localeCompare(String(a.anio)); // años desc
      });
      setModelos(data);
    });
    return () => unsub();
  }, []);

  // Comprimir y convertir imagen a Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500;
        let scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        setPreviewBase64(canvas.toDataURL('image/png'));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!nuevoModelo || !nuevoAnio || !previewBase64) {
      alert('Completa el modelo, año e imagen antes de guardar.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'catalogo_autos'), {
        modelo: nuevoModelo.toLowerCase().trim(),
        anio: nuevoAnio.trim(),
        imagenBase64: previewBase64
      });
      setNuevoModelo('');
      setNuevoAnio('');
      setPreviewBase64('');
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar este registro del catálogo?")) {
      await deleteDoc(doc(db, 'catalogo_autos', id));
    }
  };

  // Agrupar por modelo para la galería
  const modelosUnicos = ['todos', ...new Set(modelos.map(m => m.modelo))].sort();
  const modelosFiltrados = filtroModelo === 'todos'
    ? modelos
    : modelos.filter(m => m.modelo === filtroModelo);

  // Agrupar visualmente por modelo
  const grupos = modelosFiltrados.reduce((acc, item) => {
    if (!acc[item.modelo]) acc[item.modelo] = [];
    acc[item.modelo].push(item);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white sticky top-0">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Catálogo de Vehículos</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {modelos.length} registro(s) — Busca por modelo + año
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Panel Formulario */}
            <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 h-fit sticky top-6">
              <h3 className="font-black uppercase text-slate-400 tracking-widest text-[10px] border-b border-slate-100 pb-3">
                Añadir Imagen por Modelo y Año
              </h3>

              {/* Selector Modelo */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Modelo</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                    value={nuevoModelo}
                    onChange={e => setNuevoModelo(e.target.value)}
                  >
                    <option value="">-- Selecciona un modelo --</option>
                    {MODELOS_NISSAN.map(m => (
                      <option key={m} value={m}>{m.toUpperCase()}</option>
                    ))}
                    <option value="otro">OTRO / PERSONALIZADO</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
                {nuevoModelo === 'otro' && (
                  <input
                    type="text"
                    placeholder="Escribe el nombre del modelo"
                    className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                    onChange={e => setNuevoModelo(e.target.value === 'otro' ? '' : e.target.value)}
                  />
                )}
              </div>

              {/* Selector Año */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Año</label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    value={nuevoAnio}
                    onChange={e => setNuevoAnio(e.target.value)}
                  >
                    <option value="">-- Selecciona el año --</option>
                    {ANIOS.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Zona de imagen */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Imagen PNG</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[130px]">
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
                  {previewBase64 ? (
                    <img src={previewBase64} alt="Preview" className="h-24 w-full object-contain drop-shadow-md" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <ImageIcon size={32} className="mb-2" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-center">Clic para buscar imagen</span>
                      <span className="text-[9px] text-slate-300 mt-1">PNG transparente recomendado</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={loading || !nuevoModelo || !nuevoAnio || !previewBase64}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg shadow-red-100 disabled:shadow-none"
              >
                {loading ? 'Guardando...' : `Guardar ${nuevoModelo ? nuevoModelo.toUpperCase() : ''} ${nuevoAnio}`}
              </button>
            </div>

            {/* Galería agrupada */}
            <div className="col-span-2 flex flex-col gap-4">

              {/* Filtro por modelo */}
              <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                {modelosUnicos.map(m => (
                  <button
                    key={m}
                    onClick={() => setFiltroModelo(m)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                      ${filtroModelo === m
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Grupos por modelo */}
              {Object.keys(grupos).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-300 bg-white rounded-2xl border border-slate-200 border-dashed">
                  <ImageIcon size={48} className="mb-3 opacity-40" />
                  <p className="font-black uppercase tracking-widest text-sm text-slate-400">Catálogo Vacío</p>
                  <p className="text-xs font-bold mt-1 text-slate-400">Agrega el primer modelo en el panel izquierdo</p>
                </div>
              ) : (
                Object.entries(grupos).map(([modelo, items]) => (
                  <div key={modelo} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Header del grupo */}
                    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-100">
                      <span className="font-black uppercase tracking-widest text-slate-700 text-sm">{modelo}</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {items.length} año(s)
                      </span>
                    </div>
                    {/* Cards de años */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-4">
                      {items.map(item => (
                        <div key={item.id} className="relative group flex flex-col items-center bg-slate-50 rounded-xl p-2 border border-slate-100 hover:border-red-200 hover:shadow-md transition-all">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-white border border-red-200 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-500 hover:text-white"
                            title="Eliminar"
                          >
                            <X size={10} />
                          </button>
                          <div className="h-14 w-full flex items-center justify-center mb-1">
                            <img
                              src={item.imagenBase64}
                              alt={`${item.modelo} ${item.anio}`}
                              className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform group-hover:scale-110 duration-300"
                            />
                          </div>
                          <div className="bg-red-600 text-white text-[9px] font-black tracking-widest px-2 py-0.5 rounded-md w-full text-center">
                            {item.anio}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCatalog;
