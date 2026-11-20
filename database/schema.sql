-- ============================================================================
-- schema.sql
-- ----------------------------------------------------------------------------
-- Esquema de la base de datos `tienda_zapatos` para la tienda virtual Pasarela.
--
-- Motor: MySQL 8.0+ (requiere soporte de CHECK constraints nativas).
-- Juego de caracteres: utf8mb4 (soporte completo de Unicode/emojis).
--
-- Tablas:
--   USUARIOS            -> administradores del sistema (login del panel)
--   CLIENTES            -> datos de quienes realizan pedidos (sin cuenta)
--   MARCAS              -> marcas de calzado (Nike, Adidas, ...)
--   CATEGORIAS          -> categorías (Deportivos, Urbanos, ...)
--   PRODUCTOS           -> catálogo de calzado
--   TALLAS              -> tallas numéricas disponibles
--   COLORES             -> colores con código hexadecimal
--   PRODUCTO_VARIANTES  -> combinaciones producto + talla + color + stock
--   PEDIDOS             -> cabecera de los pedidos
--   DETALLE_PEDIDOS     -> líneas de cada pedido
--   CONTACTOS           -> mensajes del formulario de contacto
--
-- Relaciones (claves foráneas):
--   PRODUCTOS.marca_id       -> MARCAS.id
--   PRODUCTOS.categoria_id   -> CATEGORIAS.id
--   PRODUCTO_VARIANTES.producto_id -> PRODUCTOS.id  (CASCADE al borrar)
--   PRODUCTO_VARIANTES.talla_id     -> TALLAS.id
--   PRODUCTO_VARIANTES.color_id     -> COLORES.id
--   PEDIDOS.cliente_id       -> CLIENTES.id
--   DETALLE_PEDIDOS.pedido_id  -> PEDIDOS.id       (CASCADE al borrar)
--   DETALLE_PEDIDOS.variante_id -> PRODUCTO_VARIANTES.id
-- ============================================================================

-- Crear la base de datos (ejecutar como usuario con privilegios)
CREATE DATABASE IF NOT EXISTS tienda_zapatos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tienda_zapatos;

-- ============================================================================
-- USUARIOS (administradores)
-- ----------------------------------------------------------------------------
-- Almacena los administradores que gestionan productos, inventario y
-- pedidos. La contraseña se guarda con hash scrypt (node:crypto), nunca en
-- texto plano. El campo `rol` permite controlar permisos.
-- ============================================================================
CREATE TABLE IF NOT EXISTS USUARIOS (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(100)  NOT NULL,
  correo          VARCHAR(150)  NOT NULL UNIQUE,
  telefono        VARCHAR(20)   DEFAULT NULL,
  password        VARCHAR(255)  NOT NULL COMMENT 'Hash scrypt (sal + derivado en formato sal:derivado)',
  rol             ENUM('admin', 'editor') NOT NULL DEFAULT 'admin',
  fecha_creacion  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_correo (correo)
) ENGINE=InnoDB;

-- ============================================================================
-- CLIENTES
-- ----------------------------------------------------------------------------
-- Datos de contacto y entrega de quienes realizan pedidos. No necesitan
-- crear una cuenta: sus datos se registran al finalizar el pedido.
-- ============================================================================
CREATE TABLE IF NOT EXISTS CLIENTES (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(150) NOT NULL,
  telefono        VARCHAR(20)  NOT NULL,
  correo          VARCHAR(150) NOT NULL,
  departamento    VARCHAR(80)  NOT NULL,
  ciudad          VARCHAR(80)  NOT NULL,
  barrio          VARCHAR(100) NOT NULL,
  direccion       VARCHAR(200) NOT NULL,
  fecha_registro  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_correo (correo),
  INDEX idx_telefono (telefono)
) ENGINE=InnoDB;

-- ============================================================================
-- MARCAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS MARCAS (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80)  NOT NULL UNIQUE,
  descripcion TEXT,
  estado      BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================================================
-- CATEGORIAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS CATEGORIAS (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(80)  NOT NULL UNIQUE,
  descripcion TEXT,
  estado      BOOLEAN      NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ============================================================================
-- PRODUCTOS
-- ----------------------------------------------------------------------------
-- El campo `popularidad` (extra al enunciado) permite el orden "Más
-- populares" del catálogo. `imagen` guarda una ruta o URL; si es NULL se
-- genera la ilustración SVG desde el frontend.
-- ============================================================================
CREATE TABLE IF NOT EXISTS PRODUCTOS (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(150)  NOT NULL,
  descripcion     TEXT,
  precio          DECIMAL(12,2) NOT NULL,
  precio_anterior DECIMAL(12,2) DEFAULT NULL,
  marca_id        INT           NOT NULL,
  categoria_id    INT           NOT NULL,
  imagen          VARCHAR(255)  DEFAULT NULL,
  estado          BOOLEAN       NOT NULL DEFAULT TRUE COMMENT 'TRUE = activo, FALSE = desactivado',
  destacado       BOOLEAN       NOT NULL DEFAULT FALSE,
  popularidad     INT           NOT NULL DEFAULT 50,
  fecha_creacion  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (marca_id) REFERENCES MARCAS(id),
  FOREIGN KEY (categoria_id) REFERENCES CATEGORIAS(id),
  INDEX idx_nombre (nombre),
  INDEX idx_marca (marca_id),
  INDEX idx_categoria (categoria_id),
  INDEX idx_destacado (destacado),
  INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================================================
-- TALLAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS TALLAS (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  numero_talla INT NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ============================================================================
-- COLORES
-- ============================================================================
CREATE TABLE IF NOT EXISTS COLORES (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(50) NOT NULL UNIQUE,
  codigo_hex VARCHAR(7)  NOT NULL
) ENGINE=InnoDB;

-- ============================================================================
-- PRODUCTO_VARIANTES
-- ----------------------------------------------------------------------------
-- Cada variante es la combinación única de producto + talla + color, con su
-- propio stock. La restricción CHECK impide stock negativo. La clave única
-- evita duplicar la misma combinación.
-- ============================================================================
CREATE TABLE IF NOT EXISTS PRODUCTO_VARIANTES (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  talla_id   INT NOT NULL,
  color_id   INT NOT NULL,
  stock      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (producto_id) REFERENCES PRODUCTOS(id) ON DELETE CASCADE,
  FOREIGN KEY (talla_id) REFERENCES TALLAS(id),
  FOREIGN KEY (color_id) REFERENCES COLORES(id),
  UNIQUE KEY uk_variante (producto_id, talla_id, color_id),
  INDEX idx_producto (producto_id),
  INDEX idx_talla (talla_id),
  INDEX idx_color (color_id),
  CONSTRAINT chk_stock_no_negativo CHECK (stock >= 0)
) ENGINE=InnoDB;

-- ============================================================================
-- PEDIDOS
-- ----------------------------------------------------------------------------
-- estados: pendiente | confirmado | en_preparacion | enviado | entregado | cancelado
-- ============================================================================
CREATE TABLE IF NOT EXISTS PEDIDOS (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id    INT           NOT NULL,
  numero_pedido VARCHAR(20)   NOT NULL UNIQUE,
  subtotal      DECIMAL(12,2) NOT NULL,
  total         DECIMAL(12,2) NOT NULL,
  estado        ENUM('pendiente','confirmado','en_preparacion','enviado','entregado','cancelado')
                NOT NULL DEFAULT 'pendiente',
  fecha_pedido  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES CLIENTES(id),
  INDEX idx_cliente (cliente_id),
  INDEX idx_estado (estado),
  INDEX idx_numero (numero_pedido),
  INDEX idx_fecha (fecha_pedido)
) ENGINE=InnoDB;

-- ============================================================================
-- DETALLE_PEDIDOS
-- ----------------------------------------------------------------------------
-- Se guarda el nombre del producto, talla y color como texto además del
-- variante_id, de modo que el histórico del pedido se mantenga legible
-- aunque el producto o la variante cambien o se eliminen.
-- ============================================================================
CREATE TABLE IF NOT EXISTS DETALLE_PEDIDOS (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id      INT           NOT NULL,
  variante_id    INT           NOT NULL,
  nombre_producto VARCHAR(150) NOT NULL,
  talla          INT           NOT NULL,
  color          VARCHAR(50)   NOT NULL,
  cantidad       INT           NOT NULL,
  precio_unitario DECIMAL(12,2) NOT NULL,
  subtotal       DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES PEDIDOS(id) ON DELETE CASCADE,
  FOREIGN KEY (variante_id) REFERENCES PRODUCTO_VARIANTES(id),
  INDEX idx_pedido (pedido_id),
  CONSTRAINT chk_cantidad_positiva CHECK (cantidad > 0)
) ENGINE=InnoDB;

-- ============================================================================
-- CONTACTOS
-- ----------------------------------------------------------------------------
-- Mensajes enviados desde el formulario de contacto de la tienda.
-- ============================================================================
CREATE TABLE IF NOT EXISTS CONTACTOS (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  correo      VARCHAR(150) NOT NULL,
  telefono    VARCHAR(20)  NOT NULL,
  mensaje     TEXT         NOT NULL,
  fecha_envio TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_fecha (fecha_envio)
) ENGINE=InnoDB;
