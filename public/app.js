const API_URL = window.location.origin.includes("localhost") ? "http://localhost:5000" : window.location.origin;

document.getElementById("btn-comenzar").addEventListener("click", () => {
    document.getElementById("pantalla-inicial").style.display = "none";
    document.getElementById("menu-principal").style.display = "block";
});

document.getElementById("btn-personas").addEventListener("click", () => {
    document.getElementById("menu-principal").style.display = "none";
    document.getElementById("pantalla-personas").style.display = "block";
    cargarPersonas();
});

async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`);
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
                <button class="btn-eliminar" data-id="${persona._id}">
                    <svg viewBox="0 0 448 512" class="svgIcon">
                        <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                    </svg>
                </button>
            `;
            lista.appendChild(elemento);
        });

        document.querySelectorAll(".btn-eliminar").forEach(boton => {
            boton.addEventListener("click", async () => {
                const id = boton.getAttribute("data-id");
                eliminarPersona(id);
            });
        });

    } catch (error) {
        console.error("❌ Error al obtener datos:", error);
    }
}

document.getElementById("form-persona").addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const relacion = document.getElementById("relacion").value.trim();
    const fotoInput = document.getElementById("foto");

    if (!nombre || !relacion || !fotoInput.files[0]) {
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("relacion", relacion);
    formData.append("foto", fotoInput.files[0]);

    try {
        const respuesta = await fetch(`${API_URL}/persona`, {
            method: "POST",
            body: formData
        });

        const resultado = await respuesta.json();

        if (respuesta.ok) {
            alert("✅ Persona guardada correctamente!");
            document.getElementById("form-persona").reset();
            cargarPersonas();
        } else {
            alert("❌ Error: " + resultado.error);
        }
    } catch (error) {
        console.error("❌ Error al enviar datos:", error);
    }
});

async function eliminarPersona(id) {
    if (!confirm("⚠️ ¿Seguro que querés eliminar esta persona?")) return;

    try {
        const respuesta = await fetch(`${API_URL}/persona/${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

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

function mostrarPantalla(pantalla) {
    document.getElementById('pantalla-inicial').style.display = 'none';
    document.getElementById('pantalla-personas').style.display = 'none';
    document.getElementById('estadisticas').style.display = 'none';
    document.getElementById('configuracion').style.display = 'none';

    if (pantalla === 'personas') {
        document.getElementById('pantalla-personas').style.display = 'block';
    } else if (pantalla === 'estadisticas') {
        document.getElementById('estadisticas').style.display = 'block';
    } else if (pantalla === 'configuracion') {
        document.getElementById('configuracion').style.display = 'block';
    }
}

document.getElementById('btn-comenzar').addEventListener('click', function() {
    document.getElementById('pantalla-inicial').style.display = 'none';
    document.getElementById('barra-navegacion').style.display = 'flex';
    document.getElementById('menu-principal').style.display = 'block';
});
