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
      // Mezclar todas las preguntas aleatoriamente
      const shuffledQuestions = shuffleArray(res);
      // Tomar solo las primeras 5 preguntas mezcladas
      const selectedQuestions = shuffledQuestions.slice(0, 5);
      callback(selectedQuestions);
    })
    .catch((error) => {
      console.error(error);
    });
}
