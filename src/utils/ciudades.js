/**
 * Configuración centralizada de las 6 agencias.
 * Cada objeto contiene el slug (para URLs), nombre display, y nombre de colección Firestore.
 */
export const CIUDADES = [
  { slug: 'cordoba',       nombre: 'Córdoba',       coleccion: 'turnos_cordoba' },
  { slug: 'orizaba',       nombre: 'Orizaba',       coleccion: 'turnos_orizaba' },
  { slug: 'tierrablanca',  nombre: 'Tierrablanca',  coleccion: 'turnos_tierrablanca' },
  { slug: 'tuxtepec',      nombre: 'Tuxtepec',      coleccion: 'turnos_tuxtepec' },
  { slug: 'salinacruz',    nombre: 'Salina Cruz',   coleccion: 'turnos_salinacruz' },
  { slug: 'juchitan',      nombre: 'Juchitán',      coleccion: 'turnos_juchitan' },
];

/**
 * Obtener la config de una ciudad por su slug.
 * @param {string} slug — ej: 'cordoba'
 * @returns {object|undefined}
 */
export const getCiudadBySlug = (slug) => {
  return CIUDADES.find(c => c.slug === slug);
};

/**
 * Obtener el nombre de la colección Firestore para una ciudad.
 * @param {string} slug — ej: 'orizaba'
 * @returns {string} — ej: 'turnos_orizaba'
 */
export const getColeccion = (slug) => {
  const ciudad = getCiudadBySlug(slug);
  return ciudad ? ciudad.coleccion : null;
};
