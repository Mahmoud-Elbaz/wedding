/* ============================================================
   admin.js — admin authentication & message management
   ------------------------------------------------------------
   • Firebase email/password sign-in (create the admin user in
     Firebase Console → Authentication → Users).
   • Live Firestore listener on `messages`, newest first.
   • Search by name, delete with confirmation.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Guards ---------- */
  if (typeof firebase === "undefined" || !firebase.apps || !firebase.apps.length) {
    document.body.innerHTML =
      "<p style='padding:2rem;font-family:serif'>Firebase is not configured. " +
      "Add your credentials to <code>js/firebase.js</code> first.</p>";
    return;
  }

  var auth = firebase.auth();
  var db = firebase.firestore();

  /* ---------- Elements ---------- */
  var loginView = document.getElementById("login-view");
  var dashView = document.getElementById("dash-view");
  var loginForm = document.getElementById("login-form");
  var loginBtn = document.getElementById("login-btn");
  var loginError = document.getElementById("login-error");
  var logoutBtn = document.getElementById("logout-btn");
  var searchInput = document.getElementById("search");
  var tbody = document.getElementById("msg-body");
  var emptyState = document.getElementById("empty-state");
  var msgCount = document.getElementById("msg-count");

  var unsubscribe = null; /* Firestore listener */
  var allMessages = [];   /* cached for client-side search */

  /* ---------- Helpers ---------- */
  function formatDate(ts) {
    if (!ts || !ts.toDate) return "—";
    var d = ts.toDate();
    return d.toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    }) + " · " + d.toLocaleTimeString(undefined, {
      hour: "2-digit", minute: "2-digit"
    });
  }

  function langLabel(code) {
    return code === "ar" ? "العربية" : "English";
  }

  /** Build one table row safely (textContent — never innerHTML with user data). */
  function buildRow(doc) {
    var data = doc.data();
    var tr = document.createElement("tr");

    var tdName = document.createElement("td");
    tdName.className = "cell-name";
    tdName.textContent = data.name || "—";

    var tdMsg = document.createElement("td");
    tdMsg.className = "cell-message";
    tdMsg.textContent = data.message || "";
    if (data.language === "ar") tdMsg.setAttribute("dir", "rtl");

    var tdLang = document.createElement("td");
    var pill = document.createElement("span");
    pill.className = "lang-pill";
    pill.textContent = langLabel(data.language);
    tdLang.appendChild(pill);

    var tdDate = document.createElement("td");
    tdDate.className = "cell-date";
    tdDate.textContent = formatDate(data.createdAt);

    var tdActions = document.createElement("td");
    var delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.type = "button";
    delBtn.textContent = "Delete";
    delBtn.addEventListener("click", function () {
      var ok = window.confirm('Delete the message from "' + (data.name || "guest") + '"?');
      if (!ok) return;
      db.collection("messages").doc(doc.id).delete().catch(function (err) {
        console.error("[Admin] Delete failed:", err);
        window.alert("Could not delete the message. Please try again.");
      });
    });
    tdActions.appendChild(delBtn);

    tr.append(tdName, tdMsg, tdLang, tdDate, tdActions);
    return tr;
  }

  /** Render the cached messages, filtered by the search box. */
  function render() {
    var q = searchInput.value.trim().toLowerCase();
    var visible = allMessages.filter(function (doc) {
      var name = (doc.data().name || "").toLowerCase();
      return !q || name.indexOf(q) !== -1;
    });

    tbody.textContent = "";
    visible.forEach(function (doc) {
      tbody.appendChild(buildRow(doc));
    });

    emptyState.hidden = visible.length > 0;
    msgCount.textContent =
      visible.length + " message" + (visible.length === 1 ? "" : "s") +
      (q ? " (filtered)" : "");
  }

  /* ---------- Firestore listener ---------- */
  function startListening() {
    unsubscribe = db
      .collection("messages")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        function (snapshot) {
          allMessages = snapshot.docs;
          render();
        },
        function (err) {
          console.error("[Admin] Firestore listener error:", err);
          emptyState.hidden = false;
          emptyState.textContent =
            "Could not load messages. Check your Firestore security rules.";
        }
      );
  }

  function stopListening() {
    if (unsubscribe) { unsubscribe(); unsubscribe = null; }
    allMessages = [];
  }

  /* ---------- Auth flow ---------- */
  auth.onAuthStateChanged(function (user) {
    if (user) {
      loginView.hidden = true;
      dashView.hidden = false;
      startListening();
    } else {
      stopListening();
      dashView.hidden = true;
      loginView.hidden = false;
    }
  });

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    loginError.textContent = "";
    loginBtn.disabled = true;

    var email = loginForm.elements.email.value.trim();
    var password = loginForm.elements.password.value;

    auth
      .signInWithEmailAndPassword(email, password)
      .catch(function (err) {
        console.warn("[Admin] Sign-in failed:", err.code);
        loginError.textContent =
          err.code === "auth/too-many-requests"
            ? "Too many attempts — try again later."
            : "Incorrect email or password.";
      })
      .finally(function () {
        loginBtn.disabled = false;
      });
  });

  logoutBtn.addEventListener("click", function () {
    auth.signOut();
  });

  searchInput.addEventListener("input", render);
})();
