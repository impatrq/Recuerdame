app.post("/persona", upload.single("foto"), async (req, res) => {
    try {
        console.log("🟢 req.body:", req.body);
        console.log("🟢 req.file:", req.file);

        if (!req.body.nombre || !req.body.relacion || !req.file) {
            console.error("❌ Campos faltantes:", {
                nombre: req.body.nombre,
                relacion: req.body.relacion,
                foto: req.file ? req.file.filename : null
            });
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