/**
 * models/inventoryModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para tallas, colores y variantes de productos
 * (tablas TALLAS, COLORES, PRODUCTO_VARIANTES).
 *
 * Permite registrar tallas, colores, crear variantes, consultar existencias
 * y modificar el inventario. Todas las consultas son parametrizadas.
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

// --- Tallas -----------------------------------------------------------------

export async function findAllSizes() {
  return query(`SELECT id, numero_talla FROM TALLAS ORDER BY numero_talla`);
}

export async function createSize(numero_talla) {
  const result = await query(`INSERT INTO TALLAS (numero_talla) VALUES (?)`, [numero_talla]);
  return result.insertId;
}

export async function findSizeByNumber(numero_talla) {
  const rows = await query(`SELECT id, numero_talla FROM TALLAS WHERE numero_talla = ?`, [numero_talla]);
  return rows.length > 0 ? rows[0] : null;
}

// --- Colores ----------------------------------------------------------------

export async function findAllColors() {
  return query(`SELECT id, nombre, codigo_hex FROM COLORES ORDER BY nombre`);
}

export async function createColor(nombre, codigo_hex) {
  const result = await query(`INSERT INTO COLORES (nombre, codigo_hex) VALUES (?, ?)`, [nombre, codigo_hex]);
  return result.insertId;
}

export async function findColorByName(nombre) {
  const rows = await query(`SELECT id, nombre, codigo_hex FROM COLORES WHERE nombre = ?`, [nombre]);
  return rows.length > 0 ? rows[0] : null;
}

// --- Variantes --------------------------------------------------------------

/**
 * Consulta todas las variantes de un producto, con su talla, color y stock.
 * @param {number} productId
 * @returns {Promise<Array>}
 */
export async function findVariantsByProduct(productId) {
  return query(`
    SELECT pv.id, pv.producto_id, pv.stock,
           t.id AS talla_id, t.numero_talla,
           co.id AS color_id, co.nombre AS color, co.codigo_hex
    FROM PRODUCTO_VARIANTES pv
    INNER JOIN TALLAS t ON pv.talla_id = t.id
    INNER JOIN COLORES co ON pv.color_id = co.id
    WHERE pv.producto_id = ?
    ORDER BY t.numero_talla, co.nombre
  `, [productId]);
}

/**
 * Crea una nueva variante (combinación producto + talla + color + stock).
 * @param {number} producto_id
 * @param {number} talla_id
 * @param {number} color_id
 * @param {number} stock  Debe ser >= 0
 * @returns {Promise<number>} ID de la variante creada
 */
export async function createVariant(producto_id, talla_id, color_id, stock) {
  const result = await query(
    `INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES (?, ?, ?, ?)`,
    [producto_id, talla_id, color_id, Math.max(0, stock)]
  );
  return result.insertId;
}

/**
 * Actualiza el stock de una variante.
 * No permite stock negativo (la constraint CHECK de la BD lo impide también).
 * @param {number} id  ID de la variante
 * @param {number} stock  Nuevo stock (>= 0)
 * @returns {Promise<boolean>}
 */
export async function updateVariantStock(id, stock) {
  const result = await query(`UPDATE PRODUCTO_VARIANTES SET stock = ? WHERE id = ?`, [Math.max(0, stock), id]);
  return result.affectedRows > 0;
}

/**
 * Reduce el stock de una variante (usado al registrar un pedido).
 * Lanza error si el stock resultante sería negativo.
 * @param {object} conn  Conexión de la transacción
 * @param {number} id  ID de la variante
 * @param {number} cantidad  Cantidad a descontar
 * @returns {Promise<void>}
 */
export async function decreaseStock(conn, id, cantidad) {
  const [rows] = await conn.execute(`SELECT stock FROM PRODUCTO_VARIANTES WHERE id = ? FOR UPDATE`, [id]);
  if (rows.length === 0) throw new Error("La variante no existe.");
  const stockActual = rows[0].stock;
  if (stockActual < cantidad) {
    throw new Error(`Sin stock suficiente. Disponible: ${stockActual}, solicitado: ${cantidad}.`);
  }
  await conn.execute(`UPDATE PRODUCTO_VARIANTES SET stock = stock - ? WHERE id = ?`, [cantidad, id]);
}

/**
 * Busca una variante específica por producto, talla y color.
 * @param {number} productId
 * @param {number} tallaId
 * @param {number} colorId
 * @returns {Promise<object|null>}
 */
export async function findVariant(productId, tallaId, colorId) {
  const rows = await query(`
    SELECT pv.id, pv.stock FROM PRODUCTO_VARIANTES pv
    WHERE pv.producto_id = ? AND pv.talla_id = ? AND pv.color_id = ?
  `, [productId, tallaId, colorId]);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Consulta la disponibilidad por talla y color de un producto.
 * @param {number} productId
 * @returns {Promise<Array>} [{ size, color, colorHex, stock }]
 */
export async function findAvailability(productId) {
  return query(`
    SELECT t.numero_talla AS size, co.nombre AS color, co.codigo_hex AS colorHex, pv.stock
    FROM PRODUCTO_VARIANTES pv
    INNER JOIN TALLAS t ON pv.talla_id = t.id
    INNER JOIN COLORES co ON pv.color_id = co.id
    WHERE pv.producto_id = ?
    ORDER BY t.numero_talla, co.nombre
  `, [productId]);
}
