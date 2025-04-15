const mongoose = require('mongoose');

const personaSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    relacion: { type: String, required: true },
    foto: { type: String, required: true }
});

const Persona = mongoose.model('Persona', personaSchema);
module.exports = Persona;