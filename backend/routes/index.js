/**
 * routes/index.js
 * ----------------------------------------------------------------------------
 * Define todas las rutas de la API REST y las registra en un router nativo.
 *
 * Rutas públicas (sin autenticación):
 *   GET    /api/health                    Estado del servidor y la BD
 *   GET    /api/products                  Listar productos (con filtros query)
 *   GET    /api/products/featured        Productos destacados
 *   GET    /api/products/:id             Detalle de un producto
 *   GET    /api/products/:id/availability Disponibilidad por talla/color
 *   POST   /api/orders                   Registrar un pedido
 *   POST   /api/contact                  Enviar mensaje de contacto
 *   POST   /api/auth/register            Registro inicial del admin
 *   POST   /api/auth/login               Inicio de sesión del admin
 *   POST   /api/auth/logout              Cierre de sesión
 *   GET    /api/auth/verify              Verificar token
 *
 * Rutas protegidas (requieren autenticación de administrador):
 *   POST   /api/products                 Crear producto
 *   PUT    /api/products/:id              Actualizar producto
 *   PATCH  /api/products/:id/deactivate  Desactivar producto
 *   GET    /api/inventory/sizes          Listar tallas
 *   POST   /api/inventory/sizes          Registrar talla
 *   GET    /api/inventory/colors         Listar colores
 *   POST   /api/inventory/colors         Registrar color
 *   GET    /api/inventory/products/:id/variants  Listar variantes
 *   POST   /api/inventory/products/:id/variants  Crear variante
 *   PUT    /api/inventory/variants/:id    Actualizar stock
 *   GET    /api/orders                   Listar todos los pedidos
 *   GET    /api/orders/:id               Detalle de un pedido
 *   GET    /api/orders/history/:clienteId Historial de un cliente
 *   PATCH  /api/orders/:id/status        Cambiar estado de un pedido
 *   POST   /api/orders/:id/cancel        Cancelar un pedido
 *   GET    /api/customers                Listar clientes
 *   GET    /api/customers/:id            Detalle de un cliente
 *   GET    /api/contact                  Listar mensajes de contacto
 *   GET    /api/contact/:id              Detalle de un mensaje
 * ----------------------------------------------------------------------------
 */

import { createRouter } from "../utils/router.js";
import { requireAuth } from "../middlewares/auth.js";
import { dbConnected } from "../database.js";
import { sendJSON } from "../utils/http.js";

// Controladores
import * as productCtrl from "../controllers/productController.js";
import * as inventoryCtrl from "../controllers/inventoryController.js";
import * as authCtrl from "../controllers/authController.js";
import * as customerCtrl from "../controllers/customerController.js";
import * as orderCtrl from "../controllers/orderController.js";
import * as contactCtrl from "../controllers/contactController.js";

const router = createRouter();

// --- Health check ---
router.get("/api/health", (req, res) => {
  sendJSON(res, 200, {
    ok: true,
    server: "running",
    database: dbConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// --- Productos (público) ---
router.get("/api/products/featured", productCtrl.featured);
router.get("/api/products", productCtrl.list);
router.get("/api/products/:id/availability", productCtrl.availability);
router.get("/api/products/:id", productCtrl.getOne);

// --- Productos (admin) ---
router.post("/api/products", requireAuth, productCtrl.create);
router.put("/api/products/:id", requireAuth, productCtrl.update);
router.patch("/api/products/:id/deactivate", requireAuth, productCtrl.deactivate);

// --- Inventario (admin) ---
router.get("/api/inventory/sizes", requireAuth, inventoryCtrl.listSizes);
router.post("/api/inventory/sizes", requireAuth, inventoryCtrl.addSize);
router.get("/api/inventory/colors", requireAuth, inventoryCtrl.listColors);
router.post("/api/inventory/colors", requireAuth, inventoryCtrl.addColor);
router.get("/api/inventory/products/:id/variants", requireAuth, inventoryCtrl.listVariants);
router.post("/api/inventory/products/:id/variants", requireAuth, inventoryCtrl.addVariant);
router.put("/api/inventory/variants/:id", requireAuth, inventoryCtrl.updateStock);

// --- Autenticación ---
router.post("/api/auth/register", authCtrl.register);
router.post("/api/auth/login", authCtrl.login);
router.post("/api/auth/logout", authCtrl.logout);
router.get("/api/auth/verify", authCtrl.verify);

// --- Clientes (admin) ---
router.get("/api/customers", requireAuth, customerCtrl.list);
router.get("/api/customers/:id", requireAuth, customerCtrl.getOne);

// --- Pedidos ---
router.post("/api/orders", orderCtrl.create);                       // público
router.get("/api/orders", requireAuth, orderCtrl.list);             // admin
router.get("/api/orders/history/:clienteId", requireAuth, orderCtrl.history); // admin
router.get("/api/orders/:id", requireAuth, orderCtrl.getOne);       // admin
router.patch("/api/orders/:id/status", requireAuth, orderCtrl.updateStatus);  // admin
router.post("/api/orders/:id/cancel", requireAuth, orderCtrl.cancel);          // admin

// --- Contacto ---
router.post("/api/contact", contactCtrl.create);                    // público
router.get("/api/contact", requireAuth, contactCtrl.list);         // admin
router.get("/api/contact/:id", requireAuth, contactCtrl.getOne);  // admin

export default router;
