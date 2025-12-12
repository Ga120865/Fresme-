import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

let tamañoSeleccionado = "";
let maxToppings = 0;
let toppingsSeleccionados = [];

const toppingsList = [
  "Oreo", "Kinder", "Brownie", "M&M", 
  "Chispas", "Rolito", "Galaxy", "Frutilla"
];

const toppingsDiv = document.getElementById("toppings");

// Render toppings
toppingsList.forEach(t => {
  const btn = document.createElement("button");
  btn.classList.add("topping-btn");
  btn.textContent = t;

  btn.addEventListener("click", () => {
    if (!btn.classList.contains("selected")) {
      if (toppingsSeleccionados.length >= maxToppings) return;
      btn.classList.add("selected");
      toppingsSeleccionados.push(t);
    } else {
      btn.classList.remove("selected");
      toppingsSeleccionados = toppingsSeleccionados.filter(top => top !== t);
    }
  });

  toppingsDiv.appendChild(btn);
});

// Tamaños
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    tamañoSeleccionado = btn.dataset.size;

    document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");

    if (tamañoSeleccionado === "small") maxToppings = 2;
    if (tamañoSeleccionado === "medium") maxToppings = 3;
    if (tamañoSeleccionado === "large") maxToppings = 4;

    toppingsSeleccionados = [];
    document.querySelectorAll(".topping-btn").forEach(t => t.classList.remove("selected"));
  });
});

// Enviar pedido
document.getElementById("enviarPedido").addEventListener("click", () => {
  const salsa = document.getElementById("salsa").value;

  if (!tamañoSeleccionado) {
    alert("Selecciona un tamaño");
    return;
  }
  if (toppingsSeleccionados.length < 1) {
    alert("Selecciona toppings");
    return;
  }
  if (!salsa) {
    alert("Selecciona una salsa");
    return;
  }

  const nuevoPedido = {
    tamaño: tamañoSeleccionado,
    toppings: toppingsSeleccionados,
    salsa: salsa,
    hora: new Date().toLocaleTimeString()
  };

  push(ref(db, "pedidos/"), nuevoPedido);

  alert("Pedido enviado ✔");

  // Reset
  location.reload();
});
