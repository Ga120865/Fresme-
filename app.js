import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// TU CONFIG EXACTA
const firebaseConfig = {
  apiKey: "AIzaSyCGAfu9XB2EcVhV4kEv_xNOKI5YoLjZhr4",
  authDomain: "fresme-app.firebaseapp.com",
  databaseURL: "https://fresme-app-default-rtdb.firebaseio.com",
  projectId: "fresme-app",
  storageBucket: "fresme-app.firebasestorage.app",
  messagingSenderId: "68669835916",
  appId: "1:68669835916:web:ed424d557a616fb37149a9",
  measurementId: "G-RPSCTLQ9RG"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ELEMENTOS
const sizeSelect = document.getElementById("size");
const toppingsBoxes = document.querySelectorAll("#toppings input");
const sauceBoxes = document.querySelectorAll("#sauces input");
const sendOrder = document.getElementById("sendOrder");
const msg = document.getElementById("msg");

// LIMITE DE TOPPINGS
const limits = {
  Pequeño: 1,
  Mediano: 2,
  Grande: 3
};

// BLOQUEAR SEGÚN TAMAÑO
sizeSelect.addEventListener("change", () => {
  toppingsBoxes.forEach(c => { c.checked = false; c.disabled = false; });
});

toppingsBoxes.forEach(box => {
  box.addEventListener("change", () => {
    const limit = limits[sizeSelect.value] || 0;
    const selected = document.querySelectorAll("#toppings input:checked").length;

    toppingsBoxes.forEach(b => {
      if (!b.checked) b.disabled = selected >= limit;
    });
  });
});

// ENVIAR PEDIDO
sendOrder.addEventListener("click", () => {
  const size = sizeSelect.value;
  const toppings = [...document.querySelectorAll("#toppings input:checked")].map(x => x.value);
  const sauces = [...document.querySelectorAll("#sauces input:checked")].map(x => x.value);

  if (!size) {
    msg.textContent = "Selecciona un tamaño.";
    msg.style.color = "red";
    return;
  }

  const order = {
    size,
    toppings,
    sauces,
    time: new Date().toLocaleTimeString()
  };

  push(ref(db, "orders"), order)
    .then(() => {
      msg.style.color = "green";
      msg.textContent = "Pedido enviado ✔️";

      sizeSelect.value = "";
      toppingsBoxes.forEach(x => { x.checked = false; x.disabled = false; });
      sauceBoxes.forEach(x => (x.checked = false));
    })
    .catch(err => console.error(err));
});
