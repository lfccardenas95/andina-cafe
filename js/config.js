/* ==========================================================================
   CONFIGURACIÓN DE LA TIENDA ALTURA
   Este es el ÚNICO archivo que necesitas editar.
   --------------------------------------------------------------------------
   CÓMO CONECTAR TU PROPIEDAD DE GOOGLE ANALYTICS 4

   1. Entra a analytics.google.com y abre tu propiedad GA4.
   2. Ve a  Administrar  >  Recopilación y modificación de datos  >
      Flujos de datos  y abre tu flujo web.
   3. Copia el "ID de medición". Empieza por G- y se ve así: G-AB12CD34EF
   4. Pégalo abajo, ENTRE LAS COMILLAS, en lugar de G-XXXXXXXXXX.
      Ejemplo:  GA_MEASUREMENT_ID: "G-AB12CD34EF",
   5. Guarda el archivo (en GitHub: botón "Commit changes"). Vercel publica
      la nueva versión en uno o dos minutos.

   Mientras el ID siga siendo G-XXXXXXXXXX, la tienda NO carga Google
   Analytics: los eventos solo se ven en el monitor de la derecha.

   DEBUG_MODE
     true  -> los eventos aparecen en GA4, en Administrar > DebugView.
              Úsalo durante el laboratorio.
     false -> uso normal. No se envía el parámetro debug_mode.
   ========================================================================== */

window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // <-- Pega aquí tu ID de medición
  DEBUG_MODE: true                   // <-- true durante el laboratorio
};
