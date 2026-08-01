/* ============================================================
   maps.js — Google Maps button
   ------------------------------------------------------------
   Change VENUE_QUERY (or paste a full share URL into VENUE_URL)
   to update the destination. The universal "maps/search" link
   automatically opens the Google Maps app on Android & iPhone
   when installed, and falls back to the browser otherwise.
   ============================================================ */

(function () {
  "use strict";

  /* ✏️ Edit this to change the venue location */
  var VENUE_QUERY = "Vina Hall, 10th of Ramadan City, Egypt";

  /* Optional: paste an exact Google Maps share link here to
     override the query above (leave empty to use the query). */
  var VENUE_URL = "";

  var url =
    VENUE_URL ||
    "https://maps.app.goo.gl/Ua4B5QUfUKviTWSZ7?g_st=aw" +
      encodeURIComponent(VENUE_QUERY);

  document.querySelectorAll("[data-map-btn]").forEach(function (btn) {
    btn.setAttribute("href", url);
    btn.setAttribute("target", "_blank");
    btn.setAttribute("rel", "noopener");
  });
})();
