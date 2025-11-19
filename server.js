const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 5000;

mongoose.connect("mongodb+srv://recuerdamecpf:recuerdame123@recuerdamecluster.yitpqed.mongodb.net/recuerdame?retryWrites=true&w=majority&appName=RecuerdameCluster", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Conectado a MongoDB Atlas")) // <-- ¡Asegurate que esté esta línea!
    .catch(error => console.error("❌ Error al conectar con MongoDB Atlas:", error));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
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

// --- Esquemas y Modelos Existentes ---
const PersonaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    relacion: { type: String, required: true },
    foto: { type: String, required: true }
});
const Persona = mongoose.model("Persona", PersonaSchema);

// --- NUEVOS Esquemas y Modelos para Preguntas y Respuestas ---

// Esquema para Preguntas - AHORA INCLUYE respuestaCorrecta
const PreguntaSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    tipo: { type: String, enum: ['multiple_choice', 'text_input', 'binary'], default: 'text_input' },
    opciones: { type: [String], default: [] },
    respuestaCorrecta: { type: String }, // <--- CAMBIO AQUÍ: Campo para almacenar la respuesta correcta
    fechaCreacion: { type: Date, default: Date.now }
});
const Pregunta = mongoose.model("Pregunta", PreguntaSchema);

// Esquema para Respuestas (sin cambios aquí, 'acierto' se determina en frontend)
const RespuestaSchema = new mongoose.Schema({
    pregunta: { type: mongoose.Schema.Types.ObjectId, ref: 'Pregunta', required: true },
    respuestaTexto: { type: String },
    respuestaOpcion: { type: String },
    fechaRespuesta: { type: Date, default: Date.now },
    acierto: { type: Boolean }
});
const Respuesta = mongoose.model("Respuesta", RespuestaSchema);

// --- Rutas Existentes para Personas (sin cambios) ---
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
        console.error("Error al registrar persona:", error);
        res.status(500).json({ error: "❌ Error al registrar persona: " + (error.message || "Error desconocido") });
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
        console.error("Error al eliminar persona:", error);
        res.status(500).json({ error: "❌ Error al eliminar persona" });
    }
});

// --- Rutas API para Preguntas (actualizada para recibir respuestaCorrecta) ---

// Ruta para agregar una nueva pregunta (útil para que el administrador las defina)
app.post("/pregunta", async (req, res) => {
    try {
        const { texto, tipo, opciones, respuestaCorrecta } = req.body;
        if (!texto) {
            return res.status(400).json({ error: "⚠️ El texto de la pregunta es obligatorio." });
        }
        const nuevaPregunta = new Pregunta({ texto, tipo, opciones, respuestaCorrecta });
        await nuevaPregunta.save();
        res.status(201).json({ message: "✅ Pregunta agregada correctamente", pregunta: nuevaPregunta });
    } catch (error) {
        console.error("Error al agregar pregunta:", error);
        res.status(500).json({ error: "❌ Error al agregar pregunta: " + (error.message || "Error desconocido") });
    }
});

// Ruta para obtener una pregunta aleatoria o la pregunta del día (sin cambios)
app.get("/pregunta/diaria", async (req, res) => {
    try {
        const count = await Pregunta.countDocuments();
        if (count === 0) {
            // Este 404 es intencional si no hay preguntas, para que el frontend lo maneje
            return res.status(404).json({ message: "No hay preguntas disponibles." });
        }
        const random = Math.floor(Math.random() * count);
        const pregunta = await Pregunta.findOne().skip(random);
        res.json(pregunta);
    } catch (error) {
        console.error("Error al obtener pregunta diaria:", error);
        res.status(500).json({ error: "❌ Error al obtener pregunta diaria" });
    }
});

// Ruta para enviar una respuesta a una pregunta (sin cambios)
app.post("/respuesta", async (req, res) => {
    try {
        const { preguntaId, respuestaTexto, respuestaOpcion, acierto } = req.body;
        if (!preguntaId) {
            return res.status(400).json({ error: "⚠️ El ID de la pregunta es obligatorio." });
        }
        const nuevaRespuesta = new Respuesta({
            pregunta: preguntaId,
            respuestaTexto,
            respuestaOpcion,
            acierto
        });
        await nuevaRespuesta.save();
        res.status(201).json({ message: "✅ Respuesta registrada correctamente", respuesta: nuevaRespuesta });
    } catch (error) {
        console.error("Error al registrar respuesta:", error);
        res.status(500).json({ error: "❌ Error al registrar respuesta: " + (error.message || "Error desconocido") });
    }
});

// Ruta para obtener estadísticas (sin cambios)
app.get("/estadisticas", async (req, res) => {
    try {
        const totalRespuestas = await Respuesta.countDocuments();
        const respuestasCorrectas = await Respuesta.countDocuments({ acierto: true });
        const respuestasIncorrectas = await Respuesta.countDocuments({ acierto: false });

        const estadisticasPorPregunta = await Respuesta.aggregate([
            {
                $group: {
                    _id: "$pregunta",
                    total: { $sum: 1 },
                    correctas: { $sum: { $cond: ["$acierto", 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: "preguntas",
                    localField: "_id",
                    foreignField: "_id",
                    as: "detallesPregunta"
                }
            },
            {
                $unwind: "$detallesPregunta"
            },
            {
                $project: {
                    _id: 0,
                    preguntaId: "$_id",
                    textoPregunta: "$detallesPregunta.texto",
                    totalRespuestas: "$total",
                    respuestasCorrectas: "$correctas",
                    porcentajeAcierto: { $multiply: [{ $divide: ["$correctas", "$total"] }, 100] }
                }
            }
        ]);

        res.json({
            totalRespuestas,
            respuestasCorrectas,
            respuestasIncorrectas,
            porcentajeAciertoGeneral: totalRespuestas > 0 ? (respuestasCorrectas / totalRespuestas) * 100 : 0,
            estadisticasPorPregunta
        });
    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ error: "❌ Error al obtener estadísticas: " + (error.message || "Error desconocido") });
    }
});

// --- NUEVA RUTA: Borrar todas las estadísticas ---
app.delete("/estadisticas/reset", async (req, res) => {
    try {
        const result = await Respuesta.deleteMany({}); // Borra todos los documentos en la colección de respuestas
        res.json({
            message: "✅ Todas las estadísticas han sido borradas.",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Error al borrar estadísticas:", error);
        res.status(500).json({ error: "❌ Error al borrar estadísticas: " + (error.message || "Error desconocido") });
    }
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
});
