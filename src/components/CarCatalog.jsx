import React, { useState, useEffect } from 'react';
import { X, Trash2, Image as ImageIcon } from 'lucide-react';
import { db } from '../utils/firebaseConfig';
import { collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const CarCatalog = ({ onClose }) => {
  const [modelos, setModelos] = useState([]);
  const [nuevoModelo, setNuevoModelo] = useState('');
  const [previewBase64, setPreviewBase64] = useState('');
  const [loading, setLoading] = useState(false);

  // Escuchar la base de datos en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'catalogo_autos'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Ordenar alfabéticamente
      data.sort((a, b) => a.modelo.localeCompare(b.modelo));
      setModelos(data);
    });
    return () => unsub();
  }, []);

  // Procesar y comprimir la imagen a Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar con Canvas para evitar el límite de 1MB de Firestore
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500; // Un ancho más que suficiente para un auto
        let scaleSize = 1;
        
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        }
        
        canvas.width = img.width * scaleSize;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a texto Base64 (PNG para mantener transparencia)
        const dataUrl = canvas.toDataURL('image/png');
        setPreviewBase64(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!nuevoModelo || !previewBase64) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'catalogo_autos'), {
        modelo: nuevoModelo.toLowerCase().trim(),
        imagenBase64: previewBase64
      });
      setNuevoModelo('');
      setPreviewBase64('');
    } catch (error) {
      alert("Error al guardar: " + error.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este vehículo del catálogo?")) {
      await deleteDoc(doc(db, 'catalogo_autos', id));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight text-slate-800">Catálogo de Vehículos</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestiona las imágenes (Base64) de los autos</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-100 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50">
          
          {/* Panel Formulario */}
          <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-fit sticky top-0">
            <h3 className="font-black uppercase text-slate-400 tracking-widest text-[10px] mb-5 border-b border-slate-100 pb-2">Añadir Nuevo Modelo</h3>
            
            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Palabra Clave (Modelo)</label>
            <input 
              type="text" 
              placeholder="Ej: versa, kicks, xtrail..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
              value={nuevoModelo}
              onChange={(e) => setNuevoModelo(e.target.value)}
            />

            <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Imagen (PNG sin fondo)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative min-h-[140px]">
              <input type="file" accept="image/png" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageChange} />
              {previewBase64 ? (
                <img src={previewBase64} alt="Preview" className="h-24 w-full object-contain drop-shadow-md" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">Clic para buscar PNG</span>
                </div>
              )}
            </div>

            <button 
              onClick={handleSave}
              disabled={loading || !nuevoModelo || !previewBase64}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-lg shadow-red-200 disabled:shadow-none"
            >
              {loading ? 'Guardando...' : 'Guardar en Catálogo'}
            </button>
          </div>

          {/* Galería Visual */}
          <div className="col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-max">
            {modelos.map(mod => (
              <div key={mod.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center relative group shadow-sm hover:shadow-md transition-shadow">
                <button 
                  onClick={() => handleDelete(mod.id)}
                  className="absolute top-2 right-2 p-2 bg-slate-100 text-slate-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  title="Eliminar modelo"
                >
                  <Trash2 size={16} />
                </button>
                <div className="h-24 w-full flex items-center justify-center mb-3">
                  <img src={mod.imagenBase64} className="h-full object-contain drop-shadow-md transition-transform group-hover:scale-110 duration-300" alt={mod.modelo} />
                </div>
                <div className="bg-slate-50 w-full text-center py-2 rounded-lg">
                  <span className="font-black uppercase text-xs tracking-widest text-slate-600">{mod.modelo}</span>
                </div>
              </div>
            ))}
            
            {modelos.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-2xl border border-slate-200 border-dashed">
                <div className="p-4 bg-slate-50 rounded-full mb-3">
                  <ImageIcon size={48} className="opacity-50" />
                </div>
                <p className="font-black uppercase tracking-widest text-sm text-slate-400">Catálogo Vacío</p>
                <p className="text-xs font-bold mt-1 max-w-xs text-center text-slate-400">Agrega el primer modelo usando el panel de la izquierda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCatalog;
