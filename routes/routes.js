const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { extraerDescriptoresFaciales } = require('../utils/funciones');

const router = express.Router();

module.exports = (app, upload, User) => {
  // Obtener todos los usuarios
  router.get("/usuarios", async (req, res) => {
    try {
      const users = await User.find().select("-descriptoresFaciales");
      res.json(users);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Obtener usuario por cédula
  router.get("/usuario/:cc", async (req, res) => {
    try {
      const user = await User.findOne({ cc: req.params.cc }).select("-descriptoresFaciales");
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Recibir el stream de la webcam
  router.post('/set-webcam-stream', async (req, res) => {
    try {
      const { descriptors } = req.body;
      if (!descriptors || descriptors.length === 0) {
        return res.status(400).json({ error: "No se proporcionaron descriptores válidos" });
      }
      res.sendStatus(200);
    } catch (err) {
      console.error('Error al procesar los descriptores de la webcam:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Subir datos de usuario y descriptores faciales
  router.post("/usuario", upload.single("imagen"), async (req, res) => {
    try {
      const { nombreCompleto, correoInstitucional, telefono, cc } = req.body;
      if (!req.file || !nombreCompleto || !correoInstitucional || !telefono || !cc) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      const descriptoresFaciales = await extraerDescriptoresFaciales(req.file.path);

      const newUser = new User({
        nombreCompleto,
        descriptoresFaciales,
        correoInstitucional,
        telefono,
        cc,
        imagen: req.file.filename,
      });

      await newUser.save();
      await fs.unlink(req.file.path);

      res.status(201).json({ message: "Usuario creado exitosamente", usuario: newUser });
    } catch (err) {
      console.error(err);
      const errorMessage = err.code === 11000 ? "La cédula ya está registrada" : err.message;
      const statusCode = err.name === "ValidationError" || err.code === 11000 ? 400 : 500;
      res.status(statusCode).json({ error: errorMessage });
    }
  });

  // Eliminar usuario por cédula
  router.delete("/usuario/:cc", async (req, res) => {
    try {
      const deletedUser = await User.findOneAndDelete({ cc: req.params.cc });
      if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });

      if (deletedUser.imagen) {
        await fs.unlink(path.join(__dirname, '..', process.env.UPLOAD_DIR || "uploads", deletedUser.imagen));
      }

      res.json({ message: "Usuario eliminado correctamente" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Validar descriptores faciales
  router.post("/validar", async (req, res) => {
    try {
      const { descriptors } = req.body;

      const usuarioCoincidente = await User.aggregate([
        {
          $project: {
            nombreCompleto: 1,
            correoInstitucional: 1,
            telefono: 1,
            cc: 1,
            imagen: 1,
            distancia: {
              $min: {
                $map: {
                  input: "$descriptoresFaciales",
                  as: "df",
                  in: {
                    $sum: {
                      $pow: [{ $subtract: ["$$df", descriptors] }, 2],
                    },
                  },
                },
              },
            },
          },
        },
        { $match: { distancia: { $lt: 0.6 } } },
        { $sort: { distancia: 1 } },
        { $limit: 1 },
      ]);

      if (usuarioCoincidente.length > 0) {
        res.json({
          message: "Coincidencia encontrada",
          usuario: usuarioCoincidente[0],
        });
      } else {
        res.json({ message: "No se encontró coincidencia" });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.use("/", router);
};