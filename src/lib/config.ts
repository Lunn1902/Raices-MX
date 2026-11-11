// Configuración del servidor. Sin variables de Supabase la app arranca en modo demo
// con los datos semilla en memoria, para poder navegar los 5 casos de uso de inmediato.

const SECRETO_DEMO = 'raicesmx-dev-secret';

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
};

export const modoDemo = () => !config.supabaseUrl || !config.supabaseServiceKey;

export function secretoHmac(): string {
  const secreto = process.env.QR_HMAC_SECRET;
  if (secreto) return secreto;
  // con base de datos real no se permite firmar con el secreto público de desarrollo
  if (!modoDemo() && process.env.NODE_ENV === 'production') {
    throw new Error('Falta QR_HMAC_SECRET en el servidor');
  }
  return SECRETO_DEMO;
}

// Identidades fijas del piloto mientras se integra Supabase Auth (CU-02)
export const USUARIOS_DEMO = {
  promotor: '00000000-0000-4000-8000-000000000001',
  comprador: '00000000-0000-4000-8000-000000000002',
};
