# 📊 Configuración de Google Sheets para Guardar Resultados

Esta guía te ayudará a configurar Google Sheets para guardar automáticamente los resultados del quiz.

## 🎯 Paso 1: Crear la Hoja de Cálculo

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala: **"Resultados Quiz Física - EFE Gómez"**
4. En la primera fila, agrega estos encabezados:

| A     | B      | C     | D         | E     | F          | G    | H          |
| ----- | ------ | ----- | --------- | ----- | ---------- | ---- | ---------- |
| Fecha | Nombre | Grado | Correctas | Total | Porcentaje | Nota | Respuestas |

## 🔧 Paso 2: Crear el Google Apps Script

1. En tu hoja de cálculo, ve a **Extensiones → Apps Script**
2. Borra el código que aparece por defecto
3. Copia y pega este código:

```javascript
/**
 * Web App para recibir resultados del quiz
 */

/**
 * Función GET - Muestra página de confirmación cuando visitas la URL
 */
function doGet() {
  return ContentService.createTextOutput(
    '✅ API funcionando correctamente. Listo para recibir resultados del quiz.',
  ).setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Función POST - Recibe y guarda los datos del quiz
 */
function doPost(e) {
  try {
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Parsear los datos recibidos
    const data = JSON.parse(e.postData.contents);

    // Preparar la fila de datos
    const row = [
      new Date(data.timestamp),
      data.nombre,
      data.grado,
      data.correctas,
      data.total,
      data.porcentaje + '%',
      data.nota,
      data.respuestas,
    ];

    // Agregar la fila a la hoja
    sheet.appendRow(row);

    // Respuesta exitosa
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (error) {
    // Respuesta de error
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Función de prueba (opcional)
 */
function testDoPost() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        nombre: 'Juan Pérez',
        grado: '11-1',
        correctas: 4,
        total: 5,
        porcentaje: 80,
        nota: 4,
        respuestas: '[{"question":"Test","correct":true}]',
      }),
    },
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
```

4. **Guarda el proyecto** con el nombre: `Quiz Results API`

## 🚀 Paso 3: Desplegar como Web App

1. En Apps Script, haz clic en **Implementar → Nueva implementación**
2. En "Selecciona el tipo", elige **Aplicación web**
3. Configura así:
   - **Descripción**: `API para guardar resultados del quiz`
   - **Ejecutar como**: `Yo (tu correo)`
   - **Quien tiene acceso**: `Cualquier usuario`
4. Haz clic en **Implementar**
5. **Copia la URL** que aparece (termina en `/exec`)
   - Se verá algo como: `https://script.google.com/macros/s/AKfycby.../exec`

## ⚙️ Paso 4: Configurar en tu Proyecto

1. Abre el archivo `public/js/sheets.js`
2. Busca esta línea:

```javascript
const SHEET_WEB_APP_URL = 'TU_URL_DEL_WEB_APP_AQUI';
```

3. Reemplázala con tu URL:

```javascript
const SHEET_WEB_APP_URL = 'https://script.google.com/macros/s/TU_ID_AQUI/exec';
```

## ✅ Paso 5: Probar

1. Guarda los cambios
2. Recarga tu juego en el navegador
3. Completa un quiz
4. Ve a tu Google Sheet y verifica que aparezca una nueva fila con los datos

## 🔒 Seguridad y Privacidad

- Los datos solo pueden ser escritos por tu aplicación
- Solo tú puedes ver y editar la hoja de cálculo
- Los estudiantes no tienen acceso a los resultados de otros
- Puedes configurar permisos adicionales en Google Sheets

## 📈 Características Adicionales

### Ver Estadísticas

En Google Sheets puedes agregar fórmulas para ver:

- Promedio de notas por grado
- Estudiantes con mejor/peor desempeño
- Preguntas más difíciles

### Ejemplo de fórmulas útiles:

```
// Promedio de notas del grado 11-1
=AVERAGEIF(C:C,"11-1",G:G)

// Contar estudiantes que aprobaron (nota >= 3)
=COUNTIF(G:G,">=3")

// Porcentaje de aprobación
=COUNTIF(G:G,">=3")/COUNTA(G:G)*100
```

## 🆘 Solución de Problemas

### ❌ "No se pudo guardar en Google Sheets"

- Verifica que la URL en `sheets.js` sea correcta
- Asegúrate de que el Web App esté desplegado como "Cualquier usuario"
- Revisa la consola del navegador para más detalles

### ❌ "Error 403 o 401"

- Re-despliega el Web App
- Verifica que "Ejecutar como" esté configurado como "Yo"

### ❌ Los datos no aparecen en la hoja

- Verifica que los encabezados en la primera fila coincidan
- Prueba la función `testDoPost()` en Apps Script

## 📱 Respaldo Local

El sistema guarda automáticamente los resultados en el navegador si:

- No hay conexión a Internet
- Google Sheets no está configurado
- Ocurre un error al enviar

Puedes exportar estos datos locales más tarde usando la consola:

```javascript
// En la consola del navegador
import('./js/sheets.js').then((m) => m.downloadLocalResults());
```

---

## 🎓 Uso Educativo

Esta configuración es ideal para:

- Hacer seguimiento del progreso de estudiantes
- Identificar temas que necesitan refuerzo
- Generar reportes de desempeño
- Exportar datos a Excel o PDF

¡Listo! Ahora cada vez que un estudiante complete el quiz, sus resultados se guardarán automáticamente en tu Google Sheet. 📊✨
