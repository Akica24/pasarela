/**
 * storage.js
 * ----------------------------------------------------------------------------
 * Capa de acceso a LocalStorage.
 *
 * Aísla toda la persistencia del navegador en un único módulo. De este modo,
 * cuando exista un backend, bastará con reemplazar estas funciones por
 * llamadas a la API (fetch) sin tocar el resto del código.
 *
 * El carrito se guarda en LocalStorage para sobrevivir recargas y cierre del
 * navegador, tal como se exige en los requisitos.
 * ----------------------------------------------------------------------------
 */

const KEYS = {
  cart: "pasarela_cart",
  wishlist: "pasarela_wishlist",
  ui: "pasarela_ui",
};

/* ---------------------------------------------------------------------------
 * Lee y parsea de forma segura un valor JSON de LocalStorage.
 * --------------------------------------------------------------------------- */
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] No se pudo leer "${key}":`, err);
    return fallback;
  }
}

/* ---------------------------------------------------------------------------
 * Guarda un valor como JSON en LocalStorage.
 * --------------------------------------------------------------------------- */
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.warn(`[storage] No se pudo escribir "${key}":`, err);
    return false;
  }
}

/* ---------------------------------------------------------------------------
 * API pública del módulo.
 * --------------------------------------------------------------------------- */
export const Storage = {
  /* ----------------------------- Carrito ---------------------------------- */
  getCart() {
    return read(KEYS.cart, []);
  },
  saveCart(items) {
    return write(KEYS.cart, items);
  },
  clearCart() {
    localStorage.removeItem(KEYS.cart);
  },

  /* ---------------------------- Wishlist ---------------------------------- */
  getWishlist() {
    return read(KEYS.wishlist, []);
  },
  saveWishlist(ids) {
    return write(KEYS.wishlist, ids);
  },

  /* ------------------------- Preferencias UI ------------------------------ */
  getUI(key, fallback = null) {
    const ui = read(KEYS.ui, {});
    return key in ui ? ui[key] : fallback;
  },
  setUI(key, value) {
    const ui = read(KEYS.ui, {});
    ui[key] = value;
    return write(KEYS.ui, ui);
  },
};
