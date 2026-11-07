/**
 * contact.js
 * ----------------------------------------------------------------------------
 * Sección de contacto. Formulario (nombre, correo, teléfono, mensaje) con
 * validación. Como todavía no existe backend, al enviar se valida y se ofrece
 * una alternativa funcional: abrir WhatsApp con el mensaje listo.
 *
 * No se afirma que los datos se guarden en un servidor.
 * ----------------------------------------------------------------------------
 */

import { CONFIG, whatsappUrl } from "./config.js";
import { $, escapeHtml, isEmail, isPhone, minLength } from "./utils.js";
import { toast } from "./ui.js";

export function renderContact(_params, view) {
  const s = CONFIG.store;
  const social = CONFIG.social;

  view.innerHTML = `
    <div class="container section">
      <nav class="breadcrumb" aria-label="Ruta">
        <a href="#/">Inicio</a><span class="sep">/</span><span aria-current="page">Contacto</span>
      </nav>
      <div class="section-head center">
        <span class="eyebrow">Contacto</span>
        <h2>Hablemos</h2>
        <p>¿Tienes dudas sobre tallas, envíos o disponibilidad? Escríbenos y te responderemos pronto.</p>
      </div>

      <div class="contact-layout">
        <form id="contact-form" class="contact-card" novalidate>
          <div class="form-grid">
            <div class="field full">
              <label for="ct-name">Nombre <span class="req">*</span></label>
              <input class="input" id="ct-name" type="text" autocomplete="name" placeholder="Tu nombre" />
              <span class="field-error" id="ct-name-err"></span>
            </div>
            <div class="field">
              <label for="ct-email">Correo electrónico <span class="req">*</span></label>
              <input class="input" id="ct-email" type="email" autocomplete="email" placeholder="tu@correo.com" />
              <span class="field-error" id="ct-email-err"></span>
            </div>
            <div class="field">
              <label for="ct-phone">Teléfono <span class="req">*</span></label>
              <input class="input" id="ct-phone" type="tel" autocomplete="tel" placeholder="312 555 0142" />
              <span class="field-error" id="ct-phone-err"></span>
            </div>
            <div class="field full">
              <label for="ct-message">Mensaje <span class="req">*</span></label>
              <textarea class="input" id="ct-message" placeholder="¿En qué podemos ayudarte?"></textarea>
              <span class="field-error" id="ct-message-err"></span>
            </div>
          </div>
          <button type="submit" class="btn btn--accent btn--lg" style="margin-top:1rem">
            Enviar mensaje
          </button>
          <p class="muted" style="font-size:.8rem;margin-top:.75rem">Al enviar, abriremos WhatsApp con tu mensaje listo para que nos lo hagas llegar.</p>
        </form>

        <div class="contact-card contact-info">
          <div class="row">
            <span class="ico">📞</span>
            <div>
              <h4 style="margin-bottom:.2rem">Teléfono</h4>
              <a href="tel:${s.phone.replace(/\s/g, "")}">${escapeHtml(s.phone)}</a>
            </div>
          </div>
          <div class="row">
            <span class="ico">✉️</span>
            <div>
              <h4 style="margin-bottom:.2rem">Correo</h4>
              <a href="mailto:${s.email}">${escapeHtml(s.email)}</a>
            </div>
          </div>
          <div class="row">
            <span class="ico">📍</span>
            <div>
              <h4 style="margin-bottom:.2rem">Dirección</h4>
              <span>${escapeHtml(s.address)}</span><br><span class="muted">${escapeHtml(s.schedule)}</span>
            </div>
          </div>
          <div>
            <h4 style="margin-bottom:.5rem">Síguenos</h4>
            <div class="social-row">
              ${socialLink("instagram", social.instagram)}
              ${socialLink("facebook", social.facebook)}
              ${socialLink("tiktok", social.tiktok)}
              ${socialLink("x", social.x)}
            </div>
          </div>
          <a class="btn btn--whatsapp btn--block" id="contact-wa" href="${whatsappUrl()}" target="_blank" rel="noopener">
            <svg class="ico" viewBox="0 0 32 32" fill="currentColor"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.1 1.6 5.9L4 29l8.3-1.6c1.7.9 3.6 1.4 5.7 1.4 6.6 0 12-5.4 12-12S22.6 3 16 3z"/></svg>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;

  bindContactEvents();
}

function socialLink(name, href) {
  const icons = {
    instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',
    facebook: '<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v6h3v-6h2.5l.5-3H14V9z"/>',
    tiktok: '<path d="M14 4v8.5a3 3 0 1 1-2-2.8V7.2a6 6 0 1 0 4 5.7V8a5 5 0 0 0 3 1V6a8 8 0 0 1-5-2z"/>',
    x: '<path d="M4 4l7 8-7 8h2l6-7 5 7h4l-7-9 7-7h-2l-5 6-5-6z"/>',
  };
  return `<a href="${href}" target="_blank" rel="noopener" aria-label="${name}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg></a>`;
}

/* ---------------------------------------------------------------------------
 * Validación.
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

function validateContact() {
  let ok = true;
  if (!minLength($("#ct-name").value, 3)) ok = setField("ct-name", false, "Ingresa tu nombre.") && ok;
  else setField("ct-name", true);

  if (!isEmail($("#ct-email").value)) ok = setField("ct-email", false, "Ingresa un correo válido.") && ok;
  else setField("ct-email", true);

  if (!isPhone($("#ct-phone").value)) ok = setField("ct-phone", false, "Ingresa un teléfono válido (7 a 13 dígitos).") && ok;
  else setField("ct-phone", true);

  if (!minLength($("#ct-message").value, 10)) ok = setField("ct-message", false, "Escribe un mensaje con al menos 10 caracteres.") && ok;
  else setField("ct-message", true);

  return ok;
}

function bindContactEvents() {
  ["ct-name", "ct-email", "ct-phone", "ct-message"].forEach((id) => {
    $("#" + id).addEventListener("blur", () => {
      const el = $("#" + id);
      if (id === "ct-email") setField(id, isEmail(el.value), "Ingresa un correo válido.");
      else if (id === "ct-phone") setField(id, isPhone(el.value), "Ingresa un teléfono válido (7 a 13 dígitos).");
      else if (id === "ct-name") setField(id, el.value.trim().length >= 3, "Ingresa tu nombre.");
      else setField(id, el.value.trim().length >= 10, "Escribe un mensaje con al menos 10 caracteres.");
    });
  });

  $("#contact-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateContact()) {
      toast("Revisa los campos marcados antes de enviar.", "error");
      return;
    }
    const data = {
      name: $("#ct-name").value.trim(),
      email: $("#ct-email").value.trim(),
      phone: $("#ct-phone").value.trim(),
      message: $("#ct-message").value.trim(),
    };
    const lines = [
      `¡Hola ${CONFIG.store.name}! Quiero contactarlos.`,
      "",
      `• Nombre: ${data.name}`,
      `• Correo: ${data.email}`,
      `• Teléfono: ${data.phone}`,
      "",
      `Mensaje: ${data.message}`,
    ].join("\n");
    toast("Abriendo WhatsApp con tu mensaje…", "success");
    window.open(whatsappUrl(lines), "_blank", "noopener");
  });
}
