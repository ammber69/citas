import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Trash2, Database, Tv, PlayCircle, Clock, CheckCircle2 } from 'lucide-react';
import { parseDMSCsv } from '../utils/csvParser';
import { useTurnos } from '../hooks/useTurnos';
import logo from '../assets/logo.png';

const AdminPanel = () => {
  const { turnos, loading, addTurnosFromCsv, updateEstado, removeTurno, clearAll } = useTurnos();
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await parseDMSCsv(file);
        const dataPreparada = data.map(t => ({ ...t, estado: 'En espera' }));
        addTurnosFromCsv(dataPreparada);
        alert('¡Citas importadas con éxito!');
      } catch (err) {
        alert('Error al procesar el archivo CSV');
      }
    }
  };

  const setStatus = (id, newStatus) => {
    updateEstado(id, newStatus);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-20">
      {/* Header Premium */}
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-lg">
              <img src={logo} alt="Nissan Logo" className="h-12 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase leading-none">Gestión de Taller</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 items-center">
            {/* BOTÓN VOLVER A TV */}
            <Link 
              to="/tv"
              className="flex items-center gap-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-xl transition-all font-bold text-sm border border-transparent hover:border-blue-100"
            >
              <Tv size={18} />
              <span>PANTALLA TV</span>
            </Link>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

            <button 
              onClick={() => fileInputRef.current.click()}
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-200 font-bold text-sm"
            >
              <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              IMPORTAR
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
            
            <button 
              onClick={clearAll}
              className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Limpiar Sistema"
            >
              <Database size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 mt-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">Información de Cita</th>
                <th className="p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest">Vehículo y Asesor</th>
                <th className="p-5 font-black text-slate-400 uppercase text-[11px] tracking-widest text-center">Control de Estado</th>
                <th className="p-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Cargando datos...</span>
                    </div>
                  </td>
                </tr>
              ) : turnos.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-32 text-center text-slate-300">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-50 rounded-full">
                        <Upload size={48} className="opacity-20" />
                      </div>
                      <p className="font-bold uppercase tracking-widest text-sm">No hay citas registradas</p>
                      <button onClick={() => fileInputRef.current.click()} className="text-blue-600 font-bold underline">Haz clic para subir un archivo</button>
                    </div>
                  </td>
                </tr>
              ) : (
                turnos.sort((a, b) => a.horacita.localeCompare(b.horacita)).map((turno) => (
                  <tr key={turno.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-100 p-3 rounded-xl font-black text-2xl text-slate-700">
                          {turno.horacita}
                        </div>
                        <div>
                          <div className="font-black text-lg text-slate-800 uppercase leading-none mb-1">{turno.cliente}</div>
                          <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded inline-block">FOLIO: {turno.folio}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="font-bold text-slate-700 uppercase">{turno.vehiculo}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-black text-nissan-red uppercase">Atiende:</span>
                        <span className="text-[11px] font-bold text-slate-500 uppercase">{turno.asesor}</span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                        <button 
                          onClick={() => setStatus(turno.id, 'En espera')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-black uppercase text-[10px] transition-all
                            ${turno.estado === 'En espera' 
                              ? 'bg-amber-400 text-amber-900 shadow-md scale-105 z-10' 
                              : 'text-slate-400 hover:text-amber-500 hover:bg-white'}`}
                        >
                          <Clock size={14} /> En espera
                        </button>
                        
                        <button 
                          onClick={() => setStatus(turno.id, 'En servicio')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-black uppercase text-[10px] transition-all
                            ${turno.estado === 'En servicio' 
                              ? 'bg-blue-600 text-white shadow-md scale-105 z-10' 
                              : 'text-slate-400 hover:text-blue-500 hover:bg-white'}`}
                        >
                          <PlayCircle size={14} /> En servicio
                        </button>
                        
                        <button 
                          onClick={() => setStatus(turno.id, 'Vehículo Listo')}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl font-black uppercase text-[10px] transition-all
                            ${turno.estado === 'Vehículo Listo' 
                              ? 'bg-green-500 text-white shadow-md scale-105 z-10' 
                              : 'text-slate-400 hover:text-green-500 hover:bg-white'}`}
                        >
                          <CheckCircle2 size={14} /> ¡LISTO!
                        </button>
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => removeTurno(turno.id)} 
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
