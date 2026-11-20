/**
 * utils/http.js
 * ----------------------------------------------------------------------------
 * Helpers para enviar respuestas HTTP y parsear el cuerpo de las peticiones.
 * Diseñados para usarse con el módulo nativo `node:http` (sin Express).
 * ----------------------------------------------------------------------------
 */

/**
 * Envía una respuesta JSON con el código de estado indicado.
 * @param {object} res  Objeto ServerResponse de Node
 * @param {number} code Código HTTP (200, 400, 404, 500, …)
 * @param {object} data Objeto a serializar como JSON
 */
export function sendJSON(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  res.end(body);
}

// --- Atajos para códigos comunes ---
export const ok = (res, data) => sendJSON(res, 200, { ok: true, ...data });
export const created = (res, data) => sendJSON(res, 201, { ok: true, ...data });
export const badRequest = (res, message) => sendJSON(res, 400, { ok: false, error: message });
export const unauthorized = (res, message = "No autorizado") => sendJSON(res, 401, { ok: false, error: message });
export const forbidden = (res, message = "Acceso denegado") => sendJSON(res, 403, { ok: false, error: message });
export const notFound = (res, message = "Recurso no encontrado") => sendJSON(res, 404, { ok: false, error: message });
export const serverError = (res, message = "Error interno del servidor") => sendJSON(res, 500, { ok: false, error: message });
export const serviceUnavailable = (res, message = "Servidor no disponible. La base de datos no está conectada.") => sendJSON(res, 503, { ok: false, error: message });

/**
 * Lee y parsea el cuerpo JSON de una petición.
 * Devuelve null si el cuerpo está vacío.
 * @param {object} req  Objeto IncomingMessage de Node
 * @param {number} maxSize  Tamaño máximo del cuerpo en bytes (1 MB por defecto)
 * @returns {Promise<object|null>}
 */
export function readBody(req, maxSize = 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        req.destroy();
        reject(new Error("El cuerpo de la petición excede el tamaño máximo."));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf-8");
      if (!raw) return resolve(null);
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("El cuerpo no es un JSON válido."));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Extrae los parámetros de consulta (query string) de la URL.
 * @param {string} url  URL de la petición (ej: /api/products?brand=Nike&page=1)
 * @returns {object} Objeto con los parámetros { brand: "Nike", page: "1" }
 */
export function getQueryParams(url) {
  const idx = url.indexOf("?");
  if (idx === -1) return {};
  const search = url.slice(idx + 1);
  const params = {};
  for (const pair of search.split("&")) {
    const [key, val] = pair.split("=");
    if (key) params[decodeURIComponent(key)] = val ? decodeURIComponent(val) : "";
  }
  return params;
}
