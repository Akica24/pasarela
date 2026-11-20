/**
 * middlewares/cors.js
 * ----------------------------------------------------------------------------
 * Middleware de CORS (Cross-Origin Resource Sharing) para permitir que el
 * frontend (servido desde GitHub Pages o localhost) haga peticiones al backend.
 *
 * Solo permite los orígenes configurados en CORS_ORIGINS (variables de entorno).
 * ----------------------------------------------------------------------------
 */

import { env } from "../config/env.js";

const ALLOWED = new Set(env.cors);

/**
 * Devuelve los headers CORS para una respuesta.
 * @param {object} req  Petición entrante
 * @returns {object} Headers a incluir en la respuesta
 */
export function corsHeaders(req) {
  const origin = req.headers.origin;
  const headers = {};
  // Solo refleja el origen si está en la lista de permitidos.
  if (origin && ALLOWED.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
    headers["Vary"] = "Origin";
  }
  headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS";
  headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization";
  return headers;
}

/**
 * Middleware que añade los headers CORS a cada respuesta y responde a
 * las peticiones preflight (OPTIONS).
 */
export function corsMiddleware(req, res, next) {
  const headers = corsHeaders(req);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  // Las peticiones OPTIONS (preflight) se responden inmediatamente.
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }
  next();
}
