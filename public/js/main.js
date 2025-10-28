// Encargado de los request a la API
import { getQuestions } from './questions.js';

// Manejador del inicio del juego
const startGame = init;

// Boton de reinicio  del juego
document.getElementById('replayButton').addEventListener('click', () => {
  resetAnswers();
  resetGame();
});

getQuestions((res) => {
  questions = res;
  setTimeout(() => {
    startGame();
  }, 1000);
});
