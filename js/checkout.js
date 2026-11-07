/**
 * checkout.js
 * ----------------------------------------------------------------------------
 * Sección de checkout: registro de los datos del cliente para finalizar el
 * pedido. Valida todos los campos obligatorios y, al confirmar, construye
 * automáticamente el mensaje de WhatsApp con el detalle del pedido.
 *
 * IMPORTANTE: no se simula pago ni confirmación de compra. El botón abre
 * WhatsApp con el mensaje listo para que el cliente lo envíe.
 * ----------------------------------------------------------------------------
 */

import { CONFIG, whatsappUrl } from "./config.js";
import { LOCATIONS } from "./data.js";
import { Cart } from "./cart.js";
import { productThumb } from "./image.js";
import { $, escapeHtml, formatCurrency, isEmail, isPhone, minLength } from "./utils.js";
import { toast } from "./ui.js";

export function renderCheckout(_params, view) {
  const items = Cart.items();

  // Si no hay productos, invitamos a explorar el catálogo.
  if (items.length === 0) {
    view.innerHTML = `
      <div class="container section" style="text-align:center;padding:4rem 1rem">
        <div style="font-size:3rem">🧾</div>
        <h2 style="margin:1rem 0 .5rem">No hay productos para finalizar</h2>
        <p class="muted" style="margin-bottom:1.5rem">Agrega productos al carrito para poder realizar tu pedido.</p>
        <a href="#/catalogo" class="btn btn--accent btn--lg">Ir al catálogo</a>
      </div>`;
    return;
  }

  const subtotal = Cart.subtotal();
  const shipping = subtotal >= CONFIG.shipping.freeFrom ? 0 : CONFIG.shipping.baseCost;
  const total = subtotal + shipping;

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span>
        <a href="#/carrito">Carrito</a><span class="sep">/</span>
        <span aria-current="page">Finalizar pedido</span>
      </nav>
      <h1 style="margin-bottom:.4rem">Finaliza tu pedido</h1>
      <p class="muted" style="margin-bottom:1.75rem">Completa tus datos de entrega. Al confirmar, abriremos WhatsApp con tu pedido listo para enviar.</p>

      <div class="checkout-layout">
        <form id="checkout-form" novalidate>
          <div class="contact-card">
            <h3 style="margin-bottom:1rem">Datos de contacto</h3>
            <div class="form-grid">
              <div class="field full">
                <label for="ck-name">Nombre completo <span class="req">*</span></label>
                <input class="input" id="ck-name" type="text" autocomplete="name" placeholder="Ej. María Pérez" />
                <span class="field-error" id="ck-name-err"></span>
              </div>
              <div class="field">
                <label for="ck-phone">Teléfono <span class="req">*</span></label>
                <input class="input" id="ck-phone" type="tel" autocomplete="tel" placeholder="Ej. 312 555 0142" />
                <span class="field-error" id="ck-phone-err"></span>
              </div>
              <div class="field">
                <label for="ck-email">Correo electrónico <span class="req">*</span></label>
                <input class="input" id="ck-email" type="email" autocomplete="email" placeholder="tu@correo.com" />
                <span class="field-error" id="ck-email-err"></span>
              </div>
              <div class="field">
                <label for="ck-depto">Departamento <span class="req">*</span></label>
                <div class="select-wrap">
                  <select class="input" id="ck-depto"><option value="">Selecciona…</option></select>
                </div>
                <span class="field-error" id="ck-depto-err"></span>
              </div>
              <div class="field">
                <label for="ck-ciudad">Ciudad <span class="req">*</span></label>
                <div class="select-wrap">
                  <select class="input" id="ck-ciudad" disabled><option value="">Selecciona departamento…</option></select>
                </div>
                <span class="field-error" id="ck-ciudad-err"></span>
              </div>
              <div class="field">
                <label for="ck-barrio">Barrio <span class="req">*</span></label>
                <input class="input" id="ck-barrio" type="text" placeholder="Ej. Centro" />
                <span class="field-error" id="ck-barrio-err"></span>
              </div>
              <div class="field full">
                <label for="ck-address">Dirección de entrega <span class="req">*</span></label>
                <input class="input" id="ck-address" type="text" autocomplete="street-address" placeholder="Cra. 11 #93-77, Apto 302" />
                <span class="field-error" id="ck-address-err"></span>
              </div>
              <div class="field full">
                <label for="ck-info">Información adicional (opcional)</label>
                <textarea class="input" id="ck-info" placeholder="Indicaciones de entrega, referencias, horario, etc."></textarea>
              </div>
              <div class="field full">
                <label class="check-line" id="ck-consent-line">
                  <input type="checkbox" id="ck-consent" />
                  <span>Acepto el tratamiento de mis datos personales para procesar mi pedido, conforme a la política de privacidad de Zentry. <span class="req">*</span></span>
                </label>
                <span class="field-error" id="ck-consent-err"></span>
              </div>
            </div>
            <button type="submit" class="btn btn--whatsapp btn--block btn--lg" id="checkout-submit" style="margin-top:1rem">
              <svg class="ico" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>
              FINALIZAR PEDIDO POR WHATSAPP
            </button>
            <p class="muted" style="font-size:.8rem;margin-top:.75rem;text-align:center">No realizamos cobros en línea. El pago se acuerda al momento de la entrega del pedido.</p>
          </div>
        </form>

        <aside class="summary-card" aria-label="Resumen del pedido">
          <h3>Tu pedido</h3>
          <div class="mini-cart">
            ${items.map(miniItemHtml).join("")}
          </div>
          <div style="margin-top:1rem;display:flex;flex-direction:column;gap:.5rem">
            <div class="summary-row"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
            <div class="summary-row"><span>Envío</span><span>${shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span></div>
            <div class="summary-row total"><span>Total</span><span>${formatCurrency(total)}</span></div>
          </div>
          <a href="#/carrito" class="btn btn--ghost btn--block btn--sm" style="margin-top:1rem">Editar carrito</a>
        </aside>
      </div>
    </div>
  `;

  populateDepartments();
  bindCheckoutEvents();
}

function miniItemHtml(item) {
  return `
    <div class="mini-item">
      <div class="thumb"><img src="${item.thumb}" alt="${escapeHtml(item.name)}" /></div>
      <div class="meta">
        <b>${escapeHtml(item.name)}</b>
        <span>${escapeHtml(item.brand)} · Talla ${item.size} · ${escapeHtml(item.color)} · x${item.qty}</span>
      </div>
      <div style="font-weight:600">${formatCurrency(item.price * item.qty)}</div>
    </div>`;
}

/* ---------------------------------------------------------------------------
 * Llenado de selects dependientes (departamento -> ciudad).
 * --------------------------------------------------------------------------- */
function populateDepartments() {
  const sel = $("#ck-depto");
  Object.keys(LOCATIONS).forEach((d) => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d.replace(/_/g, " ");
    sel.appendChild(opt);
  });
}

function populateCities(depto) {
  const citySel = $("#ck-ciudad");
  citySel.innerHTML = '<option value="">Selecciona…</option>';
  const cities = LOCATIONS[depto] || [];
  cities.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    citySel.appendChild(opt);
  });
  citySel.disabled = cities.length === 0;
}

/* ---------------------------------------------------------------------------
 * Validación campo a campo.
 * --------------------------------------------------------------------------- */
function setField(id, ok, message) {
  const field = $("#" + id).closest(".field");
  const err = $("#" + id + "-err");
  if (field) {
    field.classList.toggle("invalid", !ok);
    field.classList.toggle("valid", ok && $("#" + id).value);
  }
  if (err) err.textContent = ok ? "" : message;
  return ok;
}

function validateCheckout() {
  let ok = true;
  if (!minLength($("#ck-name").value, 3)) ok = setField("ck-name", false, "Ingresa tu nombre completo.") && ok;
  else setField("ck-name", true);

  if (!isPhone($("#ck-phone").value)) ok = setField("ck-phone", false, "Ingresa un teléfono válido (7 a 13 dígitos).") && ok;
  else setField("ck-phone", true);

  if (!isEmail($("#ck-email").value)) ok = setField("ck-email", false, "Ingresa un correo electrónico válido.") && ok;
  else setField("ck-email", true);

  if (!$("#ck-depto").value) ok = setField("ck-depto", false, "Selecciona un departamento.") && ok;
  else setField("ck-depto", true);

  if (!$("#ck-ciudad").value) ok = setField("ck-ciudad", false, "Selecciona una ciudad.") && ok;
  else setField("ck-ciudad", true);

  if (!minLength($("#ck-barrio").value, 2)) ok = setField("ck-barrio", false, "Ingresa el barrio.") && ok;
  else setField("ck-barrio", true);

  if (!minLength($("#ck-address").value, 5)) ok = setField("ck-address", false, "Ingresa una dirección válida.") && ok;
  else setField("ck-address", true);

  const consent = $("#ck-consent");
  const cline = $("#ck-consent-line");
  const cerr = $("#ck-consent-err");
  if (!consent.checked) {
    cline.classList.add("invalid");
    cerr.textContent = "Debes aceptar el tratamiento de datos para continuar.";
    ok = false;
  } else {
    cline.classList.remove("invalid");
    cerr.textContent = "";
  }
  return ok;
}

/* ---------------------------------------------------------------------------
 * Construye el mensaje del pedido para WhatsApp.
 * --------------------------------------------------------------------------- */
function buildOrderMessage(data) {
  const items = Cart.items();
  const subtotal = Cart.subtotal();
  const shipping = subtotal >= CONFIG.shipping.freeFrom ? 0 : CONFIG.shipping.baseCost;
  const total = subtotal + shipping;

  const lines = [];
  lines.push(`¡Hola ${CONFIG.store.name}! Quiero finalizar mi pedido.`);
  lines.push("");
  lines.push("📋 *DATOS DEL CLIENTE*");
  lines.push(`• Nombre: ${data.name}`);
  lines.push(`• Teléfono: ${data.phone}`);
  lines.push(`• Correo: ${data.email}`);
  lines.push(`• Departamento: ${data.depto}`);
  lines.push(`• Ciudad: ${data.ciudad}`);
  lines.push(`• Barrio: ${data.barrio}`);
  lines.push(`• Dirección: ${data.address}`);
  if (data.info.trim()) lines.push(`• Información adicional: ${data.info.trim()}`);
  lines.push("");
  lines.push("🛒 *PRODUCTOS*");
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name} (${it.brand})`);
    lines.push(`   Talla: ${it.size} | Color: ${it.color}`);
    lines.push(`   Cantidad: ${it.qty} x ${formatCurrency(it.price)} = ${formatCurrency(it.price * it.qty)}`);
  });
  lines.push("");
  lines.push("💵 *RESUMEN*");
  lines.push(`• Subtotal: ${formatCurrency(subtotal)}`);
  lines.push(`• Envío: ${shipping === 0 ? "Gratis" : formatCurrency(shipping)}`);
  lines.push(`• TOTAL: ${formatCurrency(total)}`);
  lines.push("");
  lines.push("¡Quiero confirmar mi pedido! 🙌");
  return lines.join("\n");
}

/* ---------------------------------------------------------------------------
 * Eventos del formulario.
 * --------------------------------------------------------------------------- */
function bindCheckoutEvents() {
  $("#ck-depto").addEventListener("change", (e) => {
    populateCities(e.target.value);
    setField("ck-depto", !!e.target.value, "Selecciona un departamento.");
    // Limpiar error de ciudad al cambiar departamento.
    $("#ck-ciudad").value = "";
    setField("ck-ciudad", false, "");
  });
  $("#ck-ciudad").addEventListener("change", (e) => setField("ck-ciudad", !!e.target.value, "Selecciona una ciudad."));

  // Validación en vivo al salir del campo.
  ["ck-name", "ck-phone", "ck-email", "ck-barrio", "ck-address"].forEach((id) => {
    $("#" + id).addEventListener("blur", () => {
      const el = $("#" + id);
      if (id === "ck-phone") setField(id, isPhone(el.value), "Ingresa un teléfono válido (7 a 13 dígitos).");
      else if (id === "ck-email") setField(id, isEmail(el.value), "Ingresa un correo electrónico válido.");
      else setField(id, el.value.trim().length >= (id === "ck-name" ? 3 : id === "ck-address" ? 5 : 2), "Completa este campo.");
    });
  });

  $("#checkout-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateCheckout()) {
      toast("Revisa los campos marcados antes de continuar.", "error");
      $("#app-view").querySelector(".field.invalid input, .field.invalid select, .check-line.invalid input")?.focus();
      return;
    }
    const data = {
      name: $("#ck-name").value.trim(),
      phone: $("#ck-phone").value.trim(),
      email: $("#ck-email").value.trim(),
      depto: $("#ck-depto").selectedOptions[0].textContent,
      ciudad: $("#ck-ciudad").value,
      barrio: $("#ck-barrio").value.trim(),
      address: $("#ck-address").value.trim(),
      info: $("#ck-info").value,
    };
    const url = whatsappUrl(buildOrderMessage(data));
    toast("Abriendo WhatsApp con tu pedido…", "success");
    window.open(url, "_blank", "noopener");
  });
}
