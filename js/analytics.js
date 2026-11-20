/* ==========================================================================
   MEDICIÓN CON GOOGLE ANALYTICS 4 + MONITOR DE EVENTOS
   --------------------------------------------------------------------------
   - Carga gtag.js solo si el ID de js/config.js es válido (G-...) y no es
     el marcador G-XXXXXXXXXX.
   - Expone dos funciones globales:
       enviarEvento(nombre, parametros)
       enviarEventoYNavegar(nombre, parametros, url)
   - Dibuja el monitor de eventos (panel derecho) con fines didácticos.
   No edites este archivo: la configuración está en js/config.js.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Configuración ---------- */
  var CONFIG = window.TIENDA_CONFIG || {};
  var ID = String(CONFIG.GA_MEASUREMENT_ID || "").trim();
  var DEBUG = CONFIG.DEBUG_MODE === true;
  var MARCADOR = "G-XXXXXXXXXX";
  var CONECTADO = /^G-[A-Z0-9]{4,}$/.test(ID) && ID !== MARCADOR;

  var K_EVENTOS = "altura_monitor_eventos";   // sessionStorage
  var K_ORIGEN = "altura_origen_visita";      // sessionStorage
  var K_PLEGADO = "altura_monitor_plegado";   // localStorage
  var K_CARRITO = "altura_carrito";           // localStorage (ver carrito.js)
  var MAX_EVENTOS = 12;

  /* ---------- Almacenamiento seguro ---------- */
  function leer(almacen, clave) {
    try { return window[almacen].getItem(clave); } catch (e) { return null; }
  }
  function escribir(almacen, clave, valor) {
    try { window[almacen].setItem(clave, valor); } catch (e) { /* sin almacenamiento */ }
  }

  /* ---------- Estado del panel (antes de pintar la página) ---------- */
  var plegado = leer("localStorage", K_PLEGADO) === "1";
  document.documentElement.classList.add(plegado ? "monitor-plegado" : "monitor-abierto");

  /* ---------- Carga de gtag.js ---------- */
  if (CONECTADO) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(script);

    window.gtag("js", new Date());
    if (DEBUG) {
      window.gtag("config", ID, { debug_mode: true });
    } else {
      window.gtag("config", ID);
    }
  }

  /* ---------- Origen de la visita (primera página de la sesión) ---------- */
  if (leer("sessionStorage", K_ORIGEN) === null) {
    var q = new URLSearchParams(window.location.search);
    var fuente = q.get("utm_source");
    var medio = q.get("utm_medium");
    var campana = q.get("utm_campaign");
    var origen = (fuente || medio || campana)
      ? (fuente || "(sin utm_source)") + " / " + (medio || "(sin utm_medium)") + " · " + (campana || "(sin utm_campaign)")
      : "directo (sin UTM)";
    escribir("sessionStorage", K_ORIGEN, origen);
  }

  /* ---------- Registro del monitor ---------- */
  function leerEventos() {
    try { return JSON.parse(leer("sessionStorage", K_EVENTOS)) || []; } catch (e) { return []; }
  }

  function hora() {
    var d = new Date();
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(function (n) { return String(n).padStart(2, "0"); }).join(":");
  }

  function numero(n) {
    return new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(n);
  }

  function resumir(nombre, p) {
    if (nombre === "page_view") return p.page_title + " (" + p.page_path + ")";
    if (nombre === "user_properties") {
      return Object.keys(p).map(function (k) { return k + " = " + p[k]; }).join(", ");
    }
    var partes = [];
    if (p.item_list_name) partes.push(p.item_list_name);
    if (p.promotion_id) partes.push(p.promotion_id + " en " + p.creative_slot);
    if (p.transaction_id) partes.push(p.transaction_id);
    if (typeof p.value === "number") partes.push("value " + numero(p.value) + " " + p.currency);
    if (typeof p.shipping === "number") partes.push("envío " + numero(p.shipping));
    if (Array.isArray(p.items)) {
      var uds = p.items.reduce(function (t, it) { return t + (it.quantity || 0); }, 0);
      partes.push(p.items.length === 1
        ? p.items[0].item_name + " × " + p.items[0].quantity
        : p.items.length + " productos, " + uds + " uds.");
    }
    if (p.coupon) partes.push("cupón " + p.coupon);
    if (p.shipping_tier) partes.push(p.shipping_tier);
    if (p.payment_type) partes.push("pago: " + p.payment_type);
    if (p.tipo_cliente) partes.push("cliente " + p.tipo_cliente);
    return partes.join(", ");
  }

  function registrar(nombre, parametros, tipo) {
    var lista = leerEventos();
    lista.push({
      hora: hora(),
      nombre: nombre,
      tipo: tipo,
      resumen: resumir(nombre, parametros),
      parametros: parametros
    });
    if (lista.length > MAX_EVENTOS) lista = lista.slice(lista.length - MAX_EVENTOS);
    escribir("sessionStorage", K_EVENTOS, JSON.stringify(lista));
    pintarLista();
  }

  /* page_view: gtag('config') lo envía solo; aquí solo se muestra en el monitor. */
  registrar("page_view", {
    page_title: document.title,
    page_path: window.location.pathname + window.location.search,
    page_location: window.location.href
  }, "pagina");

  /* ---------- Funciones públicas ---------- */
  function conMoneda(parametros) {
    var datos = { currency: "COP" };
    for (var k in parametros) {
      if (Object.prototype.hasOwnProperty.call(parametros, k)) datos[k] = parametros[k];
    }
    datos.currency = "COP";
    return datos;
  }

  /* Envía un evento a GA4 (si hay ID) y lo muestra en el monitor. */
  function enviarEvento(nombre, parametros) {
    var datos = conMoneda(parametros || {});
    registrar(nombre, datos, "evento");
    if (CONECTADO) window.gtag("event", nombre, datos);
  }

  /* Envía un evento y luego navega a "url".
     Espera la confirmación de GA4 (event_callback) con un límite de 1000 ms
     y un respaldo de 1200 ms por si gtag.js no llega a cargar. */
  function enviarEventoYNavegar(nombre, parametros, url) {
    var datos = conMoneda(parametros || {});
    registrar(nombre, datos, "evento");

    var hecho = false;
    function navegar() {
      if (hecho) return;
      hecho = true;
      window.location.href = url;
    }

    if (!CONECTADO) { navegar(); return; }

    var conRetorno = {};
    for (var k in datos) conRetorno[k] = datos[k];
    conRetorno.event_callback = navegar;
    conRetorno.event_timeout = 1000;
    window.gtag("event", nombre, conRetorno);
    window.setTimeout(navegar, 1200);
  }

  /* gtag('set', 'user_properties', {...}) */
  function establecerPropiedadesUsuario(propiedades) {
    registrar("user_properties", propiedades, "propiedad");
    if (CONECTADO) window.gtag("set", "user_properties", propiedades);
  }

  window.enviarEvento = enviarEvento;
  window.enviarEventoYNavegar = enviarEventoYNavegar;
  window.Analitica = {
    conectado: CONECTADO,
    enviarEvento: enviarEvento,
    enviarEventoYNavegar: enviarEventoYNavegar,
    establecerPropiedadesUsuario: establecerPropiedadesUsuario
  };

  /* ---------- Simular nuevo visitante ---------- */
  function borrarCookiesGA() {
    var host = window.location.hostname;
    var partes = host.split(".");
    var dominios = ["", host, "." + host];
    for (var i = 1; i < partes.length; i++) {
      var d = partes.slice(i).join(".");
      dominios.push(d, "." + d);
    }
    var nombres = document.cookie.split(";")
      .map(function (c) { return c.split("=")[0].trim(); })
      .filter(function (n) { return n.indexOf("_ga") === 0 || n === "_gid"; });
    nombres.forEach(function (n) {
      dominios.forEach(function (dom) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/" +
          (dom ? "; domain=" + dom : "");
      });
    });
  }

  function simularNuevoVisitante() {
    borrarCookiesGA();
    try { localStorage.removeItem(K_CARRITO); } catch (e) { /* nada */ }
    try { sessionStorage.clear(); } catch (e) { /* nada */ }
    window.location.href = "index.html";
  }

  /* ---------- Panel del monitor ---------- */
  var panel = null;

  function escapar(t) {
    return String(t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function pintarLista() {
    if (!panel) return;
    var ul = panel.querySelector(".monitor-lista");
    var eventos = leerEventos().slice().reverse();
    if (!eventos.length) {
      ul.innerHTML = '<li class="monitor-vacio">Aún no hay eventos en esta sesión.</li>';
      return;
    }
    ul.innerHTML = eventos.map(function (ev) {
      var clase = ev.tipo === "pagina" ? "ev-pagina" : ev.tipo === "propiedad" ? "ev-propiedad" : "ev-evento";
      return '<li class="' + clase + '"><details>' +
        '<summary><span class="ev-hora">' + escapar(ev.hora) + '</span>' +
        '<span class="ev-nombre">' + escapar(ev.nombre) + '</span>' +
        '<span class="ev-resumen">' + escapar(ev.resumen) + '</span></summary>' +
        '<pre>' + escapar(JSON.stringify(ev.parametros, null, 2)) + '</pre>' +
        '</details></li>';
    }).join("");
  }

  function aplicarPlegado(estado) {
    plegado = estado;
    var raiz = document.documentElement;
    raiz.classList.toggle("monitor-plegado", plegado);
    raiz.classList.toggle("monitor-abierto", !plegado);
    escribir("localStorage", K_PLEGADO, plegado ? "1" : "0");
    var boton = panel.querySelector(".monitor-toggle");
    boton.textContent = plegado ? "Mostrar" : "Ocultar";
    boton.setAttribute("aria-expanded", String(!plegado));
  }

  function crearPanel() {
    panel = document.createElement("aside");
    panel.className = "monitor";
    panel.setAttribute("aria-label", "Monitor de eventos de Google Analytics 4");

    var estado = CONECTADO
      ? '<p class="monitor-estado ok">Conectado a ' + escapar(ID) + (DEBUG ? " · modo depuración" : "") + '</p>'
      : '<p class="monitor-estado error">Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.</p>';

    panel.innerHTML =
      '<div class="monitor-cabecera">' +
        '<span class="monitor-titulo">Monitor de eventos GA4</span>' +
        '<button type="button" class="monitor-toggle" aria-controls="monitor-cuerpo"></button>' +
      '</div>' +
      '<div class="monitor-cuerpo" id="monitor-cuerpo">' +
        estado +
        '<p class="monitor-origen">Origen de la visita: <strong>' + escapar(leer("sessionStorage", K_ORIGEN) || "directo (sin UTM)") + '</strong></p>' +
        '<p class="monitor-subtitulo">Últimos ' + MAX_EVENTOS + ' eventos (el más reciente arriba). Toca uno para ver sus parámetros.</p>' +
        '<ul class="monitor-lista" aria-live="polite"></ul>' +
        '<div class="monitor-pie"><button type="button" class="monitor-reset">Simular nuevo visitante</button></div>' +
      '</div>';

    document.body.appendChild(panel);
    panel.querySelector(".monitor-toggle").addEventListener("click", function () { aplicarPlegado(!plegado); });
    panel.querySelector(".monitor-reset").addEventListener("click", simularNuevoVisitante);
    aplicarPlegado(plegado);
    pintarLista();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", crearPanel);
  } else {
    crearPanel();
  }
})();
