/**
 * models/userModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para la tabla USUARIOS (administradores del sistema).
 * Las contraseñas se almacenan con hash scrypt (ver utils/crypto.js).
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

/**
 * Busca un administrador por su correo electrónico.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function findByEmail(email) {
  const rows = await query(`SELECT id, nombre, correo, telefono, password, rol FROM USUARIOS WHERE correo = ?`, [email]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca un administrador por su ID (sin la contraseña).
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const rows = await query(`SELECT id, nombre, correo, telefono, rol, fecha_creacion FROM USUARIOS WHERE id = ?`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Crea un nuevo administrador.
 * @param {object} data  { nombre, correo, telefono, password, rol }
 * @returns {Promise<number>} ID del usuario creado
 */
export async function create(data) {
  const result = await query(`
    INSERT INTO USUARIOS (nombre, correo, telefono, password, rol)
    VALUES (?, ?, ?, ?, ?)
  `, [data.nombre, data.correo, data.telefono || null, data.password, data.rol || "admin"]);
  return result.insertId;
}

/**
 * Cuenta cuántos administradores existen (para el registro inicial: solo se
 * permite registrar el primer admin si no existe ninguno).
 * @returns {Promise<number>}
 */
export async function count() {
  const rows = await query(`SELECT COUNT(*) AS total FROM USUARIOS`);
  return rows[0].total;
}
