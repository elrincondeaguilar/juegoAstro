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
  }
}

// ========== GOOGLE SIGN-IN INTEGRATION ==========

// Inicializar Google Identity Services si está configurado
function initGoogleSignIn() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === '') {
    console.log('ℹ️ Google Sign-In no configurado (GOOGLE_CLIENT_ID vacío)');
    return;
  }

  // Detectar si es Safari/iOS
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Esperar a que google.accounts.id esté disponible
  const checkGoogle = setInterval(() => {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      clearInterval(checkGoogle);

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
        auto_select: false,
        itp_support: true, // Soporte para Intelligent Tracking Prevention de Safari
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
        console.log('✅ Botón de Google Sign-In renderizado');
        
        // Para Safari/iOS, agregar mensaje informativo
        if (isSafari || isIOS) {
          const infoMsg = document.createElement('small');
          infoMsg.style.cssText = 'display:block; color:#666; margin-top:4px; font-size:11px; text-align:center;';
          infoMsg.textContent = '💡 En Safari: permitir popups si el botón no responde';
          container.appendChild(infoMsg);
        }
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

    // Cargar preguntas según el grado seleccionado
    getQuestions((res) => {
      questions = res; // variable global usada por modal.js
      questionsLoaded = true;
      
      // Ocultar modal de inicio
      playerModal.style.display = 'none';
      playerReady = true;
      tryStartGame();
    });
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

// Las preguntas se cargan después de que el usuario selecciona su grado
// Ver línea ~205 dentro del submit del playerForm
