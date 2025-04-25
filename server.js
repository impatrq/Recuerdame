
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

// ✅ Conectar con MongoDB
mongoose.connect("mongodb://localhost:27017/recuerdame", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(error => console.error("❌ Error al conectar con MongoDB:", error));

// ✅ Middleware
app.use(express.json());
app.use(cors());

// ✅ Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, "public")));

// ✅ Esquema de base de datos
const PersonaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    relacion: { type: String, required: true },
    foto: { type: String, required: true }
});

const Persona = mongoose.model("Persona", PersonaSchema);

// ✅ Rutas API
app.get("/personas", async (req, res) => {
    try {
        const personas = await Persona.find();
        res.json(personas);
    } catch (error) {
        res.status(500).json({ error: "❌ Error al obtener personas" });
    }
});

app.post("/persona", async (req, res) => {
    try {
        console.log("🟢 Datos recibidos:", req.body);

        if (!req.body.nombre || !req.body.relacion || !req.body.foto) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
        }

        const nuevaPersona = new Persona(req.body);
        await nuevaPersona.save();
        res.json({ message: "✅ Persona registrada correctamente", persona: nuevaPersona });
    } catch (error) {
        console.error("❌ Error al registrar persona:", error);
        res.status(500).json({ error: "❌ Error al registrar persona" });
    }
});

app.delete("/persona/:id", async (req, res) => {
    try {
        const personaEliminada = await Persona.findByIdAndDelete(req.params.id);
        if (!personaEliminada) {
            return res.status(404).json({ error: "❌ Persona no encontrada." });
        }
        res.json({ message: "✅ Persona eliminada correctamente", persona: personaEliminada });
    } catch (error) {
        console.error("❌ Error al eliminar persona:", error);
        res.status(500).json({ error: "❌ Error al eliminar persona" });
    }
});

// ✅ Servir index.html en la raíz
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Iniciar servidor escuchando en 0.0.0.0 para acceso externo
app.listen(PORT, "192.168.127.113", () => {
    console.log(`🔥 Servidor corriendo en http://192.168.127.113:${PORT}`);
});
