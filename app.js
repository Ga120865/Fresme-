import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Selección de elementos
const sizeSelect = document.getElementById("size");
const toppingBoxes = document.querySelectorAll("#toppings input");
const sauceBoxes = document.querySelectorAll("#sauces input");
const sendBtn = document.getElementById("sendOrder");
const msg = document.getElementById("msg");

// Limites de toppings por tamaño
const toppingLimits = {
  small: 1,
  medium: 2,
  large: 3
};

// BLOQUEO AUTOMÁTICO DE TOPPINGS
sizeSelect.addEventListener("change", () => {
  let limit = toppingLimits[sizeSelect.value];

  toppingBoxes.forEach(box => box.checked = false);

  toppingBoxes.forEach(box => {
    box.disabled = false;
    box.addEventListener("change", () => {
      const selected = document.querySelectorAll("#toppings input:checked").length;
      if (selected >= limit) {
        toppingBoxes.forEach(b => {
          if (!b.checked) b.disabled = true;
        });
      } else {
        toppingBoxes.forEach(b => b.disabled = false);
      }
    });
  });
});

// ENVIAR PEDIDO
sendBtn.addEventListener("click", () => {
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
      msg.textContent = "Pedido enviado ✔️";
      msg.style.color = "green";

      sizeSelect.value = "";
      toppingBoxes.forEach(b => { b.checked = false; b.disabled = false; });
      sauceBoxes.forEach(b => b.checked = false);
    })
    .catch(err => {
      msg.textContent = "Error al enviar.";
      msg.style.color = "red";
      console.error(err);
    });
});
