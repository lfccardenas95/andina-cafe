/* ==========================================================================
   PÁGINA DEL CARRITO (carrito.html)
   Eventos: view_cart, add_to_cart, remove_from_cart
   ========================================================================== */

(function () {
  "use strict";

  var C = window.Carrito;
  var contenedor = document.getElementById("contenido-carrito");
  var mensajeCupon = null; // { texto, error }

  function filaResumen(etiqueta, valor, clase) {
    return '<div class="resumen-fila' + (clase ? " " + clase : "") + '"><span>' + etiqueta + '</span><span>' + valor + '</span></div>';
  }

  function bloqueCupon(cupon) {
    var html = cupon
      ? '<div class="cupon-activo"><span>Cupón <strong>' + cupon + '</strong>: 10 % de descuento</span>' +
        '<button type="button" class="enlace-boton" data-accion="quitar-cupon">Quitar</button></div>'
      : '<form class="cupon-form" id="form-cupon" novalidate>' +
          '<label class="visualmente-oculto" for="codigo-cupon">Código de descuento</label>' +
          '<input class="campo" id="codigo-cupon" name="codigo" placeholder="Código de descuento" autocomplete="off" autocapitalize="characters">' +
          '<button type="submit" class="boton boton-secundario">Aplicar</button>' +
        '</form>';
    if (mensajeCupon) {
      html += '<p class="aviso' + (mensajeCupon.error ? " aviso-error" : "") + '" role="status">' + mensajeCupon.texto + '</p>';
    }
    return html;
  }

  function pintar() {
    var lineas = C.lineas();
    var cupon = C.cupon();

    if (!lineas.length) {
      contenedor.innerHTML =
        '<div class="vacio" style="margin-bottom:80px">' +
          '<h2>Tu carrito está vacío</h2>' +
          '<p>' + (cupon
            ? "El cupón " + cupon + " ya está aplicado. Agrega productos y verás el 10 % de descuento aquí."
            : "Explora el catálogo y agrega tu primer café.") + '</p>' +
          '<a class="boton" href="index.html#catalogo">Ver el catálogo</a>' +
        '</div>';
      return;
    }

    var items = C.itemsGA4();
    var subtotal = C.subtotalSinDescuento();
    var total = C.valor(items);

    var htmlLineas = lineas.map(function (l, i) {
      var p = l.producto;
      var item = items[i];
      return '<li class="linea">' +
        '<a class="ilustracion" href="producto.html?id=' + p.id + '" style="background:' + p.tono + '" tabindex="-1" aria-hidden="true">' + window.ilustracionProducto(p) + '</a>' +
        '<div>' +
          '<a class="linea-nombre" href="producto.html?id=' + p.id + '">' + escaparHTML(p.nombre) + '</a>' +
          '<div class="linea-unitario">' + formatoCOP(item.price) + ' c/u' + (cupon ? ' (antes ' + formatoCOP(p.precio) + ')' : '') + '</div>' +
          '<div class="linea-acciones">' +
            '<div class="selector selector-chico" role="group" aria-label="Cantidad de ' + escaparHTML(p.nombre) + '">' +
              '<button type="button" data-accion="menos" data-id="' + p.id + '" aria-label="Quitar una unidad">−</button>' +
              '<span class="selector-valor">' + l.cantidad + '</span>' +
              '<button type="button" data-accion="mas" data-id="' + p.id + '" aria-label="Agregar una unidad">+</button>' +
            '</div>' +
            '<button type="button" class="enlace-boton" data-accion="eliminar" data-id="' + p.id + '">Eliminar</button>' +
          '</div>' +
        '</div>' +
        '<div class="linea-total">' + formatoCOP(item.price * l.cantidad) +
          (cupon ? '<s>' + formatoCOP(p.precio * l.cantidad) + '</s>' : '') + '</div>' +
      '</li>';
    }).join("");

    contenedor.innerHTML =
      '<div class="columnas">' +
        '<div class="columna-principal"><ul class="lineas">' + htmlLineas + '</ul></div>' +
        '<aside class="columna-lateral"><div class="resumen">' +
          '<h2>Resumen</h2>' +
          filaResumen("Subtotal", formatoCOP(subtotal)) +
          (cupon ? filaResumen("Descuento " + cupon, "−" + formatoCOP(subtotal - total), "descuento") : "") +
          filaResumen("Total en productos", formatoCOP(total), "resumen-total") +
          '<p class="nota">El envío se calcula en el siguiente paso. Nacional Estándar es gratis desde $150.000 en productos.</p>' +
          bloqueCupon(cupon) +
          '<a class="boton boton-grande boton-bloque" href="checkout.html">Continuar con la compra</a>' +
        '</div></aside>' +
      '</div>';
  }

  function indiceEnCarrito(id) {
    var lineas = C.lineas();
    for (var i = 0; i < lineas.length; i++) if (lineas[i].producto.id === id) return i;
    return 0;
  }

  /* Evento con las unidades que cambiaron (quantity = unidades agregadas o quitadas). */
  function eventoCambio(nombre, producto, unidades, indice) {
    var item = C.itemGA4(producto, unidades, indice, C.cupon());
    enviarEvento(nombre, { value: item.price * item.quantity, items: [item] });
  }

  contenedor.addEventListener("click", function (e) {
    var boton = e.target.closest("[data-accion]");
    if (!boton) return;
    var accion = boton.getAttribute("data-accion");
    var id = boton.getAttribute("data-id");
    var producto = id ? window.obtenerProducto(id) : null;

    if (accion === "mas" && producto) {
      C.agregar(id, 1);
      eventoCambio("add_to_cart", producto, 1, indiceEnCarrito(id));
    } else if (accion === "menos" && producto) {
      var indiceMenos = indiceEnCarrito(id);
      C.disminuir(id, 1);
      eventoCambio("remove_from_cart", producto, 1, indiceMenos);
    } else if (accion === "eliminar" && producto) {
      var unidades = C.cantidadDe(id);
      var indiceEliminar = indiceEnCarrito(id);
      C.eliminar(id);
      eventoCambio("remove_from_cart", producto, unidades, indiceEliminar);
    } else if (accion === "quitar-cupon") {
      C.quitarCupon();
      mensajeCupon = null;
    }
    pintar();
  });

  contenedor.addEventListener("submit", function (e) {
    if (e.target.id !== "form-cupon") return;
    e.preventDefault();
    var codigo = e.target.codigo.value;
    if (!codigo.trim()) {
      mensajeCupon = { texto: "Escribe un código de descuento.", error: true };
    } else if (C.aplicarCupon(codigo)) {
      mensajeCupon = { texto: "Cupón aplicado: 10 % de descuento en todos los productos.", error: false };
    } else {
      mensajeCupon = { texto: "Ese código no es válido. Prueba con BIENVENIDA10.", error: true };
    }
    pintar();
  });

  pintar();

  /* view_cart: solo si hay productos */
  if (C.lineas().length) {
    var items = C.itemsGA4();
    var parametros = { value: C.valor(items) };
    if (C.cupon()) parametros.coupon = C.cupon();
    parametros.items = items;
    enviarEvento("view_cart", parametros);
  }
})();
