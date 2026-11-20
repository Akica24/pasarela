/**
 * config/env.js
 * ----------------------------------------------------------------------------
 * Carga y centraliza las variables de entorno del backend.
 *
 * No se usan librerías externas (como dotenv): se leen directamente de
 * process.env. En desarrollo se puede usar un archivo .env cargado con
 * `node --env-file=.env` (Node 20+) o exportando las variables en la consola.
 *
 * Todas las credenciales se leen desde aquí; jamás se escriben directamente
 * en el código fuente.
 * ----------------------------------------------------------------------------
 */

// Puerto donde escucha el servidor HTTP del backend.
export const PORT = Number(process.env.PORT) || 3000;

// Host del servidor (0.0.0.0 permite conexiones externas; 127.0.0.1 solo local).
export const HOST = process.env.HOST || "0.0.0.0";

// --- Base de datos (MySQL) ---
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = Number(process.env.DB_PORT) || 3306;
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || "";
export const DB_NAME = process.env.DB_NAME || "tienda_zapatos";

// --- CORS ---
// Orígenes permitidos separados por coma. Incluye localhost:8000 (dev local)
// y el patrón de GitHub Pages para producción.
export const CORS_ORIGINS = (process.env.CORS_ORIGINS ||
  "http://localhost:8000,http://127.0.0.1:5500,http://127.0.0.1:8000").split(",").map(s => s.trim());

// --- Sesión de administrador ---
// Tiempo de vida del token de sesión en milisegundos (8 horas por defecto).
export const SESSION_TTL = Number(process.env.SESSION_TTL) || 8 * 60 * 60 * 1000;

// Objeto consolidado para facilitar la importación.
export const env = {
  PORT,
  HOST,
  db: { host: DB_HOST, port: DB_PORT, user: DB_USER, password: DB_PASSWORD, database: DB_NAME },
  cors: CORS_ORIGINS,
  sessionTtl: SESSION_TTL,
};
