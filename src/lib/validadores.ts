import { z } from 'zod';
import { NOMBRES_ESTADOS } from '@/lib/estados';
import { CATEGORIAS } from '@/types';

const requerido = (campo: string) => z.string().trim().min(1, `${campo} es obligatorio`);

const CURP = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
const CLAVE_ELECTOR_INE = /^[A-Z]{6}\d{8}[HM]\d{3}$/;

const estadoMx = z.enum(NOMBRES_ESTADOS as [string, ...string[]], { message: 'Selecciona un estado válido' });

// CU-01
export const esquemaRegistroProductor = z.object({
  nombre_completo: z.string().trim().min(3, 'Escribe el nombre completo'),
  correo: z.email('Correo no válido'),
  telefono: z.string().trim().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  nombre_taller: requerido('El nombre del taller'),
  identificacion_oficial: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => CURP.test(v) || CLAVE_ELECTOR_INE.test(v), 'Ingresa una CURP o clave de elector (INE) válida'),
  comunidad: requerido('La comunidad'),
  estado: estadoMx,
  pueblo_originario: requerido('El pueblo originario'),
  tecnica_principal: requerido('La técnica'),
});
export type RegistroProductor = z.infer<typeof esquemaRegistroProductor>;

export const esquemaVerificacion = z.object({
  estado: z.enum(['aprobado', 'rechazado']),
  observaciones: z.string().trim().max(500).optional(),
});

// CU-04: los 9 campos de la ficha de origen (la fotografía se valida aparte)
export const esquemaFichaOrigen = z.object({
  productor_id: z.uuid('Selecciona el productor'),
  nombre: requerido('El nombre de la pieza'),
  descripcion: z.string().trim().max(1000).optional(),
  categoria: z.enum(CATEGORIAS, { message: 'Selecciona una categoría' }),
  stock: z.coerce.number().int().min(1, 'Mínimo 1 pieza').max(999),
  nombre_productor: requerido('El nombre del productor'),
  comunidad: requerido('La comunidad'),
  estado: estadoMx,
  pueblo_originario: requerido('El pueblo originario'),
  tecnica: requerido('La técnica artesanal'),
  materiales: requerido('Los materiales'),
  tiempo_elaboracion: requerido('El tiempo de elaboración'),
  precio: z.coerce.number().positive('El precio debe ser mayor a 0').max(999999),
  historia_pieza: z.string().trim().max(2000).optional(),
});
export type DatosFichaOrigen = z.infer<typeof esquemaFichaOrigen>;

export const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_FOTO_BYTES = 5 * 1024 * 1024;

export function errorFoto(foto: unknown): string | null {
  if (!(foto instanceof File) || foto.size === 0) return 'Agrega al menos una fotografía de la pieza';
  if (!TIPOS_FOTO.includes(foto.type)) return 'La fotografía debe ser JPG, PNG o WEBP';
  if (foto.size > MAX_FOTO_BYTES) return 'La fotografía no debe pesar más de 5 MB';
  return null;
}

// CU-08
export const esquemaCarrito = z.object({
  items: z
    .array(z.object({ producto_id: z.uuid(), cantidad: z.number().int().min(1).max(50) }))
    .min(1, 'El carrito está vacío')
    .max(30),
});

export const esquemaCompra = esquemaCarrito.extend({
  direccion_entrega: z.string().trim().min(10, 'Escribe la dirección completa de entrega'),
});
