// app.js
import { db } from "./firebase.js";
import { push, ref } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

const form = document.getElementById("pedidoForm");

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const pedido = {
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        size: document.getElementById("size").value,
        salsas: document.getElementById("salsas").value.split(",").map(s => s.trim()),
        toppings: document.getElementById("toppings").value.split(",").map(t => t.trim()),
        total: parseFloat(document.getElementById("total").value),
        status: "Pendiente",
        time: new Date().toLocaleString("es-ES")
    };

    push(ref(db, "orders/"), pedido)
        .then(() => {
            alert("Pedido enviado!");
            form.reset();
        })
        .catch(err => alert("Error al enviar: " + err));
});
