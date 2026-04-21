import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTurnos } from '../hooks/useTurnos';
import { Clock, Car, Settings } from 'lucide-react';
import logo from '../assets/logo.png';

const TVDisplay = () => {
  const { turnos, loading } = useTurnos();
  const [currentTime, setCurrentTime] = useState(new Date());
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [offset, setOffset] = useState(0);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Lógica de Scroll Infinito HACIA ARRIBA (Seamless Loop)
  useEffect(() => {
    if (loading || turnos.length === 0) return;

    let animationFrame;
    let currentOffset = 0;
    const speed = 0.8; // Velocidad de subida

    const animate = () => {
      if (!containerRef.current || !contentRef.current) return;

      const containerHeight = containerRef.current.offsetHeight;
      const totalContentHeight = contentRef.current.offsetHeight;
      const singleListHeight = totalContentHeight / 2;

      // Solo scrollear si la lista original es más grande que el contenedor
      if (singleListHeight > containerHeight) {
        currentOffset += speed;

        // Al llegar al final de la primera lista, reiniciamos a 0 para que sea infinito
        if (currentOffset >= singleListHeight) {
          currentOffset = 0;
        }

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

  // Duplicamos la lista para el efecto de bucle infinito
  const displayTurnos = [...turnosPublicos, ...turnosPublicos];

  return (
    <div className="h-screen overflow-hidden bg-white text-black font-sans flex flex-col">
      {/* Header Fijo */}
      <header className="flex justify-between items-center border-b-2 border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="px-2">
            <img src={logo} alt="Nissan Logo" className="h-26 w-auto object-contain" />
          </div>
          <Link to="/admin" className="group flex flex-col">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-2 leading-none">
              ESTADO DE SERVICIO
              <Settings size={14} className="text-gray-200 opacity-0 group-hover:opacity-100 transition-all" />
            </h2>
            <span className="text-[10px] font-black text-nissan-red tracking-[0.2em] uppercase">Innovación que emociona</span>
          </Link>
        </div>
        <div className="text-right flex items-baseline gap-4">
          <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Sucursal Córdoba</div>
          <div className="text-4xl font-mono font-black text-black leading-none">{formatTime(currentTime)}</div>
        </div>
      </header>

      {/* Encabezados de Tabla */}
      <div className="grid grid-cols-12 gap-4 px-8 py-3 bg-black text-white uppercase text-lg font-black tracking-widest flex-shrink-0 z-20">
        <div className="col-span-2">Cita</div>
        <div className="col-span-6">Cliente / Vehículo</div>
        <div className="col-span-4 text-center">Estado Actual</div>
      </div>

      {/* Area de Scroll Infinito HACIA ARRIBA */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-hidden relative bg-gray-50"
      >
        <div 
          ref={contentRef}
          style={{ 
            // Invertimos el offset para que el movimiento sea hacia ARRIBA
            transform: `translateY(${-offset}px)`,
          }}
          className="grid grid-cols-1 gap-4 p-2"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-nissan-red"></div>
            </div>
          ) : turnosPublicos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 opacity-10">
              <Car size={150} />
              <p className="text-4xl mt-4 font-black uppercase">Sin Citas</p>
            </div>
          ) : (
            displayTurnos.map((turno, idx) => (
              <div 
                key={`${turno.id}-${idx}`} 
                className={`grid grid-cols-12 gap-4 px-8 py-6 border-l-[16px] shadow-lg rounded-r-lg bg-white
                  ${turno.estado === 'Vehículo Listo' ? 'border-green-500' : ''}
                  ${turno.estado === 'En servicio' ? 'border-blue-500' : ''}
                  ${turno.estado === 'En espera' ? 'border-yellow-500' : ''}
                  ${!turno.estado ? 'border-gray-300' : ''}
                `}
              >
                <div className="col-span-2 flex items-center">
                  <span className="text-4xl font-mono font-black text-black">{turno.horacita}</span>
                </div>

                <div className="col-span-6 flex flex-col justify-center">
                  <div className="text-3xl font-black uppercase truncate text-black mb-1">{turno.cliente}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-xl text-gray-500 font-black italic truncate">{turno.vehiculo}</div>
                    <div className="text-lg text-nissan-red font-black uppercase bg-red-50 px-2">Atiende: {turno.asesor}</div>
                  </div>
                </div>

                <div className="col-span-4 flex items-center justify-center">
                  <div className={`text-3xl font-black uppercase tracking-tighter px-6 py-3 rounded-lg shadow-inner w-full text-center
                    ${turno.estado === 'En espera' ? 'text-yellow-700 bg-yellow-50' : ''}
                    ${turno.estado === 'En servicio' ? 'text-blue-700 bg-blue-50' : ''}
                    ${turno.estado === 'Vehículo Listo' ? 'text-green-700 bg-green-50' : ''}
                  `}>
                    {turno.estado || 'En espera'}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Compacto */}
      <footer className="mt-auto bg-white p-3 flex justify-between items-center border-t-4 border-gray-100 flex-shrink-0 z-20">
        <div className="flex gap-8 text-sm font-black uppercase">
          <span className="flex items-center gap-2 text-yellow-600"><div className="w-3 h-3 bg-yellow-500 rounded-full shadow-md"></div> En espera</span>
          <span className="flex items-center gap-2 text-blue-600"><div className="w-3 h-3 bg-blue-500 rounded-full shadow-md animate-pulse"></div> En servicio</span>
          <span className="flex items-center gap-2 text-green-600"><div className="w-3 h-3 bg-green-500 rounded-full shadow-md"></div> Vehículo Listo</span>
        </div>
        <div className="text-lg font-black italic tracking-tighter text-nissan-red opacity-50">NISSAN CORDOBA</div>
      </footer>
    </div>
  );
};

export default TVDisplay;
