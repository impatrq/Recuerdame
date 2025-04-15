const express = require('express');
const cors = require('cors');
const conectarDB = require('./database'); // 🔥 Conectar con MongoDB
const Persona = require('./models/Persona'); // 🔥 Importar el modelo de Persona

const app = express();
app.use(cors());
app.use(express.json());

conectarDB(); // 🚀 Conectar el servidor a la base de datos

// 📝 **Registrar una persona que el paciente debe reconocer**
app.post('/persona', async (req, res) => {
    try {
        const nuevaPersona = new Persona(req.body); // 📌 Crear nueva persona con los datos recibidos
        await nuevaPersona.save(); // 💾 Guardar en MongoDB
        res.json({ message: '✅ Persona registrada correctamente', persona: nuevaPersona });
    } catch (error) {
        console.error("❌ Error al registrar persona:", error); // 📌 Mostrar el error exacto en la terminal
        res.status(500).json({ error: '❌ Error al registrar persona' });
    }
});

// 🧐 **Obtener todas las personas registradas**
app.get('/personas', async (req, res) => {
    try {
        const personas = await Persona.find(); // 📌 Obtener todas las personas de la base de datos
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: '❌ Error al obtener personas' });
    }
});

// 🚀 **Iniciar el servidor**
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});