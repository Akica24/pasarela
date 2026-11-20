/**
 * services/inventoryService.js
 * ----------------------------------------------------------------------------
 * Lógica de negocio para tallas, colores y variantes de productos.
 * Aplica validaciones antes de persistir (no permitir duplicados, no
 * permitir stock negativo, etc.).
 * ----------------------------------------------------------------------------
 */

import * as inventoryModel from "../models/inventoryModel.js";

// --- Tallas -----------------------------------------------------------------

export async function getSizes() {
  return inventoryModel.findAllSizes();
}

export async function createSize(numero_talla) {
  const n = Number(numero_talla);
  if (!Number.isInteger(n) || n < 20 || n > 50) {
    throw new Error("La talla debe ser un número entero entre 20 y 50.");
  }
  // Verifica que no exista ya esa talla.
  const existing = await inventoryModel.findSizeByNumber(n);
  if (existing) throw new Error(`La talla ${n} ya existe.`);
  return inventoryModel.createSize(n);
}

// --- Colores ----------------------------------------------------------------

export async function getColors() {
  return inventoryModel.findAllColors();
}

export async function createColor(nombre, codigo_hex) {
  if (!nombre || !codigo_hex) throw new Error("Nombre y código hex son obligatorios.");
  if (!/^#[0-9a-fA-F]{6}$/.test(codigo_hex)) throw new Error("El código hex debe tener el formato #RRGGBB.");
  const existing = await inventoryModel.findColorByName(nombre);
  if (existing) throw new Error(`El color "${nombre}" ya existe.`);
  return inventoryModel.createColor(nombre, codigo_hex);
}

// --- Variantes --------------------------------------------------------------

export async function getVariants(productId) {
  return inventoryModel.findVariantsByProduct(productId);
}

export async function createVariant(productId, tallaId, colorId, stock) {
  const s = Number(stock) || 0;
  if (s < 0) throw new Error("El stock no puede ser negativo.");
  // Verifica que no exista ya la misma combinación.
  const existing = await inventoryModel.findVariant(productId, tallaId, colorId);
  if (existing) throw new Error("Ya existe una variante con esa talla y color para este producto.");
  return inventoryModel.createVariant(productId, tallaId, colorId, s);
}

export async function updateStock(variantId, stock) {
  const s = Number(stock);
  if (!Number.isInteger(s) || s < 0) throw new Error("El stock debe ser un entero >= 0.");
  return inventoryModel.updateVariantStock(variantId, s);
}

export async function getAvailability(productId) {
  return inventoryModel.findAvailability(productId);
}
