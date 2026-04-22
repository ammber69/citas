import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTurnos } from '../hooks/useTurnos';
import { Clock, Car, Settings, Tv, CheckCircle2, PlayCircle, Loader2, Info } from 'lucide-react';
import logo from '../assets/logo.png';

const TVDisplay = () => {
  const { turnos, loading } = useTurnos();
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [offset, setOffset] = useState(0);

  const marketingMessages = [
    "Contamos con servicio de alineación y balanceo computarizado de alta precisión.",
    "Café de cortesía y WiFi gratis en nuestra sala de espera para su comodidad.",
    "NISSAN INTELLIGENT MOBILITY: Innovación que emociona en cada kilómetro.",
    "Próximamente: Nuevos modelos 2027 disponibles para prueba de manejo.",
    "Tu seguridad es nuestra prioridad. Realizamos revisión de 27 puntos de seguridad en cada servicio."
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading || turnos.length === 0) return;

    let animationFrame;
    let currentOffset = 0;
    const speed = 0.5; 

    const animate = () => {
      if (!containerRef.current || !contentRef.current) return;

      const containerHeight = containerRef.current.offsetHeight;
      const totalContentHeight = contentRef.current.offsetHeight;
      const singleListHeight = totalContentHeight / 2;

      if (singleListHeight > containerHeight) {
        currentOffset += speed;
        if (currentOffset >= singleListHeight) currentOffset = 0;
        setOffset(currentOffset);
      } else {
        setOffset(0);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [loading, turnos.length]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const turnosPublicos = turnos
    .filter(t => t.estado !== 'Cancelado')
    .sort((a, b) => {
      const orden = { 'En servicio': 1, 'En espera': 2, 'Vehículo Listo': 3 };
      const estadoA = a.estado || 'En espera';
      const estadoB = b.estado || 'En espera';
      if (orden[estadoA] !== orden[estadoB]) return orden[estadoA] - orden[estadoB];
      return a.horacita.localeCompare(b.horacita);
    });

  const displayTurnos = [...turnosPublicos, ...turnosPublicos];

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7f9] text-slate-900 font-sans flex flex-col relative">
      {/* Header Compacto Premium (Fondo Claro) */}
      <header className="flex justify-between items-center px-6 py-3 bg-white border-b-2 border-slate-200 flex-shrink-0 z-50 shadow-md">
        <div className="flex items-center gap-6">
          <div className="bg-white p-1">
            <img src={logo} alt="Nissan Logo" className="h-20 w-auto object-contain" />
          </div>
          <Link to="/admin" className="group flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 flex items-center gap-2 leading-none">
              Estado de Servicio
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
              </div>
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-black text-red-600 tracking-[0.2em] uppercase">Innovación que emociona</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 border-l border-slate-200 pl-2">Sucursal Córdoba</span>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="text-5xl font-mono font-black text-slate-900 leading-none tracking-tighter tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Hora de Atención</div>
        </div>
      </header>

      {/* Encabezados de Tabla */}
      <div className="grid grid-cols-12 gap-4 px-10 py-3 bg-slate-800 text-white uppercase text-[11px] font-black tracking-[0.3em] flex-shrink-0 z-40">
        <div className="col-span-2">Hora Cita</div>
        <div className="col-span-6">Cliente / Vehículo / Asesor</div>
        <div className="col-span-4 text-center">Estado Actual</div>
      </div>

      {/* Area de Scroll Infinito Compacta */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-hidden relative"
      >
        <div 
          ref={contentRef}
          style={{ 
            transform: `translate3d(0, ${-offset}px, 0)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden'
          }}
          className="grid grid-cols-1 gap-3 p-4"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 size={40} className="animate-spin text-red-600 mb-2" />
              <p className="text-sm font-black uppercase tracking-widest text-slate-400">Sincronizando...</p>
            </div>
          ) : turnosPublicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-10">
              <Car size={100} className="mb-2" />
              <p className="text-3xl font-black uppercase tracking-tighter text-slate-900">Sin Citas</p>
            </div>
          ) : (
            displayTurnos.map((turno, idx) => (
              <div 
                key={`${turno.id}-${idx}`} 
                className={`grid grid-cols-12 gap-4 px-8 py-5 rounded-2xl transition-all relative overflow-hidden bg-white shadow-sm border border-slate-200
                  ${turno.estado === 'Vehículo Listo' ? 'border-l-[12px] border-l-green-500' : ''}
                  ${turno.estado === 'En servicio' ? 'border-l-[12px] border-l-blue-500' : ''}
                  ${turno.estado === 'En espera' ? 'border-l-[12px] border-l-amber-500' : ''}
                  ${!turno.estado ? 'border-l-[12px] border-l-slate-300' : ''}
                `}
              >
                <div className="col-span-2 flex items-center">
                  <span className="text-4xl font-mono font-black text-slate-800 tracking-tighter tabular-nums">
                    {turno.horacita}
                  </span>
                </div>

                <div className="col-span-6 flex flex-col justify-center">
                  <div className="text-2xl font-black uppercase truncate text-slate-900 leading-tight mb-1">
                    {turno.cliente}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg text-slate-500 font-bold italic tracking-tight">{turno.vehiculo}</span>
                    <span className="h-3 w-px bg-slate-200"></span>
                    <span className="text-xs font-black text-red-600 uppercase tracking-widest">Asesor: {turno.asesor}</span>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-center">
                  <div className={`text-2xl font-black uppercase tracking-tighter px-6 py-3 rounded-xl shadow-inner w-full text-center flex items-center justify-center gap-3
                    ${turno.estado === 'En espera' ? 'text-amber-700 bg-amber-50' : ''}
                    ${turno.estado === 'En servicio' ? 'text-blue-700 bg-blue-50' : ''}
                    ${turno.estado === 'Vehículo Listo' ? 'text-green-700 bg-green-50' : ''}
                  `}>
                    {turno.estado === 'En espera' && <Clock className="animate-pulse" size={20} />}
                    {turno.estado === 'En servicio' && <Loader2 className="animate-spin" size={20} />}
                    {turno.estado === 'Vehículo Listo' && <CheckCircle2 className="animate-bounce" size={20} />}
                    {turno.estado || 'En espera'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticker de Marketing (Fondo Neutro Elegante) */}
      <div className="bg-slate-900 h-10 flex items-center overflow-hidden flex-shrink-0 z-50 shadow-lg">
        <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap gap-20">
          {[...marketingMessages, ...marketingMessages].map((msg, i) => (
            <span key={i} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Minimalista Compacto */}
      <footer className="bg-white px-6 py-2 flex justify-between items-center border-t border-slate-200 flex-shrink-0 z-50 text-[9px] font-black uppercase tracking-widest text-slate-400">
        <div className="flex gap-6">
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> En espera</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> En servicio</span>
          <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Vehículo Listo</span>
        </div>
        <div className="italic text-red-600 opacity-40 tracking-tighter">Nissan Cordoba Experience</div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TVDisplay;
