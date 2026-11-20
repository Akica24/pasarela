/**
 * controllers/productController.js
 * ----------------------------------------------------------------------------
 * Controladores para las rutas de productos. Reciben la petición HTTP,
 * extraen los parámetros, delegan la lógica al servicio y devuelven la
 * respuesta JSON con el código HTTP apropiado.
 * ----------------------------------------------------------------------------
 */

import * as productService from "../services/productService.js";
import { ok, created, badRequest, notFound, serverError, serviceUnavailable, readBody } from "../utils/http.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) {
    serviceUnavailable(res);
    return false;
  }
  return true;
}

/**
 * GET /api/products
 * Lista productos con filtros opcionales (query params):
 *   ?search=, ?brand=, ?category=, ?size=, ?color=, ?featured=true
 */
export async function list(req, res) {
  if (!checkDb(res)) return;
  try {
    const q = req.query;
    const filters = {};
    if (q.search) filters.search = q.search;
    if (q.brand) filters.brand = q.brand;
    if (q.category) filters.category = q.category;
    if (q.size) filters.size = Number(q.size);
    if (q.color) filters.color = q.color;
    if (q.featured !== undefined) filters.featured = q.featured === "true";

    const products = await productService.getProducts(filters);
    ok(res, { count: products.length, products });
  } catch (err) {
    serverError(res, err.message);
  }
}

/**
 * GET /api/products/featured
 */
export async function featured(req, res) {
  if (!checkDb(res)) return;
  try {
    const products = await productService.getFeatured();
    ok(res, { count: products.length, products });
  } catch (err) {
    serverError(res, err.message);
  }
}

/**
 * GET /api/products/:id
 */
export async function getOne(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const product = await productService.getProduct(params.id);
    if (!product) return notFound(res, "Producto no encontrado.");
    ok(res, { product });
  } catch (err) {
    serverError(res, err.message);
  }
}

/**
 * GET /api/products/:id/availability
 */
export async function availability(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const availability = await productService.getAvailability(params.id);
    ok(res, { availability });
  } catch (err) {
    serverError(res, err.message);
  }
}

/**
 * POST /api/products (admin)
 */
export async function create(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");
    const id = await productService.createProduct(body);
    created(res, { id, message: "Producto creado correctamente." });
  } catch (err) {
    badRequest(res, err.message);
  }
}

/**
 * PUT /api/products/:id (admin)
 */
export async function update(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");
    const updated = await productService.updateProduct(params.id, body);
    if (!updated) return notFound(res, "Producto no encontrado o sin cambios.");
    ok(res, { message: "Producto actualizado correctamente." });
  } catch (err) {
    badRequest(res, err.message);
  }
}

/**
 * PATCH /api/products/:id/deactivate (admin)
 */
export async function deactivate(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const done = await productService.deactivateProduct(params.id);
    if (!done) return notFound(res, "Producto no encontrado.");
    ok(res, { message: "Producto desactivado correctamente." });
  } catch (err) {
    serverError(res, err.message);
  }
}
