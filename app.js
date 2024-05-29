const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const morgan = require("morgan");
const mongoose = require("mongoose");
const helmet = require("helmet");
const compression = require('compression');
require("dotenv").config();

const { extraerDescriptoresFaciales } = require("./utils/funciones");
const userModel = require("./models/UserModel");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(helmet());
app.use(cors({
  origin: isProduction ? process.env.CORS_ORIGIN : "*",
  optionsSuccessStatus: 200
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(morgan(isProduction ? "combined" : "dev"));

const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || "uploads");
app.use("/uploads", express.static(uploadsDir, { maxAge: isProduction ? '1d' : 0 }));

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Conectado Correctamente a la base de datos | MongoDB"))
  .catch((err) => {
    console.error("Error al conectar a la base de datos | MongoDB:", err);
    process.exit(1);
  });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

require("./routes/routes")(app, upload, userModel.User, extraerDescriptoresFaciales);
require("./middleware/error")(app);

const PORT = process.env.PORT || 4010;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});