/**
 * components.js
 * ----------------------------------------------------------------------------
 * Componentes de presentación reutilizables. Centralizar la tarjeta de
 * producto evita duplicar maquetado entre la home, el catálogo y los
 * productos relacionados.
 * ----------------------------------------------------------------------------
 */

import { PRODUCTS } from "./products.js";
import { productThumb } from "./image.js";
import { formatCurrency, escapeHtml, discountPercent } from "./utils.js";

/* ---------------------------------------------------------------------------
 * Conjunto de los 4 productos más recientes (para la insignia "Nuevo").
 * Determinista: se calcula una sola vez al cargar el módulo.
 * --------------------------------------------------------------------------- */
const NEWEST_IDS = new Set(
  [...PRODUCTS]
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 4)
    .map((p) => p.id)
);

export function isNew(product) {
  return NEWEST_IDS.has(product.id);
}

/* ---------------------------------------------------------------------------
 * Insignias de la tarjeta (descuento, destacado, novedad, agotado).
 * --------------------------------------------------------------------------- */
function badgeHtml(product) {
  const badges = [];
  if (product.stock <= 0) {
    badges.push('<span class="tag tag--out">Agotado</span>');
  } else {
    const off = discountPercent(product.price, product.oldPrice);
    if (off > 0) badges.push(`<span class="tag tag--sale">-${off}%</span>`);
    if (product.featured) badges.push('<span class="tag tag--feat">Destacado</span>');
    if (isNew(product)) badges.push('<span class="tag tag--new">Nuevo</span>');
  }
  return `<div class="card-badges">${badges.join("")}</div>`;
}

/* ---------------------------------------------------------------------------
 * Tarjeta de producto.
 * opts.reveal -> añade la clase de animación de entrada.
 * --------------------------------------------------------------------------- */
export function productCard(product, { reveal = true } = {}) {
  const out = product.stock <= 0;
  const id = encodeURIComponent(product.id);
  const swatches = product.colors
    .slice(0, 4)
    .map(
      (c) =>
        `<span class="swatch-mini" style="background:${c.hex}" title="${escapeHtml(c.name)}"></span>`
    )
    .join("");

  return `
    <article class="card ${reveal ? "reveal" : ""}">
      <a href="#/producto/${id}" class="card-media" aria-label="Ver ${escapeHtml(product.name)}">
        <img src="${productThumb(product)}" alt="${escapeHtml(product.brand + " " + product.name)}" loading="lazy" />
        ${badgeHtml(product)}
      </a>
      <div class="card-body">
        <span class="card-brand">${escapeHtml(product.brand)}</span>
        <h3 class="card-title"><a href="#/producto/${id}">${escapeHtml(product.name)}</a></h3>
        <div class="card-meta">
          <div>
            <span class="card-price ${product.oldPrice ? "card-price--sale" : ""}">${formatCurrency(product.price)}</span>
            ${product.oldPrice ? `<span class="card-old">${formatCurrency(product.oldPrice)}</span>` : ""}
          </div>
        </div>
        <div class="between" style="align-items:center">
          <div class="swatches" aria-hidden="true">${swatches}</div>
        </div>
        <div class="card-foot">
          <a href="#/producto/${id}" class="btn ${out ? "btn--outline" : "btn--accent"} btn--block btn--sm" ${out ? 'aria-disabled="true"' : ""}>
            ${out ? "No disponible" : "Ver producto"}
          </a>
        </div>
      </div>
    </article>`;
}

/* ---------------------------------------------------------------------------
 * Estrellas de valoración.
 * --------------------------------------------------------------------------- */
export function starsHtml(rating, max = 5) {
  let s = "";
  for (let i = 1; i <= max; i++) {
    s += i <= rating ? "★" : "☆";
  }
  return `<span class="stars" aria-label="${rating} de ${max}">${s}</span>`;
}
