// app.js (kiosk)
import { db } from "./firebase.js";
import { ref, push } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

/* opciones */
const salsasList = ["Chocolate","Pistacho"];
const toppingsList = ["Grageas","Gotas de chocolate","Oreo"];

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

/* tipo (comer aquí / llevar) */
document.getElementById("eatHere").addEventListener("click", ()=>{
  document.getElementById("eatHere").classList.add("selected");
  document.getElementById("takeAway").classList.remove("selected");
  orderType = "Comer aquí";
});
document.getElementById("takeAway").addEventListener("click", ()=>{
  document.getElementById("takeAway").classList.add("selected");
  document.getElementById("eatHere").classList.remove("selected");
  orderType = "Para llevar";
});

/* extras */
document.getElementById("addExtraTopping").onclick = ()=> { extraToppings++; enforceLimits(); updateTotals(); };
document.getElementById("removeExtraTopping").onclick = ()=> { if(extraToppings>0) extraToppings--; enforceLimits(); updateTotals(); };
document.getElementById("addExtraSalsa").onclick = ()=> { extraSalsas++; enforceLimits(); updateTotals(); };
document.getElementById("removeExtraSalsa").onclick = ()=> { if(extraSalsas>0) extraSalsas--; enforceLimits(); updateTotals(); };

/* bloqueos */
function enforceLimits(){
  const selectedSalsas = salsasBox.querySelectorAll("button.selected").length;
  const selectedToppings = toppingsBox.querySelectorAll("button.selected").length;
  const limitS = maxSalsas + extraSalsas;
  const limitT = maxToppings + extraToppings;

  salsasBox.querySelectorAll("button").forEach(btn=>{
    if(!btn.classList.contains("selected") && selectedSalsas >= limitS){
      btn.disabled = true; btn.style.opacity="0.45"; btn.style.cursor="not-allowed";
    } else { btn.disabled=false; btn.style.opacity=""; btn.style.cursor=""; }
  });

  toppingsBox.querySelectorAll("button").forEach(btn=>{
    if(!btn.classList.contains("selected") && selectedToppings >= limitT){
      btn.disabled = true; btn.style.opacity="0.45"; btn.style.cursor="not-allowed";
    } else { btn.disabled=false; btn.style.opacity=""; btn.style.cursor=""; }
  });
}

/* totales */
function updateTotals(){
  const extrasCost = (extraToppings * 0.50) + (extraSalsas * 0.75);
  extrasPriceEl.innerText = extrasCost.toFixed(2);
  const total = (basePrice || 0) + extrasCost;
  totalEl.innerText = total.toFixed(2);
}

/* enviar pedido */
document.getElementById("sendOrder").onclick = async ()=>{
  msgEl.innerText = ""; msgEl.style.color = "green";
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  if(!nombre || !apellido){ msgEl.style.color="red"; msgEl.innerText="Ingresa nombre y apellido"; return; }
  if(!orderType){ msgEl.style.color="red"; msgEl.innerText="Selecciona comer aquí o para llevar"; return; }
  if(!chosenSizeLabel){ msgEl.style.color="red"; msgEl.innerText="Selecciona un tamaño"; return; }

  const selectedSalsas = [...salsasBox.querySelectorAll("button.selected")].map(b=>b.innerText);
  const selectedToppings = [...toppingsBox.querySelectorAll("button.selected")].map(b=>b.innerText);
  if(selectedSalsas.length===0){ msgEl.style.color="red"; msgEl.innerText="Selecciona al menos una salsa"; return; }
  if(selectedToppings.length===0){ msgEl.style.color="red"; msgEl.innerText="Selecciona al menos un topping"; return; }

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

  try{
    await push(ref(db, "pedidos/"), order);
    msgEl.style.color="green"; msgEl.innerText="Pedido enviado correctamente!";
    setTimeout(()=> location.reload(), 700);
  } catch(err){
    console.error(err); msgEl.style.color="red"; msgEl.innerText="Error enviando pedido. Revisa consola.";
  }
};


