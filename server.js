const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express(); // ✅ Aquí inicializamos Express
const PORT = 5000;

// Conexión con MongoDB
mongoose.connect("mongodb://localhost:27017/recuerdame", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB"))
    .catch(error => {
        console.error("❌ Error al conectar con MongoDB:", error);
        process.exit(1);
    });

// Middleware para manejar datos y CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname, "public"))); // Servir archivos estáticos

// Configuración de multer para manejo de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "public", "uploads");
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
            return cb(new Error("⚠️ Solo se permiten imágenes JPG, JPEG y PNG."));
        }
        cb(null, true);
    }
});

// Esquema y modelo de MongoDB
const PersonaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    relacion: { type: String, required: true },
    foto: { type: String, required: true }
});

const Persona = mongoose.model("Persona", PersonaSchema);

// Rutas API
app.get("/personas", async (req, res) => {
    try {
        const personas = await Persona.find();
        res.json(personas);
    } catch (error) {
        console.error("❌ Error al obtener personas:", error);
        res.status(500).json({ error: "❌ Error al obtener personas" });
    }
});

app.post("/persona", upload.single("foto"), async (req, res) => {
    try {
        console.log("🟢 req.body:", req.body);
        console.log("🟢 req.file:", req.file);

        if (!req.body.nombre || !req.body.relacion || !req.file) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
        }

        const nuevaPersona = new Persona({
            nombre: req.body.nombre,
            relacion: req.body.relacion,
            foto: `/uploads/${req.file.filename}`
        });

        await nuevaPersona.save();
        console.log("✅ Persona registrada correctamente:", nuevaPersona);
        res.json({ message: "✅ Persona registrada correctamente", persona: nuevaPersona });
    } catch (error) {
        console.error("❌ Error al registrar persona:", error);
        res.status(500).json({ error: "❌ Error al registrar persona: " + error.message });
    }
});

app.delete("/persona/:id", async (req, res) => {
    try {
        const personaEliminada = await Persona.findByIdAndDelete(req.params.id);
        if (!personaEliminada) {
            return res.status(404).json({ error: "❌ Persona no encontrada." });
        }
        console.log("✅ Persona eliminada:", personaEliminada);
        res.json({ message: "✅ Persona eliminada correctamente", persona: personaEliminada });
    } catch (error) {
        console.error("❌ Error al eliminar persona:", error);
        res.status(500).json({ error: "❌ Error al eliminar persona" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, "192.168.125.191", () => {
    console.log(`🔥 Servidor corriendo en http://192.168.125.191:${PORT}`);
});