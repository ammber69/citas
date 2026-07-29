import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTurnos } from '../hooks/useTurnos';
import { useAutoReload } from '../hooks/useAutoReload';
import { getCiudadBySlug } from '../utils/ciudades';
import { ClipboardList, Loader2 } from 'lucide-react';
import logo from '../assets/logo.png';

const TVDisplay = () => {
  const { ciudad: ciudadSlug } = useParams();
  const ciudadInfo = getCiudadBySlug(ciudadSlug);
  const { turnos, loading } = useTurnos(ciudadSlug);
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [offset, setOffset] = useState(0);

  // Auto-recarga: verifica cada 60 segundos si hay un nuevo deployment en Vercel
  useAutoReload(60_000);

  const marketingMessages = [
    "Contamos con servicio de alineación y balanceo computarizado de alta precisión.",
    "Agua de cortesía y WiFi gratis en nuestra sala de espera para su comodidad.",
    "NISSAN INTELLIGENT MOBILITY: Innovación que emociona en cada kilómetro.",
    "Próximamente: Nuevos modelos disponibles para prueba de manejo.",
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

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const nombreSucursal = ciudadInfo ? `Sucursal ${ciudadInfo.nombre}` : `Sucursal ${ciudadSlug}`;
  const footerText = ciudadInfo ? `Nissan ${ciudadInfo.nombre} Experience` : `Nissan ${ciudadSlug} Experience`;

  const turnosPublicos = turnos
    .sort((a, b) => a.horacita.localeCompare(b.horacita));

  const displayTurnos = [...turnosPublicos, ...turnosPublicos];

  // Si la ciudad no existe, mostrar error
  if (!ciudadInfo) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase mb-4">Ciudad no encontrada</h1>
          <p className="text-slate-400 text-lg">La sucursal "{ciudadSlug}" no existe en el sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#f4f7f9] text-slate-900 font-sans flex flex-col relative">
      {/* Header — Escalado para TV 50"+ con unidades vw */}
      <header className="flex justify-between items-center bg-white border-b-2 border-slate-200 flex-shrink-0 z-50 shadow-md"
        style={{ padding: '1.2vw 2.5vw' }}
      >
        <div className="flex items-center" style={{ gap: '2vw' }}>
          {/* Logo con zona de respeto proporcional */}
          <div className="bg-white flex-shrink-0" style={{ padding: '0.4vw' }}>
            <img 
              src={logo} 
              alt="Nissan Logo" 
              className="w-auto object-contain" 
              style={{ height: '8vw' }} 
            />
          </div>
          <Link to="/admin" className="group flex flex-col" style={{ gap: '0.5vw' }}>
            <h2 className="font-black uppercase tracking-tighter text-slate-900 flex items-center leading-none"
              style={{ fontSize: '2.8vw', gap: '0.6vw' }}
            >
              Control de Citas
              <span className="bg-red-600 rounded-full animate-pulse" style={{ width: '0.6vw', height: '0.6vw' }}></span>
            </h2>
            <div className="flex items-center" style={{ gap: '0.8vw' }}>
              <span className="shimmer-text font-black uppercase" 
                style={{ 
                  fontSize: '1vw', 
                  letterSpacing: '0.2em',
                }}
              >
                Innovación que emociona
              </span>
              <span className="bg-slate-300 self-stretch" style={{ width: '1px' }}></span>
              <span className="font-bold text-slate-400 uppercase"
                style={{ fontSize: '1vw', letterSpacing: '0.15em' }}
              >
                {nombreSucursal}
              </span>
            </div>
          </Link>
        </div>
        
        <div className="flex flex-col items-end" style={{ gap: '0.3vw' }}>
          <div className="font-black text-slate-900 leading-none tracking-tighter tabular-nums"
            style={{ fontSize: '4.5vw', fontFamily: "'Montserrat', sans-serif" }}
          >
            {formatTime(currentTime)}
          </div>
          <div className="font-black text-slate-400 uppercase"
            style={{ fontSize: '0.75vw', letterSpacing: '0.25em' }}
          >
            Hora de Atención
          </div>
          <div className="bg-slate-200" style={{ width: '100%', height: '1px', margin: '0.2vw 0' }}></div>
          <div className="font-black text-slate-500 uppercase"
            style={{ fontSize: '0.85vw', letterSpacing: '0.2em' }}
          >
            {formatDate(currentTime)}
          </div>
        </div>
      </header>

      {/* Encabezados de Tabla — escalados */}
      <div className="grid grid-cols-12 bg-slate-800 text-white uppercase font-black flex-shrink-0 z-40"
        style={{ gap: '1vw', padding: '0.8vw 2.5vw', fontSize: '1vw', letterSpacing: '0.25em' }}
      >
        <div className="col-span-2">Hora Cita</div>
        <div className="col-span-4">Cliente / Asesor</div>
        <div className="col-span-2 text-center">Modelo</div>
        <div className="col-span-2 text-center">Tipo de Servicio</div>
        <div className="col-span-2 text-center">Color</div>
      </div>

      {/* Area de Scroll Infinito */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-hidden relative"
      >
        <div 
          ref={contentRef}
          style={{ 
            transform: `translate3d(0, ${-offset}px, 0)`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            padding: '0.8vw 1vw',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '0.6vw'
          }}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '10vw 0' }}>
              <Loader2 className="animate-spin text-red-600" style={{ width: '4vw', height: '4vw', marginBottom: '0.5vw' }} />
              <p className="font-black uppercase text-slate-400" style={{ fontSize: '1.2vw', letterSpacing: '0.2em' }}>Sincronizando...</p>
            </div>
          ) : turnosPublicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center opacity-10" style={{ padding: '10vw 0' }}>
              <ClipboardList className="mb-2" style={{ width: '6vw', height: '6vw' }} />
              <p className="font-black uppercase tracking-tighter text-slate-900" style={{ fontSize: '2.5vw' }}>Sin Citas</p>
            </div>
          ) : (
            displayTurnos.map((turno, idx) => (
              <div 
                key={`${turno.id}-${idx}`} 
                className="grid grid-cols-12 rounded-2xl transition-all relative overflow-hidden bg-white shadow-sm border border-slate-200 items-center"
                style={{ gap: '1vw', padding: '1vw 2vw', borderLeftWidth: '0.6vw', borderLeftColor: '#dc2626' }}
              >
                <div className="col-span-2 flex items-center">
                  <span className="font-black text-slate-800 tracking-tighter tabular-nums"
                    style={{ fontSize: '2.2vw', fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {turno.horacita}
                  </span>
                </div>

                <div className="col-span-4 flex flex-col justify-center">
                  <div className="font-black uppercase truncate text-slate-900 leading-tight"
                    style={{ fontSize: '1.6vw', marginBottom: '0.2vw' }}
                  >
                    {turno.cliente}
                  </div>
                  <div className="flex items-center" style={{ gap: '0.4vw' }}>
                    <span className="font-black text-red-600 uppercase" style={{ fontSize: '0.85vw', letterSpacing: '0.15em' }}>Asesor:</span>
                    <span className="font-bold text-slate-500 uppercase truncate" style={{ fontSize: '0.85vw' }}>{turno.asesor || 'Sin asignar'}</span>
                  </div>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <span className="font-bold text-slate-700 uppercase tracking-tight text-center truncate max-w-full"
                    style={{ fontSize: '1.2vw' }}
                  >
                    {turno.vehiculo || '-'}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <span className="bg-red-50 text-red-600 font-black uppercase border border-red-100 text-center truncate max-w-full"
                    style={{ fontSize: '1vw', padding: '0.3vw 0.8vw', borderRadius: '0.8vw', letterSpacing: '0.1em' }}
                  >
                    {turno.tiposervicio || '-'}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-center">
                  <span className="bg-slate-100 text-slate-700 font-black uppercase border border-slate-200 text-center truncate max-w-full"
                    style={{ fontSize: '1vw', padding: '0.3vw 0.8vw', borderRadius: '0.8vw', letterSpacing: '0.1em' }}
                  >
                    {turno.color || '-'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticker de Marketing — escalado */}
      <div className="bg-slate-900 flex items-center overflow-hidden flex-shrink-0 z-50 shadow-lg"
        style={{ height: '3vw' }}
      >
        <div className="flex animate-[marquee_60s_linear_infinite] whitespace-nowrap" style={{ gap: '4vw' }}>
          {[...marketingMessages, ...marketingMessages].map((msg, i) => (
            <span key={i} className="flex items-center font-black uppercase text-white"
              style={{ gap: '0.8vw', fontSize: '0.9vw', letterSpacing: '0.15em' }}
            >
              <span className="bg-red-600 rounded-full" style={{ width: '0.5vw', height: '0.5vw' }}></span>
              {msg}
            </span>
          ))}
        </div>
      </div>

      {/* Footer — escalado */}
      <footer className="bg-white flex justify-center items-center border-t border-slate-200 flex-shrink-0 z-50"
        style={{ padding: '0.6vw 2.5vw' }}
      >
        <div className="italic text-red-600 opacity-60 font-black uppercase"
          style={{ fontSize: '0.8vw', letterSpacing: '0.1em' }}
        >
          {footerText}
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .shimmer-text {
          background: 
            linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.7) 50%, transparent 80%) no-repeat,
            linear-gradient(to right, #D4A017, #dc2626);
          background-size: 40% 100%, 100% 100%;
          background-position: -200% center, 0 0;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s ease-in-out infinite;
        }

        @keyframes shimmer {
          0%   { background-position: -200% center, 0 0; }
          50%  { background-position: 300% center, 0 0; }
          100% { background-position: 300% center, 0 0; }
        }
      `}
      </style>
    </div>
  );
};

export default TVDisplay;
