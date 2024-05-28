const faceapi = require('face-api.js');
const canvas = require('canvas');
const path = require('path');

// Configuración de canvas para face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// --- Variables Globales ---
let recognizing = false;

// --- Carga de Modelos ---
async function loadModels() {
    const MODEL_PATH = path.resolve(__dirname, '../models');
    try {
        await faceapi.nets.tinyFaceDetector.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
        await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
        console.log('Modelos cargados correctamente.');
        startFaceDetection();
    } catch (err) {
        console.error('Error al cargar los modelos:', err);
    }
}

loadModels();

// Iniciar la detección facial
async function startFaceDetection() {
    try {
        const video = await getVideoStream();
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceDescriptors();
            
            if (detections.length > 0) {
                const descriptor = Array.from(detections[0].descriptor);
                sendDescriptorToServer(descriptor);
            }
        }, 300);
    } catch (error) {
        console.error('Error al iniciar la detección facial:', error);
    }
}

// --- Funciones de Reconocimiento Facial ---
function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            webcamStream = stream;
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                setInterval(recognizeFace, 1000); // Ejecutar reconocimiento cada segundo
            };
            console.log('Webcam iniciada');
        })
        .catch(err => {
            console.error('Error al iniciar la webcam:', err);
            resultMessage.textContent = 'Error al iniciar la webcam';
        });
}

async function recognizeFace() {
    if (recognizing) return; // Prevenir ejecuciones concurrentes
    recognizing = true;

    try {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
            .withFaceLandmarks()
            .withFaceDescriptors();

        if (detections.length > 0) {
            const descriptors = detections.map(d => d.descriptor);
            await sendDescriptorToServer(descriptors);
        } else {
            updateResultBox('grey', 'No se detectó ningún rostro', '', '', '');
        }
    } catch (error) {
        console.error('Error al reconocer el rostro:', error);
        resultMessage.textContent = 'Error en el reconocimiento facial';
    } finally {
        recognizing = false;
    }
}

async function sendDescriptorToServer(descriptors) {
    try {
        if (descriptors.length === 0) {
            console.error('No se encontraron descriptores válidos para enviar al servidor');
            updateResultBox('grey', 'No se detectó ningún rostro', '', '', '');
            return;
        }

        const response = await fetch('http://149.50.138.128:4010/validar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptors })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error en la solicitud de reconocimiento facial');
        }

        const data = await response.json();
        if (data.message === "Coincidencia encontrada") {
            updateResultBox(
                'green',
                'Usuario registrado',
                `Nombre: ${data.usuario.nombreCompleto}`,
                `Email: ${data.usuario.correoInstitucional}`,
                `Teléfono: ${data.usuario.telefono}`
            );
        } else {
            updateResultBox('red', 'Usuario no registrado', '', '', '');
        }
    } catch (error) {
        console.error('Error al enviar descriptor al servidor:', error);
        resultMessage.textContent = error.message;
    }
}

module.exports = {
    recognizeFace,
    sendDescriptorToServer,
    startWebcam,
    loadModels
};