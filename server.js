const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require('multer'); // Para manejar archivos

// ✅ Crear instancia de la aplicación Express
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

// ✅ Configuración de multer para manejar archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads'); // Asegúrate de que esta carpeta exista
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para evitar sobreescrituras
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            return cb(new Error('Solo se permiten imágenes JPG, JPEG y PNG.'));
        }
        cb(null, true);
    }
});

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

app.post("/persona", upload.single('foto'), async (req, res) => {
    try {
        console.log("🟢 Datos recibidos:", req.body);
        console.log("🟢 Archivo recibido:", req.file);

        if (!req.body.nombre || !req.body.relacion || !req.file) {
            return res.status(400).json({ error: "⚠️ Todos los campos son obligatorios." });
        }

        const nuevaPersona = new Persona({
            nombre: req.body.nombre,
            relacion: req.body.relacion,
            foto: `/uploads/${req.file.filename}`
        });

        await nuevaPersona.save();
        res.json({ message: "✅ Persona registrada correctamente", persona: nuevaPersona });
    } catch (error) {
        console.error("❌ Error al registrar persona:", error.message || error);
        res.status(500).json({ error: "❌ Error al registrar persona: " + error.message || error });
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

// ✅ Iniciar servidor
app.listen(PORT, "192.168.124.233", () => {
    console.log(`🔥 Servidor corriendo en http://192.168.124.233:${PORT}`);
});
