/**
 * main.js
 * ----------------------------------------------------------------------------
 * Punto de entrada de la aplicación. Orquesta:
 *  - El enrutador SPA basado en hash (#/catalogo, #/producto/:id, ...).
 *  - El layout compartido (footer, botones de carrito, menú móvil).
 *  - El badge del carrito, que se actualiza ante cualquier cambio.
 *  - La activación de animaciones de entrada (reveal) tras cada render.
 *
 * Cada "vista" vive en su propio módulo (home.js, catalog.js, ...) y expone
 * una función render(params, view). Así, añadir una página nueva implica
 * solo crear un módulo y registrar la ruta aquí.
 * ----------------------------------------------------------------------------
 */

import { CONFIG, whatsappUrl } from "./config.js";
import { $, parseHash, escapeHtml } from "./utils.js";
import { updateCartBadge } from "./cart.js";
import { renderHome } from "./home.js";
import { renderCatalog } from "./catalog.js";
import { renderProductDetails } from "./product-details.js";
import { renderCart } from "./cart.js";
import { renderCheckout } from "./checkout.js";
import { renderContact } from "./contact.js";
import { renderMarcas, renderNosotros } from "./pages.js";
import { NAV_LINKS } from "./data.js";

/* ---------------------------------------------------------------------------
 * Tabla de rutas. La clave coincide con el primer segmento del hash.
 * El valor es la función que pinta la vista dentro de #app-view.
 * --------------------------------------------------------------------------- */
const routes = {
  "": { handler: renderHome, title: "Inicio" },
  catalogo: { handler: renderCatalog, title: "Catálogo" },
  ofertas: { handler: renderCatalog, title: "Ofertas" },
  producto: { handler: renderProductDetails, title: "Producto" },
  carrito: { handler: renderCart, title: "Carrito" },
  checkout: { handler: renderCheckout, title: "Finalizar pedido" },
  contacto: { handler: renderContact, title: "Contacto" },
  marcas: { handler: renderMarcas, title: "Marcas" },
  nosotros: { handler: renderNosotros, title: "Nosotros" },
};

/* ---------------------------------------------------------------------------
 * Resuelve y ejecuta la ruta actual.
 * --------------------------------------------------------------------------- */
function handleRoute() {
  closeNav();
  const path = parseHash();
  const [name, ...params] = path.split("/");
  const key = name || "";
  const route = routes[key] || routes[""];

  // Título de la pestaña según la ruta.
  document.title = `${route.title} · ${CONFIG.store.name}`;

  // Pequeña transición de entrada de vista.
  const view = $("#app-view");
  view.classList.remove("view-enter");
  void view.offsetWidth;
  view.classList.add("view-enter");

  route.handler(params, view);
  highlightActiveNav(key);
  observeReveal();
  window.scrollTo({ top: 0 });
}

/* ---------------------------------------------------------------------------
 * Resalta el enlace de navegación activo según la ruta.
 * --------------------------------------------------------------------------- */
function highlightActiveNav(key) {
  $("#nav")
    .querySelectorAll("a")
    .forEach((a) => {
      a.classList.toggle("active", a.dataset.route === key);
    });
}

/* ---------------------------------------------------------------------------
 * Animaciones de entrada: observa los elementos .reveal agregados por las
 * vistas y les añade la clase .in al entrar en el viewport.
 * --------------------------------------------------------------------------- */
let revealObserver = null;
function observeReveal() {
  if (!("IntersectionObserver" in window)) {
    $("#app-view").querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }
  $("#app-view").querySelectorAll(".reveal:not(.in)").forEach((el) => revealObserver.observe(el));
}

/* ---------------------------------------------------------------------------
 * Menú móvil.
 * --------------------------------------------------------------------------- */
function closeNav() {
  const nav = $("#nav");
  const toggle = $("#menu-toggle");
  if (!nav) return;
  nav.classList.remove("open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}
function toggleNav() {
  const nav = $("#nav");
  const toggle = $("#menu-toggle");
  const open = !nav.classList.contains("open");
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

/* ---------------------------------------------------------------------------
 * Footer: se construye desde CONFIG y data para mantener un único origen.
 * --------------------------------------------------------------------------- */
function renderFooter() {
  const s = CONFIG.store;
  const social = CONFIG.social;
  const footer = $("#site-footer");
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="#/" class="brand">Pasarela<span class="dot">.</span></a>
          <p style="margin-top:.6rem;max-width:34ch">${escapeHtml(CONFIG.store.tagline)}. Calzado seleccionado con detalle para acompañar cada paso.</p>
          <form class="footer-news" id="newsletter-form" novalidate>
            <label for="nl-email" style="font-size:.8rem;font-weight:600;color:rgba(255,255,255,.8)">Recibe novedades y ofertas</label>
            <input id="nl-email" type="email" placeholder="tu@correo.com" aria-label="Correo electrónico para newsletter" />
            <button type="submit" class="btn btn--accent btn--sm" style="margin-top:.5rem">Suscribirme</button>
          </form>
        </div>
        <div>
          <h4>Tienda</h4>
          <nav class="footer-links">
            ${NAV_LINKS.map((l) => `<a href="#/${l.route}">${l.label}</a>`).join("")}
            <a href="#/ofertas">Ofertas</a>
          </nav>
        </div>
        <div>
          <h4>Ayuda</h4>
          <nav class="footer-links">
            <a href="#/nosotros">Nosotros</a>
            <a href="#/contacto">Contacto</a>
            <a href="#/contacto">Envíos y devoluciones</a>
            <a href="#/contacto">Tallas y medidas</a>
          </nav>
        </div>
        <div>
          <h4>Contacto</h4>
          <nav class="footer-links">
            <a href="tel:${s.phone.replace(/\s/g, "")}">${escapeHtml(s.phone)}</a>
            <a href="mailto:${s.email}">${escapeHtml(s.email)}</a>
            <span>${escapeHtml(s.address)}</span>
            <span>${escapeHtml(s.schedule)}</span>
          </nav>
          <div class="social-row">
            ${socialIcon("instagram", social.instagram)}
            ${socialIcon("facebook", social.facebook)}
            ${socialIcon("tiktok", social.tiktok)}
            ${socialIcon("x", social.x)}
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${escapeHtml(s.name)}. Proyecto educativo — Frontend.</span>
        <span>Hecho con HTML, CSS y JavaScript · Desplegable en GitHub Pages</span>
      </div>
    </div>
  `;

  // Newsletter: validación mínima (solo frontend, no se envía a servidor).
  $("#newsletter-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $("#nl-email");
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      import("./ui.js").then(({ toast }) =>
        toast("¡Gracias! Te avisaremos de las novedades.", "success")
      );
      email.value = "";
    } else {
      import("./ui.js").then(({ toast }) =>
        toast("Ingresa un correo válido.", "error")
      );
    }
  });
}

/* Iconos SVG de redes (sin dependencias externas). */
function socialIcon(name, href) {
  const icons = {
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    facebook: '<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z"/>',
    tiktok: '<path d="M14 4v8.5a3 3 0 1 1-2-2.8V7.2a6 6 0 1 0 4 5.7V8a5 5 0 0 0 3 1V6a8 8 0 0 1-5-2z"/>',
    x: '<path d="M4 4l7 8-7 8h2l6-7 5 7h4l-7-9 7-7h-2l-5 6-5-6z"/>',
  };
  return `<a href="${href}" target="_blank" rel="noopener" aria-label="${name}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg>
  </a>`;
}

/* ---------------------------------------------------------------------------
 * Inicialización de la app.
 * --------------------------------------------------------------------------- */
function init() {
  renderFooter();

  // Botón flotante de WhatsApp.
  $("#fab-whatsapp").href = whatsappUrl();

  // Botón de carrito -> vista del carrito.
  $("#cart-btn").addEventListener("click", () => {
    window.location.hash = "#/carrito";
  });

  // Menú móvil.
  $("#menu-toggle").addEventListener("click", toggleNav);

  // Badge del carrito: actualiza en cada cambio y al cargar.
  updateCartBadge();
  window.addEventListener("cart:change", updateCartBadge);

  // Enrutador.
  window.addEventListener("hashchange", handleRoute);

  // Cierre del menú al hacer clic en un enlace (en móvil).
  $("#nav").addEventListener("click", (e) => {
    if (e.target.tagName === "A") closeNav();
  });

  // Ruta inicial.
  handleRoute();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
