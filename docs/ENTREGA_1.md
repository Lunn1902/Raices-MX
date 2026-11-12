# Entrega 1 · Modelo E-R implementado y 5 casos de uso

**Proyecto:** RaicesMX — Plataforma de comercialización directa para productores originarios
**Equipo 10 · Facultad de Ciencias de la Computación, BUAP · Proyecto I+D · Otoño 2026**

| Integrante | Matrícula |
| :--- | :--- |
| Ángel Armando Carreño González | 202108258 |
| Miguel Ángel Hernández Sánchez | 202123950 |
| Alan Espinoza Flores | 202260523 |
| Luis Ángel Zacarías Ávila | 202166331 |
| Adrián Torres Rodríguez | 202163210 |

**Base de datos:** proyecto `raicesmx` en Supabase (`dfkmcruqnmytzbprgave`, región `ca-central-1`)
**Aplicación:** Next.js 16 + React 19 + TypeScript, sin desplegar (solo local + base en la nube)
**Fecha:** 11 de noviembre de 2026

---

## 1. Qué se entregó

1. **Modelo E-R implementado** en PostgreSQL: 17 tablas, 10 tipos enumerados, 2 vistas, 1 función transaccional y 8 triggers.
2. **Cinco casos de uso funcionando** contra la base real, no en memoria:

| CU | Caso de uso | Actor |
| :--- | :--- | :--- |
| CU-01 | Registro del productor y verificación por el promotor | Productor · Promotor |
| CU-04 | Publicar una pieza con ficha de origen y sello QR | Productor |
| CU-06 | Verificar el sello de origen sin crear cuenta | Comprador / público |
| CU-07 | Catálogo con filtros y mapa de procedencia | Comprador |
| CU-08 | Carrito y compra con reparto 90/10 | Comprador B2C |

3. **Aprovisionamiento reproducible**: `npm run db:setup` aplica las migraciones y los datos de prueba; `npm run db:verify` muestra el estado.
4. **Documentación**: `docs/MODELO_ER.md` (diagrama, relaciones y diccionario) y este documento con la trazabilidad y las evidencias.

---

## 2. Modelo E-R

### 2.1 Panorama

Diagrama: [`modelo-er.png`](modelo-er.png) · [`modelo-er.svg`](modelo-er.svg) · fuente editable [`modelo-er.mmd`](modelo-er.mmd) · tema [`mermaid-theme.json`](mermaid-theme.json) (verde milpa `#2f6b3b`, fondo alabastro `#f2f0eb`)

| Dominio | Tablas |
| :--- | :--- |
| Usuarios y verificación | `usuarios`, `perfiles_productor`, `verificaciones_productor`, `perfiles_comprador` |
| Catálogo y procedencia | `productos`, `fichas_origen`, `sellos_originalidad` |
| Pedidos, pagos y acuerdos | `pedidos`, `detalles_pedido`, `contratos_b2b`, `pagos`, `liquidaciones` |
| Seguimiento y control | `seguimiento_pedidos`, `calificaciones`, `notificaciones`, `reportes`, `bitacora_auditoria` |

La cadena central del negocio:

```
productor ──publica──▶ producto ──tiene 1:1──▶ ficha de origen ──certificada por──▶ sello QR
                                                        │
comprador ──compra──▶ pedido ──contiene──▶ detalle ─────┘
                        │
                        ├── pago (tarjeta / SPEI)
                        ├── liquidación (90 % productor / 10 % plataforma)
                        └── seguimiento del estado
```

### 2.2 Trazabilidad con el diagrama de clases UML

El diagrama (`RaicesMX_Diagrama_Clases_UML_V1.pdf`) tiene **24 clases** (el recuadro `Administrador` aparece en dos hojas). Todas tienen correspondencia en la base:

| Clase UML | Implementación | Tipo |
| :--- | :--- | :--- |
| `Usuario` (abstracta) | `usuarios` + enum `rol_usuario` | Tabla |
| `Productor` | `perfiles_productor` (PK compartida con `usuarios`) | Tabla |
| `Comprador` (abstracta) | `perfiles_comprador` + rol | Tabla |
| `CompradorB2C` | `usuarios.rol = 'comprador_b2c'` | Especialización por rol |
| `CompradorB2B` | `usuarios.rol = 'comprador_b2b'` + `perfiles_comprador.nombre_empresa` | Especialización por rol |
| `Promotor` | `usuarios.rol = 'promotor'` | Especialización por rol |
| `Administrador` | `usuarios.rol = 'admin'` | Especialización por rol |
| `Producto` | `productos` | Tabla |
| `FichaOrigen` | `fichas_origen` (1:1, 9 campos obligatorios) | Tabla |
| `SelloOriginalidad` | `sellos_originalidad` (folio + HMAC-SHA256) | Tabla |
| `VerificacionProductor` | `verificaciones_productor` | Tabla |
| `Pedido` (abstracta) | `pedidos` + enum `tipo_pedido` | Tabla |
| `PedidoB2C` | `pedidos.tipo = 'B2C'` | Especialización |
| `PedidoB2B` | `pedidos.tipo = 'B2B'` + `contratos_b2b` | Especialización |
| `DetallePedido` | `detalles_pedido` | Tabla |
| `Pago` | `pagos` | Tabla |
| `Comision` | `pedidos.monto_comision` y `liquidaciones.porcentaje_comision` | Columnas calculadas |
| `Liquidacion` | `liquidaciones` | Tabla |
| `ContratoB2B` | `contratos_b2b` (anticipo 30 / saldo 70) | Tabla |
| `SeguimientoPedido` | `seguimiento_pedidos` | Tabla |
| `Calificacion` | `calificaciones` (1–5, una por pedido) | Tabla |
| `Notificacion` | `notificaciones` | Tabla (migración 003) |
| `Reporte` | `reportes` | Tabla (migración 003) |
| `BitacoraAuditoria` | `bitacora_auditoria` (solo INSERT) | Tabla |

**Decisión de diseño:** `Comision` no se guarda como entidad aparte porque siempre se deriva del pedido (10 % B2C / 5 % B2B). Se conserva el monto y el porcentaje en `pedidos` y el desglose completo en `liquidaciones`, con un `CHECK` que obliga a que productor + comisión sumen lo vendido.

### 2.3 Reglas que la base defiende por sí sola

| Regla | Dónde vive |
| :--- | :--- |
| La ficha de origen exige los 9 campos | `CHECK` por columna en `fichas_origen` |
| Solo un productor aprobado publica | Trigger `trg_productos_productor_aprobado` |
| Productor + comisión = subtotal − descuento | `CHECK ck_pedido_reparto` |
| B2B solo de 5 a 50 piezas | `CHECK ck_pedido_lote` |
| Compra concurrente segura | Función `crear_pedidos_b2c` con `FOR UPDATE` |
| La bitácora es inmutable | Triggers BEFORE UPDATE/DELETE/TRUNCATE |
| Búsqueda sin acentos | Función `sin_acentos` + vista `vista_catalogo` |
| Historial y promedio automáticos | Triggers de `seguimiento_pedidos` y `calificaciones` |

---

## 3. Los cinco casos de uso

### CU-01 · Registro y verificación del productor

- **Pantallas:** `/registro-productor` y `/promotor`
- **API:** `POST /api/v1/productores` · `PATCH /api/v1/productores/:id/verificacion`
- **Archivos:** `src/modules/usuarios/servicio.ts`, `src/lib/validadores.ts`, `src/lib/repositorio/supabase.ts`
- **Qué hace:** valida CURP o clave de elector, crea `usuarios` + `perfiles_productor` en estado `pendiente` y deja que el promotor apruebe o rechace. Queda registro en `verificaciones_productor` y en la bitácora.
- **Evidencia:** productor `9da68be6-cce2-4a44-9a72-0c8509a75a80` creado en `pendiente` y aprobado después; el listado de aprobados pasó de 5 a 6.

### CU-04 · Publicar pieza con ficha de origen y QR

- **Pantalla:** `/productor/publicar`
- **API:** `POST /api/v1/productos` (`multipart/form-data` con la fotografía)
- **Archivos:** `src/modules/catalogo/servicio.ts`, `src/modules/sello-qr/firma.ts`, `src/modules/sello-qr/servicio.ts`
- **Qué hace:** exige los 9 campos, sube la foto al bucket `fotos-piezas`, inserta producto + ficha + sello en una sola operación y devuelve el QR y la URL pública de verificación.
- **Evidencia:** producto `1fb66f12-d382-4c05-ba3c-d56fd13e120f`, ficha `6d1294f4-c38e-4d06-b193-89932e941e81`, folio **RMX-PUE-2026-1EA2E8**, firma `9cc9d8d4…61da`, foto en `https://dfkmcruqnmytzbprgave.supabase.co/storage/v1/object/public/fotos-piezas/…png`.

### CU-06 · Verificar el sello sin cuenta

- **Pantalla:** `/verificar/[folio]`
- **API:** `GET /api/v1/sello-qr/:folio?sig=` (público)
- **Archivos:** `src/modules/sello-qr/servicio.ts`
- **Qué hace:** recalcula el HMAC con el payload de la ficha y compara con la firma guardada. Si alguien altera la pieza, el sello deja de verificar.
- **Evidencia:** `RMX-PUE-2026-3F9A1C` (semilla) y `RMX-PUE-2026-1EA2E8` (recién emitido) responden `verificado: true`, etiqueta “Origen verificado”.

### CU-07 · Catálogo con filtros y mapa

- **Pantalla:** `/catalogo`
- **API:** `GET /api/v1/productos?q=&categoria=&estado=&pueblo=&tecnica=&min=&max=` y `GET /api/v1/mapa`
- **Archivos:** `src/modules/catalogo/servicio.ts`, `src/modules/catalogo/filtros.ts`, `src/lib/repositorio/supabase.ts`
- **Qué hace:** lee de `vista_catalogo` (solo piezas activas, con stock y de productores aprobados) y agrupa por estado en `vista_mapa_procedencia`.
- **Evidencia:** mapa `Puebla 4 productores / 7 piezas` y `Oaxaca 1 / 1`; catálogo con 8 piezas antes de la prueba.

### CU-08 · Carrito y compra con reparto 90/10

- **Pantalla:** `/comprador/carrito`
- **API:** `POST /api/v1/pedidos/cotizacion` y `POST /api/v1/pedidos`
- **Archivos:** `src/modules/pedidos-b2c/servicio.ts`, `src/modules/comisiones/calculo.ts`
- **Qué hace:** cotiza con precios de la base (nunca con los del cliente), agrupa por productor, ejecuta `crear_pedidos_b2c` y devuelve el desglose. La función descuenta stock, crea pago, liquidación, seguimiento y bitácora en una transacción.
- **Evidencia (compra real):**

| Concepto | Valor |
| :--- | ---: |
| Folio | `PED-2026-C1C0A80D` |
| Subtotal | $350.00 |
| Comisión plataforma (10 %) | $35.00 |
| Neto del productor (90 %) | $315.00 |
| Envío | $150.00 |
| Total cobrado | $500.00 |
| Stock del tenate | 10 → 9 |

---

## 4. Seguridad y acceso a datos

| Decisión | Por qué |
| :--- | :--- |
| RLS activo en las 17 tablas, sin políticas para `anon` | La llave pública no puede leer ni escribir aunque se filtre |
| La app usa la secret key solo en el servidor | El navegador nunca habla directo con Postgres |
| `revoke all` sobre vistas y tablas nuevas | Cierra el acceso por PostgREST a `anon` y `authenticated` |
| Bitácora inmutable por trigger | Cumple RNF-13 y sirve como evidencia de auditoría |
| Folio y firma HMAC se generan en el servidor | El cliente no puede falsificar un sello |

---

## 5. Cómo reproducirlo

```bash
git clone https://github.com/Lunn1902/Raices-MX.git
cd Raices-MX
npm install
cp .env.example .env.local     # llenar llaves y SUPABASE_DB_URL
npm run db:setup               # migraciones 001 → 002 → 003 y datos de prueba
npm run dev                    # http://localhost:3000
npm test                       # 26 pruebas
```

---

## 6. Alcance de esta entrega

**Incluido:** las 17 tablas, las reglas de integridad, los 5 casos de uso y sus pantallas, la verificación del sello y el reparto del dinero.

**Fuera de alcance (siguiente entrega):**

| Pendiente | Motivo |
| :--- | :--- |
| CU-02 Login con Supabase Auth | Hoy promotor y comprador son usuarios fijos del piloto; la columna `usuarios.auth_id` ya está lista |
| CU-09 Lotes B2B (pantalla y contrato PDF) | Tablas y cálculo listos; falta la interfaz |
| CU-10 Panel de liquidaciones | La tabla se llena con cada compra; falta la pantalla |
| Pantallas de notificaciones y reportes | Las tablas existen (003); su interfaz no está en los 5 CU |
| Pasarela de pago real | Pago simulado en esta versión |
| Despliegue | Se pidió explícitamente no desplegar en esta entrega |
