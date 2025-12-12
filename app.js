// -------------------------------
// FIREBASE
// -------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

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


// -------------------------------
// VARIABLES DEL SISTEMA
// -------------------------------
const sizeRadios = document.querySelectorAll('input[name="size"]');
const salsaChecks = document.querySelectorAll('.salsa');
const toppingChecks = document.querySelectorAll('.topping');

let maxSalsas = 0;
let maxToppings = 0;
let basePrice = 0;


// -------------------------------
// ACTUALIZAR LÍMITES SEGÚN TAMAÑO
// -------------------------------
function updateLimits() {
  const selected = document.querySelector('input[name="size"]:checked');
  if (!selected) return;

  const max = parseInt(selected.dataset.max);
  basePrice = parseFloat(selected.dataset.price);

  maxSalsas = max;
  maxToppings = max;

  document.getElementById("salsasMax").textContent = max;
  document.getElementById("toppingsMax").textContent = max;

  validateSelection();
  updateTotal();
}


// -------------------------------
// VALIDAR TOPPINGS Y SALSAS
// -------------------------------
function validateSelection() {
  const selectedSalsas = [...salsaChecks].filter(c => c.checked).length;
  const selectedToppings = [...toppingChecks].filter(c => c.checked).length;

  document.getElementById("salsasCount").textContent = selectedSalsas;
  document.getElementById("toppingsCount").textContent = selectedToppings;

  salsaChecks.forEach(c => {
    c.disabled = !c.checked && selectedSalsas >= maxSalsas;
  });

  toppingChecks.forEach(c => {
    c.disabled = !c.checked && selectedToppings >= maxToppings;
  });
}


// -------------------------------
// ACTUALIZAR TOTAL
// -------------------------------
function updateTotal() {
  const total = basePrice;
  document.getElementById("total").textContent = total.toFixed(2);
}


// EVENTOS
sizeRadios.forEach(r => r.addEventListener("change", updateLimits));
salsaChecks.forEach(c => c.addEventListener("change", () => {
  validateSelection();
  updateTotal();
}));
toppingChecks.forEach(c => c.addEventListener("change", () => {
  validateSelection();
  updateTotal();
}));


// -------------------------------
// ENVIAR PEDIDO A FIREBASE
// -------------------------------
document.getElementById("enviarPedido").addEventListener("click", () => {
  const size = document.querySelector('input[name="size"]:checked');

  if (!size) {
    alert("Selecciona un tamaño.");
    return;
  }

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();

  if (!nombre || !apellido) {
    alert("Escribe tu nombre y apellido.");
    return;
  }

  const pedido = {
    nombre,
    apellido,
    tipo: document.getElementById("tipo").value,
    size: size.value,
    salsas: [...salsaChecks].filter(c => c.checked).map(c => c.value),
    toppings: [...toppingChecks].filter(c => c.checked).map(c => c.value),
    total: basePrice,
    timestamp: Date.now()
  };

  // ENVÍA AL PANEL — AQUÍ ESTABA TU ERROR ⚠️
  const pedidosRef = ref(db, "pedidos");
  push(pedidosRef, pedido)
    .then(() => {
      alert("¡Pedido enviado con éxito!");
      window.location.reload();
    })
    .catch(err => {
      console.error("Error al enviar:", err);
    });
});
