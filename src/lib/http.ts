import { NextResponse } from 'next/server';
import { z } from 'zod';

export class ErrorNegocio extends Error {
  constructor(
    public status: number,
    message: string,
    public detalles?: unknown,
  ) {
    super(message);
  }
}

// Envuelve cada Route Handler para que todos respondan errores con el mismo formato
export async function manejar<T>(fn: () => Promise<T>, status = 200) {
  try {
    return NextResponse.json(await fn(), { status });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', campos: z.flattenError(e).fieldErrors },
        { status: 422 },
      );
    }
    if (e instanceof ErrorNegocio) {
      return NextResponse.json({ error: e.message, detalles: e.detalles }, { status: e.status });
    }
    console.error(e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

export const ipOrigen = (req: Request) =>
  req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null;
