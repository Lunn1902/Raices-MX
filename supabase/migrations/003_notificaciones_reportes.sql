-- RaicesMX · Migración 003
-- Cierra las dos clases del diagrama UML que faltaban en el modelo E-R:
--   Notificacion  -> notificaciones
--   Reporte       -> reportes
-- No modifican las 15 tablas de la 001; solo agregan entidades de seguimiento y control.

-- Tipos enumerados

create type canal_notificacion as enum ('sistema', 'correo', 'sms', 'whatsapp');
create type estado_notificacion as enum ('pendiente', 'enviada', 'fallida', 'leida');
create type formato_reporte as enum ('csv', 'pdf', 'xlsx');
create type estado_reporte as enum ('pendiente', 'generado', 'error');

-- Notificaciones (Seguimiento y control)

create table notificaciones (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references usuarios(id) on delete cascade,
  pedido_id   uuid references pedidos(id) on delete set null,
  canal       canal_notificacion not null default 'sistema',
  tipo        text not null check (char_length(trim(tipo)) > 0),
  asunto      text,
  mensaje     text not null check (char_length(trim(mensaje)) > 0),
  estado      estado_notificacion not null default 'pendiente',
  enviado_en  timestamptz,
  leido_en    timestamptz,
  created_at  timestamptz not null default now()
);

comment on table notificaciones is 'Avisos al usuario por pedido o evento del sistema (clase Notificacion del UML)';
comment on column notificaciones.tipo is 'Clave del evento: pedido_confirmado, pago_aprobado, verificacion_aprobada, etc.';
comment on column notificaciones.pedido_id is 'Pedido que originó el aviso; nulo si es un aviso general';

-- Reportes (Seguimiento y control)

create table reportes (
  id             uuid primary key default gen_random_uuid(),
  generado_por   uuid references usuarios(id) on delete set null,
  tipo           text not null check (tipo in ('ventas', 'productores', 'comisiones', 'auditoria', 'inventario')),
  formato        formato_reporte not null default 'csv',
  filtros        jsonb not null default '{}'::jsonb,
  periodo_inicio date,
  periodo_fin    date,
  url_archivo    text,
  estado         estado_reporte not null default 'pendiente',
  generado_en    timestamptz,
  created_at     timestamptz not null default now(),
  constraint ck_reporte_periodo check (
    periodo_inicio is null or periodo_fin is null or periodo_fin >= periodo_inicio
  )
);

comment on table reportes is 'Reportes exportables que solicita el administrador (clase Reporte del UML)';
comment on column reportes.filtros is 'Filtros aplicados al reporte, tal como los eligió el administrador';
comment on column reportes.url_archivo is 'Ubicación del archivo generado (Storage o descarga temporal)';

-- Índices

create index idx_notificaciones_usuario on notificaciones (usuario_id, created_at desc);
create index idx_notificaciones_pedido on notificaciones (pedido_id);
create index idx_notificaciones_pendientes on notificaciones (usuario_id) where estado = 'pendiente';
create index idx_reportes_generado_por on reportes (generado_por);
create index idx_reportes_tipo_fecha on reportes (tipo, created_at desc);

-- Marcas de tiempo automáticas

create or replace function marcar_notificacion_enviada()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado = 'enviada' and new.enviado_en is null then
    new.enviado_en := now();
  end if;
  if new.estado = 'leida' then
    new.enviado_en := coalesce(new.enviado_en, now());
    new.leido_en := coalesce(new.leido_en, now());
  end if;
  return new;
end;
$$;

create trigger trg_notificaciones_fechas
  before insert or update of estado on notificaciones
  for each row execute function marcar_notificacion_enviada();

create or replace function marcar_reporte_generado()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.estado = 'generado' and new.generado_en is null then
    new.generado_en := now();
  end if;
  return new;
end;
$$;

create trigger trg_reportes_fecha
  before insert or update of estado on reportes
  for each row execute function marcar_reporte_generado();

-- Seguridad: mismo criterio que la 001. La API con service role es la única puerta.

alter table notificaciones enable row level security;
alter table reportes enable row level security;

revoke all on notificaciones, reportes from anon, authenticated;
