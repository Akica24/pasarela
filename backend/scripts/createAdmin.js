/**
 * scripts/createAdmin.js
 * ----------------------------------------------------------------------------
 * Script para crear el administrador inicial de la tienda.
 *
 * Uso:
 *   node --env-file=.env backend/scripts/createAdmin.js
 *
 * Si no se pasan argumentos, usa valores por defecto (solo para desarrollo):
 *   --nombre="Administrador" --correo=admin@pasarela.co --password=admin12345
 *
 * También se pueden pasar los datos como argumentos:
 *   node backend/scripts/createAdmin.js --nombre="Juan" --correo=juan@test.com --password=secreto123
 *
 * Si ya existe un administrador, el script avisa y no hace nada (para evitar
 * sobrescribir credenciales existentes).
 * ----------------------------------------------------------------------------
 */

import { pool, testConnection } from "../database.js";
import { count, findByEmail, create } from "../models/userModel.js";
import { hashPassword } from "../utils/crypto.js";

// Parsea argumentos de la línea de comandos (--clave=valor).
function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([A-Za-z_]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function main() {
  console.log("\n========================================================");
  console.log("  Creación del administrador inicial");
  console.log("========================================================\n");

  // Verificar conexión a MySQL.
  const connected = await testConnection();
  if (!connected) {
    console.error("\n❌ No se puede crear el administrador sin conexión a MySQL.");
    console.error("   Verifica que MySQL esté en ejecución y que las credenciales");
    console.error("   en el archivo .env sean correctas.\n");
    process.exit(1);
  }

  // Verificar si ya existe un administrador.
  const total = await count();
  if (total > 0) {
    console.log("⚠️  Ya existe un administrador en la base de datos.");
    console.log("   Si necesitas crear otro, usa la ruta POST /api/auth/register");
    console.log("   después de iniciar sesión como administrador, o elimina el");
    console.log("   administrador existente y vuelve a ejecutar este script.\n");
    await pool.end();
    process.exit(0);
  }

  // Obtener credenciales (argumentos o valores por defecto).
  const args = parseArgs();
  const nombre = args.nombre || "Administrador";
  const correo = args.correo || "admin@pasarela.co";
  const password = args.password || "admin12345";
  const telefono = args.telefono || null;

  console.log(`  Nombre:   ${nombre}`);
  console.log(`  Correo:   ${correo}`);
  console.log(`  Teléfono: ${telefono || "(no definido)"}`);
  console.log(`  Password: ${"*".repeat(password.length)} (${password.length} caracteres)\n`);

  // Validar la contraseña.
  if (password.length < 8) {
    console.error("❌ La contraseña debe tener al menos 8 caracteres.\n");
    await pool.end();
    process.exit(1);
  }

  // Verificar que el correo no esté en uso.
  const existing = await findByEmail(correo);
  if (existing) {
    console.error(`❌ Ya existe un usuario con el correo ${correo}.\n`);
    await pool.end();
    process.exit(1);
  }

  // Hashear la contraseña con scrypt.
  console.log("  Hasheando contraseña con scrypt...");
  const hashedPassword = await hashPassword(password);

  // Crear el administrador.
  const id = await create({
    nombre,
    correo,
    telefono,
    password: hashedPassword,
    rol: "admin",
  });

  console.log("\n✅ Administrador creado correctamente.");
  console.log(`   ID:      ${id}`);
  console.log(`   Nombre:  ${nombre}`);
  console.log(`   Correo:  ${correo}`);
  console.log(`   Rol:     admin`);
  console.log("\n   Puedes iniciar sesión en POST /api/auth/login con estas credenciales.\n");

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message, "\n");
  process.exit(1);
});
