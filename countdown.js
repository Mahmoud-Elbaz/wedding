/* ============================================================
   countdown.js — live countdown to the wedding
   Target: Saturday 8 August 2026, 9:00 PM (Egypt, UTC+3)
   Markup: .countdown with [data-days] [data-hours]
           [data-minutes] [data-seconds] and a sibling
           .countdown__done shown when the moment arrives.
   ============================================================ */

(function () {
  "use strict";

  /* Change the wedding moment here if needed */
  var WEDDING_DATE = new Date("2026-08-08T21:00:00+03:00");

  var root = document.querySelector(".countdown");
  if (!root) return;

  var els = {
    days: root.querySelector("[data-days]"),
    hours: root.querySelector("[data-hours]"),
    minutes: root.querySelector("[data-minutes]"),
    seconds: root.querySelector("[data-seconds]")
  };
  var doneEl = document.querySelector(".countdown__done");
  var timer = null;

  /** Zero-pad to two digits. */
  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  /** Write a value and pulse the number if it changed. */
  function setValue(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    el.classList.remove("tick");
    /* restart the settle animation */
    void el.offsetWidth;
    el.classList.add("tick");
  }

  function render() {
    var diff = WEDDING_DATE.getTime() - Date.now();

    if (diff <= 0) {
      clearInterval(timer);
      root.classList.add("is-done");
      if (doneEl) doneEl.classList.add("is-visible", "is-in");
      return;
    }

    var s = Math.floor(diff / 1000);
    setValue(els.days, pad(Math.floor(s / 86400)));
    setValue(els.hours, pad(Math.floor((s % 86400) / 3600)));
    setValue(els.minutes, pad(Math.floor((s % 3600) / 60)));
    setValue(els.seconds, pad(s % 60));
  }

  render();
  timer = setInterval(render, 1000);
})();
