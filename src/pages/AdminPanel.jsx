import React, { useRef } from 'react';
import { Upload, Trash2, FileText } from 'lucide-react';
import { parseDMSCsv } from '../utils/csvParser';
import { useTurnos } from '../hooks/useTurnos';

const AdminPanel = () => {
  const { turnos, loading, addTurnosFromCsv, updateEstado, removeTurno, clearAll } = useTurnos();
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const data = await parseDMSCsv(file);
        // Al cargar, todos inician "En espera" por defecto
        const dataPreparada = data.map(t => ({ ...t, estado: 'En espera' }));
        addTurnosFromCsv(dataPreparada);
        alert('Citas cargadas correctamente');
      } catch (err) {
        alert('Error al procesar el archivo');
      }
    }
  };

  const setStatus = (id, newStatus) => {
    updateEstado(id, newStatus);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black font-sans">
      <header className="bg-white border-b-2 border-gray-100 p-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-nissan-red p-2">
            <span className="font-bold text-xl italic text-white">NISSAN</span>
          </div>
          <h1 className="text-xl font-black tracking-tighter uppercase">Gestión de Citas</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-black hover:bg-nissan-red text-white px-6 py-3 transition-all uppercase text-xs font-black shadow-lg"
          >
            <Upload size={16} /> Subir CSV
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".csv" />
          <button 
            onClick={clearAll}
            className="flex items-center gap-2 text-gray-400 hover:text-red-600 px-4 py-2 transition-all uppercase text-xs font-black"
          >
            <Trash2 size={16} /> Limpiar Base de Datos
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-white">
              <tr>
                <th className="p-4 font-black uppercase text-xs">Hora</th>
                <th className="p-4 font-black uppercase text-xs">Cliente / Vehículo / Asesor</th>
                <th className="p-4 font-black uppercase text-xs text-center">Seleccionar Estado</th>
                <th className="p-4 font-black uppercase text-xs"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-20 text-center font-bold text-gray-400 animate-pulse">Sincronizando...</td></tr>
              ) : turnos.length === 0 ? (
                <tr><td colSpan="4" className="p-20 text-center text-gray-300 italic font-bold uppercase tracking-widest">No hay datos en la nube. Sube un CSV.</td></tr>
              ) : (
                turnos.sort((a, b) => a.horacita.localeCompare(b.horacita)).map((turno) => (
                  <tr key={turno.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-3xl">{turno.horacita}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-black text-xl uppercase leading-tight">{turno.cliente}</div>
                      <div className="text-sm text-gray-500 font-bold italic">{turno.vehiculo}</div>
                      <div className="text-xs text-nissan-red font-black uppercase mt-1">Asesor: {turno.asesor}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => setStatus(turno.id, 'En espera')}
                          className={`flex-1 py-3 px-4 text-[10px] font-black uppercase rounded-sm border-2 transition-all
                            ${turno.estado === 'En espera' 
                              ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-inner' 
                              : 'bg-white border-yellow-100 text-yellow-400 hover:bg-yellow-50'}`}
                        >
                          En espera
                        </button>
                        <button 
                          onClick={() => setStatus(turno.id, 'En servicio')}
                          className={`flex-1 py-3 px-4 text-[10px] font-black uppercase rounded-sm border-2 transition-all
                            ${turno.estado === 'En servicio' 
                              ? 'bg-blue-500 border-blue-600 text-white shadow-inner' 
                              : 'bg-white border-blue-100 text-blue-400 hover:bg-blue-50'}`}
                        >
                          En servicio
                        </button>
                        <button 
                          onClick={() => setStatus(turno.id, 'Vehículo Listo')}
                          className={`flex-1 py-3 px-4 text-[10px] font-black uppercase rounded-sm border-2 transition-all
                            ${turno.estado === 'Vehículo Listo' 
                              ? 'bg-green-500 border-green-600 text-white shadow-inner' 
                              : 'bg-white border-green-100 text-green-400 hover:bg-green-50'}`}
                        >
                          Listo
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => removeTurno(turno.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2">
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
