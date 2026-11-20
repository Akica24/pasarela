/**
 * services/productService.js
 * ----------------------------------------------------------------------------
 * Lógica de negocio para productos. Actúa como intermediario entre los
 * controladores (que reciben las peticiones HTTP) y los modelos (que
 * ejecutan las consultas SQL). Aquí se aplican validaciones y reglas de
 * negocio antes de tocar la base de datos.
 * ----------------------------------------------------------------------------
 */

import * as productModel from "../models/productModel.js";
import * as inventoryModel from "../models/inventoryModel.js";

/**
 * Lista productos con filtros opcionales.
 * Los filtros vacíos se omiten para devolver todo el catálogo activo.
 */
export async function getProducts(filters = {}) {
  return productModel.findAll(filters);
}

/**
 * Obtiene un producto por ID con todos sus detalles (colores, tallas,
 * variantes y stock).
 */
export async function getProduct(id) {
  return productModel.findById(id);
}

/**
 * Obtiene los productos destacados para la página de inicio.
 */
export async function getFeatured() {
  return productModel.findFeatured();
}

/**
 * Busca productos por nombre (búsqueda parcial).
 */
export async function searchProducts(term) {
  if (!term || term.trim().length < 2) {
    return productModel.findAll();
  }
  return productModel.searchByName(term.trim());
}

/**
 * Consulta la disponibilidad de un producto por talla y color.
 */
export async function getAvailability(productId) {
  return inventoryModel.findAvailability(productId);
}

/**
 * Verifica si una variante específica (producto + talla + color) tiene stock.
 */
export async function checkVariantAvailability(productId, size, color) {
  return productModel.checkVariantAvailability(productId, size, color);
}

// --- Operaciones de administración ---

/**
 * Crea un nuevo producto. Valida los campos obligatorios.
 */
export async function createProduct(data) {
  if (!data.nombre || !data.precio || !data.marca_id || !data.categoria_id) {
    throw new Error("Nombre, precio, marca y categoría son obligatorios.");
  }
  return productModel.create(data);
}

/**
 * Actualiza un producto existente.
 */
export async function updateProduct(id, data) {
  return productModel.update(id, data);
}

/**
 * Desactiva un producto (no lo elimina, lo oculta del catálogo).
 */
export async function deactivateProduct(id) {
  return productModel.deactivate(id);
}
