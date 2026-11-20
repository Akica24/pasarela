/**
 * services/orderService.js
 * ----------------------------------------------------------------------------
 * Lógica de negocio para la gestión de pedidos.
 *
 * El registro de un pedido es la operación más crítica del sistema:
 *
 *  1. Valida los datos del cliente.
 *  2. Registra (o reutiliza) al cliente.
 *  3. Por cada producto del carrito:
 *     - Consulta el precio REAL en MySQL (no confía en el precio del frontend).
 *     - Verifica que la variante (talla + color) exista.
 *     - Comprueba que haya stock suficiente (con bloqueo FOR UPDATE).
 *  4. Calcula subtotal y total (incluyendo envío) en el backend.
 *  5. Registra el pedido y sus detalles en una transacción SQL.
 *  6. Descuenta el inventario.
 *
 * Todo ocurre dentro de una transacción: si algo falla, se hace rollback
 * y no queda ningún dato inconsistente.
 * ----------------------------------------------------------------------------
 */

import { withTransaction } from "../database.js";
import * as orderModel from "../models/orderModel.js";
import { generateOrderNumber } from "../models/orderModel.js";

// Costos de envío (deben coincidir con js/config.js del frontend).
const SHIPPING_BASE_COST = 9000;
const SHIPPING_FREE_FROM = 250000;

/**
 * Valida que los datos del cliente estén completos.
 */
function validateCliente(c) {
  const required = {
    nombre_completo: "Nombre completo",
    telefono: "Teléfono",
    correo: "Correo",
    departamento: "Departamento",
    ciudad: "Ciudad",
    barrio: "Barrio",
    direccion: "Dirección",
  };
  for (const [key, label] of Object.entries(required)) {
    if (!c[key] || !String(c[key]).trim()) {
      throw new Error(`Falta el campo del cliente: ${label}.`);
    }
  }
  // Validación mínima de correo.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.correo)) {
    throw new Error("El correo del cliente no es válido.");
  }
  // Validación mínima de teléfono (7-13 dígitos).
  const digits = String(c.telefono).replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 13) {
    throw new Error("El teléfono del cliente debe tener entre 7 y 13 dígitos.");
  }
}

/**
 * Registra un nuevo pedido.
 *
 * @param {object} orderData
 *   { cliente: {...}, items: [{ productId, size, color, qty }] }
 * @returns {Promise<object>} { numero_pedido, pedido_id, subtotal, envio, total, detalles }
 */
export async function createOrder(orderData) {
  const { cliente, items } = orderData;

  // --- Validaciones previas ---
  validateCliente(cliente);
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("El pedido no tiene productos.");
  }

  // Validar cada item.
  for (const item of items) {
    if (!item.productId || !item.size || !item.color || !item.qty) {
      throw new Error("Cada producto debe tener productId, size, color y qty.");
    }
    if (item.qty < 1 || !Number.isInteger(item.qty)) {
      throw new Error("La cantidad debe ser un entero positivo.");
    }
  }

  // Generar el número de pedido antes de la transacción.
  const numeroPedido = await generateOrderNumber();

  // --- Transacción: todo se ejecuta o nada se guarda ---
  return withTransaction(async (conn) => {
    // 1. Registrar al cliente.
    const [clienteResult] = await conn.execute(`
      INSERT INTO CLIENTES (nombre_completo, telefono, correo, departamento, ciudad, barrio, direccion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      cliente.nombre_completo.trim(),
      cliente.telefono.trim(),
      cliente.correo.trim(),
      cliente.departamento.trim(),
      cliente.ciudad.trim(),
      cliente.barrio.trim(),
      cliente.direccion.trim(),
    ]);
    const clienteId = clienteResult.insertId;

    // 2. Procesar cada producto del carrito.
    let subtotal = 0;
    const detalles = [];

    for (const item of items) {
      // 2a. Consultar el precio REAL en MySQL (no confiar en el frontend).
      const [productRows] = await conn.execute(
        `SELECT id, nombre, precio, estado FROM PRODUCTOS WHERE id = ?`,
        [item.productId]
      );
      if (productRows.length === 0) {
        throw new Error(`El producto con ID ${item.productId} no existe.`);
      }
      const product = productRows[0];
      if (!product.estado) {
        throw new Error(`El producto "${product.nombre}" no está disponible.`);
      }

      // 2b. Buscar la variante (producto + talla + color) con bloqueo de fila.
      const [variantRows] = await conn.execute(`
        SELECT pv.id AS variantId, pv.stock
        FROM PRODUCTO_VARIANTES pv
        INNER JOIN TALLAS t ON pv.talla_id = t.id
        INNER JOIN COLORES co ON pv.color_id = co.id
        WHERE pv.producto_id = ? AND t.numero_talla = ? AND co.nombre = ?
        FOR UPDATE
      `, [item.productId, Number(item.size), item.color]);
      if (variantRows.length === 0) {
        throw new Error(
          `No se encontró la variante de "${product.nombre}" (talla ${item.size}, color ${item.color}).`
        );
      }
      const variant = variantRows[0];

      // 2c. Verificar stock suficiente.
      if (variant.stock < item.qty) {
        throw new Error(
          `Sin stock suficiente para "${product.nombre}" (talla ${item.size}, ${item.color}). ` +
          `Disponible: ${variant.stock}, solicitado: ${item.qty}.`
        );
      }

      // 2d. Calcular el subtotal de la línea con el precio real de MySQL.
      const precioUnitario = Number(product.precio);
      const lineSubtotal = precioUnitario * item.qty;
      subtotal += lineSubtotal;

      detalles.push({
        variante_id: variant.variantId,
        nombre_producto: product.nombre,
        talla: Number(item.size),
        color: item.color,
        cantidad: item.qty,
        precio_unitario: precioUnitario,
        subtotal: lineSubtotal,
      });
    }

    // 3. Calcular envío y total en el backend.
    const envio = subtotal >= SHIPPING_FREE_FROM ? 0 : SHIPPING_BASE_COST;
    const total = subtotal + envio;

    // 4. Crear la cabecera del pedido.
    const [orderResult] = await conn.execute(`
      INSERT INTO PEDIDOS (cliente_id, numero_pedido, subtotal, total, estado)
      VALUES (?, ?, ?, ?, 'pendiente')
    `, [clienteId, numeroPedido, subtotal, total]);
    const pedidoId = orderResult.insertId;

    // 5. Crear los detalles del pedido y descontar inventario.
    for (const d of detalles) {
      await conn.execute(`
        INSERT INTO DETALLE_PEDIDOS
          (pedido_id, variante_id, nombre_producto, talla, color, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [pedidoId, d.variante_id, d.nombre_producto, d.talla, d.color, d.cantidad, d.precio_unitario, d.subtotal]);

      // Descontar stock de la variante.
      await conn.execute(
        `UPDATE PRODUCTO_VARIANTES SET stock = stock - ? WHERE id = ?`,
        [d.cantidad, d.variante_id]
      );
    }

    // 6. Devolver el resumen del pedido.
    return {
      numero_pedido: numeroPedido,
      pedido_id: pedidoId,
      cliente_id: clienteId,
      subtotal,
      envio,
      total,
      detalles: detalles.map((d) => ({
        nombre_producto: d.nombre_producto,
        talla: d.talla,
        color: d.color,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal,
      })),
    };
  });
}

// --- Consultas de pedidos ---

export async function getOrders() {
  return orderModel.findAll();
}

export async function getOrder(id) {
  return orderModel.findById(id);
}

export async function getOrderHistory(clienteId) {
  return orderModel.findByCustomer(clienteId);
}

export async function updateOrderStatus(id, estado) {
  const validStates = ["pendiente", "confirmado", "en_preparacion", "enviado", "entregado", "cancelado"];
  if (!validStates.includes(estado)) {
    throw new Error(`Estado inválido. Valores permitidos: ${validStates.join(", ")}.`);
  }
  return orderModel.updateStatus(id, estado);
}

export async function cancelOrder(id) {
  return orderModel.cancel(id);
}
