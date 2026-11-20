/**
 * models/orderModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para las tablas PEDIDOS y DETALLE_PEDIDOS.
 *
 * El registro de pedidos usa transacciones SQL (con la conexión pasada
 * explícitamente) para garantizar la integridad: si algo falla a mitad
 * del proceso, se hace rollback y no queda ningún dato inconsistente.
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

/**
 * Genera el siguiente número de pedido en formato PED-YYYYMMDD-NNN.
 * Ejemplo: PED-20261115-001, PED-20261115-002, ...
 * @returns {Promise<string>}
 */
export async function generateOrderNumber() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  // Cuenta cuántos pedidos ya existen con este prefijo de fecha.
  const rows = await query(
    `SELECT numero_pedido FROM PEDIDOS WHERE numero_pedido LIKE ? ORDER BY id DESC LIMIT 1`,
    [`PED-${dateStr}-%`]
  );
  let seq = 1;
  if (rows.length > 0) {
    const lastSeq = parseInt(rows[0].numero_pedido.split("-")[2], 10);
    seq = lastSeq + 1;
  }
  return `PED-${dateStr}-${String(seq).padStart(3, "0")}`;
}

/**
 * Crea la cabecera del pedido dentro de una transacción.
 * @param {object} conn  Conexión de la transacción
 * @param {object} data  { cliente_id, numero_pedido, subtotal, total }
 * @returns {Promise<number>} ID del pedido creado
 */
export async function create(conn, data) {
  const [result] = await conn.execute(`
    INSERT INTO PEDIDOS (cliente_id, numero_pedido, subtotal, total, estado)
    VALUES (?, ?, ?, ?, 'pendiente')
  `, [data.cliente_id, data.numero_pedido, data.subtotal, data.total]);
  return result.insertId;
}

/**
 * Crea una línea de detalle del pedido dentro de una transacción.
 * @param {object} conn  Conexión de la transacción
 * @param {object} data  { pedido_id, variante_id, nombre_producto, talla, color, cantidad, precio_unitario, subtotal }
 * @returns {Promise<number>}
 */
export async function createDetail(conn, data) {
  const [result] = await conn.execute(`
    INSERT INTO DETALLE_PEDIDOS
      (pedido_id, variante_id, nombre_producto, talla, color, cantidad, precio_unitario, subtotal)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.pedido_id,
    data.variante_id,
    data.nombre_producto,
    data.talla,
    data.color,
    data.cantidad,
    data.precio_unitario,
    data.subtotal,
  ]);
  return result.insertId;
}

/**
 * Consulta todos los pedidos con los datos del cliente (para el admin).
 * @returns {Promise<Array>}
 */
export async function findAll() {
  return query(`
    SELECT p.id, p.numero_pedido, p.subtotal, p.total, p.estado, p.fecha_pedido,
           c.nombre_completo AS cliente, c.telefono, c.correo,
           c.departamento, c.ciudad, c.barrio, c.direccion
    FROM PEDIDOS p
    INNER JOIN CLIENTES c ON p.cliente_id = c.id
    ORDER BY p.fecha_pedido DESC
  `);
}

/**
 * Consulta un pedido por su ID, incluyendo el cliente y los detalles.
 * @param {number} id
 * @returns {Promise<object|null>}
 */
export async function findById(id) {
  const orderRows = await query(`
    SELECT p.*, c.nombre_completo AS cliente, c.telefono, c.correo,
           c.departamento, c.ciudad, c.barrio, c.direccion
    FROM PEDIDOS p
    INNER JOIN CLIENTES c ON p.cliente_id = c.id
    WHERE p.id = ?
  `, [id]);

  if (orderRows.length === 0) return null;

  const order = orderRows[0];
  order.detalles = await query(`
    SELECT d.id, d.variante_id, d.nombre_producto, d.talla, d.color,
           d.cantidad, d.precio_unitario, d.subtotal
    FROM DETALLE_PEDIDOS d
    WHERE d.pedido_id = ?
    ORDER BY d.id
  `, [id]);

  return order;
}

/**
 * Consulta el historial de pedidos de un cliente por su ID.
 * @param {number} clienteId
 * @returns {Promise<Array>}
 */
export async function findByCustomer(clienteId) {
  return query(`
    SELECT id, numero_pedido, subtotal, total, estado, fecha_pedido
    FROM PEDIDOS
    WHERE cliente_id = ?
    ORDER BY fecha_pedido DESC
  `, [clienteId]);
}

/**
 * Actualiza el estado de un pedido.
 * @param {number} id
 * @param {string} estado  Uno de: pendiente, confirmado, en_preparacion, enviado, entregado, cancelado
 * @returns {Promise<boolean>}
 */
export async function updateStatus(id, estado) {
  const validStates = ["pendiente", "confirmado", "en_preparacion", "enviado", "entregado", "cancelado"];
  if (!validStates.includes(estado)) return false;
  const result = await query(`UPDATE PEDIDOS SET estado = ? WHERE id = ?`, [estado, id]);
  return result.affectedRows > 0;
}

/**
 * Cancela un pedido (cambia el estado a 'cancelado').
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function cancel(id) {
  return updateStatus(id, "cancelado");
}
