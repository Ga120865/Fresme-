// app.js
import { db } from "../firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

/*
  Salsas y toppings (según lo definiste):
  - Salsas: Chocolate blanco, Chocolate negro, Pistacho, Kinder Bueno, Frambuesa
  - Toppings: Chispas de colores, Chispas de chocolate, Caramelo, Galletas, Oreo
*/

const salsasList = [
  "Chocolate blanco",
  "Chocolate negro",
  "Pistacho",
  "Kinder Bueno",
  "Frambuesa"
];

const toppingsList = [
  "Chispas de colores",
  "Chispas de chocolate",
  "Caramelo",
  "Galletas",
  "Oreo"
];

/* Estado */
let maxSalsas = 0;
let maxToppings = 0;
let extraSalsas = 0;
let extraToppings = 0;
let basePrice = 0;
let chosenSizeLabel = null;

/* Elementos DOM */
const salsasBox = document.getElementById("salsas");
const toppingsBox = document.getElementById("toppings");
const totalEl = document.getElementById("total");
const basePriceEl = document.getElementById("basePrice");
const extrasPriceEl = document.getElementById("extrasPrice");
const msgEl = document.getElementById("msg");

/* build buttons */
function buildButtons(list, container) {
  list.forEach(name => {
    const btn = document.createElement("button");
    btn.innerText = name;
    btn.onclick = () => {
      btn.classList.toggle("selected");
      enforceLimits();
      updateTotals();
    };
    container.appendChild(btn);
  });
}
buildButtons(salsasList, salsasBox);
buildButtons(toppingsList, toppingsBox);

/* sizes */
document.querySelectorAll(".size-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".size-btn").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");

    basePrice = parseFloat(btn.dataset.price);
    maxSalsas = parseInt(btn.dataset.salsas,10);
    maxToppings = parseInt(btn.dataset.toppings,10);
    chosenSizeLabel = btn.innerText;

    basePriceEl.innerText = basePrice.toFixed(2);
    enforceLimits();
    updateTotals();
  };
});

/* order type (para llevar / comer) */
let orderType = null;
document.querySelectorAll("#orderType .pill").forEach(btn=>{
  btn.onclick = () => {
    document.querySelectorAll("#orderType .pill").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    orderType = btn.dataset.value;
  };
});

/* extras buttons */
document.getElementById("addExtraTopping").onclick = () => { extraToppings++; enforceLimits(); updateTotals(); };
document.getElementById("removeExtraTopping").onclick = () => { if(extraToppings>0) extraToppings--; enforceLimits(); updateTotals(); };
document.getElementById("addExtraSalsa").onclick = () => { extraSalsas++; enforceLimits(); updateTotals(); };
document.getElementById("removeExtraSalsa").onclick = () => { if(extraSalsas>0) extraSalsas--; enforceLimits(); updateTotals(); };

/* enforceLimits: bloquea botones cuando se llega al limite */
function enforceLimits() {
  const selectedSalsas = salsasBox.querySelectorAll("button.selected").length;
  const selectedToppings = toppingsBox.querySelectorAll("button.selected").length;

  const limitS = maxSalsas + extraSalsas;
  const limitT = maxToppings + extraToppings;

  // salsas
  salsasBox.querySelectorAll("button").forEach(btn => {
    if(!btn.classList.contains("selected") && selectedSalsas >= limitS){
      btn.disabled = true;
      btn.style.opacity = "0.45";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.opacity = "";
      btn.style.cursor = "";
    }
  });

  // toppings
  toppingsBox.querySelectorAll("button").forEach(btn => {
    if(!btn.classList.contains("selected") && selectedToppings >= limitT){
      btn.disabled = true;
      btn.style.opacity = "0.45";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.opacity = "";
      btn.style.cursor = "";
    }
  });
}

/* update totals */
function updateTotals() {
  const extrasCost = (extraToppings * 0.50) + (extraSalsas * 0.75);
  extrasPriceEl.innerText = extrasCost.toFixed(2);
  const total = (basePrice || 0) + extrasCost;
  totalEl.innerText = total.toFixed(2);
}

/* send order */
document.getElementById("sendOrder").onclick = async () => {
  msgEl.innerText = "";
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();

  if(!nombre || !apellido){ msgEl.innerText = "Ingresa nombre y apellido"; return; }
  if(!orderType){ msgEl.innerText = "Selecciona si es para llevar o comer aquí"; return; }
  if(!chosenSizeLabel){ msgEl.innerText = "Selecciona un tamaño"; return; }

  const selectedSalsas = [...salsasBox.querySelectorAll("button.selected")].map(b=>b.innerText);
  const selectedToppings = [...toppingsBox.querySelectorAll("button.selected")].map(b=>b.innerText);

  if(selectedSalsas.length === 0){ msgEl.innerText = "Selecciona al menos una salsa"; return; }
  if(selectedToppings.length === 0){ msgEl.innerText = "Selecciona al menos un topping"; return; }

  const order = {
    nombre,
    apellido,
    tipo: orderType,
    size: chosenSizeLabel,
    basePrice,
    extraToppings,
    extraSalsas,
    salsas: selectedSalsas,
    toppings: selectedToppings,
    total: parseFloat(document.getElementById("total").innerText),
    time: new Date().toLocaleString(),
    status: "Pendiente"
  };

  try {
    await push(ref(db, "orders/"), order);
    msgEl.style.color = "green";
    msgEl.innerText = "Pedido enviado correctamente!";
    // reset form (simple)
    setTimeout(()=> location.reload(), 800);
  } catch (err){
    console.error(err);
    msgEl.style.color = "red";
    msgEl.innerText = "Error enviando pedido. Revisa consola.";
  }
};

