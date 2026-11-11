-- RaicesMX · Reglas extra sobre las tablas de la 001
-- Son cosas que agregué después para que la base se cuide sola y para quitar
-- los avisos que marca Supabase. No cambia ninguna tabla, solo agrega cosas.

create extension if not exists unaccent with schema extensions;

-- 1. Liga opcional con Supabase Auth para cuando entre el login (CU-02).
--    Es opcional porque el promotor puede dar de alta productores que aún no tienen cuenta.
alter table usuarios add column auth_id uuid unique references auth.users(id) on delete set null;
comment on column usuarios.auth_id is 'Usuario de Supabase Auth; nulo si el productor fue registrado por un promotor';

-- 2. Búsqueda sin acentos: "ceramica" debe encontrar "Cerámica".
--    unaccent() no es immutable, por eso se envuelve indicando el diccionario.
create or replace function sin_acentos(texto text)
returns text
language sql immutable parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(texto, '')));
$$;

-- security_invoker hace que la vista respete los permisos de quien consulta (aviso del linter)
create or replace view vista_catalogo with (security_invoker = true) as
select
  p.id,
  p.productor_id,
  p.nombre,
  p.descripcion,
  p.categoria,
  p.precio_unitario,
  p.stock,
  p.created_at,
  f.id as ficha_id,
  f.nombre_productor,
  f.comunidad,
  f.estado,
  f.pueblo_originario,
  f.tecnica,
  f.materiales,
  f.tiempo_elaboracion,
  f.fotografias_urls,
  f.historia_pieza,
  s.folio_unico,
  sin_acentos(concat_ws(' ', p.nombre, p.descripcion, p.categoria, f.tecnica, f.materiales,
                        f.comunidad, f.nombre_productor, f.pueblo_originario)) as busqueda
from productos p
join fichas_origen f on f.producto_id = p.id
join perfiles_productor pp on pp.usuario_id = p.productor_id
left join sellos_originalidad s on s.ficha_origen_id = f.id and s.activo
where p.activo and p.stock > 0 and pp.estado_verificacion = 'aprobado';

alter view vista_mapa_procedencia set (security_invoker = true);

-- 3. Defensa en la base: solo un productor aprobado puede tener piezas (CU-01 → CU-04)
create or replace function validar_productor_aprobado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (
    select 1 from perfiles_productor
    where usuario_id = new.productor_id and estado_verificacion = 'aprobado'
  ) then
    raise exception 'PRODUCTOR_NO_VERIFICADO: el productor debe estar aprobado por un promotor';
  end if;
  return new;
end;
$$;

create trigger trg_productos_productor_aprobado
  before insert on productos
  for each row execute function validar_productor_aprobado();

-- 4. Cada cambio de estado del pedido queda en su historial sin depender de la API (RF-13)
create or replace function registrar_cambio_estado_pedido()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado is distinct from old.estado then
    insert into seguimiento_pedidos (pedido_id, estado, nota)
    values (new.id, new.estado, 'Cambio de ' || old.estado || ' a ' || new.estado);
  end if;
  return new;
end;
$$;

create trigger trg_pedidos_historial_estado
  after update of estado on pedidos
  for each row execute function registrar_cambio_estado_pedido();

-- 5. El promedio de estrellas del productor se recalcula solo (RF-14)
create or replace function recalcular_promedio_productor()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_productor uuid := coalesce(new.productor_id, old.productor_id);
begin
  update perfiles_productor
  set promedio_calificacion = coalesce(
    (select round(avg(puntuacion), 2) from calificaciones where productor_id = v_productor), 0)
  where usuario_id = v_productor;
  return null;
end;
$$;

create trigger trg_calificaciones_promedio
  after insert or update or delete on calificaciones
  for each row execute function recalcular_promedio_productor();

-- 6. search_path fijo en las funciones de la 001 (aviso "function_search_path_mutable")
alter function fijar_updated_at() set search_path = public;
alter function impedir_modificacion_bitacora() set search_path = public;
alter function crear_pedidos_b2c(uuid, text, jsonb, numeric) set search_path = public, extensions;

-- 7. Índices para llaves foráneas que no tenían uno (aviso "unindexed_foreign_keys")
create index if not exists idx_verificaciones_promotor on verificaciones_productor (promotor_id);
create index if not exists idx_fichas_capturado_por on fichas_origen (capturado_por);
create index if not exists idx_liquidaciones_productor on liquidaciones (productor_id);
create index if not exists idx_seguimiento_creado_por on seguimiento_pedidos (creado_por);
create index if not exists idx_calificaciones_comprador on calificaciones (comprador_id);
create index if not exists idx_calificaciones_productor on calificaciones (productor_id);

-- 8. Comentarios: aparecen en el Table Editor de Supabase y ayudan al equipo
comment on table usuarios is 'Cuenta base de cualquier rol';
comment on table perfiles_productor is 'Datos del taller artesanal (CU-01). Solo los aprobados pueden publicar';
comment on table verificaciones_productor is 'Historial de visitas de verificación del promotor (CU-01)';
comment on table perfiles_comprador is 'Datos del comprador B2C o B2B';
comment on table productos is 'Piezas publicadas en el catálogo (CU-04, CU-07)';
comment on table fichas_origen is 'Ficha de origen 1:1 con el producto; sus 9 campos son obligatorios (RF-04)';
comment on table sellos_originalidad is 'Folio único y firma HMAC-SHA256 que se codifican en el QR (CU-05, CU-06)';
comment on table pedidos is 'Pedido de un comprador a un productor (CU-08 B2C, CU-09 B2B)';
comment on table detalles_pedido is 'Partidas del pedido con el precio congelado al comprar';
comment on table contratos_b2b is 'Contrato de lote con pago escalonado 30/70 (CU-09)';
comment on table pagos is 'Cobros del pedido; en v1 son pagos de prueba';
comment on table liquidaciones is 'Reparto de cada venta: comisión de la plataforma y neto del productor (CU-10)';
comment on table seguimiento_pedidos is 'Historial de estados del pedido (RF-13)';
comment on table calificaciones is 'Calificación de 1 a 5 estrellas por pedido (RF-14)';
comment on table bitacora_auditoria is 'Bitácora de solo inserción; triggers bloquean UPDATE, DELETE y TRUNCATE (RNF-13)';
comment on function crear_pedidos_b2c(uuid, text, jsonb, numeric) is 'Compra B2C atómica con FOR UPDATE, un pedido por productor y reparto 90/10';
