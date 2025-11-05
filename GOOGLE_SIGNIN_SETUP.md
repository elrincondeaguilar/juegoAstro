# 🔐 Configuración de Google Sign-In

Esta guía te ayudará a configurar el botón "Iniciar sesión con Google" para que los estudiantes puedan acceder automáticamente con su cuenta de Google y se auto-complete su nombre y email.

## 🎯 Beneficios

- ✅ **Auto-completado**: Nombre y email se llenan automáticamente
- ✅ **Verificación**: Garantiza que el email es real y pertenece al estudiante
- ✅ **Mejor UX**: Un solo clic para iniciar sesión
- ✅ **Seguridad**: Usa OAuth 2.0 de Google (estándar de la industria)

## 📋 Requisitos Previos

- Una cuenta de Google (puede ser personal o de workspace)
- Acceso a [Google Cloud Console](https://console.cloud.google.com)

---

## 🚀 Paso 1: Crear Proyecto en Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Haz clic en el selector de proyectos (parte superior)
3. Clic en **"Proyecto nuevo"**
4. Nombre del proyecto: `Quiz Fisica EFE Gomez` (o el que prefieras)
5. Haz clic en **"Crear"**
6. Espera unos segundos y selecciona el proyecto recién creado

---

## 🔑 Paso 2: Configurar Pantalla de Consentimiento OAuth

1. En el menú lateral, ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (o "Interno" si tienes Google Workspace y solo quieres que accedan usuarios de tu dominio)
3. Haz clic en **"Crear"**

### Completar información:

**Información de la aplicación:**
- Nombre de la aplicación: `Quiz de Física - EFE Gómez`
- Correo electrónico de asistencia: (tu correo)
- Logotipo de la aplicación: (opcional, puedes dejarlo vacío)

**Dominios autorizados:**
- Si tienes dominio propio, agrégalo aquí
- Si usas localhost o Vercel/Netlify, déjalo vacío por ahora

**Información de contacto del desarrollador:**
- Agrega tu correo electrónico

4. Haz clic en **"Guardar y continuar"**

**Ámbitos (Scopes):**
- No necesitas agregar ámbitos adicionales (por defecto traerá email y perfil)
- Haz clic en **"Guardar y continuar"**

**Usuarios de prueba (solo si elegiste "Externo"):**
- Agrega los correos de las personas que probarán (máximo 100)
- O publica la app cuando esté lista (verifica con Google)

5. Haz clic en **"Guardar y continuar"**
6. Revisa el resumen y haz clic en **"Volver al panel"**

---

## 🔐 Paso 3: Crear Credenciales OAuth 2.0

1. En el menú lateral, ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ CREAR CREDENCIALES"**
3. Selecciona **"ID de cliente de OAuth"**

### Configurar el ID de cliente:

**Tipo de aplicación:**
- Selecciona **"Aplicación web"**

**Nombre:**
- `Quiz Fisica Web Client`

**Orígenes de JavaScript autorizados:**
Agrega todos los dominios desde donde se accederá:
```
http://localhost:4321
http://localhost:5173
https://tu-dominio.com
https://tu-app.vercel.app
https://tu-app.netlify.app
```

⚠️ **IMPORTANTE**: No agregues `/` al final de las URLs

**URI de redireccionamiento autorizados:**
- Déjalo vacío (no es necesario para Google Identity Services)

4. Haz clic en **"Crear"**

---

## 📝 Paso 4: Copiar el Client ID

1. Una vez creado, aparecerá un modal con tu **Client ID**
2. Se verá algo como: `123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com`
3. **Copia este ID** (lo necesitarás en el siguiente paso)

También puedes verlo más tarde en:
- **"APIs y servicios"** → **"Credenciales"**
- En la sección **"ID de clientes de OAuth 2.0"**

---

## ⚙️ Paso 5: Configurar en tu Proyecto

1. Abre el archivo `public/js/var.env.js`
2. Pega tu Client ID:

```javascript
export const API_URL = 'https://66aad7e8636a4840d7c8aa19.mockapi.io/questions';

// Configuración opcional para Google Identity Services
export const GOOGLE_CLIENT_ID = '123456789012-abc123def456ghi789jkl012mno345pqr.apps.googleusercontent.com';
```

3. **Guarda el archivo**

---

## ✅ Paso 6: Probar

1. **Reinicia** el servidor de desarrollo si está corriendo:
   ```bash
   # Detener con Ctrl+C
   npm run dev
   ```

2. Abre el juego en tu navegador
3. Deberías ver el botón **"Acceder con Google"** en el formulario de inicio
4. Haz clic y selecciona tu cuenta de Google
5. Los campos de nombre y email se auto-completarán

---

## 🔧 Solución de Problemas

### ❌ "Error 400: redirect_uri_mismatch"

- Verifica que la URL actual esté en **"Orígenes de JavaScript autorizados"**
- No debe tener `/` al final
- Debe incluir el protocolo (`http://` o `https://`)
- Recarga la página después de agregar el origen

### ❌ "Error 401: invalid_client"

- Verifica que el `GOOGLE_CLIENT_ID` en `var.env.js` sea correcto
- Asegúrate de copiar el ID completo (incluye `.apps.googleusercontent.com`)

### ❌ "Error 403: access_denied"

- Si tu app está en modo "Externo" y no publicada:
  - Ve a **"Pantalla de consentimiento de OAuth"**
  - Agrega el correo del usuario en **"Usuarios de prueba"**
- O publica la aplicación (requiere verificación de Google)

### ❌ El botón no aparece

- Verifica que `GOOGLE_CLIENT_ID` no esté vacío en `var.env.js`
- Abre la consola del navegador (F12) y busca mensajes de error
- Verifica que no haya bloqueadores de ads/trackers deshabilitando Google APIs

### ❌ "This browser or app may not be secure"

- Esto ocurre cuando usas Google Sign-In en localhost con navegadores antiguos
- Solución 1: Usa Chrome/Edge/Firefox actualizado
- Solución 2: Despliega en un dominio HTTPS (Vercel, Netlify, etc.)

---

## 🌐 Desplegar en Producción

Cuando despliegues tu aplicación:

1. Agrega el dominio de producción a **"Orígenes de JavaScript autorizados"**:
   ```
   https://tu-dominio-real.com
   ```

2. Si usas plataformas como Vercel o Netlify:
   ```
   https://quiz-fisica.vercel.app
   https://quiz-fisica.netlify.app
   ```

3. **Importante**: Cada vez que cambies de dominio o agregues uno nuevo:
   - Ve a Google Cloud Console
   - Actualiza los orígenes autorizados
   - Espera ~5 minutos para que los cambios se propaguen

---

## 🔒 Seguridad y Privacidad

- El `Client ID` es **público** y puede estar en tu código sin problemas
- Solo se pueden usar desde los dominios autorizados
- Nunca compartas el **Client Secret** (aunque no lo usamos en esta integración)
- Google NO comparte la contraseña del usuario contigo
- Solo recibes: nombre, email y foto de perfil (si la tiene)

---

## 📊 Integración con Google Sheets

Los datos del usuario (nombre y email) se guardarán automáticamente en Google Sheets junto con los resultados del quiz. Ver `GOOGLE_SHEETS_SETUP.md` para más detalles.

---

## 📱 Compatibilidad

Google Sign-In funciona en:
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Opera (Desktop & Mobile)

⚠️ Puede tener problemas en:
- Navegadores muy antiguos (IE11 y anteriores)
- WebViews de apps móviles (depende de la configuración)

---

## 📚 Recursos Adicionales

- [Documentación oficial de Google Identity](https://developers.google.com/identity/gsi/web)
- [Consola de Google Cloud](https://console.cloud.google.com)
- [Ejemplos de integración](https://developers.google.com/identity/gsi/web/guides/overview)

---

¡Listo! Ahora tus estudiantes pueden acceder con un solo clic usando su cuenta de Google. 🎉
