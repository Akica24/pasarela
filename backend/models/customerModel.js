/**
 * models/customerModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para la tabla CLIENTES.
 * Los clientes no crean cuenta: sus datos se registran al finalizar el pedido.
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

/**
 * Registra un nuevo cliente.
 * @param {object} data  { nombre_completo, telefono, correo, departamento, ciudad, barrio, direccion }
 * @returns {Promise<number>} ID del cliente creado
 */
export async function create(data) {
  const result = await query(`
    INSERT INTO CLIENTES
      (nombre_completo, telefono, correo, departamento, ciudad, barrio, direccion)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    data.nombre_completo,
    data.telefono,
    data.correo,
    data.departamento,
    data.ciudad,
    data.barrio,
    data.direccion,
  ]);
  return result.insertId;
}

/**
 * Busca un cliente por su ID.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const rows = await query(`SELECT * FROM CLIENTES WHERE id = ?`, [id]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Busca clientes por correo (para reutilizar datos si ya compró antes).
 * @param {string} correo
 * @returns {Promise<Array>}
 */
export async function findByEmail(correo) {
  return query(`SELECT * FROM CLIENTES WHERE correo = ? ORDER BY fecha_registro DESC`, [correo]);
}

/**
 * Lista todos los clientes (para el panel de administración).
 * @returns {Promise<Array>}
 */
export async function findAll() {
  return query(`SELECT id, nombre_completo, telefono, correo, departamento, ciudad, barrio, direccion, fecha_registro FROM CLIENTES ORDER BY fecha_registro DESC`);
}
