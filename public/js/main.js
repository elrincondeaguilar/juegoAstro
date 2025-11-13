// Encargado de los request a la API
import { getQuestions } from './questions.js';
import { GOOGLE_CLIENT_ID } from './var.env.js';

// Manejador del inicio del juego
const startGame = init;

// Flags para coordinar el inicio: preguntas cargadas + datos de jugador
let questionsLoaded = false;
let playerReady = false;

function tryStartGame() {
  if (questionsLoaded && playerReady) {
    // Pequeña pausa para que cierre el modal suavemente
    setTimeout(() => startGame(), 500);
    // Activar anti-cheat al iniciar el juego realmente
    setupAntiCheat();
  }
}

// ========== GOOGLE SIGN-IN INTEGRATION ==========
// Inicializar Google Identity Services si está configurado
function initGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
    return;
  }

  // Esperar a que google.accounts.id esté disponible
  const checkGoogle = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      clearInterval(checkGoogle);

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
      });

      // Renderizar el botón en el contenedor
      const container = document.getElementById('googleSignIn');
      if (container) {
        google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'es',
          width: '100%',
        });
      }
    }
  }, 100);

  // Timeout de seguridad (10 segundos)
  setTimeout(() => clearInterval(checkGoogle), 10000);
}

// Callback cuando el usuario se autentica con Google
function handleGoogleSignIn(response) {
  try {
    // El JWT viene en response.credential
    const jwt = response.credential;

    // Decodificar el payload del JWT (es la parte del medio)
    const base64Url = jwt.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));

    // Autocompletar los campos con la info de Google
    const nameInput = document.getElementById('playerName');
    const emailInput = document.getElementById('playerEmail');

    if (nameInput && payload.name) {
      nameInput.value = payload.name;
      nameInput.disabled = true; // Bloquear edición del nombre verificado
    }

    if (emailInput && payload.email) {
      emailInput.value = payload.email;
      emailInput.disabled = true; // Bloquear edición del email verificado
    }

    // Habilitar el botón de submit
    const submitBtn = document.querySelector('#playerForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
    }

    // Enfocar en el campo de grado
    const gradeSelect = document.getElementById('playerGrade');
    if (gradeSelect) {
      gradeSelect.focus();
    }
  } catch (error) {
    console.error('❌ Error al procesar respuesta de Google:', error);
    alert('Hubo un error al iniciar sesión con Google. Por favor, intenta manualmente.');
  }
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGoogleSignIn);
} else {
  initGoogleSignIn();
}

// Botón de reinicio del juego
const replayBtn = document.getElementById('replayButton');
if (replayBtn) {
  replayBtn.addEventListener('click', () => {
    // IMPORTANTE: Detener el loop del juego PRIMERO
    if (typeof isGameRunning !== 'undefined') {
      isGameRunning = false;
    }

    // Resetear el flag ANTES de llamar resetGame para que el juego NO inicie automáticamente
    playerReady = false;

    // Resetear el estado del quiz y del juego
    resetAnswers();
    resetGame();

    // Mostrar el modal de registro nuevamente
    const playerModal = document.getElementById('playerModal');
    if (playerModal) {
      playerModal.style.display = 'flex';

      // Limpiar los campos del formulario
      const nameInput = document.getElementById('playerName');
      const gradeSelect = document.getElementById('playerGrade');
      const emailInput = document.getElementById('playerEmail');
      const submitBtn = document.querySelector('#playerForm button[type="submit"]');

      if (nameInput) {
        nameInput.value = '';
        nameInput.disabled = true; // Mantener deshabilitado hasta nueva autenticación
      }
      if (gradeSelect) gradeSelect.value = '';
      if (emailInput) {
        emailInput.value = '';
        emailInput.disabled = true; // Mantener deshabilitado hasta nueva autenticación
      }
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
        submitBtn.title = 'Debes iniciar sesión con Google primero';
      }
    }

    // Nota: El juego NO iniciará hasta que el usuario complete
    // el formulario y se ejecute tryStartGame() nuevamente
  });
}

// Manejar formulario de jugador (nombre y grado)
const playerForm = document.getElementById('playerForm');
const playerModal = document.getElementById('playerModal');
if (playerForm && playerModal) {
  // Deshabilitar el botón de submit por defecto
  const submitBtn = playerForm.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
    submitBtn.title = 'Debes iniciar sesión con Google primero';
  }

  playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('playerName');
    const emailInput = document.getElementById('playerEmail');
    const gradeSelect = document.getElementById('playerGrade');
    const name = (nameInput?.value || '').trim();
    const email = (emailInput?.value || '').trim();
    const grade = (gradeSelect?.value || '').trim();

    if (!name) {
      nameInput?.focus();
      return;
    }
    if (!email) {
      alert('Debes iniciar sesión con Google para continuar');
      return;
    }
    if (!grade) {
      gradeSelect?.focus();
      return;
    }

    // Guardar en variables globales y sesión
    window.playerName = name;
    window.playerEmail = email || '';
    window.playerGrade = grade;
    try {
      sessionStorage.setItem('playerName', name);
      if (email) sessionStorage.setItem('playerEmail', email);
      sessionStorage.setItem('playerGrade', grade);
    } catch (_) {}

    // Activar anti-cheat inmediatamente (antes de que empiece el juego)
    setupAntiCheat();

    // Cargar preguntas DESPUÉS de guardar el grado seleccionado
    getQuestions((res) => {
      questions = res; // variable global usada por modal.js
      questionsLoaded = true;
      tryStartGame();
    });

    // Ocultar modal de inicio
    playerModal.style.display = 'none';
    playerReady = true;
  });

  // Si ya hay datos en sessionStorage, prellenar y permitir comenzar rápido
  try {
    const savedName = sessionStorage.getItem('playerName');
    const savedEmail = sessionStorage.getItem('playerEmail');
    const savedGrade = sessionStorage.getItem('playerGrade');
    if (savedName && savedGrade) {
      const nameInput = document.getElementById('playerName');
      const emailInput = document.getElementById('playerEmail');
      const gradeSelect = document.getElementById('playerGrade');
      if (nameInput) nameInput.value = savedName;
      if (emailInput && savedEmail) emailInput.value = savedEmail;
      if (gradeSelect) gradeSelect.value = savedGrade;
    }
  } catch (_) {}
}

// ================== ANTI-CHEAT (cambio de pestaña / perder foco) ==================
let antiCheatEnabled = true;
let antiCheatTriggered = false;
// Configuración del anti-cheat
const antiCheatConfig = {
  warnBeforeEnd: true, // Mostrar advertencia la primera vez
  requireFirstAnswer: false, // Si true, no activa hasta responder la primera pregunta
  finalizeOnBlur: true, // Si false, solo actúa en visibilitychange
};
let antiCheatWarnShown = false;

// Crear overlay de advertencia (se genera solo una vez)
function createAntiCheatOverlay() {
  let existing = document.getElementById('antiCheatOverlay');
  if (existing) return existing;
  const overlay = document.createElement('div');
  overlay.id = 'antiCheatOverlay';
  overlay.setAttribute(
    'style',
    `
    position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 9999; display: flex;
    align-items: center; justify-content: center; font-family: system-ui, sans-serif; color: #fff;
  `,
  );
  const box = document.createElement('div');
  box.setAttribute(
    'style',
    `
    background: #1e1e1e; padding: 28px 32px; max-width: 420px; width: 90%; border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.55); text-align: center; border: 2px solid #ffb347;
    animation: fadeInScale .35s ease;
  `,
  );
  box.innerHTML = `
    <h3 style="margin:0 0 12px;font-size:1.3rem;color:#ffb347">⚠ Atención</h3>
    <p style="margin:0 0 18px; line-height:1.4;font-size:.95rem">
      Has cambiado de pestaña o minimizado la ventana.<br><strong>el juego finalizará</strong> y se guardará tu progreso parcial con penalización(1.0).
    </p>
    <button id="antiCheatOkBtn" style="background:#ffb347;color:#222;font-weight:600;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-size:0.95rem;">Entendido</button>
  `;
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  // Animaciones CSS simples
  const style = document.createElement('style');
  style.textContent = `@keyframes fadeInScale {0%{opacity:0;transform:scale(.85)}100%{opacity:1;transform:scale(1)}}`;
  document.head.appendChild(style);
  const btn = box.querySelector('#antiCheatOkBtn');
  btn.addEventListener(
    'click',
    () => {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .25s';
      setTimeout(() => overlay.remove(), 250);
    },
    { once: true },
  );
  return overlay;
}

function setupAntiCheat() {
  if (!antiCheatEnabled) return;
  // Evitar doble registro
  if (window._antiCheatAttached) return;
  window._antiCheatAttached = true;

  const handler = (reason) => {
    if (!antiCheatEnabled) return;
    // Si ya finalizó el cuestionario, ignorar.
    if (window.questionsCompleted) return;
    // Requerir que el juego haya iniciado (playerReady) y preguntas cargadas
    if (!questionsLoaded || !playerReady) return;

    // Primera violación: mostrar overlay (si configurado)
    if (antiCheatConfig.warnBeforeEnd && !antiCheatWarnShown) {
      antiCheatWarnShown = true;
      createAntiCheatOverlay();
      return;
    }

    // Violación posterior: finalizar inmediatamente
    if (typeof window.forceEndQuiz === 'function') {
      window.forceEndQuiz(reason);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) handler('visibilitychange');
  });
  if (antiCheatConfig.finalizeOnBlur) {
    window.addEventListener('blur', () => handler('blur'));
  }
}

// Permitir desactivar desde consola si se requiere:
window.disableAntiCheat = () => {
  antiCheatEnabled = false;
  console.warn('Anti-cheat desactivado');
};
window.enableAntiCheat = () => {
  antiCheatEnabled = true;
  console.warn('Anti-cheat activado');
  setupAntiCheat();
};
