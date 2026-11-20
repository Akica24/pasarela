/**
 * server.js
 * ----------------------------------------------------------------------------
 * Servidor HTTP del backend de la tienda Pasarela.
 *
 * Construido con el módulo nativo `node:http` (sin Express ni frameworks).
 * Las rutas se gestionan con el router nativo (utils/router.js) y el
 * middleware de CORS se aplica a cada petición.
 *
 * Arranque:
 *   node backend/server.js                     (variables de entorno del SO)
 *   node --env-file=.env backend/server.js     (Node 20+, lee .env)
 *
 * Si MySQL no está disponible, el servidor arranca igual pero las rutas
 * que requieren la base de datos responden 503 (Service Unavailable).
 * ----------------------------------------------------------------------------
 */

import { createServer } from "node:http";
import { env } from "./config/env.js";
import { testConnection, pool } from "./database.js";
import { corsHeaders } from "./middlewares/cors.js";
import router from "./routes/index.js";

/**
 * Handler principal: aplica CORS, responde preflight y delega al router.
 */
async function handleRequest(req, res) {
  // 1. Headers CORS en todas las respuestas.
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }

  // 2. Responder peticiones preflight (OPTIONS) inmediatamente.
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // 3. Delegar al router para que encuentre la ruta y ejecute el controlador.
  await router.handle(req, res);
}

// Crear el servidor.
const server = createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error("Error no manejado:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ ok: false, error: "Error interno del servidor." }));
    }
  });
});

// --- Arranque del servidor ---
async function start() {
  // Probar la conexión a MySQL antes de empezar a escuchar.
  await testConnection();

  server.listen(env.PORT, env.HOST, () => {
    console.log("\n========================================================");
    console.log("  Pasarela API — Servidor backend");
    console.log("========================================================");
    console.log(`  Escuchando en:  http://${env.HOST}:${env.PORT}`);
    console.log(`  Base de datos:  ${env.db.host}:${env.db.port}/${env.db.database}`);
    console.log(`  CORS permitido: ${env.cors.join(", ")}`);
    console.log("========================================================");
    console.log("  Endpoints principales:");
    console.log("    GET  /api/health");
    console.log("    GET  /api/products");
    console.log("    GET  /api/products/featured");
    console.log("    GET  /api/products/:id");
    console.log("    POST /api/orders");
    console.log("    POST /api/contact");
    console.log("    POST /api/auth/register   (registro inicial admin)");
    console.log("    POST /api/auth/login       (inicio sesión admin)");
    console.log("========================================================\n");
  });
}

// Manejo de cierre limpio: cerrar el pool de MySQL al detener el servidor.
async function shutdown(signal) {
  console.log(`\n${signal} recibido. Cerrando servidor...`);
  server.close();
  try {
    await pool.end();
    console.log("Pool de MySQL cerrado.");
  } catch (err) {
    console.error("Error al cerrar el pool:", err.message);
  }
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

// Iniciar el servidor.
start().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
