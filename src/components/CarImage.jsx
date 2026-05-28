import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import nissanLogo from '../assets/logo.png';

const CarImage = ({ vehiculo, className = "w-full h-full object-contain drop-shadow-md" }) => {
  const [catalogo, setCatalogo] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a la base de datos de modelos (catálogo en vivo)
    const unsub = onSnapshot(collection(db, 'catalogo_autos'), (snap) => {
      const mapa = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        mapa[data.modelo.toLowerCase()] = data.imagenBase64;
      });
      setCatalogo(mapa);
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar catálogo de imágenes:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const getModelImage = (vehiculoStr) => {
    if (!vehiculoStr) return null;
    const str = vehiculoStr.toLowerCase();
    
    // Buscar en el catálogo que vino de Firestore
    for (const key of Object.keys(catalogo)) {
      if (str.includes(key)) {
        return catalogo[key];
      }
    }
    
    // Casos de limpieza comunes
    if (str.includes('x-trail') && catalogo['xtrail']) return catalogo['xtrail'];
    if (str.includes('np 300') && catalogo['np300']) return catalogo['np300'];
    
    return null; // Si no hay match, regresará null y usará el logo
  };

  const imageSrc = getModelImage(vehiculo) || nissanLogo;

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {loading ? (
        <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      ) : (
        <img 
          src={imageSrc} 
          alt={`Modelo ${vehiculo}`} 
          className="w-full h-full object-contain transition-all duration-300"
          onError={(e) => {
            // Protección contra Base64 rotos o imágenes corruptas
            e.target.onerror = null; 
            e.target.src = nissanLogo;
          }}
        />
      )}
    </div>
  );
};

export default CarImage;
