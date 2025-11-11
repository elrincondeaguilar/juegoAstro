/**
 *
 * @param {string} url Link de la API de preguntas
 * @param {Function} callback Es la funcion que se ejecuta cuando se obtiene la respuesta de la API, recibe un parametro que es la respuesta de la API
 * @returns {JSON} El callback lleva como parametro la respuesta de la API
 * @example getQuestions('https://api.com/questions', (res) => { console.log(res) });
 */

/**
 * Función para mezclar un array aleatoriamente (algoritmo Fisher-Yates)
 * @param {Array} array - Array a mezclar
 * @returns {Array} - Array mezclado
 */
function shuffleArray(array) {
  const shuffled = [...array]; // Crear una copia del array
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getQuestions(callback) {
  fetch('/js/questions.json')
    .then((response) => response.json())
    .then((res) => {
      // Obtener el grado del estudiante desde la variable global o sessionStorage
      const playerGrade =
        window.playerGrade || sessionStorage.getItem('playerGrade') || '11-1';

      // Obtener las preguntas específicas del grado
      let gradeQuestions = res[playerGrade];

      // Si no hay preguntas para ese grado, usar las de 11-1 por defecto
      if (!gradeQuestions || gradeQuestions.length === 0) {
        console.warn(
          `No se encontraron preguntas para el grado ${playerGrade}, usando 11-1 por defecto`,
        );
        gradeQuestions = res['11-1'];
      }

      // Mezclar las preguntas del grado específico
      const shuffledQuestions = shuffleArray(gradeQuestions);
      // Tomar solo las primeras 5 preguntas mezcladas
      const selectedQuestions = shuffledQuestions.slice(0, 5);
      callback(selectedQuestions);
    })
    .catch((error) => {
      console.error('Error al cargar preguntas:', error);
    });
}
