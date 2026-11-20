/* ==========================================================================
   PÁGINA DE INICIO (index.html)
   Eventos: view_item_list, select_item, view_promotion, select_promotion
   ========================================================================== */

(function () {
  "use strict";

  var LISTA = { item_list_id: "catalogo_principal", item_list_name: "Catálogo principal" };

  var PROMO = {
    promotion_id: "BIENVENIDA10",
    promotion_name: "Bienvenida 10 %",
    creative_name: "banner_hero_bienvenida",
    creative_slot: "inicio_hero"
  };

  /* Ítems a precio de lista (sin cupón), con su posición en el catálogo. */
  function itemsCatalogo() {
    return window.PRODUCTOS.map(function (p, i) { return window.Carrito.itemGA4(p, 1, i, null); });
  }

  /* ---------- Catálogo ---------- */
  var grilla = document.getElementById("grilla-productos");
  grilla.innerHTML = window.PRODUCTOS.map(function (p, i) {
    return '<a class="tarjeta-producto" href="producto.html?id=' + encodeURIComponent(p.id) + '" data-indice="' + i + '">' +
      '<div class="ilustracion" style="background:' + p.tono + '">' +
        (p.insignia ? '<span class="insignia">' + escaparHTML(p.insignia) + '</span>' : '') +
        window.ilustracionProducto(p) + '</div>' +
      '<div class="tarjeta-info">' +
        '<span class="tarjeta-categoria">' + escaparHTML(p.categoria) + '</span>' +
        '<span class="tarjeta-nombre">' + escaparHTML(p.nombre) + '</span>' +
        '<span class="tarjeta-resumen">' + escaparHTML(p.resumen) + '</span>' +
        '<span class="tarjeta-precio">' + formatoCOP(p.precio) + '</span>' +
      '</div></a>';
  }).join("");

  /* ---------- Cuatro orígenes (solo informativo, sin eventos) ---------- */
  var origenes = document.getElementById("origenes");
  if (origenes) {
    origenes.innerHTML = window.PRODUCTOS
      .filter(function (p) { return p.altitudM; })
      .sort(function (a, b) { return a.altitudM - b.altitudM; })
      .map(function (p) {
        var region = p.ficha[0][1];
        var nombreCorto = p.nombre.replace(/ \d+ g$/, "");
        var porcentaje = Math.round((p.altitudM - 1300) / 900 * 100);
        return '<article class="origen" style="--color-origen:' + p.color + '">' +
          '<p class="origen-region">' + escaparHTML(region) + '</p>' +
          '<h3>' + escaparHTML(nombreCorto) + '</h3>' +
          '<div class="origen-altura"><span>' + p.altitudM.toLocaleString("es-CO") + ' m</span>' +
            '<span class="origen-barra" aria-hidden="true"><span style="width:' + porcentaje + '%"></span></span></div>' +
          '<p class="origen-proceso">Proceso ' + escaparHTML(p.ficha[2][1].toLowerCase()) + '</p>' +
          '<ul class="notas" aria-label="Notas de cata">' + p.notas.map(function (n) { return '<li>' + escaparHTML(n) + '</li>'; }).join("") + '</ul>' +
          '<p class="origen-precio">' + formatoCOP(p.precio) + ' en el <a href="#catalogo">catálogo</a></p>' +
        '</article>';
      }).join("");
  }

  enviarEvento("view_item_list", {
    item_list_id: LISTA.item_list_id,
    item_list_name: LISTA.item_list_name,
    items: itemsCatalogo()
  });

  grilla.addEventListener("click", function (e) {
    var tarjeta = e.target.closest(".tarjeta-producto");
    if (!tarjeta) return;
    var indice = Number(tarjeta.getAttribute("data-indice"));
    var producto = window.PRODUCTOS[indice];
    var parametros = {
      item_list_id: LISTA.item_list_id,
      item_list_name: LISTA.item_list_name,
      items: [window.Carrito.itemGA4(producto, 1, indice, null)]
    };
    // Si abre en otra pestaña, se envía sin esperar.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      enviarEvento("select_item", parametros);
      return;
    }
    e.preventDefault();
    enviarEventoYNavegar("select_item", parametros, tarjeta.href);
  });

  /* ---------- Banner del cupón ---------- */
  var banner = document.getElementById("banner-bienvenida");

  function parametrosPromo() {
    return {
      promotion_id: PROMO.promotion_id,
      promotion_name: PROMO.promotion_name,
      creative_name: PROMO.creative_name,
      creative_slot: PROMO.creative_slot,
      items: itemsCatalogo()
    };
  }

  var promoVista = false;
  function registrarVistaPromo() {
    if (promoVista) return;
    promoVista = true;
    enviarEvento("view_promotion", parametrosPromo());
  }

  // view_promotion cuando al menos la mitad del banner está en pantalla.
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          registrarVistaPromo();
          observador.disconnect();
        }
      });
    }, { threshold: 0.5 });
    observador.observe(banner);
  } else {
    registrarVistaPromo();
  }

  banner.addEventListener("click", function (e) {
    e.preventDefault();
    registrarVistaPromo(); // por si el clic llega antes de que se registre la vista
    window.Carrito.aplicarCupon(PROMO.promotion_id);
    enviarEventoYNavegar("select_promotion", parametrosPromo(), "carrito.html");
  });
})();
