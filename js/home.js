/**
 * home.js
 * ----------------------------------------------------------------------------
 * Página de inicio. Compone el banner principal, categorías, productos
 * destacados, marcas, ofertas y testimonios. Cada sección es una función
 * parcial para mantener el archivo legible.
 * ----------------------------------------------------------------------------
 */

import { CONFIG } from "./config.js";
import { CATEGORIES, BRANDS, TESTIMONIALS } from "./data.js";
import { featuredProducts } from "./products.js";
import { productImage } from "./image.js";
import { productCard, starsHtml } from "./components.js";
import { escapeHtml, formatCurrency } from "./utils.js";

let countdownTimer = null;

/* ---------------------------------------------------------------------------
 * Render principal de la home.
 * --------------------------------------------------------------------------- */
export function renderHome(_params, view) {
  clearCountdown();
  const hero = featuredProducts()[0] || null;

  view.innerHTML = `
    ${heroHtml(hero)}
    ${logosStripHtml()}
    <section class="section container">
      <div class="section-head center">
        <span class="eyebrow">Categorías</span>
        <h2>Encuentra tu estilo</h2>
        <p>Explora el calzado por categoría y descubre el par que va contigo.</p>
      </div>
      <div class="cat-grid">${CATEGORIES.map(catCard).join("")}</div>
    </section>

    <section class="section container">
      <div class="between section-head" style="margin-inline:0;max-width:none">
        <div>
          <span class="eyebrow">Selección</span>
          <h2>Productos destacados</h2>
          <p>Lo más buscado de la temporada, elegido para ti.</p>
        </div>
        <a href="#/catalogo" class="btn btn--outline btn--sm">Ver todo</a>
      </div>
      <div class="product-grid">${featuredProducts().map((p) => productCard(p)).join("")}</div>
    </section>

    ${offerBandHtml()}

    <section class="section container">
      <div class="section-head center">
        <span class="eyebrow">Nuestras marcas</span>
        <h2>Calidad que confías</h2>
        <p>Trabajamos con las marcas más reconocidas del mercado.</p>
      </div>
      <div class="brand-grid">${BRANDS.map(brandChipHtml).join("")}</div>
      <div style="text-align:center;margin-top:1.5rem">
        <a href="#/marcas" class="btn btn--ghost btn--sm">Conoce todas las marcas →</a>
      </div>
    </section>

    <section class="section container">
      <div class="section-head center">
        <span class="eyebrow">Testimonios</span>
        <h2>Lo que dicen nuestros clientes</h2>
      </div>
      <div class="testimonial-grid">${TESTIMONIALS.map(testimonialHtml).join("")}</div>
    </section>

    ${ctaStripHtml()}
  `;

  startCountdown();
}

/* ---------------------------------------------------------------------------
 * Hero / banner principal.
 * --------------------------------------------------------------------------- */
function heroHtml(hero) {
  const art = hero ? productImage(hero, 0) : "";
  const heroBadges = hero
    ? `
      <div class="hero-badge top"><span class="swatch" style="background:${hero.colors[0].hex}"></span>${escapeHtml(hero.brand)}</div>
      <div class="hero-badge bottom"><b>${formatCurrency(hero.price)}</b> · ${escapeHtml(hero.name)}</div>`
    : "";
  return `
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-copy">
          <span class="eyebrow">Nueva temporada 2026</span>
          <h1>Paso firme,<br><span class="accent">estilo propio</span></h1>
          <p class="lead">Calzado seleccionado con detalle, desde los urbanos más versátiles hasta los formales que celebran cada ocasión. Compra fácil y finaliza tu pedido por WhatsApp.</p>
          <div class="hero-actions">
            <a href="#/catalogo" class="btn btn--accent btn--lg">Explorar productos</a>
            <a href="#/ofertas" class="btn btn--outline btn--lg">Ver ofertas</a>
          </div>
          <div class="hero-stats">
            <div><div class="num">+12</div><div class="label">Marcas</div></div>
            <div><div class="num">1.5k+</div><div class="label">Clientes felices</div></div>
            <div><div class="num">${formatCurrency(CONFIG.shipping.freeFrom).replace(/\s/g, "")}</div><div class="label">Envío gratis desde</div></div>
          </div>
        </div>
        <div class="hero-art float-soft">
          ${art ? `<img src="${art}" alt="${escapeHtml(hero.brand + " " + hero.name)}" />` : ""}
          ${heroBadges}
        </div>
      </div>
    </section>`;
}

/* Banda de logos (marcas) justo bajo el hero. */
function logosStripHtml() {
  return `
    <div style="border-bottom:1px solid var(--line);background:var(--surface)">
      <div class="container" style="display:flex;gap:1.5rem;flex-wrap:wrap;justify-content:space-between;align-items:center;padding-block:1.25rem;opacity:.7">
        ${BRANDS.slice(0, 7).map((b) => `<span style="font-family:var(--font-display);font-weight:600;font-size:1.05rem;color:var(--ink-2)">${escapeHtml(b)}</span>`).join("")}
      </div>
    </div>`;
}

/* Tarjeta de categoría. */
function catCard(cat) {
  return `
    <a class="cat-card reveal" href="#/catalogo/${cat.slug}">
      <span class="ico" aria-hidden="true">${cat.icon}</span>
      <h3>${escapeHtml(cat.name)}</h3>
      <p class="muted">${escapeHtml(cat.description)}</p>
    </a>`;
}

/* Banda de ofertas con cuenta regresiva. */
function offerBandHtml() {
  return `
    <section class="section container">
      <div class="offer-band reveal">
        <div>
          <span class="eyebrow">Ofertas de la semana</span>
          <h2 style="margin:.5rem 0">Hasta -35% en modelos seleccionados</h2>
          <p>Aprovecha los precios especiales antes de que termine la campaña.</p>
          <div class="offer-countdown" id="offer-countdown" aria-label="Tiempo restante de la oferta">
            <div class="unit"><div class="num" data-u="d">--</div><div class="lbl">Días</div></div>
            <div class="unit"><div class="num" data-u="h">--</div><div class="lbl">Horas</div></div>
            <div class="unit"><div class="num" data-u="m">--</div><div class="lbl">Min</div></div>
            <div class="unit"><div class="num" data-u="s">--</div><div class="lbl">Seg</div></div>
          </div>
          <a href="#/ofertas" class="btn btn--accent btn--lg" style="margin-top:1.25rem">Ver ofertas</a>
        </div>
        <div class="deco">-35%</div>
      </div>
    </section>`;
}

function startCountdown() {
  const el = document.getElementById("offer-countdown");
  if (!el) return;
  // La oferta "termina" en 2 días, 8 horas desde la carga.
  const end = Date.now() + (2 * 24 * 60 * 60 + 8 * 60 * 60) * 1000;
  const tick = () => {
    if (!document.body.contains(el)) {
      clearCountdown();
      return;
    }
    let diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000); diff %= 86400000;
    const h = Math.floor(diff / 3600000); diff %= 3600000;
    const m = Math.floor(diff / 60000); diff %= 60000;
    const s = Math.floor(diff / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    el.querySelector('[data-u="d"]').textContent = pad(d);
    el.querySelector('[data-u="h"]').textContent = pad(h);
    el.querySelector('[data-u="m"]').textContent = pad(m);
    el.querySelector('[data-u="s"]').textContent = pad(s);
  };
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
}

/* Chip de marca. */
function brandChipHtml(brand) {
  return `<a class="brand-chip reveal" href="#/catalogo" data-brand="${escapeHtml(brand)}">${escapeHtml(brand)}</a>`;
}

/* Testimonio. */
function testimonialHtml(t) {
  const initials = t.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  return `
    <article class="testimonial reveal">
      ${starsHtml(t.rating)}
      <p class="quote">“${escapeHtml(t.quote)}”</p>
      <div class="who">
        <div class="avatar">${escapeHtml(initials)}</div>
        <div>
          <div class="name">${escapeHtml(t.name)}</div>
          <div class="role">${escapeHtml(t.role)}</div>
        </div>
      </div>
    </article>`;
}

/* CTA final. */
function ctaStripHtml() {
  return `
    <section class="section container">
      <div class="offer-band reveal" style="background:linear-gradient(135deg,var(--accent),var(--accent-ink));grid-template-columns:1fr auto">
        <div>
          <h2 style="color:#fff;margin-bottom:.5rem">¿Necesitas ayuda para elegir tu talla?</h2>
          <p style="color:rgba(255,255,255,.85)">Escríbenos por WhatsApp y te asesoramos personalmente.</p>
        </div>
        <a class="btn btn--lg" style="background:#fff;color:var(--accent-ink)" href="#/contacto">Contáctanos</a>
      </div>
    </section>`;
}
