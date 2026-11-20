/**
 * models/contactModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para la tabla CONTACTOS (mensuegos del formulario
 * de contacto de la tienda).
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

/**
 * Guarda un mensaje de contacto.
 * @param {object} data  { nombre, correo, telefono, mensaje }
 * @returns {Promise<number>} ID del mensaje creado
 */
export async function create(data) {
  const result = await query(`
    INSERT INTO CONTACTOS (nombre, correo, telefono, mensaje)
    VALUES (?, ?, ?, ?)
  `, [data.nombre, data.correo, data.telefono, data.mensaje]);
  return result.insertId;
}

/**
 * Lista todos los mensajes de contacto (para el panel de administración).
 * @returns {Promise<Array>}
 */
export async function findAll() {
  return query(`SELECT id, nombre, correo, telefono, mensaje, fecha_envio FROM CONTACTOS ORDER BY fecha_envio DESC`);
}

/**
 * Busca un mensaje por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const rows = await query(`SELECT * FROM CONTACTOS WHERE id = ?`, [id]);
  return rows.length > 0 ? rows[0] : null;
}
