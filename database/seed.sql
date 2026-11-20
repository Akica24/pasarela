-- ============================================================================
-- seed.sql
-- ----------------------------------------------------------------------------
-- Datos iniciales de la base de datos `tienda_zapatos`.
--
-- Contiene:
--   • Marcas, categorías, tallas y colores de referencia.
--   • Los 16 productos del catálogo demo del frontend (con sus variantes).
--
-- Los IDs de referencia (para usar en las FK de PRODUCTOS y variantes):
--   MARCAS:      1=NNike 2=Adidas 3=Puma 4=New Balance 5=Vans 6=Converse
--                7=Reebok 8=Clarks 9=Timberland 10=Caterpillar
--                11=Steve Madden 12=Birkenstock 13=Havaianas
--   CATEGORIAS:  1=Deportivos 2=Urbanos 3=Casuales 4=Formales
--                5=Botas 6=Tacones 7=Sandalias
--   TALLAS:      id = numero_talla - 34  (35→1, 36→2, ..., 44→10)
--   COLORES:     1=Negro 2=Azul marino 3=Rojo 4=Blanco 5=Gris 6=Verde
--                7=Naranja 8=Beige 9=Café 10=Burdeos 11=Azul
--
-- Ejecutar DESPUÉS de schema.sql.
-- ============================================================================

USE tienda_zapatos;

-- ============================================================================
-- MARCAS
-- ============================================================================
INSERT INTO MARCAS (nombre, descripcion, estado) VALUES
('Nike',          'Marca global de calzado deportivo y urbano.', TRUE),
('Adidas',        'Marca alemana de calzado deportivo y lifestyle.', TRUE),
('Puma',          'Marca de calzado deportivo y urbano.', TRUE),
('New Balance',   'Calzado deportivo y urbano de confort premium.', TRUE),
('Vans',          'Calzado skate y casual con estilo propio.', TRUE),
('Converse',      'Calzado casual icónico de lona.', TRUE),
('Reebok',        'Calzado deportivo y fitness.', TRUE),
('Clarks',        'Calzado formal y casual de cuero.', TRUE),
('Timberland',    'Botas resistentes de cuero e impermeables.', TRUE),
('Caterpillar',   'Botas de trabajo robustas y seguras.', TRUE),
('Steve Madden',  'Calzado femenino de tendencia y tacos.', TRUE),
('Birkenstock',   'Sandalias ergonómicas de alta calidad.', TRUE),
('Havaianas',     'Sandalias de goma ligeras y resistentes.', TRUE);

-- ============================================================================
-- CATEGORIAS
-- ============================================================================
INSERT INTO CATEGORIAS (nombre, descripcion, estado) VALUES
('Deportivos', 'Rendimiento y comodidad para correr y entrenar.', TRUE),
('Urbanos',    'Estilo cotidiano con actitud deportiva.', TRUE),
('Casuales',   'Versátiles que combinan con todo tu outfit.', TRUE),
('Formales',   'Elegancia para la oficina y ocasiones especiales.', TRUE),
('Botas',     'Resistentes y duraderas para toda ocasión.', TRUE),
('Tacones',    'Diseños que realzan tu estilo.', TRUE),
('Sandalias',  'Ligereza y frescura para el calor.', TRUE);

-- ============================================================================
-- TALLAS
-- ============================================================================
INSERT INTO TALLAS (numero_talla) VALUES
(35),(36),(37),(38),(39),(40),(41),(42),(43),(44);

-- ============================================================================
-- COLORES
-- ============================================================================
INSERT INTO COLORES (nombre, codigo_hex) VALUES
('Negro',       '#1b1b1f'),
('Azul marino', '#1f2a44'),
('Rojo',        '#c0392b'),
('Blanco',      '#f4f1ec'),
('Gris',        '#6b6b73'),
('Verde',       '#2f7d5b'),
('Naranja',     '#d35400'),
('Beige',       '#cdbb9a'),
('Café',        '#6e3c1e'),
('Burdeos',     '#7a1f2b'),
('Azul',        '#1f4e8c');

-- ============================================================================
-- PRODUCTOS
-- ----------------------------------------------------------------------------
-- precio_anterior: NULL cuando no hay descuento.
-- destacado: TRUE/FALSE según el catálogo demo.
-- popularidad: valor usado por el orden "Más populares" del frontend.
-- fecha_creacion: coincide con dateAdded del catálogo demo.
-- ============================================================================
INSERT INTO PRODUCTOS
  (id, nombre, descripcion, precio, precio_anterior, marca_id, categoria_id, imagen, estado, destacado, popularidad, fecha_creacion)
VALUES
  (1,  'Air Stride Pro',         'Tenis de running con amortiguación responsiva y malla transpirable. Diseñados para entrenamientos de media y larga distancia con un ajuste envolvente.', 429000.00, 499000.00, 1,  1, NULL, TRUE, TRUE,  96, '2026-10-20 10:00:00'),
  (2,  'RunFlux 3.0',            'Zapatillas ligeras con suela de espuma RETURN que devuelve energía en cada paso. Capellada de tejido reciclado de alta durabilidad.', 389000.00, NULL, 2,  1, NULL, TRUE, TRUE,  88, '2026-10-12 10:00:00'),
  (3,  'Fastlane Street',       'Tenis urbanos de perfil bajo con suela de goma resistente. Ideales para uso diario con un toque deportivo y versátil.', 319000.00, 359000.00, 3,  2, NULL, TRUE, FALSE, 74, '2026-09-30 10:00:00'),
  (4,  '990 Heritage',           'Modelo icónico de la línea 990 con combinación de gamuza y malla. Confort premium y estética atemporal para el día a día.', 649000.00, NULL, 4,  2, NULL, TRUE, TRUE,  92, '2026-10-25 10:00:00'),
  (5,  'Old Skool Classic',      'El clásico skate con la franja lateral característica. Suela vulcanizada y construcción duradera, perfecto para el estilo casual.', 259000.00, 299000.00, 5,  3, NULL, TRUE, FALSE, 81, '2026-09-18 10:00:00'),
  (6,  'Chuck Taylor All Star',  'El icónico zapato de lona de caña alta. Ligero, transpirable y atemporal, combina con cualquier look casual.', 229000.00, NULL, 6,  3, NULL, TRUE, TRUE,  85, '2026-10-05 10:00:00'),
  (7,  'Desert Oxford',          'Zapato formal en gamuza con construcción cosida Goodyear. Elegante, cómodo y apto para oficina y ocasiones formales.', 419000.00, 469000.00, 8,  4, NULL, TRUE, FALSE, 70, '2026-09-22 10:00:00'),
  (8,  'Trego Brogue',           'Oxford con perforaciones brogue y suela de cuero pulido. Un básico de vestir para el caballero moderno.', 459000.00, NULL, 8,  4, NULL, TRUE, TRUE,  78, '2026-10-28 10:00:00'),
  (9,  '6-Inch Premium',         'Bota impermeable de cuero nubuck con cordones resistentes y acolchado interno. Construcción robusta para todo terreno.', 689000.00, 749000.00, 9,  5, NULL, TRUE, TRUE,  90, '2026-10-15 10:00:00'),
  (10, 'Renvar Composite',       'Bota de trabajo con puntera reforzada y suela antideslizante. Resistente, segura y cómoda para largas jornadas.', 529000.00, NULL, 10, 5, NULL, TRUE, FALSE, 66, '2026-09-10 10:00:00'),
  (11, 'Club C 85',              'Tenis de cuero con inspiración tenística. Minimalista y limpio, un básico que combina con todo.', 249000.00, 279000.00, 7,  3, NULL, TRUE, FALSE, 72, '2026-09-26 10:00:00'),
  (12, 'Jolie Stiletto',         'Tacones de aguja con punta afilada y acabado satinado. Elegancia para ocasiones especiales y eventos formales.', 289000.00, 329000.00, 11, 6, NULL, TRUE, TRUE,  84, '2026-10-22 10:00:00'),
  (13, 'Block Heel Pump',        'Tacones de bloque estables y confortables, ideales para el día a la noche. Confort sin sacrificar el estilo.', 259000.00, NULL, 11, 6, NULL, TRUE, FALSE, 69, '2026-09-14 10:00:00'),
  (14, 'Arizona EVA',            'Sandalia ergonómica de EVA ligero y resistente al agua. Plantilla anatómica que se adapta al pie con el uso.', 189000.00, 219000.00, 12, 7, NULL, TRUE, TRUE,  80, '2026-10-18 10:00:00'),
  (15, 'Top Flip Flop',          'Clásica sandalia de goma ligera y resistente. Perfecta para el calor y la playa, con gran durabilidad.', 69000.00,  NULL, 13, 7, NULL, TRUE, FALSE, 62, '2026-08-30 10:00:00'),
  (16, 'Court Vision Low',       'Inspirado en el básquet clásico, con cuero sintético y perfil bajo. Comodidad y estilo retro para el día a día.', 299000.00, 339000.00, 1,  2, NULL, TRUE, FALSE, 77, '2026-10-02 10:00:00');

-- Reiniciar el AUTO_INCREMENT después de los IDs manuales.
ALTER TABLE PRODUCTOS AUTO_INCREMENT = 17;

-- ============================================================================
-- PRODUCTO_VARIANTES
-- ----------------------------------------------------------------------------
-- Cada combinación producto + talla + color con su stock. Se asigna un
-- stock de 3 unidades por variante (suficiente para pruebas y demostración).
-- Tallla_id = numero_talla - 34  (38→4, 39→5, 40→6, 41→7, 42→8, 43→9, 44→10)
-- ============================================================================

-- Producto 1: Air Stride Pro — tallas 38-44, colores Negro(1) Azul marino(2) Rojo(3)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(1,4,1,3),(1,4,2,3),(1,4,3,3),
(1,5,1,3),(1,5,2,3),(1,5,3,3),
(1,6,1,3),(1,6,2,3),(1,6,3,3),
(1,7,1,3),(1,7,2,3),(1,7,3,3),
(1,8,1,3),(1,8,2,3),(1,8,3,3),
(1,9,1,3),(1,9,2,3),(1,9,3,3),
(1,10,1,3),(1,10,2,3),(1,10,3,3);

-- Producto 2: RunFlux 3.0 — tallas 38-43, colores Blanco(4) Gris(5) Verde(6)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(2,4,4,3),(2,4,5,3),(2,4,6,3),
(2,5,4,3),(2,5,5,3),(2,5,6,3),
(2,6,4,3),(2,6,5,3),(2,6,6,3),
(2,7,4,3),(2,7,5,3),(2,7,6,3),
(2,8,4,3),(2,8,5,3),(2,8,6,3),
(2,9,4,3),(2,9,5,3),(2,9,6,3);

-- Producto 3: Fastlane Street — tallas 39-44, colores Negro(1) Naranja(7)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(3,5,1,3),(3,5,7,3),
(3,6,1,3),(3,6,7,3),
(3,7,1,3),(3,7,7,3),
(3,8,1,3),(3,8,7,3),
(3,9,1,3),(3,9,7,3),
(3,10,1,3),(3,10,7,3);

-- Producto 4: 990 Heritage — tallas 40-44, colores Gris(5) Beige(8)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(4,6,5,3),(4,6,8,3),
(4,7,5,3),(4,7,8,3),
(4,8,5,3),(4,8,8,3),
(4,9,5,3),(4,9,8,3),
(4,10,5,3),(4,10,8,3);

-- Producto 5: Old Skool Classic — tallas 37-44, colores Negro(1) Blanco(4) Azul marino(2)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(5,3,1,3),(5,3,4,3),(5,3,2,3),
(5,4,1,3),(5,4,4,3),(5,4,2,3),
(5,5,1,3),(5,5,4,3),(5,5,2,3),
(5,6,1,3),(5,6,4,3),(5,6,2,3),
(5,7,1,3),(5,7,4,3),(5,7,2,3),
(5,8,1,3),(5,8,4,3),(5,8,2,3),
(5,9,1,3),(5,9,4,3),(5,9,2,3),
(5,10,1,3),(5,10,4,3),(5,10,2,3);

-- Producto 6: Chuck Taylor All Star — tallas 37-43, colores Negro(1) Rojo(3) Blanco(4)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(6,3,1,3),(6,3,3,3),(6,3,4,3),
(6,4,1,3),(6,4,3,3),(6,4,4,3),
(6,5,1,3),(6,5,3,3),(6,5,4,3),
(6,6,1,3),(6,6,3,3),(6,6,4,3),
(6,7,1,3),(6,7,3,3),(6,7,4,3),
(6,8,1,3),(6,8,3,3),(6,8,4,3),
(6,9,1,3),(6,9,3,3),(6,9,4,3);

-- Producto 7: Desert Oxford — tallas 40-44, colores Café(9) Negro(1)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(7,6,9,3),(7,6,1,3),
(7,7,9,3),(7,7,1,3),
(7,8,9,3),(7,8,1,3),
(7,9,9,3),(7,9,1,3),
(7,10,9,3),(7,10,1,3);

-- Producto 8: Trego Brogue — tallas 40-44, colores Negro(1) Café(9)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(8,6,1,3),(8,6,9,3),
(8,7,1,3),(8,7,9,3),
(8,8,1,3),(8,8,9,3),
(8,9,1,3),(8,9,9,3),
(8,10,1,3),(8,10,9,3);

-- Producto 9: 6-Inch Premium — tallas 40-44, colores Café(9) Negro(1)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(9,6,9,3),(9,6,1,3),
(9,7,9,3),(9,7,1,3),
(9,8,9,3),(9,8,1,3),
(9,9,9,3),(9,9,1,3),
(9,10,9,3),(9,10,1,3);

-- Producto 10: Renvar Composite — tallas 40-44, colores Negro(1) Café(9)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(10,6,1,3),(10,6,9,3),
(10,7,1,3),(10,7,9,3),
(10,8,1,3),(10,8,9,3),
(10,9,1,3),(10,9,9,3),
(10,10,1,3),(10,10,9,3);

-- Producto 11: Club C 85 — tallas 38-43, colores Blanco(4) Verde(6)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(11,4,4,3),(11,4,6,3),
(11,5,4,3),(11,5,6,3),
(11,6,4,3),(11,6,6,3),
(11,7,4,3),(11,7,6,3),
(11,8,4,3),(11,8,6,3),
(11,9,4,3),(11,9,6,3);

-- Producto 12: Jolie Stiletto — tallas 35-40, colores Negro(1) Burdeos(10) Beige(8)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(12,1,1,3),(12,1,10,3),(12,1,8,3),
(12,2,1,3),(12,2,10,3),(12,2,8,3),
(12,3,1,3),(12,3,10,3),(12,3,8,3),
(12,4,1,3),(12,4,10,3),(12,4,8,3),
(12,5,1,3),(12,5,10,3),(12,5,8,3),
(12,6,1,3),(12,6,10,3),(12,6,8,3);

-- Producto 13: Block Heel Pump — tallas 35-40, colores Beige(8) Negro(1)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(13,1,8,3),(13,1,1,3),
(13,2,8,3),(13,2,1,3),
(13,3,8,3),(13,3,1,3),
(13,4,8,3),(13,4,1,3),
(13,5,8,3),(13,5,1,3),
(13,6,8,3),(13,6,1,3);

-- Producto 14: Arizona EVA — tallas 38-43, colores Negro(1) Beige(8) Verde(6)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(14,4,1,3),(14,4,8,3),(14,4,6,3),
(14,5,1,3),(14,5,8,3),(14,5,6,3),
(14,6,1,3),(14,6,8,3),(14,6,6,3),
(14,7,1,3),(14,7,8,3),(14,7,6,3),
(14,8,1,3),(14,8,8,3),(14,8,6,3),
(14,9,1,3),(14,9,8,3),(14,9,6,3);

-- Producto 15: Top Flip Flop — tallas 38-44, colores Azul(11) Negro(1) Naranja(7)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(15,4,11,4),(15,4,1,4),(15,4,7,4),
(15,5,11,4),(15,5,1,4),(15,5,7,4),
(15,6,11,4),(15,6,1,4),(15,6,7,4),
(15,7,11,4),(15,7,1,4),(15,7,7,4),
(15,8,11,4),(15,8,1,4),(15,8,7,4),
(15,9,11,4),(15,9,1,4),(15,9,7,4),
(15,10,11,4),(15,10,1,4),(15,10,7,4);

-- Producto 16: Court Vision Low — tallas 39-44, colores Blanco(4) Negro(1)
INSERT INTO PRODUCTO_VARIANTES (producto_id, talla_id, color_id, stock) VALUES
(16,5,4,3),(16,5,1,3),
(16,6,4,3),(16,6,1,3),
(16,7,4,3),(16,7,1,3),
(16,8,4,3),(16,8,1,3),
(16,9,4,3),(16,9,1,3),
(16,10,4,3),(16,10,1,3);

-- ============================================================================
-- Verificación rápida (opcional, para confirmar la carga de datos)
-- ============================================================================
SELECT '--- Resumen de datos cargados ---' AS info;
SELECT CONCAT('Marcas: ', COUNT(*)) AS info FROM MARCAS;
SELECT CONCAT('Categorias: ', COUNT(*)) AS info FROM CATEGORIAS;
SELECT CONCAT('Tallas: ', COUNT(*)) AS info FROM TALLAS;
SELECT CONCAT('Colores: ', COUNT(*)) AS info FROM COLORES;
SELECT CONCAT('Productos: ', COUNT(*)) AS info FROM PRODUCTOS;
SELECT CONCAT('Variantes: ', COUNT(*)) AS info FROM PRODUCTO_VARIANTES;
