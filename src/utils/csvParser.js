import Papa from 'papaparse';

export const parseDMSCsv = (file) => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const cleanedData = results.data.map((row, index) => {
          // Extraer nombre del cliente
          const nombreCompleto = row.nom_cte || `${row.nombre_s || ''} ${row.paterno || ''} ${row.materno || ''}`.trim();
          
          // Extraer vehículo
          const vehiculo = `${row.nomlinea || ''} ${row.modelo_u || ''}`.trim();

          return {
            id: row.folcita || `temp-${Date.now()}-${index}`,
            folio: row.folcita,
            cliente: nombreCompleto,
            vehiculo: vehiculo,
            horaCita: row.horacita,
            fechaCita: row.fechcita,
            tipoServicio: row.dtiposerv,
            asesor: row.nomven || row.NOMVEN || 'Sin asignar',
            estado: 'Programado', // Estado inicial por defecto para nuevas citas
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
