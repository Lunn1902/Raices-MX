-- RaicesMX · Datos semilla del piloto en Puebla
-- Ejecutar después de 001_initial_schema.sql (supabase db reset lo hace en orden).
-- Las firmas HMAC se calculan aquí mismo con pgcrypto usando el secreto de desarrollo.
-- En producción hay que volver a firmar con el QR_HMAC_SECRET real.

begin;

-- Promotora del piloto y compradora de prueba
insert into usuarios (id, correo, nombre_completo, telefono, rol, correo_confirmado) values
  ('00000000-0000-4000-8000-000000000001', 'rosa.tellez@raicesmx.mx', 'Rosa Elena Téllez Romero', '2221456790', 'promotor', true),
  ('00000000-0000-4000-8000-000000000002', 'daniela.ortiz@correo.mx', 'Daniela Ortiz Méndez', '2223348812', 'comprador_b2c', true);

insert into perfiles_comprador (usuario_id, direccion_principal) values
  ('00000000-0000-4000-8000-000000000002', 'Av. San Claudio s/n, Ciudad Universitaria, Puebla, Pue. 72570');

-- Productores (CU-01): cinco aprobados y uno pendiente para probar el panel del promotor
insert into usuarios (id, correo, nombre_completo, telefono, rol, correo_confirmado) values
  ('00000000-0000-4000-8000-000000000011', 'telar.masehual@correo.mx', 'María Francisca Cruz Hernández', '2333310021', 'productor', true),
  ('00000000-0000-4000-8000-000000000012', 'alfareria.rodriguez@correo.mx', 'Juan Carlos Rodríguez Lima', '9534410982', 'productor', true),
  ('00000000-0000-4000-8000-000000000013', 'palma.ngigua@correo.mx', 'Guadalupe Martínez Ramos', '2383127745', 'productor', true),
  ('00000000-0000-4000-8000-000000000014', 'lana.hueyapan@correo.mx', 'Tomás Vázquez Bonilla', '2313325561', 'productor', true),
  ('00000000-0000-4000-8000-000000000015', 'madera.chignahuapan@correo.mx', 'Ernestina Castillo Flores', '7971123094', 'productor', true),
  ('00000000-0000-4000-8000-000000000016', 'tapetes.teotitlan@correo.mx', 'Aurelia Bautista Ruiz', '9515240318', 'productor', true);

insert into perfiles_productor (usuario_id, nombre_taller, identificacion_oficial, comunidad, estado, pueblo_originario, tecnica_principal, estado_verificacion) values
  ('00000000-0000-4000-8000-000000000011', 'Telar Masehual', 'CUHF780412MPLRRR05', 'Cuetzalan del Progreso', 'Puebla', 'Nahua', 'Telar de cintura', 'aprobado'),
  ('00000000-0000-4000-8000-000000000012', 'Alfarería Mixteca Rodríguez', 'ROLJ850907HPLDMN02', 'Acatlán de Osorio', 'Puebla', 'Mixteco', 'Barro bruñido', 'aprobado'),
  ('00000000-0000-4000-8000-000000000013', 'Palma Ngigua', 'MARG690224MPLRMD08', 'San Gabriel Chilac', 'Puebla', 'Popoloca', 'Tejido de palma', 'aprobado'),
  ('00000000-0000-4000-8000-000000000014', 'Taller Hueyapan', 'VABT810315HPLZNM04', 'Hueyapan', 'Puebla', 'Nahua', 'Telar de pedal', 'aprobado'),
  ('00000000-0000-4000-8000-000000000015', 'Madera Viva', 'CAFE900118MPLSLR01', 'Chignahuapan', 'Puebla', 'Nahua', 'Tallado en madera', 'pendiente'),
  ('00000000-0000-4000-8000-000000000016', 'Tapetes Gueendxi', 'BARA750630MOCTZR09', 'Teotitlán del Valle', 'Oaxaca', 'Zapoteco', 'Telar de pedal', 'aprobado');

insert into verificaciones_productor (id, productor_id, promotor_id, estado, observaciones) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000001', 'aprobado', 'Visita al taller en Cuetzalan del Progreso: identidad y proceso artesanal comprobados'),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000001', 'aprobado', 'Visita al taller en Acatlán de Osorio: identidad y proceso artesanal comprobados'),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000001', 'aprobado', 'Visita al taller en San Gabriel Chilac: identidad y proceso artesanal comprobados'),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000001', 'aprobado', 'Visita al taller en Hueyapan: identidad y proceso artesanal comprobados'),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000001', 'aprobado', 'Visita al taller en Teotitlán del Valle: identidad y proceso artesanal comprobados');

-- Productos en las 3 categorías (CU-04, CU-07)
insert into productos (id, productor_id, nombre, descripcion, categoria, precio_unitario, stock) values
  ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000011', 'Huipil de gala de Cuetzalan', 'Huipil blanco con brocado de flores y aves en hilo de colores.', 'Textiles', 2800, 2),
  ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000011', 'Quechquémitl bordado', 'Prenda tradicional de hombros con bordado de punto de cruz.', 'Textiles', 950, 4),
  ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000012', 'Olla de barro bruñido', 'Olla de barro rojo pulida a mano con piedra de río.', 'Cerámica y barro', 800, 3),
  ('00000000-0000-4000-8000-000000000104', '00000000-0000-4000-8000-000000000012', 'Árbol de la vida mixteco', 'Escultura policromada con escenas de la vida en la Mixteca.', 'Cerámica y barro', 1500, 1),
  ('00000000-0000-4000-8000-000000000105', '00000000-0000-4000-8000-000000000013', 'Tenate de palma natural', 'Canasto con tapa para guardar tortillas.', 'Palma y madera', 350, 10),
  ('00000000-0000-4000-8000-000000000106', '00000000-0000-4000-8000-000000000013', 'Sombrero de palma tejido', 'Sombrero de ala ancha tejido en trenza fina.', 'Palma y madera', 420, 6),
  ('00000000-0000-4000-8000-000000000107', '00000000-0000-4000-8000-000000000014', 'Rebozo de lana de Hueyapan', 'Rebozo de lana teñido con grana cochinilla y añil.', 'Textiles', 1800, 2),
  ('00000000-0000-4000-8000-000000000108', '00000000-0000-4000-8000-000000000016', 'Tapete zapoteco de grecas', 'Tapete de lana con grecas de Mitla.', 'Textiles', 3200, 1);

-- Fichas de origen con los 9 campos obligatorios
insert into fichas_origen (id, producto_id, nombre_productor, comunidad, estado, pueblo_originario, tecnica, materiales, tiempo_elaboracion, precio_registrado, fotografias_urls, historia_pieza, capturado_por) values
  ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', 'María Francisca Cruz Hernández', 'Cuetzalan del Progreso', 'Puebla', 'Nahua', 'Telar de cintura', 'Algodón y artisela', '6 semanas', 2800, array['/piezas/textiles.svg'], 'Las figuras de la greca representan la milpa y los pájaros de la sierra nororiental.', '00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', 'María Francisca Cruz Hernández', 'Cuetzalan del Progreso', 'Puebla', 'Nahua', 'Telar de cintura', 'Algodón y estambre', '3 semanas', 950, array['/piezas/textiles.svg'], 'Se usa sobre el huipil en las fiestas patronales de Cuetzalan.', '00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-000000000203', '00000000-0000-4000-8000-000000000103', 'Juan Carlos Rodríguez Lima', 'Acatlán de Osorio', 'Puebla', 'Mixteco', 'Barro bruñido', 'Barro rojo, engobe natural', '10 días', 800, array['/piezas/ceramica.svg'], 'La quema se hace a cielo abierto con leña de mezquite, como enseñaron los abuelos.', '00000000-0000-4000-8000-000000000012'),
  ('00000000-0000-4000-8000-000000000204', '00000000-0000-4000-8000-000000000104', 'Juan Carlos Rodríguez Lima', 'Acatlán de Osorio', 'Puebla', 'Mixteco', 'Modelado y policromía', 'Barro, pigmentos minerales, alambre', '2 semanas', 1500, array['/piezas/ceramica.svg'], 'Cada rama cuenta una parte de la historia familiar del taller.', '00000000-0000-4000-8000-000000000012'),
  ('00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000105', 'Guadalupe Martínez Ramos', 'San Gabriel Chilac', 'Puebla', 'Popoloca', 'Tejido de palma', 'Palma de soyate', '4 días', 350, array['/piezas/palma.svg'], 'La palma se corta en luna menguante y se deja secar al sol una semana.', '00000000-0000-4000-8000-000000000013'),
  ('00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000106', 'Guadalupe Martínez Ramos', 'San Gabriel Chilac', 'Puebla', 'Popoloca', 'Tejido de palma', 'Palma de soyate teñida', '5 días', 420, array['/piezas/palma.svg'], 'El tejido en trenza es una tradición ngigua del valle de Tehuacán.', '00000000-0000-4000-8000-000000000013'),
  ('00000000-0000-4000-8000-000000000207', '00000000-0000-4000-8000-000000000107', 'Tomás Vázquez Bonilla', 'Hueyapan', 'Puebla', 'Nahua', 'Telar de pedal', 'Lana de borrego, grana cochinilla, añil', '1 mes', 1800, array['/piezas/textiles.svg'], 'La lana se hila a mano con malacate antes de pasar al telar.', '00000000-0000-4000-8000-000000000014'),
  ('00000000-0000-4000-8000-000000000208', '00000000-0000-4000-8000-000000000108', 'Aurelia Bautista Ruiz', 'Teotitlán del Valle', 'Oaxaca', 'Zapoteco', 'Telar de pedal', 'Lana, tintes de pericón y musgo', '5 semanas', 3200, array['/piezas/textiles.svg'], 'Las grecas se inspiran en los muros de la zona arqueológica de Mitla.', '00000000-0000-4000-8000-000000000016');

-- Sellos de originalidad (CU-05): mismo payload que src/modules/sello-qr/firma.ts
-- folio|producto_id|productor_id|comunidad|pueblo_originario|tecnica
insert into sellos_originalidad (id, ficha_origen_id, folio_unico, firma_hmac, qr_png_url)
select s.id::uuid, f.id, s.folio,
       encode(extensions.hmac(
         s.folio || '|' || p.id || '|' || p.productor_id || '|' || f.comunidad || '|' || f.pueblo_originario || '|' || f.tecnica,
         'raicesmx-dev-secret', 'sha256'), 'hex'),
       '/api/v1/sello-qr/' || s.folio || '/png'
from (values
  ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000201', 'RMX-PUE-2026-3F9A1C'),
  ('00000000-0000-4000-8000-000000000402', '00000000-0000-4000-8000-000000000202', 'RMX-PUE-2026-7B20E4'),
  ('00000000-0000-4000-8000-000000000403', '00000000-0000-4000-8000-000000000203', 'RMX-PUE-2026-A15D09'),
  ('00000000-0000-4000-8000-000000000404', '00000000-0000-4000-8000-000000000204', 'RMX-PUE-2026-C4E871'),
  ('00000000-0000-4000-8000-000000000405', '00000000-0000-4000-8000-000000000205', 'RMX-PUE-2026-5D6A2F'),
  ('00000000-0000-4000-8000-000000000406', '00000000-0000-4000-8000-000000000206', 'RMX-PUE-2026-91B3E7'),
  ('00000000-0000-4000-8000-000000000407', '00000000-0000-4000-8000-000000000207', 'RMX-PUE-2026-0E8F44'),
  ('00000000-0000-4000-8000-000000000408', '00000000-0000-4000-8000-000000000208', 'RMX-OAX-2026-6C2D19')
) as s(id, ficha_id, folio)
join fichas_origen f on f.id = s.ficha_id::uuid
join productos p on p.id = f.producto_id;

-- Bitácora inicial de las verificaciones del piloto
insert into bitacora_auditoria (usuario_id, rol, accion, entidad, entidad_id, valor_nuevo)
select promotor_id, 'promotor', 'verificar_productor', 'perfiles_productor', productor_id::text,
       jsonb_build_object('estado_verificacion', estado)
from verificaciones_productor;

commit;
