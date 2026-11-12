-- RaicesMX · Datos de ejemplo para las entidades de la migración 003
-- Se ejecuta después de supabase/seed.sql. Sirve para que las tablas nuevas
-- aparezcan con datos reales del piloto en el Table Editor y en las evidencias.

begin;

-- Avisos del piloto: la promotora recibe el alta de un productor y la compradora
-- recibe la confirmación de su compra de prueba.
insert into notificaciones (id, usuario_id, pedido_id, canal, tipo, asunto, mensaje, estado) values
  ('00000000-0000-4000-8000-000000000501',
   '00000000-0000-4000-8000-000000000001',
   null, 'sistema', 'productor_pendiente',
   'Nuevo productor por verificar',
   'Ernestina Castillo Flores (Madera Viva, Chignahuapan) espera la visita de verificación.',
   'pendiente'),
  ('00000000-0000-4000-8000-000000000502',
   '00000000-0000-4000-8000-000000000002',
   null, 'correo', 'bienvenida',
   'Bienvenida a RaicesMX',
   'Tu cuenta de compradora quedó lista. Ya puedes explorar el catálogo de las y los artesanos.',
   'leida'),
  ('00000000-0000-4000-8000-000000000503',
   '00000000-0000-4000-8000-000000000011',
   null, 'sms', 'verificacion_aprobada',
   'Tu taller ya está verificado',
   'La visita al taller en Cuetzalan del Progreso fue aprobada. Ya puedes publicar tus piezas.',
   'enviada');

-- Reportes que solicita el administrador para revisar el avance del piloto.
insert into reportes (id, generado_por, tipo, formato, filtros, periodo_inicio, periodo_fin, url_archivo, estado) values
  ('00000000-0000-4000-8000-000000000601',
   '00000000-0000-4000-8000-000000000001',
   'ventas', 'csv', '{"estado":"confirmado","tipo":"B2C"}'::jsonb,
   '2026-08-01', '2026-10-31', '/reportes/ventas-piloto-2026-10.csv', 'generado'),
  ('00000000-0000-4000-8000-000000000602',
   '00000000-0000-4000-8000-000000000001',
   'productores', 'pdf', '{"estado_verificacion":"aprobado","estado":"Puebla"}'::jsonb,
   null, null, '/reportes/productores-aprobados-puebla.pdf', 'generado');

commit;
