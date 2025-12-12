import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

/* opciones */
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

/* crear botones */
function buildButtons(list, container, cls){
  list.forEach(name=>{
    const btn = document.createElement("button");
    btn.className = cls;
    btn.innerText = name;
    btn.onclick = ()=>{
      btn.classList.toggle("selected");
      enforceLimits();
      updateTotals();
    };
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
    basePrice = parseFloat(btn.dataset.price);
    maxSalsas = parseInt(btn.dataset.salsas,10);
    maxToppings = parseInt(btn.dataset.toppings,10);
    chosenSizeLabel = btn.textContent;
    basePriceEl.innerText = basePrice.toFixed(2);
    enforceLimits();
    updateTotals();
  });
});

/* tipo */
document.getElementById("eatHere").onclick = ()=>{
  orderType = "Comer aquí";
  eatHere.classList.add("selected");
  takeAway.classList.remove("selected");
};

document.getElementById("takeAway").onclick = ()=>{
  orderType = "Para llevar";
  takeAway.classList.add("selected");
  eatHere.classList.remove("selected");
};

/* extras */
addExtraTopping.onclick = ()=>{ extraToppings++; enforceLimits(); updateTotals(); };
removeExtraTopping.onclick = ()=>{ if(extraToppings>0) extraToppings--; enforceLimits(); updateTotals(); };
addExtraSalsa.onclick = ()=>{ extraSalsas++; enforceLimits(); updateTotals(); };
removeExtraSalsa.onclick = ()=>{ if(extraSalsas>0) extraSalsas--; enforceLimits(); updateTotals(); };

/* límites */
function enforceLimits(){
  const selectedSalsas = salsasBox.querySelectorAll("button.selected").length;
  const selectedToppings = toppingsBox.querySelectorAll("button.selected").length;
  const limitS = maxSalsas + extraSalsas;
  const limitT = maxToppings + extraToppings;

  salsasBox.querySelectorAll("button").forEach(btn=>{
    btn.disabled = (!btn.classList.contains("selected") && selectedSalsas >= limitS);
  });

  toppingsBox.querySelectorAll("button").forEach(btn=>{
    btn.disabled = (!btn.classList.contains("selected") && selectedToppings >= limitT);
  });
}

/* totales */
function updateTotals(){
  const extrasCost = (extraToppings * 0.50) + (extraSalsas * 0.75);
  extrasPriceEl.innerText = extrasCost.toFixed(2);
  totalEl.innerText = (basePrice + extrasCost).toFixed(2);
}

/* enviar */
sendOrder.onclick = async ()=>{
  msgEl.innerText = "";
  if(!chosenSizeLabel) return msgError("Selecciona un tamaño");
  if(!orderType) return msgError("Selecciona comer aquí o para llevar");
  if(!nombre.value.trim() || !apellido.value.trim()) return msgError("Completa los nombres");

  const salsas = [...salsasBox.querySelectorAll(".selected")].map(b=>b.innerText);
  const toppings = [...toppingsBox.querySelectorAll(".selected")].map(b=>b.innerText);

  if(salsas.length === 0) return msgError("Elige al menos 1 salsa");
  if(toppings.length === 0) return msgError("Elige al menos 1 topping");

  const order = {
    nombre: nombre.value,
    apellido: apellido.value,
    tipo: orderType,
    size: chosenSizeLabel,
    basePrice,
    extraToppings,
    extraSalsas,
    salsas,
    toppings,
    total: parseFloat(totalEl.innerText),
    time: new Date().toLocaleString(),
    status: "Pendiente"
  };

  await push(ref(db, "pedidos/"), order);
  msgOk("Pedido enviado!");
  setTimeout(()=> location.reload(), 800);
};

function msgError(t){ msgEl.style.color="red"; msgEl.innerText=t; }
function msgOk(t){ msgEl.style.color="green"; msgEl.innerText=t; }
