/* ============================================================
   firebase.js — Firebase configuration & Firestore helpers
   ------------------------------------------------------------
   1. Create a project at https://console.firebase.google.com
   2. Add a Web App and copy its config object below.
   3. Enable Cloud Firestore.
   4. Publish the security rules from README.md.
   Loaded on: arabic.html, english.html (compat SDKs via CDN).
   ============================================================ */

/* Firebase project: wedding-a1cfd */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyB1yHGAcxhcrk7HoRvTAqyyLp5iUKJ3iGA",
  authDomain: "wedding-a1cfd.firebaseapp.com",
  projectId: "wedding-a1cfd",
  storageBucket: "wedding-a1cfd.firebasestorage.app",
  messagingSenderId: "664903139017",
  appId: "1:664903139017:web:7f0496f7c5a2f4d6d89718",
  measurementId: "G-QT4Q49RTME"
};

(function () {
  "use strict";

  var configured =
    typeof firebase !== "undefined" &&
    FIREBASE_CONFIG.apiKey.indexOf("YOUR_") !== 0;

  var db = null;

  if (configured) {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
  } else {
    console.warn(
      "[Wedding] Firebase is not configured yet — wishes will not be saved. " +
        "Edit js/firebase.js with your project credentials."
    );
  }

  /**
   * Save a guest wish to the `messages` collection.
   * @param {string} name     Guest name
   * @param {string} message  Wish text
   * @param {string} language "ar" | "en"
   * @returns {Promise<void>}
   */
  function saveMessage(name, message, language) {
    if (!db) {
      return Promise.reject(new Error("firebase-not-configured"));
    }
    return db.collection("messages").add({
      name: name,
      message: message,
      language: language,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  /* Public API */
  window.WeddingFirebase = {
    isConfigured: configured,
    saveMessage: saveMessage
  };
})();
