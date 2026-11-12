#!/usr/bin/env node
/**
 * Aprovisiona la base de RaicesMX en Supabase.
 *
 *   node scripts/db-setup.mjs             aplica migraciones + datos de prueba
 *   node scripts/db-setup.mjs --verificar solo imprime el estado actual
 *
 * Toma la cadena de conexión de SUPABASE_DB_URL (.env.local). Usa el rol postgres,
 * que es el único que puede crear tablas; la app en tiempo de ejecución usa la
 * secret key y nunca esta cadena.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const RAÍZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CARPETA_MIGRACIONES = path.join(RAÍZ, 'supabase', 'migrations');
const SOLO_VERIFICAR = process.argv.includes('--verificar');

const TABLAS = [
  'usuarios', 'perfiles_productor', 'verificaciones_productor', 'perfiles_comprador',
  'productos', 'fichas_origen', 'sellos_originalidad', 'pedidos', 'detalles_pedido',
  'contratos_b2b', 'pagos', 'liquidaciones', 'seguimiento_pedidos', 'calificaciones',
  'bitacora_auditoria', 'notificaciones', 'reportes',
];

function cargarEnvLocal() {
  const archivo = path.join(RAÍZ, '.env.local');
  if (!existsSync(archivo)) return;
  const texto = readFileSync(archivo, 'utf8');
  for (const línea of texto.split(/\r?\n/)) {
    const limpia = línea.trim();
    if (!limpia || limpia.startsWith('#')) continue;
    const corte = limpia.indexOf('=');
    if (corte === -1) continue;
    const clave = limpia.slice(0, corte).trim();
    let valor = limpia.slice(corte + 1).trim();
    if ((valor.startsWith('"') && valor.endsWith('"')) || (valor.startsWith("'") && valor.endsWith("'"))) {
      valor = valor.slice(1, -1);
    }
    if (!(clave in process.env)) process.env[clave] = valor;
  }
}

function ordenarArchivos(nombres) {
  return nombres.filter((n) => n.endsWith('.sql')).sort((a, b) => a.localeCompare(b, 'en'));
}

async function leerSql(archivo) {
  return readFile(archivo, 'utf8');
}

const tieneTransaccionPropia = (sql) => /^\s*begin\s*;/im.test(sql);

async function aplicarArchivo(cliente, ruta, nombre) {
  const sql = await leerSql(ruta);
  try {
    if (tieneTransaccionPropia(sql)) {
      await cliente.query(sql);
    } else {
      await cliente.query('begin');
      await cliente.query(sql);
      await cliente.query('commit');
    }
    await cliente.query('insert into privado.migraciones_aplicadas (nombre) values ($1)', [nombre]);
    console.log(`  ✓ ${nombre}`);
  } catch (error) {
    if (!tieneTransaccionPropia(sql)) await cliente.query('rollback').catch(() => {});
    console.error(`  ✗ ${nombre}`);
    throw error;
  }
}

async function main() {
  cargarEnvLocal();

  const cadena = process.env.SUPABASE_DB_URL;
  if (!cadena) {
    console.error('Falta SUPABASE_DB_URL. Cópiala de Supabase → Connect → Session pooler.');
    process.exit(1);
  }

  const cliente = new pg.Client({ connectionString: cadena, ssl: { rejectUnauthorized: false } });
  await cliente.connect();
  console.log('Conectado a Supabase.\n');

  await cliente.query('create schema if not exists privado');
  await cliente.query(`
    create table if not exists privado.migraciones_aplicadas (
      nombre      text primary key,
      aplicada_en timestamptz not null default now()
    )
  `);

  if (!SOLO_VERIFICAR) {
    const { rows: aplicadas } = await cliente.query('select nombre from privado.migraciones_aplicadas');
    const hechas = new Set(aplicadas.map((f) => f.nombre));

    console.log('Migraciones:');
    const migraciones = ordenarArchivos(await readdir(CARPETA_MIGRACIONES));
    for (const nombre of migraciones) {
      if (hechas.has(`migrations/${nombre}`)) {
        console.log(`  · ${nombre} (ya aplicada)`);
        continue;
      }
      await aplicarArchivo(cliente, path.join(CARPETA_MIGRACIONES, nombre), `migrations/${nombre}`);
    }

    console.log('\nDatos de prueba:');
    const semillas = ordenarArchivos(await readdir(path.join(RAÍZ, 'supabase')))
      .filter((n) => n === 'seed.sql' || n.startsWith('seed_'))
      .sort((a, b) => (a === 'seed.sql' ? -1 : b === 'seed.sql' ? 1 : a.localeCompare(b, 'en')));
    for (const nombre of semillas) {
      if (hechas.has(`seed/${nombre}`)) {
        console.log(`  · ${nombre} (ya cargado)`);
        continue;
      }
      await aplicarArchivo(cliente, path.join(RAÍZ, 'supabase', nombre), `seed/${nombre}`);
    }
  }

  console.log('\nEstado de la base:');
  let total = 0;
  for (const tabla of TABLAS) {
    const { rows } = await cliente.query(`select count(*)::int as n from public.${tabla}`);
    total += rows[0].n;
    console.log(`  ${tabla.padEnd(26)} ${String(rows[0].n).padStart(5)} filas`);
  }
  console.log(`  ${'TOTAL'.padEnd(26)} ${String(total).padStart(5)} filas`);

  const { rows: vistas } = await cliente.query(`
    select table_name
    from information_schema.views
    where table_schema = 'public'
    order by table_name
  `);
  console.log(`\nVistas: ${vistas.map((v) => v.table_name).join(', ')}`);

  const { rows: enums } = await cliente.query(`
    select count(distinct t.typname)::int as n
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
  `);
  console.log(`Tipos enumerados: ${enums[0].n}`);

  await cliente.end();
}

main().catch((error) => {
  console.error('\nERROR:', error.message);
  if (error.detail) console.error('Detalle:', error.detail);
  if (error.hint) console.error('Sugerencia:', error.hint);
  if (error.position) console.error('Posición:', error.position);
  process.exit(1);
});
