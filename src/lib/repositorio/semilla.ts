import type { FichaOrigen, Producto, Productor } from '../../types';

// Datos del piloto en Puebla. Son los mismos que carga supabase/seed.sql,
// así el modo demo y la base real muestran la misma información.

const fecha = '2026-10-15T10:00:00.000Z';
const uid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const USUARIOS_BASE = [
  { id: uid(1), correo: 'rosa.tellez@raicesmx.mx', nombre_completo: 'Rosa Elena Téllez Romero', telefono: '2221456790', rol: 'promotor' },
  { id: uid(2), correo: 'daniela.ortiz@correo.mx', nombre_completo: 'Daniela Ortiz Méndez', telefono: '2223348812', rol: 'comprador_b2c' },
] as const;

export const PRODUCTORES: Productor[] = [
  {
    id: uid(11), nombre_completo: 'María Francisca Cruz Hernández', correo: 'telar.masehual@correo.mx', telefono: '2333310021',
    nombre_taller: 'Telar Masehual', identificacion_oficial: 'CUHF780412MPLRRR05', comunidad: 'Cuetzalan del Progreso',
    estado: 'Puebla', pueblo_originario: 'Nahua', tecnica_principal: 'Telar de cintura', estado_verificacion: 'aprobado', created_at: fecha,
  },
  {
    id: uid(12), nombre_completo: 'Juan Carlos Rodríguez Lima', correo: 'alfareria.rodriguez@correo.mx', telefono: '9534410982',
    nombre_taller: 'Alfarería Mixteca Rodríguez', identificacion_oficial: 'ROLJ850907HPLDMN02', comunidad: 'Acatlán de Osorio',
    estado: 'Puebla', pueblo_originario: 'Mixteco', tecnica_principal: 'Barro bruñido', estado_verificacion: 'aprobado', created_at: fecha,
  },
  {
    id: uid(13), nombre_completo: 'Guadalupe Martínez Ramos', correo: 'palma.ngigua@correo.mx', telefono: '2383127745',
    nombre_taller: 'Palma Ngigua', identificacion_oficial: 'MARG690224MPLRMD08', comunidad: 'San Gabriel Chilac',
    estado: 'Puebla', pueblo_originario: 'Popoloca', tecnica_principal: 'Tejido de palma', estado_verificacion: 'aprobado', created_at: fecha,
  },
  {
    id: uid(14), nombre_completo: 'Tomás Vázquez Bonilla', correo: 'lana.hueyapan@correo.mx', telefono: '2313325561',
    nombre_taller: 'Taller Hueyapan', identificacion_oficial: 'VABT810315HPLZNM04', comunidad: 'Hueyapan',
    estado: 'Puebla', pueblo_originario: 'Nahua', tecnica_principal: 'Telar de pedal', estado_verificacion: 'aprobado', created_at: fecha,
  },
  {
    id: uid(15), nombre_completo: 'Ernestina Castillo Flores', correo: 'madera.chignahuapan@correo.mx', telefono: '7971123094',
    nombre_taller: 'Madera Viva', identificacion_oficial: 'CAFE900118MPLSLR01', comunidad: 'Chignahuapan',
    estado: 'Puebla', pueblo_originario: 'Nahua', tecnica_principal: 'Tallado en madera', estado_verificacion: 'pendiente', created_at: fecha,
  },
  {
    id: uid(16), nombre_completo: 'Aurelia Bautista Ruiz', correo: 'tapetes.teotitlan@correo.mx', telefono: '9515240318',
    nombre_taller: 'Tapetes Gueendxi', identificacion_oficial: 'BARA750630MOCTZR09', comunidad: 'Teotitlán del Valle',
    estado: 'Oaxaca', pueblo_originario: 'Zapoteco', tecnica_principal: 'Telar de pedal', estado_verificacion: 'aprobado', created_at: fecha,
  },
];

// La verificación previa de los productores aprobados la hizo la promotora del piloto
export const VERIFICACIONES = PRODUCTORES.filter((p) => p.estado_verificacion === 'aprobado').map((p, i) => ({
  id: uid(301 + i),
  productor_id: p.id,
  promotor_id: uid(1),
  estado: 'aprobado' as const,
  observaciones: `Visita al taller en ${p.comunidad}: identidad y proceso artesanal comprobados`,
}));

interface PiezaSemilla {
  producto: Omit<Producto, 'activo' | 'created_at'>;
  ficha: Omit<FichaOrigen, 'id' | 'producto_id' | 'nombre_productor' | 'comunidad' | 'estado' | 'pueblo_originario' | 'precio_registrado'>;
  folio: string;
}

const FOTO = { textil: '/piezas/textiles.svg', barro: '/piezas/ceramica.svg', palma: '/piezas/palma.svg' };

const PIEZAS_BASE: PiezaSemilla[] = [
  {
    producto: { id: uid(101), productor_id: uid(11), nombre: 'Huipil de gala de Cuetzalan', descripcion: 'Huipil blanco con brocado de flores y aves en hilo de colores.', categoria: 'Textiles', precio_unitario: 2800, stock: 2 },
    ficha: { tecnica: 'Telar de cintura', materiales: 'Algodón y artisela', tiempo_elaboracion: '6 semanas', fotografias_urls: [FOTO.textil], historia_pieza: 'Las figuras de la greca representan la milpa y los pájaros de la sierra nororiental.' },
    folio: 'RMX-PUE-2026-3F9A1C',
  },
  {
    producto: { id: uid(102), productor_id: uid(11), nombre: 'Quechquémitl bordado', descripcion: 'Prenda tradicional de hombros con bordado de punto de cruz.', categoria: 'Textiles', precio_unitario: 950, stock: 4 },
    ficha: { tecnica: 'Telar de cintura', materiales: 'Algodón y estambre', tiempo_elaboracion: '3 semanas', fotografias_urls: [FOTO.textil], historia_pieza: 'Se usa sobre el huipil en las fiestas patronales de Cuetzalan.' },
    folio: 'RMX-PUE-2026-7B20E4',
  },
  {
    producto: { id: uid(103), productor_id: uid(12), nombre: 'Olla de barro bruñido', descripcion: 'Olla de barro rojo pulida a mano con piedra de río.', categoria: 'Cerámica y barro', precio_unitario: 800, stock: 3 },
    ficha: { tecnica: 'Barro bruñido', materiales: 'Barro rojo, engobe natural', tiempo_elaboracion: '10 días', fotografias_urls: [FOTO.barro], historia_pieza: 'La quema se hace a cielo abierto con leña de mezquite, como enseñaron los abuelos.' },
    folio: 'RMX-PUE-2026-A15D09',
  },
  {
    producto: { id: uid(104), productor_id: uid(12), nombre: 'Árbol de la vida mixteco', descripcion: 'Escultura policromada con escenas de la vida en la Mixteca.', categoria: 'Cerámica y barro', precio_unitario: 1500, stock: 1 },
    ficha: { tecnica: 'Modelado y policromía', materiales: 'Barro, pigmentos minerales, alambre', tiempo_elaboracion: '2 semanas', fotografias_urls: [FOTO.barro], historia_pieza: 'Cada rama cuenta una parte de la historia familiar del taller.' },
    folio: 'RMX-PUE-2026-C4E871',
  },
  {
    producto: { id: uid(105), productor_id: uid(13), nombre: 'Tenate de palma natural', descripcion: 'Canasto con tapa para guardar tortillas.', categoria: 'Palma y madera', precio_unitario: 350, stock: 10 },
    ficha: { tecnica: 'Tejido de palma', materiales: 'Palma de soyate', tiempo_elaboracion: '4 días', fotografias_urls: [FOTO.palma], historia_pieza: 'La palma se corta en luna menguante y se deja secar al sol una semana.' },
    folio: 'RMX-PUE-2026-5D6A2F',
  },
  {
    producto: { id: uid(106), productor_id: uid(13), nombre: 'Sombrero de palma tejido', descripcion: 'Sombrero de ala ancha tejido en trenza fina.', categoria: 'Palma y madera', precio_unitario: 420, stock: 6 },
    ficha: { tecnica: 'Tejido de palma', materiales: 'Palma de soyate teñida', tiempo_elaboracion: '5 días', fotografias_urls: [FOTO.palma], historia_pieza: 'El tejido en trenza es una tradición ngigua del valle de Tehuacán.' },
    folio: 'RMX-PUE-2026-91B3E7',
  },
  {
    producto: { id: uid(107), productor_id: uid(14), nombre: 'Rebozo de lana de Hueyapan', descripcion: 'Rebozo de lana teñido con grana cochinilla y añil.', categoria: 'Textiles', precio_unitario: 1800, stock: 2 },
    ficha: { tecnica: 'Telar de pedal', materiales: 'Lana de borrego, grana cochinilla, añil', tiempo_elaboracion: '1 mes', fotografias_urls: [FOTO.textil], historia_pieza: 'La lana se hila a mano con malacate antes de pasar al telar.' },
    folio: 'RMX-PUE-2026-0E8F44',
  },
  {
    producto: { id: uid(108), productor_id: uid(16), nombre: 'Tapete zapoteco de grecas', descripcion: 'Tapete de lana con grecas de Mitla.', categoria: 'Textiles', precio_unitario: 3200, stock: 1 },
    ficha: { tecnica: 'Telar de pedal', materiales: 'Lana, tintes de pericón y musgo', tiempo_elaboracion: '5 semanas', fotografias_urls: [FOTO.textil], historia_pieza: 'Las grecas se inspiran en los muros de la zona arqueológica de Mitla.' },
    folio: 'RMX-OAX-2026-6C2D19',
  },
];

// Completa los campos de la ficha que vienen del productor y del precio
export const PIEZAS = PIEZAS_BASE.map((p, i) => {
  const productor = PRODUCTORES.find((x) => x.id === p.producto.productor_id)!;
  const ficha: FichaOrigen = {
    ...p.ficha,
    id: uid(201 + i),
    producto_id: p.producto.id,
    nombre_productor: productor.nombre_completo,
    comunidad: productor.comunidad,
    estado: productor.estado,
    pueblo_originario: productor.pueblo_originario,
    precio_registrado: p.producto.precio_unitario,
  };
  const producto: Producto = { ...p.producto, activo: true, created_at: fecha };
  return { producto, ficha, folio: p.folio, sello_id: uid(401 + i) };
});
