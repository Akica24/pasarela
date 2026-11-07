/**
 * utils.js
 * ----------------------------------------------------------------------------
 * Funciones de utilidad reutilizables en todo el sitio.
 * No dependen de ningún estado global, por lo que pueden importarse desde
 * cualquier módulo sin efectos secundarios.
 * ----------------------------------------------------------------------------
 */

import { CONFIG } from "./config.js";

/* Atajos para selección de elementos. */
export const $ = (selector, context = document) => context.querySelector(selector);
export const $$ = (selector, context = document) =>
  Array.from(context.querySelectorAll(selector));

/* ---------------------------------------------------------------------------
 * Formato de moneda según la configuración (es-CO por defecto).
 * --------------------------------------------------------------------------- */
export function formatCurrency(value) {
  const { locale, code, decimals } = CONFIG.currency;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/* ---------------------------------------------------------------------------
 * Escapa texto para insertarlo de forma segura en HTML.
 * --------------------------------------------------------------------------- */
export function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------------------
 * Debounce: retrasa la ejecución de fn hasta que dejen de llamarse ms ms.
 * Útil para el buscador en vivo.
 * --------------------------------------------------------------------------- */
export function debounce(fn, ms = 300) {
  let timer = null;
  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/* ---------------------------------------------------------------------------
 * Devuelve el valor de un parámetro del hash de la URL (#/producto/3 -> 3).
 * --------------------------------------------------------------------------- */
export function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, ""); // quita "#" y "/"
  return raw;
}

/* ---------------------------------------------------------------------------
 * Navegación basada en hash (SPA). Cambia la ruta sin recargar la página.
 * --------------------------------------------------------------------------- */
export function navigate(path) {
  if (window.location.hash !== `#/${path}`) {
    window.location.hash = `#/${path}`;
  } else {
    // Si ya estamos en la ruta, fuerza el render (p.ej. tras limpiar filtros).
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------------------------------------------------------------------------
 * Limita un número a un rango [min, max].
 * --------------------------------------------------------------------------- */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* ---------------------------------------------------------------------------
 * Genera un identificador único sencillo.
 * --------------------------------------------------------------------------- */
export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* ---------------------------------------------------------------------------
 * Calcula el porcentaje de descuento entre dos precios.
 * --------------------------------------------------------------------------- */
export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/* ---------------------------------------------------------------------------
 * Capitaliza la primera letra.
 * --------------------------------------------------------------------------- */
export const capitalize = (str = "") => str.charAt(0).toUpperCase() + str.slice(1);

/* ---------------------------------------------------------------------------
 * Validadores de formulario (reutilizables en checkout y contacto).
 * --------------------------------------------------------------------------- */

/* Email válido. */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

/* Teléfono válido: 7 a 13 dígitos, permite +, espacios y guiones. */
export function isPhone(value) {
  const digits = String(value).replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 13;
}

/* Texto con longitud mínima (sin contar espacios a los extremos). */
export function minLength(value, min) {
  return String(value).trim().length >= min;
}
