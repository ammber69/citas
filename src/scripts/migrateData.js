/**
 * Script de migración: copia documentos de 'turnos' → 'turnos_cordoba'
 * 
 * Ejecutar UNA SOLA VEZ desde la consola del navegador o como script Node.
 * 
 * Para ejecutar desde la consola del navegador:
 * 1. Abre la app en el browser
 * 2. Abre la consola de dev tools (F12)
 * 3. Importa y ejecuta: 
 *    import('/src/scripts/migrateData.js').then(m => m.migrateTurnos())
 * 
 * O simplemente navega a una ruta temporal que llame esta función.
 */

import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  getDocs, 
  doc, 
  writeBatch 
} from 'firebase/firestore';

export const migrateTurnos = async () => {
  console.log('🚀 Iniciando migración de turnos → turnos_cordoba...');
  
  try {
    // 1. Leer todos los documentos de la colección 'turnos'
    const snapshot = await getDocs(collection(db, 'turnos'));
    
    if (snapshot.empty) {
      console.log('⚠️ La colección "turnos" está vacía. Nada que migrar.');
      return;
    }

    console.log(`📋 Encontrados ${snapshot.size} documentos en "turnos"`);

    // 2. Copiar cada documento a 'turnos_cordoba'
    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((documento) => {
      const data = documento.data();
      // Usar el mismo ID del documento original
      const newRef = doc(db, 'turnos_cordoba', documento.id);
      batch.set(newRef, data);
      count++;
    });

    // 3. Ejecutar el batch
    await batch.commit();
    console.log(`✅ Migración completada: ${count} documentos copiados a "turnos_cordoba"`);
    console.log('');
    console.log('📌 Siguiente paso: Verifica que los datos estén bien en turnos_cordoba');
    console.log('   y luego puedes borrar la colección "turnos" original si lo deseas.');
    
    return { success: true, count };
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    return { success: false, error: error.message };
  }
};
