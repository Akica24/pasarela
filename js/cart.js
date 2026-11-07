/**
 * cart.js
 * ----------------------------------------------------------------------------
 * Lógica del carrito de compras y su vista.
 *
 * El carrito se persiste en LocalStorage (vía storage.js) para sobrevivir
 * recargas y cierre del navegador. Los productos se identifican de forma
 * única por producto + talla + color, de modo que volver a agregar el mismo
 * par aumenta la cantidad en lugar de duplicar la línea.
 *
 * Cualquier cambio emite el evento `cart:change` (window) para que el badge y
 * otras vistas se actualicen automáticamente.
 * ----------------------------------------------------------------------------
 */

import { Storage } from "./storage.js";
import { $, formatCurrency, escapeHtml, navigate } from "./utils.js";
import { productThumb } from "./image.js";
import { CONFIG } from "./config.js";
import { toast, confirmModal } from "./ui.js";

/* ---------------------------------------------------------------------------
 * Clave compuesta para distinguir líneas (producto + talla + color).
 * --------------------------------------------------------------------------- */
export function lineKey(productId, size, color) {
  return `${productId}::${size}::${color}`;
}

/* ---------------------------------------------------------------------------
 * Lectura / escritura del carrito.
 * --------------------------------------------------------------------------- */
export const Cart = {
  items() {
    return Storage.getCart();
  },

  /* Agrega un producto al carrito (fusiona si ya existe la misma línea). */
  add(product, { size, color, colorHex, qty = 1 }) {
    if (!size || !color) return false;
    const items = Storage.getCart();
    const key = lineKey(product.id, size, color);
    const existing = items.find((it) => it.key === key);
    if (existing) {
      existing.qty = Math.min(existing.qty + qty, existing.stock || 99);
    } else {
      items.push({
        key,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        thumb: productThumb(product),
        size,
        color,
        colorHex,
        qty,
        stock: product.stock || 99,
      });
    }
    Storage.saveCart(items);
    emitChange();
    return true;
  },

  removeItem(key) {
    const items = Storage.getCart().filter((it) => it.key !== key);
    Storage.saveCart(items);
    emitChange();
  },

  setQty(key, qty) {
    const items = Storage.getCart();
    const item = items.find((it) => it.key === key);
    if (!item) return;
    item.qty = Math.max(1, Math.min(qty, item.stock || 99));
    Storage.saveCart(items);
    emitChange();
  },

  clear() {
    Storage.clearCart();
    emitChange();
  },

  count() {
    return Storage.getCart().reduce((n, it) => n + it.qty, 0);
  },

  subtotal() {
    return Storage.getCart().reduce((sum, it) => sum + it.price * it.qty, 0);
  },

  isEmpty() {
    return Storage.getCart().length === 0;
  },
};

function emitChange() {
  window.dispatchEvent(new CustomEvent("cart:change"));
}

/* ---------------------------------------------------------------------------
 * Actualiza el badge del carrito en el header.
 * --------------------------------------------------------------------------- */
export function updateCartBadge() {
  const badge = $("#cart-count");
  if (!badge) return;
  const count = Cart.count();
  badge.textContent = count;
  badge.classList.toggle("is-empty", count === 0);
}

/* ---------------------------------------------------------------------------
 * Vista del carrito.
 * --------------------------------------------------------------------------- */
let currentView = null;

export function renderCart(_params, view) {
  currentView = view;
  drawCart();
}

function drawCart() {
  const view = currentView;
  if (!view) return;
  const items = Cart.items();

  if (items.length === 0) {
    view.innerHTML = `
      <div class="container section">
        <div class="cart-empty">
          <div class="ico" style="font-size:3rem">🛒</div>
          <h2 style="margin:1rem 0 .5rem">Tu carrito está vacío</h2>
          <p class="muted" style="margin-bottom:1.5rem">Aún no has agregado productos. ¡Explora el catálogo y encuentra tu par!</p>
          <a href="#/catalogo" class="btn btn--accent btn--lg">Explorar catálogo</a>
        </div>
      </div>`;
    return;
  }

  const subtotal = Cart.subtotal();
  const freeFrom = CONFIG.shipping.freeFrom;
  const remaining = freeFrom - subtotal;
  const shipping = remaining > 0 ? CONFIG.shipping.baseCost : 0;
  const total = subtotal + shipping;

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span><span aria-current="page">Carrito</span>
      </nav>
      <div class="between" style="margin-bottom:1.5rem">
        <h1>Tu carrito</h1>
        <button class="btn btn--ghost btn--sm" id="clear-cart">Vaciar carrito</button>
      </div>

      <div class="cart-layout">
        <div class="cart-items" id="cart-items">
          ${items.map(cartRowHtml).join("")}
        </div>

        <aside class="cart-summary" aria-label="Resumen del pedido">
          <h3>Resumen</h3>
          <div class="summary-row"><span>Subtotal (${Cart.count()} items)</span><span>${formatCurrency(subtotal)}</span></div>
          <div class="summary-row"><span>Envío</span><span>${shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span></div>
          ${remaining > 0 ? `<p class="muted" style="font-size:.82rem">Te faltan <strong>${formatCurrency(remaining)}</strong> para envío gratis.</p>` : ""}
          <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
          <a href="#/checkout" class="btn btn--accent btn--block btn--lg">Ir a finalizar pedido</a>
          <a href="#/catalogo" class="btn btn--outline btn--block">Seguir comprando</a>
        </aside>
      </div>
    </div>`;

  bindCartEvents();
}

function cartRowHtml(item) {
  return `
    <article class="cart-row" data-key="${escapeHtml(item.key)}">
      <div class="cart-thumb"><img src="${item.thumb}" alt="${escapeHtml(item.name)}" loading="lazy" /></div>
      <div class="cart-info">
        <div class="cart-brand" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);font-weight:700">${escapeHtml(item.brand)}</div>
        <a href="#/producto/${encodeURIComponent(item.productId)}" class="name">${escapeHtml(item.name)}</a>
        <div class="opts">
          <span>Talla: <strong>${item.size}</strong></span>
          <span>Color:
            <span style="display:inline-flex;align-items:center;gap:.3rem">
              <span style="width:12px;height:12px;border-radius:50%;border:1px solid var(--line);background:${item.colorHex}"></span>${escapeHtml(item.color)}
            </span>
          </span>
        </div>
        <div class="unit">${formatCurrency(item.price)} c/u</div>
      </div>
      <div class="cart-aside">
        <div class="qty" role="group" aria-label="Cantidad de ${escapeHtml(item.name)}">
          <button data-act="dec" aria-label="Disminuir">−</button>
          <input type="text" inputmode="numeric" value="${item.qty}" aria-label="Cantidad" data-qty readonly />
          <button data-act="inc" aria-label="Aumentar">+</button>
        </div>
        <div class="line-total">${formatCurrency(item.price * item.qty)}</div>
        <button class="remove" data-act="remove">Eliminar</button>
      </div>
    </article>`;
}

/* ---------------------------------------------------------------------------
 * Eventos de la vista del carrito (cantidad, eliminar, vaciar).
 * --------------------------------------------------------------------------- */
function bindCartEvents() {
  const list = $("#cart-items");
  if (!list) return;

  list.addEventListener("click", async (e) => {
    const row = e.target.closest(".cart-row");
    if (!row) return;
    const key = row.dataset.key;
    const act = e.target.dataset.act;
    if (!act) return;

    if (act === "inc" || act === "dec") {
      const item = Cart.items().find((it) => it.key === key);
      if (!item) return;
      const next = act === "inc" ? item.qty + 1 : item.qty - 1;
      if (next < 1) {
        await removeWithConfirm(key, row);
      } else {
        Cart.setQty(key, next);
      }
    } else if (act === "remove") {
      await removeWithConfirm(key, row);
    }
  });

  $("#clear-cart")?.addEventListener("click", async () => {
    const ok = await confirmModal({
      title: "Vaciar carrito",
      message: "¿Seguro que deseas eliminar todos los productos del carrito?",
      confirmText: "Sí, vaciar",
      cancelText: "Cancelar",
      danger: true,
    });
    if (ok) {
      Cart.clear();
      toast("El carrito quedó vacío.", "info");
    }
  });
}

async function removeWithConfirm(key, row) {
  const item = Cart.items().find((it) => it.key === key);
  const ok = await confirmModal({
    title: "Eliminar producto",
    message: `¿Quitar "${item ? item.name : "este producto"}" del carrito?`,
    confirmText: "Eliminar",
    cancelText: "Cancelar",
    danger: true,
  });
  if (ok) {
    Cart.removeItem(key);
    toast("Producto eliminado del carrito.", "info");
  }
}

/* Re-renderiza la vista del carrito si está activa, ante cualquier cambio. */
window.addEventListener("cart:change", () => {
  if (currentView && location.hash.replace(/^#\/?/, "") === "carrito") drawCart();
});
