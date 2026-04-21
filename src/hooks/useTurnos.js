import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

export const useTurnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos iniciales
  const fetchTurnos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('turnos')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTurnos(data || []);
    } catch (error) {
      console.error('Error cargando turnos:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTurnos();

    // 2. Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('public:turnos')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'turnos' }, (payload) => {
        console.log('Cambio detectado:', payload);
        
        if (payload.eventType === 'INSERT') {
          setTurnos(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setTurnos(prev => prev.map(t => t.id === payload.new.id ? payload.new : t));
        } else if (payload.eventType === 'DELETE') {
          setTurnos(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTurnos]);

  // 3. Acciones (ahora en la nube)
  const addTurnosFromCsv = useCallback(async (nuevosTurnos) => {
    try {
      // Filtrar los que ya están activos (En servicio o En espera) para no duplicar
      // En este caso, buscaremos por folio
      const { data: actuales } = await supabase.from('turnos').select('folio');
      const foliosExistentes = new Set(actuales?.map(t => t.folio));
      
      const realmenteNuevos = nuevosTurnos
        .filter(t => !foliosExistentes.has(t.folio))
        .map(t => ({
          folio: t.folio,
          cliente: t.cliente,
          vehiculo: t.vehiculo,
          horacita: t.horaCita,
          horaentrega: t.horaEntrega || '',
          asesor: t.asesor || '',
          estado: t.estado || 'Programado'
        }));

      if (realmenteNuevos.length > 0) {
        const { error } = await supabase.from('turnos').insert(realmenteNuevos);
        if (error) throw error;
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

      const { error } = await supabase
        .from('turnos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error al actualizar estado:', error.message);
    }
  }, []);

  const removeTurno = useCallback(async (id) => {
    try {
      const { error } = await supabase.from('turnos').delete().eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error al eliminar:', error.message);
    }
  }, []);

  const clearAll = useCallback(async () => {
    if (window.confirm('¿Seguro que quieres borrar todos los datos de la nube?')) {
      try {
        // En Supabase, para borrar todo se suele hacer un delete sin filtros o con un filtro que siempre sea true
        const { error } = await supabase.from('turnos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) throw error;
        setTurnos([]);
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
