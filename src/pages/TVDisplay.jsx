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

  // Mensajes para el Ticker de Marketing
  const marketingMessages = [
    "¡Pregunta por nuestras promociones de alineación y balanceo!",
    "Café de cortesía y WiFi gratis en nuestra sala de espera.",
    "Aprovecha 15% de descuento en cambio de aceite sintético.",
    "NISSAN INTELLIGENT MOBILITY: Innovación que emociona.",
    "Próximamente: Nuevos modelos 2025 disponibles para prueba de manejo."
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading || turnos.length === 0) return;

    let animationFrame;
    let currentOffset = 0;
    const speed = 0.45; // Un poco más lento para el nuevo diseño premium

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
    <div className="h-screen overflow-hidden bg-[#0f1115] text-white font-sans flex flex-col relative">
      {/* Fondo Decorativo Sutil */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-red-900/10 blur-[120px] rounded-full -mr-40 -mt-40 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-900/10 blur-[120px] rounded-full -ml-40 -mb-40 pointer-events-none"></div>

      {/* Header Ejecutivo */}
      <header className="flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/5 flex-shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="bg-white/5 p-2 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl">
            <img src={logo} alt="Nissan Logo" className="h-20 w-auto object-contain brightness-110" />
          </div>
          <Link to="/admin" className="group flex flex-col">
            <h2 className="text-3xl font-black uppercase tracking-tight text-white flex items-center gap-3 leading-none">
              Estado de Servicio
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
              </div>
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[11px] font-black text-red-500 tracking-[0.4em] uppercase">Innovación que emociona</span>
              <div className="h-px w-12 bg-white/10"></div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Sucursal Córdoba</span>
            </div>
          </Link>
        </div>
        
        <div className="bg-white/5 px-8 py-4 rounded-3xl backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col items-end">
          <div className="text-6xl font-mono font-black text-white leading-none tracking-tighter tabular-nums">
            {formatTime(currentTime)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Clock size={12} className="text-red-500" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hora Local de Servicio</span>
          </div>
        </div>
      </header>

      {/* Encabezados de Tabla Estilizados */}
      <div className="grid grid-cols-12 gap-4 px-12 py-5 bg-white/5 backdrop-blur-sm uppercase text-xs font-black tracking-[0.3em] text-gray-500 border-b border-white/5 flex-shrink-0 z-40">
        <div className="col-span-2 flex items-center gap-2"><Clock size={14} className="text-red-500" /> Cita</div>
        <div className="col-span-6 flex items-center gap-2"><Car size={14} className="text-red-500" /> Cliente / Vehículo</div>
        <div className="col-span-4 text-center flex items-center justify-center gap-2"><Info size={14} className="text-red-500" /> Estado Actual</div>
      </div>

      {/* Area de Scroll Infinito Premium */}
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
          className="grid grid-cols-1 gap-6 p-8"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-60">
              <Loader2 size={60} className="animate-spin text-red-600 mb-4" />
              <p className="text-xl font-black uppercase tracking-widest animate-pulse text-gray-500">Sincronizando Sistema</p>
            </div>
          ) : turnosPublicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-60 opacity-20">
              <Car size={200} className="mb-4" />
              <p className="text-5xl font-black uppercase tracking-tighter">Sin Movimiento</p>
              <p className="text-lg font-bold text-gray-500 uppercase tracking-widest mt-2">Cargue el archivo DMS para iniciar</p>
            </div>
          ) : (
            displayTurnos.map((turno, idx) => (
              <div 
                key={`${turno.id}-${idx}`} 
                className={`grid grid-cols-12 gap-4 px-10 py-10 rounded-[40px] transition-all relative overflow-hidden
                  bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.3)]
                  ${turno.estado === 'Vehículo Listo' ? 'ring-1 ring-green-500/20' : ''}
                  ${turno.estado === 'En servicio' ? 'ring-1 ring-blue-500/20' : ''}
                `}
              >
                {/* Indicador Lateral de Color */}
                <div className={`absolute left-0 top-0 bottom-0 w-3
                  ${turno.estado === 'Vehículo Listo' ? 'bg-green-500 shadow-[5px_0_20px_rgba(34,197,94,0.4)]' : ''}
                  ${turno.estado === 'En servicio' ? 'bg-blue-500 shadow-[5px_0_20px_rgba(59,130,246,0.4)]' : ''}
                  ${turno.estado === 'En espera' ? 'bg-amber-500 shadow-[5px_0_20px_rgba(245,158,11,0.4)]' : ''}
                  ${!turno.estado ? 'bg-gray-700' : ''}
                `}></div>

                <div className="col-span-2 flex items-center">
                  <span className="text-6xl font-mono font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                    {turno.horacita}
                  </span>
                </div>

                <div className="col-span-6 flex flex-col justify-center">
                  <div className="text-4xl font-black uppercase truncate text-white mb-3 tracking-tight">
                    {turno.cliente}
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                      <Car size={18} className="text-gray-400" />
                      <span className="text-2xl text-gray-400 font-bold italic tracking-tight">{turno.vehiculo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-red-600 uppercase tracking-widest">Asesor:</span>
                      <span className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-lg border border-white/5">
                        {turno.asesor}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-center">
                  <div className={`text-4xl font-black uppercase tracking-tighter px-10 py-5 rounded-[25px] shadow-2xl w-full text-center flex items-center justify-center gap-4 border
                    ${turno.estado === 'En espera' ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : ''}
                    ${turno.estado === 'En servicio' ? 'text-blue-500 bg-blue-500/5 border-blue-500/20' : ''}
                    ${turno.estado === 'Vehículo Listo' ? 'text-green-500 bg-green-500/5 border-green-500/20 shadow-green-500/10' : ''}
                  `}>
                    {turno.estado === 'En espera' && <div className="w-3 h-3 bg-amber-500 rounded-full animate-ping"></div>}
                    {turno.estado === 'En servicio' && <Loader2 className="animate-spin" size={28} />}
                    {turno.estado === 'Vehículo Listo' && <CheckCircle2 className="animate-bounce" size={28} />}
                    {turno.estado || 'En espera'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticker de Marketing Infinito */}
      <div className="bg-red-600/10 backdrop-blur-md border-t border-white/5 h-12 flex items-center overflow-hidden flex-shrink-0 z-50">
        <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap gap-20">
          {[...marketingMessages, ...marketingMessages].map((msg, i) => (
            <span key={i} className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-gray-300">
              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Minimalista */}
      <footer className="bg-black/80 px-8 py-3 flex justify-between items-center border-t border-white/5 flex-shrink-0 z-50">
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div> En espera</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> En servicio</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full"></div> Vehículo Listo</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">Nissan Cordoba Experience</span>
           <div className="h-4 w-px bg-white/10"></div>
           <Tv size={14} className="text-red-600 opacity-50" />
        </div>
      </footer>

      {/* Estilos para el Ticker */}
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
