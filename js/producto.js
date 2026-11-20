/* ==========================================================================
   DETALLE DE PRODUCTO (producto.html?id=CAF-001)
   Eventos: view_item, add_to_cart
   ========================================================================== */

(function () {
  "use strict";

  var contenedor = document.getElementById("detalle-producto");
  var id = new URLSearchParams(window.location.search).get("id");
  var producto = window.obtenerProducto(id);

  if (!producto) {
    contenedor.innerHTML =
      '<div class="vacio" style="margin:24px 0 80px">' +
        '<h2>No encontramos ese producto</h2>' +
        '<p>Revisa el enlace o vuelve al catálogo para ver los ocho productos disponibles.</p>' +
        '<a class="boton" href="index.html#catalogo">Ver el catálogo</a>' +
      '</div>';
    return;
  }

  var indice = window.posicionEnCatalogo(producto);
  var MAXIMO = 10;
  var cantidad = 1;

  document.title = producto.nombre + " | Altura";

  var ficha = producto.ficha.map(function (f) {
    return "<dt>" + escaparHTML(f[0]) + "</dt><dd>" + escaparHTML(f[1]) + "</dd>";
  }).join("");

  contenedor.innerHTML =
    '<div class="detalle">' +
      '<div class="ilustracion" style="background:' + producto.tono + '">' +
        (producto.insignia ? '<span class="insignia">' + escaparHTML(producto.insignia) + '</span>' : '') +
        window.ilustracionProducto(producto) + '</div>' +
      '<div>' +
        '<p class="detalle-categoria">' + escaparHTML(producto.categoria) + ', referencia ' + producto.id + '</p>' +
        '<h1>' + escaparHTML(producto.nombre) + '</h1>' +
        '<p class="detalle-precio">' + formatoCOP(producto.precio) + '</p>' +
        '<p class="detalle-descripcion">' + escaparHTML(producto.descripcion) + '</p>' +
        (producto.notas ? '<ul class="notas" aria-label="Notas de cata">' + producto.notas.map(function (n) { return '<li>' + escaparHTML(n) + '</li>'; }).join("") + '</ul>' : '') +
        '<dl class="ficha">' + ficha + '</dl>' +
        '<div class="comprar">' +
          '<div class="selector" role="group" aria-label="Cantidad">' +
            '<button type="button" id="menos" aria-label="Quitar una unidad">−</button>' +
            '<span class="selector-valor" id="cantidad" aria-live="polite">1</span>' +
            '<button type="button" id="mas" aria-label="Agregar una unidad">+</button>' +
          '</div>' +
          '<button type="button" class="boton boton-grande" id="agregar">Agregar al carrito</button>' +
        '</div>' +
        '<p class="aviso" id="aviso" role="status" hidden></p>' +
      '</div>' +
    '</div>';

  var elCantidad = document.getElementById("cantidad");
  var btnMenos = document.getElementById("menos");
  var btnMas = document.getElementById("mas");
  var aviso = document.getElementById("aviso");

  function pintarCantidad() {
    elCantidad.textContent = cantidad;
    btnMenos.disabled = cantidad <= 1;
    btnMas.disabled = cantidad >= MAXIMO;
  }
  btnMenos.addEventListener("click", function () { if (cantidad > 1) { cantidad--; pintarCantidad(); } });
  btnMas.addEventListener("click", function () { if (cantidad < MAXIMO) { cantidad++; pintarCantidad(); } });
  pintarCantidad();

  /* view_item: precio de lista */
  enviarEvento("view_item", {
    value: producto.precio,
    items: [window.Carrito.itemGA4(producto, 1, indice, null)]
  });

  /* add_to_cart: quantity = unidades agregadas. Si hay cupón activo, precio con descuento. */
  document.getElementById("agregar").addEventListener("click", function () {
    window.Carrito.agregar(producto.id, cantidad);
    var item = window.Carrito.itemGA4(producto, cantidad, indice, window.Carrito.cupon());
    enviarEvento("add_to_cart", {
      value: item.price * item.quantity,
      items: [item]
    });

    aviso.innerHTML = (cantidad === 1 ? "Agregaste 1 unidad" : "Agregaste " + cantidad + " unidades") +
      ' al carrito. <a href="carrito.html">Ver carrito</a>';
    aviso.hidden = false;
    cantidad = 1;
    pintarCantidad();
  });
})();
