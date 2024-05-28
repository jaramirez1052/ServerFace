const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const fs = require("fs").promises;
const helmet = require("helmet");
require("dotenv").config();

const { extraerDescriptoresFaciales } = require("./utils/funciones"); 

// --- Configuración y Middleware ---

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"))
);

// --- Conexión a la Base de Datos ---

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a MongoDB"))
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1);
  });

// --- Modelos Usuario Mongoose ---

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

// --- Configuración Multer ---

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, process.env.UPLOAD_DIR || "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// --- Rutas de la API ---

require("./routes/routes")(app, upload, User, extraerDescriptoresFaciales);

// --- Manejo de Errores ---

require("./middleware/error")(app);

// --- Servidor ---

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});
