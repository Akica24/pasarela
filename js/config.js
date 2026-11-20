/**
 * config.js
 * ----------------------------------------------------------------------------
 * ConfiguraciÃ³n central de la tienda.
 *
 * AquÃ­ se concentran TODOS los parÃ¡metros que pueden cambiar (nÃºmero de
 * WhatsApp, datos de la tienda, redes, moneda, envÃ­os). De esta forma, para
 * modificar el nÃºmero de WhatsApp o los datos de contacto basta con editar
 * este Ãºnico archivo y todo el sitio se actualiza.
 *
 * Estructurado como mÃ³dulo ES para facilitar que, en una fase posterior, estos
 * valores provengan de una API o un panel administrativo.
 * ----------------------------------------------------------------------------
 */

export const CONFIG = {
  /* ------------------------------------------------------------------------ */
  /* Identidad de la tienda                                                   */
  /* ------------------------------------------------------------------------ */
  store: {
    name: "Pasarela",
    tagline: "Calzado que cuenta tu historia",
    // Texto corto para el logo; se renderiza con tipografÃ­a de marca.
    logoText: "Pasarela",
    // Datos de contacto mostrados en el footer y la secciÃ³n de contacto.
    phone: "+57 312 555 0142",
    email: "hola@pasarela.co",
    address: "Cra. 11 #93-77, BogotÃ¡, Colombia",
    schedule: "Lun a SÃ¡b Â· 9:00 am â€“ 7:00 pm",
  },

  /* ------------------------------------------------------------------------ */
  /* IntegraciÃ³n con WhatsApp                                                 */
  /* ------------------------------------------------------------------------ */
  /* CAMBIA SOLO ESTE NÃšMERO para actualizar toda la tienda.                  */
  /* Formato internacional SIN "+" ni espacios ni guiones:                    */
  /*   cÃ³digo de paÃ­s + nÃºmero. Ejemplo Colombia: 57 + 3125550142            */
  whatsapp: {
    number: "573125550142",
    // Mensaje por defecto del botÃ³n flotante y consultas individuales.
    defaultMessage: "Â¡Hola Pasarela! Quisiera hacer una consulta sobre sus productos.",
  },

  /* ------------------------------------------------------------------------ */
  /* Redes sociales                                                            */
  /* ------------------------------------------------------------------------ */
  social: {
    instagram: "https://instagram.com/pasarela",
    facebook: "https://facebook.com/pasarela",
    tiktok: "https://tiktok.com/@pasarela",
    x: "https://x.com/pasarela",
    youtube: "https://youtube.com/@pasarela",
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
  /* EnvÃ­os                                                                    */
  /* ------------------------------------------------------------------------ */
  shipping: {
    baseCost: 9000,
    freeFrom: 250000, // envÃ­o gratis a partir de este subtotal
  },

  /* ------------------------------------------------------------------------ */
  /* CatÃ¡logo                                                                  */
  /* ------------------------------------------------------------------------ */
  catalog: {
    productsPerPage: 9, // productos por pÃ¡gina en el catÃ¡logo
  },

  /* ------------------------------------------------------------------------ */
  /* Banderas de funcionalidades (preparadas para futuras fases)              */
  /* ------------------------------------------------------------------------ */
  features: {
    // En esta fase todo se resuelve en el frontend. Estas banderas estÃ¡n listas
    // para activarse cuando exista backend, autenticaciÃ³n e IA.
    backendEnabled: true,
    authEnabled: false,
    aiEnabled: false,
  },

  /* ------------------------------------------------------------------------ */
  /* API Backend                                                               */
  /* ------------------------------------------------------------------------ */
  api: {
    baseUrl: "http://localhost:3000",
  },
};

/* ---------------------------------------------------------------------------
 * Devuelve la URL de WhatsApp con el texto codificado.
 * Ãštil para mensajes genÃ©ricos (botÃ³n flotante, contacto).
 * ---------------------------------------------------------------------------
 */
export function whatsappUrl(message = CONFIG.whatsapp.defaultMessage) {
  const number = CONFIG.whatsapp.number;
  const text = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${text}`;
}
