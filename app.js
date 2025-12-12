// app.js (kiosk)
import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

/* opciones — las que pediste */
const salsasList = [
  "Frambuesa",
  "Chocolate",
  "Pistacho",
  "Nutella",
  "Chantilly",
  "Leche Condensada"
];

const toppingsList = [
  "Oreo",
  "Grageas",
  "Gotas de chocolate"
];

/* estado */
let maxSalsas = 0, maxToppings = 0;
let extraSalsas = 0, extraToppings = 0;
let basePrice = 0;
let chosenSizeLabel = null;
let orderType = null;

/* DOM */
const salsasBox = document.getElementById("salsas");
const toppingsBox = document.getElementById("toppings");
const basePriceEl = document.getElementById("basePrice");
const extrasPriceEl = document.getElementById("extrasPrice");
const totalEl = document.getElementById("total");
const msgEl = document.getElementById("msg");

const eatHereBtn = document.getElementById("eatHere");
const takeAwayBtn = document.getElementById("takeAway");
const addExtraSalsaBtn = document.getElementById("addExtraSalsa");
const removeExtraSalsaBtn = document.getElementById("removeExtraSalsa");
const addExtraToppingBtn = document.getElementById("addExtraTopping");
const removeExtraToppingBtn = document.getElementById("removeExtraTopping");
const sendOrderBtn = document.getElementById("sendOrder");

const nombreInput = document.getElementById("nombre");
const apellidoInput = document.getElementById("apellido");

/* crear botones (salsas/toppings) */
function buildButtons(list, container, cls){
  container.innerHTML = "";
  list.forEach(name=>{
    const btn = document.createElement("button");
    btn.className = cls;
    btn.type = "button";
    btn.innerText = name;
    btn.addEventListener("click", ()=>{
      btn.classList.toggle("selected");
      enforceLimits();
      updateTotals();
    });
    container.appendChild(btn);
  });
}
buildButtons(salsasList, salsasBox, "salsa-item");
buildButtons(toppingsList, toppingsBox, "topping-item");

/* tamaños */
document.querySelectorAll(".size-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    document.querySelectorAll(".size-btn").forEach(b=>b.classList.remove("selected"));
    btn.classList.add("selected");
    basePrice = parseFloat(btn.dataset.price) || 0;
    maxSalsas = parseInt(btn.dataset.salsas,10) || 0;
    maxToppings = parseInt(btn.dataset.toppings,10) || 0;
    chosenSizeLabel = btn.textContent.trim();
    basePriceEl.innerText = basePrice.toFixed(2);
    enforceLimits();
    updateTotals();
  });
});

/* order type (comer aquí / llevar) */
eatHereBtn.addEventListener("click", ()=>{
  orderType = eatHereBtn.dataset.value || "Para comer aquí";
  eatHereBtn.classList.add("selected");
  takeAwayBtn.classList.remove("selected");
});
takeAwayBtn.addEventListener("click", ()=>{
  orderType = takeAwayBtn.dataset.value || "Para llevar";
  takeAwayBtn.classList.add("selected");
  eatHereBtn.classList.remove("selected");
});

/* extras buttons */
addExtraSalsaBtn.addEventListener("click", ()=> { extraSalsas++; enforceLimits(); updateTotals(); });
removeExtraSalsaBtn.addEventListener("click", ()=> { if(extraSalsas>0) extraSalsas--; enforceLimits(); updateTotals(); });
addExtraToppingBtn.addEventListener("click", ()=> { extraToppings++; enforceLimits(); updateTotals(); });
removeExtraToppingBtn.addEventListener("click", ()=> { if(extraToppings>0) extraToppings--; enforceLimits(); updateTotals(); });

/* enforceLimits: bloquea botones cuando se llega al limite */
function enforceLimits(){
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
sendOrderBtn.addEventListener("click", async () => {
  msgEl.innerText = "";
  msgEl.style.color = "green";

  const nombre = nombreInput.value.trim();
  const apellido = apellidoInput.value.trim();

  if(!nombre || !apellido){ msgEl.style.color="red"; msgEl.innerText="Ingresa nombre y apellido"; return; }
  if(!orderType){ msgEl.style.color="red"; msgEl.innerText="Selecciona si es para llevar o comer aquí"; return; }
  if(!chosenSizeLabel){ msgEl.style.color="red"; msgEl.innerText="Selecciona un tamaño"; return; }

  const selectedSalsas = [...salsasBox.querySelectorAll("button.selected")].map(b=>b.innerText);
  const selectedToppings = [...toppingsBox.querySelectorAll("button.selected")].map(b=>b.innerText);
  if(selectedSalsas.length === 0){ msgEl.style.color="red"; msgEl.innerText="Selecciona al menos una salsa"; return; }
  if(selectedToppings.length === 0){ msgEl.style.color="red"; msgEl.innerText="Selecciona al menos un topping"; return; }

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
    total: parseFloat(totalEl.innerText),
    time: new Date().toLocaleString(),
    status: "Pendiente"
  };

  try {
    await push(ref(db, "pedidos/"), order);
    msgEl.style.color = "green";
    msgEl.innerText = "Pedido enviado correctamente!";
    // reset simple
    setTimeout(()=> location.reload(), 700);
  } catch (err) {
    console.error(err);
    msgEl.style.color = "red";
    msgEl.innerText = "Error enviando pedido. Revisa consola.";
  }
});
