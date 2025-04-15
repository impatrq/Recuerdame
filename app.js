fetch("http://localhost:5000/personas")
  .then(response => response.json())
  .then(data => {
      const lista = document.getElementById("lista-personas");
      lista.innerHTML = ""; // Limpiar antes de agregar datos
      
      data.forEach(persona => {
          const elemento = document.createElement("div");
          elemento.classList.add("persona");
          elemento.innerHTML = `
              <img src="${persona.foto}" alt="${persona.nombre}">
              <h2>${persona.nombre}</h2>
              <p>${persona.relacion}</p>
          `;
          lista.appendChild(elemento);
      });
  })
  .catch(error => console.error("❌ Error al obtener datos:", error));