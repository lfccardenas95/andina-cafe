# Altura · Café de origen

Tienda en línea **ficticia** para el laboratorio de Google Analytics 4 del Diplomado en E-commerce y Negocios Internacionales Digitales.

Vende café colombiano de especialidad y artículos para prepararlo, a clientes nacionales e internacionales. Es un sitio estático (HTML, CSS y JavaScript puros): no tiene servidor, base de datos ni pagos reales, y no pide ni guarda correo, teléfono, documento ni datos de tarjeta.

---

## 1. Conectar tu propiedad de GA4 (el único cambio que debes hacer)

1. En Google Analytics 4 ve a **Administrar > Recopilación y modificación de datos > Flujos de datos** y abre tu flujo web.
2. Copia el **ID de medición** (empieza por `G-`).
3. Abre `js/config.js` y reemplaza `G-XXXXXXXXXX` por tu ID:

```js
window.TIENDA_CONFIG = { GA_MEASUREMENT_ID: "G-AB12CD34EF", DEBUG_MODE: true };
```

- Con `DEBUG_MODE: true` los eventos aparecen en **Administrar > DebugView**.
- Con `DEBUG_MODE: false` no se envía `debug_mode` (uso normal).
- Mientras el ID sea `G-XXXXXXXXXX`, la tienda **no carga** Google Analytics y los eventos solo aparecen en el monitor.

---

## 2. Estructura

```
altura-cafe/
├── index.html          Catálogo, banner del cupón
├── producto.html       Detalle (producto.html?id=CAF-001)
├── carrito.html        Carrito y cupón
├── checkout.html       Envío (paso 1) y pago simulado (paso 2)
├── gracias.html        Confirmación y evento purchase
├── css/estilos.css
└── js/
    ├── config.js       ← el único archivo que se edita
    ├── analytics.js    Carga de gtag.js, funciones de envío y monitor
    ├── productos.js    Los 8 productos e ilustraciones SVG
    ├── carrito.js      Carrito en localStorage e ítems en formato GA4
    ├── inicio.js
    ├── producto.js
    ├── carrito-pagina.js
    ├── checkout.js
    └── gracias.js
```

## 3. Productos (precios en COP)

| item_id | Producto | Categoría | Precio |
|---|---|---|---|
| CAF-001 | Huila Lavado 340 g | Café en grano | 42.000 |
| CAF-002 | Nariño Honey 340 g | Café en grano | 48.000 |
| CAF-003 | Geisha Tolima Edición Limitada 250 g | Café en grano | 89.000 |
| CAF-004 | Sierra Nevada Descafeinado 340 g | Café molido | 39.000 |
| MET-001 | Prensa francesa 600 ml | Métodos de preparación | 95.000 |
| MET-002 | Gotero cerámico V60 | Métodos de preparación | 68.000 |
| ACC-001 | Molino manual de acero | Accesorios | 159.000 |
| ACC-002 | Taza de cerámica Altura 350 ml | Accesorios | 35.000 |

**Cupón:** `BIENVENIDA10`, 10 % de descuento. Se aplica en el carrito o con un clic en el banner del inicio.

**Envíos:** Nacional Estándar 12.000 (gratis desde 150.000 en productos, después del descuento), Nacional Express 25.000, Internacional Estándar 95.000, Internacional Express 160.000. Colombia es *Nacional*; Argentina, Canadá, Chile, Ecuador, España, Estados Unidos, México y Perú son *Internacional*.

---

## 4. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id`, `item_name`, `item_brand` ("Altura"), `item_category`, `price`, `quantity` e `index`. Con cupón activo: `price` = precio unitario con descuento, `discount` = descuento por unidad y `coupon`.

| Evento | Cuándo | Parámetros |
|---|---|---|
| `view_item_list` | Al cargar el catálogo | item_list_id `catalogo_principal`, item_list_name, items |
| `view_promotion` | Cuando el banner del cupón está visible | promotion_id `BIENVENIDA10`, promotion_name, creative_name, creative_slot, items |
| `select_promotion` | Clic en el banner (aplica el cupón y lleva al carrito) | Los mismos de view_promotion |
| `select_item` | Clic en un producto del catálogo | item_list_id, item_list_name, items |
| `view_item` | Al abrir el detalle | value, items |
| `add_to_cart` | Al agregar o aumentar unidades | value, items (quantity = unidades agregadas) |
| `remove_from_cart` | Al quitar o disminuir unidades | value, items |
| `view_cart` | Al abrir el carrito con productos | value, coupon (si existe), items |
| `begin_checkout` | Al abrir checkout.html | value, coupon, items |
| `add_shipping_info` | Clic en "Continuar al pago" | value, coupon, shipping_tier, items |
| `add_payment_info` | Clic en "Pagar (simulado)" | value, coupon, payment_type, items |
| `purchase` | Al cargar gracias.html, una vez por pedido | transaction_id, affiliation, value, shipping, coupon, tipo_cliente, items |

- `shipping_tier` toma uno de estos valores exactos: `Nacional - Estándar`, `Nacional - Express`, `Internacional - Estándar`, `Internacional - Express`.
- `payment_type`: `Tarjeta de crédito`, `PSE`, `Nequi` o `PayPal`.
- En `purchase`, `value` es la suma de `price × quantity` de los ítems (productos con descuento, **sin** envío). El envío va en `shipping`.
- `gtag('set', 'user_properties', { tipo_cliente })` se envía al confirmar el envío y otra vez justo antes de `purchase`.
- El pedido se guarda en `sessionStorage` antes de ir a gracias.html y se marca como enviado después de `purchase`: **recargar la página no repite la compra**. El carrito se vacía al pagar.

**Decisiones de este laboratorio**

- Los eventos de catálogo, promoción y detalle usan el precio de lista. Los eventos del carrito en adelante usan el precio con descuento cuando el cupón está activo.
- `index` es la posición del producto en el catálogo (0 a 7) en los eventos de lista y detalle, y la posición en el carrito en los eventos del carrito y el checkout.

**Para ver `tipo_cliente` en los informes**, regístralo en GA4 en **Administrar > Definiciones personalizadas**:
1. Dimensión personalizada con alcance **Evento**, parámetro `tipo_cliente`.
2. Dimensión personalizada con alcance **Usuario**, propiedad `tipo_cliente`.

---

## 5. Monitor de eventos

Es el panel oscuro de la derecha (abajo en pantallas de menos de 820 px). Muestra:

- **Estado:** en verde "Conectado a G-… · modo depuración", o en rojo "Sin ID de medición…".
- **Origen de la visita:** `utm_source / utm_medium · utm_campaign` de la primera página de la sesión, o "directo (sin UTM)".
- **Los últimos 12 eventos**, incluido `page_view`. Toca uno para ver todos sus parámetros.
- **Simular nuevo visitante:** borra las cookies `_ga*`, el carrito y la sesión, y vuelve al inicio. GA4 lo contará como un usuario nuevo.

El botón **Ocultar/Mostrar** recuerda su estado.

**Prueba de campañas:** abre la tienda con un enlace como este y mira el origen en el monitor y en GA4:

```
https://TU-PROYECTO.vercel.app/index.html?utm_source=instagram&utm_medium=social&utm_campaign=lanzamiento_cafe
```

---

## 5b. Agregar fotos con licencia (opcional)

El inicio usa ilustraciones SVG propias, así que no depende de imágenes externas ni de licencias. Si quieres fotos reales, primero licéncialas. En `index.html` hay comentarios que marcan dónde va cada una. Estas son las tres fotos de Adobe Stock que se eligieron para el diseño (**no están licenciadas**):

| Lugar | Archivo sugerido | Asset ID de Adobe Stock |
|---|---|---|
| Portada | `img/portada.webp` | 548467121 |
| Paso 2, Cosecha a mano | `img/cosecha.webp` | 317120365 |
| Paso 4, Preparación en casa | `img/preparacion.webp` | 915515317 |

1. Licencia la foto en Adobe Stock (o usa una foto propia).
2. Expórtala en WebP, de 1600 px de ancho como máximo, y súbela a la carpeta `img/` del repositorio.
3. En `index.html`, reemplaza el `<svg>` marcado por la etiqueta `<img>` que indica el comentario.

No publiques vistas previas sin licencia: tienen marca de agua y su uso público incumple los términos de Adobe Stock.

---

## 6. Publicar en GitHub y Vercel (sin instalar nada)

**GitHub**
1. Entra a github.com, haz clic en **New repository**, ponle un nombre (por ejemplo `altura-cafe`), déjalo **Public** y créalo.
2. En el repositorio vacío haz clic en **uploading an existing file**.
3. Descomprime el .zip y **arrastra el contenido de la carpeta** `altura-cafe` (index.html, las carpetas css y js, etc.). `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta. No mezcles estos archivos con los de otra tienda: los HTML, el CSS y el JavaScript deben ser de la misma versión.
4. Haz clic en **Commit changes**.

**Vercel**
1. Entra a vercel.com e inicia sesión con tu cuenta de GitHub.
2. **Add New… > Project**, elige el repositorio y haz clic en **Import**.
3. En **Framework Preset** elige **Other**. Deja vacíos Build Command y Output Directory.
4. Haz clic en **Deploy**. En un minuto tendrás una dirección como `https://altura-cafe.vercel.app`.

**Cambiar el ID después:** en GitHub abre `js/config.js`, haz clic en el lápiz, pega tu ID y **Commit changes**. Vercel publica la nueva versión automáticamente.

---

## 7. Si algo no funciona

- **El monitor sigue en rojo:** revisa que el ID esté entre comillas, empiece por `G-` y que guardaste el cambio. Recarga con Ctrl + F5.
- **No veo eventos en DebugView:** confirma que `DEBUG_MODE` es `true` y desactiva los bloqueadores de anuncios, que suelen bloquear Google Analytics.
- **Los informes estándar tardan:** DebugView y Tiempo real muestran los datos al instante; los informes pueden tardar hasta 24 a 48 horas.

*Sitio académico de simulación. No procesa pagos ni guarda datos personales. Usa Google Analytics 4 con fines educativos.*
