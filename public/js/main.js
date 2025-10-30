// Encargado de los request a la API
import { getQuestions } from './questions.js';

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
      if (nameInput) nameInput.value = '';
      if (gradeSelect) gradeSelect.value = '';

      // Enfocar en el campo de nombre
      setTimeout(() => {
        if (nameInput) nameInput.focus();
      }, 300);
    }

    // Nota: El juego NO iniciará hasta que el usuario complete
    // el formulario y se ejecute tryStartGame() nuevamente
  });
}

// Manejar formulario de jugador (nombre y grado)
const playerForm = document.getElementById('playerForm');
const playerModal = document.getElementById('playerModal');
if (playerForm && playerModal) {
  playerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('playerName');
    const gradeSelect = document.getElementById('playerGrade');
    const name = (nameInput?.value || '').trim();
    const grade = (gradeSelect?.value || '').trim();

    if (!name) {
      nameInput?.focus();
      return;
    }
    if (!grade) {
      gradeSelect?.focus();
      return;
    }

    // Guardar en variables globales y sesión
    window.playerName = name;
    window.playerGrade = grade;
    try {
      sessionStorage.setItem('playerName', name);
      sessionStorage.setItem('playerGrade', grade);
    } catch (_) {}

    // Ocultar modal de inicio
    playerModal.style.display = 'none';
    playerReady = true;
    tryStartGame();
  });

  // Si ya hay datos en sessionStorage, prellenar y permitir comenzar rápido
  try {
    const savedName = sessionStorage.getItem('playerName');
    const savedGrade = sessionStorage.getItem('playerGrade');
    if (savedName && savedGrade) {
      const nameInput = document.getElementById('playerName');
      const gradeSelect = document.getElementById('playerGrade');
      if (nameInput) nameInput.value = savedName;
      if (gradeSelect) gradeSelect.value = savedGrade;
    }
  } catch (_) {}
}

// Cargar preguntas (5 aleatorias desde questions.json)
getQuestions((res) => {
  questions = res; // variable global usada por modal.js
  questionsLoaded = true;
  tryStartGame();
});
