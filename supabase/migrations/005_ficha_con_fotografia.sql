-- 005 · La ficha de origen exige al menos una fotografía también en la base.
-- array_length('{}'::text[], 1) devuelve NULL y un CHECK con NULL se acepta,
-- por eso la regla original permitía guardar una ficha con el arreglo vacío.
-- cardinality() devuelve 0 para el arreglo vacío y sí lo rechaza.

alter table fichas_origen drop constraint if exists fichas_origen_fotografias_urls_check;
alter table fichas_origen
  add constraint fichas_origen_fotografias_urls_check check (cardinality(fotografias_urls) >= 1);

-- Mensaje de la bitácora sin referencias a numeraciones anteriores de requerimientos.
create or replace function impedir_modificacion_bitacora()
returns trigger language plpgsql as $$
begin
  raise exception 'La bitacora de auditoria es inmutable: no permite UPDATE, DELETE ni TRUNCATE';
end;
$$;
