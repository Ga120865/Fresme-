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
// LÓGICA DE TAMAÑOS / LÍMITES
// -------------------------------
const sizeRadios = document.querySelectorAll('input[name="size"]');
const salsaChecks = document.querySelectorAll('.salsa');
const toppingChecks = document.querySelectorAll('.topping');

let maxSalsas = 0;
let maxToppings = 0;
let basePrice = 0;

function updateLimits() {
  const selected = document.querySelector('input[name="size"]:checked');
  if (!selected) return;

  const max = parseInt(selected.dataset.max);
  basePrice = parseFloat(selected.dataset.price);

  maxSalsas = max;
  maxToppings = max;

  document.getElementById("salsasMax").textContent = max;
  document.getElementById("toppingsMax").textContent = max;

  updateTotal();
  validateSelection();
}

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

  updateTotal();
}

// -------------------------------
// TOTAL
// -------------------------------
function updateTotal() {
  const total = basePrice;
  document.getElementById("total").textContent = total.toFixed(2);
}


// EVENTOS
sizeRadios.forEach(r => r.addEventListener("change", updateLimits));
salsaChecks.forEach(c => c.addEventListener("change", validateSelection));
toppingChecks.forEach(c => c.addEventListener("change", validateSelection));


// -------------------------------
// ENVIAR PEDIDO A FIREBASE
// -------------------------------
document.getElementById("enviarPedido").addEventListener("click", () => {

  const size = document.querySelector('input[name="size"]:checked');
  if (!size) {
    alert("Selecciona un tamaño.");
    return;
  }

  const data = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    tipo: document.getElementById("tipo").value,
    size: size.value,
    basePrice: basePrice,
    salsas: [...salsaChecks].filter(c => c.checked).map(c => c.value),
    toppings: [...toppingChecks].filter(c => c.checked).map(c => c.value),
    total: basePrice,
    time: new Date().toLocaleTimeString(),
    status: "Pendiente"
  };

  push(ref(db, "orders/"), data);

  alert("Pedido enviado!");
  location.reload();
});
