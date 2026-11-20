/**
 * database.js
 * ----------------------------------------------------------------------------
 * Gestión de la conexión entre Node.js y MySQL mediante mysql2.
 *
 * Crea un pool de conexiones (mysql2/promise) que reutiliza conexiones y
 * limita el número máximo de conexiones simultáneas. Todas las consultas se
 * realizan con parámetros (?) para evitar inyección SQL.
 *
 * Las credenciales provienen de variables de entorno (config/env.js), nunca
 * se escriben directamente en el código.
 *
 * Si la conexión falla al arrancar, el servidor lo informa claramente y
 * continúa ejecutándose (la API responderá 503 en las rutas que requieran
 * la base de datos), de modo que el frontend pueda mostrar el mensaje de
 * "servidor no disponible".
 * ----------------------------------------------------------------------------
 */

import mysql from "mysql2/promise";
import { env } from "./config/env.js";

// Pool de conexiones. waitForConnections evita errores bajo carga.
export const pool = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  timezone: "local",
});

/**
 * Bandera que indica si la base de datos está conectada.
 * Se actualiza al arrancar el servidor y tras cada verificación.
 */
export let dbConnected = false;

/**
 * Verifica que la conexión a MySQL funcione. Devuelve true si todo está bien
 * o false si hubo un error. También imprime un mensaje claro en la consola.
 */
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    dbConnected = true;
    console.log("✅ Conexión a MySQL establecida correctamente.");
    return true;
  } catch (err) {
    dbConnected = false;
    console.error("❌ No se pudo conectar a MySQL:");
    console.error("   Host:", env.db.host + ":" + env.db.port);
    console.error("   Base de datos:", env.db.database);
    console.error("   Usuario:", env.db.user);
    console.error("   Error:", err.message);
    console.error("   Verifica que MySQL esté en ejecución y que las");
    console.error("   credenciales en el archivo .env sean correctas.");
    return false;
  }
}

/**
 * Ejecuta una consulta parametrizada y devuelve las filas.
 * @param {string} sql  Consulta SQL con placeholders (?)
 * @param {Array}  params  Valores a sustituir en los placeholders
 * @returns {Promise<Array>} Filas devueltas por la consulta
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Ejecuta una consulta dentro de una transacción.
 * Recibe una función que recibe la conexión y debe usar conn.execute().
 * Si la función lanza un error, se hace rollback automáticamente.
 *
 * @param {Function} fn  Función async que recibe la conexión de la BD
 * @returns {Promise<*>} Lo que devuelva fn
 */
export async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
