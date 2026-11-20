/**
 * models/productModel.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a datos para la tabla PRODUCTOS y sus relaciones
 * (MARCAS, CATEGORIAS, PRODUCTO_VARIANTES, TALLAS, COLORES).
 *
 * Todas las consultas usan parámetros (?) para evitar inyección SQL.
 * Devuelve los productos en un formato compatible con el frontend (mismo
 * shape que products.js espera: id, name, brand, category, categorySlug,
 * price, oldPrice, colors[], sizes[], stock, featured, popularity, dateAdded).
 * ----------------------------------------------------------------------------
 */

import { query } from "../database.js";

/**
 * Convierte un nombre de categoría en slug (minúsculas, sin espacios).
 * "Botas" -> "botas", "Deportivos" -> "deportivos"
 */
function toSlug(name) {
  return String(name).toLowerCase().replace(/\s+/g, "");
}

/**
 * Construye el objeto producto en el formato del frontend a partir de una
 * fila de la base de datos y sus relaciones.
 */
function formatProduct(row, colors = [], sizes = [], totalStock = 0) {
  return {
    id: String(row.id),
    name: row.nombre,
    model: row.nombre, // el modelo coincide con el nombre en este catálogo
    brand: row.marca,
    category: row.categoria,
    categorySlug: toSlug(row.categoria),
    price: Number(row.precio),
    oldPrice: row.precio_anterior ? Number(row.precio_anterior) : null,
    description: row.descripcion || "",
    colors: colors.map((c) => ({ name: c.nombre, hex: c.codigo_hex })),
    sizes: sizes.map((s) => s.numero_talla).sort((a, b) => a - b),
    stock: totalStock,
    featured: Boolean(row.destacado),
    popularity: row.popularidad || 50,
    dateAdded: row.fecha_creacion ? new Date(row.fecha_creacion).toISOString().slice(0, 10) : null,
  };
}

/**
 * Consulta todos los productos activos, con filtros opcionales.
 * @param {object} filters  { search, brand, category, size, color, featured }
 * @returns {Promise<Array>} Lista de productos en formato del frontend
 */
export async function findAll(filters = {}) {
  const { search, brand, category, size, color, featured } = filters;

  // Consulta base con JOIN para obtener nombre de marca y categoría.
  let sql = `
    SELECT p.*, m.nombre AS marca, c.nombre AS categoria
    FROM PRODUCTOS p
    INNER JOIN MARCAS m ON p.marca_id = m.id
    INNER JOIN CATEGORIAS c ON p.categoria_id = c.id
    WHERE p.estado = TRUE
  `;
  const params = [];

  if (search) {
    sql += ` AND p.nombre LIKE ?`;
    params.push(`%${search}%`);
  }
  if (brand) {
    sql += ` AND m.nombre = ?`;
    params.push(brand);
  }
  if (category) {
    sql += ` AND c.nombre = ?`;
    params.push(category);
  }
  if (featured !== undefined) {
    sql += ` AND p.destacado = ?`;
    params.push(featured ? 1 : 0);
  }
  // Filtros por talla y color requieren EXISTS sobre las variantes.
  if (size) {
    sql += ` AND EXISTS (
      SELECT 1 FROM PRODUCTO_VARIANTES pv
      INNER JOIN TALLAS t ON pv.talla_id = t.id
      WHERE pv.producto_id = p.id AND t.numero_talla = ?
    )`;
    params.push(Number(size));
  }
  if (color) {
    sql += ` AND EXISTS (
      SELECT 1 FROM PRODUCTO_VARIANTES pv
      INNER JOIN COLORES co ON pv.color_id = co.id
      WHERE pv.producto_id = p.id AND co.nombre = ?
    )`;
    params.push(color);
  }

  sql += ` ORDER BY p.destacado DESC, p.popularidad DESC`;
  const rows = await query(sql, params);

  // Carga los colores, tallas y stock total de cada producto.
  const products = [];
  for (const row of rows) {
    const [colors, sizes, stockRow] = await Promise.all([
      query(`
        SELECT DISTINCT co.nombre, co.codigo_hex
        FROM PRODUCTO_VARIANTES pv
        INNER JOIN COLORES co ON pv.color_id = co.id
        WHERE pv.producto_id = ?
        ORDER BY co.nombre
      `, [row.id]),
      query(`
        SELECT DISTINCT t.numero_talla
        FROM PRODUCTO_VARIANTES pv
        INNER JOIN TALLAS t ON pv.talla_id = t.id
        WHERE pv.producto_id = ?
        ORDER BY t.numero_talla
      `, [row.id]),
      query(`SELECT COALESCE(SUM(stock), 0) AS total FROM PRODUCTO_VARIANTES WHERE producto_id = ?`, [row.id]),
    ]);
    products.push(formatProduct(row, colors, sizes, stockRow[0].total));
  }
  return products;
}

/**
 * Consulta un producto por su ID, incluyendo colores, tallas, stock total
 * y el detalle de variantes (para verificar disponibilidad por talla/color).
 * @param {number} id  ID del producto
 * @returns {Promise<object|null>} Producto en formato del frontend o null
 */
export async function findById(id) {
  const rows = await query(`
    SELECT p.*, m.nombre AS marca, c.nombre AS categoria
    FROM PRODUCTOS p
    INNER JOIN MARCAS m ON p.marca_id = m.id
    INNER JOIN CATEGORIAS c ON p.categoria_id = c.id
    WHERE p.id = ?
  `, [id]);

  if (rows.length === 0) return null;

  const row = rows[0];
  const [colors, sizes, stockRow, variants] = await Promise.all([
    query(`
      SELECT DISTINCT co.id, co.nombre, co.codigo_hex
      FROM PRODUCTO_VARIANTES pv
      INNER JOIN COLORES co ON pv.color_id = co.id
      WHERE pv.producto_id = ?
      ORDER BY co.nombre
    `, [id]),
    query(`
      SELECT DISTINCT t.id, t.numero_talla
      FROM PRODUCTO_VARIANTES pv
      INNER JOIN TALLAS t ON pv.talla_id = t.id
      WHERE pv.producto_id = ?
      ORDER BY t.numero_talla
    `, [id]),
    query(`SELECT COALESCE(SUM(stock), 0) AS total FROM PRODUCTO_VARIANTES WHERE producto_id = ?`, [id]),
    query(`
      SELECT pv.id, pv.stock, t.numero_talla, co.nombre AS color, co.codigo_hex
      FROM PRODUCTO_VARIANTES pv
      INNER JOIN TALLAS t ON pv.talla_id = t.id
      INNER JOIN COLORES co ON pv.color_id = co.id
      WHERE pv.producto_id = ?
    `, [id]),
  ]);

  const product = formatProduct(row, colors, sizes, stockRow[0].total);
  // Incluye las variantes para que el frontend pueda consultar disponibilidad
  // por talla y color específicos.
  product.variants = variants.map((v) => ({
    variantId: v.id,
    size: v.numero_talla,
    color: v.color,
    colorHex: v.codigo_hex,
    stock: v.stock,
  }));
  return product;
}

/**
 * Consulta los productos destacados.
 * @returns {Promise<Array>}
 */
export async function findFeatured() {
  return findAll({ featured: true });
}

/**
 * Busca productos por nombre (búsqueda parcial).
 * @param {string} term  Término de búsqueda
 * @returns {Promise<Array>}
 */
export async function searchByName(term) {
  return findAll({ search: term });
}

/**
 * Verifica la disponibilidad de una variante específica (producto + talla + color).
 * @param {number} productId
 * @param {number} size  Número de talla
 * @param {string} color  Nombre del color
 * @returns {Promise<object|null>} { variantId, stock } o null si no existe
 */
export async function checkVariantAvailability(productId, size, color) {
  const rows = await query(`
    SELECT pv.id AS variantId, pv.stock
    FROM PRODUCTO_VARIANTES pv
    INNER JOIN TALLAS t ON pv.talla_id = t.id
    INNER JOIN COLORES co ON pv.color_id = co.id
    WHERE pv.producto_id = ? AND t.numero_talla = ? AND co.nombre = ?
  `, [productId, size, color]);
  return rows.length > 0 ? rows[0] : null;
}

// ---------------------------------------------------------------------------
// Operaciones de administración (requieren autenticación)
// ---------------------------------------------------------------------------

/**
 * Crea un nuevo producto.
 * @param {object} data  { nombre, descripcion, precio, precio_anterior, marca_id, categoria_id, imagen, destacado, popularidad }
 * @returns {Promise<number>} ID del producto creado
 */
export async function create(data) {
  const result = await query(`
    INSERT INTO PRODUCTOS
      (nombre, descripcion, precio, precio_anterior, marca_id, categoria_id, imagen, estado, destacado, popularidad)
    VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?)
  `, [
    data.nombre,
    data.descripcion || null,
    data.precio,
    data.precio_anterior || null,
    data.marca_id,
    data.categoria_id,
    data.imagen || null,
    data.destacado ? 1 : 0,
    data.popularidad || 50,
  ]);
  return result.insertId;
}

/**
 * Actualiza un producto existente.
 * @param {number} id
 * @param {object} data  Campos a actualizar
 * @returns {Promise<boolean>} true si se actualizó, false si no existía
 */
export async function update(id, data) {
  const fields = [];
  const params = [];
  const allowed = ["nombre", "descripcion", "precio", "precio_anterior", "marca_id", "categoria_id", "imagen", "destacado", "popularidad", "estado"];

  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (fields.length === 0) return false;

  params.push(id);
  const result = await query(`UPDATE PRODUCTOS SET ${fields.join(", ")} WHERE id = ?`, params);
  return result.affectedRows > 0;
}

/**
 * Desactiva un producto (no lo elimina: cambia estado a FALSE).
 * @param {number} id
 * @returns {Promise<boolean>}
 */
export async function deactivate(id) {
  const result = await query(`UPDATE PRODUCTOS SET estado = FALSE WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}
