/* ==========================================================================
   CHECKOUT EN DOS PASOS (checkout.html)
   Eventos: begin_checkout, add_shipping_info, add_payment_info
   También: gtag('set', 'user_properties', { tipo_cliente })
   No se piden ni se guardan correo, teléfono, documento ni datos de tarjeta.
   ========================================================================== */

(function () {
  "use strict";

  var C = window.Carrito;
  var contenedor = document.getElementById("contenido-checkout");

  var PAISES = ["Colombia", "Argentina", "Canadá", "Chile", "Ecuador", "España", "Estados Unidos", "México", "Perú"];
  var TARIFAS = {
    "Nacional": { "Estándar": 12000, "Express": 25000 },
    "Internacional": { "Estándar": 95000, "Express": 160000 }
  };
  var TIEMPOS = {
    "Nacional": { "Estándar": "3 a 5 días hábiles", "Express": "1 a 2 días hábiles" },
    "Internacional": { "Estándar": "10 a 15 días hábiles", "Express": "4 a 6 días hábiles" }
  };
  var ENVIO_GRATIS_DESDE = 150000;
  var PAGOS = [
    { valor: "Tarjeta de crédito", detalle: "Simulado: no se piden datos de la tarjeta." },
    { valor: "PSE", detalle: "Débito desde cuenta bancaria en Colombia, simulado." },
    { valor: "Nequi", detalle: "Pago desde la app, simulado." },
    { valor: "PayPal", detalle: "Útil para clientes internacionales, simulado." }
  ];

  if (!C.lineas().length) {
    contenedor.innerHTML =
      '<div class="vacio" style="margin-bottom:80px">' +
        '<h2>No hay productos para pagar</h2>' +
        '<p>Tu carrito está vacío. Agrega productos desde el catálogo para iniciar la compra.</p>' +
        '<a class="boton" href="index.html#catalogo">Ver el catálogo</a>' +
      '</div>';
    return;
  }

  /* Valores del pedido (se recalculan con el carrito actual) */
  function datosCarrito() {
    var items = C.itemsGA4();
    return { items: items, valor: C.valor(items), cupon: C.cupon(), subtotal: C.subtotalSinDescuento() };
  }

  function tipoCliente(pais) { return pais === "Colombia" ? "Nacional" : "Internacional"; }

  function costoEnvio(tipo, servicio, valorProductos) {
    if (tipo === "Nacional" && servicio === "Estándar" && valorProductos >= ENVIO_GRATIS_DESDE) return 0;
    return TARIFAS[tipo][servicio];
  }

  /* Parámetros comunes: value, coupon (si existe) */
  function base(d) {
    var p = { value: d.valor };
    if (d.cupon) p.coupon = d.cupon;
    return p;
  }

  var estado = { envioConfirmado: false, tipo: null, servicio: null, envio: null, pais: null };

  /* ---------- Estructura ---------- */
  contenedor.innerHTML =
    '<ol class="pasos" aria-label="Pasos de la compra">' +
      '<li id="paso-1-indicador" class="activo"><span class="num">1</span>Envío</li>' +
      '<li id="paso-2-indicador"><span class="num">2</span>Pago</li>' +
    '</ol>' +
    '<div class="columnas">' +
      '<div class="columna-principal">' +
        '<section class="bloque" id="paso-envio" aria-labelledby="titulo-envio">' +
          '<h2 id="titulo-envio">Envío</h2>' +
          '<form id="form-envio" novalidate>' +
            '<div class="grupo">' +
              '<label class="etiqueta" for="nombre">Nombre ficticio</label>' +
              '<input class="campo" id="nombre" name="nombre" maxlength="40" autocomplete="off" placeholder="Por ejemplo, Ana Prueba">' +
              '<p class="ayuda">Escribe un nombre inventado. No se guarda ni se envía a Google Analytics.</p>' +
              '<p class="error-campo" id="error-nombre" hidden>Escribe un nombre ficticio para continuar.</p>' +
            '</div>' +
            '<div class="grupo">' +
              '<label class="etiqueta" for="pais">País de entrega</label>' +
              '<select class="campo" id="pais" name="pais">' +
                PAISES.map(function (p) { return '<option value="' + p + '">' + p + '</option>'; }).join("") +
              '</select>' +
            '</div>' +
            '<fieldset>' +
              '<legend class="etiqueta">Servicio de envío</legend>' +
              '<div class="opciones" id="opciones-envio"></div>' +
            '</fieldset>' +
            '<button type="submit" class="boton boton-grande">Continuar al pago</button>' +
          '</form>' +
          '<div id="envio-resumen" hidden></div>' +
        '</section>' +
        '<section class="bloque" id="paso-pago" aria-labelledby="titulo-pago" hidden>' +
          '<h2 id="titulo-pago">Pago simulado</h2>' +
          '<form id="form-pago" novalidate>' +
            '<fieldset>' +
              '<legend class="etiqueta">Medio de pago</legend>' +
              '<div class="opciones">' +
                PAGOS.map(function (m, i) {
                  return '<label class="opcion"><input type="radio" name="pago" value="' + m.valor + '"' + (i === 0 ? " checked" : "") + '>' +
                    '<span class="opcion-texto"><span class="opcion-titulo">' + m.valor + '</span>' +
                    '<span class="opcion-detalle">' + m.detalle + '</span></span></label>';
                }).join("") +
              '</div>' +
            '</fieldset>' +
            '<div class="acciones-paso">' +
              '<button type="submit" class="boton boton-grande" id="boton-pagar">Pagar (simulado)</button>' +
            '</div>' +
          '</form>' +
        '</section>' +
      '</div>' +
      '<aside class="columna-lateral"><div class="resumen" id="resumen-pedido"></div></aside>' +
    '</div>';

  var formEnvio = document.getElementById("form-envio");
  var campoNombre = document.getElementById("nombre");
  var campoPais = document.getElementById("pais");
  var opcionesEnvio = document.getElementById("opciones-envio");

  function seleccionActual() {
    var pais = campoPais.value;
    var marcado = formEnvio.querySelector('input[name="servicio"]:checked');
    return { pais: pais, tipo: tipoCliente(pais), servicio: marcado ? marcado.value : "Estándar" };
  }

  function pintarOpcionesEnvio() {
    var actual = formEnvio.querySelector('input[name="servicio"]:checked');
    var servicioElegido = actual ? actual.value : "Estándar";
    var tipo = tipoCliente(campoPais.value);
    var d = datosCarrito();
    opcionesEnvio.innerHTML = ["Estándar", "Express"].map(function (s) {
      var costo = costoEnvio(tipo, s, d.valor);
      return '<label class="opcion"><input type="radio" name="servicio" value="' + s + '"' + (s === servicioElegido ? " checked" : "") + '>' +
        '<span class="opcion-texto"><span class="opcion-titulo">' + tipo + ' ' + s + '</span>' +
        '<span class="opcion-detalle">' + TIEMPOS[tipo][s] + '</span></span>' +
        '<span class="opcion-precio' + (costo === 0 ? " gratis" : "") + '">' + (costo === 0 ? "Gratis" : formatoCOP(costo)) + '</span></label>';
    }).join("");
  }

  function pintarResumen() {
    var d = datosCarrito();
    var sel = estado.envioConfirmado ? estado : seleccionActual();
    var envio = costoEnvio(sel.tipo, sel.servicio, d.valor);
    var lineas = C.lineas();
    document.getElementById("resumen-pedido").innerHTML =
      '<h2>Tu pedido</h2>' +
      '<ul class="mini-items">' + lineas.map(function (l, i) {
        return '<li><span>' + escaparHTML(l.producto.nombre) + ' × ' + l.cantidad + '</span><span>' + formatoCOP(d.items[i].price * l.cantidad) + '</span></li>';
      }).join("") + '</ul>' +
      '<div class="resumen-fila"><span>Subtotal</span><span>' + formatoCOP(d.subtotal) + '</span></div>' +
      (d.cupon ? '<div class="resumen-fila descuento"><span>Descuento ' + d.cupon + '</span><span>−' + formatoCOP(d.subtotal - d.valor) + '</span></div>' : '') +
      '<div class="resumen-fila"><span>Envío ' + sel.tipo + ' ' + sel.servicio + '</span><span>' + (envio === 0 ? "Gratis" : formatoCOP(envio)) + '</span></div>' +
      '<div class="resumen-fila resumen-total"><span>Total</span><span>' + formatoCOP(d.valor + envio) + '</span></div>' +
      '<p class="nota">Valores en pesos colombianos (COP).</p>';
  }

  campoPais.addEventListener("change", function () { pintarOpcionesEnvio(); pintarResumen(); });
  opcionesEnvio.addEventListener("change", pintarResumen);
  campoNombre.addEventListener("input", function () {
    campoNombre.removeAttribute("aria-invalid");
    document.getElementById("error-nombre").hidden = true;
  });

  pintarOpcionesEnvio();
  pintarResumen();

  /* begin_checkout */
  (function () {
    var d = datosCarrito();
    var p = base(d);
    p.items = d.items;
    enviarEvento("begin_checkout", p);
  })();

  /* ---------- Paso 1: Continuar al pago ---------- */
  formEnvio.addEventListener("submit", function (e) {
    e.preventDefault();
    if (campoNombre.value.trim().length < 2) {
      campoNombre.setAttribute("aria-invalid", "true");
      document.getElementById("error-nombre").hidden = false;
      campoNombre.focus();
      return;
    }

    var sel = seleccionActual();
    var d = datosCarrito();
    estado.envioConfirmado = true;
    estado.pais = sel.pais;
    estado.tipo = sel.tipo;
    estado.servicio = sel.servicio;
    estado.envio = costoEnvio(sel.tipo, sel.servicio, d.valor);

    window.Analitica.establecerPropiedadesUsuario({ tipo_cliente: estado.tipo });

    var p = base(d);
    p.shipping_tier = estado.tipo + " - " + estado.servicio;
    p.items = d.items;
    enviarEvento("add_shipping_info", p);

    formEnvio.hidden = true;
    var resumenEnvio = document.getElementById("envio-resumen");
    resumenEnvio.innerHTML =
      '<div class="envio-confirmado"><span>Entrega en <strong>' + estado.pais + '</strong>, servicio ' +
      estado.tipo + ' ' + estado.servicio + ' (' + (estado.envio === 0 ? "gratis" : formatoCOP(estado.envio)) + ').</span>' +
      '<button type="button" class="enlace-boton" id="cambiar-envio">Cambiar</button></div>';
    resumenEnvio.hidden = false;

    document.getElementById("paso-pago").hidden = false;
    document.getElementById("paso-1-indicador").className = "hecho";
    document.getElementById("paso-2-indicador").className = "activo";
    pintarResumen();
    document.getElementById("titulo-pago").scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("envio-resumen").addEventListener("click", function (e) {
    if (e.target.id !== "cambiar-envio") return;
    estado.envioConfirmado = false;
    formEnvio.hidden = false;
    document.getElementById("envio-resumen").hidden = true;
    document.getElementById("paso-pago").hidden = true;
    document.getElementById("paso-1-indicador").className = "activo";
    document.getElementById("paso-2-indicador").className = "";
    pintarResumen();
  });

  /* ---------- Paso 2: Pagar (simulado) ---------- */
  document.getElementById("form-pago").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!estado.envioConfirmado) return;
    var botonPagar = document.getElementById("boton-pagar");
    botonPagar.disabled = true;
    botonPagar.textContent = "Procesando pago simulado…";

    var medio = e.target.querySelector('input[name="pago"]:checked').value;
    var d = datosCarrito();
    var envio = costoEnvio(estado.tipo, estado.servicio, d.valor);

    // Pedido para gracias.html: solo datos de la compra, sin datos personales.
    var pedido = {
      transaction_id: "ALT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      affiliation: window.TIENDA.afiliacion,
      value: d.valor,
      shipping: envio,
      coupon: d.cupon,
      tipo_cliente: estado.tipo,
      items: d.items,
      pais: estado.pais,
      shipping_tier: estado.tipo + " - " + estado.servicio,
      payment_type: medio,
      enviado: false
    };
    try { sessionStorage.setItem("altura_pedido", JSON.stringify(pedido)); } catch (err) { /* sin almacenamiento */ }

    var p = base(d);
    p.payment_type = medio;
    p.items = d.items;

    C.vaciar();
    enviarEventoYNavegar("add_payment_info", p, "gracias.html");
  });
})();
