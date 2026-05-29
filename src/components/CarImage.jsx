import React, { useState, useEffect } from 'react';
import { db } from '../utils/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import nissanLogo from '../assets/logo.png';

const CarImage = ({ vehiculo, modelo, anio, className = "w-full h-full object-contain drop-shadow-md" }) => {
  const [catalogo, setCatalogo] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'catalogo_autos'), (snap) => {
      const data = snap.docs.map(doc => doc.data());
      setCatalogo(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const getImage = () => {
    if (catalogo.length === 0) return nissanLogo;

    // Normalizar el modelo recibido para buscar
    const modeloNorm = (modelo || vehiculo || '').toLowerCase()
      .replace('x-trail', 'xtrail')
      .replace('np 300', 'np300')
      .replace('np300', 'np300')
      .replace('frontier 2016', 'frontier') // El "2016" en el nombre es la generación, no el año
      .replace('frontier np300', 'frontier')
      .replace(/\s+\d{4}$/, '') // Quitar año al final si viene junto al nombre
      .trim();

    // Intentar extraer el año del texto del vehículo si no viene definido
    let anioStr = String(anio || '').trim();
    if (!anioStr && vehiculo) {
      const matches = String(vehiculo).match(/\b(20\d{2})\b/g);
      if (matches && matches.length > 0) {
        anioStr = matches[matches.length - 1]; // Tomar el último año encontrado (el año real del auto)
      }
    }

    // --- BÚSQUEDA POR PRIORIDAD ---

    // 1. Coincidencia exacta: modelo + año exacto
    const exacto = catalogo.find(
      item => item.modelo === modeloNorm && String(item.anio) === anioStr
    );
    if (exacto) return exacto.imagenBase64;

    // 2. Año más cercano del mismo modelo (buscar el más próximo)
    const delModelo = catalogo
      .filter(item => item.modelo === modeloNorm && item.anio)
      .map(item => ({ ...item, diff: Math.abs(Number(item.anio) - Number(anioStr)) }))
      .sort((a, b) => a.diff - b.diff);

    if (delModelo.length > 0) return delModelo[0].imagenBase64;

    // 3. Buscar si el texto del vehículo contiene alguna clave del catálogo (fuzzy)
    const textoBuscar = (vehiculo || '').toLowerCase();
    const porTexto = catalogo
      .filter(item => textoBuscar.includes(item.modelo))
      .sort((a, b) => {
        // Preferir el año más cercano si hay año
        if (anioStr) {
          return Math.abs(Number(a.anio) - Number(anioStr)) - Math.abs(Number(b.anio) - Number(anioStr));
        }
        return 0;
      });

    if (porTexto.length > 0) return porTexto[0].imagenBase64;

    // 4. Fallback: logo Nissan
    return nissanLogo;
  };

  const imageSrc = getImage();

  return (
    <div className={`relative flex items-center justify-center w-full h-full`}>
      {loading ? (
        <div className="w-6 h-6 border-2 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
      ) : (
        <img
          src={imageSrc}
          alt={`${modelo || vehiculo} ${anio}`}
          className={className}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = nissanLogo;
          }}
        />
      )}
    </div>
  );
};

export default CarImage;
