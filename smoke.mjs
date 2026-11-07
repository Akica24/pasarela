/**
 * smoke.mjs — Prueba de humo de la SPA con jsdom.
 * Carga el index en un DOM headless, mapea los globales que usan los módulos,
 * importa main.js y verifica que las vistas renderizan y que el flujo del
 * carrito + checkout genera el mensaje de WhatsApp correctamente.
 * Escribe el resultado en smoke-result.txt.
 */
import { JSDOM } from "jsdom";
import { writeFileSync } from "node:fs";

// Captura cualquier error no atrapado y lo escribe en el archivo de resultados.
process.on("uncaughtException", (e) => { writeFileSync("smoke-result.txt", "UNCAUGHT: " + (e && e.stack || e), "utf8"); process.exit(1); });
process.on("unhandledRejection", (e) => { writeFileSync("smoke-result.txt", "UNHANDLED: " + (e && e.stack || e), "utf8"); process.exit(1); });

const results = [];
const ok = (m) => results.push("✅ " + m);
const fail = (m) => { results.push("❌ " + m); };

let capturedWa = null;

const dom = new JSDOM(
  `<!doctype html><html><head><title>Zentry</title></head><body>
    <header class="site-header"><div class="container header-inner">
      <a class="brand">Zentry<span class="dot">.</span></a>
      <nav class="nav" id="nav">
        <a href="#/" data-route="">Inicio</a>
        <a href="#/catalogo" data-route="catalogo">Catálogo</a>
        <a href="#/marcas" data-route="marcas">Marcas</a>
        <a href="#/nosotros" data-route="nosotros">Nosotros</a>
        <a href="#/contacto" data-route="contacto">Contacto</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" id="cart-btn"><span class="cart-count is-empty" id="cart-count">0</span></button>
        <button class="icon-btn menu-toggle" id="menu-toggle" aria-expanded="false"></button>
      </div>
    </div></header>
    <main id="app-view" class="page"></main>
    <footer id="site-footer"></footer>
    <a id="fab-whatsapp" href="#"></a>
  </body></html>`,
  { url: "https://localhost/", pretendToBeVisual: true }
);

const win = dom.window;
const doc = win.document;

// Captura errores de consola/jsdom.
const vc = dom.virtualConsole;
vc.on("jsdomError", (e) => fail("jsdomError: " + (e.detail || e.message || e)));

// Mapeo de globales que usan los módulos (document, window, localStorage, ...).
global.window = win;
global.document = doc;
global.localStorage = win.localStorage;
try { global.location = win.location; } catch (e) { /* Node 26 puede tener location como getter */ }
global.CustomEvent = win.CustomEvent;
global.Event = win.Event;
global.Node = win.Node;
global.Element = win.Element;
global.HTMLElement = win.HTMLElement;
global.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
global.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
  unobserve() {} disconnect() {}
};
win.IntersectionObserver = global.IntersectionObserver;
global.HashChangeEvent = win.HashChangeEvent || class extends win.Event {};
win.scrollTo = () => {};
win.open = (url) => { capturedWa = url; return null; };

// Datos reutilizables en los bloques de prueba.
const { PRODUCTS, findProduct } = await import("./js/products.js");
const { Cart } = await import("./js/cart.js");

// Imagen de la home: data URIs no requieren red.
win.HTMLImageElement.prototype;

let mainModule;
try {
  mainModule = await import("./js/main.js");
  ok("main.js importado sin errores de inicialización");
} catch (e) {
  fail("main.js lanzó al importar: " + e.stack);
  writeResult();
  process.exit(1);
}

// Espera un tick para que init() (que puede usar requestAnimationFrame/setTimeout) termine.
await new Promise((r) => setTimeout(r, 50));

/* ----------------------------- HOME ----------------------------- */
try {
  const footer = doc.getElementById("site-footer");
  footer.innerHTML.includes("Zentry") ? ok("Footer renderizado con la marca") : fail("Footer vacío");
  const view = doc.getElementById("app-view");
  view.innerHTML.length > 500 ? ok(`Home renderizada (${view.innerHTML.length} chars)`) : fail("Home no renderizó");
  view.querySelector(".hero") ? ok("Sección hero presente") : fail("Falta hero");
  view.querySelector(".cat-grid") ? ok("Categorías presentes") : fail("Faltan categorías");
  view.querySelector(".product-grid") ? ok("Productos destacados presentes") : fail("Faltan destacados");
  view.querySelector(".offer-countdown") ? ok("Cuenta regresiva presente") : fail("Falta countdown");
  view.querySelector(".testimonial-grid") ? ok("Testimonios presentes") : fail("Faltan testimonios");
} catch (e) { fail("HOME: " + e.message); }

/* --------------------------- CATÁLOGO ---------------------------- */
try {
  win.location.hash = "#/catalogo";
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  await new Promise((r) => setTimeout(r, 30));
  const results = doc.getElementById("catalog-results");
  results && results.children.length > 0 ? ok(`Catálogo renderizó ${results.children.length} tarjetas`) : fail("Catálogo sin resultados");
  doc.getElementById("sort-select") ? ok("Selector de orden presente") : fail("Falta orden");
  doc.getElementById("search-input") ? ok("Buscador presente") : fail("Falta buscador");
  doc.getElementById("filters") ? ok("Panel de filtros presente") : fail("Faltan filtros");
  doc.getElementById("result-count") ? ok("Conteo de resultados presente") : fail("Falta conteo");
} catch (e) { fail("CATALOG: " + e.message); }

/* ----------------------------- FILTROS --------------------------- */
try {
  win.location.hash = "#/catalogo";
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  await new Promise((r) => setTimeout(r, 30));
  // Selección de talla (botón)
  const sizeBtn = doc.querySelector('[data-f="size"]');
  if (sizeBtn) { sizeBtn.click(); await new Promise((r) => setTimeout(r, 20)); }
  // Selección de color (swatch)
  const colorBtn = doc.querySelector('[data-f="color"]');
  if (colorBtn) { colorBtn.click(); await new Promise((r) => setTimeout(r, 20)); }
  // Búsqueda en vivo (con debounce)
  const search = doc.getElementById("search-input");
  search.value = "nike";
  search.dispatchEvent(new win.Event("input", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 350));
  const rc = doc.getElementById("result-count").textContent;
  rc ? ok("Filtros: interacción sin errores (resultados: " + rc + ")") : fail("Filtros: sin conteo tras filtrar");
  // Limpiar filtros
  doc.getElementById("clear-filters").click();
  await new Promise((r) => setTimeout(r, 20));
  ok("Filtros: botón limpiar ejecutado sin errores");
} catch (e) { fail("FILTERS: " + e.message); }

/* ------------------------- DETALLE ------------------------------- */
try {
  win.location.hash = "#/producto/" + encodeURIComponent(PRODUCTS[0].id);
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  await new Promise((r) => setTimeout(r, 30));
  const g = doc.getElementById("gallery");
  g ? ok("Detalle: galería presente") : fail("Detalle: falta galería");
  doc.getElementById("color-pick") ? ok("Detalle: selector de color") : fail("Detalle: falta color");
  doc.getElementById("size-pick") ? ok("Detalle: selector de talla") : fail("Detalle: falta talla");
  doc.getElementById("add-to-cart") ? ok("Detalle: botón agregar al carrito") : fail("Detalle: falta botón");
  doc.getElementById("ask-whatsapp") ? ok("Detalle: botón WhatsApp") : fail("Detalle: falta WhatsApp");
} catch (e) { fail("DETAIL: " + e.message); }

/* --------------------------- CARRITO ----------------------------- */
try {
  const p = findProduct(PRODUCTS[0].id);
  Cart.clear();
  const added = Cart.add(p, { size: p.sizes[0], color: p.colors[0].name, colorHex: p.colors[0].hex, qty: 2 });
  await new Promise((r) => setTimeout(r, 20));
  const badge = doc.getElementById("cart-count");
  Cart.count() === 2 ? ok("Carrito: cantidad total = 2") : fail("Carrito: count incorrecto (" + Cart.count() + ")");
  badge.textContent === "2" ? ok("Carrito: badge actualizado a 2") : fail("Carrito: badge no actualizado (" + badge.textContent + ")");
  // Deduplicación: agregar el mismo par aumenta la cantidad, no duplica la línea.
  Cart.add(p, { size: p.sizes[0], color: p.colors[0].name, colorHex: p.colors[0].hex, qty: 1 });
  Cart.items().length === 1 ? ok("Carrito: no duplica línea igual (fusiona cantidad)") : fail("Carrito: duplicó la línea");
  Cart.count() === 3 ? ok("Carrito: cantidad fusionada = 3") : fail("Carrito: cantidad fusionada incorrecta (" + Cart.count() + ")");
  // Persistencia en localStorage.
  const stored = JSON.parse(localStorage.getItem("zentry_cart") || "[]");
  stored.length === 1 ? ok("Carrito: persistido en LocalStorage") : fail("Carrito: no persistió");
} catch (e) { fail("CART: " + e.message); }

/* ------------------------- CHECKOUT / WHATSAPP ------------------- */
try {
  win.location.hash = "#/checkout";
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  await new Promise((r) => setTimeout(r, 30));
  const form = doc.getElementById("checkout-form");
  form ? ok("Checkout: formulario presente") : fail("Checkout: sin formulario");

  // Validación: sin datos no debe abrir WhatsApp.
  capturedWa = null;
  form.dispatchEvent(new win.Event("submit", { cancelable: true, bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));
  capturedWa === null ? ok("Checkout: bloquea envío sin datos") : fail("Checkout: envió sin validar");

  // Llenar datos válidos.
  const set = (id, v) => { const el = doc.getElementById(id); el.value = v; };
  set("ck-name", "María Pérez");
  set("ck-phone", "3125550142");
  set("ck-email", "maria@correo.com");
  const depto = doc.getElementById("ck-depto");
  depto.value = depto.options[1].value;
  depto.dispatchEvent(new win.Event("change", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 10));
  const ciudad = doc.getElementById("ck-ciudad");
  ciudad.value = ciudad.options[1].value;
  set("ck-barrio", "Centro");
  set("ck-address", "Cra 11 #93-77 Apto 302");
  doc.getElementById("ck-consent").checked = true;

  capturedWa = null;
  form.dispatchEvent(new win.Event("submit", { cancelable: true, bubbles: true }));
  await new Promise((r) => setTimeout(r, 20));

  if (capturedWa && capturedWa.startsWith("https://wa.me/")) {
    ok("Checkout: abrió wa.me");
    const decoded = decodeURIComponent(capturedWa.split("?text=")[1] || "");
    decoded.includes("María Pérez") ? ok("Checkout: mensaje incluye nombre") : fail("Checkout: falta nombre en mensaje");
    decoded.includes("Teléfono") ? ok("Checkout: mensaje incluye teléfono") : fail("Checkout: falta teléfono");
    decoded.includes("Ciudad") ? ok("Checkout: mensaje incluye ciudad") : fail("Checkout: falta ciudad");
    decoded.includes("Dirección") ? ok("Checkout: mensaje incluye dirección") : fail("Checkout: falta dirección");
    decoded.includes("Barrio") ? ok("Checkout: mensaje incluye barrio") : fail("Checkout: falta barrio");
    decoded.includes("Talla") ? ok("Checkout: mensaje incluye talla") : fail("Checkout: falta talla");
    decoded.includes("Color") ? ok("Checkout: mensaje incluye color") : fail("Checkout: falta color");
    decoded.includes("Cantidad") ? ok("Checkout: mensaje incluye cantidad") : fail("Checkout: falta cantidad");
    decoded.includes("TOTAL") ? ok("Checkout: mensaje incluye total") : fail("Checkout: falta total");
    decoded.includes("Zentry") ? ok("Checkout: mensaje incluye nombre de la tienda") : fail("Checkout: falta nombre de la tienda");
  } else {
    fail("Checkout: no abrió WhatsApp (capturedWa=" + capturedWa + ")");
  }
} catch (e) { fail("CHECKOUT: " + e.stack); }

/* --------------------------- CONTACTO ---------------------------- */
try {
  win.location.hash = "#/contacto";
  win.dispatchEvent(new win.HashChangeEvent("hashchange"));
  await new Promise((r) => setTimeout(r, 30));
  doc.getElementById("contact-form") ? ok("Contacto: formulario presente") : fail("Contacto: sin formulario");
  doc.getElementById("contact-wa") ? ok("Contacto: botón WhatsApp presente") : fail("Contacto: falta botón WhatsApp");
} catch (e) { fail("CONTACT: " + e.message); }

writeResult();
function writeResult() {
  results.push("\n" + (results.filter((r) => r.startsWith("❌")).length === 0 ? "RESULTADO: TODO OK ✅" : `RESULTADO: ${results.filter((r) => r.startsWith("❌")).length} FALLOS`));
  writeFileSync("smoke-result.txt", results.join("\n"), "utf8");
}
process.exit(0);
