/**
 * pages.js
 * ----------------------------------------------------------------------------
 * Vistas de contenido estático: Marcas y Nosotros. Mantenidas en su propio
 * módulo para que main.js quede solo como enrutador.
 * ----------------------------------------------------------------------------
 */

import { CONFIG } from "./config.js";
import { PRODUCTS } from "./products.js";
import { BRANDS, TESTIMONIALS } from "./data.js";
import { $, escapeHtml, formatCurrency } from "./utils.js";
import { starsHtml } from "./components.js";

/* ---------------------------------------------------------------------------
 * Página de Marcas.
 * --------------------------------------------------------------------------- */
export function renderMarcas(_params, view) {
  const rows = BRANDS.map((brand) => {
    const count = PRODUCTS.filter((p) => p.brand === brand).length;
    const cheapest = PRODUCTS.filter((p) => p.brand === brand).sort((a, b) => a.price - b.price)[0];
    return `
      <a class="brand-chip reveal" href="#/catalogo/marca/${encodeURIComponent(brand)}" style="flex-direction:column;gap:.4rem;padding:1.6rem 1rem">
        <span style="font-size:1.2rem">${escapeHtml(brand)}</span>
        <span class="muted" style="font-size:.8rem;font-family:var(--font-body)">${count} modelo${count !== 1 ? "s" : ""}${cheapest ? ` · desde ${formatCurrency(cheapest.price)}` : ""}</span>
      </a>`;
  }).join("");

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span><span aria-current="page">Marcas</span>
      </nav>
      <div class="section-head center">
        <span class="eyebrow">Nuestras marcas</span>
        <h2>Calzado de las mejores marcas</h2>
        <p>Seleccionamos cada marca por su calidad, comodidad y estilo. Explora los modelos disponibles.</p>
      </div>
      <div class="brand-grid">${rows}</div>
    </div>
  `;
}

/* ---------------------------------------------------------------------------
 * Página de Nosotros.
 * --------------------------------------------------------------------------- */
export function renderNosotros(_params, view) {
  const s = CONFIG.store;
  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span><span aria-current="page">Nosotros</span>
      </nav>

      <div class="about-grid">
        <div>
          <span class="eyebrow">Sobre Pasarela</span>
          <h2 style="margin:.5rem 0">Calzado con propósito</h2>
          <p>Somos una tienda virtual dedicada a ofrecer calzado de calidad para cada momento del día. Creemos que el par correcto transforma no solo tu estilo, sino también tu forma de caminar por el mundo.</p>
          <p style="margin-top:.75rem">Seleccionamos marcas reconocidas y modelos cuidadosamente elegidos para que encuentres comodidad, durabilidad y diseño en un solo lugar. Comprar con nosotros es simple: eliges, filtras y finalizar tu pedido por WhatsApp en minutos.</p>
          <div class="hero-stats" style="margin-top:1.75rem">
            <div><div class="num">+12</div><div class="label">Marcas</div></div>
            <div><div class="num">+16</div><div class="label">Modelos</div></div>
            <div><div class="num">100%</div><div class="label">Compra online</div></div>
          </div>
        </div>
        <div class="hero-art float-soft">
          <img src="${productAboutArt()}" alt="Pasarela" />
          <div class="hero-badge bottom"><b>${escapeHtml(s.name)}</b> · ${escapeHtml(s.tagline)}</div>
        </div>
      </div>

      <section class="section">
        <div class="section-head center">
          <span class="eyebrow">Por qué elegirnos</span>
          <h2>Nuestros valores</h2>
        </div>
        <div class="cat-grid">
          ${features.map(featureHtml).join("")}
        </div>
      </section>

      <section class="section--tight">
        <div class="section-head center">
          <span class="eyebrow">Testimonios</span>
          <h2>Lo que dicen nuestros clientes</h2>
        </div>
        <div class="testimonial-grid">
          ${TESTIMONIALS.map((t) => {
            const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
            return `<article class="testimonial reveal">
              ${starsHtml(t.rating)}
              <p class="quote">“${escapeHtml(t.quote)}”</p>
              <div class="who"><div class="avatar">${escapeHtml(initials)}</div>
                <div><div class="name">${escapeHtml(t.name)}</div><div class="role">${escapeHtml(t.role)}</div></div>
              </div>
            </article>`;
          }).join("")}
        </div>
      </section>

      <div class="offer-band reveal" style="background:linear-gradient(135deg,var(--accent),var(--accent-ink));grid-template-columns:1fr auto;margin-top:2rem">
        <div>
          <h2 style="color:#fff;margin-bottom:.5rem">¿Listo para dar el siguiente paso?</h2>
          <p style="color:rgba(255,255,255,.85)">Explora el catálogo y encuentra el par que va contigo.</p>
        </div>
        <a href="#/catalogo" class="btn btn--lg" style="background:#fff;color:var(--accent-ink)">Ver catálogo</a>
      </div>
    </div>
  `;
}

/* Datos de apoyo. */
const features = [
  { ico: "✔️", title: "Calidad garantizada", text: "Marcas reconocidas y modelos cuidadosamente seleccionados." },
  { ico: "⚡", title: "Pedido por WhatsApp", text: "Finaliza tu compra en minutos y recibe asesoría directa." },
  { ico: "🚚", title: "Envío a todo el país", text: `Envío gratis desde ${formatCurrency(CONFIG.shipping.freeFrom)}.` },
  { ico: "🔒", title: "Compra confiable", text: "Tus datos se usan solo para procesar tu pedido." },
  { ico: "↩️", title: "Devoluciones fáciles", text: "Cambios y devoluciones sin complicaciones." },
  { ico: "💬", title: "Atención cercana", text: "Te acompañamos antes, durante y después de tu compra." },
];

function featureHtml(f) {
  return `<div class="cat-card reveal" style="justify-content:flex-start">
    <span class="ico" aria-hidden="true">${f.ico}</span>
    <h3>${escapeHtml(f.title)}</h3>
    <p class="muted">${escapeHtml(f.text)}</p>
  </div>`;
}

/* Imagen ilustrativa para la sección "nosotros". */
function productAboutArt() {
  // Reutiliza la primera imagen destacada.
  const p = PRODUCTS.find((x) => x.featured) || PRODUCTS[0];
  if (!p) return "";
  return import.meta ? productArtUrl(p) : "";
}

/* Pequeña función para generar un data-URI decorativo sin importar image.js. */
function productArtUrl(p) {
  // Usa image.js vía import dinámico sería async; usamos un gradiente simple.
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 440'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stop-color='#2a2723'/><stop offset='1' stop-color='#16141a'/>
      </linearGradient></defs>
      <rect width='400' height='440' fill='url(#g)'/>
      <text x='40' y='60' font-family='Georgia,serif' font-size='22' font-weight='700' fill='rgba(255,255,255,.6)'>${escapeHtml(p.brand.toUpperCase())}</text>
      <text x='40' y='400' font-family='Inter,sans-serif' font-size='16' fill='rgba(255,255,255,.7)'>${escapeHtml(p.name)}</text>
    </svg>`
  )}`;
}
