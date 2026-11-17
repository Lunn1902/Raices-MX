import { NextResponse } from 'next/server';
import { supabaseServidor } from '@/lib/supabase/servidor';

export async function POST(req: Request) {
  const body = await req.json();
  const sb = supabaseServidor();
  const { data, error } = await sb.from('usuarios').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
