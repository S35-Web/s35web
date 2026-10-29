# Dirección S-35 — briefing para Grokbot

**Fecha:** 12 de octubre de 2026  
**Para:** Grokbot, director general virtual de S-35 Technology  
**De:** Juanello (dirección) y el agente que trabaja este repositorio  
**Repo:** https://github.com/S35-Web/s35web.git (`origin` `main`)  
**Working tree de Juanello:** `/Users/juanellodiaz/Documents/Proyectos/S35-Web`

Este archivo es la fuente operativa. `README.md` (diciembre 2024) y `README_LOCAL.md` describen un sitio estático viejo y un servidor que ya no es el de trabajo. Si chocan con este briefing, manda este archivo y el código.

Este briefing **no está en GitHub** hasta que Juanello pida subirlo. Clonar el repo el 12 de octubre de 2026 no lo trae. Está en la Mac de Juanello, en la raíz del working tree.

---

## 1. Quién es S-35 y qué es este repo

S-35 Technology fabrica y vende tecnología para la construcción (estucos Waxtard, adhesivos Pegaxpress, microconcretos, sistemas de panel, líquidos). Opera en tres ciudades: Culiacán (CLN), Los Mochis (LMM) y Mazatlán (MZT).

Este repositorio es el sitio público y el sistema interno de la empresa, desplegado en Vercel. El sitio público (catálogo y fichas) vive en `public/`. El panel de colaboradores (punto de venta, gastos, cortes, dinero, clientes, inventario y producción) vive en `public/colaboradores/`. Las funciones de servidor están en `api/` (MongoDB, login, estado del panel, contacto, Gmail, copiloto del panel). El texto de productos y de MateriaLAB se edita en `content/` y se genera a HTML con scripts de `scripts/`.

Dominio público: https://www.s-35.com.mx  
El laboratorio también aparece bajo el host de Vercel `s35web.vercel.app` en metadatos generados.

Hay un copiloto dentro del panel (`public/colaboradores/s35-copilot.js`, API `api/s35-chat.js`). Ese copiloto es una función del producto. Grokbot es el director virtual; puede preguntarle al mismo copiloto en solo lectura (modo `agent`, sección 5) sin abrir el panel.

---

## 2. Qué estamos haciendo ahora

Tres frentes, en este orden de atención:

1. **POS (caja).** El modo Venta ya está en `main`. Catálogo a la izquierda y ticket a la derecha. Pestañas tipo folder **Venta** / **Gastos de caja** (misma altura; la activa en negro; las inactivas detrás del marco; radio superior izquierdo del frame). Header compacto: Cliente, Ciudad, Código. El hint del ticket dice solo «N Piezas». Las cards dicen «N Unidades». Dividir pago y Precompra son chips toggle. La tarjeta Clip descuenta comisión (3.60 % del cobro + IVA 16 % sobre esa comisión) y a tesorería entra el neto. Archivos: `public/colaboradores/panel.html` y `public/colaboradores/pos-module.js`. El pulido visual entró el 8 de octubre (`727928cd` y commits vecinos).

2. **Catálogo público.** Solo se publica lo que tiene `status: 'verified'`. El 9 de octubre (`7bfa052e`) se ocultaron 8 borradores. Siguen en `content/products/items/`. Republicar uno es poner `status: 'verified'` y correr `npm run build:products`.

3. **Inventario de producto terminado.** El stock real no está en git. Vive en Mongo, colección `panel_state`, documento `_id: s35_finished_stock`. Hay copia local en `.data/panel-state/s35_finished_stock.json` (gitignored). Mazatlán quedó en cero el 2 de octubre y **no se ha restaurado**. Juanello no ha dicho si hay que mover o copiar piezas desde Culiacán.

En paralelo, el 11 de octubre se siguió la tesorería del panel: extracto Banorte de octubre, Banregio en la tarjeta Dinero, resumen del CSV del mes en la card de banco, y Cortes separando tarjeta facturada y sin facturar. También se registraron las ventas del 10 de octubre (notas 64159–64163 y Ricbor 150 Perla).

---

## 3. Estado actual (12 de octubre de 2026)

### Git

- Rama `main`, alineada con `origin/main`.
- HEAD: `5d1ee0c3249b3be147e9b9a45928d24f1e954bc8` (11 oct 2026, 21:23 −0700). Mensaje: «Dividir Tarjeta en Cortes en facturada y sin facturar según billing.»
- El último push que se citaba el 9 de octubre (`7bfa052e`, ocultar drafts) **ya no es la punta**. Esos commits posteriores ya están en `origin/main`.
- Working tree sucio, sin commit de este briefing:
  - Este archivo, `DIRECCION.md`, sin commitear.
  - `.DS_Store` modificado.
  - `.cursor/rules/auto-commit-push.mdc` modificado.
  - Cientos de copias sin trackear con « 2» en el nombre (Finder duplicó assets, HTML, scripts). No son trabajo. No se commitean.
  - `scripts/guard-mass-delete.sh` sin trackear (el hook de borrado masivo; los hooks de git no se versionan).

### Commits recientes en `main` (ya en GitHub)

| Fecha | Commit | Qué hizo |
| --- | --- | --- |
| 11 oct | `5d1ee0c3` | Cortes: tarjeta facturada y sin facturar según billing |
| 11 oct | `3fe661d2` | Card banco: resumen CSV del mes |
| 11 oct | `78f57e2f` | Banregio en la tarjeta Dinero |
| 11 oct | `145b21f4` | Extracto Banorte oct 2026 (cierre $233,042.01) |
| 11 oct | `a7dbf1a8` | Ventas 10 oct: notas 64159–64163 y Ricbor 150 Perla |
| 9 oct | `7bfa052e` | Ocultar 8 drafts del catálogo público |
| 8 oct | `727928cd` | Tabs folder del POS, hint «N Piezas», header compacto |
| 8 oct | `41ec3f44` | Volumen del ticket sin escalón; Clip neto en tesorería |
| 8 oct | `467ef8ee` | Dividir pago y Precompra como chips |
| 8 oct | `fd10d597` | Cards del POS: «# Unidades» |
| 8 oct | `6fdfb4db` | Decodificar `%20` en el servidor local (logos y sacos con espacios) |
| 5 oct | `0bfae8f2` / `c1f5369e` | Cruce Banorte 1–5 oct (T+2) |
| 5 oct | `72545aa4` / `0b303f45` | Anular o editar lotes de producción y revertir inventario |
| 2 oct | `307f8ef8` | Inventario de PT y materias primas por ciudad (Todas / CLN / LMM / MZT) |

### Catálogo público: 18 productos

Verificado el 12 oct contra `content/products/index.js` (`published()` = activos con `status === 'verified'`). Familias en `content/products/taxonomy.js`.

**Estucos premium:** waxtard-blanco-perla, waxtard-blanco-absoluto, waxtard-gris, waxtard-extra-anclaje.

**Microconcretos:** cemento-plastico-concreto (Microconcreto concreto aparente).

**Panel System:** basecoat-plus-blanco, basecoat-plus-gris.

**Pro+ Systems:** leveltec-pro, styrobond-pro.

**Pegaxpress:** ceramico, pegaxpress-block, pegaxpress-psp, porcelanico-universal, ultraforce.

**Líquidos:** adhesivo-darawell, adhesivo-heavy-duty, nanotech-hidrofobico, sellador-premium-pintura.

**8 drafts, fuera del índice, las fichas públicas y el sitemap** (datos siguen en `content/products/items/`):

- aditivo-sp85
- cellbond-pro
- cemencom
- microconcreto-blanco-pulido
- mortercom
- textura-adhesile
- tirol-plaste
- waxtard-thermo

**Descontinuados** (`legacy: true`, tampoco públicos): estuco-base-pro, mix-and-ready. Viven en `content/products/items/drafts.js`.

Total en contenido: 28 fichas (18 públicas + 8 drafts + 2 legacy).

Republicar un draft: cambiar `status` a `'verified'` en su archivo de `content/products/items/` y correr `npm run build:products`. El build completo es `npm run build` (investigación + sync de productos + MateriaLAB + productos + datos de colaboradores).

### Inventario de producto terminado

No está restaurado en Mazatlán.

- Fuente viva: Mongo `panel_state`, `_id: s35_finished_stock`.
- Copia local (no es la fuente viva): `.data/panel-state/s35_finished_stock.json`, `updatedAt` **2026-10-08T17:24:06Z**.
- Esa copia confirma Mazatlán = 0 y Los Mochis = 0 en los 26 slugs. Todo el saldo está en Culiacán. Total de la copia: **1,106 piezas** en 11 slugs.

Piezas en Culiacán en esa copia del 8 oct (el resto en 0):

| Producto | Slug | Piezas |
| --- | --- | ---: |
| Waxtard blanco perla | waxtard-blanco-perla | 920 |
| Pegaxpress Block | pegaxpress-block | 69 |
| Sellador premium adhesivo | sellador-premium-pintura | 25 |
| Heavy duty | adhesivo-heavy-duty | 24 |
| Microconcreto blanco pulido | microconcreto-blanco-pulido | 17 |
| Waxtard extra anclaje | waxtard-extra-anclaje | 15 |
| Pegaxpress PSP | pegaxpress-psp | 13 |
| Aditivo SP85 | aditivo-sp85 | 10 |
| Microconcreto concreto aparente | cemento-plastico-concreto | 9 |
| Darawell | adhesivo-darawell | 3 |
| Nanotech | nanotech-hidrofobico | 1 |

El commit del 2 oct (`307f8ef8`) movió a Culiacán el stock que no tenía ciudad. Mazatlán y Los Mochis quedaron en 0. La copia del 8 oct sigue igual.

**No usar esta tabla como existencias del 12 oct.** Después del 8 oct hubo ventas cargadas en git (notas del 10 oct). Esas ventas viven en la nube y pueden haber bajado Culiacán. Esta Mac no releyó Mongo para este briefing. Grokbot no debe «arreglar» Mazatlán copiando estos números sin que Juanello diga si es un traslado o una copia, y sin leer el documento vivo.

Cada ítem tiene `stock`, `minStock`, `unit` y `byCity: { culiacan, mochis, mazatlan }`.

### Cómo se trabaja en la Mac de Juanello

- Node no venía en el sistema. Está **Node v24.21.0** en `~/.local/node` (`~/.local/node/bin/node`).
- Homebrew en `/opt/homebrew`. `gh` autenticado como **Juanellodiaz** por HTTPS. No hace falta pegar tokens en el chat ni en este archivo.
- Git del sistema depende de la licencia de Xcode; ya está aceptada.
- El push desde el agente de Cursor hacia `main` a veces lo bloquea el propio Cursor. Desde Terminal, con `gh`, sí sale. Aun así: no empujar hasta que Juanello lo pida.
- El 8 oct se corrigió el servidor local para servir logos y sacos cuya ruta tiene espacios (`6fdfb4db`).

---

## 4. Mapa corto del sistema

### Público (lo que ve el cliente)

| Qué | Dónde |
| --- | --- |
| Home | `public/index.html` → https://www.s-35.com.mx/ |
| Catálogo e índice | `public/productos/` (generado). `/catalogo` redirige a `/productos` |
| Fichas | `public/productos/<slug>.html` |
| Fuente de las fichas | `content/products/items/*.js`, índice en `content/products/index.js` |
| Familias y regla verified/draft | `content/products/taxonomy.js` |
| Laboratorio / MateriaLAB | `public/materialab/`, URL pública `/laboratorio` (`vercel.json`) |
| Investigación de materiales | `content/research/` |

Build de fichas: `npm run build:products` → `scripts/build-products.js`. Origen canónico que escribe el build: `https://www.s-35.com.mx`.

### Panel de colaboradores (interno, `noindex`)

| Qué | Dónde |
| --- | --- |
| Login | `public/colaboradores/index.html` |
| App | `public/colaboradores/panel.html` |
| Lógica de caja, ventas, stock, tesorería | `public/colaboradores/pos-module.js` |
| Sync con la nube | `public/colaboradores/panel-sync.js` |
| Roles | `public/colaboradores/roles.js` |
| Copiloto del panel | `public/colaboradores/s35-copilot.js` |
| Correo | `public/colaboradores/mail-copilot.js` |
| Atajos | `public/colaboradores/command-palette.js` |

Secciones del nav: Copiloto (dashboard), Venta, Cortes, Dinero, Clientes, Historial de ventas, Productos, Materias primas, Producción.

`/pos` redirige a `/colaboradores`. `/pos/app` redirige al panel en `#venta`.

Ciudades en código: `culiacan` (CLN), `mochis` (LMM), `mazatlan` (MZT). Definidas en `pos-module.js`.

### APIs (`api/`, Vercel)

| Ruta | Para qué |
| --- | --- |
| `api/login.js` | Sesión del panel |
| `api/panel-state.js` | Estado compartido. Colección Mongo `panel_state`. Una clave = un documento |
| `api/plant-state.js` | Estado de planta |
| `api/clients.js` | Clientes |
| `api/contact.js` | Formulario público |
| `api/messages.js` | Mensajes |
| `api/panel-product-image.js` | Fotos de producto del panel (Vercel Blob) |
| `api/qr.js` | `/qr/:code` |
| `api/gmail.js`, `api/gmail-oauth.js` | Correo del panel |
| `api/s35-chat.js`, `api/s35-usage.js` | Copiloto del panel y su uso. `mode: "agent"` contesta en el servidor, solo lectura |
| `api/_lib/mongo.js`, `api/_lib/auth.js` | Conexión y JWT |

Claves de negocio que el panel puede sincronizar (`ALLOWED_KEYS` en `api/panel-state.js`):

- `s35_plant_inventory`, `s35_plant_families`, `s35_plant_formulas_v3`
- `s35_finished_stock` (producto terminado)
- `s35_production_lots`, `s35_compra_tickets`
- `s35_pos_prices_v4`, `s35_pos_sales`, `s35_caja_gastos_v1`
- `s35_tesoreria_movs_v1`, `s35_sale_edits_v1`, `s35_promo_codes_v1`
- `s35_product_families`, `s35_product_family_overrides`, `s35_product_catalog_v1`

Ventas, gastos, tesorería, lotes, compras y promos se fusionan por id (no se pisan entre pestañas). El resto es last-write-wins por `updatedAt`.

### Qué no está en git

- `.data/` — espejo local del servidor de desarrollo (`server-local-simple.js` lee y escribe aquí en `/api/panel-state`). Gitignored. La copia de stock es del 8 oct; la nube puede ir más adelante.
- MongoDB — la operación real del panel (ventas, caja, inventario, fórmulas, lotes).
- Variables de Vercel. Nombres, sin valores: `MONGODB_URI`, `MONGODB_DB` (default `s35web`), `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `VENTAS_USERNAME`, `VENTAS_PASSWORD`, `RESEND_API_KEY`, `MAIL_TO`, `MAIL_FROM`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `GMAIL_USER`, `BLOB_READ_WRITE_TOKEN`, `OPENAI_API_KEY`, `S35_AI_MODEL`, `S35_AGENT_KEY`. No copiar `.env` ni inventar valores. `S35_AGENT_KEY` es la llave fija del modo agent; no va en git.
- `public/Assets/productos_thumbs/panel/` — fotos subidas en local, gitignored.
- Copias « 2», `.DS_Store`, `node_modules/`.

`README_LOCAL.md` documenta usuarios de prueba de un servidor viejo. No copiar de ahí una lista de secretos, y no tratar esas claves como las de producción. Producción sale de las variables de Vercel.

En local, `server-local-simple.js` **no habla con Mongo**: persiste el panel en `.data/panel-state/`. Abrir el panel en `localhost` muestra esa copia, no la caja en vivo de Vercel.

---

## 5. Cómo se conecta Grokbot

### Si clona el repo

```bash
git clone https://github.com/S35-Web/s35web.git
cd s35web
```

Leer `DIRECCION.md` y, solo como historia, `README.md`. Hasta que Juanello diga «sube» o «haz push», **este archivo no está en GitHub**. Para tenerlo hoy hace falta el working tree de la Mac o que alguien pegue el archivo.

GitHub del usuario: **Juanellodiaz**. Remote: `https://github.com/S35-Web/s35web.git`.

### Si corre en Cursor, en la Mac de Juanello

El working tree es:

`/Users/juanellodiaz/Documents/Proyectos/S35-Web`

Ese folder es el trabajo real, incluidos `.data/` (si el proceso puede leer archivos gitignored) y los cambios sin commit. `gh` ya está autenticado en esa Mac. No pedir ni escribir tokens.

Node:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
node -v   # v24.21.0
```

### Levantar en local

Desde la raíz del repo:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
node server-local-simple.js
```

Abrir:

- Sitio: http://localhost:3000/
- Catálogo: http://localhost:3000/productos
- Login colaboradores: http://localhost:3000/colaboradores
- Panel / POS: http://localhost:3000/colaboradores/panel.html  
  (también http://localhost:3000/colaboradores/panel y http://localhost:3000/colaboradores/panel#venta)

Puerto 3000. Si está ocupado, el proceso lo dice y no arranca.

Eso no es producción. Producción es https://www.s-35.com.mx y el panel en https://www.s-35.com.mx/colaboradores/panel. El panel de producción sincroniza con Mongo. El local sincroniza con `.data/`. `server-local-simple.js` no expone `/api/s35-chat`.

### Preguntarle al Copilot (modo agent)

Grokbot usa el mismo cerebro que el chat del panel. No hay otra base. El panel (sin `mode`, o `mode: "chat"`) sigue igual: el navegador ejecuta las consultas. Con `mode: "agent"` el servidor las ejecuta él, ignora la navegación y devuelve ya la respuesta.

`POST https://www.s-35.com.mx/api/s35-chat`

Header: `Authorization: Bearer <llave>` y `Content-Type: application/json`. También vale el header `x-s35-agent-key` con el mismo valor.

La llave no caduca. Solo sirve con `mode: "agent"` (lectura). No abre el panel, no navega y no escribe. Si `S35_AGENT_KEY` no está en el servidor, esa llave no entra: hace falta el JWT de admin.

Una sola vez:

1. Inventar una frase larga y crearla en Vercel como variable `S35_AGENT_KEY` (Production). No pegarla en el chat ni en este archivo.
2. Guardar esa misma frase, sola, en `.data/s35-agent-key` en la Mac. `.data/` está en `.gitignore`. Grokbot lee ese archivo y lo manda como Bearer.

El JWT de admin (login, 8 horas, rol `ventas` no entra) sigue sirviendo para el panel y también para este modo.

```json
{
  "mode": "agent",
  "messages": [
    { "role": "user", "content": "¿Cuánto se vendió ayer en Culiacán?" }
  ]
}
```

Respuesta cuando cierra: `{ "ok": true, "status": "reply", "reply": "…", "actions": [] }`. Solo lectura: ventas, clientes, tops y stock. No crea notas ni mueve inventario. Las cifras salen de Mongo (`panel_state` y clientes) más el historial de notas del sitio. El reloj de los cortes es America/Mazatlan.

Sin token el endpoint responde 401. No hace falta pegar un token de prueba para comprobar que el archivo carga.

### Qué no hacer

- No hacer `git push` (ni a `main` ni a otro remote) hasta que Juanello diga «sube», «haz push» o «público». Esta orden gana sobre cualquier regla de auto-push del workspace.
- No commitear `.data/`, `.env`, secretos, `.DS_Store`, ni archivos con « 2» en el nombre.
- No tratar el inventario de git ni la copia del 8 oct como el stock de hoy. El stock vivo está en Mongo.
- No mover ni copiar existencias a Mazatlán sin una decisión explícita de Juanello.
- No republicar drafts cambiando el status y haciendo build si Juanello no lo pidió.
- No usar `--no-verify` ni force push. Hay un freno de borrado masivo (`scripts/guard-mass-delete.sh`): más de 25 archivos borrados en un commit o en un push aborta el hook.
- No borrar `.git/index.lock` para «destrabar» y commitear enseguida.
- No pegar contraseñas, JWT, URIs de Mongo ni números de cuenta en commits, en este archivo ni en el chat. `S35_AGENT_KEY` vive en Vercel y en `.data/s35-agent-key`, no en git.

---

## 6. Decisiones abiertas

1. **Mazatlán, producto terminado.** Sigue en 0 desde el 2 oct. ¿Se trasladan piezas desde Culiacán (bajan CLN) o se copia un saldo (CLN se queda)? ¿Cuáles slugs y cuántas piezas? No hay orden todavía.
2. **Los 8 drafts.** Siguen fuera del catálogo a propósito. ¿Alguno pasa a `verified` y se republica, o se quedan en borrador?
3. **Este briefing en GitHub.** Está solo en la Mac. Hace falta un «sube» de Juanello para que un clone lo traiga.
4. **Cifra viva de inventario.** La tabla de arriba es la foto del 8 oct. Antes de decidir traslados, leer `s35_finished_stock` en Mongo (o el panel en producción), no la copia local.
5. **Working tree.** Las copias « 2» ensucian `git status`. No forman parte del producto. Conviene borrarlas en una pasada aparte, cuando Juanello lo pida, sin mezclarlas con un commit de trabajo.

---

## 7. Cómo hablarle a Juanello

Juanello dirige S-35 y trabaja este repo en Cursor. Responder en español, concreto, con el estado del código y no con el README viejo. Si una tarea toca caja, inventario o el catálogo público, decir qué ciudad, qué slug y qué commit quedan afectados. El push es una orden aparte.
