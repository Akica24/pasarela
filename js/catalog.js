/**
 * catalog.js
 * ----------------------------------------------------------------------------
 * Vista del catálogo con filtros funcionales por marca, talla, color,
 * categoría y precio; buscador en vivo; ordenamiento por precio, popularidad y
 * novedades; botón para limpiar filtros y paginación.
 *
 * El estado de filtros vive en este módulo; los productos se leen de
 * products.js. Sustituir el origen de datos por una API no afecta esta lógica
 * de presentación.
 * ----------------------------------------------------------------------------
 */

import { CONFIG } from "./config.js";
import {
  PRODUCTS,
  allBrands,
  allCategories,
  allSizes,
  allColors,
} from "./products.js";
import { productCard } from "./components.js";
import { $, escapeHtml, formatCurrency, debounce } from "./utils.js";

/* Rango global de precios del catálogo. */
const PRICE_BOUNDS = (() => {
  const prices = PRODUCTS.map((p) => p.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
})();

/* Estado de filtros. */
const state = {
  search: "",
  brands: new Set(),
  categories: new Set(),
  colors: new Set(),
  sizes: new Set(),
  priceMin: 0,
  priceMax: PRICE_BOUNDS.max,
  onlyDiscounted: false,
  sort: "popular",
  page: 1,
};

let viewEl = null;

/* ---------------------------------------------------------------------------
 * Render principal.
 * params[0] puede ser un slug de categoría o "ofertas" (preconfiguración).
 * --------------------------------------------------------------------------- */
export function renderCatalog(params = [], view) {
  viewEl = view;
  resetState();

  const preset = params[0];
  if (preset === "ofertas") {
    state.onlyDiscounted = true;
  } else if (preset === "marca" && params[1]) {
    state.brands.add(decodeURIComponent(params[1]));
  } else if (preset) {
    state.categories.add(preset);
  }

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span>
        <span aria-current="page">${state.onlyDiscounted ? "Ofertas" : "Catálogo"}</span>
      </nav>
      <div class="between" style="margin-bottom:1.25rem">
        <div>
          <h1>${state.onlyDiscounted ? "Ofertas" : "Catálogo"}</h1>
          <p class="muted">Filtra por marca, talla, color o precio para encontrar tu par.</p>
        </div>
      </div>

      <div class="catalog-bar">
        <div class="search-box">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4" stroke-linecap="round"/></svg>
          <input type="search" id="search-input" placeholder="Buscar zapato, marca o categoría…" aria-label="Buscar productos" />
        </div>
        <button class="btn btn--outline btn--sm filter-toggle" id="filter-toggle" aria-expanded="false">Filtros</button>
        <div class="select-wrap">
          <label for="sort-select" class="sr-only">Ordenar por</label>
          <select id="sort-select" aria-label="Ordenar por">
            <option value="popular">Más populares</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="new">Novedades</option>
          </select>
        </div>
      </div>

      <div class="catalog-layout">
        <aside class="filters" id="filters" aria-label="Filtros del catálogo">
          ${filtersHtml()}
        </aside>
        <section aria-label="Resultados">
          <div class="row-center" style="margin-bottom:1rem">
            <span class="result-count" id="result-count"></span>
            <button class="btn btn--ghost btn--sm" id="clear-filters" style="margin-left:auto">Limpiar filtros</button>
          </div>
          <div class="chips" id="active-chips"></div>
          <div class="product-grid" id="catalog-results"></div>
          <div class="pagination" id="pagination"></div>
        </section>
      </div>
    </div>
  `;

  bindEvents();
  applyPresetToInputs();
  renderResults();
}

/* ---------------------------------------------------------------------------
 * HTML de los filtros.
 * --------------------------------------------------------------------------- */
function filtersHtml() {
  const brands = allBrands();
  const cats = allCategories();
  const sizes = allSizes();
  const colors = allColors();

  return `
    <div class="filter-group">
      <h4>Marca</h4>
      ${brands
        .map(
          (b) => `<label class="check">
            <input type="checkbox" data-f="brand" value="${escapeHtml(b)}" ${state.brands.has(b) ? "checked" : ""} />
            <span>${escapeHtml(b)}</span><span class="count">${countByBrand(b)}</span>
          </label>`
        )
        .join("")}
    </div>

    <div class="filter-group">
      <h4>Categoría</h4>
      ${cats
        .map(
          (c) => `<label class="check">
            <input type="checkbox" data-f="cat" value="${c.slug}" ${state.categories.has(c.slug) ? "checked" : ""} />
            <span>${escapeHtml(c.name)}</span><span class="count">${countByCategory(c.slug)}</span>
          </label>`
        )
        .join("")}
    </div>

    <div class="filter-group">
      <h4>Talla</h4>
      <div class="size-pick">
        ${sizes
          .map(
            (s) => `<button class="size-opt" data-f="size" data-v="${s}" aria-pressed="${state.sizes.has(String(s))}">${s}</button>`
          )
          .join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>Color</h4>
      <div class="swatch-pick">
        ${colors
          .map(
            (c) => `<button class="swatch-opt" data-f="color" data-v="${escapeHtml(c.name)}" style="background:${c.hex}" aria-pressed="${state.colors.has(c.name)}" title="${escapeHtml(c.name)}" aria-label="${escapeHtml(c.name)}"></button>`
          )
          .join("")}
      </div>
    </div>

    <div class="filter-group">
      <h4>Precio</h4>
      <input type="range" class="price-range" id="price-range" min="${PRICE_BOUNDS.min}" max="${PRICE_BOUNDS.max}" step="10000" value="${state.priceMax}" aria-label="Precio máximo" />
      <div class="range-row"><span>Desde</span><span>Hasta</span></div>
      <div style="display:flex;gap:.5rem">
        <input type="number" class="input" id="price-min" value="${state.priceMin}" min="0" aria-label="Precio mínimo" />
        <input type="number" class="input" id="price-max" value="${state.priceMax}" min="0" aria-label="Precio máximo" />
      </div>
      <div class="range-row" id="price-readout"><span>${formatCurrency(state.priceMin)}</span><span>${formatCurrency(state.priceMax)}</span></div>
    </div>
  `;
}

/* ---------------------------------------------------------------------------
 * Lógica de filtrado y orden.
 * --------------------------------------------------------------------------- */
function matches(p) {
  if (state.brands.size && !state.brands.has(p.brand)) return false;
  if (state.categories.size && !state.categories.has(p.categorySlug)) return false;
  if (state.colors.size && !p.colors.some((c) => state.colors.has(c.name))) return false;
  if (state.sizes.size && !p.sizes.some((s) => state.sizes.has(String(s)))) return false;
  if (p.price < state.priceMin || p.price > state.priceMax) return false;
  if (state.onlyDiscounted && !p.oldPrice) return false;
  if (state.search) {
    const q = state.search.toLowerCase();
    const hay = `${p.name} ${p.brand} ${p.category} ${p.description}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function sortList(list) {
  const sorted = [...list];
  switch (state.sort) {
    case "price-asc": return sorted.sort((a, b) => a.price - b.price);
    case "price-desc": return sorted.sort((a, b) => b.price - a.price);
    case "new": return sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    default: return sorted.sort((a, b) => b.popularity - a.popularity);
  }
}

/* ---------------------------------------------------------------------------
 * Render de resultados, conteo, chips activos y paginación.
 * --------------------------------------------------------------------------- */
function renderResults() {
  const filtered = sortList(PRODUCTS.filter(matches));
  const perPage = CONFIG.catalog.productsPerPage;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  const results = $("#catalog-results");
  if (filtered.length === 0) {
    results.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="ico">🔍</div>
        <h3>No encontramos productos</h3>
        <p>Prueba ajustando o limpiando los filtros.</p>
      </div>`;
  } else {
    results.innerHTML = pageItems.map((p) => productCard(p, { reveal: false })).join("");
  }

  $("#result-count").textContent =
    filtered.length === 0
      ? "Sin resultados"
      : `${filtered.length} producto${filtered.length !== 1 ? "s" : ""}`;

  renderChips();
  renderPagination(pages);
}

function renderChips() {
  const chips = [];
  state.brands.forEach((v) => chips.push(chip("brand", v)));
  state.categories.forEach((v) => {
    const c = allCategories().find((x) => x.slug === v);
    chips.push(chip("cat", v, c ? c.name : v));
  });
  state.colors.forEach((v) => chips.push(chip("color", v)));
  state.sizes.forEach((v) => chips.push(chip("size", v, `Talla ${v}`)));
  if (state.priceMin > PRICE_BOUNDS.min || state.priceMax < PRICE_BOUNDS.max) {
    chips.push(chip("price", null, `${formatCurrency(state.priceMin)} – ${formatCurrency(state.priceMax)}`));
  }
  if (state.onlyDiscounted) chips.push(chip("discount", null, "Solo ofertas"));
  $("#active-chips").innerHTML = chips.join("");
}

function chip(field, value, label) {
  return `<span class="chip">${escapeHtml(label || value)}<button type="button" data-chip="${field}" data-v="${escapeHtml(value || "")}" aria-label="Quitar filtro ${escapeHtml(label || value)}">×</button></span>`;
}

function renderPagination(pages) {
  const el = $("#pagination");
  if (pages <= 1) { el.innerHTML = ""; return; }
  let html = `<button class="page-btn" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="Página anterior">‹</button>`;
  for (let i = 1; i <= pages; i++) {
    html += `<button class="page-btn" data-page="${i}" ${i === state.page ? 'aria-current="true"' : ""}>${i}</button>`;
  }
  html += `<button class="page-btn" data-page="${state.page + 1}" ${state.page === pages ? "disabled" : ""} aria-label="Página siguiente">›</button>`;
  el.innerHTML = html;
}

/* ---------------------------------------------------------------------------
 * Eventos.
 * --------------------------------------------------------------------------- */
function bindEvents() {
  // Búsqueda en vivo (con debounce).
  const onSearch = debounce((val) => {
    state.search = val.trim();
    state.page = 1;
    renderResults();
  }, 250);
  $("#search-input").addEventListener("input", (e) => onSearch(e.target.value));

  // Ordenamiento.
  $("#sort-select").addEventListener("change", (e) => {
    state.sort = e.target.value;
    state.page = 1;
    renderResults();
  });

  // Checkboxes de marca y categoría (delegado).
  $("#filters").addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.f === "brand") {
      t.checked ? state.brands.add(t.value) : state.brands.delete(t.value);
      state.page = 1; renderResults();
    } else if (t.dataset.f === "cat") {
      t.checked ? state.categories.add(t.value) : state.categories.delete(t.value);
      state.page = 1; renderResults();
    }
  });

  // Tallas y colores (delegado, tipo botón).
  $("#filters").addEventListener("click", (e) => {
    const t = e.target;
    if (t.dataset.f === "size") {
      const v = String(t.dataset.v);
      toggleSet(state.sizes, v, t);
      state.page = 1; renderResults();
    } else if (t.dataset.f === "color") {
      toggleSet(state.colors, t.dataset.v, t);
      state.page = 1; renderResults();
    }
  });

  // Precio: slider + inputs.
  $("#price-range").addEventListener("input", (e) => {
    state.priceMax = Number(e.target.value);
    $("#price-max").value = state.priceMax;
    syncPriceReadout();
    state.page = 1; renderResults();
  });
  $("#price-min").addEventListener("input", (e) => {
    const v = clampPrice(Number(e.target.value) || 0);
    state.priceMin = Math.min(v, state.priceMax);
    e.target.value = state.priceMin;
    syncPriceReadout();
    state.page = 1; renderResults();
  });
  $("#price-max").addEventListener("input", (e) => {
    const v = clampPrice(Number(e.target.value) || PRICE_BOUNDS.max);
    state.priceMax = Math.max(v, state.priceMin);
    e.target.value = state.priceMax;
    $("#price-range").value = state.priceMax;
    syncPriceReadout();
    state.page = 1; renderResults();
  });

  // Limpiar filtros.
  $("#clear-filters").addEventListener("click", clearFilters);

  // Chips (quitar uno).
  $("#active-chips").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    removeChip(btn.dataset.chip, btn.dataset.v);
    syncFilterInputs();
    renderResults();
  });

  // Paginación.
  $("#pagination").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-page]");
    if (!btn || btn.disabled) return;
    state.page = Number(btn.dataset.page);
    renderResults();
    viewEl.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // Toggle de filtros en móvil.
  $("#filter-toggle").addEventListener("click", () => {
    const f = $("#filters");
    const open = f.classList.toggle("open");
    $("#filter-toggle").setAttribute("aria-expanded", String(open));
  });
}

function toggleSet(set, value, el) {
  if (set.has(value)) { set.delete(value); el.setAttribute("aria-pressed", "false"); }
  else { set.add(value); el.setAttribute("aria-pressed", "true"); }
}

function syncPriceReadout() {
  const r = $("#price-readout");
  if (r) {
    r.children[0].textContent = formatCurrency(state.priceMin);
    r.children[1].textContent = formatCurrency(state.priceMax);
  }
}

function clampPrice(v) {
  return Math.max(PRICE_BOUNDS.min, Math.min(PRICE_BOUNDS.max, v));
}

function removeChip(field, value) {
  switch (field) {
    case "brand": state.brands.delete(value); break;
    case "cat": state.categories.delete(value); break;
    case "color": state.colors.delete(value); break;
    case "size": state.sizes.delete(value); break;
    case "price": state.priceMin = 0; state.priceMax = PRICE_BOUNDS.max; break;
    case "discount": state.onlyDiscounted = false; break;
  }
}

function syncFilterInputs() {
  // Sincroniza el estado de los inputs con los Sets tras quitar un chip.
  $("#filters").querySelectorAll('[data-f="brand"]').forEach((i) => (i.checked = state.brands.has(i.value)));
  $("#filters").querySelectorAll('[data-f="cat"]').forEach((i) => (i.checked = state.categories.has(i.value)));
  $("#filters").querySelectorAll('[data-f="size"]').forEach((b) => b.setAttribute("aria-pressed", state.sizes.has(String(b.dataset.v))));
  $("#filters").querySelectorAll('[data-f="color"]').forEach((b) => b.setAttribute("aria-pressed", state.colors.has(b.dataset.v)));
  $("#price-min").value = state.priceMin;
  $("#price-max").value = state.priceMax;
  $("#price-range").value = state.priceMax;
  syncPriceReadout();
}

function clearFilters() {
  resetState();
  // Refresca el HTML de los filtros para que los inputs reflejen el estado.
  $("#filters").innerHTML = filtersHtml();
  $("#search-input").value = "";
  $("#sort-select").value = state.sort;
  state.page = 1;
  renderResults();
}

/* ---------------------------------------------------------------------------
 * Aplica la preconfiguración (categoría/ofertas) a los inputs visibles.
 * --------------------------------------------------------------------------- */
function applyPresetToInputs() {
  if (state.onlyDiscounted) document.title = `Ofertas · ${CONFIG.store.name}`;
  // Marca checkboxes según el preset.
  $("#filters").querySelectorAll('[data-f="brand"]').forEach((i) => (i.checked = state.brands.has(i.value)));
  $("#filters").querySelectorAll('[data-f="cat"]').forEach((i) => (i.checked = state.categories.has(i.value)));
}

/* ---------------------------------------------------------------------------
 * Contadores por faceta (estáticos, sobre el catálogo completo).
 * --------------------------------------------------------------------------- */
function countByBrand(brand) {
  return PRODUCTS.filter((p) => p.brand === brand).length;
}
function countByCategory(slug) {
  return PRODUCTS.filter((p) => p.categorySlug === slug).length;
}

/* ---------------------------------------------------------------------------
 * Reinicia el estado de filtros a sus valores por defecto.
 * --------------------------------------------------------------------------- */
function resetState() {
  state.search = "";
  state.brands = new Set();
  state.categories = new Set();
  state.colors = new Set();
  state.sizes = new Set();
  state.priceMin = 0;
  state.priceMax = PRICE_BOUNDS.max;
  state.onlyDiscounted = false;
  state.sort = "popular";
  state.page = 1;
}
