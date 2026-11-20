/**
 * controllers/inventoryController.js
 * ----------------------------------------------------------------------------
 * Controladores para tallas, colores y variantes de productos.
 * ----------------------------------------------------------------------------
 */

import * as inventoryService from "../services/inventoryService.js";
import { ok, created, badRequest, notFound, serverError, serviceUnavailable, readBody } from "../utils/http.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) { serviceUnavailable(res); return false; }
  return true;
}

// --- Tallas -----------------------------------------------------------------

export async function listSizes(req, res) {
  if (!checkDb(res)) return;
  try {
    const sizes = await inventoryService.getSizes();
    ok(res, { sizes });
  } catch (err) { serverError(res, err.message); }
}

export async function addSize(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body || !body.numero_talla) return badRequest(res, "Falta el campo numero_talla.");
    const id = await inventoryService.createSize(body.numero_talla);
    created(res, { id, message: "Talla registrada." });
  } catch (err) { badRequest(res, err.message); }
}

// --- Colores ----------------------------------------------------------------

export async function listColors(req, res) {
  if (!checkDb(res)) return;
  try {
    const colors = await inventoryService.getColors();
    ok(res, { colors });
  } catch (err) { serverError(res, err.message); }
}

export async function addColor(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body || !body.nombre || !body.codigo_hex) return badRequest(res, "Faltan nombre y codigo_hex.");
    const id = await inventoryService.createColor(body.nombre, body.codigo_hex);
    created(res, { id, message: "Color registrado." });
  } catch (err) { badRequest(res, err.message); }
}

// --- Variantes --------------------------------------------------------------

export async function listVariants(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const variants = await inventoryService.getVariants(params.id);
    ok(res, { variants });
  } catch (err) { serverError(res, err.message); }
}

export async function addVariant(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");
    const id = await inventoryService.createVariant(
      params.id, body.talla_id, body.color_id, body.stock
    );
    created(res, { id, message: "Variante creada." });
  } catch (err) { badRequest(res, err.message); }
}

export async function updateStock(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body || body.stock === undefined) return badRequest(res, "Falta el campo stock.");
    const done = await inventoryService.updateStock(params.id, body.stock);
    if (!done) return notFound(res, "Variante no encontrada.");
    ok(res, { message: "Stock actualizado." });
  } catch (err) { badRequest(res, err.message); }
}
