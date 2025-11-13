// Preguntas seteadas desde el main (5 preguntas aleatorias)
let questions = [];

// Respuestas del usuario
let answers = [];
let currentQuestionIndex = 0;
// Exponer referencias para otros módulos (anti-cheat, etc.)
window.quizState = {
  getAnswers: () => answers,
  getCurrentIndex: () => currentQuestionIndex,
  getTotalQuestions: () => questions.length,
};
// Flag global para indicar finalización de todas las preguntas
window.questionsCompleted = false;
let gameCallback = null; // Callback del juego para cuando terminen todas las preguntas

// Importar función para guardar en Google Sheets
async function saveResultsToSheets(data) {
  try {
    // Usar ruta absoluta para asegurar la carga correcta desde cualquier script
    const module = await import('/js/sheets.js');
    await module.saveToGoogleSheets(data);
  } catch (error) {
    console.error('Error al cargar módulo de Google Sheets:', error);
  }
}

function resetAnswers() {
  currentQuestionIndex = 0;
  answers = [];
  if (window.quizState) {
    window.quizState.getAnswers = () => answers;
    window.quizState.getCurrentIndex = () => currentQuestionIndex;
  }
}

function showNextQuestion(callback) {
  if (currentQuestionIndex < questions.length) {
    const selectedQuestion = questions[currentQuestionIndex];
    showQuestionModal(selectedQuestion, callback);
  } else {
    // No hay más preguntas, ejecutar callback inmediatamente
    callback();
  }
}

/**
 * Muestra el modal con una pregunta específica
 * @param {Object} selectedQuestion - Objeto que contiene la pregunta y las opciones
 * @param {Function} callback - Función que se ejecuta cuando se responde la pregunta
 */
function showQuestionModal(selectedQuestion, callback) {
  // Almacenar el callback globalmente para usarlo si es la última pregunta
  gameCallback = callback;

  const modal = document.getElementById('questionModal');
  const modalContent = modal.querySelector('.modal-content');

  modal.querySelector('h2').textContent = `Pregunta ${currentQuestionIndex + 1}/${
    questions.length
  }`;
  modal.querySelector('p').textContent = selectedQuestion.question;

  const optionsContainer = modal.querySelector('.options');

  optionsContainer.innerHTML = '';

  // ANIMACION PARA EL MODAL DE PREGUNTAS (ENTRADA)

  // Para el fondo del modal
  modal.classList.add('animate__fadeIn');

  // Para el contenedor de preguntas
  modalContent.classList.add('animate__fadeInUpBig');

  // Eliminar las clases de animacion para poder reutilizarlas cuando se reinicie el juego
  setTimeout(() => {
    modalContent.classList.remove('animate__fadeInUpBig');
    modal.classList.remove('animate__fadeIn');
  }, 500);

  selectedQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');

    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.className = 'option';

    button.addEventListener('click', () => {
      // Guardar la respuesta ANTES de incrementar el índice
      saveAnswer(index, selectedQuestion);

      // Incrementar el índice DESPUÉS de guardar
      currentQuestionIndex++;

      // Verificar si era la última pregunta (DESPUÉS de incrementar)
      const wasLastQuestion = currentQuestionIndex >= questions.length;

      /* ANIMACIONES PARA EL MODAL DE PREGUNTAS (SALIDA) */

      // Para el fondo del modal
      modal.classList.add('animate__fadeOut');

      // Para el contenedor de preguntas
      modalContent.classList.add('animate__fadeOutDownBig');

      setTimeout(() => {
        modalContent.classList.remove('animate__fadeOutDownBig');
        modal.classList.remove('animate__fadeOut');
        modal.style.display = 'none';

        // Si NO era la última pregunta, continuar el juego
        if (!wasLastQuestion) {
          callback();
        } else {
          // Si era la última, mostrar resultados
          // Marcar que las preguntas fueron completadas
          window.questionsCompleted = true;
          getRecommendations();
          showRecommendationsModal(gameCallback);
          // Resetear para la próxima vez
          resetAnswers();
        }
      }, 300);
    });
    optionsContainer.appendChild(button);
  });

  modal.style.display = 'flex';
}

function saveAnswer(selectedIndex, questionObj) {
  const answer = {
    questionId: questionObj.id,
    selectedOption: questionObj.options[selectedIndex],
    selectedIndex: selectedIndex,
    isCorrect: selectedIndex === questionObj.correctAnswer,
  };
  answers.push(answer);
  if (window.quizState) {
    window.quizState.getAnswers = () => answers;
  }
}

function showRecommendationsModal(gameCallback) {
  const modal = document.getElementById('recommendationsModal');
  modal.style.display = 'flex';

  // Cambiar el título si es nota perfecta
  const correctAnswersCount = answers.filter((answer) => answer.isCorrect).length;
  const totalQuestions = answers.length;
  const scorePercentage = (correctAnswersCount / totalQuestions) * 100;
  const isPerfectScore = scorePercentage >= 90;

  const modalTitle = modal.querySelector('h2');
  if (isPerfectScore) {
    modalTitle.innerHTML = '🏆 ¡PUNTUACIÓN PERFECTA! 🏆';
    modalTitle.style.color = '#FFD700';
    modalTitle.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
  } else {
    modalTitle.innerHTML = '📋 Evaluación de Física - Grado 11°';
    modalTitle.style.color = '';
    modalTitle.style.textShadow = '';
  }

  // Cambiar el texto y estilo del botón según la nota
  const closeButton = modal.querySelector('button');
  if (closeButton) {
    // Agregar clases base para el hover
    closeButton.classList.add('modal-button');
    closeButton.classList.remove('perfect-button', 'normal-button');

    if (isPerfectScore) {
      closeButton.innerHTML = '🌟 ¡Soy un Genio de la Física! 🌟';
      closeButton.style.background = 'linear-gradient(45deg, #FFD700, #FFA500)';
      closeButton.style.transform = 'scale(1.1)';
      closeButton.style.fontWeight = 'bold';
      closeButton.classList.add('perfect-button');
    } else {
      closeButton.innerHTML = '📚 ¡A Estudiar y Mejorar!';
      closeButton.style.background = '#68c3c0';
      closeButton.style.transform = '';
      closeButton.style.fontWeight = '';
      closeButton.classList.add('normal-button');
    }

    closeButton.addEventListener(
      'click',
      () => {
        modal.style.display = 'none';
        // Ejecutar el callback del juego si existe
        if (gameCallback) {
          gameCallback();
        }
        // Terminar el juego después de cerrar las recomendaciones
        if (typeof game !== 'undefined') {
          game.status = 'gameover';
        }
      },
      { once: true },
    ); // { once: true } asegura que el evento se ejecute solo una vez
  }
}

function getRecommendations() {
  // Calcular respuestas correctas
  const totalQuestions = answers.length;
  const correctAnswersCount = answers.filter((answer) => answer.isCorrect).length;

  // Calcular nota de 1 a 5
  const scorePercentage = (correctAnswersCount / totalQuestions) * 100;
  let grade;
  if (scorePercentage >= 90) grade = 5;
  else if (scorePercentage >= 70) grade = 4;
  else if (scorePercentage >= 50) grade = 3;
  else if (scorePercentage >= 30) grade = 2;
  else grade = 1;

  // Guardar resultados en Google Sheets
  saveResultsToSheets({
    nombre: window.playerName,
    email: window.playerEmail,
    grado: window.playerGrade,
    correctas: correctAnswersCount,
    total: totalQuestions,
    porcentaje: scorePercentage,
    nota: grade,
    respuestas: answers,
  });

  // Generar mensaje de felicitación según la nota
  let congratulationsMessage = '';
  let isMaxScore = grade === 5;

  if (grade === 5) {
    congratulationsMessage =
      '🏆✨ ¡INCREÍBLE! ¡PUNTUACIÓN PERFECTA! ✨🏆<br>🔥 ¡Eres un GENIO de la Física! 🔥<br>🎯 ¡Dominas completamente estos conceptos!';
  } else if (grade >= 4) {
    congratulationsMessage =
      '🎉 ¡Excelente trabajo! Dominas muy bien los conceptos de física.';
  } else if (grade >= 3) {
    congratulationsMessage = '👏 ¡Buen trabajo! Tienes una base sólida en física.';
  } else {
    congratulationsMessage =
      '💪 ¡No te desanimes! La física requiere práctica constante.';
  }

  // Aplicar animaciones y estilos según la nota
  const modalContent = document.querySelector('#recommendationsModal .modal-content');

  // Limpiar clases anteriores
  modalContent.classList.remove(
    'perfect-score',
    'good-score',
    'average-score',
    'low-score',
  );

  if (grade === 5) {
    // Nota perfecta - Dorado brillante
    modalContent.classList.add('perfect-score');
    modalContent.classList.add('animate__animated', 'animate__tada');
    modalContent.style.background = 'linear-gradient(135deg, #FFD700, #FFA500, #FF6B6B)';
    modalContent.style.border = '3px solid #FFD700';

    // Restaurar después de la animación
    setTimeout(() => {
      modalContent.style.background = '';
      modalContent.style.border = '';
      modalContent.classList.remove('animate__tada');
    }, 2000);
  } else if (grade === 4) {
    // Nota excelente - Azul brillante
    modalContent.classList.add('good-score');
    modalContent.classList.add('animate__animated', 'animate__bounceIn');
    modalContent.style.background = 'linear-gradient(135deg, #44C7F4, #6BB6FF)';
    modalContent.style.border = '2px solid #44C7F4';

    setTimeout(() => {
      modalContent.style.background = '';
      modalContent.style.border = '';
      modalContent.classList.remove('animate__bounceIn');
    }, 1500);
  } else if (grade === 3) {
    // Nota buena - Naranja suave
    modalContent.classList.add('average-score');
    modalContent.classList.add('animate__animated', 'animate__fadeInUp');
    modalContent.style.background = 'linear-gradient(135deg, #FFA500, #FFB84D)';
    modalContent.style.border = '2px solid #FFA500';

    setTimeout(() => {
      modalContent.style.background = '';
      modalContent.style.border = '';
      modalContent.classList.remove('animate__fadeInUp');
    }, 1500);
  } else {
    // Nota baja - Rojo suave
    modalContent.classList.add('low-score');
    modalContent.classList.add('animate__animated', 'animate__fadeIn');
    modalContent.style.background = 'linear-gradient(135deg, #FF6B6B, #FF8E8E)';
    modalContent.style.border = '2px solid #FF6B6B';

    setTimeout(() => {
      modalContent.style.background = '';
      modalContent.style.border = '';
      modalContent.classList.remove('animate__fadeIn');
    }, 1500);
  }

  // Mostrar resultado con estilo especial para nota máxima
  const studentIdentityParts = [];
  if (window.playerName)
    studentIdentityParts.push(`<strong>${window.playerName}</strong>`);
  if (window.playerGrade) studentIdentityParts.push(`<em>${window.playerGrade}</em>`);
  if (window.playerEmail) studentIdentityParts.push(`<code>${window.playerEmail}</code>`);
  const studentLine =
    studentIdentityParts.length > 0
      ? `<div style="margin-bottom:8px; padding:6px 10px; background:#f7f7f7; border-radius:6px;">
         👤 Estudiante: ${studentIdentityParts.join(' — ')}
       </div>`
      : '';

  const resultHTML = isMaxScore
    ? `${studentLine}<div style="text-align: center; animation: pulse 2s infinite;">
        <strong style="font-size: 1.2em; color: #FFD700;">🌟 RESULTADO EXTRAORDINARIO 🌟</strong><br>
        <div style="font-size: 1.1em; margin: 10px 0; color: #FF6B6B;">
          ${congratulationsMessage}
        </div><br>
        <div style="background: rgba(255, 215, 0, 0.2); padding: 10px; border-radius: 10px; border: 2px solid #FFD700;">
          Respuestas correctas: <strong style="color: #4CAF50;">${correctAnswersCount} de ${totalQuestions}</strong><br>
          Puntuación: <strong style="color: #4CAF50; font-size: 1.2em;">${scorePercentage.toFixed(1)}%</strong><br>
          <span style="font-size: 1.5em; color: #FFD700;">⭐ NOTA: ${grade}/5 ⭐</span>
        </div>
      </div>`
    : `${studentLine}<strong>📊 Tu Resultado:</strong><br>
        ${congratulationsMessage}<br>
        Respuestas correctas: ${correctAnswersCount} de ${totalQuestions}<br>
        Puntuación: ${scorePercentage.toFixed(1)}% - <strong>Nota: ${grade}/5</strong>`;

  document.getElementById('national-destination').innerHTML = resultHTML;
  document.getElementById('international-destination').innerHTML = '';
}

/**
 * Finaliza el quiz de forma anticipada (anti-cheat / pérdida de foco)
 * @param {string} reason Razón del final forzado (visibilitychange|blur|manual)
 */
window.forceEndQuiz = function forceEndQuiz(reason = 'manual') {
  try {
    // Evitar doble ejecución si ya se mostraron recomendaciones
    if (document.getElementById('recommendationsModal')?.style.display === 'flex') return;

    const totalQuestionsRespondidas = answers.length;
    const correctas = answers.filter((a) => a.isCorrect).length;
    const porcentaje =
      totalQuestionsRespondidas > 0 ? (correctas / totalQuestionsRespondidas) * 100 : 0;
    // Penalización: si no termina todas, nota mínima 1
    let nota;
    if (totalQuestionsRespondidas < questions.length) {
      nota = 1;
    } else {
      if (porcentaje >= 90) nota = 5;
      else if (porcentaje >= 70) nota = 4;
      else if (porcentaje >= 50) nota = 3;
      else if (porcentaje >= 30) nota = 2;
      else nota = 1;
    }

    // Guardar inmediatamente
    saveResultsToSheets({
      nombre: window.playerName,
      email: window.playerEmail,
      grado: window.playerGrade,
      correctas,
      total: totalQuestionsRespondidas,
      porcentaje,
      nota,
      respuestas: answers,
      finAnticipado: true,
      razonFin: reason,
    });

    // Construir mensaje básico rápido
    const recModal = document.getElementById('recommendationsModal');
    if (recModal) {
      recModal.style.display = 'flex';
      const title = recModal.querySelector('h2');
      if (title) title.textContent = '⏹ Juego finalizado';
      const content = recModal.querySelector('#national-destination');
      if (content) {
        content.innerHTML = `<strong>Fin anticipado (${reason}).</strong><br>Preguntas respondidas: ${totalQuestionsRespondidas} / ${questions.length}<br>Correctas: ${correctas}<br>Nota: ${nota}/5`;
      }
      const intl = recModal.querySelector('#international-destination');
      if (intl) intl.innerHTML = '';
      const closeBtn = recModal.querySelector('button');
      if (closeBtn) {
        closeBtn.textContent = 'Cerrar';
        closeBtn.onclick = () => {
          recModal.style.display = 'none';
          resetAnswers();
          if (typeof game !== 'undefined') game.status = 'gameover';
        };
      }
    } else {
      alert('Juego finalizado anticipadamente. Nota: ' + nota + '/5');
      resetAnswers();
      if (typeof game !== 'undefined') game.status = 'gameover';
    }
  } catch (e) {
    console.error('Error en forceEndQuiz:', e);
  }
};
