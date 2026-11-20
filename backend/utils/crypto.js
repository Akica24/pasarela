/**
 * utils/crypto.js
 * ----------------------------------------------------------------------------
 * Funciones criptográficas usando únicamente el módulo nativo `node:crypto`.
 *
 * - Hash de contraseñas con scrypt + sal aleatoria.
 * - Verificación de contraseñas (comparación en tiempo constante).
 * - Generación de tokens de sesión aleatorios y seguros.
 *
 * scrypt es un algoritmo de derivación de claves resistente a ataques de
 * hardware (GPU/ASIC), apropiado para almacenar contraseñas de forma segura.
 * ----------------------------------------------------------------------------
 */

import crypto from "node:crypto";

// Parámetros de scrypt. N controla el coste CPU/memoria; 2^14 es un buen
// equilibrio entre seguridad y velocidad para una app educativa.
const SCRYPT_KEYLEN = 64;
const SCRYPT_SALTLEN = 16;

/**
 * Genera el hash de una contraseña usando scrypt.
 * @param {string} password  Contraseña en texto plano
 * @returns {Promise<string>} Hash en formato "sal:derivado" (ambos hex)
 */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(SCRYPT_SALTLEN);
  // scrypt recibe (password, salt, keylen). Usamos la versión con callback
  // envuelta en promesa.
  const derived = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, SCRYPT_KEYLEN, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

/**
 * Verifica si una contraseña coincide con un hash almacenado.
 * Usa timingSafeEqual para evitar ataques de temporización.
 * @param {string} password  Contraseña en texto plano
 * @param {string} stored    Hash en formato "sal:derivado"
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, stored) {
  try {
    const [saltHex, derivedHex] = stored.split(":");
    if (!saltHex || !derivedHex) return false;
    const salt = Buffer.from(saltHex, "hex");
    const derived = Buffer.from(derivedHex, "hex");
    const test = await new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, derived.length, (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    // Comparación en tiempo constante: evita filtrar información por el
    // tiempo que tarda en detectar la diferencia.
    return crypto.timingSafeEqual(test, derived);
  } catch {
    return false;
  }
}

/**
 * Genera un token de sesión aleatorio y seguro (32 bytes hex = 64 caracteres).
 * @returns {string}
 */
export function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}
