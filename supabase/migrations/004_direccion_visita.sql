-- RaicesMX · Migración 004
-- CU-01: la dirección del artesano es obligatoria en el registro y el
-- verificador debe acudir personalmente al taller para confirmar que existe.

alter table public.perfiles_productor
  add column if not exists direccion             text,
  add column if not exists referencias_direccion text,
  add column if not exists latitud               numeric(10, 7),
  add column if not exists longitud              numeric(10, 7);

-- No se marca NOT NULL para no romper los perfiles ya registrados.
-- La validación de "obligatoria" la hace la aplicación (esquemaRegistroProductor).
comment on column public.perfiles_productor.direccion is 'Dirección completa del taller o domicilio donde el verificador debe acudir (CU-01)';
comment on column public.perfiles_productor.referencias_direccion is 'Referencias para localizar el taller (entre calles, color de la casa, etc.)';

alter table public.verificaciones_productor
  add column if not exists visita_realizada   boolean not null default false,
  add column if not exists fecha_visita       timestamptz,
  add column if not exists latitud_visita     numeric(10, 7),
  add column if not exists longitud_visita    numeric(10, 7),
  add column if not exists evidencia_visita_url text;

comment on column public.verificaciones_productor.visita_realizada is 'true cuando el verificador acudió personalmente al domicilio del artesano';
comment on column public.verificaciones_productor.evidencia_visita_url is 'Foto o comprobante de la visita al domicilio';

-- No se puede aprobar a un artesano sin haber registrado la visita.
create or replace function public.validar_visita_verificacion()
returns trigger
language plpgsql
as $$
begin
  if new.estado = 'aprobado' and new.visita_realizada is not true then
    raise exception 'No se puede aprobar sin registrar la visita personal al domicilio del artesano';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validar_visita_verificacion on public.verificaciones_productor;
create trigger trg_validar_visita_verificacion
  before insert or update on public.verificaciones_productor
  for each row execute function public.validar_visita_verificacion();
