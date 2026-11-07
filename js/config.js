/**
 * config.js
 * ----------------------------------------------------------------------------
 * Configuración central de la tienda.
 *
 * Aquí se concentran TODOS los parámetros que pueden cambiar (número de
 * WhatsApp, datos de la tienda, redes, moneda, envíos). De esta forma, para
 * modificar el número de WhatsApp o los datos de contacto basta con editar
 * este único archivo y todo el sitio se actualiza.
 *
 * Estructurado como módulo ES para facilitar que, en una fase posterior, estos
 * valores provengan de una API o un panel administrativo.
 * ----------------------------------------------------------------------------
 */

export const CONFIG = {
  /* ------------------------------------------------------------------------ */
  /* Identidad de la tienda                                                   */
  /* ------------------------------------------------------------------------ */
  store: {
    name: "Zentry",
    tagline: "Calzado que cuenta tu historia",
    // Texto corto para el logo; se renderiza con tipografía de marca.
    logoText: "Zentry",
    // Datos de contacto mostrados en el footer y la sección de contacto.
    phone: "+57 312 555 0142",
    email: "hola@zentry.co",
    address: "Cra. 11 #93-77, Bogotá, Colombia",
    schedule: "Lun a Sáb · 9:00 am – 7:00 pm",
  },

  /* ------------------------------------------------------------------------ */
  /* Integración con WhatsApp                                                 */
  /* ------------------------------------------------------------------------ */
  /* CAMBIA SOLO ESTE NÚMERO para actualizar toda la tienda.                  */
  /* Formato internacional SIN "+" ni espacios ni guiones:                    */
  /*   código de país + número. Ejemplo Colombia: 57 + 3125550142            */
  whatsapp: {
    number: "573125550142",
    // Mensaje por defecto del botón flotante y consultas individuales.
    defaultMessage: "¡Hola Zentry! Quisiera hacer una consulta sobre sus productos.",
  },

  /* ------------------------------------------------------------------------ */
  /* Redes sociales                                                            */
  /* ------------------------------------------------------------------------ */
  social: {
    instagram: "https://instagram.com/zentry",
    facebook: "https://facebook.com/zentry",
    tiktok: "https://tiktok.com/@zentry",
    x: "https://x.com/zentry",
    youtube: "https://youtube.com/@zentry",
  },

  /* ------------------------------------------------------------------------ */
  /* Moneda y formato de precios                                              */
  /* ------------------------------------------------------------------------ */
  currency: {
    code: "COP",
    symbol: "$",
    locale: "es-CO",
    // COP no suele usar decimales; cambia a 2 para USD/EUR.
    decimals: 0,
  },

  /* ------------------------------------------------------------------------ */
  /* Envíos                                                                    */
  /* ------------------------------------------------------------------------ */
  shipping: {
    baseCost: 9000,
    freeFrom: 250000, // envío gratis a partir de este subtotal
  },

  /* ------------------------------------------------------------------------ */
  /* Catálogo                                                                  */
  /* ------------------------------------------------------------------------ */
  catalog: {
    productsPerPage: 9, // productos por página en el catálogo
  },

  /* ------------------------------------------------------------------------ */
  /* Banderas de funcionalidades (preparadas para futuras fases)              */
  /* ------------------------------------------------------------------------ */
  features: {
    // En esta fase todo se resuelve en el frontend. Estas banderas están listas
    // para activarse cuando exista backend, autenticación e IA.
    backendEnabled: false,
    authEnabled: false,
    aiEnabled: false,
  },
};

/* ---------------------------------------------------------------------------
 * Devuelve la URL de WhatsApp con el texto codificado.
 * Útil para mensajes genéricos (botón flotante, contacto).
 * ---------------------------------------------------------------------------
 */
export function whatsappUrl(message = CONFIG.whatsapp.defaultMessage) {
  const number = CONFIG.whatsapp.number;
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
