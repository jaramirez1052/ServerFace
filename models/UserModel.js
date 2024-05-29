const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    nombreCompleto: { type: String, required: true },
    descriptoresFaciales: { type: Array, required: true },
    correoInstitucional: { type: String, required: true },
    telefono: {
        type: String,
        validate: {
            validator: (v) => /^\d{10}$/.test(v),
            message: (props) => `${props.value} no es un teléfono válido`,
        },
        required: true,
    },
    cc: {
        type: String,
        unique: true,
        validate: {
            validator: (v) => /^\d{1,12}$/.test(v),
            message: (props) => `${props.value} no es una cédula válida`,
        },
        required: true,
    },
    imagen: { type: String },
});

const User = mongoose.model("User", userSchema);

module.exports = userSchema;