// app.js
import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// Datos
const salsasList = ["Chocolate blanco", "Chocolate negro", "Pistacho", "Kinder Bueno", "Frambuesa"];
const toppingsList = ["Chispas de colores", "Chispas de chocolate", "Caramelo", "Galletas", "Oreo"];

// Estado
let tipoOrden = "";
let sizePrice = 0;
let maxSalsas = 0;
let maxToppings = 0;

let selectedSalsas = [];
let selectedToppings = [];

// Insertar salsas y toppings
function loadOptions() {
  const salsasBox = document.getElementById("salsas");
  const toppingsBox = document.getElementById("toppings");

  salsasList.forEach((s) => {
    const btn = document.createElement("button");
    btn.className = "item";
    btn.textContent = s;
    btn.onclick = () => toggleSalsa(s);
    salsasBox.appendChild(btn);
  });

  toppingsList.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = "item";
    btn.textContent = t;
    btn.onclick = () => toggleTopping(t);
    toppingsBox.appendChild(btn);
  });
}

loadOptions();

// Selección tipo
document.querySelectorAll(".option").forEach((btn) => {
  btn.onclick = () => {
    tipoOrden = btn.dataset.value;
    document.querySelectorAll(".option").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  };
});

// Selección tamaño
document.querySelectorAll(".size").forEach((btn) => {
  btn.onclick = () => {
    sizePrice = parseFloat(btn.dataset.price);
    maxSalsas = parseInt(btn.dataset.salsas);
    maxToppings = parseInt(btn.dataset.toppings);

    document.querySelectorAll(".size").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    updateTotal();
  };
});

function toggleSalsa(s) {
  if (selectedSalsas.includes(s)) {
    selectedSalsas = selectedSalsas.filter(x => x !== s);
  } else if (selectedSalsas.length < maxSalsas) {
    selectedSalsas.push(s);
  }
  updateTotal();
}

function toggleTopping(t) {
  if (selectedToppings.includes(t)) {
    selectedToppings = selectedToppings.filter(x => x !== t);
  } else if (selectedToppings.length < maxToppings) {
    selectedToppings.push(t);
  }
  updateTotal();
}

function updateTotal() {
  const total = sizePrice;
  document.getElementById("total").textContent = total.toFixed(2);
}

// Enviar pedido
document.getElementById("sendOrder").onclick = async () => {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();

  if (!nombre || !apellido || !tipoOrden || sizePrice === 0) {
    msg.textContent = "Completa todos los campos.";
    return;
  }

  const pedido = {
    nombre,
    apellido,
    tipo: tipoOrden,
    tamaño: sizePrice,
    salsas: selectedSalsas,
    toppings: selectedToppings,
    total: sizePrice,
    hora: new Date().toLocaleTimeString()
  };

  await push(ref(db, "pedidos/"), pedido);

  msg.textContent = "Pedido enviado!";
  setTimeout(() => (msg.textContent = ""), 2000);
};
