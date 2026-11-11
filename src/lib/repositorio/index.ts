import { modoDemo } from '@/lib/config';
import { repositorioMemoria } from './memoria';
import { repositorioSupabase } from './supabase';
import type { Repositorio } from './tipos';

export const repo = (): Repositorio => (modoDemo() ? repositorioMemoria : repositorioSupabase);
export type { Repositorio };
