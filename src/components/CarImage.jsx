import React from 'react';
import nissanLogo from '../assets/logo.png';

const carImages = {
  versa: '/images/models/versa.png',
  sentra: '/images/models/sentra.png',
  march: '/images/models/march.png',
  kicks: '/images/models/kicks.png',
  xtrail: '/images/models/xtrail.png',
  frontier: '/images/models/frontier.png',
  np300: '/images/models/np300.png',
  pathfinder: '/images/models/pathfinder.png',
  murano: '/images/models/murano.png',
  altima: '/images/models/altima.png',
  maxima: '/images/models/maxima.png',
  armada: '/images/models/armada.png',
  leaf: '/images/models/leaf.png',
  ariya: '/images/models/ariya.png',
};

const getModelKey = (vehiculoStr) => {
  if (!vehiculoStr) return null;
  const str = vehiculoStr.toLowerCase();
  
  // Try to match any of our keys in the string
  for (const key of Object.keys(carImages)) {
    if (str.includes(key)) {
      return key;
    }
  }
  
  // Specific fallbacks or variations
  if (str.includes('x-trail')) return 'xtrail';
  if (str.includes('np 300')) return 'np300';
  
  return null;
};

const CarImage = ({ vehiculo, className = "w-full h-full object-contain drop-shadow-md" }) => {
  const modelKey = getModelKey(vehiculo);
  // Default to logo if no match is found
  const imageSrc = modelKey ? carImages[modelKey] : nissanLogo;

  return (
    <img 
      src={imageSrc} 
      alt={`Modelo ${vehiculo}`} 
      className={className}
      onError={(e) => {
        // Fallback to logo if the specific model image hasn't been uploaded to public folder yet
        e.target.onerror = null; 
        e.target.src = nissanLogo;
      }}
    />
  );
};

export default CarImage;
