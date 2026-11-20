/* ==========================================================================
   CATÁLOGO DE PRODUCTOS
   Ocho productos ficticios. Precios enteros en pesos colombianos (COP).
   Las ilustraciones son SVG dibujados en este archivo: no hay imágenes externas.
   ========================================================================== */

window.TIENDA = {
  marca: "Altura",
  afiliacion: "Altura Café Online"
};

window.PRODUCTOS = [
  {
    id: "CAF-001",
    notas: ["Panela", "Mandarina", "Chocolate con leche"], altitudM: 1700,
    nombre: "Huila Lavado 340 g",
    categoria: "Café en grano",
    precio: 42000,
    descripcion: "Café lavado de pequeños productores del sur del Huila. Notas a panela, mandarina y chocolate con leche. Tueste medio, ideal para métodos de filtrado y prensa francesa.",
    resumen: "Pitalito, Huila, a 1.700 m",
    ficha: [["Origen", "Pitalito, Huila"], ["Altitud", "1.700 m s. n. m."], ["Proceso", "Lavado"], ["Tueste", "Medio"]],
    dibujo: "bolsa", siglas: "HU", tono: "#EADFD0", color: "#6F4E37"
  },
  {
    id: "CAF-002",
    notas: ["Durazno", "Caramelo", "Miel de caña"], altitudM: 2100,
    nombre: "Nariño Honey 340 g",
    categoria: "Café en grano",
    precio: 48000,
    descripcion: "Proceso honey: el grano se seca con parte de su mucílago y gana dulzor. Taza redonda con notas a durazno, caramelo y miel de caña.",
    resumen: "La Unión, Nariño, a 2.100 m",
    ficha: [["Origen", "La Unión, Nariño"], ["Altitud", "2.100 m s. n. m."], ["Proceso", "Honey"], ["Tueste", "Medio claro"]],
    dibujo: "bolsa", siglas: "NA", tono: "#F1E2C6", color: "#A0662A"
  },
  {
    id: "CAF-003",
    notas: ["Jazmín", "Bergamota", "Té negro"], altitudM: 1900, insignia: "Edición limitada",
    nombre: "Geisha Tolima Edición Limitada 250 g",
    categoria: "Café en grano",
    precio: 89000,
    descripcion: "Variedad Geisha de una sola finca del sur del Tolima, en lotes pequeños. Taza floral con notas a jazmín, bergamota y té negro.",
    resumen: "Planadas, Tolima, a 1.900 m",
    ficha: [["Origen", "Planadas, Tolima"], ["Altitud", "1.900 m s. n. m."], ["Proceso", "Lavado, fermentación larga"], ["Tueste", "Claro"]],
    dibujo: "bolsa", siglas: "GE", tono: "#E4E6DA", color: "#4E5B3C"
  },
  {
    id: "CAF-004",
    notas: ["Cacao", "Nuez", "Cuerpo medio"], altitudM: 1500, insignia: "Descafeinado",
    nombre: "Sierra Nevada Descafeinado 340 g",
    categoria: "Café molido",
    precio: 39000,
    descripcion: "Descafeinado con proceso de agua de montaña, sin solventes. Conserva el cuerpo y las notas a cacao y nuez del café de la Sierra Nevada.",
    resumen: "Sierra Nevada, a 1.500 m",
    ficha: [["Origen", "Sierra Nevada de Santa Marta"], ["Altitud", "1.500 m s. n. m."], ["Proceso", "Descafeinado con agua"], ["Molienda", "Media, para filtro"]],
    dibujo: "bolsa", siglas: "SN", tono: "#E3E1DE", color: "#3F3A36"
  },
  {
    id: "MET-001",
    nombre: "Prensa francesa 600 ml",
    categoria: "Métodos de preparación",
    precio: 95000,
    descripcion: "Prensa de vidrio borosilicato y acero inoxidable con filtro de malla fina. Prepara hasta cuatro tazas de café con cuerpo.",
    resumen: "Vidrio y acero, 4 tazas",
    ficha: [["Material", "Vidrio borosilicato y acero"], ["Capacidad", "600 ml, 4 tazas"], ["Molienda ideal", "Gruesa"]],
    dibujo: "prensa", siglas: "PF", tono: "#E2EBF3", color: "#1D1D1F"
  },
  {
    id: "MET-002",
    nombre: "Gotero cerámico V60",
    categoria: "Métodos de preparación",
    precio: 68000,
    descripcion: "Gotero cónico de cerámica esmaltada para filtros de papel tipo V60. Retiene el calor y da tazas limpias y brillantes.",
    resumen: "Cerámica, 1 a 2 tazas",
    ficha: [["Material", "Cerámica esmaltada"], ["Rinde", "1 a 2 tazas"], ["Filtro", "Papel cónico tipo 02"]],
    dibujo: "gotero", siglas: "V6", tono: "#E8EEF2", color: "#6F4E37"
  },
  {
    id: "ACC-001",
    nombre: "Molino manual de acero",
    categoria: "Accesorios",
    precio: 159000,
    descripcion: "Molino manual con muelas cónicas de acero y 30 niveles de molienda, del espresso a la prensa francesa. Cabe en una maleta de viaje.",
    resumen: "Muelas cónicas, 30 niveles",
    ficha: [["Material", "Acero inoxidable y aluminio"], ["Ajuste", "30 niveles de molienda"], ["Capacidad", "25 g de café"]],
    dibujo: "molino", siglas: "MM", tono: "#ECECEE", color: "#B5651D"
  },
  {
    id: "ACC-002",
    nombre: "Taza de cerámica Altura 350 ml",
    categoria: "Accesorios",
    precio: 35000,
    descripcion: "Taza hecha a mano en Ráquira, Boyacá, con esmalte mate. Cada pieza tiene pequeñas variaciones de color.",
    resumen: "Hecha a mano en Ráquira",
    ficha: [["Material", "Cerámica artesanal"], ["Capacidad", "350 ml"], ["Cuidado", "Apta para lavavajillas"]],
    dibujo: "taza", siglas: "TZ", tono: "#F0E6DA", color: "#8C5A3C"
  }
];

/* Busca un producto por su id (no distingue mayúsculas). */
window.obtenerProducto = function (id) {
  if (!id) return null;
  var buscado = String(id).trim().toUpperCase();
  for (var i = 0; i < window.PRODUCTOS.length; i++) {
    if (window.PRODUCTOS[i].id === buscado) return window.PRODUCTOS[i];
  }
  return null;
};

/* Posición del producto en el catálogo (0, 1, 2...). */
window.posicionEnCatalogo = function (producto) {
  return window.PRODUCTOS.indexOf(producto);
};

/* 42000 -> "$42.000" */
window.formatoCOP = function (valor) {
  return "$" + new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(Math.round(valor));
};

/* Escapa texto antes de insertarlo como HTML. */
window.escaparHTML = function (texto) {
  return String(texto).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
};

/* Ilustración SVG propia de cada producto. */
window.ilustracionProducto = function (p) {
  var c = p.color;
  var dibujos = {
    bolsa:
      '<path d="M84 44 h72 l8 22 H76 z" fill="' + c + '"/>' +
      '<path d="M76 66 h88 l8 136 a10 10 0 0 1 -10 11 H78 a10 10 0 0 1 -10 -11 z" fill="#FFFFFF"/>' +
      '<path d="M76 66 h88 l8 136 a10 10 0 0 1 -10 11 H78 a10 10 0 0 1 -10 -11 z" fill="none" stroke="' + c + '" stroke-opacity=".35" stroke-width="2"/>' +
      '<rect x="88" y="104" width="64" height="74" rx="10" fill="' + c + '"/>' +
      '<text x="120" y="146" text-anchor="middle" font-family="-apple-system, Segoe UI, Arial, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">' + p.siglas + '</text>' +
      '<text x="120" y="166" text-anchor="middle" font-family="-apple-system, Segoe UI, Arial, sans-serif" font-size="11" fill="#FFFFFF" fill-opacity=".8">' + p.id + '</text>' +
      '<circle cx="120" cy="84" r="4" fill="' + c + '" fill-opacity=".5"/>',
    prensa:
      '<rect x="116" y="26" width="8" height="40" rx="3" fill="#1D1D1F"/>' +
      '<circle cx="120" cy="26" r="9" fill="#1D1D1F"/>' +
      '<rect x="72" y="62" width="96" height="14" rx="6" fill="#1D1D1F"/>' +
      '<rect x="78" y="76" width="84" height="124" rx="8" fill="#FFFFFF" fill-opacity=".85" stroke="#1D1D1F" stroke-width="3"/>' +
      '<rect x="82" y="122" width="76" height="74" rx="5" fill="#6F4E37"/>' +
      '<rect x="82" y="116" width="76" height="8" fill="#C8A27C"/>' +
      '<path d="M162 92 h14 a10 10 0 0 1 10 10 v66 a10 10 0 0 1 -10 10 h-14" fill="none" stroke="#1D1D1F" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="72" y="200" width="96" height="10" rx="4" fill="#1D1D1F"/>',
    gotero:
      '<path d="M62 62 h116 l-38 70 h-40 z" fill="#FFFFFF" stroke="' + c + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<path d="M96 70 l12 54 M120 70 v54 M144 70 l-12 54" stroke="' + c + '" stroke-opacity=".3" stroke-width="2"/>' +
      '<rect x="88" y="132" width="64" height="9" rx="4" fill="' + c + '"/>' +
      '<path d="M82 146 h76 v34 a26 26 0 0 1 -26 26 h-24 a26 26 0 0 1 -26 -26 z" fill="#1D1D1F"/>' +
      '<path d="M158 156 h6 a14 14 0 0 1 0 28 h-8" fill="none" stroke="#1D1D1F" stroke-width="7"/>' +
      '<path d="M120 141 v8" stroke="#6F4E37" stroke-width="4" stroke-linecap="round"/>',
    molino:
      '<path d="M120 70 V48 H178" fill="none" stroke="#1D1D1F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<rect x="170" y="30" width="16" height="30" rx="8" fill="' + c + '"/>' +
      '<rect x="96" y="66" width="48" height="16" rx="5" fill="#1D1D1F"/>' +
      '<rect x="88" y="80" width="64" height="128" rx="14" fill="#C9CCD1"/>' +
      '<rect x="88" y="80" width="18" height="128" rx="9" fill="#FFFFFF" fill-opacity=".45"/>' +
      '<rect x="88" y="150" width="64" height="12" fill="#1D1D1F" fill-opacity=".18"/>',
    taza:
      '<path d="M98 66 c-8 12 8 18 0 30 M124 58 c-8 12 8 18 0 30" fill="none" stroke="#86868B" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M66 106 h100 v58 a38 38 0 0 1 -38 38 h-24 a38 38 0 0 1 -38 -38 z" fill="' + c + '"/>' +
      '<path d="M166 120 h8 a22 22 0 0 1 0 44 h-12" fill="none" stroke="' + c + '" stroke-width="11"/>' +
      '<rect x="66" y="106" width="100" height="10" fill="#FFFFFF" fill-opacity=".2"/>' +
      '<ellipse cx="116" cy="210" rx="70" ry="8" fill="#1D1D1F" fill-opacity=".08"/>'
  };
  return '<svg viewBox="0 0 240 240" role="img" aria-label="Ilustración de ' + escaparHTML(p.nombre) + '">' +
    (dibujos[p.dibujo] || dibujos.bolsa) + '</svg>';
};
