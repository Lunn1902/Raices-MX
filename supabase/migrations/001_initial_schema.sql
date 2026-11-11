-- RaicesMX · Migración inicial
-- Implementación del Modelo E-R (docs/MODELO_ER.md) para Supabase / PostgreSQL 15+

create extension if not exists pgcrypto with schema extensions;

-- Tipos enumerados

create type rol_usuario as enum ('productor', 'promotor', 'comprador_b2c', 'comprador_b2b', 'admin');
create type estado_verificacion as enum ('pendiente', 'aprobado', 'rechazado');
create type tipo_pedido as enum ('B2C', 'B2B');
create type estado_pedido as enum (
  'pendiente_aprobacion',
  'rechazado_productor',
  'expirado',
  'pendiente_anticipo',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado'
);
create type metodo_pago as enum ('tarjeta', 'spei');
create type estado_pago as enum ('pendiente', 'aprobado', 'rechazado', 'reembolsado');

-- Usuarios y perfiles (CU-01, CU-02)

create table usuarios (
  id                 uuid primary key default gen_random_uuid(), -- se puede ligar a auth.users
  correo             text not null unique check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  nombre_completo    text not null check (char_length(trim(nombre_completo)) > 0),
  telefono           text,
  rol                rol_usuario not null,
  correo_confirmado  boolean not null default false,
  intentos_fallidos  int not null default 0 check (intentos_fallidos >= 0),
  bloqueado_hasta    timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table perfiles_productor (
  usuario_id             uuid primary key references usuarios(id) on delete cascade,
  nombre_taller          text not null,
  identificacion_oficial text not null, -- INE (clave de elector) o CURP
  comunidad              text not null,
  estado                 text not null,
  pueblo_originario      text not null,
  tecnica_principal      text not null,
  rfc                    text,
  clabe_spei             text check (clabe_spei is null or clabe_spei ~ '^\d{18}$'),
  estado_verificacion    estado_verificacion not null default 'pendiente',
  promedio_calificacion  numeric(3,2) not null default 0.00 check (promedio_calificacion between 0 and 5),
  created_at             timestamptz not null default now()
);

create table verificaciones_productor (
  id                  uuid primary key default gen_random_uuid(),
  productor_id        uuid not null references perfiles_productor(usuario_id) on delete cascade,
  promotor_id         uuid not null references usuarios(id) on delete restrict,
  estado              estado_verificacion not null,
  observaciones       text,
  evidencia_url       text,
  fecha_verificacion  timestamptz not null default now()
);

create table perfiles_comprador (
  usuario_id           uuid primary key references usuarios(id) on delete cascade,
  direccion_principal  text,
  nombre_empresa       text,
  rfc_empresa          text,
  created_at           timestamptz not null default now()
);

-- Catálogo, ficha de origen y sello (CU-04, CU-05, CU-06, CU-07)

create table productos (
  id                 uuid primary key default gen_random_uuid(),
  productor_id       uuid not null references perfiles_productor(usuario_id) on delete restrict,
  nombre             text not null check (char_length(trim(nombre)) > 0),
  descripcion        text,
  categoria          text not null check (categoria in ('Textiles', 'Cerámica y barro', 'Palma y madera')),
  precio_unitario    numeric(10,2) not null check (precio_unitario > 0),
  stock              int not null default 1 check (stock >= 0),
  lotes_habilitados  boolean not null default true,
  activo             boolean not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Composición 1:1 con productos. Los CHECK garantizan los 9 campos obligatorios de RF-04
-- aunque alguien intente insertar por fuera de la API.
create table fichas_origen (
  id                  uuid primary key default gen_random_uuid(),
  producto_id         uuid not null unique references productos(id) on delete cascade,
  nombre_productor    text not null check (char_length(trim(nombre_productor)) > 0),
  comunidad           text not null check (char_length(trim(comunidad)) > 0),
  estado              text not null check (char_length(trim(estado)) > 0),
  pueblo_originario   text not null check (char_length(trim(pueblo_originario)) > 0),
  tecnica             text not null check (char_length(trim(tecnica)) > 0),
  materiales          text not null check (char_length(trim(materiales)) > 0),
  tiempo_elaboracion  text not null check (char_length(trim(tiempo_elaboracion)) > 0),
  precio_registrado   numeric(10,2) not null check (precio_registrado > 0),
  fotografias_urls    text[] not null check (array_length(fotografias_urls, 1) >= 1),
  historia_pieza      text,
  latitud             numeric(9,6) check (latitud between -90 and 90),
  longitud            numeric(9,6) check (longitud between -180 and 180),
  version             int not null default 1 check (version >= 1),
  capturado_por       uuid references usuarios(id) on delete set null,
  updated_at          timestamptz not null default now()
);

create table sellos_originalidad (
  id               uuid primary key default gen_random_uuid(),
  ficha_origen_id  uuid not null unique references fichas_origen(id) on delete cascade,
  folio_unico      text not null unique check (folio_unico ~ '^RMX-[A-Z]{3}-\d{4}-[0-9A-F]{6}$'),
  firma_hmac       text not null check (firma_hmac ~ '^[0-9a-f]{64}$'),
  qr_png_url       text,
  qr_pdf_url       text,
  activo           boolean not null default true,
  fecha_emision    timestamptz not null default now()
);

-- Pedidos, pagos y liquidaciones (CU-08, CU-09, CU-10)

create table pedidos (
  id                    uuid primary key default gen_random_uuid(),
  folio_pedido          text not null unique,
  tipo                  tipo_pedido not null,
  comprador_id          uuid not null references usuarios(id) on delete restrict,
  productor_id          uuid not null references perfiles_productor(usuario_id) on delete restrict,
  estado                estado_pedido not null default 'confirmado',
  direccion_entrega     text not null,
  cantidad_total        int not null check (cantidad_total > 0),
  porcentaje_descuento  numeric(5,2) not null default 0.00 check (porcentaje_descuento between 0 and 100),
  subtotal              numeric(12,2) not null check (subtotal >= 0),
  monto_descuento       numeric(12,2) not null default 0.00 check (monto_descuento >= 0),
  costo_envio           numeric(10,2) not null default 0.00 check (costo_envio >= 0),
  total                 numeric(12,2) not null check (total >= 0),
  monto_productor       numeric(12,2) not null check (monto_productor >= 0),
  monto_comision        numeric(12,2) not null check (monto_comision >= 0),
  numero_guia           text,
  expira_aprobacion_en  timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  -- lo que recibe el productor más la comisión debe cuadrar con lo vendido (sin envío)
  constraint ck_pedido_reparto check (monto_productor + monto_comision = subtotal - monto_descuento),
  -- B2B solo admite lotes de 5 a 50 piezas (RF-10)
  constraint ck_pedido_lote check (tipo = 'B2C' or cantidad_total between 5 and 50)
);

create table detalles_pedido (
  id               uuid primary key default gen_random_uuid(),
  pedido_id        uuid not null references pedidos(id) on delete cascade,
  producto_id      uuid not null references productos(id) on delete restrict,
  cantidad         int not null check (cantidad > 0),
  precio_unitario  numeric(10,2) not null check (precio_unitario > 0),
  subtotal         numeric(12,2) not null,
  constraint ck_detalle_subtotal check (subtotal = cantidad * precio_unitario),
  unique (pedido_id, producto_id)
);

create table contratos_b2b (
  id                   uuid primary key default gen_random_uuid(),
  pedido_id            uuid not null unique references pedidos(id) on delete cascade,
  folio_contrato       text not null unique,
  monto_anticipo_30    numeric(12,2) not null check (monto_anticipo_30 > 0),
  monto_saldo_70       numeric(12,2) not null check (monto_saldo_70 > 0),
  plazo_entrega_dias   int not null check (plazo_entrega_dias > 0),
  condiciones_calidad  text not null,
  pdf_url              text,
  aceptado_en          timestamptz default now()
);

create table pagos (
  id              uuid primary key default gen_random_uuid(),
  pedido_id       uuid not null references pedidos(id) on delete cascade,
  tipo_cobro      text not null check (tipo_cobro in ('total_b2c', 'anticipo_30_b2b', 'saldo_70_b2b')),
  metodo          metodo_pago not null,
  monto           numeric(12,2) not null check (monto > 0),
  estado          estado_pago not null default 'aprobado',
  token_pasarela  text,
  created_at      timestamptz not null default now()
);

create table liquidaciones (
  id                         uuid primary key default gen_random_uuid(),
  pedido_id                  uuid not null unique references pedidos(id) on delete cascade,
  productor_id               uuid not null references perfiles_productor(usuario_id) on delete restrict,
  monto_bruto                numeric(12,2) not null check (monto_bruto >= 0),
  porcentaje_comision        numeric(5,2) not null check (porcentaje_comision in (5.00, 10.00)),
  monto_comision_plataforma  numeric(12,2) not null check (monto_comision_plataforma >= 0),
  retencion_isr              numeric(12,2) not null default 0.00,
  retencion_iva              numeric(12,2) not null default 0.00,
  monto_neto_productor       numeric(12,2) not null check (monto_neto_productor >= 0),
  fecha_programada           date not null,
  liquidado                  boolean not null default false,
  created_at                 timestamptz not null default now()
);

create table seguimiento_pedidos (
  id          uuid primary key default gen_random_uuid(),
  pedido_id   uuid not null references pedidos(id) on delete cascade,
  estado      estado_pedido not null,
  nota        text,
  creado_por  uuid references usuarios(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table calificaciones (
  id            uuid primary key default gen_random_uuid(),
  pedido_id     uuid not null unique references pedidos(id) on delete cascade,
  comprador_id  uuid not null references usuarios(id) on delete restrict,
  productor_id  uuid not null references perfiles_productor(usuario_id) on delete cascade,
  puntuacion    smallint not null check (puntuacion between 1 and 5),
  comentario    text,
  created_at    timestamptz not null default now()
);

-- RNF-13: bitácora de solo inserción
create table bitacora_auditoria (
  id              bigserial primary key,
  usuario_id      uuid,
  rol             text,
  accion          text not null,
  entidad         text not null,
  entidad_id      text not null,
  ip_origen       text,
  valor_anterior  jsonb,
  valor_nuevo     jsonb,
  fecha           timestamptz not null default now()
);

-- Índices para las búsquedas del catálogo (CU-07) y consultas frecuentes

create index idx_perfiles_productor_verificacion on perfiles_productor (estado_verificacion);
create index idx_perfiles_productor_estado on perfiles_productor (estado);
create index idx_verificaciones_productor on verificaciones_productor (productor_id, fecha_verificacion desc);
create index idx_productos_productor on productos (productor_id);
create index idx_productos_categoria_precio on productos (categoria, precio_unitario) where activo;
create index idx_fichas_estado on fichas_origen (estado);
create index idx_fichas_pueblo on fichas_origen (pueblo_originario);
create index idx_fichas_tecnica on fichas_origen (tecnica);
create index idx_pedidos_comprador on pedidos (comprador_id, created_at desc);
create index idx_pedidos_productor on pedidos (productor_id, created_at desc);
create index idx_detalles_producto on detalles_pedido (producto_id);
create index idx_pagos_pedido on pagos (pedido_id);
create index idx_liquidaciones_pendientes on liquidaciones (fecha_programada) where not liquidado;
create index idx_seguimiento_pedido on seguimiento_pedidos (pedido_id, created_at);
create index idx_bitacora_entidad on bitacora_auditoria (entidad, entidad_id);
create index idx_bitacora_fecha on bitacora_auditoria (fecha desc);

-- updated_at automático

create or replace function fijar_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_usuarios_updated before update on usuarios
  for each row execute function fijar_updated_at();
create trigger trg_productos_updated before update on productos
  for each row execute function fijar_updated_at();
create trigger trg_fichas_updated before update on fichas_origen
  for each row execute function fijar_updated_at();
create trigger trg_pedidos_updated before update on pedidos
  for each row execute function fijar_updated_at();

-- Bitácora inmutable (RNF-13)

create or replace function impedir_modificacion_bitacora()
returns trigger language plpgsql as $$
begin
  raise exception 'La bitacora de auditoria es inmutable y no permite UPDATE ni DELETE (RNF-13)';
end;
$$;

create trigger trg_bitacora_inmutable
  before update or delete on bitacora_auditoria
  for each row execute function impedir_modificacion_bitacora();

-- TRUNCATE no dispara triggers por fila, así que también se bloquea a nivel sentencia
create trigger trg_bitacora_sin_truncate
  before truncate on bitacora_auditoria
  for each statement execute function impedir_modificacion_bitacora();

-- Vistas de lectura para el catálogo público y el mapa (CU-07)
-- Solo aparecen piezas activas, con existencias y de productores aprobados.

create or replace view vista_catalogo as
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
  s.folio_unico
from productos p
join fichas_origen f on f.producto_id = p.id
join perfiles_productor pp on pp.usuario_id = p.productor_id
left join sellos_originalidad s on s.ficha_origen_id = f.id and s.activo
where p.activo and p.stock > 0 and pp.estado_verificacion = 'aprobado';

create or replace view vista_mapa_procedencia as
select
  pp.estado,
  count(distinct pp.usuario_id)::int as productores,
  count(c.id)::int as piezas
from perfiles_productor pp
left join vista_catalogo c on c.productor_id = pp.usuario_id
where pp.estado_verificacion = 'aprobado'
group by pp.estado;

-- Compra B2C transaccional (CU-08 + CU-10)
-- Recibe todo el carrito, bloquea las filas de productos con FOR UPDATE y genera
-- un pedido por productor. Si cualquier pieza se agotó, se revierte todo el carrito.
-- p_items: [{"producto_id": "uuid", "cantidad": 1}, ...]

create or replace function crear_pedidos_b2c(
  p_comprador_id uuid,
  p_direccion text,
  p_items jsonb,
  p_costo_envio numeric
) returns jsonb
language plpgsql as $$
declare
  v_ids uuid[];
  v_productor uuid;
  v_pedido uuid;
  v_folio text;
  v_subtotal numeric(12,2);
  v_piezas int;
  v_comision numeric(12,2);
  v_resultado jsonb := '[]'::jsonb;
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'CARRITO_VACIO';
  end if;

  select array_agg((i->>'producto_id')::uuid order by (i->>'producto_id')::uuid)
    into v_ids
    from jsonb_array_elements(p_items) i;

  -- Bloqueo en orden de id para que dos compras simultáneas no se crucen (deadlock)
  perform 1 from productos where id = any(v_ids) order by id for update;

  if exists (
    select 1
    from jsonb_array_elements(p_items) i
    left join productos pr on pr.id = (i->>'producto_id')::uuid
    where pr.id is null or not pr.activo or pr.stock < (i->>'cantidad')::int
  ) then
    raise exception 'STOCK_INSUFICIENTE';
  end if;

  for v_productor in
    select distinct productor_id from productos where id = any(v_ids)
  loop
    select sum(pr.precio_unitario * (i->>'cantidad')::int), sum((i->>'cantidad')::int)
      into v_subtotal, v_piezas
      from jsonb_array_elements(p_items) i
      join productos pr on pr.id = (i->>'producto_id')::uuid
      where pr.productor_id = v_productor;

    -- B2C: 10% plataforma, 90% productor. El envío lo paga el comprador aparte.
    v_comision := round(v_subtotal * 0.10, 2);
    v_pedido := gen_random_uuid();
    v_folio := 'PED-' || to_char(now(), 'YYYY') || '-' || upper(substr(md5(v_pedido::text), 1, 8));

    insert into pedidos (id, folio_pedido, tipo, comprador_id, productor_id, estado, direccion_entrega,
                         cantidad_total, subtotal, costo_envio, total, monto_productor, monto_comision)
    values (v_pedido, v_folio, 'B2C', p_comprador_id, v_productor, 'confirmado', p_direccion,
            v_piezas, v_subtotal, p_costo_envio, v_subtotal + p_costo_envio,
            v_subtotal - v_comision, v_comision);

    insert into detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
    select v_pedido, pr.id, (i->>'cantidad')::int, pr.precio_unitario, pr.precio_unitario * (i->>'cantidad')::int
      from jsonb_array_elements(p_items) i
      join productos pr on pr.id = (i->>'producto_id')::uuid
      where pr.productor_id = v_productor;

    update productos pr
      set stock = pr.stock - (i->>'cantidad')::int
      from jsonb_array_elements(p_items) i
      where pr.id = (i->>'producto_id')::uuid and pr.productor_id = v_productor;

    insert into pagos (pedido_id, tipo_cobro, metodo, monto, estado, token_pasarela)
    values (v_pedido, 'total_b2c', 'tarjeta', v_subtotal + p_costo_envio, 'aprobado', 'PRUEBA-' || v_folio);

    insert into liquidaciones (pedido_id, productor_id, monto_bruto, porcentaje_comision,
                               monto_comision_plataforma, monto_neto_productor, fecha_programada)
    values (v_pedido, v_productor, v_subtotal, 10.00, v_comision, v_subtotal - v_comision, current_date + 7);

    insert into seguimiento_pedidos (pedido_id, estado, nota, creado_por)
    values (v_pedido, 'confirmado', 'Pago de prueba aprobado', p_comprador_id);

    insert into bitacora_auditoria (usuario_id, rol, accion, entidad, entidad_id, valor_nuevo)
    values (p_comprador_id, 'comprador_b2c', 'crear_pedido_b2c', 'pedidos', v_pedido::text,
            jsonb_build_object('folio', v_folio, 'subtotal', v_subtotal, 'comision', v_comision));

    v_resultado := v_resultado || jsonb_build_object(
      'pedido_id', v_pedido,
      'folio_pedido', v_folio,
      'productor_id', v_productor,
      'cantidad_total', v_piezas,
      'subtotal', v_subtotal,
      'monto_productor', v_subtotal - v_comision,
      'monto_comision', v_comision,
      'costo_envio', p_costo_envio,
      'total', v_subtotal + p_costo_envio
    );
  end loop;

  return v_resultado;
end;
$$;

-- Seguridad: la única puerta de entrada es la API REST (service role en el servidor).
-- Con RLS activo y sin políticas, la llave anónima no puede leer ni escribir tablas.

alter table usuarios enable row level security;
alter table perfiles_productor enable row level security;
alter table verificaciones_productor enable row level security;
alter table perfiles_comprador enable row level security;
alter table productos enable row level security;
alter table fichas_origen enable row level security;
alter table sellos_originalidad enable row level security;
alter table pedidos enable row level security;
alter table detalles_pedido enable row level security;
alter table contratos_b2b enable row level security;
alter table pagos enable row level security;
alter table liquidaciones enable row level security;
alter table seguimiento_pedidos enable row level security;
alter table calificaciones enable row level security;
alter table bitacora_auditoria enable row level security;

revoke all on vista_catalogo, vista_mapa_procedencia from anon, authenticated;
revoke execute on function crear_pedidos_b2c(uuid, text, jsonb, numeric) from public, anon, authenticated;

-- Bucket público para las fotografías de las piezas (RF-04, máx. 5 MB)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-piezas', 'fotos-piezas', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
