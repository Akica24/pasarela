/**
 * server.mjs — Servidor HTTP estático mínimo para desarrollo local.
 * Sin dependencias externas: usa únicamente los módulos nativos de Node.
 * Uso:  node server.mjs
 * Luego abre http://localhost:8000 en el navegador.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "..");
const PORT = 8000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "text/javascript; charset=utf-8",
  ".mjs":  "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".woff":  "font/woff",
  ".ttf":   "font/ttf",
};

const server = createServer(async (req, res) => {
  let urlPath = req.url.split("?")[0];
  if (urlPath === "/" || urlPath === "") urlPath = "/index.html";

  const filePath = join(ROOT, urlPath);

  // Seguridad: no salir de ROOT.
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }

  try {
    const info = await stat(filePath);
    // Si es directorio, sirve su index.html.
    const target = info.isDirectory() ? join(filePath, "index.html") : filePath;
    const ext = extname(target).toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const data = await readFile(target);
    res.writeHead(200, { "Content-Type": mime, "Cache-Control": "no-cache" });
    res.end(data);
  } catch {
    // Para rutas SPA (hash router): siempre devuelve index.html.
    try {
      const data = await readFile(join(ROOT, "index.html"));
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
      res.end(data);
    } catch {
      res.writeHead(404); res.end("Not found");
    }
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n✅ Servidor listo → http://localhost:${PORT}\n`);
});
