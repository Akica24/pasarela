/**
 * product-details.js
 * ----------------------------------------------------------------------------
 * Vista de detalle de producto: galería de imágenes, selectores de talla y
 * color (obligatorios), selector de cantidad, disponibilidad, agregar al
 * carrito y consulta directa por WhatsApp.
 *
 * No se permite agregar al carrito sin talla ni color seleccionados.
 * ----------------------------------------------------------------------------
 */

import { CONFIG, whatsappUrl } from "./config.js";
import { PRODUCTS, findProduct } from "./products.js";
import { productImage, productGallery } from "./image.js";
import { Cart } from "./cart.js";
import { productCard } from "./components.js";
import { $, escapeHtml, formatCurrency, discountPercent, navigate } from "./utils.js";
import { toast, pulseCartBadge } from "./ui.js";

/* Estado local de la vista. */
const sel = { color: null, colorHex: null, size: null, qty: 1 };

export function renderProductDetails(params = [], view) {
  const id = decodeURIComponent(params[0] || "");
  const product = findProduct(id);

  if (!product) {
    view.innerHTML = `
      <div class="container section" style="text-align:center;padding:5rem 1rem">
        <div style="font-size:3rem">😕</div>
        <h2 style="margin:1rem 0 .5rem">Producto no encontrado</h2>
        <p class="muted" style="margin-bottom:1.5rem">El producto que buscas no existe o fue retirado.</p>
        <a href="#/catalogo" class="btn btn--accent">Volver al catálogo</a>
      </div>`;
    return;
  }

  // Reinicia selección por cada visita.
  sel.color = null; sel.colorHex = null; sel.size = null; sel.qty = 1;

  const off = discountPercent(product.price, product.oldPrice);
  const related = PRODUCTS.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span>
        <a href="#/catalogo">Catálogo</a><span class="sep">/</span>
        <a href="#/catalogo/${product.categorySlug}">${escapeHtml(product.category)}</a><span class="sep">/</span>
        <span aria-current="page">${escapeHtml(product.name)}</span>
      </nav>

      <div class="detail">
        <div class="gallery" id="gallery">
          <div class="gallery-main"><img id="gallery-main-img" src="${productImage(product, 0)}" alt="${escapeHtml(product.name)}" /></div>
          <div class="gallery-thumbs" id="gallery-thumbs"></div>
        </div>

        <div class="detail-info">
          <span class="detail-brand">${escapeHtml(product.brand)}</span>
          <h1 class="detail-title">${escapeHtml(product.name)}</h1>
          <div class="detail-rating"><span style="color:var(--accent-2)">★★★★★</span> 4.8 · ${product.popularity} reseñas</div>

          <div class="detail-price">
            <span class="now ${product.oldPrice ? "sale" : ""}">${formatCurrency(product.price)}</span>
            ${product.oldPrice ? `<span class="old">${formatCurrency(product.oldPrice)}</span>` : ""}
            ${off > 0 ? `<span class="detail-save">-${off}%</span>` : ""}
          </div>

          <p class="detail-desc">${escapeHtml(product.description)}</p>

          <div class="stock-note">
            ${stockNoteHtml(product)}
          </div>

          <div class="option-block">
            <div class="lbl"><span>Color <span class="required">*</span></span><span class="muted" id="color-chosen" style="font-weight:500"></span></div>
            <div class="swatch-pick" id="color-pick" role="group" aria-label="Selecciona un color">
              ${product.colors.map((c) => `<button class="swatch-opt" data-color="${escapeHtml(c.name)}" data-hex="${c.hex}" style="background:${c.hex}" aria-pressed="false" aria-label="${escapeHtml(c.name)}" title="${escapeHtml(c.name)}"></button>`).join("")}
            </div>
            <span class="option-error" id="color-error" role="alert"></span>
          </div>

          <div class="option-block">
            <div class="lbl"><span>Talla <span class="required">*</span></span><a href="#/contacto" class="muted" style="font-size:.82rem;text-decoration:underline">Guía de tallas</a></div>
            <div class="size-pick" id="size-pick" role="group" aria-label="Selecciona una talla">
              ${product.sizes.map((s) => `<button class="size-opt" data-size="${s}" aria-pressed="false">${s}</button>`).join("")}
            </div>
            <span class="option-error" id="size-error" role="alert"></span>
          </div>

          <div class="option-block">
            <div class="lbl"><span>Cantidad</span><span class="muted" id="qty-readout" style="font-weight:500">1 unidad</span></div>
            <div class="qty" id="qty-control" role="group" aria-label="Cantidad">
              <button data-qty="dec" aria-label="Disminuir cantidad">−</button>
              <input type="text" inputmode="numeric" id="qty-input" value="1" aria-label="Cantidad" readonly />
              <button data-qty="inc" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn btn--accent btn--lg" id="add-to-cart">
              <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 6h15l-1.5 9h-12z" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 6L5 3H2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/></svg>
              Agregar al carrito
            </button>
            <a class="btn btn--whatsapp btn--lg" id="ask-whatsapp" href="#" target="_blank" rel="noopener">
              <svg class="ico" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>
              Consultar por WhatsApp
            </a>
          </div>

          <dl class="detail-meta">
            <dt>Marca</dt><dd>${escapeHtml(product.brand)}</dd>
            <dt>Categoría</dt><dd>${escapeHtml(product.category)}</dd>
            <dt>Tallas</dt><dd>${product.sizes.join(", ")}</dd>
            <dt>Colores</dt><dd>${product.colors.map((c) => escapeHtml(c.name)).join(", ")}</dd>
          </dl>
        </div>
      </div>

      <section class="section--tight" style="margin-top:3rem">
        <h2 style="margin-bottom:1.25rem">También te puede gustar</h2>
        <div class="relate-grid">${related.map((p) => productCard(p)).join("")}</div>
      </section>
    </div>
  `;

  renderGalleryThumbs(product);
  bindDetailEvents(product);
}

/* ---------------------------------------------------------------------------
 * Galería: thumbnails (4 vistas). Al cambiar de color, se regeneran las
 * imágenes con el color seleccionado para una mejor representación.
 * --------------------------------------------------------------------------- */
function renderGalleryThumbs(product) {
  const hex = sel.colorHex || product.colors[0].hex;
  const thumbs = $("#gallery-thumbs");
  thumbs.innerHTML = [0, 1, 2, 3]
    .map((i) => `<button class="thumb" data-view="${i}" aria-current="${i === 0}" aria-label="Vista ${i + 1}"><img src="${productImage(product, i, hex)}" alt="" /></button>`)
    .join("");
  $("#gallery-main-img").src = productImage(product, 0, hex);
}

function stockNoteHtml(product) {
  if (product.stock <= 0) return `<span class="stock-out">● Agotado por ahora</span>`;
  if (product.stock <= 5) return `<span class="stock-low">● ¡Solo ${product.stock} unidades disponibles!</span>`;
  return `<span class="stock-ok">● Disponible · ${product.stock} en stock</span>`;
}

/* ---------------------------------------------------------------------------
 * Eventos de la vista.
 * --------------------------------------------------------------------------- */
function bindDetailEvents(product) {
  // Selección de color.
  $("#color-pick").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-color]");
    if (!btn) return;
    $("#color-pick").querySelectorAll(".swatch-opt").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    sel.color = btn.dataset.color;
    sel.colorHex = btn.dataset.hex;
    $("#color-chosen").textContent = sel.color;
    $("#color-error").textContent = "";
    // Regenera la galería con el color elegido.
    renderGalleryThumbs(product);
    refreshWhatsApp(product);
  });

  // Selección de talla.
  $("#size-pick").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-size]");
    if (!btn) return;
    $("#size-pick").querySelectorAll(".size-opt").forEach((b) => b.setAttribute("aria-pressed", "false"));
    btn.setAttribute("aria-pressed", "true");
    sel.size = btn.dataset.size;
    $("#size-error").textContent = "";
    refreshWhatsApp(product);
  });

  // Cantidad.
  $("#qty-control").addEventListener("click", (e) => {
    const act = e.target.dataset.qty;
    if (!act) return;
    const max = Math.max(1, product.stock || 1);
    if (act === "inc") sel.qty = Math.min(sel.qty + 1, max);
    if (act === "dec") sel.qty = Math.max(1, sel.qty - 1);
    $("#qty-input").value = sel.qty;
    $("#qty-readout").textContent = `${sel.qty} unidad${sel.qty !== 1 ? "es" : ""}`;
  });

  // Galería: cambiar imagen principal.
  $("#gallery-thumbs").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-view]");
    if (!btn) return;
    $("#gallery-thumbs").querySelectorAll(".thumb").forEach((t) => t.setAttribute("aria-current", "false"));
    btn.setAttribute("aria-current", "true");
    const hex = sel.colorHex || product.colors[0].hex;
    $("#gallery-main-img").src = productImage(product, Number(btn.dataset.view), hex);
  });

  // Agregar al carrito.
  $("#add-to-cart").addEventListener("click", () => addToCart(product));

  // WhatsApp inicial.
  refreshWhatsApp(product);
}

/* ---------------------------------------------------------------------------
 * Validación y agregado al carrito.
 * --------------------------------------------------------------------------- */
function addToCart(product) {
  let valid = true;
  if (!sel.size) {
    $("#size-error").textContent = "Selecciona una talla para continuar.";
    valid = false;
  }
  if (!sel.color) {
    $("#color-error").textContent = "Selecciona un color para continuar.";
    valid = false;
  }
  if (!valid) {
    toast("Selecciona talla y color antes de agregar.", "error");
    return;
  }
  if (product.stock <= 0) {
    toast("Este producto está agotado.", "error");
    return;
  }
  Cart.add(product, { size: sel.size, color: sel.color, colorHex: sel.colorHex, qty: sel.qty });
  toast(`${product.name} agregado al carrito.`, "success");
  pulseCartBadge();
}

/* ---------------------------------------------------------------------------
 * Construye el mensaje de WhatsApp para consultar por el producto (con los
 * datos seleccionados si ya fueron elegidos) y actualiza el enlace del botón.
 * --------------------------------------------------------------------------- */
function refreshWhatsApp(product) {
  const lines = [
    `¡Hola ${CONFIG.store.name}! Quisiera consultar por el siguiente producto:`,
    `• ${product.name} (${product.brand})`,
    `• Precio: ${formatCurrency(product.price)}`,
  ];
  if (sel.size) lines.push(`• Talla: ${sel.size}`);
  if (sel.color) lines.push(`• Color: ${sel.color}`);
  if (sel.qty > 1) lines.push(`• Cantidad: ${sel.qty}`);
  lines.push("¿Me confirman disponibilidad y envío? ¡Gracias!");
  const link = $("#ask-whatsapp");
  if (link) link.href = whatsappUrl(lines.join("\n"));
}
