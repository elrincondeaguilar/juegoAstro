/**
 * Módulo para guardar resultados del quiz en Google Sheets
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear Google Apps Script Web App (ver GOOGLE_SHEETS_SETUP.md)
 * 2. Configurar la URL del Web App en SHEET_WEB_APP_URL
 */

// URL del Google Apps Script Web App (reemplazar con tu URL después de configurar)
const SHEET_WEB_APP_URL =
  'https://script.google.com/macros/s/AKfycbyOHckCKO7e2xSLSJNFMXGU22lOPSPZqsUl9a0FoW5Mg58_qlGkQikJZFivHUTChvB7/exec';

/**
 * Guarda los resultados del estudiante en Google Sheets
 * @param {Object} data - Datos del estudiante y resultados
 * @param {string} data.nombre - Nombre del estudiante
 * @param {string} data.email - Correo del estudiante (opcional)
 * @param {string} data.grado - Grado del estudiante (11-1, 11-2, 11-3)
 * @param {number} data.correctas - Número de respuestas correctas
 * @param {number} data.total - Total de preguntas
 * @param {number} data.porcentaje - Porcentaje de acierto
 * @param {number} data.nota - Nota de 1 a 5
 * @param {Array} data.respuestas - Array con las respuestas detalladas
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function saveToGoogleSheets(data) {
  // Validar que la URL esté configurada
  if (!SHEET_WEB_APP_URL || SHEET_WEB_APP_URL === 'TU_URL_DEL_WEB_APP_AQUI') {
    console.warn(
      '⚠️ Google Sheets no configurado. Los datos no se guardarán en la nube.',
    );
    console.warn('📝 Ver GOOGLE_SHEETS_SETUP.md para instrucciones de configuración.');
    return {
      success: false,
      error: 'Google Sheets no configurado',
      localSave: true,
    };
  }

  try {
    // Preparar los datos para enviar
    const payload = {
      timestamp: new Date().toISOString(),
      nombre: data.nombre || 'Anónimo',
      email: data.email || '',
      grado: data.grado || 'N/A',
      correctas: data.correctas || 0,
      total: data.total || 0,
      porcentaje: data.porcentaje || 0,
      nota: data.nota || 0,
      respuestas: JSON.stringify(data.respuestas || []),
    };

    // Enviar a Google Sheets vía Web App
    const response = await fetch(SHEET_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors', // Evita CORS preflight; la respuesta será 'opaque'
      // Nota: No establecer 'Content-Type' para evitar preflight; Apps Script leerá el body como texto
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Datos guardados en Google Sheets',
    };
  } catch (error) {
    console.error('❌ Error al guardar en Google Sheets:', error);

    // Guardar localmente como respaldo
    saveToLocalStorage(data);

    return {
      success: false,
      error: error.message,
      localSave: true,
    };
  }
}

/**
 * Guarda los resultados localmente como respaldo
 * @param {Object} data - Datos del estudiante y resultados
 */
function saveToLocalStorage(data) {
  try {
    const key = `quiz_result_${Date.now()}`;
    const payload = {
      ...data,
      timestamp: new Date().toISOString(),
      savedLocally: true,
    };

    localStorage.setItem(key, JSON.stringify(payload));
    console.log('💾 Datos guardados localmente como respaldo:', key);
  } catch (error) {
    console.error('❌ Error al guardar localmente:', error);
  }
}

/**
 * Obtiene todos los resultados guardados localmente
 * @returns {Array} Array de resultados
 */
export function getLocalResults() {
  const results = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quiz_result_')) {
        const data = JSON.parse(localStorage.getItem(key));
        results.push({ key, ...data });
      }
    }
  } catch (error) {
    console.error('Error al leer resultados locales:', error);
  }
  return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Exporta los resultados locales a CSV
 * @returns {string} Contenido CSV
 */
export function exportLocalResultsToCSV() {
  const results = getLocalResults();
  if (results.length === 0) return '';

  const headers = [
    'Fecha',
    'Nombre',
    'Email',
    'Grado',
    'Correctas',
    'Total',
    'Porcentaje',
    'Nota',
  ];
  const rows = results.map((r) => [
    new Date(r.timestamp).toLocaleString('es-CO'),
    r.nombre || 'N/A',
    r.email || '',
    r.grado || 'N/A',
    r.correctas || 0,
    r.total || 0,
    `${r.porcentaje || 0}%`,
    r.nota || 0,
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');
}

/**
 * Descarga los resultados locales como archivo CSV
 */
export function downloadLocalResults() {
  const csv = exportLocalResultsToCSV();
  if (!csv) {
    alert('No hay resultados locales para exportar');
    return;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `resultados_quiz_${new Date().toISOString().split('T')[0]}.csv`,
  );
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
