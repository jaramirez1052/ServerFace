const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');
const fs = require('fs').promises;

// Configuración de canvas para face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Cargar los modelos una vez al inicio
const MODEL_PATH = path.join(__dirname, '../models');
async function cargarModelos() {
    try {
        await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
        console.log('Modelos cargados');
    } catch (err) {
        console.error('Error al cargar los modelos:', err);
    }
}

// Llamar a la función para cargar los modelos
cargarModelos();

async function extraerDescriptoresFaciales(imagePath) {
    try {
        // Leer la imagen desde el sistema de archivos
        const imageBuffer = await fs.readFile(imagePath);
        const image = await canvas.loadImage(imageBuffer);

        // Detectar el rostro y extraer el descriptor facial
        const detections = await faceapi.detectSingleFace(image).withFaceLandmarks().withFaceDescriptor();

        if (!detections) {
            throw new Error('No se detectó ningún rostro en la imagen');
        }

        return detections.descriptor; // Retorna el descriptor facial
    } catch (err) {
        throw new Error(`Error al procesar la imagen: ${err.message}`);
    }
}

function calcularDistancia(descriptores1, descriptores2) {
    return faceapi.euclideanDistance(descriptores1, descriptores2); // Calcula la distancia euclidiana
}

module.exports = {
    extraerDescriptoresFaciales,
    calcularDistancia
};