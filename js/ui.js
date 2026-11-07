/**
 * ui.js
 * ----------------------------------------------------------------------------
 * Componentes de interfaz reutilizables: notificaciones toast, modal de
 * confirmación e indicadores de carga. Se construyen con DOM nativo y CSS,
 * sin librerías, para mantener el proyecto ligero y portable.
 * ----------------------------------------------------------------------------
 */

import { $ } from "./utils.js";

/* Asegura que existan los contenedores globales de toast y modal. */
function ensureToastContainer() {
  let container = $("#toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "toast-container";
    container.setAttribute("role", "status");
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

/* ---------------------------------------------------------------------------
 * Toast: notificación efímera.
 *  type -> "success" | "error" | "info"
 *  duration -> milisegundos (default 3200)
 * --------------------------------------------------------------------------- */
export function toast(message, type = "info", duration = 3200) {
  const container = ensureToastContainer();
  const el = document.createElement("div");
  el.className = `toast toast--${type}`;
  el.setAttribute("role", "alert");
  const icon = { success: "✓", error: "!", info: "i" }[type] || "i";
  el.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${icon}</span>
    <span class="toast__msg">${message}</span>
  `;
  container.appendChild(el);
  requestAnimationFrame(() => el.classList.add("toast--show"));
  const hide = () => {
    el.classList.remove("toast--show");
    el.addEventListener("transitionend", () => el.remove(), { once: true });
  };
  const timer = setTimeout(hide, duration);
  el.addEventListener("click", () => {
    clearTimeout(timer);
    hide();
  });
  return el;
}

/* ---------------------------------------------------------------------------
 * Modal de confirmación genérico. Devuelve una promesa que resuelve true si
 * el usuario confirma y false si cancela.
 * --------------------------------------------------------------------------- */
export function confirmModal({ title = "Confirmar", message = "", confirmText = "Confirmar", cancelText = "Cancelar", danger = false } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML = `
      <div class="modal" role="document">
        <h3 class="modal__title">${title}</h3>
        <p class="modal__msg">${message}</p>
        <div class="modal__actions">
          <button type="button" class="btn btn--ghost" data-cancel>${cancelText}</button>
          <button type="button" class="btn ${danger ? "btn--danger" : "btn--primary"}" data-confirm>${confirmText}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add("is-open"));

    const close = (value) => {
      overlay.classList.remove("is-open");
      overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
      resolve(value);
    };

    overlay.querySelector("[data-confirm]").addEventListener("click", () => close(true));
    overlay.querySelector("[data-cancel]").addEventListener("click", () => close(false));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close(false);
    });
    document.addEventListener("keydown", function onKey(e) {
      if (e.key === "Escape") {
        document.removeEventListener("keydown", onKey);
        close(false);
      }
    });
  });
}

/* ---------------------------------------------------------------------------
 * Indicador de carga. show() devuelve el elemento; hide() lo retira.
 * --------------------------------------------------------------------------- */
export function showLoader(target, label = "Cargando…") {
  const host = target || document.body;
  const loader = document.createElement("div");
  loader.className = host === document.body ? "loader-overlay" : "loader-inline";
  loader.innerHTML = `<span class="spinner" aria-hidden="true"></span><span class="loader__label">${label}</span>`;
  host.classList.add("is-loading");
  host.appendChild(loader);
  return loader;
}

export function hideLoader(loader) {
  if (!loader) return;
  loader.remove();
  document.body.classList.remove("is-loading");
}

/* ---------------------------------------------------------------------------
 * Pulsa el badge del carrito para dar feedback al agregar productos.
 * --------------------------------------------------------------------------- */
export function pulseCartBadge() {
  const badge = $("#cart-count");
  if (!badge) return;
  badge.classList.remove("cart-pulse");
  void badge.offsetWidth; // reinicia la animación
  badge.classList.add("cart-pulse");
}
