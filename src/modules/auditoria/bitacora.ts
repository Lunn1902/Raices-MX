import { repo } from '@/lib/repositorio';
import type { EventoBitacora } from '@/types';

// RNF-13: toda acción sensible deja rastro. La tabla tiene trigger que impide UPDATE/DELETE.
export const auditar = (evento: EventoBitacora) => repo().registrarBitacora(evento);
