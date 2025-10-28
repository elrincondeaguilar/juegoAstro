// Preguntas seteadas desde el main (5 preguntas aleatorias)
let questions = [];

// Respuestas del usuario
let answers = [];
let currentQuestionIndex = 0;
let gameCallback = null; // Callback del juego para cuando terminen todas las preguntas

function resetAnswers() {
  currentQuestionIndex = 0;
  answers = [];
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
      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      saveAnswer(index, selectedQuestion);

      /* ANIMACIONES PARA EL MODAL DE PREGUNTAS (SALIDA) */

      // Para el fondo del modal
      modal.classList.add('animate__fadeOut');

      // Para el contenedor de preguntas
      modalContent.classList.add('animate__fadeOutDownBig');

      setTimeout(() => {
        modalContent.classList.remove('animate__fadeOutDownBig');
        modal.classList.remove('animate__fadeOut');
        modal.style.display = 'none';

        // Solo ejecutar callback si NO es la última pregunta
        if (!isLastQuestion) {
          callback();
        }
        // Si es la última pregunta, el callback se ejecutará cuando se cierre el modal de recomendaciones
      }, 300);

      currentQuestionIndex++;
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

  if (currentQuestionIndex === questions.length - 1) {
    // Marcar que las preguntas fueron completadas para desactivar futuras colisiones
    if (typeof questionsCompleted !== 'undefined') {
      questionsCompleted = true;
    }

    getRecommendations(); // Generar las recomendaciones basadas en las respuestas
    showRecommendationsModal(gameCallback); // Mostrar el modal con las recomendaciones y pasar el callback

    // Resetear para la próxima vez
    resetAnswers();
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
  modalContent.classList.remove('perfect-score', 'good-score', 'average-score', 'low-score');
  
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
  const resultHTML = isMaxScore 
    ? `<div style="text-align: center; animation: pulse 2s infinite;">
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
    : `<strong>📊 Tu Resultado:</strong><br>
        ${congratulationsMessage}<br>
        Respuestas correctas: ${correctAnswersCount} de ${totalQuestions}<br>
        Puntuación: ${scorePercentage.toFixed(1)}% - <strong>Nota: ${grade}/5</strong>`;

  document.getElementById('national-destination').innerHTML = resultHTML;
  document.getElementById('international-destination').innerHTML = '';
}
