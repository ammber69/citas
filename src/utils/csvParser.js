import Papa from 'papaparse';

export const parseDMSCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: "ISO-8859-1", // Forzar lectura de caracteres en español (Ñ, acentos)
      complete: (results) => {
        const cleanedData = results.data.map((row, index) => {
          // Extraer nombre del cliente
          const nombreCompleto = row.nom_cte || `${row.nombre_s || ''} ${row.paterno || ''} ${row.materno || ''}`.trim();
          
          // Extraer modelo y año por separado para la búsqueda de imagen
          const modeloRaw = (row.nomlinea || '').trim();   // Ej: "VERSA", "MARCH", "FRONTIER 2016"
          const anio = (row.modelo_u || '').trim();        // Ej: "2025", "2022"
          
          // Campo combinado para mostrar en pantalla (ej: "VERSA 2025")
          const vehiculo = `${modeloRaw} ${anio}`.trim();

          return {
            id: row.folcita || `temp-${Date.now()}-${index}`,
            folio: row.folcita,
            cliente: nombreCompleto,
            vehiculo: vehiculo,       // Texto completo para mostrar
            modelo: modeloRaw,        // Solo el modelo (para búsqueda de imagen)
            anio: anio,               // Solo el año (para búsqueda exacta de imagen)
            horaCita: row.horacita,
            fechaCita: row.fechcita,
            tipoServicio: row.dtiposerv,
            asesor: row.nomven || row.NOMVEN || 'Sin asignar',
            estado: 'Programado',
            horaEntrega: null,
            llegada: null,
            inicioServicio: null,
            finServicio: null,
            retrasado: false,
          };
        });
        resolve(cleanedData);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
