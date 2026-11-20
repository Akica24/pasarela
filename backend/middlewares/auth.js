/**
 * middlewares/auth.js
 * ----------------------------------------------------------------------------
 * Middleware de autenticación para proteger las rutas del panel de
 * administración.
 *
 * El sistema de sesiones es simple y seguro:
 * - Al iniciar sesión, se genera un token aleatorio con crypto.randomBytes.
 * - El token se guarda en un Map en memoria junto con los datos del usuario
 *   y la fecha de expiración.
 * - El cliente envía el token en el header Authorization: Bearer <token>.
 * - El middleware valida el token, comprueba que no haya expirado y
 *   establece req.user con los datos del administrador.
 *
 * Las sesiones viven en memoria del proceso: se pierden al reiniciar el
 * servidor (aceptable para esta fase educativa; en producción se usaría
 * una tabla de sesiones o Redis).
 * ----------------------------------------------------------------------------
 */

import { env } from "../config/env.js";
import { unauthorized } from "../utils/http.js";
import { generateToken } from "../utils/crypto.js";

// Almacén de sesiones en memoria: token -> { user, expires }
const sessions = new Map();

/**
 * Crea una sesión para un usuario y devuelve el token.
 * @param {object} user  Datos del usuario (id, nombre, correo, rol)
 * @returns {string} Token de sesión
 */
export function createSession(user) {
  const token = generateToken();
  sessions.set(token, {
    user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
    expires: Date.now() + env.sessionTtl,
  });
  return token;
}

/**
 * Elimina una sesión (cierre de sesión).
 * @param {string} token
 */
export function destroySession(token) {
  sessions.delete(token);
}

/**
 * Valida un token y devuelve los datos del usuario si es válido.
 * Limpia las sesiones expiradas que encuentra.
 * @param {string} token
 * @returns {object|null} Datos del usuario o null
 */
export function validateSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expires) {
    sessions.delete(token);
    return null;
  }
  return session.user;
}

/**
 * Middleware que requiere autenticación. Si no hay un token válido,
 * responde 401.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = validateSession(token);
  if (!user) {
    return unauthorized(res, "Debes iniciar sesión para acceder a este recurso.");
  }
  req.user = user;
  next();
}

/**
 * Middleware que requiere rol de administrador (además de estar autenticado).
 */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.rol !== "admin") {
      return unauthorized(res, "Se requieren privilegios de administrador.");
    }
    next();
  });
}
