# RaicesMX

Proyecto de I+D del **Equipo 10** · Facultad de Ciencias de la Computación, BUAP · Otoño 2026

- Miguel Ángel Hernández Sánchez
- Ángel Armando Carreño González
- Alan Espinoza Flores
- Luis Ángel Zacarías Ávila
- Adrián Torres Rodríguez

---

## ¿Qué es esto?

RaicesMX es una página para que los productores originarios (artesanos de Cuetzalan, Acatlán, Tehuacán, etc.) vendan directo, sin intermediarios. Lo que la hace diferente:

- Cada pieza trae una **ficha de origen** con 9 datos obligatorios (quién la hizo, de dónde es, qué técnica usó, cuánto tardó...).
- Cada pieza tiene un **QR firmado** que cualquiera puede escanear para comprobar que es auténtica. Si alguien falsifica o modifica el QR, el sistema lo detecta.
- En cada venta, el **90% es para el productor** y solo el 10% para la plataforma, y eso se le muestra al comprador antes de pagar.

Equipo, aquí les dejo cómo está todo, cómo correrlo y qué nos falta.

### Si es tu primera vez aquí, haz esto en orden

1. Instala [Node.js](https://nodejs.org) (la versión LTS) si no lo tienes.
2. Clona el repo y córrelo con los comandos de [Cómo correrlo](#cómo-correrlo-5-minutos). Funciona sin configurar nada.
3. Recorre los 5 casos de uso con la guía de [Cómo probar cada caso de uso](#cómo-probar-cada-caso-de-uso) para ver cómo funciona todo.
4. Lee la parte de [Cómo nos repartimos](#cómo-nos-repartimos-para-explicarlo) y ubica qué archivos te tocan.
5. Revisa [Lo que falta](#hasta-dónde-me-quedé) y avísenme en el grupo qué va a tomar cada quien.

La cuenta de Supabase la creamos después, juntos; no hace falta para empezar.

---

## Lo que pide la primera entrega

1. **Modelo E-R implementado.** Está todo en `docs/MODELO_ER.md` (diagrama, explicación de relaciones y diccionario de datos) y en `supabase/migrations/` (el SQL real).
2. **5 casos de uso funcionando.** Elegí los 5 que juntos cubren el flujo completo, desde que el artesano se registra hasta que alguien le compra:

| CU | Qué hace | Dónde se ve |
| :--- | :--- | :--- |
| CU-01 | El productor se registra y un promotor lo verifica | `/registro-productor` y `/promotor` |
| CU-04 | El productor publica una pieza con su ficha y se genera el QR | `/productor/publicar` |
| CU-06 | Cualquiera verifica el QR sin cuenta | `/verificar/[folio]` |
| CU-07 | Catálogo con filtros y mapa por estado | `/catalogo` |
| CU-08 | Carrito y compra mostrando el 90/10 | `/comprador/carrito` |

---

## Cómo correrlo (5 minutos)

Necesitan **Node.js 20.9 o más nuevo** (`node -v` para ver qué versión tienen).

```bash
git clone <url-del-repo>
cd "Raices MX"
npm install
npm run dev
```

Abran http://localhost:3000 y listo.

**No necesitan Supabase para probarlo.** Si no hay archivo `.env.local`, la app arranca en *modo demo*: carga los datos de prueba en memoria y todo funciona igual. Arriba sale una franja amarilla que lo indica. Lo único es que lo que registren se borra cuando apagan el servidor.

Otros comandos:

| Comando | Para qué |
| :--- | :--- |
| `npm test` | Corre las pruebas unitarias (firma del QR y comisiones) |
| `npm run lint` | Revisa el estilo del código |
| `npm run build` | Compila como en producción, úsenlo antes de subir algo grande |

---

## Conectar Supabase (lo que sigue)

**Todavía no creamos la cuenta de Supabase del equipo.** El código ya está listo para conectarse; solo hay que crear el proyecto y pegar las llaves. Les dejo los pasos:

### 1. Crear la cuenta y el proyecto
1. Entren a https://supabase.com y creen cuenta (se puede con GitHub). El plan gratis nos alcanza de sobra.
2. Clic en **New project**.
3. Nombre: `raicesmx`. Pongan una contraseña de base de datos y **guárdenla** (en el grupo o donde sea, pero que no se pierda).
4. Región: la más cercana, por ejemplo **East US**.
5. Esperen un par de minutos a que termine de crearse.

### 2. Crear las tablas
1. En el menú de la izquierda, entren a **SQL Editor** → **New query**.
2. Copien todo el contenido de `supabase/migrations/001_initial_schema.sql`, péguenlo y denle **Run**.
3. Hagan lo mismo con `supabase/migrations/002_reglas_extra.sql` (son unas reglas que agregué después; abajo explico qué hacen).
4. Y al final con `supabase/seed.sql` para cargar los datos de prueba.
5. En **Table Editor** ya deberían ver las 15 tablas con datos de los artesanos de Puebla.

> **Importante:** el orden es 001 → 002 → seed. Si lo corren en otro orden va a marcar error.

### 3. Pegar las llaves en el proyecto
1. En Supabase vayan a **Project Settings** → **API Keys** (o **Data API**).
2. Copien `.env.example` y renómbrenlo a `.env.local`.
3. Llenen así:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co     # Project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...                      # la llave "anon" o "publishable"
SUPABASE_SERVICE_ROLE_KEY=...                          # la llave "service_role" o "secret"
QR_HMAC_SECRET=raicesmx-dev-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Reinicien `npm run dev`. Si ya no sale la franja amarilla, están conectados a la base real.

> **Ojo con dos cosas:**
> - La llave `SUPABASE_SERVICE_ROLE_KEY` es como la contraseña de admin de la base. **Nunca** la suban a GitHub ni le pongan `NEXT_PUBLIC_` al principio. El `.gitignore` ya ignora `.env.local`, pero igual fíjense.
> - `QR_HMAC_SECRET` tiene que ser `raicesmx-dev-secret` mientras usemos los datos de prueba, porque con eso se firmaron los sellos del `seed.sql`. Cuando subamos a producción generamos uno real con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y volvemos a firmar.

---

## Cómo está armado

Usamos la **arquitectura A4**: un solo proyecto en Next.js que tiene tanto las páginas como la API, y Supabase como base de datos.

```
Navegador  ──▶  API REST (/api/v1)  ──▶  módulos con las reglas  ──▶  Supabase
                                                                  └─▶  (o memoria en modo demo)
```

La regla más importante: **el navegador nunca habla directo con la base**. La firma del QR, el cálculo del 90/10, el descuento de inventario y la bitácora se hacen en el servidor. Así nadie puede hacer trampa desde el navegador cambiando un precio o falsificando un sello.

Las carpetas:

```
supabase/
  migrations/001_initial_schema.sql   las 15 tablas, enums, índices, vistas y la función de compra
  migrations/002_reglas_extra.sql     reglas extra que agregué después (ver abajo)
  seed.sql                            datos de prueba de Puebla
docs/MODELO_ER.md                     diagrama E-R y diccionario de datos para el reporte
src/
  app/                                páginas y API
    api/v1/                           la API REST (productores, productos, sello-qr, mapa, pedidos, lotes-b2b)
  modules/                            la lógica de cada caso de uso, separada para repartirnos el trabajo
  lib/                                configuración, validaciones con Zod y conexión a Supabase
  lib/repositorio/                    el código que lee/escribe datos (versión Supabase y versión demo)
  components/                         pedazos de interfaz que se reusan
  types/                              tipos de TypeScript que coinciden con las tablas
tests/                                pruebas con Vitest
```

---

## El modelo E-R en corto

Son **15 tablas**. La parte clave (la que hay que explicarle bien a la maestra) es esta cadena:

```
productor ──publica──▶ producto ──tiene 1:1──▶ ficha de origen ──certificada por──▶ sello QR
```

Cosas que cuida la base de datos por sí sola, aunque alguien se salte la API:

- La ficha de origen **no se guarda si falta alguno de los 9 campos** (hay un `CHECK` por cada uno).
- Un productor **pendiente no puede tener piezas**.
- En cada pedido, lo del productor + la comisión **siempre suma** lo que se vendió (`CHECK`).
- Cuando dos personas quieren la última pieza al mismo tiempo, la función `crear_pedidos_b2c` **bloquea la fila** (`FOR UPDATE`) y solo uno la compra. El otro recibe "pieza agotada" y no se le cobra nada.
- La **bitácora no se puede editar ni borrar**, ni siquiera desde el SQL Editor (trigger que lanza error).

Todo lo demás (cardinalidades, tipos, cada columna) está en `docs/MODELO_ER.md`.

### ¿Por qué hay dos archivos de tablas (001 y 002)?

- **La 001** tiene todo el modelo E-R: las 15 tablas con sus relaciones. Es la que cuenta para la entrega.
- **La 002** la hice después. No cambia ninguna tabla, solo le agrega reglas para que la base se cuide sola:
  - Que la búsqueda funcione sin acentos ("ceramica" encuentra "Cerámica").
  - Que un productor pendiente no pueda publicar.
  - Que el historial de cada pedido y el promedio de estrellas se llenen solos.
  - Que quede lista una columna para conectar el login de Supabase.
  - Unos ajustes que Supabase pide para que no salgan avisos.

Así se trabaja normalmente: cuando hay que cambiar algo de la base no se edita el archivo viejo, sino que se agrega uno nuevo (003, 004...). Si alguien necesita agregar una tabla, que haga su `003_...sql`.

---

## Cómo probar cada caso de uso

Todo esto funciona en modo demo, no necesitan Supabase.

**CU-01 · Registro y verificación**
1. Entren a `/registro-productor` y registren a alguien. Para la CURP pueden usar `RAXP900101HPLMCD09`.
2. Vayan a `/promotor`. En *pendiente* sale su registro y también Ernestina Castillo (de Chignahuapan, viene en los datos de prueba).
3. Denle **Aprobar**. Ya aparece en *aprobado* y ya puede publicar.

**CU-04 · Publicar pieza con QR**
1. Entren a `/productor/publicar` y denle publicar con todo vacío: sale el error de cada uno de los 9 campos.
2. Llénenlo. Cuando pongan precio `800` va a decir "Recibirás $720.00".
3. Suban cualquier foto (JPG, PNG o WEBP de menos de 5 MB) y publiquen. Sale el folio (tipo `RMX-PUE-2026-XXXXXX`), el QR y un botón para descargarlo en PNG.

**CU-06 · Verificar QR**
1. Abran `/verificar/RMX-PUE-2026-A15D09`: sale en verde **"Origen verificado"** con toda la ficha de la olla de barro.
2. Cambien la última letra: `/verificar/RMX-PUE-2026-A15D0A`. Sale en rojo **"Origen no verificado"**.
3. Si abren el enlace del QR que generaron en CU-04 y le cambian una letra al `?sig=`, dice que la firma fue alterada.

**CU-07 · Catálogo y mapa**
1. En `/catalogo` filtren *Textiles* + *Puebla* + precio máximo `2000`: salen el quechquémitl y el rebozo.
2. Busquen `ceramica` (sin acento): sale la olla y el árbol de la vida.
3. En el mapa, toquen **PUE** o **OAX** y se filtra el catálogo por ese estado.

**CU-08 · Compra con 90/10**
1. Agreguen la *Olla de barro bruñido* ($800) al carrito.
2. En el carrito sale: productor **$720.00**, RaicesMX **$80.00**, envío **$150.00**, total **$950.00**.
3. Pongan una dirección y paguen (es pago de prueba, no cobra nada).
4. Para ver el control de inventario: el *Árbol de la vida* solo tiene 1 pieza. Agréguenlo en dos pestañas y paguen en las dos; la segunda dice que ya se agotó.

---

## Pruebas

```bash
npm test
```

Son 26 pruebas:
- `tests/sello-qr.test.ts`: que el folio tenga el formato correcto y no se repita, y que la firma detecte si cambian el folio, la comunidad, el pueblo, la técnica o el productor.
- `tests/comisiones.test.ts`: el ejemplo de $800 → $720 / $80, que el envío no lleve comisión, que no se pierdan centavos, y el ejemplo del lote B2B de 30 piezas de $1,500 (total $38,250, anticipo $11,475, saldo $26,775).

Además, las dos migraciones y el seed los probé en un PostgreSQL local para asegurar que corren sin errores, y que la firma que calcula la base es la misma que la de Node.

---

## Hasta dónde me quedé

**Ya está:**
- Proyecto base con Next.js, TypeScript y Tailwind.
- Modelo E-R completo en SQL (15 tablas) + mejoras para Supabase + datos de prueba.
- Documento del modelo E-R listo para el reporte.
- Los 5 casos de uso funcionando, con su API y sus pantallas.
- Modo demo para que cualquiera lo pueda correr sin configurar nada.
- Pruebas unitarias de lo más delicado (firma y dinero).
- La estructura y el cálculo de lotes B2B (CU-09) ya están listos para continuarlos.

**Lo que falta (para las siguientes entregas):**

| Pendiente | Detalle | Por dónde empezar |
| :--- | :--- | :--- |
| Crear la cuenta de Supabase | Seguir los pasos de arriba y compartir las llaves por privado, **no por el repo** | Sección "Conectar Supabase" |
| **CU-02 · Login** | Ahora mismo el promotor y el comprador son usuarios fijos de prueba (Rosa Elena y Daniela). Hay que meter Supabase Auth, con el bloqueo de 5 intentos / 15 min | `src/lib/supabase/navegador.ts` ya existe; la columna `usuarios.auth_id` ya está |
| Proteger rutas por rol | Que solo el promotor entre a `/promotor` y solo productores aprobados a publicar | Depende del login |
| **CU-09 · Lotes B2B** | Pantalla de pedido por lote, contrato en PDF y pago 30/70 | `src/modules/lotes-b2b/`, tablas `contratos_b2b` y `pagos` |
| **CU-10 · Liquidaciones** | Panel para ver y marcar como pagadas las liquidaciones a productores | Tabla `liquidaciones` (ya se llena con cada compra) |
| Pasarela de pago real | Ahora es pago simulado. Habría que integrar Stripe o Mercado Pago en modo prueba | `src/modules/pedidos-b2c/servicio.ts` |
| QR en PDF | Ahora se descarga en PNG; falta la etiqueta en PDF para imprimir | `src/app/api/v1/sello-qr/[folio]/png` |
| PWA | Falta el `manifest` y el *service worker* para que se instale en el celular y aguante mala señal | `src/app/manifest.ts` |
| Seguimiento y calificaciones | Las tablas y triggers ya están (el historial y el promedio se llenan solos); falta la pantalla | Tablas `seguimiento_pedidos` y `calificaciones` |
| Panel admin + CSV | RF-15 | — |
| Subirlo a internet | Vercel es gratis y se conecta directo con el repo | Agregar las variables de entorno en Vercel |

---

## Cómo nos repartimos para explicarlo

Para la revisión, cada quien puede explicar un caso de uso completo (su pantalla, su API, su módulo y sus tablas):

| CU | Archivos principales | Tablas |
| :--- | :--- | :--- |
| Modelo E-R + CU-04 | `supabase/migrations/`, `modules/catalogo`, `modules/sello-qr/firma.ts` | productos, fichas_origen, sellos_originalidad |
| CU-01 | `modules/usuarios`, `app/(auth)`, `app/(dashboard)/promotor` | usuarios, perfiles_productor, verificaciones_productor |
| CU-06 | `modules/sello-qr/servicio.ts`, `app/(public)/verificar` | sellos_originalidad |
| CU-07 | `modules/catalogo/filtros.ts`, `modules/mapa`, `app/(public)/catalogo` | vista_catalogo, vista_mapa_procedencia |
| CU-08 | `modules/pedidos-b2c`, `modules/comisiones`, `app/(dashboard)/comprador` | pedidos, detalles_pedido, pagos, liquidaciones |

---

## Para trabajar en equipo

- Antes de empezar: `git pull`.
- Trabajen en una rama: `git checkout -b feat/cu-02-login` (por ejemplo).
- Antes de subir: `npm run lint` y `npm test`.
- Commits en español y cortos, con el tema entre paréntesis, tipo `(cu-02) agregue el inicio de sesion` o `(base de datos) agregue la tabla de envios`.
- Nunca suban el `.env.local`.

Cualquier duda me dicen. — Migue
