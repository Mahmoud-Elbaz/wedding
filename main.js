/* ============================================================
   main.js — loader, back-to-top, wishes form, PWA registration
   Shared by index.html, arabic.html and english.html.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 1. Loading screen ---------- */
  function hideLoader() {
    var loader = document.querySelector(".loader");
    if (loader) loader.classList.add("is-hidden");
    /* Tell animation.js it may start the entrance sequence */
    document.dispatchEvent(new CustomEvent("wedding:loaded"));
  }

  if (document.readyState === "complete") {
    setTimeout(hideLoader, 500);
  } else {
    window.addEventListener("load", function () {
      /* Small pause so the loader never "flashes" */
      setTimeout(hideLoader, 500);
    });
    /* Safety net: never trap the user behind the loader */
    setTimeout(hideLoader, 4000);
  }

  /* ---------- 2. Back to top ---------- */
  var toTop = document.querySelector(".to-top");
  if (toTop) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          toTop.classList.toggle("is-visible", window.scrollY > 500);
          ticking = false;
        });
      },
      { passive: true }
    );

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- 3. Wishes form ---------- */
  var form = document.querySelector("[data-wishes-form]");
  if (form) {
    var statusEl = form.querySelector(".form-status");
    var submitBtn = form.querySelector("button[type='submit']");
    var lang = document.documentElement.lang === "ar" ? "ar" : "en";

    var TEXT = {
      en: {
        sending: "Sending…",
        sent: "Thank you! Your wishes have been sent ❤️",
        empty: "Please write your name and a message.",
        error: "Something went wrong — please try again.",
        notConfigured: "Messages are not enabled yet."
      },
      ar: {
        sending: "جارٍ الإرسال…",
        sent: "شكرًا لكم! وصلت رسالتكم ❤️",
        empty: "من فضلك اكتب الاسم والرسالة.",
        error: "حدث خطأ — حاول مرة أخرى.",
        notConfigured: "الرسائل غير مفعّلة بعد."
      }
    }[lang];

    function setStatus(msg, isError) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.classList.toggle("is-error", Boolean(isError));
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var name = form.elements.name.value.trim();
      var message = form.elements.message.value.trim();

      if (!name || !message) {
        setStatus(TEXT.empty, true);
        return;
      }

      if (!window.WeddingFirebase || !window.WeddingFirebase.isConfigured) {
        setStatus(TEXT.notConfigured, true);
        return;
      }

      submitBtn.disabled = true;
      setStatus(TEXT.sending, false);

      window.WeddingFirebase
        .saveMessage(name.slice(0, 80), message.slice(0, 1000), lang)
        .then(function () {
          form.reset();
          setStatus(TEXT.sent, false);
        })
        .catch(function (err) {
          console.error("[Wedding] Failed to save message:", err);
          setStatus(TEXT.error, true);
        })
        .finally(function () {
          submitBtn.disabled = false;
        });
    });
  }

  /* ---------- 4. Service worker (PWA) ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    window.addEventListener("load", function () {
      navigator.serviceWorker
        .register("service-worker.js")
        .catch(function (err) {
          console.warn("[Wedding] Service worker not registered:", err);
        });
    });
  }
})();
