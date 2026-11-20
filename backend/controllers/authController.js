/**
 * controllers/authController.js
 * ----------------------------------------------------------------------------
 * Controladores para la autenticación del administrador:
 * registro inicial, inicio de sesión, cierre de sesión y verificación.
 * ----------------------------------------------------------------------------
 */

import * as authService from "../services/authService.js";
import { ok, badRequest, serverError, serviceUnavailable, unauthorized, readBody } from "../utils/http.js";
import { validateSession } from "../middlewares/auth.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) { serviceUnavailable(res); return false; }
  return true;
}

/**
 * POST /api/auth/register
 * Registro inicial del administrador. Solo funciona si no existe ningún
 * administrador en la base de datos.
 */
export async function register(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");
    const admin = await authService.registerInitialAdmin(body);
    ok(res, { admin, message: "Administrador registrado correctamente." });
  } catch (err) {
    badRequest(res, err.message);
  }
}

/**
 * POST /api/auth/login
 * Inicio de sesión del administrador.
 */
export async function login(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body || !body.correo || !body.password) {
      return badRequest(res, "Correo y contraseña son obligatorios.");
    }
    const { token, user } = await authService.login(body.correo, body.password);
    ok(res, { token, user, message: "Sesión iniciada correctamente." });
  } catch (err) {
    unauthorized(res, err.message);
  }
}

/**
 * POST /api/auth/logout
 * Cierre de sesión. Invalida el token actual.
 */
export async function logout(req, res) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  authService.logout(token);
  ok(res, { message: "Sesión cerrada correctamente." });
}

/**
 * GET /api/auth/verify
 * Verifica si el token actual sigue siendo válido.
 */
export async function verify(req, res) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const user = validateSession(token);
  if (!user) return unauthorized(res, "Sesión no válida o expirada.");
  ok(res, { user, message: "Sesión válida." });
}
