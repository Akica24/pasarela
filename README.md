# Pasarela · Tienda virtual de calzado (Frontend)

Proyecto final de la **Ruta Avanzada**: frontend completo, profesional y
responsive de una tienda de zapatos. Funciona como aplicación de página única
(SPA) con HTML5, CSS3 y JavaScript vanilla (módulos ES), sin frameworks ni
servidor backend. Los pedidos se finalizan por **WhatsApp** y el carrito se
persiste en **LocalStorage**. Listo para desplegar en **GitHub Pages**.

> Esta es la **fase 1 (solo frontend)**. No incluye backend, base de datos,
> autenticación real ni IA; la arquitectura quedó preparada para integrarlos
> después.

---

## Características implementadas

- **Página de inicio**: encabezado con logo y menú, banner principal con CTA,
  categorías, productos destacados, banda de ofertas con cuenta regresiva,
  marcas, testimonios y footer con contacto y redes.
- **Catálogo dinámico** con datos de demostración en JS y:
  - Filtros por **marca, talla, color, categoría y precio**.
  - **Buscador** en vivo, **ordenamiento** (popularidad, precio asc/desc, novedades),
    **limpiar filtros**, chips de filtros activos y **paginación**.
- **Detalle de producto**: galería de imágenes, selectores de **talla** y
  **color** (obligatorios), selector de **cantidad**, disponibilidad, botón
  **Agregar al carrito** y botón **Consultar por WhatsApp**. No permite agregar
  sin talla y color.
- **Carrito**: agregar, eliminar (con confirmación), modificar cantidades,
  mostrar tallas y colores, subtotales, total y conteo. **Sin duplicar** líneas
  idénticas (fusiona cantidad). Persiste en **LocalStorage**.
- **Checkout**: formulario de datos del cliente con validaciones (obligatorios,
  teléfono, correo, aceptación de tratamiento de datos) y botón
  **FINALIZAR PEDIDO POR WHATSAPP** que arma el mensaje del pedido.
- **Contacto**: formulario validado con alternativa por WhatsApp, datos de
  contacto, redes sociales y **botón flotante de WhatsApp**.
- **UX**: diseño responsive (móvil, tablet, escritorio), animaciones suaves,
  estados de carga, toasts, modales de confirmación, indicador al agregar al
  carrito, accesibilidad básica (roles, aria, foco visible).
- **Arquitectura modular**: responsabilidades separadas, utilidades
  reutilizables y origen de datos aislado para sustituirlo por una API.

---

## Tecnologías

- HTML5 semántico
- CSS3 (variables, grid, flexbox, animaciones) — sin frameworks de estilos
- JavaScript (módulos ES `import/export`)
- LocalStorage para el carrito
- Integración con WhatsApp mediante `https://wa.me/` y `encodeURIComponent()`
- Tipografías de Google Fonts (Fraunces + Inter)
- Opcional: Node + jsdom para pruebas de humo (`npm run check`, `npm run test:smoke`)

---

## Estructura del proyecto

```
tienda-zapatos/
├── index.html              # Shell de la SPA (header, #app-view, footer)
├── README.md
├── package.json            # Solo tooling de desarrollo (opcional)
├── assets/
│   └── icons/favicon.svg
├── css/
│   ├── styles.css          # Sistema de diseño y componentes
│   ├── animations.css      # Keyframes y reveal
│   └── responsive.css       # Breakpoints
└── js/
    ├── config.js           # Configuración central (WhatsApp, tienda, moneda…)
    ├── data.js             # Categorías, marcas, testimonios, ubicaciones
    ├── products.js         # Catálogo de demostración + helpers
    ├── image.js            # Generador de imágenes SVG de producto
    ├── utils.js            # Utilidades (formato moneda, escape, validadores…)
    ├── storage.js          # Capa de LocalStorage (lista para reemplazar por API)
    ├── ui.js               # Toasts, modal de confirmación, loaders
    ├── components.js       # Tarjeta de producto reutilizable
    ├── main.js             # Punto de entrada + router SPA (hash) + layout
    ├── home.js             # Página de inicio
    ├── catalog.js          # Catálogo con filtros/búsqueda/orden
    ├── product-details.js  # Detalle del producto
    ├── cart.js             # Estado del carrito + vista
    ├── checkout.js         # Checkout + mensaje de WhatsApp
    ├── contact.js          # Contacto + WhatsApp
    └── pages.js            # Marcas y Nosotros
```

---

## Cómo ejecutar el proyecto en local

Como se usan **módulos ES**, abrir `index.html` directamente con `file://` no
funciona (los navegadores bloquean los módulos desde `file://`). Hay que servir
los archivos por **HTTP**. Cualquiera de estas opciones sirve:

**Opción A — Python (incluido en la mayoría de sistemas):**
```bash
python -m http.server 8000
```

**Opción B — Node (serve):**
```bash
npx --yes serve -l 8000 .
```

Luego abre `http://localhost:8000` en el navegador.

> La app no requiere `npm install` para funcionar: todo el frontend es estático.
> Las dependencias de Node son **solo para las pruebas opcionales**.

---

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio en GitHub y sube el proyecto:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USUARIO/pasarela.git
   git push -u origin main
   ```
2. En el repositorio, ve a **Settings → Pages**.
3. En **Source** elige la rama `main` y la carpeta `/ (root)`. Guarda.
4. En unos minutos tu sitio estará en:
   `https://USUARIO.github.io/pasarela/`

No hay build: los archivos del repositorio se publican tal cual.

**Archivos importantes para GitHub Pages:**
- `.nojekyll` — Desactiva Jekyll para que no ignore archivos con `_`
- `404.html` — Maneja rutas de la SPA correctamente

---

## Cómo cambiar el número de WhatsApp

Edita **un único archivo**: `js/config.js`.

```js
whatsapp: {
  // Formato internacional SIN "+", espacios ni guiones: país + número
  number: "573125550142",
  defaultMessage: "¡Hola Pasarela! Quisiera hacer una consulta.",
},
```

Ese número se usa en el botón flotante, las consultas de producto, el checkout y
el contacto. **Cambiándolo allí se actualiza toda la tienda.**

---

## Cómo agregar un zapato al catálogo

Agrega un objeto al arreglo `PRODUCTS` en `js/products.js`. Cada producto:

```js
{
  id: "marca-modelo-01",          // identificador único (usado en la URL)
  name: "Nombre del modelo",
  model: "Nombre del modelo",
  brand: "Nike",
  category: "Deportivos",
  categorySlug: "deportivos",     // deportivos|urbanos|casuales|formales|botas|sandalias|tacones
  price: 429000,                  // precio actual (COP por defecto)
  oldPrice: 499000,               // null si no tiene descuento
  description: "Descripción del zapato.",
  colors: [                        // al menos un color {name, hex}
    { name: "Negro", hex: "#1b1b1f" },
  ],
  sizes: [38, 39, 40, 41, 42],     // tallas disponibles
  stock: 24,                       // 0 = agotado
  featured: true,                   // aparece en destacados de la home
  popularity: 96,                   // para orden "Más populares"
  dateAdded: "2026-10-20",          // para orden "Novedades" (YYYY-MM-DD)
},
```

Las imágenes se generan automáticamente a partir del color del producto (ver
`js/image.js`). Cuando exista backend, basta con añadir un campo `images` con
URLs reales y usarlas en lugar del generador.

---

## Otras configuraciones (todas en `js/config.js`)

- **Datos de la tienda**: `store.name`, `tagline`, `phone`, `email`, `address`.
- **Redes sociales**: `social`.
- **Moneda**: `currency` (código, símbolo, locale, decimales).
- **Envíos**: `shipping.baseCost` y `shipping.freeFrom` (envío gratis desde).
- **Catálogo**: `catalog.productsPerPage`.

---

## Arquitectura y preparación para el backend

El proyecto separa datos, lógica y presentación:

- **`products.js` / `data.js`** son el único origen de datos. Para conectar un
  backend se sustituyen por peticiones `fetch` a la API sin tocar las vistas.
- **`storage.js`** aísla LocalStorage; se puede reemplazar por llamadas a la API
  para el carrito sin cambiar el resto.
- **`config.js`** centraliza todo lo configurable.
- El router por hash de `main.js` permite añadir rutas nuevas fácilmente.

No se inventaron endpoints ni se simularon conexiones reales, conforme a los
requisitos de esta fase.

---

## Pruebas opcionales (requieren Node)

```bash
npm install            # instala jsdom (dev)
npm run check          # verifica la sintaxis de todos los JS
npm run test:smoke     # carga la SPA en jsdom y prueba el flujo completo
```

La prueba de humo verifica: render de la home, catálogo con filtros, detalle,
carrito (persistencia y no duplicación), validación del checkout y generación
del mensaje de WhatsApp con todos los campos requeridos.

---

## Sobre las imágenes de producto

En esta fase no se incluyen fotografías reales; se generan **ilustraciones SVG**
limpias y coherentes a partir del color de cada producto (ver `js/image.js`).
Así se garantiza que el catálogo siempre se vea bien en GitHub Pages sin
depender de servicios externos. Para usar fotos reales, añade un campo
`images: [url]` a cada producto y úsalas en los componentes.

---

## Pendientes para la siguiente fase

- Backend y base de datos (productos, inventario, pedidos, usuarios).
- Registro e inicio de sesión de clientes.
- Autenticación de administrador y panel administrativo.
- Gestión de productos, tallas, colores, inventario y pedidos.
- Pasarela de pago real (en lugar de solo WhatsApp).
- Inteligencia artificial personalizada para la tienda.
- Reemplazo de las ilustraciones SVG por fotografías reales.

---

## Licencia

Proyecto educativo de la Ruta Avanzada. Tipografías: Google Fonts (Fraunces,
Inter). Las marcas mencionadas en los datos de demostración son solo
referencias para el prototipo.
