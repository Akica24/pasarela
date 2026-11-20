/**
 * services/authService.js
 * ----------------------------------------------------------------------------
 * Lógica de autenticación del administrador:
 * - Registro inicial seguro (solo si no existe ningún administrador).
 * - Inicio de sesión (verifica credenciales con scrypt y crea sesión).
 * - Cierre de sesión (invalida el token).
 *
 * Las contraseñas se hashean con scrypt (utils/crypto.js) antes de
 * almacenarlas. Nunca se guardan en texto plano.
 * ----------------------------------------------------------------------------
 */

import * as userModel from "../models/userModel.js";
import { hashPassword, verifyPassword } from "../utils/crypto.js";
import { createSession, destroySession } from "../middlewares/auth.js";

/**
 * Registro inicial del administrador.
 * Solo se permite si no existe ningún administrador en la base de datos.
 * Esto evita que cualquiera pueda crear cuentas de administrador una vez
 * que el sistema ya está inicializado.
 *
 * @param {object} data  { nombre, correo, telefono, password }
 * @returns {Promise<object>} { id, nombre, correo, rol }
 */
export async function registerInitialAdmin(data) {
  // Validaciones de entrada.
  if (!data.nombre || !data.correo || !data.password) {
    throw new Error("Nombre, correo y contraseña son obligatorios.");
  }
  if (data.password.length < 8) {
    throw new Error("La contraseña debe tener al menos 8 caracteres.");
  }

  // Solo se permite el registro inicial si no hay administradores.
  const count = await userModel.count();
  if (count > 0) {
    throw new Error("Ya existe un administrador. El registro inicial no está disponible.");
  }

  // Verifica que el correo no esté en uso.
  const existing = await userModel.findByEmail(data.correo);
  if (existing) {
    throw new Error("Ya existe un usuario con ese correo.");
  }

  // Hashea la contraseña con scrypt antes de almacenarla.
  const hashedPassword = await hashPassword(data.password);
  const id = await userModel.create({
    nombre: data.nombre,
    correo: data.correo,
    telefono: data.telefono || null,
    password: hashedPassword,
    rol: "admin",
  });

  return { id, nombre: data.nombre, correo: data.correo, rol: "admin" };
}

/**
 * Inicio de sesión del administrador.
 * Verifica las credenciales (comparando el hash scrypt) y, si son válidas,
 * crea una sesión y devuelve el token.
 *
 * @param {string} correo
 * @param {string} password
 * @returns {Promise<object>} { token, user }
 */
export async function login(correo, password) {
  if (!correo || !password) {
    throw new Error("Correo y contraseña son obligatorios.");
  }

  const user = await userModel.findByEmail(correo);
  if (!user) {
    // Mensaje genérico para no revelar si el correo existe o no.
    throw new Error("Credenciales incorrectas.");
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    throw new Error("Credenciales incorrectas.");
  }

  // Crea la sesión y devuelve el token.
  const token = createSession(user);
  return {
    token,
    user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol },
  };
}

/**
 * Cierra la sesión del administrador invalidando el token.
 * @param {string} token
 */
export function logout(token) {
  destroySession(token);
}
