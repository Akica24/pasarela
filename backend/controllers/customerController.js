/**
 * controllers/customerController.js
 * ----------------------------------------------------------------------------
 * Controladores para la gestión de clientes. Los clientes se registran
 * automáticamente al hacer un pedido, pero el administrador puede consultar
 * la lista de clientes.
 * ----------------------------------------------------------------------------
 */

import * as customerModel from "../models/customerModel.js";
import { ok, notFound, serverError, serviceUnavailable } from "../utils/http.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) { serviceUnavailable(res); return false; }
  return true;
}

/**
 * GET /api/customers (admin)
 * Lista todos los clientes registrados.
 */
export async function list(req, res) {
  if (!checkDb(res)) return;
  try {
    const customers = await customerModel.findAll();
    ok(res, { customers });
  } catch (err) { serverError(res, err.message); }
}

/**
 * GET /api/customers/:id (admin)
 */
export async function getOne(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const customer = await customerModel.findById(params.id);
    if (!customer) return notFound(res, "Cliente no encontrado.");
    ok(res, { customer });
  } catch (err) { serverError(res, err.message); }
}
