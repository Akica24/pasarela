/**
 * controllers/contactController.js
 * ----------------------------------------------------------------------------
 * Controladores para el formulario de contacto.
 * El envío de mensajes es público (cualquiera puede escribir).
 * La consulta de mensajes requiere autenticación de administrador.
 * ----------------------------------------------------------------------------
 */

import * as contactModel from "../models/contactModel.js";
import { ok, badRequest, notFound, serverError, serviceUnavailable, readBody } from "../utils/http.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) { serviceUnavailable(res); return false; }
  return true;
}

/**
 * POST /api/contact
 * Guarda un mensaje de contacto. Pública.
 */
export async function create(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");

    // Validaciones mínimas.
    if (!body.nombre || !body.correo || !body.telefono || !body.mensaje) {
      return badRequest(res, "Nombre, correo, teléfono y mensaje son obligatorios.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(body.correo)) {
      return badRequest(res, "El correo no es válido.");
    }
    if (String(body.mensaje).trim().length < 10) {
      return badRequest(res, "El mensaje debe tener al menos 10 caracteres.");
    }

    const id = await contactModel.create({
      nombre: body.nombre.trim(),
      correo: body.correo.trim(),
      telefono: body.telefono.trim(),
      mensaje: body.mensaje.trim(),
    });
    ok(res, { id, message: "Mensaje recibido. Te contactaremos pronto." });
  } catch (err) { serverError(res, err.message); }
}

/**
 * GET /api/contact (admin)
 * Lista todos los mensajes de contacto.
 */
export async function list(req, res) {
  if (!checkDb(res)) return;
  try {
    const messages = await contactModel.findAll();
    ok(res, { messages });
  } catch (err) { serverError(res, err.message); }
}

/**
 * GET /api/contact/:id (admin)
 */
export async function getOne(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const message = await contactModel.findById(params.id);
    if (!message) return notFound(res, "Mensaje no encontrado.");
    ok(res, { message });
  } catch (err) { serverError(res, err.message); }
}
