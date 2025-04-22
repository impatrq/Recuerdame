document.getElementById("btn-comenzar").addEventListener("click", () => {
    document.getElementById("pantalla-inicial").style.display = "none";
    document.getElementById("menu-principal").style.display = "block";
});

document.getElementById("btn-personas").addEventListener("click", () => {
    document.getElementById("menu-principal").style.display = "none";
    document.getElementById("pantalla-personas").style.display = "block";
    cargarPersonas(); // 👈 Cargar personas al entrar
});

// ✅ Función para cargar personas
async function cargarPersonas() {
    try {
        const response = await fetch("http://192.168.127.197:5000/personas"); // ✅ corregido a /personas
        const data = await response.json();

        const lista = document.getElementById("lista-personas");
        lista.innerHTML = "";

        data.forEach(persona => {
            const elemento = document.createElement("div");
            elemento.classList.add("persona");
            elemento.innerHTML = `
                <img src="${persona.foto}" alt="${persona.nombre}" width="100">
                <h2>${persona.nombre}</h2>
                <p>${persona.relacion}</p>
                <button onclick="eliminarPersona('${persona._id}')">❌ Eliminar</button>
            `;
            lista.appendChild(elemento);
        });
    } catch (error) {
        console.error("❌ Error al obtener datos:", error);
    }
}

// ✅ Función para guardar persona
document.getElementById("form-persona").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const relacion = document.getElementById("relacion").value.trim();
    const foto = document.getElementById("foto").value.trim();

    if (!nombre || !relacion || !foto) {
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    try {
        const respuesta = await fetch("http://192.168.127.197:5000/persona", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, relacion, foto })
        });

        const resultado = await respuesta.json();
        console.log("🔎 Respuesta del servidor:", resultado);

        if (respuesta.ok) {
            alert("✅ Persona guardada correctamente!");
            document.getElementById("form-persona").reset();
            cargarPersonas(); // Recargar lista
        } else {
            alert("❌ Error: " + resultado.error);
        }
    } catch (error) {
        console.error("❌ Error al enviar datos:", error);
    }
});

// ✅ Función para eliminar persona
async function eliminarPersona(id) {
    if (!confirm("⚠️ ¿Seguro que querés eliminar esta persona?")) return;

    try {
        const respuesta = await fetch(`http://192.168.127.197:5000/persona/${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();
        console.log("🔎 Eliminada:", resultado);

        if (respuesta.ok) {
            alert("✅ Persona eliminada!");
            cargarPersonas();
        } else {
            alert("❌ Error: " + resultado.error);
        }
    } catch (error) {
        console.error("❌ Error al eliminar:", error);
    }
}

// ✅ Función para volver al menú principal
function volverAInicio() {
    document.getElementById("pantalla-personas").style.display = "none";
    document.getElementById("menu-principal").style.display = "block";
}
