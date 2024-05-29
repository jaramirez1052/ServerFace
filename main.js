require("dotenv").config();

const express = require("express");
const path = require("path");
const multer = require("multer");
const User = require("./config/userModel");
const extraerDescriptoresFaciales = require("./utils/faceRecognition");
const mongoose = require("mongoose");
const cors = require("cors");

// --- Crear la aplicación Express --- 
const app = express();

const PORT = process.env.PORT || 4010;
const uploadDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");

// Configuración de Multer
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(uploadDir)); 

// --- Conexión a la Base de Datos ---
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Conectado a MongoDB");

    // Rutas
    require("./config/routes")(app, upload, User, extraerDescriptoresFaciales);
  })
  .catch((err) => {
    console.error("Error al conectar a MongoDB:", err);
    process.exit(1); 
  });

// Rutas
require("./config/routes")(app, upload, User, extraerDescriptoresFaciales);

// Middleware de manejo de errores (Después de definir las rutas)
require("./config/middleware")(app); 

// --- Servidor ---
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});