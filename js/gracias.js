/* ==========================================================================
   CONFIRMACIÓN DEL PEDIDO (gracias.html)
   Evento: purchase, una sola vez por pedido.
   Antes de purchase: gtag('set', 'user_properties', { tipo_cliente })
   ========================================================================== */

(function () {
  "use strict";

  var CLAVE = "altura_pedido";
  var contenedor = document.getElementById("contenido-gracias");

  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem(CLAVE)); } catch (e) { pedido = null; }

  if (!pedido || !Array.isArray(pedido.items)) {
    contenedor.innerHTML =
      '<div class="confirmacion">' +
        '<h1>No hay un pedido reciente</h1>' +
        '<p class="bajada">Esta página aparece después de pagar. Explora el catálogo para hacer una compra simulada.</p>' +
        '<a class="boton" href="index.html#catalogo">Ver el catálogo</a>' +
      '</div>';
    return;
  }

  var yaEnviado = pedido.enviado === true;

  if (!yaEnviado) {
    window.Analitica.establecerPropiedadesUsuario({ tipo_cliente: pedido.tipo_cliente });

    var parametros = {
      transaction_id: pedido.transaction_id,
      affiliation: pedido.affiliation,
      value: pedido.value,
      shipping: pedido.shipping
    };
    if (pedido.coupon) parametros.coupon = pedido.coupon;
    parametros.tipo_cliente = pedido.tipo_cliente;
    parametros.items = pedido.items;

    enviarEvento("purchase", parametros);

    // Marcado como enviado: recargar esta página no repite la compra.
    pedido.enviado = true;
    try { sessionStorage.setItem(CLAVE, JSON.stringify(pedido)); } catch (e) { /* sin almacenamiento */ }
  }

  var subtotalLista = pedido.items.reduce(function (t, it) { return t + (it.price + (it.discount || 0)) * it.quantity; }, 0);

  contenedor.innerHTML =
    '<div class="confirmacion">' +
      '<svg class="icono" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#1E8E3E"/><path d="M19 33 l9 9 l17 -19" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<h1>Pedido confirmado</h1>' +
      '<p class="bajada">Gracias por tu compra simulada. No se cobró ningún valor.</p>' +
      '<p class="numero-pedido">Número de pedido <code>' + escaparHTML(pedido.transaction_id) + '</code></p>' +
      (yaEnviado
        ? '<p class="aviso">Este pedido ya se registró en Google Analytics. Recargar la página no envía otra compra.</p>'
        : '') +
      '<div class="resumen">' +
        '<h2>Resumen</h2>' +
        '<ul class="mini-items">' + pedido.items.map(function (it) {
          return '<li><span>' + escaparHTML(it.item_name) + ' × ' + it.quantity + '</span><span>' + formatoCOP(it.price * it.quantity) + '</span></li>';
        }).join("") + '</ul>' +
        (pedido.coupon
          ? '<div class="resumen-fila"><span>Subtotal</span><span>' + formatoCOP(subtotalLista) + '</span></div>' +
            '<div class="resumen-fila descuento"><span>Descuento ' + escaparHTML(pedido.coupon) + '</span><span>−' + formatoCOP(subtotalLista - pedido.value) + '</span></div>'
          : '') +
        '<div class="resumen-fila"><span>Productos</span><span>' + formatoCOP(pedido.value) + '</span></div>' +
        '<div class="resumen-fila"><span>Envío ' + escaparHTML(pedido.shipping_tier) + ' a ' + escaparHTML(pedido.pais) + '</span><span>' + (pedido.shipping === 0 ? "Gratis" : formatoCOP(pedido.shipping)) + '</span></div>' +
        '<div class="resumen-fila"><span>Medio de pago</span><span>' + escaparHTML(pedido.payment_type) + '</span></div>' +
        '<div class="resumen-fila resumen-total"><span>Total pagado</span><span>' + formatoCOP(pedido.value + pedido.shipping) + '</span></div>' +
      '</div>' +
      '<a class="boton" href="index.html">Volver a la tienda</a>' +
    '</div>';
})();
