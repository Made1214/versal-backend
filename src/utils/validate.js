/**
 * Utilidades de validación
 * Funciones para validar formatos comunes como ObjectId
 */

/**
 * Valida si una cadena es un UUID válido (formato v4)
 * @param {string} id - El ID a validar
 * @returns {boolean} - true si es un UUID válido
 */
function validateUUID(id) {
  if (typeof id !== 'string') {
    return false;
  }
  // Regex para UUID v4
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Valida si una URL es válida
 * @param {string} url - La URL a validar
 * @returns {boolean} - true si es una URL válida
 */
function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export {
  validateObjectId,
  validateUUID,
  validateUrl,
};