/**
 * utils/router.js
 * ----------------------------------------------------------------------------
 * Router HTTP ligero construido sobre el módulo nativo `node:http`.
 *
 * Permite definir rutas con patrones que incluyen parámetros dinámicos
 * (ej: /api/products/:id) y las compara con la URL entrante.
 *
 * Uso:
 *   const r = createRouter();
 *   r.get("/api/products", controller.list);
 *   r.get("/api/products/:id", controller.getOne);
 *   r.post("/api/products", authMiddleware, controller.create);
 *   export default r;
 *
 * En server.js:
 *   const router = createRouter();
 *   // registrar rutas...
 *   server.on("request", router.handle);
 * ----------------------------------------------------------------------------
 */

import { getQueryParams, sendJSON } from "./http.js";

/**
 * Convierte un patrón como "/api/products/:id" en una expresión regular
 * y extrae los nombres de los parámetros.
 * @param {string} pattern  Patrón de la ruta
 * @returns {{regex: RegExp, params: string[]}}
 */
function compilePattern(pattern) {
  const params = [];
  // Reemplaza :param por grupos de captura. El resto se escapa.
  const regexStr = pattern.replace(/:([A-Za-z_]+)/g, (_, name) => {
    params.push(name);
    return "([^/]+)";
  });
  return {
    regex: new RegExp("^" + regexStr + "/?$"),
    params,
  };
}

export function createRouter() {
  // Lista de rutas registradas: { method, compiled, params, handlers }
  const routes = [];

  const addRoute = (method, pattern, ...handlers) => {
    const compiled = compilePattern(pattern);
    routes.push({ method, pattern, compiled, handlers });
  };

  const router = {
    get: (p, ...h) => addRoute("GET", p, ...h),
    post: (p, ...h) => addRoute("POST", p, ...h),
    put: (p, ...h) => addRoute("PUT", p, ...h),
    patch: (p, ...h) => addRoute("PATCH", p, ...h),
    delete: (p, ...h) => addRoute("DELETE", p, ...h),

    /**
     * Procesa una petición HTTP entrante.
     * Encadena los middlewares/controladores registrados para la ruta
     * coincidente. Cada handler recibe (req, res, next, params).
     */
    handle: async (req, res) => {
      const urlPath = req.url.split("?")[0];
      const query = getQueryParams(req.url);
      req.query = query;

      // Encuentra la primera ruta que coincida en método y path.
      for (const route of routes) {
        if (route.method !== req.method) continue;
        const match = route.compiled.regex.exec(urlPath);
        if (!match) continue;

        // Extrae los valores de los parámetros de la URL.
        const params = {};
        route.compiled.params.forEach((name, i) => {
          params[name] = decodeURIComponent(match[i + 1]);
        });
        req.params = params;

        // Encadena los handlers (middlewares + controlador final).
        let index = 0;
        const next = async (err) => {
          if (err) {
            console.error("Error en ruta:", err);
            return sendJSON(res, 500, { ok: false, error: "Error interno del servidor." });
          }
          if (index >= route.handlers.length) return;
          const handler = route.handlers[index++];
          try {
            await handler(req, res, next, params);
          } catch (e) {
            if (!res.headersSent) {
              console.error("Error no manejado:", e);
              sendJSON(res, 500, { ok: false, error: "Error interno del servidor." });
            }
          }
        };
        await next();
        return; // Ruta encontrada y procesada.
      }

      // Ninguna ruta coincidió.
      sendJSON(res, 404, { ok: false, error: `Ruta no encontrada: ${req.method} ${urlPath}` });
    },
  };

  return router;
}
