/* ============================================================
   animation.js — entrance sequence & scroll reveals
   ------------------------------------------------------------
   • Elements with [data-seq="n"] animate in order on page load
     (background → title → text → names → …).
   • Elements with [data-reveal] animate when scrolled into view.
   • Respects prefers-reduced-motion.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Entrance sequence ---------- */
  function runSequence() {
    /* Background / florals first */
    document.body.classList.add("is-ready");

    var items = Array.prototype.slice.call(document.querySelectorAll("[data-seq]"));
    items.sort(function (a, b) {
      return Number(a.dataset.seq) - Number(b.dataset.seq);
    });

    if (reduceMotion) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var delay = 350; /* let the background breathe first */
    items.forEach(function (el) {
      setTimeout(function () {
        el.classList.add("is-in");
      }, delay);
      delay += 320; /* slow, luxurious cadence */
    });
  }

  /* ---------- 2. Scroll reveals ---------- */
  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal], [data-stagger], .divider");
    if (!targets.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Boot after the loader hides ---------- */
  document.addEventListener("wedding:loaded", function () {
    runSequence();
    initReveals();
  });
})();
