// firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyA9kNtwjDWTooEHEBcLe03FXsXlxcyaGGM",
  authDomain: "fresme-17315.firebaseapp.com",
  databaseURL: "https://fresme-17315-default-rtdb.firebaseio.com",
  projectId: "fresme-17315",
  storageBucket: "fresme-17315.firebasestorage.app",
  messagingSenderId: "313000627548",
  appId: "1:313000627548:web:91478f1e3dd3c342c74599",
  measurementId: "G-3B3QYZCLDS"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
