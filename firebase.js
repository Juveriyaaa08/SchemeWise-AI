import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDSBYF58Tyg5rE_l5OgAmllS50iSoSIj7k",
  authDomain: "schemewiseai.firebaseapp.com",
  projectId: "schemewiseai",
  storageBucket: "schemewiseai.firebasestorage.app",
  messagingSenderId: "841213007475",
  appId: "1:841213007475:web:d3ea05cda94742ea53fc06"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };