/**
 * controllers/orderController.js
 * ----------------------------------------------------------------------------
 * Controladores para la gestión de pedidos.
 *
 * El registro de pedidos (create) es la operación pública principal: recibe
 * los datos del cliente y los productos del carrito, los valida en el backend
 * y devuelve el número de pedido para que el frontend genere el mensaje de
 * WhatsApp.
 *
 * Las operaciones de consulta y cambio de estado requieren autenticación de
 * administrador (se protegen en las rutas con requireAuth).
 * ----------------------------------------------------------------------------
 */

import * as orderService from "../services/orderService.js";
import { ok, badRequest, notFound, serverError, serviceUnavailable, readBody } from "../utils/http.js";
import { dbConnected } from "../database.js";

function checkDb(res) {
  if (!dbConnected) { serviceUnavailable(res); return false; }
  return true;
}

/**
 * POST /api/orders
 * Registra un nuevo pedido. Pública (no requiere autenticación).
 *
 * Cuerpo esperado:
 * {
 *   cliente: { nombre_completo, telefono, correo, departamento, ciudad, barrio, direccion },
 *   items: [{ productId, size, color, qty }]
 * }
 */
export async function create(req, res) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body) return badRequest(res, "Falta el cuerpo de la petición.");
    if (!body.cliente || !body.items) {
      return badRequest(res, "Se requieren los datos del cliente y los productos.");
    }
    const order = await orderService.createOrder(body);
    ok(res, {
      ...order,
      message: `Pedido ${order.numero_pedido} registrado como pendiente. La tienda lo revisará pronto.`,
    });
  } catch (err) {
    badRequest(res, err.message);
  }
}

/**
 * GET /api/orders (admin)
 * Lista todos los pedidos.
 */
export async function list(req, res) {
  if (!checkDb(res)) return;
  try {
    const orders = await orderService.getOrders();
    ok(res, { orders });
  } catch (err) { serverError(res, err.message); }
}

/**
 * GET /api/orders/:id (admin)
 * Obtiene un pedido con sus detalles.
 */
export async function getOne(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const order = await orderService.getOrder(params.id);
    if (!order) return notFound(res, "Pedido no encontrado.");
    ok(res, { order });
  } catch (err) { serverError(res, err.message); }
}

/**
 * GET /api/orders/history/:clienteId (admin)
 * Historial de pedidos de un cliente.
 */
export async function history(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const orders = await orderService.getOrderHistory(params.clienteId);
    ok(res, { orders });
  } catch (err) { serverError(res, err.message); }
}

/**
 * PATCH /api/orders/:id/status (admin)
 * Actualiza el estado de un pedido.
 */
export async function updateStatus(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const body = await readBody(req);
    if (!body || !body.estado) return badRequest(res, "Falta el campo estado.");
    const done = await orderService.updateOrderStatus(params.id, body.estado);
    if (!done) return notFound(res, "Pedido no encontrado o estado inválido.");
    ok(res, { message: "Estado del pedido actualizado." });
  } catch (err) { badRequest(res, err.message); }
}

/**
 * POST /api/orders/:id/cancel (admin)
 * Cancela un pedido.
 */
export async function cancel(req, res, next, params) {
  if (!checkDb(res)) return;
  try {
    const done = await orderService.cancelOrder(params.id);
    if (!done) return notFound(res, "Pedido no encontrado.");
    ok(res, { message: "Pedido cancelado." });
  } catch (err) { serverError(res, err.message); }
}
