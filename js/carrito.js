/* ==========================================================================
   CARRITO DE COMPRAS (localStorage)
   Guarda los productos y el cupón en el navegador del visitante.
   También construye los "items" con el formato que pide GA4.
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "altura_carrito";            // analytics.js usa la misma clave
  var CUPON = { codigo: "BIENVENIDA10", porcentaje: 10 };

  function vacio() { return { items: [], cupon: null }; }

  function leer() {
    try {
      var datos = JSON.parse(localStorage.getItem(CLAVE));
      if (datos && Array.isArray(datos.items)) return datos;
    } catch (e) { /* almacenamiento no disponible o dañado */ }
    return vacio();
  }

  function guardar(carrito) {
    try { localStorage.setItem(CLAVE, JSON.stringify(carrito)); } catch (e) { /* sin almacenamiento */ }
    actualizarContador();
  }

  /* Líneas del carrito con el producto completo: [{ producto, cantidad }] */
  function lineas() {
    return leer().items
      .map(function (l) { return { producto: window.obtenerProducto(l.id), cantidad: l.cantidad }; })
      .filter(function (l) { return l.producto && l.cantidad > 0; });
  }

  function cantidadDe(id) {
    var l = leer().items.filter(function (x) { return x.id === id; })[0];
    return l ? l.cantidad : 0;
  }

  function agregar(id, cantidad) {
    var c = leer();
    var linea = c.items.filter(function (x) { return x.id === id; })[0];
    if (linea) linea.cantidad += cantidad;
    else c.items.push({ id: id, cantidad: cantidad });
    guardar(c);
  }

  function disminuir(id, cantidad) {
    var c = leer();
    c.items = c.items
      .map(function (x) { return x.id === id ? { id: x.id, cantidad: x.cantidad - cantidad } : x; })
      .filter(function (x) { return x.cantidad > 0; });
    guardar(c);
  }

  function eliminar(id) {
    var c = leer();
    c.items = c.items.filter(function (x) { return x.id !== id; });
    guardar(c);
  }

  /* Devuelve true si el código es válido y queda aplicado. */
  function aplicarCupon(codigo) {
    if (String(codigo || "").trim().toUpperCase() !== CUPON.codigo) return false;
    var c = leer();
    c.cupon = CUPON.codigo;
    guardar(c);
    return true;
  }

  function quitarCupon() {
    var c = leer();
    c.cupon = null;
    guardar(c);
  }

  function cupon() { return leer().cupon || null; }

  function vaciar() { guardar(vacio()); }

  function descuentoUnitario(precio, codigoCupon) {
    return codigoCupon ? Math.round(precio * CUPON.porcentaje / 100) : 0;
  }

  /* Ítem en formato GA4.
     Con cupón: price = precio con descuento, discount = descuento por unidad, coupon. */
  function itemGA4(producto, cantidad, indice, codigoCupon) {
    var descuento = descuentoUnitario(producto.precio, codigoCupon);
    var item = {
      item_id: producto.id,
      item_name: producto.nombre,
      item_brand: window.TIENDA.marca,
      item_category: producto.categoria,
      price: producto.precio - descuento
    };
    if (codigoCupon) {
      item.discount = descuento;
      item.coupon = codigoCupon;
    }
    item.quantity = cantidad;
    item.index = indice;
    return item;
  }

  /* Todos los ítems del carrito, con el cupón si está activo. */
  function itemsGA4() {
    var codigo = cupon();
    return lineas().map(function (l, i) { return itemGA4(l.producto, l.cantidad, i, codigo); });
  }

  /* Suma de price × quantity. */
  function valor(items) {
    return items.reduce(function (total, it) { return total + it.price * it.quantity; }, 0);
  }

  function subtotalSinDescuento() {
    return lineas().reduce(function (t, l) { return t + l.producto.precio * l.cantidad; }, 0);
  }

  function unidades() {
    return lineas().reduce(function (t, l) { return t + l.cantidad; }, 0);
  }

  function actualizarContador() {
    var n = unidades();
    var nodos = document.querySelectorAll("[data-contador-carrito]");
    for (var i = 0; i < nodos.length; i++) {
      nodos[i].textContent = n;
      nodos[i].hidden = n === 0;
      nodos[i].setAttribute("aria-label", n + (n === 1 ? " producto" : " productos"));
    }
  }

  window.Carrito = {
    CUPON: CUPON,
    lineas: lineas,
    cantidadDe: cantidadDe,
    agregar: agregar,
    disminuir: disminuir,
    eliminar: eliminar,
    aplicarCupon: aplicarCupon,
    quitarCupon: quitarCupon,
    cupon: cupon,
    vaciar: vaciar,
    itemGA4: itemGA4,
    itemsGA4: itemsGA4,
    valor: valor,
    subtotalSinDescuento: subtotalSinDescuento,
    unidades: unidades,
    actualizarContador: actualizarContador
  };

  actualizarContador();
})();
