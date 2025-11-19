const API_URL = window.location.origin.includes("localhost") ? "http://localhost:5000" : window.location.origin;

let currentQuestion = null; // Variable para almacenar la pregunta actual

// --- Manejo de Pantallas ---
function mostrarPantalla(pantalla) {
    // Oculta todas las pantallas posibles
    document.getElementById('menu-principal').style.display = 'none'; // Asegurarse de ocultar el menú principal
    document.getElementById('pantalla-personas').style.display = 'none';
    document.getElementById('pantalla-preguntas').style.display = 'none'; // Nueva pantalla
    document.getElementById('pantalla-estadisticas').style.display = 'none'; // Nueva pantalla
    document.getElementById('pantalla-configuracion').style.display = 'none'; // Nueva pantalla

    // Muestra la pantalla solicitada
    if (pantalla === 'menu') {
        document.getElementById('barra-navegacion').style.display = 'flex'; // Asegurarse de que la barra esté visible
        document.getElementById('menu-principal').style.display = 'block';
    } else if (pantalla === 'personas') {
        document.getElementById('barra-navegacion').style.display = 'flex';
        document.getElementById('pantalla-personas').style.display = 'block';
        cargarPersonas(); // Cargar personas cada vez que se muestra
    } else if (pantalla === 'preguntas') {
        document.getElementById('barra-navegacion').style.display = 'flex';
        document.getElementById('pantalla-preguntas').style.display = 'block';
        cargarPreguntaDiaria(); // Cargar la pregunta al mostrar la pantalla
    } else if (pantalla === 'estadisticas') {
        document.getElementById('barra-navegacion').style.display = 'flex';
        document.getElementById('pantalla-estadisticas').style.display = 'block';
        cargarEstadisticas(); // Cargar estadísticas al mostrar la pantalla
    } else if (pantalla === 'configuracion') {
        document.getElementById('barra-navegacion').style.display = 'flex';
        document.getElementById('pantalla-configuracion').style.display = 'block';
    }
}

// Botones de la barra de navegación
document.getElementById("btn-nav-menu").addEventListener("click", () => {
    mostrarPantalla('menu');
});
document.getElementById("btn-nav-personas").addEventListener("click", () => {
    mostrarPantalla('personas');
});
document.getElementById("btn-nav-preguntas").addEventListener("click", () => {
    mostrarPantalla('preguntas');
});
document.getElementById("btn-nav-estadisticas").addEventListener("click", () => {
    mostrarPantalla('estadisticas');
});
document.getElementById("btn-nav-configuracion").addEventListener("click", () => {
    mostrarPantalla('configuracion');
});


// --- Lógica de Personas (Existente) ---
async function cargarPersonas() {
    try {
        const response = await fetch(`${API_URL}/personas`);
        const data = await response.json();

        const lista = document.getElementById("lista-personas");
        lista.innerHTML = "";

        // Si no hay personas registradas, mostrar un mensaje
        if (data.length === 0) {
            const noPersonasMsg = document.createElement("p");
            noPersonasMsg.textContent = "No hay personas registradas aún.";
            noPersonasMsg.style.textAlign = "center";
            noPersonasMsg.style.marginTop = "20px";
            noPersonasMsg.style.color = "#636366";
            lista.appendChild(noPersonasMsg);
            return;
        }

        data.forEach(persona => {
            const elemento = document.createElement("div");
            elemento.classList.add("persona");
            // Asegurarse de que la URL de la imagen sea correcta, especialmente si el servidor está en un dominio diferente
            const fotoUrl = `${API_URL}${persona.foto}`;
            elemento.innerHTML = `
                <img src="${fotoUrl}" alt="${persona.nombre}" width="100">
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
        alert("❌ Error al cargar personas. Por favor, inténtalo de nuevo.");
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
            alert("❌ Error: " + (resultado.error || "Hubo un problema al guardar la persona."));
        }
    } catch (error) {
        console.error("❌ Error al enviar datos:", error);
        alert("❌ Error de conexión al guardar la persona. Por favor, verifica el servidor.");
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
            alert("❌ Error: " + (resultado.error || "Hubo un problema al eliminar la persona."));
        }
    } catch (error) {
        console.error("❌ Error al eliminar:", error);
        alert("❌ Error de conexión al eliminar la persona. Por favor, verifica el servidor.");
    }
}


// --- NUEVA Lógica de Preguntas Diarias ---
async function cargarPreguntaDiaria() {
    const preguntaTextoElem = document.getElementById("pregunta-texto");
    const opcionesRespuestaElem = document.getElementById("opciones-respuesta");
    const btnEnviarRespuesta = document.getElementById("btn-enviar-respuesta");
    const mensajeRespuestaElem = document.getElementById("mensaje-respuesta");
    const btnSiguientePregunta = document.getElementById("btn-siguiente-pregunta");

    preguntaTextoElem.textContent = "Cargando pregunta...";
    opcionesRespuestaElem.innerHTML = "";
    btnEnviarRespuesta.style.display = "none";
    mensajeRespuestaElem.textContent = "";
    btnSiguientePregunta.style.display = "none";

    try {
        const response = await fetch(`${API_URL}/pregunta/diaria`);
        if (!response.ok) {
            if (response.status === 404) {
                preguntaTextoElem.textContent = "No hay preguntas cargadas aún. Por favor, agrega algunas.";
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        currentQuestion = data; // Almacena la pregunta actual globalmente

        preguntaTextoElem.textContent = currentQuestion.texto;

        if (currentQuestion.tipo === 'multiple_choice' && currentQuestion.opciones && currentQuestion.opciones.length > 0) {
            currentQuestion.opciones.forEach(opcion => {
                const button = document.createElement("button");
                button.classList.add("button"); // Reusar clase de botón existente
                button.textContent = opcion;
                button.setAttribute("data-respuesta", opcion); // Almacena la opción como data-respuesta
                opcionesRespuestaElem.appendChild(button);
                button.addEventListener("click", () => seleccionarOpcion(opcion));
            });
            btnEnviarRespuesta.style.display = "block"; // Mostrar el botón de enviar
        } else if (currentQuestion.tipo === 'binary') { // Ejemplo para sí/no
            const btnSi = document.createElement("button");
            btnSi.classList.add("button");
            btnSi.textContent = "Sí";
            btnSi.setAttribute("data-respuesta", "si");
            opcionesRespuestaElem.appendChild(btnSi);
            btnSi.addEventListener("click", () => seleccionarOpcion("si"));

            const btnNo = document.createElement("button");
            btnNo.classList.add("button");
            btnNo.textContent = "No";
            btnNo.setAttribute("data-respuesta", "no");
            opcionesRespuestaElem.appendChild(btnNo);
            btnNo.addEventListener("click", () => seleccionarOpcion("no"));

            btnEnviarRespuesta.style.display = "block";
        } else { // Asume 'text_input' por defecto si no es opción múltiple ni binaria
            const input = document.createElement("input");
            input.type = "text";
            input.id = "respuesta-texto-input";
            input.placeholder = "Escribe tu respuesta aquí...";
            opcionesRespuestaElem.appendChild(input);
            btnEnviarRespuesta.style.display = "block";
        }

    } catch (error) {
        console.error("❌ Error al cargar la pregunta diaria:", error);
        preguntaTextoElem.textContent = "Hubo un error al cargar la pregunta. Inténtalo de nuevo más tarde.";
    }
}

// Función para seleccionar una opción (para multiple_choice y binary)
function seleccionarOpcion(opcionSeleccionada) {
    // Desmarcar cualquier opción previamente seleccionada
    document.querySelectorAll('#opciones-respuesta .button').forEach(button => {
        button.classList.remove('selected'); // Puedes añadir una clase CSS 'selected'
    });
    // Marcar la opción actual
    const selectedButton = document.querySelector(`[data-respuesta="${opcionSeleccionada}"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }
    // Asignar la opción seleccionada al botón de enviar para que se use en el evento
    document.getElementById("btn-enviar-respuesta").setAttribute("data-selected-option", opcionSeleccionada);
}


// Event listener para el botón de enviar respuesta
document.getElementById("btn-enviar-respuesta").addEventListener("click", async () => {
    if (!currentQuestion) return; // No hay pregunta cargada

    let respuestaEnviada = {};
    let esCorrecta = false; // Lógica para determinar si es correcta

    if (currentQuestion.tipo === 'text_input') {
        const inputRespuesta = document.getElementById("respuesta-texto-input");
        if (!inputRespuesta || inputRespuesta.value.trim() === "") {
            alert("Por favor, ingresa tu respuesta.");
            return;
        }
        respuestaEnviada.respuestaTexto = inputRespuesta.value.trim();
        // Lógica de acierto para texto libre (ej. comparación simple o más compleja)
        // Por ahora, asumimos que todas las respuestas de texto libre son "correctas"
        // o la lógica de validación se haría en el backend contra una "respuestaEsperada"
        esCorrecta = true; // Placeholder: deberías tener un criterio de acierto más complejo aquí.
                           // Ej. si el backend devuelve si es correcta o no.
    } else { // multiple_choice o binary
        const selectedOption = document.getElementById("btn-enviar-respuesta").getAttribute("data-selected-option");
        if (!selectedOption) {
            alert("Por favor, selecciona una opción.");
            return;
        }
        respuestaEnviada.respuestaOpcion = selectedOption;
        // Lógica de acierto para opciones (ej. si la opción seleccionada es la esperada)
        // Ejemplo: Si la pregunta tuviera una propiedad 'respuestaCorrecta'
        // esCorrecta = (selectedOption === currentQuestion.respuestaCorrecta);
        // Por ahora, para simplificar y ver cómo funciona, marcaremos la primera opción como "correcta"
        // Esto DEBE ser reemplazado por lógica real, quizás en el backend.
        // Por ejemplo, si en el backend la Pregunta tuviera un campo `respuestaEsperada`
        if (currentQuestion.opciones && currentQuestion.opciones.length > 0) {
            esCorrecta = (selectedOption === currentQuestion.opciones[0]); // Esto es solo un placeholder!
        } else if (currentQuestion.tipo === 'binary') {
            esCorrecta = (selectedOption === "si"); // Placeholder: si la respuesta esperada es "si"
        }
    }

    try {
        const response = await fetch(`${API_URL}/respuesta`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                preguntaId: currentQuestion._id,
                ...respuestaEnviada,
                acierto: esCorrecta // Envía si fue correcta o no
            })
        });

        const result = await response.json();
        if (response.ok) {
            document.getElementById("mensaje-respuesta").textContent = esCorrecta ? "¡Respuesta Correcta! 🎉" : "Respuesta Incorrecta. 😕";
            document.getElementById("mensaje-respuesta").style.color = esCorrecta ? "#4CAF50" : "#F44336";
            document.getElementById("btn-enviar-respuesta").style.display = "none"; // Oculta el botón de enviar
            document.getElementById("btn-siguiente-pregunta").style.display = "block"; // Muestra el botón de siguiente
            // Deshabilitar todas las opciones después de responder
            document.querySelectorAll('#opciones-respuesta .button').forEach(button => {
                button.disabled = true;
            });
            const inputRespuesta = document.getElementById("respuesta-texto-input");
            if (inputRespuesta) inputRespuesta.disabled = true;

        } else {
            console.error("Error al enviar respuesta:", result.error);
            document.getElementById("mensaje-respuesta").textContent = "Error al enviar la respuesta.";
            document.getElementById("mensaje-respuesta").style.color = "#F44336";
        }
    } catch (error) {
        console.error("Error de conexión al enviar respuesta:", error);
        document.getElementById("mensaje-respuesta").textContent = "Error de conexión. Inténtalo de nuevo.";
        document.getElementById("mensaje-respuesta").style.color = "#F44336";
    }
});

// Event listener para el botón "Siguiente Pregunta"
document.getElementById("btn-siguiente-pregunta").addEventListener("click", () => {
    cargarPreguntaDiaria(); // Carga una nueva pregunta
});


// --- NUEVA Lógica de Estadísticas ---
let myChartInstance = null; // Para almacenar la instancia del gráfico y destruirla si se recarga

async function cargarEstadisticas() {
    try {
        const response = await fetch(`${API_URL}/estadisticas`);
        const data = await response.json();

        // Actualizar estadísticas generales
        document.getElementById("correctas-generales").textContent = data.respuestasCorrectas;
        document.getElementById("incorrectas-generales").textContent = data.respuestasIncorrectas;
        document.getElementById("porcentaje-general").textContent = data.porcentajeAciertoGeneral.toFixed(2); // Mostrar con 2 decimales

        // Actualizar porcentaje en ficha rápida de rendimiento general (inicio)
        const spanRendimiento = document.getElementById("porcentaje-rendimiento");
        if (spanRendimiento) {
         spanRendimiento.textContent = data.porcentajeAciertoGeneral.toFixed(2);
        }


        // Actualizar estadísticas por pregunta en una lista
        const listaEstadisticasPreguntas = document.getElementById("lista-estadisticas-preguntas");
        listaEstadisticasPreguntas.innerHTML = ""; // Limpiar antes de agregar

        if (data.estadisticasPorPregunta.length === 0) {
            listaEstadisticasPreguntas.textContent = "No hay estadísticas de preguntas aún.";
        } else {
            data.estadisticasPorPregunta.forEach(stats => {
                const div = document.createElement("div");
                div.classList.add("persona"); // Reutilizar el estilo de 'persona' para la tarjeta
                div.innerHTML = `
                    <h3>"${stats.textoPregunta}"</h3>
                    <p>Total Respuestas: ${stats.totalRespuestas}</p>
                    <p>Respuestas Correctas: ${stats.respuestasCorrectas}</p>
                    <p>Porcentaje de Acierto: ${stats.porcentajeAcierto.toFixed(2)}%</p>
                `;
                listaEstadisticasPreguntas.appendChild(div);
            });
        }


        // Generar gráfico con Chart.js
        const ctx = document.getElementById('myChart').getContext('2d');

        // Destruir la instancia anterior del gráfico si existe para evitar duplicados
        if (myChartInstance) {
            myChartInstance.destroy();
        }

        const labels = data.estadisticasPorPregunta.map(s => s.textoPregunta);
        const correctas = data.estadisticasPorPregunta.map(s => s.respuestasCorrectas);
        const totales = data.estadisticasPorPregunta.map(s => s.totalRespuestas);
        const incorrectas = totales.map((t, i) => t - correctas[i]);


        myChartInstance = new Chart(ctx, {
            type: 'line', // Puedes probar 'pie', 'doughnut', 'line'
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Respuestas Correctas',
                        data: correctas,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Respuestas Incorrectas',
                        data: incorrectas,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Número de Respuestas'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Pregunta'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                }
            }
        });

    } catch (error) {
        console.error("❌ Error al cargar estadísticas:", error);
        alert("❌ Error al cargar las estadísticas. Por favor, inténtalo de nuevo.");
    }
}


// --- Inicialización: Muestra la pantalla inicial al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    mostrarPantalla('menu');
    mostrarFichaPaciente(); // ← agregar esta línea
});





document.getElementById("foto").addEventListener("change", function(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("preview");

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        preview.style.display = "none";
    }
});


function toggleFormularioPersona() {
    const form = document.getElementById("form-persona");
    const icono = document.querySelector("#btn-toggle-form i");

    if (form.style.display === "none") {
        form.style.display = "flex";
        icono.setAttribute("data-lucide", "minus");
    } else {
        form.style.display = "none";
        icono.setAttribute("data-lucide", "plus");
    }

    lucide.createIcons(); // Vuelve a renderizar el ícono después del cambio
}

function guardarConfiguracionPaciente(nombre, edad, estado) {
    localStorage.setItem("paciente", JSON.stringify({ nombre, edad, estado }));
}

function obtenerConfiguracionPaciente() {
    const data = localStorage.getItem("paciente");
    return data ? JSON.parse(data) : null;
}

document.getElementById("form-configuracion").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("input-nombre-paciente").value;
    const edad = document.getElementById("input-edad-paciente").value;
    const estado = document.getElementById("input-estado-paciente").value;
    guardarConfiguracionPaciente(nombre, edad, estado);
    alert("✅ Datos guardados");
    mostrarFichaPaciente(); // actualizar vista
});

function mostrarFichaPaciente() {
    const datos = obtenerConfiguracionPaciente();
    if (datos) {
        document.getElementById("ficha-nombre").textContent = datos.nombre;
        document.getElementById("ficha-edad").textContent = datos.edad;
        document.getElementById("ficha-estado").textContent = datos.estado;
    }
}

