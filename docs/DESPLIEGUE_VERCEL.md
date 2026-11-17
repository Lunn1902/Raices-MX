# Despliegue automático en Vercel

El repositorio `https://github.com/arcarreno/RaicesMX.git` está listo para desplegarse en Vercel.

## 1. Conectar el repositorio

1. Entra a https://vercel.com y haz clic en **Add New → Project**.
2. Importa el repo `arcarreno/RaicesMX`.
3. Vercel detecta automáticamente **Next.js** — no cambies el framework ni los comandos de build.
4. Haz clic en **Deploy**.

## 2. Variables de entorno (IMPORTANTE)

Antes de desplegar (o después, y luego haces **Redeploy**), ve a **Settings → Environment Variables** y agrega estas 5 variables para **Production**, **Preview** y **Development**:

| Variable | Valor |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dfkmcruqnmytzbprgave.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (copiar de `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | (copiar de `.env.local`) |
| `QR_HMAC_SECRET` | (copiar de `.env.local`) |
| `NEXT_PUBLIC_APP_URL` | **La URL que te dé Vercel**, por ejemplo `https://raicesmx-xxx.vercel.app` (sin barra final) |

> Obtén los valores exactos de tu archivo local `.env.local`. NUNCA los subas a GitHub.

## 3. La URL del QR (clave)

Los códigos QR se generan con `NEXT_PUBLIC_APP_URL`. Mientras esa variable sea `http://localhost:3000`, los QR solo funcionan en tu máquina.

**Configura `NEXT_PUBLIC_APP_URL` con la URL real de Vercel y luego haz un Redeploy.** Los sellos ya emitidos siguen siendo válidos porque la firma HMAC no depende de la URL — solo cambia el enlace que contiene el QR.

Si quieres regenerar el PNG de un QR con la nueva URL, basta con pedirlo de nuevo:

```
https://TU-DOMINIO.vercel.app/api/v1/sello-qr/RMX-PUE-2026-C6D2CD/png
```

## 4. Verificación

Después del deploy:

- `https://TU-DOMINIO.vercel.app/` → inicio con el hero y las piezas con fotos reales
- `https://TU-DOMINIO.vercel.app/catalogo` → 9 piezas con imágenes únicas
- Escanea un QR desde el celular → debe abrir `https://TU-DOMINIO.vercel.app/verificar/...?sig=...` y mostrar "Origen verificado"

## Nota

El despliegue automático se activa con cada `git push` a `main`. El commit actual es `1f175dc`.
