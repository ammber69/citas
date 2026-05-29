import { useState, useEffect, useCallback } from 'react';
import { db } from '../utils/firebaseConfig';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

export const useTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1 & 2. Cargar datos iniciales y suscribirse a cambios en tiempo real
  useEffect(() => {
    const q = query(collection(db, 'turnos'), orderBy('created_at', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const turnosData = [];
      snapshot.forEach((doc) => {
        turnosData.push({ id: doc.id, ...doc.data() });
      });
      setTurnos(turnosData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching turnos: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Acciones (ahora en la nube con Firestore)
  const addTurnosFromCsv = useCallback(async (nuevosTurnos) => {
    try {
      // Filtrar los que ya están activos (En servicio o En espera) para no duplicar
      // En este caso, buscaremos por folio
      const querySnapshot = await getDocs(collection(db, 'turnos'));
      const actuales = [];
      querySnapshot.forEach((doc) => {
        actuales.push(doc.data().folio);
      });
      const foliosExistentes = new Set(actuales);
      
      const realmenteNuevos = nuevosTurnos
        .filter(t => !foliosExistentes.has(t.folio))
        .map(t => ({
          folio: t.folio,
          cliente: t.cliente,
          vehiculo: t.vehiculo,
          modelo: t.modelo || '',
          anio: t.anio || '',
          horacita: t.horaCita,
          horaentrega: t.horaEntrega || '',
          asesor: t.asesor || '',
          estado: t.estado || 'Programado',
          created_at: new Date().toISOString()
        }));

      if (realmenteNuevos.length > 0) {
        const batch = writeBatch(db);
        realmenteNuevos.forEach(turno => {
          const newTurnoRef = doc(collection(db, 'turnos')); // Crea una referencia de documento con ID autogenerado
          batch.set(newTurnoRef, turno);
        });
        await batch.commit();
      }
    } catch (error) {
      console.error('Error al subir CSV:', error.message);
      alert('Error al subir datos a la nube');
    }
  }, []);

  const updateEstado = useCallback(async (id, nuevoEstado, dataExtra = {}) => {
    try {
      const updates = { ...dataExtra, estado: nuevoEstado };
      if (nuevoEstado === 'En espera') updates.llegada = new Date().toLocaleTimeString();
      if (nuevoEstado === 'En servicio') updates.inicioservicio = new Date().toLocaleTimeString();
      if (nuevoEstado === 'Listo') updates.finservicio = new Date().toLocaleTimeString();

      const turnoRef = doc(db, 'turnos', id);
      await updateDoc(turnoRef, updates);
    } catch (error) {
      console.error('Error al actualizar estado:', error.message);
    }
  }, []);

  const removeTurno = useCallback(async (id) => {
    try {
      await deleteDoc(doc(db, 'turnos', id));
    } catch (error) {
      console.error('Error al eliminar:', error.message);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (window.confirm('¿Seguro que quieres borrar todos los datos de la nube?')) {
      try {
        const querySnapshot = await getDocs(collection(db, 'turnos'));
        const batch = writeBatch(db);
        querySnapshot.forEach((documento) => {
          batch.delete(documento.ref);
        });
        await batch.commit();
      } catch (error) {
        console.error('Error al limpiar:', error.message);
      }
    }
  }, []);

  return {
    turnos,
    loading,
    addTurnosFromCsv,
    updateEstado,
    removeTurno,
    clearAll
  };
};
