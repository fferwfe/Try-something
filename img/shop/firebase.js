// Shared Firebase bootstrap (compat v9.1.3)
// Auto-generated integration bundle

(function () {
  'use strict';

  // Single source of truth
  const firebaseConfig = {
apiKey: "AIzaSyB0Gvpk5Y6ZermG67lFm-ecaXYGL5pl7mk",
      authDomain: "try-something-ddd1e.firebaseapp.com",
      databaseURL: "https://try-something-ddd1e-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "try-something-ddd1e",
      storageBucket: "try-something-ddd1e.firebasestorage.app",
      messagingSenderId: "245905464126",
      appId: "1:245905464126:web:4aea37e1b2bb0bdd1a2a6f"
  };

  // Expose for debugging
  window.__FIREBASE_CONFIG__ = firebaseConfig;

  // Init once
  if (!window.firebase || !firebase.apps) {
    console.error('[firebase.js] Firebase compat SDK not loaded. Make sure firebase-app-compat.js is included BEFORE js/firebase.js');
    return;
  }

  if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
  }

  window.db = firebase.database();

  // auth may not be present on some pages (unless firebase-auth-compat.js is loaded)
  try {
    window.auth = firebase.auth();
  } catch (e) {
    // ignore
  }
})();