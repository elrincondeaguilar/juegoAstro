# 🧠 Traventhi Game

Juego educativo con Three.js y Astro que mezcla un minijuego 3D con un quiz de 5 preguntas. Recoge el nombre y grado del estudiante al inicio, calcula la nota (1–5) y guarda los resultados automáticamente en Google Sheets con respaldo local y exportación CSV.

![image](https://github.com/user-attachments/assets/b2964015-d58b-4909-98a0-fe31f5081a5a)

# 🎮 Game Preview

https://github.com/user-attachments/assets/6a93d420-6dce-428f-90fa-12762deb749b

## ✨ Características principales

- Inicio con formulario del estudiante: nombre y grado (11-1, 11-2, 11-3) obligatorio para jugar.
- Quiz de 5 preguntas aleatorias desde `public/js/questions.json` con resultados simplificados.
- Cálculo de nota en escala 1–5 y celebración especial en puntuación perfecta.
- Reinicio controlado: el botón “Reiniciar” detiene el juego, muestra nuevamente el formulario y comienza solo tras enviarlo.
- Resultados enviados a Google Sheets (Apps Script) + respaldo local automático y exportación CSV.
- Página de resultados local en `/resultados.html` para consultar, exportar o limpiar el respaldo.
- Página de inicio configurada para cargar el juego directamente e inclusión de página 404 personalizada.

## 🖥 Requisitos y servidor de desarrollo

- Node.js 18+ recomendado.
- Instala dependencias y ejecuta el servidor de desarrollo:

```sh
npm install
npm run dev
```

El proyecto usa Astro. Por defecto abre en `http://localhost:4321`.

## 🔌 Integración con Google Sheets

El proyecto incluye una integración lista para usar con Google Apps Script. Sigue la guía detallada en `GOOGLE_SHEETS_SETUP.md` para:

1) Crear la hoja con encabezados sugeridos.
2) Crear y desplegar el Web App (doGet/doPost).
3) Configurar la URL del Web App en `public/js/sheets.js` (const `SHEET_WEB_APP_URL`).
4) Probar el flujo completando un quiz y verificando que se agregue una fila.

Notas importantes:
- Si no configuras la URL, los resultados se guardan en respaldo local automáticamente.
- El envío se hace en modo “no-cors” para evitar preflight; el Apps Script debe estar desplegado como “Cualquier usuario” y “Ejecutar como: Yo”.

## 📄 Resultados locales y visor

- Los resultados se guardan en el navegador cuando no hay conexión o si Sheets no está configurado.
- Abre `http://localhost:4321/resultados.html` durante el desarrollo (o `/resultados.html` en producción) para:
	- Ver estadísticas rápidas.
	- Exportar a CSV.
	- Limpiar el respaldo local.

## 🧭 Flujo del juego

1) Al entrar, verás un formulario para Nombre y Grado. Tras enviarlo y cargar las preguntas, el juego inicia.
2) Durante el juego se muestran preguntas; al finalizar, aparece el modal de resultados con la nota y el resumen.
3) Los resultados se envían a Sheets (si está configurado) y siempre se respaldan localmente.
4) Al pulsar “Reiniciar”, el juego se detiene y vuelve a pedir Nombre y Grado para el siguiente estudiante.

## 🛠️ Estructura y archivos relevantes

- `src/components/juegoThree/JuegoTh.astro`: Contenedor del juego y modales (inicio, preguntas, resultados).
- `src/pages/index.astro`: Página de inicio que carga el juego.
- `public/js/game.js`: Lógica del minijuego con Three.js y bucle de render.
- `public/js/main.js`: Inicio del juego, formulario del estudiante y reinicio controlado.
- `public/js/modal.js`: Lógica de preguntas y resultados.
- `public/js/questions.json`: Banco de preguntas.
- `public/js/sheets.js`: Envío a Google Sheets y respaldo local/CSV.
- `public/resultados.html`: Visor de resultados locales.
- `GOOGLE_SHEETS_SETUP.md`: Guía paso a paso para configurar Google Sheets.

## 🧞 Commands

Todos los comandos se ejecutan desde la raíz del proyecto, en un terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Instala dependencias                             |
| `npm run dev`             | Inicia el servidor en `localhost:4321`           |
| `npm run build`           | Construye producción en `./dist/`                 |
| `npm run preview`         | Previsualiza el build localmente                  |
| `npm run astro ...`       | Comandos CLI como `astro add`, `astro check`     |
| `npm run astro -- --help` | Ayuda del CLI de Astro                           |

## 🧯 Solución de problemas

- No se guardan datos en Sheets: Revisa `public/js/sheets.js` (URL) y permisos del Web App (Ejecutar como: Yo, Acceso: Cualquier usuario). Consulta `GOOGLE_SHEETS_SETUP.md`.
- Error de CORS o 401/403: Vuelve a implementar el Apps Script con la configuración correcta.
- El avión no aparece tras reiniciar: asegúrate de recargar si tocaste archivos del juego; el flujo normal ya reinicia limpiamente.

## 🔐 Privacidad

Solo se guardan: fecha, nombre, grado, aciertos, total, porcentaje, nota y un resumen de respuestas. El respaldo local se almacena en el navegador del equipo donde se juega y puede exportarse/limpiarse desde `/resultados.html`.
